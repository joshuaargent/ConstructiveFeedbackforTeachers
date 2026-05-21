// ============================================
// Site Configuration
// ============================================

export const siteConfig = {
  name: 'Constructive Feedback',
  description: 'A supportive platform where students can share feedback to help teachers grow.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  ogImage: '/og-image.png',
  location: 'Surrey, United Kingdom',
  links: {
    youtube: 'https://youtube.com/@joshua_argent',
    github: 'https://github.com/joshuaargent',
    instagram: 'https://instagram.com/joshua_argent',
    facebook: 'https://facebook.com/joshua_argent',
    strava: 'https://www.strava.com/athletes/500534339',
    email: 'mailto:argentjackjoshua@outlook.com',
  },
  author: {
    name: 'Your Name',
    bio: 'Your bio here',
  },
};

// ============================================
// Metadata
// ============================================

export const meta = {
  title: 'Constructive Feedback for Teachers',
  description: 'A supportive platform where students can share feedback to help teachers grow.',
  keywords: ['education', 'feedback', 'teachers', 'support'] as string[],
  siteName: 'Constructive Feedback',
  twitter: '@yourhandle',
  instagramHandle: '@yourhandle',
};

// ============================================
// Navigation
// ============================================

export const mainNav = [
  { label: 'Home', href: '/' },
  { label: 'Teachers', href: '/teachers' },
  { label: 'Contact', href: '/contact' },
];

export const footerNav = {
  main: [
    { label: 'Home', href: '/' },
    { label: 'Teachers', href: '/teachers' },
    { label: 'Contact', href: '/contact' },
  ],
  content: [
    { label: 'Home', href: '/' },
    { label: 'Teachers', href: '/teachers' },
    { label: 'Contact', href: '/contact' },
  ],
  social: [
    { label: 'YouTube', href: siteConfig.links.youtube },
    { label: 'GitHub', href: siteConfig.links.github },
    { label: 'Instagram', href: siteConfig.links.instagram },
    { label: 'Facebook', href: siteConfig.links.facebook },
    { label: 'Strava', href: siteConfig.links.strava },
  ],
};

// ============================================
// Design Tokens
// ============================================

export const colors = {
  primary: '#0D9488',
  primaryHover: '#0F766E',
} as const;

// ============================================
// Animation
// ============================================

export const transitions = {
  fast: '150ms ease',
  base: '200ms ease',
  slow: '300ms ease',
  slower: '500ms ease',
} as const;

export const animations = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { duration: 0.4 },
  },
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 },
  },
  slideDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.4 },
  },
} as const;
