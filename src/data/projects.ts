export interface GitHubProject {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  status: 'Actif' | 'Terminé' | 'En cours';
  level: 'Débutant' | 'Intermédiaire' | 'Avancé';
  githubUrl: string;
  demoUrl?: string;
  articleSlug?: string;
  videoUrl?: string;
}

export const projects: GitHubProject[] = [
  {
    id: 'proj-1',
    name: 'AI Study Assistant',
    description: 'Une application qui aide les étudiants à réviser leurs cours en générant des quiz automatiquement avec l\'IA.',
    technologies: ['React', 'TypeScript', 'OpenAI', 'Material UI'],
    status: 'Terminé',
    level: 'Intermédiaire',
    githubUrl: 'https://github.com',
    demoUrl: 'https://example.com',
  },
  {
    id: 'proj-2',
    name: 'Microsoft Learn Plan Tracker',
    description: 'Tableau de bord personnel pour suivre ses certifications et plans d\'apprentissage Microsoft Learn.',
    technologies: ['Next.js', 'Supabase', 'Tailwind'],
    status: 'Actif',
    level: 'Débutant',
    githubUrl: 'https://github.com',
  },
  {
    id: 'proj-3',
    name: 'Power Automate Workflow Demo',
    description: 'Démonstration de flux d\'automatisation connectant GitHub, Teams et Outlook pour une gestion agile.',
    technologies: ['Power Automate', 'GitHub API', 'Teams'],
    status: 'Terminé',
    level: 'Avancé',
    githubUrl: 'https://github.com',
  },
  {
    id: 'proj-4',
    name: 'GitHub Portfolio Starter',
    description: 'Un template open-source pour les étudiants souhaitant créer leur portfolio orienté tech.',
    technologies: ['HTML', 'CSS', 'JavaScript'],
    status: 'Actif',
    level: 'Débutant',
    githubUrl: 'https://github.com',
    demoUrl: 'https://example.com',
  },
  {
    id: 'proj-5',
    name: 'Copilot Prompt Library',
    description: 'Une bibliothèque de prompts optimisés pour Microsoft 365 Copilot avec système de vote.',
    technologies: ['Vue.js', 'Firebase', 'Vuetify'],
    status: 'En cours',
    level: 'Intermédiaire',
    githubUrl: 'https://github.com',
  }
];
