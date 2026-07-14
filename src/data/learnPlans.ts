export interface LearnPlan {
  id: string;
  title: string;
  description: string;
  level: 'Débutant' | 'Intermédiaire' | 'Avancé';
  duration: string;
  topics: string[];
  url: string;
  featured?: boolean;
}

export const learnPlans: LearnPlan[] = [
  {
    id: 'plan-1',
    title: 'Microsoft 365 Copilot Starter',
    description: 'Découvrez comment Microsoft 365 Copilot utilise l\'IA pour stimuler la productivité, stimuler la créativité et gagner du temps.',
    level: 'Débutant',
    duration: '2h 15m',
    topics: ['Copilot', 'IA', 'Productivité'],
    url: 'https://learn.microsoft.com/training/paths/get-started-with-microsoft-365-copilot/',
    featured: true,
  },
  {
    id: 'plan-2',
    title: 'Prompts efficaces pour Microsoft 365 Copilot',
    description: 'Apprenez à formuler des prompts précis pour maximiser la puissance de Microsoft 365 Copilot.',
    level: 'Intermédiaire',
    duration: '3h 30m',
    topics: ['Copilot', 'Prompt Engineering'],
    url: 'https://learn.microsoft.com/training/paths/craft-effective-prompts-copilot-microsoft-365/',
  },
  {
    id: 'plan-3',
    title: 'Agents Microsoft 365 Copilot préconfigurés',
    description: 'Utilisez et personnalisez des agents IA pour des tâches spécifiques au sein de votre organisation.',
    level: 'Avancé',
    duration: '4h 00m',
    topics: ['IA', 'Agents', 'Copilot Studio'],
    url: 'https://learn.microsoft.com/training/paths/enhance-productivity-prebuilt-agents/',
    featured: true,
  },
  {
    id: 'plan-4',
    title: 'Power Automate Starter',
    description: 'Créez des workflows automatisés entre vos applications et services préférés.',
    level: 'Débutant',
    duration: '1h 45m',
    topics: ['Power Platform', 'Automatisation'],
    url: 'https://learn.microsoft.com/training/paths/demonstrate-capabilities-microsoft-power-automate/',
  },
  {
    id: 'plan-5',
    title: 'Power Apps Starter',
    description: 'Créez rapidement des applications professionnelles personnalisées sans écrire de code.',
    level: 'Débutant',
    duration: '2h 00m',
    topics: ['Power Platform', 'Low Code'],
    url: 'https://learn.microsoft.com/training/paths/demonstrate-capabilities-power-apps/',
  },
  {
    id: 'plan-6',
    title: 'Automatiser un processus métier avec Power Automate',
    description: 'Allez plus loin dans l\'automatisation de vos processus complexes avec Power Automate.',
    level: 'Intermédiaire',
    duration: '3h 15m',
    topics: ['Power Platform', 'Automatisation', 'Processus'],
    url: 'https://learn.microsoft.com/training/paths/automate-process-power-automate/',
  }
];
