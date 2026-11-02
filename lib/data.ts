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
    label: "Pénalités récentes",
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

export const divisions = [
  { id: "d1", name: "U13 Masculins", category: "U13", gender: "Masculin", teams: "2 équipes", status: "Active" },
  { id: "d2", name: "U13 Féminines", category: "U13", gender: "Féminin", teams: "2 équipes", status: "Active" },
  { id: "d3", name: "U15 Masculins", category: "U15", gender: "Masculin", teams: "2 équipes", status: "Active" },
  { id: "d4", name: "U15 Féminines", category: "U15", gender: "Féminin", teams: "1 équipe", status: "Active" },
  { id: "d5", name: "U17 Masculins", category: "U17", gender: "Masculin", teams: "2 équipes", status: "Active" },
  { id: "d6", name: "U17 Féminines", category: "U17", gender: "Féminin", teams: "1 équipe", status: "Active" },
  { id: "d7", name: "Seniors Masculins", category: "Senior", gender: "Masculin", teams: "3 équipes", status: "Active" },
  { id: "d8", name: "Seniors Féminines", category: "Senior", gender: "Féminin", teams: "1 équipe", status: "Archivée" },
];

export const teams = [
  { id: "t1", name: "BOB1 U13 M", division: "U13 M", coach: "Marc Durand", players: "12 joueurs", status: "Active" },
  { id: "t2", name: "BOB1 U13 F", division: "U13 F", coach: "Nora Petit", players: "11 joueuses", status: "Active" },
  { id: "t3", name: "BOB1 U15 M", division: "U15 M", coach: "Julien Robert", players: "12 joueurs", status: "Active" },
  { id: "t4", name: "BOB1 U15 F", division: "U15 F", coach: "Léa Bernard", players: "10 joueuses", status: "Active" },
  { id: "t5", name: "BOB1 U17 M", division: "U17 M", coach: "Marc Durand", players: "11 joueurs", status: "Active" },
  { id: "t6", name: "BOB1 U17 F", division: "U17 F", coach: "Nora Petit", players: "10 joueuses", status: "Active" },
  { id: "t7", name: "BOB1 Seniors M", division: "Seniors M", coach: "Karim Benali", players: "14 joueurs", status: "Active" },
  { id: "t8", name: "BOB1 Seniors F", division: "Seniors F", coach: "Élodie Fabre", players: "12 joueuses", status: "Active" },
  { id: "t9", name: "Castelnau Basket", division: "U13 M", coach: "Club externe", players: "—", status: "Externe" },
  { id: "t10", name: "Lattes Basket", division: "U17 F", coach: "Club externe", players: "—", status: "Externe" },
  { id: "t11", name: "Mauguio BC", division: "U15 M", coach: "Club externe", players: "—", status: "Externe" },
  { id: "t12", name: "Nîmes Gard BC", division: "Seniors M", coach: "Club externe", players: "—", status: "Externe" },
];

export const venues = [
  { id: "v1", name: "Gymnase Coubertin", address: "12 rue des Sports", city: "Montpellier", matches: "8 matchs", status: "Actif" },
  { id: "v2", name: "Palais des sports", address: "8 avenue du Parc", city: "Montpellier", matches: "4 matchs", status: "Actif" },
  { id: "v3", name: "Gymnase de Lattes", address: "2 rue des Écoles", city: "Lattes", matches: "2 matchs", status: "Externe" },
  { id: "v4", name: "Halle Mauguio", address: "10 bd de la Liberté", city: "Mauguio", matches: "1 match", status: "Externe" },
  { id: "v5", name: "Complexe de Lunel", address: "5 route de Sommières", city: "Lunel", matches: "1 match", status: "Externe" },
  { id: "v6", name: "Halle des Sports de Sète", address: "3 quai des Moulins", city: "Sète", matches: "—", status: "Externe" },
];

export type Person = {
  id: string;
  name: string;
  email: string;
  roles: string[];
  status: string;
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
};

export const families: Family[] = [
  { id: "f1", name: "Famille Martin", parents: "Camille & Julien", children: "Léo, Chloé", size: "4 membres", accounts: "2 comptes", status: "Complet" },
  { id: "f2", name: "Famille Petit", parents: "Nora Petit", children: "Alice, Tom", size: "3 membres", accounts: "1 sans compte", status: "À compléter" },
  { id: "f3", name: "Famille Bernard", parents: "Léa & Sophie", children: "Emma", size: "3 membres", accounts: "3 comptes", status: "Complet" },
  { id: "f4", name: "Famille Durand", parents: "Marc Durand", children: "Lucas, Zoé", size: "3 membres", accounts: "2 sans compte", status: "À compléter" },
  { id: "f5", name: "Famille Robert", parents: "Julien Robert", children: "Noah", size: "2 membres", accounts: "2 comptes", status: "Complet" },
  { id: "f6", name: "Famille Rousseau", parents: "Élodie Rousseau", children: "Jade", size: "2 membres", accounts: "1 sans compte", status: "À compléter" },
];

export type RankingRow = {
  rank: number;
  member: string;
  participations: number;
  bonus: number;
  penalties: number;
  total: number;
  highlight?: boolean;
};

export const rankings: Record<string, RankingRow[]> = {
  Officiels: [
    { rank: 1, member: "Nora Petit", participations: 18, bonus: 25, penalties: -5, total: 126 },
    { rank: 2, member: "Léa Bernard", participations: 16, bonus: 20, penalties: 0, total: 112 },
    { rank: 3, member: "Julien Robert", participations: 15, bonus: 15, penalties: -10, total: 98 },
    { rank: 4, member: "Camille Martin", participations: 12, bonus: 18, penalties: -10, total: 68, highlight: true },
    { rank: 5, member: "Marc Durand", participations: 10, bonus: 12, penalties: 0, total: 61 },
    { rank: 6, member: "Sophie Bernard", participations: 9, bonus: 10, penalties: 0, total: 54 },
    { rank: 7, member: "Thomas Petit", participations: 8, bonus: 8, penalties: -5, total: 47 },
    { rank: 8, member: "Inès Fabre", participations: 7, bonus: 9, penalties: 0, total: 43 },
  ],
  Covoiturage: [
    { rank: 1, member: "Julien Martin", participations: 14, bonus: 18, penalties: 0, total: 74 },
    { rank: 2, member: "Sophie Bernard", participations: 12, bonus: 14, penalties: 0, total: 62 },
    { rank: 3, member: "Camille Martin", participations: 9, bonus: 12, penalties: 0, total: 48, highlight: true },
    { rank: 4, member: "Nora Petit", participations: 7, bonus: 8, penalties: 0, total: 36 },
    { rank: 5, member: "Marc Durand", participations: 5, bonus: 6, penalties: -5, total: 21 },
  ],
  Buvette: [
    { rank: 1, member: "Léa Bernard", participations: 11, bonus: 15, penalties: 0, total: 59 },
    { rank: 2, member: "Nora Petit", participations: 9, bonus: 12, penalties: 0, total: 48 },
    { rank: 3, member: "Julien Robert", participations: 8, bonus: 10, penalties: 0, total: 42 },
    { rank: 4, member: "Camille Martin", participations: 6, bonus: 8, penalties: 0, total: 32, highlight: true },
    { rank: 5, member: "Thomas Petit", participations: 4, bonus: 4, penalties: -5, total: 15 },
  ],
};

export type RuleRow = {
  role: string;
  description: string;
  j15: number;
  j4: number;
};

export const rules: RuleRow[] = [
  { role: "Arbitre 1", description: "Officiel de terrain", j15: 5, j4: 3 },
  { role: "Arbitre 2", description: "Officiel de terrain", j15: 5, j4: 3 },
  { role: "Arbitre 3", description: "Officiel de terrain", j15: 4, j4: 2 },
  { role: "Arbitre 4", description: "Officiel de terrain", j15: 4, j4: 2 },
  { role: "Chrono", description: "Mission bénévole", j15: 3, j4: 2 },
  { role: "MAR", description: "Mission bénévole", j15: 3, j4: 2 },
  { role: "Buvette", description: "Mission bénévole", j15: 3, j4: 2 },
  { role: "Covoiturage", description: "Mission bénévole", j15: 2, j4: 1 },
];

export type PenaltyRow = {
  id: string;
  person: string;
  match: string;
  reason: string;
  points: number;
  exclusion: boolean;
  created: string;
  status: string;
};

export const penalties: PenaltyRow[] = [
  { id: "pe1", person: "Marc Durand", match: "U17 vs Lattes", reason: "Absence non signalée", points: -15, exclusion: true, created: "20 mai", status: "Non lue" },
  { id: "pe2", person: "Camille Martin", match: "U15 vs Lyon", reason: "Désistement tardif", points: -10, exclusion: false, created: "17 mai", status: "Reconnue" },
  { id: "pe3", person: "Léa Bernard", match: "U13 vs Mauguio", reason: "Retard important", points: -5, exclusion: false, created: "11 mai", status: "Reconnue" },
  { id: "pe4", person: "Julien Robert", match: "Seniors vs Nîmes", reason: "Absence non signalée", points: -15, exclusion: true, created: "4 mai", status: "Reconnue" },
  { id: "pe5", person: "Nora Petit", match: "U13 vs Castelnau", reason: "Oubli de matériel", points: -5, exclusion: false, created: "28 avr.", status: "Reconnue" },
  { id: "pe6", person: "Thomas Petit", match: "U15 vs Maugio", reason: "Désistement tardif", points: -10, exclusion: false, created: "21 avr.", status: "Non lue" },
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
  { id: 4, text: "Une pénalité a été créée pour Marc Durand", time: "Hier, 16:20", tone: "danger" as Tone },
];
