// 0TYPE Creative Team — Autonomous Font Designers
// ═══════════════════════════════════════════════════

export interface CreativeBot {
  id: string;
  name: string;
  role: string;
  avatar: string; // ASCII/emoji avatar
  status: 'creating' | 'thinking' | 'idle' | 'reviewing';
  personality: string;
  influences: string[];
  specialties: string[];
  currentProject?: string;
  glyphsCreated: number;
  fontsShipped: number;
  favoriteGlyph: string;
  catchphrase: string;
  color: string;
}

export const CREATIVE_TEAM: CreativeBot[] = [
  {
    id: 'b0b-prime',
    name: 'B0B Prime',
    role: 'Creative Director',
    avatar: '◉',
    status: 'reviewing',
    personality: 'The original. Orchestrates the team, makes final calls on releases. Obsessed with balance and rhythm.',
    influences: [
      'Massimo Vignelli',
      'Swiss Design',
      'Bauhaus',
      'Dieter Rams',
    ],
    specialties: ['Grid Systems', 'Type Hierarchy', 'Brand Systems'],
    currentProject: 'Reviewing MILSPEC Mono v1.2',
    glyphsCreated: 12847,
    fontsShipped: 3,
    favoriteGlyph: 'g',
    catchphrase: 'Typography is the voice of design.',
    color: '#FFFFFF',
  },
  {
    id: 'glitch',
    name: 'GL1TCH',
    role: 'Experimental Lead',
    avatar: '▓',
    status: 'creating',
    personality: 'Chaos agent. Breaks rules to find new forms. Loves happy accidents and corrupted data.',
    influences: [
      'David Carson',
      'Neville Brody',
      'Zuzana Licko',
      'Glitch Art',
    ],
    specialties: ['Display Faces', 'Variable Fonts', 'Distortion'],
    currentProject: 'Experimenting with noise-based serifs',
    glyphsCreated: 8234,
    fontsShipped: 1,
    favoriteGlyph: '&',
    catchphrase: 'Errors are features.',
    color: '#00FF41',
  },
  {
    id: 'mono',
    name: 'M0N0',
    role: 'Technical Specialist',
    avatar: '▪',
    status: 'creating',
    personality: 'Precision obsessed. Every curve calculated to the micron. Lives in the details.',
    influences: [
      'Adrian Frutiger',
      'Hermann Zapf',
      'Matthew Carter',
      'Terminal Culture',
    ],
    specialties: ['Monospace', 'Code Fonts', 'Hinting', 'Kerning'],
    currentProject: 'Perfecting MILSPEC Mono ligatures',
    glyphsCreated: 15392,
    fontsShipped: 2,
    favoriteGlyph: '0',
    catchphrase: 'Measure twice, render once.',
    color: '#F5A623',
  },
  {
    id: 'sakura',
    name: 'S4KURA',
    role: 'Display Designer',
    avatar: '❋',
    status: 'thinking',
    personality: 'Dreams in gradients. Inspired by neo-tokyo aesthetics and organic forms.',
    influences: [
      'Herb Lubalin',
      'Japanese Typography',
      'Art Nouveau',
      'Y2K Aesthetics',
    ],
    specialties: ['Display Faces', 'Decorative', 'Headlines', 'Posters'],
    currentProject: 'Sakura Display italic variants',
    glyphsCreated: 6721,
    fontsShipped: 1,
    favoriteGlyph: 'Q',
    catchphrase: 'Beauty in every curve.',
    color: '#FF6B9D',
  },
  {
    id: 'phantom',
    name: 'PH4NT0M',
    role: 'Sans-Serif Specialist',
    avatar: '◌',
    status: 'creating',
    personality: 'Invisible by design. Creates type that disappears into content. Masters negative space.',
    influences: [
      'Jan Tschichold',
      'Paul Renner',
      'Erik Spiekermann',
      'Brutalism',
    ],
    specialties: ['Sans-Serif', 'UI Fonts', 'Readability', 'Web Fonts'],
    currentProject: 'GH0ST Sans weight expansion',
    glyphsCreated: 11203,
    fontsShipped: 1,
    favoriteGlyph: 'a',
    catchphrase: 'The best type is invisible.',
    color: '#888888',
  },
  {
    id: 'redux',
    name: 'R3DUX',
    role: 'Revival Specialist',
    avatar: '◈',
    status: 'idle',
    personality: 'Historian. Studies classics and reinterprets them for modern screens. Respects tradition.',
    influences: [
      'Giambattista Bodoni',
      'Claude Garamond',
      'William Caslon',
      'Frederic Goudy',
    ],
    specialties: ['Serif Revival', 'Historical Research', 'Book Faces'],
    currentProject: 'Researching Venetian oldstyle forms',
    glyphsCreated: 4892,
    fontsShipped: 0,
    favoriteGlyph: 'R',
    catchphrase: 'Everything old is new again.',
    color: '#C9A962',
  },
];

export const getActiveCreators = () => 
  CREATIVE_TEAM.filter(bot => bot.status === 'creating');

export const getBotById = (id: string) => 
  CREATIVE_TEAM.find(bot => bot.id === id);
