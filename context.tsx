import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Officer, OccurrenceType, OccurrenceLog, OfficerRanking, User, Contestation } from './types';

interface PoliceContextType {
  // Data
  officers: Officer[];
  occurrenceTypes: OccurrenceType[];
  logs: OccurrenceLog[];
  users: User[];
  contestations: Contestation[];
  currentUser: User | null;

  // Actions - Officers
  addOfficer: (officer: Omit<Officer, 'id'>) => void;
  deleteOfficer: (id: string) => void;

  // Actions - Types
  addOccurrenceType: (type: Omit<OccurrenceType, 'id'>) => void;
  deleteOccurrenceType: (id: string) => void;

  // Actions - Logs
  addLog: (officerId: string, typeId: string, date: string, boeNumber: string, multiplicationFactor?: number) => void;
  updateLog: (id: string, updates: Partial<Omit<OccurrenceLog, 'id' | 'timestamp'>>) => void;
  deleteLog: (id: string) => void;

  // Actions - Users & Auth
  login: (username: string, password: string) => boolean;
  logout: () => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, updates: Partial<Omit<User, 'id'>>) => void;
  deleteUser: (id: string) => void;
  
  // Actions - Contestations
  addContestation: (data: Omit<Contestation, 'id' | 'createdAt' | 'status'>) => void;
  resolveContestation: (id: string, status: 'approved' | 'rejected', adminResponse?: string) => void;

  // Getters
  getRanking: (startDate?: string, endDate?: string) => OfficerRanking[];
}

const PoliceContext = createContext<PoliceContextType | undefined>(undefined);

// Initial Seed Data - Updated with Full List
const INITIAL_OFFICERS: Officer[] = [
  { id: '1', warName: 'CRISTOVÃO', matricula: '1021230', rank: 'TEN.CEL', fullName: 'CRISTOVÃO ISAAC RODRIGUES MAGALHÃES' },
  { id: '2', warName: 'EDVAN', matricula: '9807721', rank: 'CAP', fullName: 'EDVAN ARRUDA FERRAZ' },
  { id: '3', warName: 'MYKE', matricula: '119793 2', rank: '2º TEN', fullName: 'JOSEPH MYKE DA SILVA' },
  { id: '4', warName: 'TAVARES', matricula: '1260782', rank: '2º TEN', fullName: 'PAULO HENRIQUE DA SILVA TAVARES' },
  { id: '5', warName: 'HUMBERTO', matricula: '1260790', rank: '2º TEN', fullName: 'HUMBERTO VICTOR ALBUQUERQUE DE VASCONCELOS' },
  { id: '6', warName: 'RONALDO', matricula: '9504001', rank: 'SD', fullName: 'RONALDO DO NASCIMENTO LOPES' },
  { id: '7', warName: 'E. PEREIRA', matricula: '1030434', rank: 'ST', fullName: 'EDINALDO PEREIRA DA SILVA' },
  { id: '8', warName: 'BERREDO', matricula: '1055275', rank: 'ST', fullName: 'DOALCEY BERREDO VILANOVA DOS SANTOS' },
  { id: '9', warName: 'EDMAR', matricula: '1056190', rank: '1º SGT', fullName: 'EDMAR PEREIRA DA SILVA FILHO' },
  { id: '10', warName: 'OSMILAN', matricula: '1031554', rank: 'ST', fullName: 'OSMILAN SOARES DA SILVA' },
  { id: '11', warName: 'JAIRO', matricula: '9210580', rank: '2º SGT', fullName: 'JAIRO GOMES LOPES' },
  { id: '12', warName: 'NASCIMENTO', matricula: '9900977', rank: '2º SGT', fullName: 'FRANCISCO DE ASSIS DO NASCIMENTO' },
  { id: '13', warName: 'ANDRADE', matricula: '9210431', rank: '2º SGT', fullName: 'FRANCISCO JOSÉ ALENCAR ANDRADE' },
  { id: '14', warName: 'TEÓFILO', matricula: '9210520', rank: '2º SGT', fullName: 'TEÓFILO CESARIO DA SILVA' },
  { id: '15', warName: 'EUDES', matricula: '9400303', rank: '2º SGT', fullName: 'EUDES VITO ARAUJO' },
  { id: '16', warName: 'WILDES', matricula: '9403191', rank: '2º SGT', fullName: 'CARLOS WILDES DA SILVA FILHO' },
  { id: '17', warName: 'CALDEIRA', matricula: '9403116', rank: '2º SGT', fullName: 'EDSON CALDEIRA DA SILVA' },
  { id: '18', warName: 'TOMAZ', matricula: '1063863', rank: '2º SGT', fullName: 'SAMUEL TOMAZ SANTOS DE JESUS' },
  { id: '19', warName: 'NERI', matricula: '9807080', rank: '2º SGT', fullName: 'SILVANIO NERI DA SILVA' },
  { id: '20', warName: 'ERIVAN', matricula: '1053817', rank: '2º SGT', fullName: 'JOSE ERIVAN LIMA SILVINO' },
  { id: '21', warName: 'ERONILDO', matricula: '1064720', rank: '2º SGT', fullName: 'JACKSON ERONILDO NUNES DE SOUZA' },
  { id: '22', warName: 'PRISCILA', matricula: '1074636', rank: '3º SGT', fullName: 'PRISCILA RAQUEL TORRES CIPRIANO DA SILVA' },
  { id: '23', warName: 'KLEBER', matricula: '1070517', rank: '2º SGT', fullName: 'KLEBER DE SOUSA BATISTA' },
  { id: '24', warName: 'DEYWD', matricula: '1076434', rank: '3º SGT', fullName: 'DEYWD ALEXANDRE TEIXEIRA SARAIVA' },
  { id: '25', warName: 'ERIVANO', matricula: '1077007', rank: '3º SGT', fullName: 'ERIVANO FRANCISCO DE OLIVEIRA' },
  { id: '26', warName: 'JEFFERSON', matricula: '1079700', rank: '3º SGT', fullName: 'JEFFERSON THIAGO CIPRIANO DA SILVA' },
  { id: '27', warName: 'DUARTE SOUZA', matricula: '1065432', rank: '3º SGT', fullName: 'WASHINTON ANTONIO DUARTE DE SOUZA' },
  { id: '28', warName: 'P. JACINTO', matricula: '1092901', rank: '3º SGT', fullName: 'FRANCISCO PEREIRA JACINTO' },
  { id: '29', warName: 'MOTA', matricula: '1101471', rank: '3º SGT', fullName: 'ANDERSON MOTA DOS SANTOS' },
  { id: '30', warName: 'SILVA SOUZA', matricula: '1105000', rank: '3º SGT', fullName: 'FABIO DA SILVA SOUZA' },
  { id: '31', warName: 'EWERTON', matricula: '1077899', rank: '3º SGT', fullName: 'EWERTON FERINO CARNEIRO' },
  { id: '32', warName: 'CICERO ROCHA', matricula: '1098500', rank: '3º SGT', fullName: 'CICERO HELYSON ROCHA DOS SANTOS' },
  { id: '33', warName: 'GICLAUDIO', matricula: '1101307', rank: '3º SGT', fullName: 'GICLAUDIO DA SILVA PEREIRA' },
  { id: '34', warName: 'RODRIGUES SOUZA', matricula: '1103512', rank: '3º SGT', fullName: 'WASHINGTON RODRIGUES DE SOUZA' },
  { id: '35', warName: 'C. HOLANDA', matricula: '1111612', rank: '3º SGT', fullName: 'CICERO CLEMENTINO DE HOLANDA' },
  { id: '36', warName: 'EDNO', matricula: '1094262', rank: '3º SGT', fullName: 'EDNO PEREIRA DE LIMA' },
  { id: '37', warName: 'CARLOS', matricula: '1090534', rank: '3º SGT', fullName: 'CARLOS ANTONIO NOVAES PEREIRA' },
  { id: '38', warName: 'MAYKE', matricula: '1093770', rank: '3º SGT', fullName: 'MAYKE DA SILVA PIRES' },
  { id: '39', warName: 'FÁBIO COELHO', matricula: '1112104', rank: 'CB', fullName: 'JOSE FABIO DE SOUZA COELHO' },
  { id: '40', warName: 'BENEVALDO', matricula: '1113631', rank: '3º SGT', fullName: 'BENEVALDO BRANDÃO SILVA' },
  { id: '41', warName: 'ANDRES', matricula: '1131966', rank: 'CB', fullName: 'MEYGLES ANDRES RODRIGUES ALVES' },
  { id: '42', warName: 'SERAFIM', matricula: '1137530', rank: 'CB', fullName: 'JAMESSON SERAFIM GOMES' },
  { id: '43', warName: 'VIDAL BEZERRA', matricula: '1140213', rank: 'CB', fullName: 'GLEILSON VIDAL BEZERRA' },
  { id: '44', warName: 'JACKSON', matricula: '1152602', rank: 'CB', fullName: 'JACKSON DE SOUZA ROCHA' },
  { id: '45', warName: 'HONORATO', matricula: '1152840', rank: 'CB', fullName: 'MARINALDO LACERDA HONORATO FILHO' },
  { id: '46', warName: 'MAGNO ALENCAR', matricula: '1155083', rank: 'CB', fullName: 'CHARLES MAGNO ALVES DE ALENCAR' },
  { id: '47', warName: 'BARROS', matricula: '1156098', rank: 'CB', fullName: 'ROGÉRIO LOPES DE BARROS' },
  { id: '48', warName: 'FELINTO', matricula: '1157388', rank: 'CB', fullName: 'SAULO FELINTO CAVALCANTE' },
  { id: '49', warName: 'CORDEIRO SANTOS', matricula: '1163450', rank: 'CB', fullName: 'ANTONIO MARCOS CORDEIRO DOS SANTOS' },
  { id: '50', warName: 'LACERDA', matricula: '1172441', rank: 'CB', fullName: 'NILSON ROBERTO LACERDA PEREIRA' },
  { id: '51', warName: 'RONIVON', matricula: '117696-0', rank: 'CB', fullName: 'RONIVON PAULINO ALVES' },
  { id: '52', warName: 'ARISON', matricula: '1175190', rank: 'CB', fullName: 'DEYVID ARISON DOS SANTOS SILVA' },
  { id: '53', warName: 'S. CORDEIRO', matricula: '1138146', rank: 'CB', fullName: 'ALEXANDRE DA SILVA CORDEIRO' },
  { id: '54', warName: 'LOURENÇO', matricula: '1177451', rank: 'CB', fullName: 'ALAN LOURENÇO SOARES DE SOUZA' },
  { id: '55', warName: 'TIAGO NERI', matricula: '1177630', rank: 'CB', fullName: 'WILLAMY TIAGO NERI BORGES' },
  { id: '56', warName: 'CHARLES SILVA', matricula: '1182528', rank: 'CB', fullName: 'WILLYAMIS CHARLES ALVES DA SILVA' },
  { id: '57', warName: 'WALDEBERTO', matricula: '1196588', rank: 'CB', fullName: 'WALDEBERTO MOURA FONTES FEITOSA' },
  { id: '58', warName: 'RICARTE', matricula: '1201328', rank: 'CB', fullName: 'CARLA LEITE RICARTE' },
  { id: '59', warName: 'J. RIBEIRO', matricula: '1201352', rank: 'CB', fullName: 'JONATHANS RIBEIRO DE OLIVEIRA' },
  { id: '60', warName: 'SEBASTIÃO', matricula: '1201425', rank: 'CB', fullName: 'SEBASTIAO DE SOUZA SANTOS' },
  { id: '61', warName: 'MAIA', matricula: '1202928', rank: 'CB', fullName: 'JOAO DAVI MAIA DE LUNA' },
  { id: '62', warName: 'MACEDO', matricula: '1203010', rank: 'CB', fullName: 'MICHEL GOMES MACEDO' },
  { id: '63', warName: 'DUTRA', matricula: '1203118', rank: 'CB', fullName: 'LUCAS RAFAEL DUTRA DE OLIVEIRA ANJOS' },
  { id: '64', warName: 'FONSECA', matricula: '1203533', rank: 'CB', fullName: 'GABRIEL FONSECA TORRES' },
  { id: '65', warName: 'EDUARDO NASCIMENTO', matricula: '1204254', rank: 'CB', fullName: 'ITALO EDUARDO DO NASCIMENTO ALENCAR' },
  { id: '66', warName: 'GEORGE PEREIRA', matricula: '1204564', rank: 'CB', fullName: 'JOSÉ GEORGE PEREIRA DE OLIVEIRA' },
  { id: '67', warName: 'FRANCIELVES', matricula: '1204971', rank: 'CB', fullName: 'FRANCIELVES DO NASCIMENTO' },
  { id: '68', warName: 'ROBSON', matricula: '1205919', rank: 'SD', fullName: 'FRANCISCO ROBSON DOS SANTOS DA SILVA CRUZ' },
  { id: '69', warName: 'ALENCAR', matricula: '1207342', rank: 'SD', fullName: 'DIEGO BARROS DE ALENCAR' },
  { id: '70', warName: 'F. NUNES', matricula: '1210220', rank: 'SD', fullName: 'FIDEL LUCAS DE CARVALHO NUNES' },
  { id: '71', warName: 'LUCENA', matricula: '1092820', rank: 'SD', fullName: 'TERLON HENRIQUESTONE LUCENA SANTANA' },
  { id: '72', warName: 'FAUSTO', matricula: '1215159', rank: 'SD', fullName: 'FAUSTO AUGUSTINHO PEREIRA DA SILVA' },
  { id: '73', warName: 'FRANKLIN', matricula: '1216147', rank: 'SD', fullName: 'FRANKLIN DE CASTRO LEAL' },
  { id: '74', warName: 'DIAS', matricula: '1216368', rank: 'SD', fullName: 'ANDERSON VIEIRA DIAS ALENCAR' },
  { id: '75', warName: 'EVERTON ALENCAR', matricula: '1216678', rank: 'SD', fullName: 'EVERTON VASCONCELOS ALENCAR' },
  { id: '76', warName: 'ISMAEL PEREIRA', matricula: '1216775', rank: 'SD', fullName: 'ISMAEL PEREIRA DA SILVA' },
  { id: '77', warName: 'ALEX', matricula: '1217089', rank: 'SD', fullName: 'FRANCISCO ALEX DE OLIVEIRA RODRIGUES' },
  { id: '78', warName: 'CÉSAR FILHO', matricula: '1217674', rank: 'SD', fullName: 'JOAO CESAR DA SILVA FILHO' },
  { id: '79', warName: 'SOBREIRA', matricula: '1218751', rank: 'SD', fullName: 'ERISVALDO MANOEL SOBREIRA' },
  { id: '80', warName: 'ECLESYO', matricula: '1219049', rank: 'SD', fullName: 'ECLESYO BEZERRA ALMEIDA' },
  { id: '81', warName: 'ERICSON DUARTE', matricula: '1219600', rank: 'SD', fullName: 'ANTONIO ÉRICSON DUARTE BENTO' },
  { id: '82', warName: 'WEBSTER', matricula: '1220063', rank: 'SD', fullName: 'WEBSTER WENDY DOS SANTOS SILVA' },
  { id: '83', warName: 'ELWYN GOMES', matricula: '1221027', rank: 'SD', fullName: 'ELWYN DA SILVA GOMES' },
  { id: '84', warName: 'JARDENIA', matricula: '1221035', rank: 'SD', fullName: 'JARDENIA DA SILVA LIMA' },
  { id: '85', warName: 'WYLKER', matricula: '1221280', rank: 'SD', fullName: 'WYLKER MOREIRA NOGUEIRA' },
  { id: '86', warName: 'LISBOA', matricula: '1225600', rank: 'SD', fullName: 'ISMAYLLON ROBSON DE NEGREIROS LISBOA' },
  { id: '87', warName: 'ANDRÉ LUIZ', matricula: '1225383', rank: 'SD', fullName: 'ANDRE LUIZ SILVA CARVALHO' },
  { id: '88', warName: 'J. MUNIZ', matricula: '1226681', rank: 'SD', fullName: 'JOCIVAN MUNIZ DE SOUSA' },
  { id: '89', warName: 'MARTINS', matricula: '1237578', rank: 'SD', fullName: 'JAKSON JOSÉ MARTINS RODRIGUES' },
  { id: '90', warName: 'MADEIRA', matricula: '1239040', rank: 'SD', fullName: 'CLEITON CARLOS MADEIRA' },
  { id: '91', warName: 'COELHO', matricula: '1240030', rank: 'SD', fullName: 'WILDEMBERG REGIS COELHO' },
  { id: '92', warName: 'GIVALDO JÚNIOR', matricula: '1240250', rank: 'SD', fullName: 'GIVALDO ALVES DOS SANTOS JUNIOR' },
  { id: '93', warName: 'PIMENTEL', matricula: '1240374', rank: 'SD', fullName: 'FILLIPE PIMENTEL DA PAIXAO' },
  { id: '94', warName: 'NETO', matricula: '1242008', rank: 'SD', fullName: 'PEDRO PILE DA SILVA NETO' },
  { id: '95', warName: 'S. NOGUEIRA', matricula: '1241362', rank: 'SD', fullName: 'SANDERSON SANTOS NOGUEIRA' },
  { id: '96', warName: 'ALVES', matricula: '1242822', rank: 'SD', fullName: 'FELIPE AMORIM ALVES' },
  { id: '97', warName: 'STENIO', matricula: '1251970', rank: 'SD', fullName: 'STENIO SAMPAIO DA SILVA' },
  { id: '98', warName: 'GUTEMBERG', matricula: '1252038', rank: 'SD', fullName: 'GUTEMBERG FERREIRA DA SILVA' },
  { id: '99', warName: 'GUSTAVO FERREIRA', matricula: '1252135', rank: 'SD', fullName: 'LUIZ GUSTAVO DOS SANTOS FERREIRA' },
  { id: '100', warName: 'MARLLON', matricula: '1252143', rank: 'SD', fullName: 'MARLLON ALEKSANDER FONSECA ESPÍRITO SANTO' },
  { id: '101', warName: 'LINS', matricula: '1252178', rank: 'SD', fullName: 'DAVI OLIVEIRA LINS DA SILVA' },
  { id: '102', warName: 'ELTON', matricula: '1252194', rank: 'SD', fullName: 'ELTON BARBOSA SANTOS' },
  { id: '103', warName: 'THUANY', matricula: '1252364', rank: 'SD', fullName: 'JAMILLE THUANY ALENCAR LEITE' },
  { id: '104', warName: 'SILVA', matricula: '1252712', rank: 'SD', fullName: 'WQUEVEN LUNA DA SILVA' },
  { id: '105', warName: 'PEDRO', matricula: '1252771', rank: 'SD', fullName: 'PEDRO HENRIQUE DA SILVA PINHEIRO' },
  { id: '106', warName: 'RICARDO NASCIMENTO', matricula: '1254073', rank: 'SD', fullName: 'RAFAEL RICARDO DE SOUSA NASCIMENTO' },
  { id: '107', warName: 'FRANCINETE', matricula: '1254251', rank: 'SD', fullName: 'ELANE FRANCINETE DE JESUS NOGUEIRA' },
  { id: '108', warName: 'DA SILVA', matricula: '1255851', rank: 'SD', fullName: 'EDIGLEDSON PEREIRA DA SILVA' },
  { id: '109', warName: 'R. PEREIRA', matricula: '1255967', rank: 'SD', fullName: 'RUAN PEREIRA BARBOSA' },
  { id: '110', warName: 'NATANAEL', matricula: '1256688', rank: 'SD', fullName: 'WESLEY NATANAEL DOS SANTOS SOUZA' },
  { id: '111', warName: 'MONTE SANTO', matricula: '1256947', rank: 'SD', fullName: 'MICAEL MARTINS MONTE SANTO' },
  { id: '112', warName: 'RUTH ALENCAR', matricula: '1289985', rank: 'SD', fullName: 'RUTH ELLEN CRUZ ALENCAR' },
  { id: '113', warName: 'DIOGENES', matricula: '1259180', rank: 'SD', fullName: 'THARLLES DIOGENES SANTANA LUCENA' },
  { id: '114', warName: 'MARIA', matricula: '1260901', rank: 'SD', fullName: 'MARIA IARA DE MORAIS ROSENDO' },
  { id: '115', warName: 'LEAL', matricula: '1261282', rank: 'SD', fullName: 'EVALDO LEAL FILHO' },
  { id: '116', warName: 'ELIEUZA LEAL', matricula: '1263846', rank: 'SD', fullName: 'ELIEUZA LEAL LIMA' },
  { id: '117', warName: 'RIOMAR', matricula: '320536', rank: '2º SGT', fullName: 'RIOMAR' },
  { id: '118', warName: 'CARLOS', matricula: '1090534', rank: '3º SGT', fullName: 'CARLOS ANTONIO NOVAES PEREIRA' },
  { id: '119', warName: 'ALEXANDRO', matricula: '1047752', rank: '2º SGT', fullName: 'ALEXANDRO' },
  { id: '120', warName: 'TERTO', matricula: '1218360', rank: 'SD', fullName: 'TERTO' },
  { id: '121', warName: 'WESLEY LEITE', matricula: '1206770', rank: 'SD', fullName: 'JOSÉ WESLEY ARAUJO LEITE' }
];

const INITIAL_TYPES: OccurrenceType[] = [
  { id: '1', name: 'CONFECÇÃO BOLETIM DE OCORRÊNCIA', points: 400 },
  { id: '2', name: 'ENCAMINHAMENTO (INQUÉRITO/ DESP.)', points: 500 },
  { id: '3', name: 'APFD (Auto de Prisão em Flagrante Delito)', points: 3000 },
  { id: '4', name: 'ALCOOLEMIA', points: 2000 },
  { id: '5', name: 'PRISÕES TCO/ BOC', points: 2500 },
  { id: '6', name: 'PRISÃO EM FLAGRANTE DE HOMICIDA', points: 20000 },
  { id: '7', name: 'PRISÃO EM FLAGRANTE DE ASSALTANTE', points: 15000 },
  { id: '8', name: 'TCO POR ARMA BRANCA', points: 3000 },
  { id: '9', name: 'PONTO DEBELADO', points: 1500 },
  { id: '10', name: 'ENTORP ATÉ 500G', points: 500 },
  { id: '11', name: 'ENTORP ENTRE 500G E 1KG', points: 10000 },
  { id: '12', name: 'ENTORP ACIMA 1KG', points: 15000 },
  { id: '13', name: 'ARMA ARTESANAL', points: 10000 },
  { id: '14', name: 'ARMA INDUSTRIAL', points: 20000 },
  { id: '15', name: 'ARMA BRANCA/ SIMULACRO', points: 500 },
  { id: '16', name: 'CELULAR ADULTERADO/ ANATEL', points: 500 },
  { id: '17', name: 'CELULAR QUEIXADO POLÍCIA ÁGIL', points: 6000 },
  { id: '18', name: 'MUNIÇÕES (POR UNIDADE)', points: 200 },
  { id: '19', name: 'VEÍCULO FURT/ ROUB/ CLONADO RECUP', points: 6000 },
  { id: '20', name: 'MANDADO DE PRISÃO CRIMINAL', points: 12000 },
  { id: '21', name: 'MANDADO DE PRISÃO CIVIL', points: 2000 },
  { id: '22', name: 'CADASTRO NO PROGRAMA PROTEGER', points: 500 },
  { id: '23', name: 'MACONHA ROÇA (ACIMA DE 3.000 PÉS)', points: 5000 },
  { id: '24', name: 'BÔNUS JPS', points: 7000 },
  { id: '25', name: 'OCORRÊNCIAS RELEVANTES (CMDO)', points: 5000 },
  { id: '26', name: 'APREENSÕES EM BARES OU MOTOCICLETAS', points: 3000 },
  { id: '27', name: 'NOTIFICAÇÕES DE TRÂNSITO', points: 100 },
  { id: '28', name: 'CVLI NA ÁREA (Depreciação)', points: -500 },
  { id: '29', name: 'TENTATIVA CVLI NA ÁREA (Depreciação)', points: -250 },
];

const DEFAULT_ADMIN: User = {
  id: 'super-admin-001',
  username: 'elwyn.gomes',
  password: 'Jmanu2108',
  name: 'Elwyn Gomes (ADM)',
  role: 'admin'
};

export const PoliceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // --- Data State ---
  const [officers, setOfficers] = useState<Officer[]>(() => {
    const saved = localStorage.getItem('cipm_officers');
    if (!saved) return INITIAL_OFFICERS;
    const parsed = JSON.parse(saved);
    if (parsed.length < 5) return INITIAL_OFFICERS;
    return parsed;
  });

  const [occurrenceTypes, setOccurrenceTypes] = useState<OccurrenceType[]>(() => {
    const saved = localStorage.getItem('cipm_types');
    if (!saved) return INITIAL_TYPES;
    const parsed = JSON.parse(saved);
    if (parsed.length < 20) return INITIAL_TYPES;
    return parsed;
  });

  const [logs, setLogs] = useState<OccurrenceLog[]>(() => {
    const saved = localStorage.getItem('cipm_logs');
    return saved ? JSON.parse(saved) : [];
  });

  // --- Auth & Users State ---
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('cipm_users');
    if (!saved) {
      return [DEFAULT_ADMIN];
    }
    const parsed = JSON.parse(saved);
    // Ensure default admin always exists
    if (!parsed.find((u: User) => u.username === DEFAULT_ADMIN.username)) {
      return [...parsed, DEFAULT_ADMIN];
    }
    return parsed;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('cipm_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [contestations, setContestations] = useState<Contestation[]>(() => {
    const saved = localStorage.getItem('cipm_contestations');
    return saved ? JSON.parse(saved) : [];
  });

  // --- Persist Data ---
  useEffect(() => localStorage.setItem('cipm_officers', JSON.stringify(officers)), [officers]);
  useEffect(() => localStorage.setItem('cipm_types', JSON.stringify(occurrenceTypes)), [occurrenceTypes]);
  useEffect(() => localStorage.setItem('cipm_logs', JSON.stringify(logs)), [logs]);
  useEffect(() => localStorage.setItem('cipm_users', JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem('cipm_contestations', JSON.stringify(contestations)), [contestations]);
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('cipm_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('cipm_current_user');
    }
  }, [currentUser]);

  // --- CRUD Officers ---
  const addOfficer = (data: Omit<Officer, 'id'>) => {
    const newOfficer = { ...data, id: crypto.randomUUID() };
    setOfficers(prev => [...prev, newOfficer]);
  };

  const deleteOfficer = (id: string) => {
    setOfficers(prev => prev.filter(o => o.id !== id));
    setLogs(prev => prev.filter(l => l.officerId !== id));
  };

  // --- CRUD Types ---
  const addOccurrenceType = (data: Omit<OccurrenceType, 'id'>) => {
    const newType = { ...data, id: crypto.randomUUID() };
    setOccurrenceTypes(prev => [...prev, newType]);
  };

  const deleteOccurrenceType = (id: string) => {
    setOccurrenceTypes(prev => prev.filter(t => t.id !== id));
  };

  // --- CRUD Logs ---
  const addLog = (officerId: string, typeId: string, date: string, boeNumber: string, multiplicationFactor?: number) => {
    const newLog: OccurrenceLog = {
      id: crypto.randomUUID(),
      officerId,
      typeId,
      date: date,
      timestamp: Date.now(),
      boeNumber: boeNumber,
      multiplicationFactor: multiplicationFactor || 1
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const updateLog = (id: string, updates: Partial<Omit<OccurrenceLog, 'id' | 'timestamp'>>) => {
    setLogs(prev => prev.map(log => 
      log.id === id ? { ...log, ...updates } : log
    ));
  };

  const deleteLog = (id: string) => {
    setLogs(prev => prev.filter(l => l.id !== id));
  };

  // --- Auth Actions ---
  const login = (username: string, pass: string): boolean => {
    const found = users.find(u => u.username === username && u.password === pass);
    if (found) {
      setCurrentUser(found);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser = { ...userData, id: crypto.randomUUID() };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = (id: string, updates: Partial<Omit<User, 'id'>>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    
    // Update current session if the updated user is the one logged in
    if (currentUser && currentUser.id === id) {
      setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const deleteUser = (id: string) => {
    // Prevent deleting self or the hardcoded admin if we wanted to enforce strictness, 
    // but simply preventing deleting the last admin is usually good practice.
    // For now, just delete.
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  // --- Contestation Actions ---
  const addContestation = (data: Omit<Contestation, 'id' | 'createdAt' | 'status'>) => {
    const newContestation: Contestation = {
      ...data,
      id: crypto.randomUUID(),
      status: 'pending',
      createdAt: Date.now()
    };
    setContestations(prev => [newContestation, ...prev]);
  };

  const resolveContestation = (id: string, status: 'approved' | 'rejected', adminResponse?: string) => {
    const contestation = contestations.find(c => c.id === id);
    if (!contestation) return;

    // Note: Since contestations are now free-text, we DO NOT automatically delete logs.
    // The admin must manually fix the records in the "Registro" tab if needed.
    
    setContestations(prev => prev.map(c => 
      c.id === id ? { ...c, status, adminResponse, resolvedAt: Date.now() } : c
    ));
  };

  // --- Ranking Logic ---
  const getRanking = (startDate?: string, endDate?: string): OfficerRanking[] => {
    type RankingMapValue = OfficerRanking & { boeSet: Set<string> };
    const rankingMap = new Map<string, RankingMapValue>();

    officers.forEach(officer => {
      rankingMap.set(officer.id, { 
        ...officer, 
        totalPoints: 0, 
        occurrencesCount: 0, 
        boeNumbers: [],
        boeSet: new Set() 
      });
    });

    logs.forEach(log => {
      if (startDate && log.date < startDate) return;
      if (endDate && log.date > endDate) return;

      const officer = rankingMap.get(log.officerId);
      const type = occurrenceTypes.find(t => t.id === log.typeId);

      if (officer && type) {
        const factor = log.multiplicationFactor ?? 1;
        officer.totalPoints += (type.points * factor);
        officer.occurrencesCount += 1;
        if (log.boeNumber) {
          officer.boeSet.add(log.boeNumber);
        }
      }
    });

    return Array.from(rankingMap.values()).map(o => ({
      ...o,
      boeNumbers: Array.from(o.boeSet)
    })).sort((a, b) => b.totalPoints - a.totalPoints);
  };

  return (
    <PoliceContext.Provider value={{
      officers,
      occurrenceTypes,
      logs,
      users,
      contestations,
      currentUser,
      addOfficer,
      deleteOfficer,
      addOccurrenceType,
      deleteOccurrenceType,
      addLog,
      updateLog,
      deleteLog,
      login,
      logout,
      addUser,
      updateUser,
      deleteUser,
      addContestation,
      resolveContestation,
      getRanking
    }}>
      {children}
    </PoliceContext.Provider>
  );
};

export const usePoliceData = () => {
  const context = useContext(PoliceContext);
  if (!context) {
    throw new Error('usePoliceData must be used within a PoliceProvider');
  }
  return context;
};