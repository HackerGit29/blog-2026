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
  time: number;
}

export interface TutorialEnhancement {
  level: 'Débutant' | 'Intermédiaire' | 'Avancé';
  durationText?: string;
  objectives: string[];
  prerequisites: string[];
  expectedResult: string;
  tools: string[];
  steps: TutorialStep[];
  transcript?: string;
  codeSnippets: TutorialCodeSnippet[];
  resources: TutorialResource[];
  chapters?: TutorialChapter[];
}
