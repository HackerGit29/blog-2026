export const PROFILE_DATA = {
  name: 'Irene Brooks',
  title: "Designer d'interface et de marque",
  location: 'basée à San Antonio',
  followers: '2,985',
  following: '132',
  likes: '548',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  socials: {
    discord: 'https://discord.gg/invite',
    github: 'https://github.com/irenebrooks',
    instagram: 'https://instagram.com/irenebrooks'
  }
};

export const PROJECTS = [
  {
    id: 1,
    title: 'App Mobile VPN',
    category: 'Interface Mobile, Recherche',
    likes: '517',
    views: '9.3k',
    imageUrl: 'https://images.unsplash.com/photo-1618761714954-0b8cd0026356?auto=format&fit=crop&w=800&q=80',
    badges: [],
    bgColor: '#9ecdf5'
  },
  {
    id: 2,
    title: 'Dashboard Immobilier',
    category: 'Interface Web',
    likes: '983',
    views: '14k',
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    badges: [{ text: 'UI', color: '#FF5A1F' }],
    bgColor: '#e3dfd3'
  },
  {
    id: 3,
    title: 'App Mobile Santé',
    category: 'Interface Mobile, Branding',
    likes: '875',
    views: '13.5k',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
    badges: [{ text: 'UI', color: '#FF5A1F' }, { text: 'Br', color: '#6B4EFF' }],
    bgColor: '#b6d7f0'
  }
];

export const NAV_LINKS = [
  { label: 'Designers', href: '#', active: true },
  { label: 'Explorer', href: '#' },
  { label: 'Projets', href: '#' },
  { label: 'Travaux', href: '#' },
];
