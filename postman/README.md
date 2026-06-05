# Postman - Portfolio API

## Fichiers
- `portfolio-api.postman_collection.json`
- `portfolio-local.postman_environment.json`

## Import
1. Ouvre Postman.
2. `Import` > sélectionne les 2 fichiers JSON.
3. Active l'environnement **Portfolio Local**.

## Pré-requis serveur
- API lancée sur `http://localhost:3000`
- MySQL configuré pour les routes auth/dashboard/academy (sinon certaines routes répondent `503`)
- SMTP configuré pour `/api/contact` (sinon test accepté en `500/502`)
- OpenAI configuré pour `/api/chatbot` (sinon test accepté en `500/503`)

## Exécution complète
- Lance le dossier de collection **Portfolio API - Full Test Suite** avec le Runner.
- Ordre recommandé: du dossier `01` à `08`.

## Notes
- La collection génère automatiquement un email de test unique pour l'inscription.
- Le token JWT est extrait automatiquement depuis le cookie `auth_token` et stocké dans `authToken`.
- Les routes premium/admin sont testées avec statuts attendus flexibles (`200/401/403/503`) selon le compte.
