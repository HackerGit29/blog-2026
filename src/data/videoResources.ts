export interface VideoResource {
  id: string;
  title: string;
  description: string;
  url: string;
  category: string;
  date: string;
  duration?: string;
}

export const videoResources: VideoResource[] = [
  {
    id: 'vid-1',
    title: 'Comment bien démarrer avec Copilot Studio',
    description: 'Tutoriel complet sur la création de votre premier agent conversationnel personnalisé.',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Placeholder
    category: 'IA',
    date: '2023-11-20',
    duration: '15:30'
  },
  {
    id: 'vid-2',
    title: 'Déployer son application React sur Azure',
    description: 'Étape par étape : de votre repo GitHub à une application live sur Azure Static Web Apps.',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    category: 'Cloud',
    date: '2023-10-15',
    duration: '22:10'
  },
  {
    id: 'vid-3',
    title: 'Créer un flux d\'approbation avec Power Automate',
    description: 'Automatisez vos demandes de congés ou d\'achats facilement.',
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    category: 'Power Platform',
    date: '2023-09-05',
    duration: '12:45'
  }
];
