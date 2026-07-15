import { appendContributorId } from '../learnLinks';

export interface MicrosoftTech {
  slug: string;
  name: string;
  tagline: string;
  icon: string;
  introParagraphs: string[];
  useCases: string[];
  learnPath: { title: string; url: string };
  additionalLearnPaths: { title: string; url: string }[];
  prerequisites: string[];
  firstSteps: string[];
  imageUrl: string;
}

const TECHNOLOGIES: Record<string, MicrosoftTech> = {
  azure: {
    slug: 'introduction-a-microsoft-azure',
    name: 'Microsoft Azure',
    tagline: 'La plateforme cloud qui ouvre un monde de possibilités',
    icon: '☁️',
    introParagraphs: [
      `Microsoft Azure est une plateforme de cloud computing qui offre plus de 200 services, allant des machines virtuelles aux services d'intelligence artificielle. Elle permet aux développeurs, aux startups et aux grandes entreprises de créer, déployer et gérer des applications à l'échelle mondiale.`,
      `Que vous soyez étudiant, professionnel de l'informatique ou chef d'entreprise, Azure vous fournit les outils nécessaires pour innover plus rapidement. Avec une présence dans plus de 60 régions à travers le monde, c'est l'un des clouds les plus étendus et les plus fiables.`,
    ],
    useCases: [
      'Hébergement d\'applications web et mobiles avec scalabilité automatique',
      'Analyse de données massives avec Azure Synapse Analytics',
      'Déploiement de conteneurs Docker via Azure Kubernetes Service (AKS)',
      'Création d\'applications serverless avec Azure Functions',
      'Sauvegarde et reprise après sinistre pour les infrastructures critiques',
    ],
    learnPath: {
      title: 'Découvrir Azure – Parcours Débutant',
      url: 'https://learn.microsoft.com/training/paths/azure-fundamentals/',
    },
    additionalLearnPaths: [
      { title: 'Administrer les ressources Azure', url: 'https://learn.microsoft.com/training/paths/administer-resources-in-azure/' },
      { title: 'Implémenter le stockage Azure', url: 'https://learn.microsoft.com/training/paths/implement-storage-azure/' },
    ],
    prerequisites: ['Un compte Microsoft (gratuit)', 'Un abonnement Azure gratuit (crédit 200$ offert)'],
    firstSteps: [
      'Créez votre compte Azure gratuit sur azure.microsoft.com/free',
      'Suivez le module "Azure Fundamentals" sur Microsoft Learn',
      'Déployez votre première machine virtuelle via le portail Azure',
      'Expérimentez avec Azure Functions en déployant une API simple',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1633356122102-3fe601e05bd2?w=1200',
  },
  'azure-ai-foundry': {
    slug: 'decouvrir-azure-ai-foundry',
    name: 'Azure AI Foundry',
    tagline: 'L\'IA responsable, accessible à tous les développeurs',
    icon: '🤖',
    introParagraphs: [
      `Azure AI Foundry (anciennement Azure AI Studio) est la plateforme unifiée de Microsoft pour construire, tester et déployer des applications d'intelligence artificielle. Elle rassemble les services Azure OpenAI, Cognitive Services et Machine Learning dans un environnement intégré.`,
      `Avec AI Foundry, vous pouvez orchestrer des flux d'IA complexes sans être un expert en science des données. La plateforme vous guide dans la création d'assistants intelligents, la modération de contenu, et l'analyse sémantique — le tout avec des garde-fous intégrés pour une IA responsable.`,
    ],
    useCases: [
      'Création d\'assistants conversationnels avec GPT-4 et Azure OpenAI',
      'Analyse de sentiments et modération de contenu automatisée',
      'Extraction d\'informations à partir de documents (OCR + analyse sémantique)',
      'Génération de code assistée par IA pour vos projets',
      'Mise en place de systèmes RAG (Retrieval-Augmented Generation)',
    ],
    learnPath: {
      title: 'Azure AI Fundamentals – Parcours Débutant',
      url: 'https://learn.microsoft.com/training/paths/get-started-azure-ai/',
    },
    additionalLearnPaths: [
      { title: 'Développer avec Azure OpenAI', url: 'https://learn.microsoft.com/training/paths/develop-azure-openai/' },
      { title: 'Implémenter une IA responsable', url: 'https://learn.microsoft.com/training/paths/responsible-ai/' },
    ],
    prerequisites: ['Un compte Microsoft', 'Un abonnement Azure (version gratuite suffisante pour débuter)'],
    firstSteps: [
      'Connectez-vous à Azure AI Foundry sur ai.azure.com',
      'Suivez le module "Get Started with Azure AI" sur Microsoft Learn',
      'Déployez un modèle GPT-4 dans votre propre espace de travail',
      'Testez l\'API de modération de contenu avec un exemple de texte',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200',
  },
  copilot: {
    slug: 'maitriser-microsoft-365-copilot',
    name: 'Microsoft 365 Copilot',
    tagline: 'Votre assistant IA intégré dans les outils du quotidien',
    icon: '💡',
    introParagraphs: [
      `Microsoft 365 Copilot est l'assistant d'intelligence artificielle intégré à Word, Excel, PowerPoint, Outlook et Teams. Il combine la puissance des grands modèles de langage (GPT-4) avec vos données Microsoft 365 et Microsoft Graph pour vous aider à créer, analyser et collaborer plus efficacement.`,
      `Copilot ne se contente pas de générer du texte : il peut analyser des classeurs Excel, créer des présentations complètes à partir de documents Word, résumer des conversations Teams, et automatiser des workflows entiers — le tout en langage naturel.`,
    ],
    useCases: [
      'Rédaction de rapports et synthèses dans Word à partir de notes brutes',
      'Analyse de tendances et création de graphiques dans Excel sans formules complexes',
      'Génération de présentations PowerPoint percutantes en un prompt',
      'Résumé automatique de longues conversations Teams et d\'e-mails Outlook',
      'Automatisation de tâches répétitives avec Copilot dans Power Automate',
    ],
    learnPath: {
      title: 'Maîtriser Copilot pour Microsoft 365',
      url: 'https://learn.microsoft.com/training/paths/get-started-with-microsoft-365-copilot/',
    },
    additionalLearnPaths: [
      { title: 'Craft Effective Prompts for Copilot', url: 'https://learn.microsoft.com/training/paths/craft-effective-prompts-copilot-microsoft-365/' },
      { title: 'Copilot Studio – Créer vos propres assistants', url: 'https://learn.microsoft.com/training/paths/build-copilots-copilot-studio/' },
    ],
    prerequisites: ['Un compte Microsoft', 'Un abonnement Microsoft 365 (Copilot nécessite une licence supplémentaire)'],
    firstSteps: [
      'Activez Copilot dans vos applications Microsoft 365',
      'Suivez le module "Get Started with Microsoft 365 Copilot" sur Microsoft Learn',
      'Essayez un prompt simple dans Word : "Résume ce document en 5 points"',
      'Explorez Copilot Lab pour découvrir des prompts prêts à l\'emploi',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200',
  },
  'microsoft-365': {
    slug: 'exploiter-microsoft-365',
    name: 'Microsoft 365',
    tagline: 'La productivité collaborative repensée',
    icon: '📊',
    introParagraphs: [
      `Microsoft 365 est la suite de productivité la plus utilisée au monde. Au-delà des applications classiques (Word, Excel, PowerPoint), elle intègre des outils de collaboration temps réel, de stockage cloud (OneDrive), de communication (Teams) et d'automatisation (Power Platform).`,
      `Avec les plans Éducation et Entreprise, Microsoft 365 offre des fonctionnalités avancées de sécurité, de conformité et de gestion des identités, tout en restant accessible aux étudiants et aux startups via des formules gratuites ou à prix réduit.`,
    ],
    useCases: [
      'Collaboration en temps réel sur des documents avec co-édition et versionning',
      'Organisation de réunions et webinaires avec Teams et Live Events',
      'Gestion de projet avec Microsoft Planner, To Do et Project Online',
      'Stockage et partage sécurisé de fichiers avec OneDrive et SharePoint',
      'Automatisation de processus métier avec Power Automate intégré',
    ],
    learnPath: {
      title: 'Microsoft 365 Fundamentals',
      url: 'https://learn.microsoft.com/training/paths/m365-fundamentals/',
    },
    additionalLearnPaths: [
      { title: 'Collaborer avec Microsoft Teams', url: 'https://learn.microsoft.com/training/paths/collaborate-teams/' },
      { title: 'Sécuriser Microsoft 365', url: 'https://learn.microsoft.com/training/paths/secure-microsoft-365/' },
    ],
    prerequisites: ['Un compte Microsoft (Outlook/Hotmail)'],
    firstSteps: [
      'Connectez-vous à office.com avec votre compte Microsoft',
      'Explorez les applications web (Word, Excel, PowerPoint) sans installation',
      'Créez un document partagé et invitez un collaborateur',
      'Suivez le parcours "Microsoft 365 Fundamentals" sur Microsoft Learn',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=1200',
  },
  'windows-server-azure': {
    slug: 'vps-windows-sur-azure',
    name: 'VPS Windows sur Azure',
    tagline: 'Déployez et gérez vos serveurs Windows dans le cloud',
    icon: '🖥️',
    introParagraphs: [
      `Azure Virtual Machines vous permet de déployer des serveurs Windows complets dans le cloud en quelques minutes. Que vous ayez besoin d'un serveur de développement, d'un contrôleur de domaine Active Directory, ou d'une infrastructure de test, Azure vous offre la flexibilité du cloud avec la familiarité de Windows Server.`,
      `Contrairement à un VPS traditionnel chez un hébergeur, Azure vous permet de redimensionner votre machine à la demande, de configurer des sauvegardes automatisées, et de bénéficier d'un SLA de 99.9% garanti.`,
    ],
    useCases: [
      'Hébergement d\'applications .NET et SQL Server dans le cloud',
      'Infrastructure de développement et de test reproductible',
      'Contrôleur de domaine Active Directory pour utilisateurs distants',
      'Serveur de fichiers et d\'impression virtualisé pour PME',
      'Environnement de formation et laboratoire de certification',
    ],
    learnPath: {
      title: 'Administrer les machines virtuelles Azure',
      url: 'https://learn.microsoft.com/training/paths/administer-virtual-machines-azure/',
    },
    additionalLearnPaths: [
      { title: 'Implémenter la sauvegarde et la reprise', url: 'https://learn.microsoft.com/training/paths/implement-backup-recovery-azure/' },
      { title: 'Gérer Azure Active Directory', url: 'https://learn.microsoft.com/training/paths/manage-azure-ad/' },
    ],
    prerequisites: ['Un abonnement Azure actif', 'Notions de base en administration Windows Server'],
    firstSteps: [
      'Créez votre abonnement Azure gratuit (crédit 200$)',
      'Déployez une VM Windows Server 2022 depuis le portail Azure',
      'Connectez-vous en Bureau à distance (RDP)',
      'Configurez un snapshot de sauvegarde avec Azure Backup',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200',
  },
  'power-platform': {
    slug: 'decouvrir-power-platform',
    name: 'Power Platform',
    tagline: 'Créez des solutions sans code, automatisez vos processus',
    icon: '⚡',
    introParagraphs: [
      `Microsoft Power Platform regroupe Power BI (analyse), Power Apps (création d'applications), Power Automate (automatisation) et Power Pages (sites web). Elle permet aux utilisateurs métier et aux développeurs professionnels de créer des solutions complètes sans écrire une seule ligne de code.`,
      `Avec son approche "low-code / no-code", Power Platform démocratise le développement d'applications. Un analyste financier peut créer un tableau de bord Power BI en quelques clics, un responsable RH peut automatiser l'onboarding des nouveaux employés avec Power Automate, et un chef de projet peut construire une application de suivi avec Power Apps.`,
    ],
    useCases: [
      'Création de tableaux de bord interactifs avec Power BI',
      'Développement d\'applications métier sans code avec Power Apps',
      'Automatisation de workflows (approbations, notifications, collecte de données)',
      'Connexion de données entre Microsoft 365, Salesforce, et des API tierces',
      'Création de sites web sécurisés avec Power Pages',
    ],
    learnPath: {
      title: 'Power Platform Fundamentals',
      url: 'https://learn.microsoft.com/training/paths/power-platform-fundamentals/',
    },
    additionalLearnPaths: [
      { title: 'Créer des applications avec Power Apps', url: 'https://learn.microsoft.com/training/paths/create-powerapps/' },
      { title: 'Automatiser avec Power Automate', url: 'https://learn.microsoft.com/training/paths/automate-process-power-automate/' },
    ],
    prerequisites: ['Un compte Microsoft', 'Un accès à Power Platform via un tenant Microsoft 365'],
    firstSteps: [
      'Accédez à make.powerapps.com ou powerbi.microsoft.com',
      'Suivez le parcours "Power Platform Fundamentals"',
      'Créez votre première Power App à partir d\'un modèle Excel',
      'Automatisez une notification Teams avec Power Automate',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200',
  },
  fabric: {
    slug: 'explorer-microsoft-fabric',
    name: 'Microsoft Fabric',
    tagline: 'L\'analytique unifiée pour l\'ère de l\'IA',
    icon: '📈',
    introParagraphs: [
      `Microsoft Fabric est une plateforme d'analytique unifiée de bout en bout. Elle intègre le lac de données (OneLake), le data warehousing, l'intégration de données (Data Factory), le génie des données (Spark), l'analyse en temps réel (Real-Time Intelligence) et la business intelligence (Power BI) dans une seule expérience SaaS.`,
      `Contrairement aux architectures traditionnelles qui fragmentent les données entre plusieurs outils, Fabric crée un "maillage" de données où chaque équipe peut travailler avec ses outils préférés tout en partageant un lac de données commun. C'est l'évolution logique de la Data Mesh.`,
    ],
    useCases: [
      'Centralisation des données d\'entreprise dans OneLake sans duplication',
      'Transformation de données à grande échelle avec Data Factory et Spark',
      'Création de rapports Power BI directement sur les données du lac',
      'Analyse en temps réel de flux IoT et de logs applicatifs',
      'Mise en place d\'une architecture Data Mesh pour grandes organisations',
    ],
    learnPath: {
      title: 'Microsoft Fabric – Prise en main',
      url: 'https://learn.microsoft.com/training/paths/get-started-fabric/',
    },
    additionalLearnPaths: [
      { title: 'Ingérer des données avec Data Factory', url: 'https://learn.microsoft.com/training/paths/ingest-data-fabric/' },
      { title: 'Analyser avec Real-Time Intelligence', url: 'https://learn.microsoft.com/training/paths/real-time-intelligence-fabric/' },
    ],
    prerequisites: ['Un compte Microsoft', 'Un abonnement Power BI ou Fabric (essai gratuit disponible)'],
    firstSteps: [
      'Activez un essai Microsoft Fabric sur app.fabric.microsoft.com',
      'Créez votre premier lakehouse dans Fabric',
      'Chargez un fichier CSV et explorez les données avec Spark Notebook',
      'Créez un rapport Power BI directement depuis votre lakehouse',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=1200',
  },
  'github-microsoft': {
    slug: 'github-et-microsoft-devops',
    name: 'GitHub & Microsoft DevOps',
    tagline: 'Du code au déploiement, l\'écosystème complet',
    icon: '🐙',
    introParagraphs: [
      `GitHub, racheté par Microsoft en 2018, est la plus grande plateforme de développement de logiciels au monde. Couplé aux outils DevOps de Microsoft (Azure Boards, Azure Pipelines, GitHub Actions), il offre un écosystème complet pour coder, tester, déployer et surveiller vos applications.`,
      `L'intégration entre GitHub et Azure permet d'automatiser tout votre pipeline CI/CD : chaque push déclenche une build, exécute les tests, déploie sur Azure, et remonte les métriques. GitHub Copilot, propulsé par l'IA générative, vous assiste même dans l'écriture du code.`,
    ],
    useCases: [
      'Gestion de versions et collaboration avec Git et GitHub',
      'CI/CD automatisé avec GitHub Actions et Azure Pipelines',
      'Revue de code assistée par IA avec GitHub Copilot Code Review',
      'Gestion de projet agile avec GitHub Projects et Azure Boards',
      'Déploiement continu sur Azure App Service via GitHub Actions',
    ],
    learnPath: {
      title: 'Introduction à GitHub',
      url: 'https://learn.microsoft.com/training/paths/introduction-github/',
    },
    additionalLearnPaths: [
      { title: 'Automatiser avec GitHub Actions', url: 'https://learn.microsoft.com/training/paths/automate-workflow-github-actions/' },
      { title: 'DevOps avec Azure et GitHub', url: 'https://learn.microsoft.com/training/paths/devops-with-azure/' },
    ],
    prerequisites: ['Un compte GitHub (gratuit)', 'Un abonnement Azure (recommandé pour les déploiements)'],
    firstSteps: [
      'Créez votre compte GitHub et votre premier dépôt',
      'Suivez le module "Introduction to GitHub" sur Microsoft Learn',
      'Configurez une action GitHub simple (lint, test, build)',
      'Déployez votre application sur Azure avec GitHub Actions',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=1200',
  },
};

export function getMicrosoftTech(techSlug: string): MicrosoftTech | undefined {
  return Object.values(TECHNOLOGIES).find((t) => t.slug === techSlug);
}

export function getAllMicrosoftSlugs(): string[] {
  return Object.keys(TECHNOLOGIES);
}

export function getMicrosoftTechByName(name: string): MicrosoftTech | undefined {
  return TECHNOLOGIES[name];
}

export function generateArticleHtml(tech: MicrosoftTech): string {
  const learnUrl = appendContributorId(tech.learnPath.url);
  const additionalLearnLinks = tech.additionalLearnPaths
    .map((p) => `<li><a href="${appendContributorId(p.url)}" target="_blank" rel="noopener">${p.title}</a></li>`)
    .join('\n');

  const useCaseItems = tech.useCases.map((uc) => `<li>${uc}</li>`).join('\n');
  const stepItems = tech.firstSteps.map((s) => `<li>${s}</li>`).join('\n');
  const prereqItems = tech.prerequisites.map((p) => `<li>${p}</li>`).join('\n');

  return `
<h2>Introduction</h2>
<p>${tech.introParagraphs[0]}</p>
<p>${tech.introParagraphs[1]}</p>

<h2>Pourquoi utiliser ${tech.name} ?</h2>
<p>${tech.name} n'est pas seulement un outil technique — c'est un levier de compétitivité et d'innovation. Voici pourquoi les développeurs et les entreprises l'adoptent :</p>
<ul>${useCaseItems}</ul>

<h2>Prérequis</h2>
<p>Avant de commencer, assurez-vous d'avoir :</p>
<ul>${prereqItems}</ul>

<h2>Premiers pas</h2>
<ol>${stepItems}</ol>

<h2>Ressources Microsoft Learn</h2>
<p>Microsoft Learn est votre plateforme de formation gratuite. Chaque module combine lectures interactives, exercices pratiques et validation des connaissances.</p>
<ul>
  <li><a href="${learnUrl}" target="_blank" rel="noopener">${tech.learnPath.title}</a> — le parcours recommandé pour débuter</li>
  ${additionalLearnLinks}
</ul>
<p>Commencez gratuitement sur <a href="https://learn.microsoft.com" target="_blank" rel="noopener">Microsoft Learn</a> — chaque module validé vous rapproche d'une certification professionnelle.</p>

<h2>Événements Microsoft Reactor</h2>
<p>Les Microsoft Reactor sont des espaces de rencontre et d'apprentissage animés par des experts Microsoft et des community leaders. Ils proposent des ateliers gratuits, des sessions Q&amp;A et des hackathons virtuels ou en présentiel.</p>
<p>Découvrez les prochains événements : <a href="https://developer.microsoft.com/reactor" target="_blank" rel="noopener">Microsoft Reactor</a>.</p>
<p>Ne manquez pas les sessions dédiées à ${tech.name} — c'est l'occasion idéale pour poser vos questions en direct et rencontrer d'autres apprenants.</p>

<h2>Parcours Community Skilling</h2>
<p>Le programme Community Skilling de Microsoft, porté par les Microsoft Student Ambassadors et les Microsoft Learn Student Ambassadors (MLSA), vise à démocratiser l'accès aux compétences numériques. Ce parcours vous guide de l'apprentissage initial jusqu'à la certification :</p>
<ol>
  <li><strong>Découvrir</strong> — Explorez les concepts fondamentaux via les articles et vidéos de ce blog</li>
  <li><strong>Apprendre</strong> — Suivez les parcours Microsoft Learn avec le tracking ambassadeur pour mesurer votre progression</li>
  <li><strong>Pratiquer</strong> — Participez aux ateliers Microsoft Reactor et mettez en application dans des projets concrets</li>
  <li><strong>Certifier</strong> — Préparez et passez les examens de certification Microsoft (AZ-900, AI-900, PL-900, etc.)</li>
  <li><strong>Contribuer</strong> — Devenez Microsoft Learn Student Ambassador et partagez vos connaissances à votre tour</li>
</ol>
<p>Développez vos compétences dès maintenant sur <a href="https://learn.microsoft.com" target="_blank" rel="noopener">Microsoft Learn</a>.</p>

<h2>Conclusion</h2>
<p>${tech.name} représente une opportunité considérable pour tous ceux qui souhaitent monter en compétence dans le domaine du cloud et des technologies Microsoft.</p>
<p>Que vous soyez étudiant, développeur en reconversion ou professionnel confirmé, le parcours est clair : apprenez à votre rythme sur Microsoft Learn, participez aux événements Reactor, progressez dans le programme Community Skilling, et valorisez vos compétences avec une certification reconnue mondialement.</p>
<p>Prêt à commencer ? Rendez-vous sur <a href="${learnUrl}" target="_blank" rel="noopener">le parcours ${tech.learnPath.title}</a> et faites votre premier pas dès aujourd'hui.</p>
`.trimStart();
}
