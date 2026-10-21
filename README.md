# Portfolio — Loan Heron

Site statique (HTML, CSS, JavaScript), sans étape de build. Animations : GSAP 3.13 + ScrollTrigger, défilement fluide : Lenis 1.1 (chargés depuis un CDN).

## Structure

```
index.html          Toutes les sections (textes FR)
css/style.css       Styles, couleurs et typo de la maquette Figma
js/i18n.js          Traductions anglaises (mêmes clés que data-i18n dans le HTML)
js/main.js          Intro, animations au scroll, curseur, menu mobile, FR/EN
assets/             Portrait (webp), favicon, image de partage (og.jpg)
```

## Tester en local

Ouvre un terminal dans ce dossier puis :

```
npx serve .
```

(ou l'extension « Live Server » de VS Code). Ouvrir `index.html` directement marche aussi.

L'intro ne se joue qu'une fois par session. Pour la revoir : ouvre un nouvel onglet en navigation privée, ou vide le sessionStorage (`sessionStorage.clear()` dans la console).

## Modifier le contenu

- **Un texte** : change-le dans `index.html` (français) et à la même clé dans `js/i18n.js` (anglais).
- **Une vraie capture de projet** : mets l'image dans `assets/captures/`, puis remplace le contenu de `<span class="mock__screen">…</span>` par `<img src="assets/captures/fitstack.webp" alt="">` (format 16:10 conseillé).
- **Un projet design** : dans la section `#design`, remplace le `<svg>` du wireframe dans `.shot__frame` par ton image.
- **Savoir-faire** : chaque compétence a une barre de niveau sur 4. Change `data-l="3"` (de 1 à 4) et le `3/4` juste à côté (texte lu par les lecteurs d'écran).
- **Captures des réalisations** : `assets/captures/fitstack.webp`, `elvo.webp` (format 16:10, haut de page). Si un fichier manque, l'aperçu dessiné s'affiche à la place.

## Mode clair / sombre

Le bouton soleil/lune dans la barre du haut bascule entre les deux thèmes ; le choix est mémorisé (`localStorage`, clé `lh-theme`). Le thème sombre est le défaut. Les couleurs de chaque thème sont à la fin de `css/style.css` (section « Thèmes clair / sombre »).

## Formulaire de contact

Les messages arrivent dans ta boîte heronloan@gmail.com via FormSubmit (gratuit, sans compte). Le service est appelé depuis `FORM_ENDPOINT`, en haut de `js/main.js`.

1. Mets le site en ligne (le formulaire ne peut pas partir depuis un fichier ouvert en local).
2. Envoie un premier message de test : FormSubmit t'écrit alors un e-mail d'activation (regarde aussi les spams). Clique sur « Activate Form ».
3. Ensuite chaque message arrive avec l'objet « Portfolio — sujet — nom ».

Un champ piège invisible (`_honey`) bloque les robots. Si tu mets `FORM_ENDPOINT = ''`, le bouton ouvre à la place la messagerie du visiteur avec le message pré-rempli.

## Mentions légales

Fenêtre `<dialog id="legal">` en bas de `index.html`. Complète les passages entre crochets (hébergeur, SIRET / adresse professionnelle si tu es immatriculé). Texte de départ, à faire relire.

## Mettre en ligne

N'importe quel hébergeur statique fonctionne : glisse le dossier sur Netlify ou Vercel, ou envoie-le sur ton hébergement actuel (par exemple un sous-domaine `portfolio.loan-heron.fr`).

## Illustrations

Les illustrations au trait (pile base de données / serveur / interface, marches du parcours, pictos, construction du logo, wireframes) sont des SVG directement dans `index.html`. Elles se dessinent au scroll grâce à `js/main.js`.
`tools/illustrations.py` est le script qui calcule leurs coordonnées (même angle que le logo). Tu n'en as besoin que pour les régénérer.
