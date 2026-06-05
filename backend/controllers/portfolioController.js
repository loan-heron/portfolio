// Data portfolio - Données statiques
const portfolioData = {
    person: {
        name: 'HERON Loan',
        title: 'Étudiant développeur qui débute en freelance',
        email: 'heronloan@gmail.com',
        bio: "Je suis étudiant et je code depuis plusieurs années. Je me lance progressivement en freelance, et j'utilise chaque projet comme une occasion d'apprendre, de progresser et de livrer quelque chose d'utile.",
        interests: ['Développement web', 'Cybersécurité', 'Automatisation IA', 'Applications mobiles', 'Freelance', 'Veille technologique'],
    },

    skills: {
        frontend: [
            { name: 'HTML5', level: 90 },
            { name: 'CSS3', level: 88 },
            { name: 'JavaScript', level: 85 },
            { name: 'React', level: 78 },
            { name: 'Flutter', level: 72 }
        ],
        backend: [
            { name: 'Node.js', level: 82 },
            { name: 'Discord.js', level: 97 },
            { name: 'MySQL', level: 87 },
            { name: 'MongoDB', level: 76 }
        ],
        gamedev: [
            { name: 'Unreal Engine 5', level: 80 },
            { name: 'C++', level: 68 },
            { name: 'Blender', level: 60 },
            { name: 'Unity', level: 58 },
            { name: 'Python', level: 95 }
        ],
        cybersecurity: [
            { name: 'Kali Linux', level: 73 },
            { name: 'Penetration Testing', level: 66 },
            { name: 'Network Security', level: 70 }
        ],
        other: [
            { name: 'PC Building', level: 88 },
            { name: 'Logistics', level: 65 },
            { name: 'Commerce', level: 78 }
        ]
    },

    projects: [
        {
            id: 1,
            title: 'FitStack',
            type: 'Web App',
            description: "Application web pour organiser et suivre ses séances de musculation. Gestion des exercices, des séries et de la progression au fil des entraînements.",
            tags: ['Web', 'Fitness', 'Full Stack'],
            image: null,
            status: 'En ligne',
            demoUrl: 'https://fitstack.loan-heron.fr/',
            repoUrl: null
        },
        {
            id: 2,
            title: 'Agent IA de tri des emails',
            type: 'Automation & IA',
            description: "Workflow n8n qui surveille les emails entrants, les classe automatiquement par catégorie (prioritaire, admin, promo, newsletter) et applique des labels Gmail.",
            tags: ['n8n', 'IA', 'Gmail API', 'Automatisation'],
            image: null,
            status: 'Terminé',
            demoUrl: null,
            repoUrl: null
        },
        {
            id: 3,
            title: 'BudgetFlow',
            type: 'Web App',
            description: "Application web de gestion de budget personnel. Suivi des revenus et dépenses, catégorisation et visualisation de l'évolution financière.",
            tags: ['Web', 'Finance', 'Full Stack'],
            image: null,
            status: 'En cours',
            demoUrl: null,
            repoUrl: null
        },
        {
            id: 4,
            title: 'RapperBase',
            type: 'Web App',
            description: "Site encyclopédique sur les rappeurs : biographies, discographies, classements et informations sur l'univers du rap.",
            tags: ['Web', 'Musique', 'Full Stack'],
            image: null,
            status: 'En cours',
            demoUrl: null,
            repoUrl: null
        }
    ],

    experience: [
        {
            category: '🎓 Formation',
            items: [
                {
                    title: 'Terminale Générale',
                    meta: 'Spécialités NSI et SI',
                    description: "Parcours orienté informatique et ingénierie qui me permet de consolider mes bases en développement, algorithmique et résolution de problèmes techniques."
                }
            ]
        },
        {
            category: '💼 Expérience Professionnelle',
            items: [
                {
                    title: 'Développeur Flutter',
                    meta: 'EBP - Stage de Seconde',
                    description: "Première vraie expérience en entreprise: j'ai participé à une application mobile et découvert un cycle de développement concret avec des contraintes réelles."
                },
                {
                    title: 'Logistique & Commerce',
                    meta: 'NCS Systeme - Stage de 3ème',
                    description: "Stage de découverte qui m'a donné une première vision du fonctionnement d'une entreprise et du travail d'équipe sur le terrain."
                }
            ]
        },
        {
            category: '🛠️ Autres Compétences',
            items: [
                {
                    title: 'Monteur de PC',
                    description: "Assemblage et configuration de PC selon les besoins. Une compétence qui m'aide à mieux comprendre le matériel et la stabilité globale des environnements techniques."
                }
            ]
        }
    ]
};

export default portfolioData;
