export interface Officer {
  id: string;
  fullName: string;
  warName: string; // Nome de Guerra
  rank: string;    // Graduação ou Posto
  matricula: string;
}

export interface OccurrenceType {
  id: string;
  name: string;
  points: number;
}

export interface OccurrenceLog {
  id: string;
  officerId: string;
  typeId: string;
  date: string; // Date of the occurrence (YYYY-MM-DD)
  timestamp: number; // Record creation timestamp
  boeNumber: string; // Boletim de Ocorrência Eletrônico
  multiplicationFactor?: number; // Optional multiplier (default 1)
}

export interface OfficerRanking extends Officer {
  totalPoints: number;
  occurrencesCount: number;
  boeNumbers: string[]; // List of unique BOE numbers associated with the officer
}

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'user';
}

export interface Contestation {
  id: string;
  userId: string; // Who opened the contestation
  userName: string;
  subject: string; // Motivo (ex: BOE errado, Pontuação incorreta)
  content: string; // Detalhamento em texto
  status: 'pending' | 'approved' | 'rejected';
  adminResponse?: string; // Admin's justification for rejection
  createdAt: number;
  resolvedAt?: number;
}