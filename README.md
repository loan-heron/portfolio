# Portfolio - HERON Loan 🚀

Une **architecture professionnelle** avec **backend Express.js**, **frontend modulaire** et une nouvelle vitrine business (services, formations, connexion).

## 📁 Structure du Projet

```
portfolio/
├── backend/
│   ├── server.js                 # Serveur Express principal
│   ├── routes/
│   │   ├── portfolio.js          # Routes API portfolio
│   │   ├── contact.js            # Routes API contact
│   │   ├── business.js           # Routes API services/formations
│   │   └── auth.js               # Routes API authentification
│   └── controllers/
│       ├── portfolioController.js # Données du portfolio
│       └── businessController.js  # Données business et tarifs
│
├── public/
│   ├── pages/
│   │   ├── landing.html         # Homepage (/)
│   │   ├── portfolio.html       # Portfolio (/portfolio)
│   │   ├── services.html        # Offres et tarifs (/services)
│   │   ├── formations.html      # Formations (/formations)
│   │   ├── cyber-academy.html   # Espace premium cyber
│   │   ├── login.html           # Connexion
│   │   └── profile.html         # Profil utilisateur
│   │
│   └── assets/
│       ├── css/
│       │   ├── site.css             # Styles globaux du site
│       │   ├── portfolio-modern.css # Styles portfolio
│       │   └── cyber-academy.css    # Styles cyber academy
│       │
│       ├── js/
│       │   ├── site.js          # Navigation/transitions globales
│       │   ├── home.js          # Remplissage hero portfolio
│       │   ├── about.js         # Section about
│       │   ├── skills.js        # Section compétences
│       │   ├── projects.js      # Section projets
│       │   ├── experience.js    # Section parcours
│       │   ├── contact.js       # Formulaire contact
│       │   ├── services.js      # Chargement API services
│       │   ├── formations.js    # Chargement API formations
│       │   ├── login.js         # Authentification frontend
│       │   ├── profile.js       # Gestion profil
│       │   └── cyber-academy.js # Logique formation premium
│       │
│       └── images/              # Images et assets
│
└── package.json                 # Dépendances npm
```

## ⚙️ Installation & Démarrage

### 1. Installer les dépendances
```bash
cd portfolio
npm install
```

### 2. Lancer le serveur
```bash
npm start
```

Ou en mode développement avec reloading:
```bash
npm run dev
```

### 3. Accéder au portfolio
```
http://localhost:3000
```

## 🔌 API Backend

Le backend expose plusieurs routes:

### Portfolio Data
```
GET /api/portfolio              # Toutes les données portfolio
GET /api/portfolio/person       # Infos personnelles
GET /api/portfolio/skills       # Compétences
GET /api/portfolio/projects     # Tous les projets
GET /api/portfolio/projects/:id # Projet spécifique
GET /api/portfolio/experience   # Expérience
```

### Contact
```
POST /api/contact
Body: { name, email, message }

### Business (services/formations)
```
GET /api/business
GET /api/business/services
GET /api/business/formations
```

### Authentification
```
POST /api/auth/register         # Body: { name, email, password, accountType }
POST /api/auth/login            # Body: { email, password }
POST /api/auth/logout
GET /api/auth/me                # Bearer token ou cookie auth_token
GET /api/auth/cyberacademy-access
POST /api/auth/purchase/cyberacademy
```

### Admin (compte admin requis)
```
GET /api/admin/prices
PUT /api/admin/prices/services/:serviceId   # Body: { priceFrom }
PUT /api/admin/prices/formations/:formationId # Body: { price }
PUT /api/admin/users/:userId/account-type   # Body: { accountType: free|premium|admin }
```
```

## 📧 Configuration Email (Contact)

Pour que le formulaire envoie réellement un email vers `heronloan@gmail.com`, crée un fichier `.env` à la racine du projet (tu peux copier `.env.example`) avec:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=ton-adresse@gmail.com
SMTP_PASS=mot-de-passe-application
SMTP_FROM=Portfolio Contact <ton-adresse@gmail.com>
CONTACT_RECEIVER=heronloan@gmail.com
JWT_SECRET=change-me
ADMIN_NAME=Loan Heron
ADMIN_EMAIL=admin@loanheron.dev
ADMIN_PASSWORD=ChangeThisPassword123!
OPENAI_CHAT_ENABLED=true
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
MYSQL_ENABLED=true
MYSQL_HOST=127.0.0.1
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=
MYSQL_DATABASE=portfolio
```

## 🔐 Gestion des accès Cyber Academy

- L'accès à `/formations/cybersecurite` est protégé par authentification + entitlement.
- Accès autorisé pour:
	- comptes `premium`
	- comptes `admin`
	- comptes ayant acheté `cyber_academy` via `POST /api/auth/purchase/cyberacademy`
- Les admins peuvent modifier les prix et les types de compte via `/api/admin/*`.

Puis redémarre le serveur.

## 🎨 Design Features

✨ **Glassmorphism** - Effet de verre moderne  
🎯 **Responsive** - Mobile, tablet, desktop  
⚡ **Modulaire** - Pages séparées, CSS spécifique  
🔄 **Dynamique** - Données depuis l'API  
📱 **Mobile-first** - Design progressif  

## 🛠️ Technologie

**Frontend:**
- HTML5 sémantique
- CSS3 (Grid, Flexbox, Animations)
- JavaScript vanilla (Fetch API)

**Backend:**
- Node.js
- Express.js
- CORS enabled

## 📝 Modifier les Données

Les données du portfolio se trouvent dans:
`backend/controllers/portfolioController.js`

Modifiez-y les infos, projets, compétences, etc.

## 🚀 Déploiement

### Avec Vercel
```bash
npm i -g vercel
vercel
```

### Avec Railway
1. Connecter votre repo GitHub
2. Ajouter une variable d'env `NODE_ENV=production`
3. Deploy automatique

### Avec Heroku
```bash
heroku create your-portfolio
git push heroku main
```

## 🔒 HTTPS & iPhone (Chrome/Safari)

Si iPhone affiche encore “connexion non sécurisée” malgré `https`, vérifie :

- Certificat serveur **full chain** (ex: `fullchain.pem`, pas uniquement `cert.pem`)
- Redirection HTTP → HTTPS active (port 80 vers 443)
- Proxy reverse qui transmet bien le protocole:

```nginx
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header Host $host;
```

Le serveur Express est déjà configuré pour :
- forcer HTTPS en production (désactivable avec `FORCE_HTTPS=false`)
- envoyer des en-têtes de sécurité (HSTS, CSP anti mixed-content)

## 🤖 Chatbot IA (OpenAI)

- API: `POST /api/chatbot`
- Body: `{ "message": "...", "history": [{"role":"user|assistant","content":"..."}] }`
- Variables à configurer: `OPENAI_CHAT_ENABLED`, `OPENAI_API_KEY`, `OPENAI_MODEL`
- Quotas configurables (fenêtre glissante mémoire):
	- `CHATBOT_RATE_WINDOW_MS` (défaut `60000`)
	- `CHATBOT_RATE_LIMIT_STANDARD` (défaut `8`)
	- `CHATBOT_RATE_LIMIT_PREMIUM` (défaut `30`)
- Les comptes `premium` ont une limite plus élevée que les comptes standard/anonymes.
- Le widget chat est chargé automatiquement via `public/assets/js/site.js` sur les pages publiques.

Après modification TLS/proxy, pense à redémarrer Nginx puis vider le cache SSL du navigateur mobile.

## 📧 Contact

Email: heronloan@gmail.com

## 🎉 À faire

- [ ] Ajouter vraie photo de profil
- [ ] Remplir les liens LinkedIn/GitHub
- [ ] Améliorer les descriptions de projets
- [ ] Ajouter des images des projets
- [ ] Déployer en ligne
- [ ] Ajouter Google Analytics

---

**Créé avec ❤️ - 2026**
