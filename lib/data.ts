export type Tone = "success" | "warning" | "danger" | "info" | "neutral";

export type MatchRow = {
  id: string;
  date: string;
  division: string;
  home: string;
  away: string;
  venue: string;
  officials: [number, number];
  buvette: [number, number];
  carpool: string;
  status: string;
};

export const kpis = [
  {
    label: "Matchs à venir",
    value: "24",
    detail: "+6 ce mois",
    icon: "calendar",
    tone: "success" as const,
  },
  {
    label: "Postes non pourvus",
    value: "18",
    detail: "Action requise",
    icon: "users",
    tone: "warning" as const,
  },
  {
    label: "Confirmations en attente",
    value: "32",
    detail: "J-15 et J-4",
    icon: "clock",
    tone: "info" as const,
  },
  {
    label: "Points récents",
    value: "3",
    detail: "Cette semaine",
    icon: "shield",
    tone: "danger" as const,
  },
];

export const attentionMatches = [
  { id: 1, date: "24 mai · 14:30", division: "U13 M", opponent: "Castelnau", slots: "2 postes", urgent: true },
  { id: 2, date: "24 mai · 17:00", division: "U17 F", opponent: "Lattes", slots: "1 poste", urgent: false },
  { id: 3, date: "31 mai · 15:00", division: "U15 M", opponent: "Mauguio", slots: "3 postes", urgent: true },
  { id: 4, date: "7 juin · 20:00", division: "Seniors M", opponent: "Nîmes", slots: "4 postes", urgent: true },
];

export const matches: MatchRow[] = [
  {
    id: "m1",
    date: "24 mai · 14:30",
    division: "U13 M",
    home: "BOB1",
    away: "Castelnau",
    venue: "Coubertin",
    officials: [4, 6],
    buvette: [1, 2],
    carpool: "8 places",
    status: "J-15",
  },
  {
    id: "m2",
    date: "24 mai · 17:00",
    division: "U17 F",
    home: "BOB1",
    away: "Lattes",
    venue: "Coubertin",
    officials: [6, 6],
    buvette: [2, 2],
    carpool: "Complet",
    status: "Confirmé",
  },
  {
    id: "m3",
    date: "31 mai · 15:00",
    division: "U15 M",
    home: "Mauguio",
    away: "BOB1",
    venue: "Mauguio",
    officials: [3, 6],
    buvette: [0, 2],
    carpool: "4 places",
    status: "Brouillon",
  },
  {
    id: "m4",
    date: "7 juin · 20:00",
    division: "Seniors M",
    home: "BOB1",
    away: "Nîmes",
    venue: "Palais des sports",
    officials: [2, 6],
    buvette: [1, 3],
    carpool: "12 places",
    status: "J-15",
  },
  {
    id: "m5",
    date: "8 juin · 10:30",
    division: "U13 F",
    home: "Lunel",
    away: "BOB1",
    venue: "Lunel",
    officials: [5, 6],
    buvette: [2, 2],
    carpool: "6 places",
    status: "J-4",
  },
  {
    id: "m6",
    date: "14 juin · 14:30",
    division: "U17 M",
    home: "BOB1",
    away: "Sète",
    venue: "Coubertin",
    officials: [5, 6],
    buvette: [1, 2],
    carpool: "5 places",
    status: "J-15",
  },
  {
    id: "m7",
    date: "15 juin · 11:00",
    division: "U15 F",
    home: "Castelnau",
    away: "BOB1",
    venue: "Castelnau",
    officials: [4, 6],
    buvette: [2, 2],
    carpool: "3 places",
    status: "J-4",
  },
  {
    id: "m8",
    date: "21 juin · 18:00",
    division: "Seniors F",
    home: "BOB1",
    away: "Montpellier",
    venue: "Palais des sports",
    officials: [6, 6],
    buvette: [2, 2],
    carpool: "Complet",
    status: "Confirmé",
  },
];

// Division: name, category, gender, status (Active/Inactive)
export const divisions = [
  { id: "d1", name: "U13 Masculins", category: "U13", gender: "Masculin", teams: "2 équipes", status: "Active", sortOrder: 1 },
  { id: "d2", name: "U13 Féminines", category: "U13", gender: "Féminin", teams: "2 équipes", status: "Active", sortOrder: 2 },
  { id: "d3", name: "U15 Masculins", category: "U15", gender: "Masculin", teams: "2 équipes", status: "Active", sortOrder: 3 },
  { id: "d4", name: "U15 Féminines", category: "U15", gender: "Féminin", teams: "1 équipe", status: "Active", sortOrder: 4 },
  { id: "d5", name: "U17 Masculins", category: "U17", gender: "Masculin", teams: "2 équipes", status: "Active", sortOrder: 5 },
  { id: "d6", name: "U17 Féminines", category: "U17", gender: "Féminin", teams: "1 équipe", status: "Active", sortOrder: 6 },
  { id: "d7", name: "Seniors Masculins", category: "Senior", gender: "Masculin", teams: "3 équipes", status: "Active", sortOrder: 7 },
  { id: "d8", name: "Seniors Féminines", category: "Senior", gender: "Féminin", teams: "1 équipe", status: "Inactive", sortOrder: 8 },
];

// Team: name, division, coach, logo (nullable), status (Active/External/Archived), trainingLocation (nullable)
export const teams = [
  { id: "t1", name: "BOB1 U13 M", division: "U13 M", coach: "Marc Durand", logo: "https://example.com/logo1.png", players: "12 joueurs", status: "Active", trainingLocation: "Gymnase Coubertin" },
  { id: "t2", name: "BOB1 U13 F", division: "U13 F", coach: "Nora Petit", logo: null, players: "11 joueuses", status: "Active", trainingLocation: "Gymnase Coubertin" },
  { id: "t3", name: "BOB1 U15 M", division: "U15 M", coach: "Julien Robert", logo: "https://example.com/logo3.png", players: "12 joueurs", status: "Active", trainingLocation: "Palais des sports" },
  { id: "t4", name: "BOB1 U15 F", division: "U15 F", coach: "Léa Bernard", logo: null, players: "10 joueuses", status: "Active", trainingLocation: "Gymnase de Lattes" },
  { id: "t5", name: "BOB1 U17 M", division: "U17 M", coach: "Marc Durand", logo: "https://example.com/logo5.png", players: "11 joueurs", status: "Active", trainingLocation: "Halle Mauguio" },
  { id: "t6", name: "BOB1 U17 F", division: "U17 F", coach: "Nora Petit", logo: null, players: "10 joueuses", status: "Active", trainingLocation: null },
  { id: "t7", name: "BOB1 Seniors M", division: "Seniors M", coach: "Karim Benali", logo: "https://example.com/logo7.png", players: "14 joueurs", status: "Active", trainingLocation: "Palais des sports" },
  { id: "t8", name: "BOB1 Seniors F", division: "Seniors F", coach: "Élodie Fabre", logo: null, players: "12 joueuses", status: "Active", trainingLocation: "Gymnase Coubertin" },
  { id: "t9", name: "Castelnau Basket", division: "U13 M", coach: "Club externe", logo: null, players: "—", status: "Externe", trainingLocation: null },
  { id: "t10", name: "Lattes Basket", division: "U17 F", coach: "Club externe", logo: null, players: "—", status: "Externe", trainingLocation: null },
  { id: "t11", name: "Mauguio BC", division: "U15 M", coach: "Club externe", logo: null, players: "—", status: "Externe", trainingLocation: null },
  { id: "t12", name: "Nîmes Gard BC", division: "Seniors M", coach: "Club externe", logo: null, players: "—", status: "Externe", trainingLocation: null },
];

// Venue: name, address, city, postalCode
export const venues = [
  { id: "v1", name: "Gymnase Coubertin", address: "12 rue des Sports", city: "Montpellier", postalCode: "34000", matches: "8 matchs" },
  { id: "v2", name: "Palais des sports", address: "8 avenue du Parc", city: "Montpellier", postalCode: "34000", matches: "4 matchs" },
  { id: "v3", name: "Gymnase de Lattes", address: "2 rue des Écoles", city: "Lattes", postalCode: "34970", matches: "2 matchs" },
  { id: "v4", name: "Halle Mauguio", address: "10 bd de la Liberté", city: "Mauguio", postalCode: "34130", matches: "1 match" },
  { id: "v5", name: "Complexe de Lunel", address: "5 route de Sommières", city: "Lunel", postalCode: "34400", matches: "1 match" },
  { id: "v6", name: "Halle des Sports de Sète", address: "3 quai des Moulins", city: "Sète", postalCode: "34200", matches: "—" },
];

export type Person = {
  id: string;
  name: string;
  email: string;
  roles: string[];
  status: string; // Actif / Suspendu / En attente
  lastLogin: string;
};

export const people: Person[] = [
  { id: "p1", name: "Camille Martin", email: "camille@email.fr", roles: ["Parent", "Staff", "Admin"], status: "Actif", lastLogin: "Aujourd'hui, 9:41" },
  { id: "p2", name: "Julien Martin", email: "julien@email.fr", roles: ["Parent"], status: "Actif", lastLogin: "Il y a 2 jours" },
  { id: "p3", name: "Nora Petit", email: "nora@email.fr", roles: ["Staff", "Parent"], status: "Actif", lastLogin: "Hier, 18:12" },
  { id: "p4", name: "Marc Durand", email: "marc@email.fr", roles: ["Staff"], status: "Suspendu", lastLogin: "Il y a 5 jours" },
  { id: "p5", name: "Léa Bernard", email: "lea@email.fr", roles: ["Staff"], status: "Actif", lastLogin: "Aujourd'hui, 8:05" },
  { id: "p6", name: "Sophie Bernard", email: "sophie@email.fr", roles: ["Parent"], status: "Actif", lastLogin: "Il y a 3 jours" },
  { id: "p7", name: "Julien Robert", email: "jrobert@email.fr", roles: ["Staff"], status: "Actif", lastLogin: "Il y a 4 jours" },
  { id: "p8", name: "Élodie Rousseau", email: "elodie@email.fr", roles: ["Parent"], status: "En attente", lastLogin: "Invitation envoyée" },
  { id: "p9", name: "Thomas Petit", email: "thomas@email.fr", roles: ["Parent"], status: "Actif", lastLogin: "Il y a 1 semaine" },
  { id: "p10", name: "Inès Fabre", email: "ines@email.fr", roles: ["Staff"], status: "Actif", lastLogin: "Hier, 20:30" },
];

export type Family = {
  id: string;
  name: string;
  parents: string;
  children: string;
  size: string;
  accounts: string;
  status: string;
  hasInactiveAccounts: boolean; // for filtering
};

export const families: Family[] = [
  { id: "f1", name: "Famille Martin", parents: "Camille & Julien", children: "Léo, Chloé", size: "4 membres", accounts: "2 comptes", status: "Complet", hasInactiveAccounts: false },
  { id: "f2", name: "Famille Petit", parents: "Nora Petit", children: "Alice, Tom", size: "3 membres", accounts: "1 sans compte", status: "À compléter", hasInactiveAccounts: false },
  { id: "f3", name: "Famille Bernard", parents: "Léa & Sophie", children: "Emma", size: "3 membres", accounts: "3 comptes", status: "Complet", hasInactiveAccounts: false },
  { id: "f4", name: "Famille Durand", parents: "Marc Durand", children: "Lucas, Zoé", size: "3 membres", accounts: "2 sans compte", status: "À compléter", hasInactiveAccounts: true }, // Marc is suspended
  { id: "f5", name: "Famille Robert", parents: "Julien Robert", children: "Noah", size: "2 membres", accounts: "2 comptes", status: "Complet", hasInactiveAccounts: false },
  { id: "f6", name: "Famille Rousseau", parents: "Élodie Rousseau", children: "Jade", size: "2 membres", accounts: "1 sans compte", status: "À compléter", hasInactiveAccounts: false },
];

// Person-level ranking by category
export type PersonRankingRow = {
  rank: number;
  person: string;
  family: string;
  points: number;
  highlight?: boolean;
};

export const personRankings: Record<string, PersonRankingRow[]> = {
  presence: [
    { rank: 1, person: "Nora Petit", family: "Famille Petit", points: 180, highlight: false },
    { rank: 2, person: "Léa Bernard", family: "Famille Bernard", points: 160 },
    { rank: 3, person: "Julien Robert", family: "Famille Robert", points: 150 },
    { rank: 4, person: "Camille Martin", family: "Famille Martin", points: 120, highlight: true },
    { rank: 5, person: "Marc Durand", family: "Famille Durand", points: 100 },
    { rank: 6, person: "Sophie Bernard", family: "Famille Bernard", points: 90 },
    { rank: 7, person: "Thomas Petit", family: "Famille Petit", points: 80 },
    { rank: 8, person: "Inès Fabre", family: "Famille Rousseau", points: 70 },
  ],
  volunteer: [
    { rank: 1, person: "Léa Bernard", family: "Famille Bernard", points: 110 },
    { rank: 2, person: "Nora Petit", family: "Famille Petit", points: 90 },
    { rank: 3, person: "Julien Robert", family: "Famille Robert", points: 80 },
    { rank: 4, person: "Camille Martin", family: "Famille Martin", points: 60, highlight: true },
    { rank: 5, person: "Thomas Petit", family: "Famille Petit", points: 40 },
  ],
  staff: [
    { rank: 1, person: "Nora Petit", family: "Famille Petit", points: 126 },
    { rank: 2, person: "Léa Bernard", family: "Famille Bernard", points: 112 },
    { rank: 3, person: "Julien Robert", family: "Famille Robert", points: 98 },
    { rank: 4, person: "Camille Martin", family: "Famille Martin", points: 68, highlight: true },
    { rank: 5, person: "Marc Durand", family: "Famille Durand", points: 61 },
    { rank: 6, person: "Inès Fabre", family: "Famille Rousseau", points: 43 },
  ],
  carpool: [
    { rank: 1, person: "Julien Martin", family: "Famille Martin", points: 74 },
    { rank: 2, person: "Sophie Bernard", family: "Famille Bernard", points: 62 },
    { rank: 3, person: "Camille Martin", family: "Famille Martin", points: 48, highlight: true },
    { rank: 4, person: "Nora Petit", family: "Famille Petit", points: 36 },
    { rank: 5, person: "Marc Durand", family: "Famille Durand", points: 21 },
  ],
  penalty: [
    { rank: 1, person: "Marc Durand", family: "Famille Durand", points: -20 },
    { rank: 2, person: "Julien Robert", family: "Famille Robert", points: -15 },
    { rank: 3, person: "Camille Martin", family: "Famille Martin", points: -10, highlight: true },
    { rank: 4, person: "Léa Bernard", family: "Famille Bernard", points: -5 },
    { rank: 5, person: "Thomas Petit", family: "Famille Petit", points: -10 },
  ],
};

// Family-level ranking by category (aggregated from person rankings)
export type FamilyRankingRow = {
  rank: number;
  family: string;
  points: number;
  highlight?: boolean;
};

export const familyRankings: Record<string, FamilyRankingRow[]> = {
  presence: [
    { rank: 1, family: "Famille Petit", points: 260 },
    { rank: 2, family: "Famille Bernard", points: 250 },
    { rank: 3, family: "Famille Martin", points: 200, highlight: true },
    { rank: 4, family: "Famille Robert", points: 150 },
    { rank: 5, family: "Famille Durand", points: 100 },
    { rank: 6, family: "Famille Rousseau", points: 70 },
  ],
  volunteer: [
    { rank: 1, family: "Famille Bernard", points: 150 },
    { rank: 2, family: "Famille Petit", points: 100 },
    { rank: 3, family: "Famille Martin", points: 80, highlight: true },
    { rank: 4, family: "Famille Robert", points: 80 },
    { rank: 5, family: "Famille Durand", points: 20 },
  ],
  staff: [
    { rank: 1, family: "Famille Petit", points: 126 },
    { rank: 2, family: "Famille Bernard", points: 112 },
    { rank: 3, family: "Famille Robert", points: 98 },
    { rank: 4, family: "Famille Martin", points: 68, highlight: true },
    { rank: 5, family: "Famille Durand", points: 61 },
    { rank: 6, family: "Famille Rousseau", points: 43 },
  ],
  carpool: [
    { rank: 1, family: "Famille Martin", points: 122, highlight: true },
    { rank: 2, family: "Famille Bernard", points: 62 },
    { rank: 3, family: "Famille Petit", points: 36 },
    { rank: 4, family: "Famille Durand", points: 21 },
    { rank: 5, family: "Famille Robert", points: 0 },
  ],
  penalty: [
    { rank: 1, family: "Famille Durand", points: -20 },
    { rank: 2, family: "Famille Robert", points: -15 },
    { rank: 3, family: "Famille Martin", points: -10, highlight: true },
    { rank: 4, family: "Famille Bernard", points: -5 },
    { rank: 5, family: "Famille Petit", points: -10 },
  ],
};

// Rules: some have J-15/J-4, others just single points
export type RuleRow = {
  key: string;
  category: string;
  label: string;
  points: number;
  pointsJ15?: number;
  pointsJ4?: number;
  hasJ15J4: boolean;
};

export const rules: RuleRow[] = [
  { key: "presence", category: "presence", label: "Présence confirmée", points: 10, hasJ15J4: false },
  { key: "slot.volunteer", category: "volunteer", label: "Bénévolat (buvette...)", points: 15, hasJ15J4: false },
  { key: "slot.staff", category: "staff", label: "Poste de staff (MAR, arbitre...)", points: 20, hasJ15J4: true, pointsJ15: 5, pointsJ4: 3 },
  { key: "carpool.offer", category: "carpool", label: "Covoiturage proposé", points: 10, hasJ15J4: true, pointsJ15: 3, pointsJ4: 2 },
  { key: "penalty.no_show", category: "penalty", label: "Absence non excusée", points: -20, hasJ15J4: false },
  { key: "penalty.late_cancel", category: "penalty", label: "Désistement tardif", points: -10, hasJ15J4: false },
];

// Points history (all entries)
export type HistoryEntry = {
  id: string;
  person: string;
  category: string;
  points: number;
  reason: string;
  match: string;
  date: string;
  isPenalty: boolean;
  isRevoked: boolean;
};

export const historyEntries: HistoryEntry[] = [
  { id: "h1", person: "Nora Petit", category: "staff", points: 20, reason: "Arbitre 1 - U13 vs Castelnau", match: "U13 vs Castelnau", date: "24 mai", isPenalty: false, isRevoked: false },
  { id: "h2", person: "Marc Durand", category: "penalty", points: -20, reason: "Absence non excusée", match: "U17 vs Lattes", date: "20 mai", isPenalty: true, isRevoked: false },
  { id: "h3", person: "Camille Martin", category: "carpool", points: 10, reason: "Covoiturage proposé - U15 vs Lyon", match: "U15 vs Lyon", date: "17 mai", isPenalty: false, isRevoked: false },
  { id: "h4", person: "Léa Bernard", category: "volunteer", points: 15, reason: "Buvette - U13 vs Mauguio", match: "U13 vs Mauguio", date: "11 mai", isPenalty: false, isRevoked: false },
  { id: "h5", person: "Julien Robert", category: "penalty", points: -10, reason: "Désistement tardif", match: "Seniors vs Nîmes", date: "4 mai", isPenalty: true, isRevoked: false },
  { id: "h6", person: "Nora Petit", category: "presence", points: 10, reason: "Présence confirmée - U13 vs Castelnau", match: "U13 vs Castelnau", date: "28 avr.", isPenalty: false, isRevoked: false },
  { id: "h7", person: "Thomas Petit", category: "penalty", points: -10, reason: "Désistement tardif", match: "U15 vs Maugio", date: "21 avr.", isPenalty: true, isRevoked: false },
  { id: "h8", person: "Camille Martin", category: "staff", points: 20, reason: "MAR - U15 vs Lyon", match: "U15 vs Lyon", date: "17 mai", isPenalty: false, isRevoked: false },
  { id: "h9", person: "Sophie Bernard", category: "volunteer", points: 15, reason: "Buvette - U13 vs Mauguio", match: "U13 vs Mauguio", date: "11 mai", isPenalty: false, isRevoked: false },
  { id: "h10", person: "Julien Martin", category: "carpool", points: 10, reason: "Covoiturage proposé - U13 vs Castelnau", match: "U13 vs Castelnau", date: "24 mai", isPenalty: false, isRevoked: false },
  { id: "h11", person: "Marc Durand", category: "penalty", points: 20, reason: "Annulation : Absence non excusée", match: "U17 vs Lattes", date: "22 mai", isPenalty: false, isRevoked: true }, // revoked entry (positive points)
];

export const calendarDays = [
  { n: 28, dim: true },
  { n: 29, dim: true },
  { n: 30, dim: true },
  { n: 1 },
  { n: 2 },
  { n: 3, dot: "info" },
  { n: 4 },
  { n: 5 },
  { n: 6, dot: "neutral" },
  { n: 7 },
  { n: 8 },
  { n: 9 },
  { n: 10, dot: "warning" },
  { n: 11 },
  { n: 12 },
  { n: 13 },
  { n: 14, dot: "success" },
  { n: 15 },
  { n: 16 },
  { n: 17, dot: "warning" },
  { n: 18 },
  { n: 19 },
  { n: 20, dot: "info" },
  { n: 21 },
  { n: 22 },
  { n: 23 },
  { n: 24, dot: "success", active: true },
  { n: 25 },
  { n: 26 },
  { n: 27 },
  { n: 28, dot: "danger" },
  { n: 29 },
  { n: 30 },
  { n: 31, dot: "success" },
  { n: 1, dim: true },
];

export const activity = [
  { id: 1, text: "Nora Petit a confirmé sa présence à 3 matchs", time: "Il y a 18 min", tone: "success" as Tone },
  { id: 2, text: "Julien Martin a proposé 4 places de covoiturage", time: "Il y a 1 h", tone: "info" as Tone },
  { id: 3, text: "2 postes d'arbitre sont toujours libres samedi", time: "Il y a 2 h", tone: "warning" as Tone },
  { id: 4, text: "Des points ont été ajoutés pour Marc Durand", time: "Hier, 16:20", tone: "danger" as Tone },
];