<#
Deploy.ps1 — script de déploiement simple via SCP + réglage des permissions
Usage examples:
  .\deploy.ps1 -RemoteHost 192.168.1.95 -RemoteUser root -LocalPath .\public -RemotePath /var/www/portfolio
  .\deploy.ps1 -RemoteHost 192.168.1.95 -RemoteUser root -LocalPath .\public -RemotePath /var/www/portfolio -SSHKey C:\Users\Loan\.ssh\id_ed25519
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)] [string]$RemoteHost,
    [Parameter(Mandatory=$false)] [string]$RemoteUser = "root",
    [Parameter(Mandatory=$false)] [string]$LocalPath = ".\public",
    [Parameter(Mandatory=$false)] [string]$RemotePath = "/var/www/portfolio",
    [Parameter(Mandatory=$false)] [string]$SSHKey = ""
)

function Write-Info { Write-Host "[info]  " -ForegroundColor Cyan -NoNewline; Write-Host $args }
function Write-Warn { Write-Host "[warn]  " -ForegroundColor Yellow -NoNewline; Write-Host $args }
function Write-Err  { Write-Host "[error] " -ForegroundColor Red -NoNewline; Write-Host $args }

# 1. Checks
if (-not (Get-Command scp -ErrorAction SilentlyContinue)) {
    Write-Err "scp n'est pas trouvé. Installez OpenSSH Client (Windows) ou utilisez WSL/rsync."
    exit 1
}
if (-not (Get-Command ssh -ErrorAction SilentlyContinue)) {
    Write-Err "ssh n'est pas trouvé. Installez OpenSSH Client."
    exit 1
}
$LocalFull = (Resolve-Path -Path $LocalPath -ErrorAction SilentlyContinue)
if (-not $LocalFull) {
    Write-Err "Le chemin local '$LocalPath' n'existe pas."
    exit 1
}
$LocalFull = $LocalFull.ProviderPath

# 2. Préparation
Write-Info "Hôte distant : $RemoteUser@$RemoteHost"
Write-Info "Chemin local  : $LocalFull"
Write-Info "Chemin distant: $RemotePath"

# 3. Créer le répertoire distant (sécurisé)
$mkcmd = "mkdir -p '$RemotePath'"
$sshArgs = @()
if ($SSHKey -ne "") { $sshArgs += "-i"; $sshArgs += $SSHKey }
$sshArgs += "$RemoteUser@$RemoteHost"
$sshArgs += $mkcmd
Write-Info "Création du répertoire distant (si nécessaire)..."
& ssh @sshArgs
if ($LASTEXITCODE -ne 0) { Write-Warn "La création du répertoire distant a renvoyé une erreur (code $LASTEXITCODE). Continuer néanmoins." }

# 4. Transfert via scp (récursif)
$scpArgs = @()
if ($SSHKey -ne "") { $scpArgs += "-i"; $scpArgs += $SSHKey }
$scpArgs += "-r"; $scpArgs += "-C"  # compression
$localPattern = Join-Path $LocalFull '*'
$scpArgs += $localPattern
$remoteSpec = $RemoteUser + "@" + $RemoteHost + ":" + $RemotePath
$scpArgs += $remoteSpec
Write-Info "Lancement du transfert (scp -r)..."
& scp @scpArgs
if ($LASTEXITCODE -ne 0) {
    Write-Err "scp a échoué avec le code $LASTEXITCODE. Vérifiez la connectivité, l'authentification et les permissions."
    exit 1
}
Write-Info "Transfert terminé avec succès."

# 5. Réglages de permissions et reload nginx
$remoteCmd = @"
set -e
# Corriger propriétaire et permissions
if id www-data >/dev/null 2>&1; then
  chown -R www-data:www-data '$RemotePath'
else
  chown -R root:root '$RemotePath'
fi
# Directoires 755, fichiers 644
find '$RemotePath' -type d -exec chmod 755 {} \;
find '$RemotePath' -type f -exec chmod 644 {} \;
# Tester la conf nginx et recharger si OK
if command -v nginx >/dev/null 2>&1; then
  nginx -t && systemctl reload nginx || service nginx reload || true
fi
exit 0
"@

Write-Info "Application des permissions et rechargement nginx si présent..."
# Exécuter la commande distante via scp + ssh (upload a temporary script to avoid quoting issues)
$guid = [Guid]::NewGuid().ToString("N")
$localTmp = Join-Path $env:TEMP ("deploy_remote_$guid.sh")
[System.IO.File]::WriteAllText($localTmp, ($remoteCmd -replace "`r`n","`n"), [System.Text.UTF8Encoding]::new($false))
if (-not (Test-Path $localTmp)) { Write-Err "Failed to create temp script $localTmp"; exit 1 }
$scpScriptArgs = @()
if ($SSHKey -ne "") { $scpScriptArgs += "-i"; $scpScriptArgs += $SSHKey }
$scpScriptArgs += $localTmp
$remoteScriptPath = "/tmp/deploy_remote_$guid.sh"
$scpScriptArgs += ($RemoteUser + "@" + $RemoteHost + ":" + $remoteScriptPath)
Write-Info "Uploading remote script to $remoteScriptPath..."
& scp @scpScriptArgs
if ($LASTEXITCODE -ne 0) { Remove-Item $localTmp -ErrorAction SilentlyContinue; Write-Warn "Failed to upload remote script (scp returned $LASTEXITCODE)"; exit 1 }

Write-Info "Executing remote script..."
$sshRunArgs = @()
if ($SSHKey -ne "") { $sshRunArgs += "-i"; $sshRunArgs += $SSHKey }
$sshRunArgs += ($RemoteUser + "@" + $RemoteHost)
$sshRunArgs += ("bash " + $remoteScriptPath + " && rm -f " + $remoteScriptPath)
& ssh @sshRunArgs
$rc = $LASTEXITCODE
Remove-Item $localTmp -ErrorAction SilentlyContinue
if ($rc -ne 0) { Write-Warn "Remote script returned code $rc (possibly non critical)." }

Write-Info "Deployment finished - check the site:"
Write-Info ("https://loan-heron.fr/pages/test.html (or http://" + $RemoteHost + "/pages/test.html)")
exit 0
