export interface TutorialResource {
  label: string;
  url: string;
  type: 'learn' | 'github' | 'docs' | 'file' | 'article' | 'other';
}

export interface TutorialCodeSnippet {
  id: string;
  title: string;
  language: string;
  filename?: string;
  code: string;
}

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  command?: string;
  duration?: string;
}

export interface TutorialChapter {
  id: string;
  label: string;
  time: number; // in seconds
}

export interface TutorialEnhancement {
  objectives: string[];
  prerequisites: string[];
  expectedResult: string;
  level: 'Débutant' | 'Intermédiaire' | 'Avancé';
  tools: string[];
  steps: TutorialStep[];
  transcript?: string;
  codeSnippets: TutorialCodeSnippet[];
  resources: TutorialResource[];
  chapters?: TutorialChapter[];
  durationText?: string;
}

export const tutorialEnhancementsBySlug: Record<string, TutorialEnhancement> = {
  'creer-un-plan-microsoft-learn': {
    level: 'Débutant',
    durationText: '12:45',
    objectives: [
      'Se connecter à la plateforme Microsoft Learn',
      'Rechercher et sélectionner un plan de formation adapté',
      'Activer le partage de progression et obtenir son Contributor ID',
      'Terminer son premier module et valider son badge'
    ],
    prerequisites: [
      'Avoir un compte Microsoft (gratuit)',
      'Un navigateur moderne et une connexion Internet stable'
    ],
    expectedResult: 'Un plan de formation Microsoft Learn activé et lié à votre compte avec votre progression visible en temps réel.',
    tools: ['Microsoft Learn', 'Compte Microsoft', 'Microsoft Student Ambassador'],
    steps: [
      {
        id: '1',
        title: 'Se connecter à Microsoft Learn',
        description: 'Rendez-vous sur le site officiel de Microsoft Learn et cliquez sur Se connecter en haut à droite. Utilisez votre compte Microsoft personnel ou étudiant.',
        duration: '2 min'
      },
      {
        id: '2',
        title: 'Sélectionner un plan recommandé',
        description: 'Parcourez la liste des parcours recommandés (comme Microsoft 365 Copilot Starter ou Power Platform) et cliquez sur "Démarrer".',
        duration: '3 min'
      },
      {
        id: '3',
        title: 'Configurer le Contributor ID',
        description: 'Pour que votre progression soit comptabilisée sur notre plateforme, ajoutez le paramètre de tracking de l\'ambassadeur dans vos favoris ou utilisez l\'URL de redirection générée.',
        command: '?wt.mc_id=studentamb_516195',
        duration: '2 min'
      },
      {
        id: '4',
        title: 'Valider le premier module',
        description: 'Lisez les unités de cours, répondez au questionnaire de validation de connaissances à la fin du module, et réclamez vos points d\'XP !',
        duration: '5 min'
      }
    ],
    codeSnippets: [
      {
        id: 'url-format',
        title: 'Format d\'URL de Tracking Recommandé',
        language: 'text',
        filename: 'wt_tracking_url_format.txt',
        code: 'https://learn.microsoft.com/training/paths/get-started-with-microsoft-365-copilot/?wt.mc_id=studentamb_516195'
      },
      {
        id: 'bookmarklet',
        title: 'Bookmarklet de Tracking Rapide (JavaScript)',
        language: 'javascript',
        filename: 'add-tracking.js',
        code: `javascript:(function(){
  var url = new URL(window.location.href);
  url.searchParams.set('wt.mc_id', 'studentamb_516195');
  window.location.href = url.toString();
})();`
      }
    ],
    resources: [
      {
        label: 'Microsoft 365 Copilot Starter Path',
        url: 'https://learn.microsoft.com/training/paths/get-started-with-microsoft-365-copilot/',
        type: 'learn'
      },
      {
        label: 'Création de compte Microsoft',
        url: 'https://signup.live.com/',
        type: 'docs'
      },
      {
        label: 'Code source (GitHub)',
        url: 'https://github.com/microsoft',
        type: 'github'
      },
      {
        label: 'Ressources associées (.zip)',
        url: '#',
        type: 'file'
      }
    ],
    chapters: [
      { id: 'ch-1', label: 'Introduction et objectifs', time: 0 },
      { id: 'ch-2', label: 'Créer un compte et se connecter', time: 120 },
      { id: 'ch-3', label: 'Comprendre le tracking ambassadeur', time: 340 },
      { id: 'ch-4', label: 'Démonstration pratique', time: 510 },
      { id: 'ch-5', label: 'Conclusion et étapes suivantes', time: 710 }
    ],
    transcript: `Bienvenue dans ce guide vidéo ! Aujourd'hui, nous allons voir comment bien démarrer un plan de formation Microsoft Learn. 

La première étape consiste à se connecter sur Microsoft Learn à l'aide de votre compte Outlook ou Hotmail. Une fois connecté, vous verrez votre profil s'afficher avec vos points d'XP accumulés.

C'est ici qu'intervient la partie la plus importante pour les étudiants de notre communauté : le tracking ambassadeur. En ajoutant notre code de contributeur "studentamb_516195" à la fin de vos URLs de formation sous la forme "?wt.mc_id=studentamb_516195", vous nous aidez à faire remonter l'activité de notre groupe de travail régional auprès de Microsoft !

Dans la vidéo, je vous montre pas à pas comment utiliser le bookmarklet JavaScript pour ajouter ce paramètre en un seul clic sur n'importe quelle page de Microsoft Learn. C'est ultra pratique !

Une fois cette URL activée, terminez le premier module en lisant le contenu et en validant le quiz final. Vous obtiendrez votre premier badge que vous pourrez partager sur LinkedIn !`
  },
  'mon-premier-tutoriel-copilot': {
    level: 'Intermédiaire',
    durationText: '15:30',
    objectives: [
      'Comprendre l\'architecture de Microsoft 365 Copilot',
      'Maîtriser les 4 piliers d\'un prompt efficace (Rôle, Contexte, Source, Attentes)',
      'Déployer un exemple de prompt de résumé de documents dans Copilot Studio'
    ],
    prerequisites: [
      'Accès à un tenant Microsoft 365 ou une licence d\'évaluation Copilot',
      'Notions de base en ingénierie de prompt (Prompt Engineering)'
    ],
    expectedResult: 'Un prompt hautement optimisé capable de synthétiser des rapports complexes avec une structure fixe de livrables.',
    tools: ['Microsoft Copilot', 'Copilot Studio', 'Power Platform'],
    steps: [
      {
        id: '1',
        title: 'Accéder au bac à sable Copilot',
        description: 'Connectez-vous à copilot.microsoft.com ou ouvrez le panneau Copilot dans vos applications Office.',
        duration: '2 min'
      },
      {
        id: '2',
        title: 'Structurer le prompt de référence',
        description: 'Préparez les blocs du prompt en définissant le rôle (Expert Technique), le contexte, la source et le format attendu.',
        duration: '5 min'
      },
      {
        id: '3',
        title: 'Exécuter et affiner les variables',
        description: 'Injectez votre document de travail et observez la structure de la réponse de Copilot. Ajustez les contraintes d\'exclusion si nécessaire.',
        duration: '5 min'
      },
      {
        id: '4',
        title: 'Sauvegarder dans vos modèles réutilisables',
        description: 'Enregistrez votre prompt structuré dans votre bibliothèque ou intégrez-le comme une action automatisée dans Power Automate.',
        duration: '3 min'
      }
    ],
    codeSnippets: [
      {
        id: 'prompt-expert',
        title: 'Modèle de Prompt Universel - Synthèse de Code',
        language: 'text',
        filename: 'copilot-prompt-template.txt',
        code: `RÔLE: Agis en tant qu'Architecte Logiciel Senior expert en React, TypeScript et Material UI.
CONTEXTE: Je dois optimiser une page web de tutoriel pour la rendre extrêmement fluide et esthétique pour des étudiants.
SOURCE DE DONNÉES: Analyse le code du fichier ci-joint.
CONSIGNE / ATTENTES: Fournis une liste d'améliorations concrètes axées sur l'accessibilité, le responsive, et l'expérience utilisateur, sous forme de tableau Markdown contenant: 1. Problème identifié, 2. Solution proposée, 3. Code TypeScript associé.`
      },
      {
        id: 'api-call-test',
        title: 'Appel d\'API Factice - Intégration Custom Copilot',
        language: 'typescript',
        filename: 'copilot-integration.ts',
        code: `// Exemple d'envoi de prompt structuré à un assistant personnalisé via API
async function askCopilot(prompt: string, contextData: any) {
  const payload = {
    prompt: prompt,
    temperature: 0.2,
    context: contextData
  };
  
  const response = await fetch('/api/copilot/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  return await response.json();
}`
      }
    ],
    resources: [
      {
        label: 'Prompts efficaces pour Microsoft 365 Copilot Path',
        url: 'https://learn.microsoft.com/training/paths/craft-effective-prompts-copilot-microsoft-365/',
        type: 'learn'
      },
      {
        label: 'Copilot Prompt Library officielle',
        url: 'https://copilot.cloud.microsoft/prompts',
        type: 'docs'
      },
      {
        label: 'Code source (GitHub)',
        url: 'https://github.com/microsoft',
        type: 'github'
      },
      {
        label: 'Ressources associées (.zip)',
        url: '#',
        type: 'file'
      }
    ],
    chapters: [
      { id: 'ch-1', label: 'Introduction à Copilot et Prompt Engineering', time: 0 },
      { id: 'ch-2', label: 'Les 4 piliers d\'un bon Prompt', time: 180 },
      { id: 'ch-3', label: 'Atelier pratique de rédaction', time: 450 },
      { id: 'ch-4', label: 'Intégration et Automatisation', time: 720 },
      { id: 'ch-5', label: 'Conclusion et astuces de productivité', time: 880 }
    ],
    transcript: `Bonjour à tous et bienvenue dans ce tutoriel premium sur le Prompt Engineering avec Microsoft 365 Copilot !

Aujourd'hui, nous allons dépasser les requêtes basiques de type "Résume-moi ce texte" pour apprendre à construire des prompts véritablement professionnels.

Un prompt professionnel repose sur 4 piliers indispensables : le Rôle, le Contexte, la Source, et enfin, les Attentes de formatage. En définissant clairement ces quatre dimensions, vous multipliez par dix la précision et la pertinence de la réponse de Copilot.

Dans la vidéo, je prends un exemple réel de synthèse de code et de recommandations d'architecture. Nous verrons comment ordonner à Copilot de nous retourner un tableau Markdown structuré contenant uniquement des correctifs exploitables en TypeScript.

Nous verrons également comment intégrer ces prompts à vos outils du quotidien pour automatiser vos relectures de code. C'est parti !`
  }
};

export function getTutorialEnhancement(slug: string): TutorialEnhancement {
  if (tutorialEnhancementsBySlug[slug]) {
    return tutorialEnhancementsBySlug[slug];
  }
  
  // Return a generic fallback dynamic enhancement to avoid crash and guarantee a beautiful page!
  return {
    level: 'Débutant',
    durationText: '10:00',
    objectives: [
      'Comprendre les concepts fondamentaux abordés dans ce tutoriel',
      'Mettre en application les étapes pratiques recommandées',
      'Explorer les liens et documentations complémentaires associés'
    ],
    prerequisites: [
      'Un environnement de développement local ou un accès à internet',
      'De la curiosité et l\'envie d\'apprendre !'
    ],
    expectedResult: 'Compréhension globale et autonomie sur le sujet traité par ce tutoriel.',
    tools: ['Microsoft Learn', 'VS Code', 'GitHub'],
    steps: [
      {
        id: '1',
        title: 'Visionner la vidéo introductive',
        description: 'Prenez le temps de regarder le tutoriel en entier pour vous familiariser avec le flux de travail et les outils utilisés.',
        duration: '3 min'
      },
      {
        id: '2',
        title: 'Mettre en pratique localement',
        description: 'Ouvrez votre terminal ou console et reproduisez les manipulations montrées dans la vidéo.',
        duration: '5 min'
      },
      {
        id: '3',
        title: 'Consulter les ressources complémentaires',
        description: 'Explorez les plans d\'apprentissage et projets GitHub associés pour aller plus loin.',
        duration: '2 min'
      }
    ],
    codeSnippets: [
      {
        id: 'fallback-command',
        title: 'Commande Utile',
        language: 'bash',
        filename: 'terminal.sh',
        code: '# Clonez le dépôt et explorez le code\ngit clone https://github.com/microsoft/learn-plan-tracker.git'
      }
    ],
    resources: [
      {
        label: 'Centre de formation Microsoft Learn',
        url: 'https://learn.microsoft.com/',
        type: 'learn'
      },
      {
        label: 'Code source (GitHub)',
        url: 'https://github.com/microsoft',
        type: 'github'
      },
      {
        label: 'Ressources associées (.zip)',
        url: '#',
        type: 'file'
      }
    ],
    chapters: [
      { id: 'ch-1', label: 'Introduction', time: 0 },
      { id: 'ch-2', label: 'Pratique guidée', time: 180 },
      { id: 'ch-3', label: 'Conclusion et Ressources', time: 420 }
    ],
    transcript: `La transcription automatique est en cours de génération pour ce tutoriel. Elle sera disponible très prochainement. En attendant, n'hésitez pas à suivre les étapes détaillées de l'onglet Pratique et à copier les codes de l'onglet Code.`
  };
}
