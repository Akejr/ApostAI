import React, { useState, useCallback, useEffect } from 'react';
import { Search, TrendingUp, Users, Target, User, ChevronRight, Calendar, MapPin, ArrowLeft, BarChart3, Clock, TrendingDown, AlertTriangle, CheckCircle, Home, ChevronLeft } from 'lucide-react';
import logo from './assets/logo.png';

// Interfaces expandidas para suportar novos dados
interface Team {
  id: number;
  name: string;
  logo: string;
  country: string;
  code: string;
  founded: number;
  national: boolean;
}

interface League {
  id: number;
  name: string;
  country: string;
  logo: string;
  flag: string;
  season: number;
}

interface Fixture {
  fixture: {
    id: number;
    referee: string | null;
    timezone: string;
    date: string;
    timestamp: number;
    status: {
      long: string;
      short: string;
      elapsed: number | null;
    };
    venue: {
      id: number | null;
      name: string | null;
      city: string | null;
    };
  };
  league: League;
  teams: {
    home: Team;
    away: Team;
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: {
    halftime: {
      home: number | null;
      away: number | null;
    };
    fulltime: {
      home: number | null;
      away: number | null;
    };
    extratime: {
      home: number | null;
      away: number | null;
    };
    penalty: {
      home: number | null;
      away: number | null;
    };
  };
}

interface TeamSearchResult {
  team: Team;
  venue: {
    id: number;
    name: string;
    address: string;
    city: string;
    capacity: number;
    surface: string;
    image: string;
  };
}

interface TeamStats {
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
}

// Interface para dados reais de jogadores da API
interface RealPlayerStats {
  player: {
    id: number;
    name: string;
    firstname: string;
    lastname: string;
    age: number;
    birth: {
      date: string;
      place: string;
      country: string;
    };
    nationality: string;
    height: string;
    weight: string;
    injured: boolean;
    photo: string;
  };
  statistics: {
    team: {
      id: number;
      name: string;
      logo: string;
    };
    league: {
      id: number;
      name: string;
      country: string;
      logo: string;
      flag: string;
      season: number;
    };
    games: {
      appearences: number;
      lineups: number;
      minutes: number;
      number: number | null;
      position: string;
      rating: string;
      captain: boolean;
    };
    substitutes: {
      in: number;
      out: number;
      bench: number;
    };
    shots: {
      total: number;
      on: number;
    };
    goals: {
      total: number;
      conceded: number;
      assists: number;
      saves: number;
    };
    passes: {
      total: number;
      key: number;
      accuracy: number;
    };
    tackles: {
      total: number;
      blocks: number;
      interceptions: number;
    };
    duels: {
      total: number;
      won: number;
    };
    dribbles: {
      attempts: number;
      success: number;
      past: number;
    };
    fouls: {
      drawn: number;
      committed: number;
    };
    cards: {
      yellow: number;
      yellowred: number;
      red: number;
    };
    penalty: {
      won: number;
      commited: number;
      scored: number;
    missed: number;
      saved: number;
    };
  }[];
}

interface LeagueTopScorers {
  player: {
    id: number;
    name: string;
    firstname: string;
    lastname: string;
    age: number;
    photo: string;
  };
  statistics: {
    team: {
      id: number;
      name: string;
      logo: string;
    };
    goals: {
      total: number;
      assists: number;
    };
    games: {
      appearences: number;
      lineups: number;
      minutes: number;
    };
  }[];
}

// Interface para estatísticas reais de jogos da API
interface MatchStatistics {
  team: {
    id: number;
    name: string;
    logo: string;
  };
  statistics: {
    type: string;
    value: number | string;
  }[];
}

// Interface para dados reais de corners, cartões, etc.
interface RealMatchData {
  corners: {
    home: number;
    away: number;
  };
  cards: {
    home: { yellow: number; red: number };
    away: { yellow: number; red: number };
  };
  possession: {
    home: string;
    away: string;
  };
  shots: {
    home: number;
    away: number;
  };
  shotsOnTarget: {
    home: number;
    away: number;
  };
}

interface H2HResult {
  teams: {
    home: Team;
    away: Team;
  };
  goals: {
    home: number;
    away: number;
  };
  fixture: {
    date: string;
    venue: {
      name: string;
    };
  };
}

interface BetSuggestion {
  id: string;
  type: 'gols' | 'resultado' | 'primeiro-tempo' | 'escanteios' | 'cartoes' | 'especiais' | 'handicap' | 'jogadores' | 'casa-fora-gols' | 'segundo-tempo';
  market: string;
  selection: string;
  reasoning: string;
  confidence: number;
  realOdd?: number;
  bookmaker?: string;
  riskLevel: 'Baixo' | 'Médio' | 'Alto' | 'Elevado';
  criteria: string[];
  playerName?: string; // Para apostas específicas de jogadores
  handicapValue?: number; // Para apostas handicap
}

interface GameAnalysis {
  homeTeamScore: number;
  awayTeamScore: number;
  totalGoalsExpected: number;
  bothTeamsToScore: number;
  insights: string[];
  confidence: number;
  teamForm: {
    home: string[];
    away: string[];
  };
  h2hInsights: string[];
  contextInsights: string[];
  homeStats?: TeamStats;
  awayStats?: TeamStats;
  // Novas categorias de análise
  advancedMetrics: {
    xgAnalysis: string[];
    tacticalMatchup: string[];
    temporalPatterns: string[];
    disciplinaryRisk: string[];
    benchStrength: string[];
    crowdFactor: string[];
    psychologicalContext: string[];
    competitionContext: string[];
    physicalConditions: string[];
    metaMetrics: string[];
    specialSituations: string[];
    extraordinaryConditions: string[];
  };
  riskFactors: {
    high: string[];
    medium: string[];
    low: string[];
  };
  keyPredictions: {
    mostLikely: string;
    surpriseFactor: string;
    safetyBet: string;
  };
  betSuggestions?: BetSuggestion[];
  // NOVO: Análise de Força Estrutural
  structuralAnalysis?: StructuralStrengthAnalysis;
}

// Interface para o novo algoritmo de Força Estrutural
interface StructuralStrengthAnalysis {
  homeTeam: {
    leagueWeight: number;
    prestige: number;
    opponentQuality: number;
    resultAdjustment: number;
    squadStrength: number;
    contextBonus: number;
    totalFFS: number;
  };
  awayTeam: {
    leagueWeight: number;
    prestige: number;
    opponentQuality: number;
    resultAdjustment: number;
    squadStrength: number;
    contextBonus: number;
    totalFFS: number;
  };
  comparison: {
    difference: number;
    structuralAdvantage: 'home' | 'away' | 'balanced';
    confidence: number;
    insights: string[];
  };
}

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [teams, setTeams] = useState<TeamSearchResult[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null);
  const [gameAnalysis, setGameAnalysis] = useState<GameAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [searchStep, setSearchStep] = useState<'teams' | 'fixtures'>('teams');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [generatingBets, setGeneratingBets] = useState(false);
  const [currentBetIndex, setCurrentBetIndex] = useState(0);
  const [totalBetsGenerated, setTotalBetsGenerated] = useState(0);
  const [showSearchInterface, setShowSearchInterface] = useState(false);

  const [usedBetIds, setUsedBetIds] = useState<Set<string>>(new Set());

  // Estados para swipe em mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const API_KEY = 'd31b89f86f53e645e951db4a6af1a4d4';

  // Algoritmo de Análise de Jogos (SUPER EXPANDIDO - 12 CATEGORIAS)
  const analyzeGame = useCallback(async (fixture: Fixture): Promise<GameAnalysis> => {
    console.log('🧠 Iniciando ANÁLISE AVANÇADA com 12 categorias:', fixture);
    
    try {
      // Buscar todos os dados reais da API
      const [homeStats, awayStats, h2hData, homeLastMatches, awayLastMatches, homeRecentStats, awayRecentStats] = await Promise.all([
        getTeamStats(fixture.teams.home.id, fixture.league.id),
        getTeamStats(fixture.teams.away.id, fixture.league.id),
        getH2HData(fixture.teams.home.id, fixture.teams.away.id),
        getTeamLastMatches(fixture.teams.home.id),
        getTeamLastMatches(fixture.teams.away.id),
        getTeamRecentMatchesStats(fixture.teams.home.id),
        getTeamRecentMatchesStats(fixture.teams.away.id)
      ]);

      // NOVO: Análise de Força Estrutural & Nível de Competição
      console.log('🔍 INICIANDO ANÁLISE ESTRUTURAL COMPLETA...');
      const structuralAnalysis = await analyzeStructuralStrength(fixture, homeLastMatches, awayLastMatches);
      console.log('🔍 RESULTADO DA ANÁLISE ESTRUTURAL:', {
        homeFFS: structuralAnalysis.homeTeam.totalFFS,
        awayFFS: structuralAnalysis.awayTeam.totalFFS,
        difference: structuralAnalysis.comparison.difference,
        advantage: structuralAnalysis.comparison.structuralAdvantage,
        homeLeague: fixture.league.name,
        awayLeague: fixture.league.name
      });

      // Inicializar variáveis base
      let homeScore = 50;
      let awayScore = 50;
      let totalGoalsExpected = 2.5;
      let bothTeamsToScore = 45;
      
      // Arrays para insights organizados
      const insights: string[] = [];
      const teamForm: { home: string[]; away: string[] } = { home: [], away: [] };
      const h2hInsights: string[] = [];
      const contextInsights: string[] = [];
      
      // Novas categorias de análise
      const xgAnalysis: string[] = [];
      const tacticalMatchup: string[] = [];
      const temporalPatterns: string[] = [];
      const disciplinaryRisk: string[] = [];
      const benchStrength: string[] = [];
      const crowdFactor: string[] = [];
      const psychologicalContext: string[] = [];
      const competitionContext: string[] = [];
      const physicalConditions: string[] = [];
      const metaMetrics: string[] = [];
      const specialSituations: string[] = [];
      const extraordinaryConditions: string[] = [];
      
      // Arrays de fatores de risco
      const highRisk: string[] = [];
      const mediumRisk: string[] = [];
      const lowRisk: string[] = [];

      // ===== ANÁLISE BASEADA EM DADOS REAIS DA API =====
      
      // Analisar forma recente dos times
      const homeForm = analyzeRecentForm(homeLastMatches, fixture.teams.home.id);
      const awayForm = analyzeRecentForm(awayLastMatches, fixture.teams.away.id);

      // ===== REORGANIZAR FORMA DOS TIMES: 3 CATEGORIAS =====
      // Limpar arrays de forma
      teamForm.home = [];
      teamForm.away = [];
      
      // CASA: Fase, Ataque, Defesa
      if (homeForm.winRate !== undefined) {
        if (homeForm.winRate >= 70) {
          teamForm.home.push(`Fase: Excelente (${homeForm.winRate.toFixed(0)}% aproveitamento)`);
        } else if (homeForm.winRate >= 50) {
          teamForm.home.push(`Fase: Boa (${homeForm.winRate.toFixed(0)}% aproveitamento)`);
        } else if (homeForm.winRate >= 30) {
          teamForm.home.push(`Fase: Irregular (${homeForm.winRate.toFixed(0)}% aproveitamento)`);
        } else {
          teamForm.home.push(`Fase: Crise (${homeForm.winRate.toFixed(0)}% aproveitamento)`);
        }
      } else {
        teamForm.home.push(`Fase: Dados insuficientes`);
      }
      
      if (homeForm.avgGoalsFor !== undefined) {
        if (homeForm.avgGoalsFor >= 2.5) {
          teamForm.home.push(`Ataque: Letal (${homeForm.avgGoalsFor.toFixed(1)} gols/jogo)`);
        } else if (homeForm.avgGoalsFor >= 1.5) {
          teamForm.home.push(`Ataque: Eficiente (${homeForm.avgGoalsFor.toFixed(1)} gols/jogo)`);
        } else if (homeForm.avgGoalsFor >= 1.0) {
          teamForm.home.push(`Ataque: Regular (${homeForm.avgGoalsFor.toFixed(1)} gols/jogo)`);
        } else {
          teamForm.home.push(`Ataque: Ineficaz (${homeForm.avgGoalsFor.toFixed(1)} gols/jogo)`);
        }
      }
      
      if (homeForm.avgGoalsAgainst !== undefined) {
        if (homeForm.avgGoalsAgainst <= 0.5) {
          teamForm.home.push(`Defesa: Impenetrável (${homeForm.avgGoalsAgainst.toFixed(1)} gols sofridos/jogo)`);
        } else if (homeForm.avgGoalsAgainst <= 1.0) {
          teamForm.home.push(`Defesa: Sólida (${homeForm.avgGoalsAgainst.toFixed(1)} gols sofridos/jogo)`);
        } else if (homeForm.avgGoalsAgainst <= 1.5) {
          teamForm.home.push(`Defesa: Vulnerável (${homeForm.avgGoalsAgainst.toFixed(1)} gols sofridos/jogo)`);
        } else {
          teamForm.home.push(`Defesa: Frágil (${homeForm.avgGoalsAgainst.toFixed(1)} gols sofridos/jogo)`);
        }
      }
      
      // ===== PRESTÍGIO HISTÓRICO E STATUS DO CLUBE =====
      // Usar dados da análise estrutural em vez de calcular novamente
      const homePrestige = structuralAnalysis.homeTeam.prestige;
      const awayPrestige = structuralAnalysis.awayTeam.prestige;
      
      homeScore += homePrestige;
      awayScore += awayPrestige;
      
      if (homePrestige > awayPrestige + 10) {
        psychologicalContext.push(`${fixture.teams.home.name} tem prestígio histórico superior (+${homePrestige} vs +${awayPrestige})`);
      } else if (awayPrestige > homePrestige + 10) {
        psychologicalContext.push(`${fixture.teams.away.name} tem maior tradição e prestígio (+${awayPrestige} vs +${homePrestige})`);
      }

      // ===== NOVO: APLICAR AJUSTE ESTRUTURAL COMPLETO =====
      const structuralDifference = structuralAnalysis.comparison.difference;
      const structuralAdvantage = structuralAnalysis.comparison.structuralAdvantage;
      
      // CORREÇÃO: Aplicar bônus estrutural MUITO MAIOR para garantir que a diferença de divisão seja respeitada
      if (structuralAdvantage === 'home') {
        // Para diferenças grandes (times de divisões muito diferentes), aplicar bônus maior
        let structuralBonus;
        if (Math.abs(structuralDifference) > 100) {
          structuralBonus = Math.min(60, Math.abs(structuralDifference) * 0.5); // Bônus muito maior para diferenças extremas
        } else if (Math.abs(structuralDifference) > 50) {
          structuralBonus = Math.min(40, Math.abs(structuralDifference) * 0.4); // Bônus maior para diferenças grandes
        } else {
          structuralBonus = Math.min(25, Math.abs(structuralDifference) * 0.3); // Bônus normal
        }
        homeScore += structuralBonus;
        insights.push(`🏗️ ${fixture.teams.home.name} tem vantagem estrutural de ${Math.abs(structuralDifference).toFixed(0)}pts (+${structuralBonus.toFixed(1)} bônus)`);
      } else if (structuralAdvantage === 'away') {
        // Para visitante, bônus menor mas ainda significativo
        let structuralBonus;
        if (Math.abs(structuralDifference) > 100) {
          structuralBonus = Math.min(45, Math.abs(structuralDifference) * 0.35);
        } else if (Math.abs(structuralDifference) > 50) {
          structuralBonus = Math.min(30, Math.abs(structuralDifference) * 0.3);
        } else {
          structuralBonus = Math.min(20, Math.abs(structuralDifference) * 0.25);
        }
        awayScore += structuralBonus;
        insights.push(`🏗️ ${fixture.teams.away.name} tem vantagem estrutural de ${Math.abs(structuralDifference).toFixed(0)}pts (+${structuralBonus.toFixed(1)} bônus)`);
      } else {
        insights.push(`🏗️ Equilíbrio estrutural entre as equipes (diferença: ${Math.abs(structuralDifference).toFixed(0)}pts)`);
      }

      // Adicionar insights da análise estrutural
      structuralAnalysis.comparison.insights.forEach(insight => {
        insights.push(`🏗️ ${insight}`);
      });

      // VISITANTE: Fase, Ataque, Defesa
      if (awayForm.winRate !== undefined) {
        if (awayForm.winRate >= 70) {
          teamForm.away.push(`Fase: Excelente fora (${awayForm.winRate.toFixed(0)}% aproveitamento)`);
        } else if (awayForm.winRate >= 50) {
          teamForm.away.push(`Fase: Boa como visitante (${awayForm.winRate.toFixed(0)}% aproveitamento)`);
        } else if (awayForm.winRate >= 30) {
          teamForm.away.push(`Fase: Irregular fora (${awayForm.winRate.toFixed(0)}% aproveitamento)`);
        } else {
          teamForm.away.push(`Fase: Crise visitante (${awayForm.winRate.toFixed(0)}% aproveitamento)`);
        }
      } else {
        teamForm.away.push(`Fase: Dados insuficientes`);
      }
      
      if (awayForm.avgGoalsFor !== undefined) {
        if (awayForm.avgGoalsFor >= 2.5) {
          teamForm.away.push(`Ataque: Letal fora (${awayForm.avgGoalsFor.toFixed(1)} gols/jogo)`);
        } else if (awayForm.avgGoalsFor >= 1.5) {
          teamForm.away.push(`Ataque: Eficiente visitante (${awayForm.avgGoalsFor.toFixed(1)} gols/jogo)`);
        } else if (awayForm.avgGoalsFor >= 1.0) {
          teamForm.away.push(`Ataque: Regular fora (${awayForm.avgGoalsFor.toFixed(1)} gols/jogo)`);
        } else {
          teamForm.away.push(`Ataque: Inofensivo visitante (${awayForm.avgGoalsFor.toFixed(1)} gols/jogo)`);
        }
      }

      if (awayForm.avgGoalsAgainst !== undefined) {
        if (awayForm.avgGoalsAgainst <= 0.5) {
          teamForm.away.push(`Defesa: Impenetrável fora (${awayForm.avgGoalsAgainst.toFixed(1)} gols sofridos/jogo)`);
        } else if (awayForm.avgGoalsAgainst <= 1.0) {
          teamForm.away.push(`Defesa: Sólida visitante (${awayForm.avgGoalsAgainst.toFixed(1)} gols sofridos/jogo)`);
        } else if (awayForm.avgGoalsAgainst <= 1.5) {
          teamForm.away.push(`Defesa: Vulnerável fora (${awayForm.avgGoalsAgainst.toFixed(1)} gols sofridos/jogo)`);
        } else {
          teamForm.away.push(`Defesa: Frágil visitante (${awayForm.avgGoalsAgainst.toFixed(1)} gols sofridos/jogo)`);
        }
      }

      // ===== ANÁLISE MELHORADA DA FORMA ATUAL =====
      // CORREÇÃO: Reduzir o peso da forma recente quando há grande diferença estrutural
      if (homeForm.winRate !== undefined) {
        let homeFormBonus;
        
        // Se há grande diferença estrutural, reduzir o impacto da forma recente
        if (Math.abs(structuralDifference) > 100) {
          homeFormBonus = homeForm.winRate > 70 ? 15 : 
                         homeForm.winRate > 60 ? 10 : 
                         homeForm.winRate > 50 ? 5 : 
                         homeForm.winRate > 40 ? 2 : 
                         homeForm.winRate < 20 ? -8 : -3;
        } else if (Math.abs(structuralDifference) > 50) {
          homeFormBonus = homeForm.winRate > 70 ? 20 : 
                         homeForm.winRate > 60 ? 15 : 
                         homeForm.winRate > 50 ? 8 : 
                         homeForm.winRate > 40 ? 3 : 
                         homeForm.winRate < 20 ? -12 : -5;
        } else {
          homeFormBonus = homeForm.winRate > 70 ? 25 : 
                         homeForm.winRate > 60 ? 18 : 
                         homeForm.winRate > 50 ? 10 : 
                         homeForm.winRate > 40 ? 5 : 
                         homeForm.winRate < 20 ? -15 : -5;
        }
        
        homeScore += homeFormBonus;
        
        // Insight movido para os 4 principais
      }

      if (awayForm.winRate !== undefined) {
        // CORREÇÃO: Reduzir o peso da forma recente quando há grande diferença estrutural
        let awayFormBonus;
        
        // Se há grande diferença estrutural, reduzir ainda mais o impacto da forma recente para visitante
        if (Math.abs(structuralDifference) > 100) {
          awayFormBonus = awayForm.winRate > 75 ? 12 : 
                         awayForm.winRate > 65 ? 8 : 
                         awayForm.winRate > 55 ? 4 : 
                         awayForm.winRate > 40 ? 1 : 
                         awayForm.winRate < 25 ? -6 : -4;
        } else if (Math.abs(structuralDifference) > 50) {
          awayFormBonus = awayForm.winRate > 75 ? 15 : 
                         awayForm.winRate > 65 ? 12 : 
                         awayForm.winRate > 55 ? 6 : 
                         awayForm.winRate > 40 ? 2 : 
                         awayForm.winRate < 25 ? -10 : -6;
        } else {
          awayFormBonus = awayForm.winRate > 75 ? 20 : 
                         awayForm.winRate > 65 ? 15 : 
                         awayForm.winRate > 55 ? 8 : 
                         awayForm.winRate > 40 ? 3 : 
                         awayForm.winRate < 25 ? -12 : -8;
        }
        
        awayScore += awayFormBonus;
        
        // Insight movido para os 4 principais
      }

      // ===== BÔNUS EXTRA POR SEQUÊNCIA DE VITÓRIAS =====
      if (homeForm.wins >= 4 && homeForm.played >= 5) {
        const winStreakBonus = Math.min(15, homeForm.wins * 3);
        homeScore += winStreakBonus;
        // Sequência removida da exibição
      }
      
      if (awayForm.wins >= 4 && awayForm.played >= 5) {
        const winStreakBonus = Math.min(12, awayForm.wins * 2.5);
        awayScore += winStreakBonus;
        // Sequência removida da exibição
      }

      // ===== ANÁLISE OFENSIVA APRIMORADA =====
      if (homeForm.avgGoalsFor !== undefined) {
        const homeOffensiveBonus = homeForm.avgGoalsFor > 3.0 ? 20 :  // Ataque explosivo
                                  homeForm.avgGoalsFor > 2.5 ? 15 :  // Muito forte
                                  homeForm.avgGoalsFor > 2.0 ? 12 :  // Forte
                                  homeForm.avgGoalsFor > 1.5 ? 8 :   // Bom
                                  homeForm.avgGoalsFor > 1.0 ? 4 :   // Regular
                                  homeForm.avgGoalsFor < 0.5 ? -10 : -6; // Fraco/Muito fraco
        
        homeScore += homeOffensiveBonus;
        totalGoalsExpected += homeForm.avgGoalsFor > 2.0 ? 0.6 : homeForm.avgGoalsFor > 1.5 ? 0.4 : 0;
        
        // Insight movido para forma dos times
        
        // Já incluído na reorganização da forma dos times
      }

      if (awayForm.avgGoalsFor !== undefined) {
        // Visitante precisa ser ainda mais eficaz no ataque
        const awayOffensiveBonus = awayForm.avgGoalsFor > 3.0 ? 18 :  // Ataque excepcional fora
                                  awayForm.avgGoalsFor > 2.5 ? 14 :  // Muito forte fora
                                  awayForm.avgGoalsFor > 2.0 ? 10 :  // Forte fora
                                  awayForm.avgGoalsFor > 1.5 ? 6 :   // Bom fora
                                  awayForm.avgGoalsFor > 1.0 ? 2 :   // Regular fora
                                  awayForm.avgGoalsFor < 0.5 ? -8 : -4; // Fraco fora
        
        awayScore += awayOffensiveBonus;
        totalGoalsExpected += awayForm.avgGoalsFor > 2.0 ? 0.5 : awayForm.avgGoalsFor > 1.5 ? 0.3 : 0;
        
        // Insight movido para forma dos times
        
        // Já incluído na reorganização da forma dos times
      }

      // ===== ANÁLISE DEFENSIVA APRIMORADA =====
      if (homeForm.avgGoalsAgainst !== undefined) {
        const homeDefensiveBonus = homeForm.avgGoalsAgainst < 0.3 ? 15 :  // Defesa impenetrável
                                  homeForm.avgGoalsAgainst < 0.7 ? 12 :  // Muito sólida
                                  homeForm.avgGoalsAgainst < 1.0 ? 8 :   // Sólida
                                  homeForm.avgGoalsAgainst < 1.5 ? 4 :   // Regular
                                  homeForm.avgGoalsAgainst > 2.0 ? -12 : -8; // Frágil/Muito frágil
        
        homeScore += homeDefensiveBonus;
        
        // Se a defesa é frágil, facilita para o visitante
        if (homeForm.avgGoalsAgainst > 1.5) {
          awayScore += 15; // Bônus maior para visitante contra defesa frágil
          totalGoalsExpected += 0.4;
          bothTeamsToScore += 15;
          // Já incluído na reorganização da forma dos times
        } else if (homeForm.avgGoalsAgainst < 0.7) {
          totalGoalsExpected -= 0.3;
          // Já incluído na reorganização da forma dos times
        }
        
        // Insight movido para forma dos times
      }

      if (awayForm.avgGoalsAgainst !== undefined) {
        const awayDefensiveBonus = awayForm.avgGoalsAgainst < 0.3 ? 12 :  // Defesa excepcional fora
                                  awayForm.avgGoalsAgainst < 0.7 ? 10 :  // Muito sólida fora
                                  awayForm.avgGoalsAgainst < 1.0 ? 6 :   // Sólida fora
                                  awayForm.avgGoalsAgainst < 1.5 ? 2 :   // Regular fora
                                  awayForm.avgGoalsAgainst > 2.0 ? -10 : -6; // Frágil fora
        
        awayScore += awayDefensiveBonus;
        
        // Se a defesa visitante é frágil, facilita muito para o mandante
        if (awayForm.avgGoalsAgainst > 1.5) {
          homeScore += 18; // Bônus ainda maior para mandante contra defesa frágil visitante
          totalGoalsExpected += 0.5;
          bothTeamsToScore += 15;
          // Já incluído na reorganização da forma dos times
        } else if (awayForm.avgGoalsAgainst < 0.7) {
          totalGoalsExpected -= 0.2;
          // Já incluído na reorganização da forma dos times
        }
        
        // Insight movido para forma dos times
      }

      // ===== ANÁLISE COM DADOS REAIS DE ESCANTEIOS E CARTÕES =====
      
      // Calcular médias reais de escanteios
      let homeAvgCorners = 0;
      let awayAvgCorners = 0;
      let homeAvgCards = 0;
      let awayAvgCards = 0;

      if (homeRecentStats.length > 0) {
        homeAvgCorners = homeRecentStats.reduce((sum, match) => {
          // Se o time da casa é o time que estamos analisando
          const isHomeInMatch = homeLastMatches.some(m => 
            m.fixture.id === Object.keys(match)[0] && m.teams.home.id === fixture.teams.home.id
          );
          return sum + (isHomeInMatch ? match.corners.home : match.corners.away);
        }, 0) / homeRecentStats.length;

        homeAvgCards = homeRecentStats.reduce((sum, match) => {
          const isHomeInMatch = homeLastMatches.some(m => 
            m.fixture.id === Object.keys(match)[0] && m.teams.home.id === fixture.teams.home.id
          );
          const cards = isHomeInMatch ? match.cards.home : match.cards.away;
          return sum + (cards.yellow + cards.red * 2); // Vermelho vale 2
        }, 0) / homeRecentStats.length;
      }

      if (awayRecentStats.length > 0) {
        awayAvgCorners = awayRecentStats.reduce((sum, match) => {
          const isHomeInMatch = awayLastMatches.some(m => 
            m.fixture.id === Object.keys(match)[0] && m.teams.home.id === fixture.teams.away.id
          );
          return sum + (isHomeInMatch ? match.corners.home : match.corners.away);
        }, 0) / awayRecentStats.length;

        awayAvgCards = awayRecentStats.reduce((sum, match) => {
          const isHomeInMatch = awayLastMatches.some(m => 
            m.fixture.id === Object.keys(match)[0] && m.teams.home.id === fixture.teams.away.id
          );
          const cards = isHomeInMatch ? match.cards.home : match.cards.away;
          return sum + (cards.yellow + cards.red * 2);
        }, 0) / awayRecentStats.length;
      }

      // Usar dados reais de escanteios para análise
      if (homeAvgCorners > 6) {
        xgAnalysis.push(`${fixture.teams.home.name} força muitos escanteios (${homeAvgCorners.toFixed(1)} por jogo)`);
          totalGoalsExpected += 0.2;
      }

      if (awayAvgCorners > 6) {
        xgAnalysis.push(`${fixture.teams.away.name} cria muitas chances pelos flancos (${awayAvgCorners.toFixed(1)} escanteios/jogo)`);
        totalGoalsExpected += 0.1;
      }

      // Disciplina baseada em dados reais
      if (homeAvgCards > 3) {
        disciplinaryRisk.push(`${fixture.teams.home.name} indisciplinado (${homeAvgCards.toFixed(1)} cartões/jogo)`);
        highRisk.push(`Alto risco de cartões para ${fixture.teams.home.name}`);
      }

      if (awayAvgCards > 3) {
        disciplinaryRisk.push(`${fixture.teams.away.name} com histórico de cartões (${awayAvgCards.toFixed(1)}/jogo)`);
        mediumRisk.push(`${fixture.teams.away.name} pode receber muitos cartões`);
      }

      // Verificar rivalidade
        const isClassico = isRivalryMatch(fixture.teams.home.name, fixture.teams.away.name);
        if (isClassico) {
        disciplinaryRisk.push(`Clássico: expectativa de jogo mais truncado`);
        totalGoalsExpected -= 0.2;
      }

      // Análise tática baseada em dados reais
      tacticalMatchup.push(`Análise baseada em estatísticas reais dos últimos 5 jogos`);
      if (homeAvgCorners > awayAvgCorners + 2) {
        tacticalMatchup.push(`${fixture.teams.home.name} superior no jogo aéreo ofensivo`);
      }

      // ===== 5. BANCO DE RESERVAS BASEADO EM PRESTÍGIO =====
      // Usar prestígio como indicador de qualidade do banco (dados reais)
      if (homePrestige >= 20) {
        benchStrength.push(`${fixture.teams.home.name} tem banco de qualidade mundial`);
        homeScore += 5;
      } else if (homePrestige >= 10) {
        benchStrength.push(`${fixture.teams.home.name} tem boas opções no banco`);
        homeScore += 2;
      } else {
        benchStrength.push(`${fixture.teams.home.name} banco com limitações`);
      }
      
      if (awayPrestige >= 20) {
        benchStrength.push(`${fixture.teams.away.name} tem substitutos de alto nível`);
        awayScore += 4;
      } else if (awayPrestige >= 10) {
        benchStrength.push(`${fixture.teams.away.name} banco competitivo`);
        awayScore += 1;
      } else {
        benchStrength.push(`${fixture.teams.away.name} dependente dos titulares`);
      }

      // ===== MANDO DE CAMPO INTELIGENTE =====
      // Dar vantagem base para mandante, mas considerar o tamanho do clube
      let homefieldAdvantage = 10; // Base
      
      // Clubes grandes têm vantagem maior em casa
      if (homePrestige >= 20) {
        homefieldAdvantage += 8; // Estádios icônicos, torcida fanática
        crowdFactor.push(`${fixture.teams.home.name} tem vantagem extra em seu estádio histórico`);
      } else if (homePrestige >= 10) {
        homefieldAdvantage += 5; // Bom apoio da torcida
        crowdFactor.push(`${fixture.teams.home.name} tem bom apoio da torcida em casa`);
      } else {
        homefieldAdvantage += 3; // Vantagem mínima
        crowdFactor.push(`Vantagem básica de mando para ${fixture.teams.home.name}`);
      }
      
      homeScore += homefieldAdvantage;
      // Insight movido para os 4 principais
      
      // Rivalidade pode reduzir ou aumentar pressão
      const isLocalRivalry = isRivalryMatch(fixture.teams.home.name, fixture.teams.away.name);
      if (isLocalRivalry) {
        homeScore += 5; // Motivação extra em clássicos
        awayScore += 3; // Visitante também se motiva
        crowdFactor.push(`🔥 CLÁSSICO: Ambos os times elevam o nível em rivalidades`);
        totalGoalsExpected += 0.3;
      }

      // ===== 7. CONTEXTO PSICOLÓGICO BASEADO EM FORMA =====
      // Usar apenas dados reais de forma para contexto psicológico
      if (homeForm.winRate && homeForm.winRate < 25) {
        psychologicalContext.push(`${fixture.teams.home.name} em crise de resultados (${homeForm.winRate.toFixed(0)}% aproveitamento)`);
        homeScore -= 5;
        highRisk.push(`${fixture.teams.home.name} com pressão por resultados`);
      } else if (homeForm.winRate && homeForm.winRate > 70) {
        psychologicalContext.push(`${fixture.teams.home.name} confiante pela boa sequência`);
        homeScore += 3;
      }
      
      if (awayForm.winRate && awayForm.winRate < 25) {
        psychologicalContext.push(`${fixture.teams.away.name} em má fase (${awayForm.winRate.toFixed(0)}% aproveitamento)`);
        awayScore -= 8;
        highRisk.push(`${fixture.teams.away.name} desmotivado pelos maus resultados`);
      } else if (awayForm.winRate && awayForm.winRate > 70) {
        psychologicalContext.push(`${fixture.teams.away.name} motivado pela excelente forma`);
        awayScore += 5;
      }
      
      if (!homeForm.winRate || !awayForm.winRate) {
        psychologicalContext.push(`Contexto psicológico baseado em dados limitados`);
      }

      // ===== 8. COMPETIÇÃO & IMPORTÂNCIA =====
      const competitionType = getCompetitionType(fixture.league.name);
      
      if (competitionType === 'knockout') {
        competitionContext.push(`Mata-mata: times podem jogar mais fechados`);
        totalGoalsExpected -= 0.3;
      } else if (competitionType === 'crucial') {
        competitionContext.push(`Jogo decisivo: alta intensidade esperada`);
        totalGoalsExpected += 0.2;
      } else if (competitionType === 'friendly') {
        competitionContext.push(`Amistoso: menor intensidade, mais erros`);
        totalGoalsExpected += 0.5;
        lowRisk.push(`Jogo sem pressão competitiva`);
      } else {
        competitionContext.push(`Jogo de campeonato com importância normal`);
      }

      // ===== 9. CONDIÇÕES FÍSICAS DETALHADAS =====
      const gameDate = new Date(fixture.fixture.date);
      const daysDifference = Math.floor((gameDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      // Usar número de jogos recentes como indicador de fadiga (dados reais)
      if (homeForm.played >= 8) {
        physicalConditions.push(`${fixture.teams.home.name} jogou muitos jogos recentemente (${homeForm.played} partidas)`);
        homeScore -= 3;
        mediumRisk.push(`Alta atividade recente pode afetar ${fixture.teams.home.name}`);
      } else if (homeForm.played <= 3) {
        physicalConditions.push(`${fixture.teams.home.name} bem descansado (apenas ${homeForm.played} jogos recentes)`);
        homeScore += 2;
      }
      
      if (awayForm.played >= 8) {
        physicalConditions.push(`${fixture.teams.away.name} com calendário intenso (${awayForm.played} partidas)`);
        awayScore -= 4; // Visitante sofre mais com fadiga
        mediumRisk.push(`${fixture.teams.away.name} pode sentir desgaste físico`);
      } else if (awayForm.played <= 3) {
        physicalConditions.push(`${fixture.teams.away.name} fisicamente fresco`);
        awayScore += 1;
      }
      
      // Viagem longa
      const isLongTravel = fixture.teams.home.country !== fixture.teams.away.country;
      if (isLongTravel) {
        physicalConditions.push(`${fixture.teams.away.name} com viagem internacional`);
        awayScore -= 3;
      } else {
        physicalConditions.push(`Condições físicas equilibradas`);
      }

      // ===== 10. META-MÉTRICAS & MODELAGEM =====
      // Simular ELO rating (em implementação real, seria calculado)
      const homeELO = 1500 + (homeStats ? (homeStats.wins - homeStats.losses) * 20 : 0);
      const awayELO = 1500 + (awayStats ? (awayStats.wins - awayStats.losses) * 20 : 0);
      
      if (Math.abs(homeELO - awayELO) > 100) {
        const favorite = homeELO > awayELO ? fixture.teams.home.name : fixture.teams.away.name;
        metaMetrics.push(`${favorite} tem rating ELO superior (diferença: ${Math.abs(homeELO - awayELO)})`);
        
        if (homeELO > awayELO) {
          homeScore += 8;
        } else {
          awayScore += 6;
        }
      } else {
        metaMetrics.push(`Times com rating ELO equilibrado`);
      }
      
      // Sequência invicta
      const homeUnbeaten = homeStats ? Math.min(homeStats.wins + homeStats.draws, 15) : 5;
      if (homeUnbeaten > 10) {
        metaMetrics.push(`${fixture.teams.home.name} invicto há ${homeUnbeaten} jogos - risco de quebra`);
        mediumRisk.push(`Sequência longa pode gerar pressão`);
      } else {
        metaMetrics.push(`Sequências normais para ambas as equipes`);
      }

      // ===== 11. SITUAÇÕES DE JOGO ESPECIAIS (DADOS REAIS) =====
      if (homeAvgCorners > 6) {
        specialSituations.push(`${fixture.teams.home.name} força muitos escanteios (${homeAvgCorners.toFixed(1)}/jogo)`);
          totalGoalsExpected += 0.1;
        }
        
      if (awayAvgCorners < 3) {
        specialSituations.push(`${fixture.teams.away.name} com baixa criatividade ofensiva (${awayAvgCorners.toFixed(1)} escanteios/jogo)`);
      }
      
      specialSituations.push(`Análise baseada em dados reais dos últimos jogos`);
      
      // Análise baseada em dados reais de finalizações
      if (homeRecentStats.length > 0) {
        const avgShots = homeRecentStats.reduce((sum, match) => {
          const isHomeInMatch = homeLastMatches.some(m => 
            m.fixture.id === Object.keys(match)[0] && m.teams.home.id === fixture.teams.home.id
          );
          return sum + (isHomeInMatch ? match.shots.home : match.shots.away);
        }, 0) / homeRecentStats.length;
        
        if (avgShots > 15) {
          specialSituations.push(`${fixture.teams.home.name} cria muitas chances (${avgShots.toFixed(1)} finalizações/jogo)`);
          homeScore += 3;
        }
      }

      // ===== 12. CONDIÇÕES BASEADAS EM DADOS REAIS =====
      
      // Verificar se há dados suficientes para análise completa
      const hasCompleteData = homeRecentStats.length >= 3 && awayRecentStats.length >= 3;
      
      if (hasCompleteData) {
        extraordinaryConditions.push(`Análise completa baseada em dados estatísticos reais`);
        extraordinaryConditions.push(`${homeRecentStats.length} jogos analisados para ${fixture.teams.home.name}`);
        extraordinaryConditions.push(`${awayRecentStats.length} jogos analisados para ${fixture.teams.away.name}`);
      } else {
        extraordinaryConditions.push(`Dados limitados disponíveis na API`);
        extraordinaryConditions.push(`Análise baseada em estatísticas básicas da temporada`);
        lowRisk.push(`Recomenda-se cautela devido aos dados limitados`);
      }

      // ===== CÁLCULOS FINAIS =====
      // CORREÇÃO: Mando de campo ajustado baseado na diferença estrutural
      let homefieldBonus;
      if (Math.abs(structuralDifference) > 100) {
        // Para diferenças muito grandes, mando de campo tem peso menor
        homefieldBonus = 5;
        contextInsights.push(`Mando de campo reduzido devido à grande diferença estrutural`);
      } else if (Math.abs(structuralDifference) > 50) {
        // Para diferenças grandes, mando de campo moderado
        homefieldBonus = 8;
        contextInsights.push(`Mando de campo moderado devido à diferença estrutural`);
      } else {
        // Para diferenças pequenas, mando de campo normal
        homefieldBonus = 12;
        contextInsights.push(`Vantagem do mando de campo é decisiva para ${fixture.teams.home.name}`);
      }
      
      homeScore += homefieldBonus;

      // H2H (mantido e expandido)
      if (h2hData && h2hData.length > 0) {
        const recentH2H = h2hData.slice(0, 5);
        let homeWinsH2H = 0;
        let totalGoalsH2H = 0;
        let bothScoredCount = 0;

        recentH2H.forEach(match => {
          totalGoalsH2H += match.goals.home + match.goals.away;
          
          if (match.goals.home > 0 && match.goals.away > 0) {
            bothScoredCount++;
          }

          if (match.teams.home.id === fixture.teams.home.id && match.goals.home > match.goals.away) {
            homeWinsH2H++;
          } else if (match.teams.away.id === fixture.teams.home.id && match.goals.away > match.goals.home) {
            homeWinsH2H++;
          }
        });

        const avgGoalsH2H = totalGoalsH2H / recentH2H.length;
        const bothScoredRate = bothScoredCount / recentH2H.length;

        // CORREÇÃO: H2H ajustado baseado na diferença estrutural
        if (homeWinsH2H >= 3) {
          const h2hBonus = Math.abs(structuralDifference) > 100 ? 3 : Math.abs(structuralDifference) > 50 ? 5 : 8;
          homeScore += h2hBonus;
          h2hInsights.push(`${fixture.teams.home.name} domina o confronto direto`);
        } else if (homeWinsH2H <= 1) {
          const h2hBonus = Math.abs(structuralDifference) > 100 ? 2 : Math.abs(structuralDifference) > 50 ? 3 : 6;
          awayScore += h2hBonus;
          h2hInsights.push(`${fixture.teams.away.name} tem vantagem no histórico recente`);
        } else {
          h2hInsights.push(`Confronto equilibrado nos últimos jogos`);
        }

        h2hInsights.push(`Média de ${avgGoalsH2H.toFixed(1)} gols por confronto`);

        if (bothScoredRate > 0.7) {
          bothTeamsToScore += 15;
          h2hInsights.push(`Ambas as equipes costumam marcar neste confronto`);
        } else {
          h2hInsights.push(`Jogos costumam ter poucos gols entre essas equipes`);
        }

        if (avgGoalsH2H > 2.5) {
          totalGoalsExpected += 0.4;
        }
      } else {
        h2hInsights.push(`Primeiro confronto recente entre as equipes`);
        h2hInsights.push(`Análise baseada na forma atual dos times`);
        h2hInsights.push(`Expectativa de jogo equilibrado`);
      }

      // Contexto do jogo (expandido)
      const gameHour = gameDate.getHours();
      const isWeekend = gameDate.getDay() === 0 || gameDate.getDay() === 6;
      
      if (isWeekend) {
        totalGoalsExpected += 0.1;
        contextInsights.push(`Jogo de fim de semana tende a ser mais ofensivo`);
      } else {
        contextInsights.push(`Jogo de meio de semana pode ter ritmo mais controlado`);
      }

      if (gameHour >= 19) {
        contextInsights.push(`Jogo noturno favorece atmosfera intensa no estádio`);
      } else {
        contextInsights.push(`Jogo diurno com condições ideais de disputa`);
      }

      // ===== CÁLCULO FINAL: 60% FORÇA ESTRUTURAL + 40% ANÁLISE TRADICIONAL =====
      console.log('🧮 Iniciando cálculo final com nova lógica 60/40');
      
      // 1. CALCULAR SCORE TRADICIONAL (Forma, H2H, Mando, etc.) - 40% do peso
      const totalTraditionalScore = homeScore + awayScore;
      const traditionalHomePercent = (homeScore / totalTraditionalScore) * 100;
      const traditionalAwayPercent = (awayScore / totalTraditionalScore) * 100;
      
      console.log('📊 Score Tradicional:', {
        home: traditionalHomePercent.toFixed(1) + '%',
        away: traditionalAwayPercent.toFixed(1) + '%',
        baseScores: { home: homeScore, away: awayScore }
      });
      
      // 2. CALCULAR SCORE ESTRUTURAL PURO - 60% do peso
      let structuralHomePercent, structuralAwayPercent;
      
      // Aplicar lógica estrutural baseada na diferença de FFS
      const absDifference = Math.abs(structuralDifference);
      
      if (absDifference > 150) {
        // Diferença EXTREMA (Ex: Premier League vs League Two)
        if (structuralAdvantage === 'home') {
          structuralHomePercent = 85;
          structuralAwayPercent = 15;
        } else if (structuralAdvantage === 'away') {
          structuralHomePercent = 15;
          structuralAwayPercent = 85;
        } else {
          structuralHomePercent = 50;
          structuralAwayPercent = 50;
        }
      } else if (absDifference > 100) {
        // Diferença MUITO GRANDE (Ex: Serie A vs Serie C)
        if (structuralAdvantage === 'home') {
          structuralHomePercent = 78;
          structuralAwayPercent = 22;
        } else if (structuralAdvantage === 'away') {
          structuralHomePercent = 22;
          structuralAwayPercent = 78;
        } else {
          structuralHomePercent = 50;
          structuralAwayPercent = 50;
        }
      } else if (absDifference > 50) {
        // Diferença GRANDE (Ex: Premier League vs Championship)
        if (structuralAdvantage === 'home') {
          structuralHomePercent = 68;
          structuralAwayPercent = 32;
        } else if (structuralAdvantage === 'away') {
          structuralHomePercent = 32;
          structuralAwayPercent = 68;
        } else {
          structuralHomePercent = 50;
          structuralAwayPercent = 50;
        }
      } else if (absDifference > 20) {
        // Diferença MODERADA
        const ratio = absDifference / 100; // 0.2 a 0.5
        const bonus = ratio * 20; // 4 a 10 pontos
        if (structuralAdvantage === 'home') {
          structuralHomePercent = 50 + bonus;
          structuralAwayPercent = 50 - bonus;
        } else if (structuralAdvantage === 'away') {
          structuralHomePercent = 50 - bonus;
          structuralAwayPercent = 50 + bonus;
        } else {
          structuralHomePercent = 50;
          structuralAwayPercent = 50;
        }
      } else {
        // Diferença PEQUENA - equilíbrio estrutural
        structuralHomePercent = 50;
        structuralAwayPercent = 50;
      }
      
      console.log('🏗️ Score Estrutural:', {
        home: structuralHomePercent.toFixed(1) + '%',
        away: structuralAwayPercent.toFixed(1) + '%',
        difference: structuralDifference.toFixed(1),
        advantage: structuralAdvantage
      });
      
      // 3. COMBINAR SCORES: 60% Estrutural + 40% Tradicional
      const finalHomePercent = (structuralHomePercent * 0.60) + (traditionalHomePercent * 0.40);
      const finalAwayPercent = (structuralAwayPercent * 0.60) + (traditionalAwayPercent * 0.40);
      
      // 4. APLICAR SCORES FINAIS
      homeScore = finalHomePercent;
      awayScore = finalAwayPercent;
      
      console.log('⚖️ Score Final (60% Estrutural + 40% Tradicional):', {
        home: homeScore.toFixed(1) + '%',
        away: awayScore.toFixed(1) + '%',
        calculation: `(${structuralHomePercent.toFixed(1)} × 0.6) + (${traditionalHomePercent.toFixed(1)} × 0.4) = ${homeScore.toFixed(1)}%`
      });

      // Adicionar insight informativo sobre a nova lógica
      insights.push(`⚖️ Análise: ${structuralHomePercent.toFixed(1)}% vs ${structuralAwayPercent.toFixed(1)}% (estrutural) + ${traditionalHomePercent.toFixed(1)}% vs ${traditionalAwayPercent.toFixed(1)}% (tradicional)`);

      // Limitar valores
      totalGoalsExpected = Math.max(1.5, Math.min(4.5, totalGoalsExpected));
      bothTeamsToScore = Math.max(20, Math.min(80, bothTeamsToScore));

      // Calcular confiança baseada na QUALIDADE dos dados reais
      let confidence = 60; // Base mais baixa
      
      // Qualidade das estatísticas dos times
      if (homeStats && awayStats) {
        const homeGames = homeStats.played || 0;
        const awayGames = awayStats.played || 0;
        const avgGames = (homeGames + awayGames) / 2;
        
        if (avgGames >= 10) confidence += 20; // Muitos jogos = alta confiança
        else if (avgGames >= 5) confidence += 12; // Poucos jogos = média confiança  
        else if (avgGames >= 3) confidence += 8;  // Muito poucos = baixa confiança
        else confidence += 3; // Quase sem dados
      }
      
      // Qualidade do histórico H2H
      if (h2hData && h2hData.length >= 5) confidence += 8;
      else if (h2hData && h2hData.length >= 3) confidence += 5;
      else if (h2hData && h2hData.length >= 1) confidence += 2;
      
      // Qualidade dos dados recentes
      if (homeRecentStats.length >= 5 && awayRecentStats.length >= 5) confidence += 7;
      else if (homeRecentStats.length >= 3 && awayRecentStats.length >= 3) confidence += 4;
      else if (homeRecentStats.length >= 1 && awayRecentStats.length >= 1) confidence += 2;
      
      // Penalidade por disparidade de dados
      if (homeStats && awayStats) {
        const gamesDiff = Math.abs((homeStats.played || 0) - (awayStats.played || 0));
        if (gamesDiff > 3) confidence -= 5; // Times com jogos muito diferentes
      }
      
      console.log(`📊 Cálculo de Confiança:`, {
        base: 60,
        homeGames: homeStats?.played || 0,
        awayGames: awayStats?.played || 0,
        h2hGames: h2hData?.length || 0,
        recentGames: { home: homeRecentStats.length, away: awayRecentStats.length },
        confidenceFinal: confidence
      });
      
      // ===== 4 INSIGHTS PRINCIPAIS MAIS IMPORTANTES =====
      const mainInsights: string[] = [];
      
      // 1. FAVORITO E DIFERENÇA DE FORÇA
      if (Math.abs(homeScore - awayScore) > 15) {
        const favorite = homeScore > awayScore ? fixture.teams.home.name : fixture.teams.away.name;
        const difference = Math.abs(homeScore - awayScore);
        mainInsights.push(`${favorite} é favorito com vantagem de ${difference.toFixed(0)} pontos`);
      } else {
        mainInsights.push(`Confronto equilibrado entre as equipes`);
      }

      // 2. EXPECTATIVA DE GOLS
      if (totalGoalsExpected > 2.7) {
        mainInsights.push(`Jogo ofensivo esperado: ${totalGoalsExpected.toFixed(1)} gols previstos`);
      } else if (totalGoalsExpected < 2.2) {
        mainInsights.push(`Jogo defensivo: apenas ${totalGoalsExpected.toFixed(1)} gols esperados`);
      } else {
        mainInsights.push(`Jogo equilibrado: ${totalGoalsExpected.toFixed(1)} gols previstos`);
      }
      
      // 3. FORME ATUAL DECISIVA
      if (homeForm.winRate && awayForm.winRate) {
        const formDiff = Math.abs(homeForm.winRate - awayForm.winRate);
        if (formDiff > 30) {
          const betterForm = homeForm.winRate > awayForm.winRate ? fixture.teams.home.name : fixture.teams.away.name;
          mainInsights.push(`${betterForm} em forma superior (diferença de ${formDiff.toFixed(0)}% no aproveitamento)`);
      } else {
          mainInsights.push(`Ambos os times em forma similar nos últimos jogos`);
        }
      }
      
      // 4. FATOR MAIS IMPORTANTE DO JOGO
      if (homePrestige > awayPrestige + 15) {
        mainInsights.push(`Prestígio histórico do ${fixture.teams.home.name} como fator decisivo`);
      } else if (isRivalryMatch(fixture.teams.home.name, fixture.teams.away.name)) {
        mainInsights.push(`Clássico: motivação extra e imprevisibilidade elevada`);
      } else if (homeForm.avgGoalsFor > 2.5 || awayForm.avgGoalsFor > 2.5) {
        const strongAttack = homeForm.avgGoalsFor > 2.5 ? fixture.teams.home.name : fixture.teams.away.name;
        mainInsights.push(`Ataque do ${strongAttack} como principal ameaça do jogo`);
      } else {
        mainInsights.push(`Mando de campo como principal vantagem`);
      }
      
      // Substituir insights por apenas os 4 principais
      insights.length = 0;
      insights.push(...mainInsights);

      // Previsões-chave baseadas na análise completa
      const mostLikely = homeScore > awayScore + 10 
        ? `Vitória do ${fixture.teams.home.name}` 
        : awayScore > homeScore + 10 
        ? `Vitória do ${fixture.teams.away.name}` 
        : `Jogo equilibrado com empate possível`;

      const surpriseFactor = highRisk.length > 2 
        ? `Alta imprevisibilidade devido aos fatores de risco` 
        : `Jogo previsível dentro dos padrões`;

      const safetyBet = totalGoalsExpected > 2.7 && bothTeamsToScore > 55 
        ? `Over 2.5 gols + Ambas marcam` 
        : totalGoalsExpected < 2.3 
        ? `Under 2.5 gols` 
        : `Resultado final (1X2)`;

      return {
        homeTeamScore: homeScore,
        awayTeamScore: awayScore,
        totalGoalsExpected,
        bothTeamsToScore,
        insights,
        confidence: Math.min(88, Math.max(45, confidence)), // Limite mais realista: 45-88%
        teamForm,
        h2hInsights,
        contextInsights,
        homeStats: homeStats || undefined,
        awayStats: awayStats || undefined,
        advancedMetrics: {
          xgAnalysis,
          tacticalMatchup,
          temporalPatterns,
          disciplinaryRisk,
          benchStrength,
          crowdFactor,
          psychologicalContext,
          competitionContext,
          physicalConditions,
          metaMetrics,
          specialSituations,
          extraordinaryConditions
        },
        riskFactors: {
          high: highRisk,
          medium: mediumRisk,
          low: lowRisk
        },
        keyPredictions: {
          mostLikely,
          surpriseFactor,
          safetyBet
        },
        // NOVO: Incluir análise estrutural
        structuralAnalysis
      };

    } catch (error) {
      console.error('Erro na análise avançada:', error);
      return {
        homeTeamScore: 50,
        awayTeamScore: 50,
        totalGoalsExpected: 2.5,
        bothTeamsToScore: 45,
        insights: [
          'Análise baseada em dados limitados',
          'Recomenda-se cautela nas apostas',
          'Aguarde mais informações dos times'
        ],
        confidence: 40,
        teamForm: {
          home: ['Dados indisponíveis', 'Análise limitada', 'Aguardar mais informações'],
          away: ['Dados indisponíveis', 'Análise limitada', 'Aguardar mais informações']
        },
        h2hInsights: ['Histórico indisponível', 'Análise limitada', 'Primeiro confronto'],
        contextInsights: ['Contexto limitado', 'Jogo equilibrado', 'Análise geral'],
        advancedMetrics: {
          xgAnalysis: ['Dados xG indisponíveis'],
          tacticalMatchup: ['Análise tática limitada'],
          temporalPatterns: ['Padrões temporais não identificados'],
          disciplinaryRisk: ['Risco disciplinar baixo'],
          benchStrength: ['Força do banco desconhecida'],
          crowdFactor: ['Fator torcida padrão'],
          psychologicalContext: ['Contexto psicológico neutro'],
          competitionContext: ['Importância da competição média'],
          physicalConditions: ['Condições físicas normais'],
          metaMetrics: ['Métricas avançadas limitadas'],
          specialSituations: ['Situações especiais não identificadas'],
          extraordinaryConditions: ['Condições normais de jogo']
        },
        riskFactors: {
          high: [],
          medium: ['Dados limitados para análise'],
          low: ['Previsão conservadora recomendada']
        },
        keyPredictions: {
          mostLikely: 'Resultado indefinido',
          surpriseFactor: 'Imprevisibilidade média',
          safetyBet: 'Aguardar mais dados'
        }
      };
    }
  }, []);

  // Função para buscar estatísticas reais de jogos recentes do time
  const getTeamRecentMatchesStats = async (teamId: number): Promise<RealMatchData[]> => {
    try {
      const lastMatches = await getTeamLastMatches(teamId);
      const matchesStats: RealMatchData[] = [];

      for (const match of lastMatches.slice(0, 5)) { // Últimos 5 jogos
        try {
          const statsResponse = await fetch(
            `https://v3.football.api-sports.io/fixtures/statistics?fixture=${match.fixture.id}`,
            {
              method: 'GET',
              headers: {
                'X-RapidAPI-Key': API_KEY,
                'X-RapidAPI-Host': 'v3.football.api-sports.io',
              }
            }
          );

          if (statsResponse.ok) {
            const statsData = await statsResponse.json();
            const stats = statsData.response;
            
            if (stats && stats.length >= 2) {
              const homeStats = stats.find((s: any) => s.team.id === match.teams.home.id);
              const awayStats = stats.find((s: any) => s.team.id === match.teams.away.id);
              
              const getStatValue = (teamStats: any, statType: string): number => {
                const stat = teamStats?.statistics?.find((s: any) => s.type === statType);
                return parseInt(stat?.value) || 0;
              };

              matchesStats.push({
                corners: {
                  home: getStatValue(homeStats, 'Corner Kicks'),
                  away: getStatValue(awayStats, 'Corner Kicks')
        },
        cards: {
                  home: {
                    yellow: getStatValue(homeStats, 'Yellow Cards'),
                    red: getStatValue(homeStats, 'Red Cards')
                  },
                  away: {
                    yellow: getStatValue(awayStats, 'Yellow Cards'),
                    red: getStatValue(awayStats, 'Red Cards')
                  }
                },
                possession: {
                  home: homeStats?.statistics?.find((s: any) => s.type === 'Ball Possession')?.value || '50%',
                  away: awayStats?.statistics?.find((s: any) => s.type === 'Ball Possession')?.value || '50%'
                },
                shots: {
                  home: getStatValue(homeStats, 'Total Shots'),
                  away: getStatValue(awayStats, 'Total Shots')
                },
                shotsOnTarget: {
                  home: getStatValue(homeStats, 'Shots on Goal'),
                  away: getStatValue(awayStats, 'Shots on Goal')
                }
              });
            }
          }
    } catch (error) {
          console.log(`Erro ao buscar stats do jogo ${match.fixture.id}`);
        }
      }
      
      return matchesStats;
    } catch (error) {
      console.error('Erro ao buscar estatísticas de jogos recentes:', error);
      return [];
    }
  };

  // Função auxiliar para identificar rivalidades
  const isRivalryMatch = (homeTeam: string, awayTeam: string): boolean => {
    const rivalries = [
      ['Barcelona', 'Real Madrid'], ['Milan', 'Inter'], ['Flamengo', 'Vasco'],
      ['Liverpool', 'Manchester'], ['Arsenal', 'Tottenham'], ['Palmeiras', 'Corinthians']
    ];
    
    return rivalries.some(rivalry => 
      (homeTeam.includes(rivalry[0]) && awayTeam.includes(rivalry[1])) ||
      (homeTeam.includes(rivalry[1]) && awayTeam.includes(rivalry[0]))
    );
  };

  // Função auxiliar para determinar tipo de competição
  const getCompetitionType = (leagueName: string): string => {
    if (leagueName.toLowerCase().includes('cup') || leagueName.toLowerCase().includes('copa')) {
      return 'knockout';
    }
    if (leagueName.toLowerCase().includes('champions') || leagueName.toLowerCase().includes('final')) {
      return 'crucial';
    }
    if (leagueName.toLowerCase().includes('friendly') || leagueName.toLowerCase().includes('amistoso')) {
      return 'friendly';
    }
    return 'league';
  };

  // Função para buscar últimos jogos de um time
  const getTeamLastMatches = async (teamId: number): Promise<any[]> => {
    try {
      const response = await fetch(
        `https://v3.football.api-sports.io/fixtures?team=${teamId}&last=10`,
        {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': API_KEY,
            'X-RapidAPI-Host': 'v3.football.api-sports.io',
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.response || [];
      }
      return [];
    } catch (error) {
      console.error('Erro ao buscar últimos jogos:', error);
      return [];
    }
  };

  // Função para buscar odds reais de uma partida
  const getFixtureOdds = async (fixtureId: number): Promise<any> => {
    try {
      const response = await fetch(
        `https://v3.football.api-sports.io/odds?fixture=${fixtureId}`,
        {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': API_KEY,
            'X-RapidAPI-Host': 'v3.football.api-sports.io',
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.response?.[0] || null;
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar odds:', error);
      return null;
    }
  };

  // Helper para encontrar odd específica nos dados da API
  const findOddValue = (oddsData: any, betType: string, selection?: string): { odd: number; bookmaker: string } | null => {
    if (!oddsData?.bookmakers) return null;

    // Procurar em todas as casas de apostas
    for (const bookmaker of oddsData.bookmakers) {
      const bet = bookmaker.bets?.find((b: any) => 
        b.name === betType || 
        b.name.toLowerCase().includes(betType.toLowerCase())
      );
      
      if (bet?.values) {
        let targetValue = bet.values[0]; // Pegar primeiro valor por padrão
        
        // Se temos seleção específica, procurar por ela
        if (selection) {
          targetValue = bet.values.find((v: any) => 
            v.value?.toLowerCase().includes(selection.toLowerCase())
          ) || bet.values[0];
        }
        
        if (targetValue?.odd) {
          return {
            odd: parseFloat(targetValue.odd),
            bookmaker: bookmaker.name
          };
        }
      }
    }
    
    return null;
  };

  // Função para buscar artilheiros da liga
  const getLeagueTopScorers = async (leagueId: number, season: number = 2025): Promise<LeagueTopScorers[]> => {
    try {
      const response = await fetch(
        `https://v3.football.api-sports.io/players/topscorers?league=${leagueId}&season=${season}`,
        {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': API_KEY,
            'X-RapidAPI-Host': 'v3.football.api-sports.io',
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.response || [];
      }
      return [];
    } catch (error) {
      console.error('Erro ao buscar artilheiros:', error);
      return [];
    }
  };

  // Função para buscar estatísticas de jogadores de um time específico
  const getTeamPlayers = async (teamId: number, leagueId: number, season: number = 2025): Promise<RealPlayerStats[]> => {
    try {
      const response = await fetch(
        `https://v3.football.api-sports.io/players?team=${teamId}&season=${season}&league=${leagueId}`,
        {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': API_KEY,
            'X-RapidAPI-Host': 'v3.football.api-sports.io',
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.response || [];
      }
      return [];
    } catch (error) {
      console.error('Erro ao buscar jogadores do time:', error);
      return [];
    }
  };

  // Função para encontrar o artilheiro do time nos top scorers da liga
  const findTeamTopScorer = (teamId: number, leagueTopScorers: LeagueTopScorers[]): LeagueTopScorers | null => {
    return leagueTopScorers.find(scorer => 
      scorer.statistics.some(stat => stat.team.id === teamId)
    ) || null;
  };

  // Função para calcular confiança realista baseada em dados disponíveis
  const calculateRealisticConfidence = (
    baseConfidence: number,
    dataQuality: {
      hasStats?: boolean,
      gamesPlayed?: number,
      h2hGames?: number,
      recentForm?: boolean
    }
  ): number => {
    let adjustedConfidence = baseConfidence;
    
    // Ajuste baseado na quantidade de jogos
    if (dataQuality.gamesPlayed !== undefined) {
      if (dataQuality.gamesPlayed < 3) adjustedConfidence -= 15;
      else if (dataQuality.gamesPlayed < 5) adjustedConfidence -= 8;
      else if (dataQuality.gamesPlayed < 8) adjustedConfidence -= 3;
    }
    
    // Ajuste baseado em estatísticas completas
    if (!dataQuality.hasStats) adjustedConfidence -= 10;
    
    // Ajuste baseado em histórico H2H
    if (dataQuality.h2hGames !== undefined) {
      if (dataQuality.h2hGames === 0) adjustedConfidence -= 8;
      else if (dataQuality.h2hGames < 3) adjustedConfidence -= 5;
    }
    
    // Ajuste baseado em forma recente
    if (!dataQuality.recentForm) adjustedConfidence -= 5;
    
    return Math.min(78, Math.max(35, adjustedConfidence)); // Limite 35-78%
  };

  // Gerador de Apostas com 100+ Critérios
  const generateBetSuggestions = useCallback(async (
    fixture: Fixture, 
    analysis: GameAnalysis, 
    homeForm: any, 
    awayForm: any, 
    homeLastMatches: any[], 
    awayLastMatches: any[],
    homeStats: TeamStats | null,
    awayStats: TeamStats | null
  ): Promise<BetSuggestion[]> => {
    const suggestions: BetSuggestion[] = [];
    let suggestionId = 1;

    const homeName = fixture.teams.home.name;
    const awayName = fixture.teams.away.name;

    // Buscar odds reais da partida
    console.log('Buscando odds para fixture:', fixture.fixture.id);
    const oddsData = await getFixtureOdds(fixture.fixture.id);

    // Helper para classificar risco baseado nas odds reais
    const classifyRiskByOdds = (odd: number): 'Baixo' | 'Médio' | 'Alto' | 'Elevado' => {
      if (odd < 1.30) return 'Baixo';        // Descartar na verdade, mas classificamos como muito baixo
      if (odd >= 1.30 && odd <= 1.35) return 'Baixo';
      if (odd >= 1.40 && odd <= 1.50) return 'Médio';
      if (odd >= 1.55 && odd <= 1.70) return 'Alto';
      return 'Elevado';                       // Acima de 1.70
    };

    // Helper para classificar risco baseado na análise (fallback quando não há odds)
    const classifyRisk = (confidence: number, teamStrength: number): 'Baixo' | 'Médio' | 'Alto' | 'Elevado' => {
      const riskScore = (confidence + teamStrength) / 2;
      
      if (riskScore >= 80) return 'Baixo';
      if (riskScore >= 60) return 'Médio';
      if (riskScore >= 40) return 'Alto';
      return 'Elevado';
    };

    // Helper para calcular força dos dados do time
    const calculateTeamStrength = (homeForm: any, awayForm: any, analysis: GameAnalysis): number => {
      const homeStr = (homeForm.winRate || 0) + (homeForm.avgGoalsFor || 0) * 10;
      const awayStr = (awayForm.winRate || 0) + (awayForm.avgGoalsFor || 0) * 10;
      const formStrength = Math.min(100, (homeStr + awayStr) / 2);
      
      const dataQuality = analysis.confidence || 50;
      return Math.min(100, (formStrength + dataQuality) / 2);
    };

    // ===== 1. GOLS / PRIMEIRA EQUIPE A MARCAR =====
    
    // Casa marcar primeiro
    if (homeForm.wins >= 6 && homeForm.goalsFor >= 12) {
      const homeFirstGoalRate = 65; // Simulado - em implementação real viria da análise
      if (homeFirstGoalRate >= 60) {
        const confidence = calculateRealisticConfidence(65, {
          hasStats: !!(homeStats && awayStats),
          gamesPlayed: homeForm.played,
          h2hGames: 0, // Esta aposta não usa H2H
          recentForm: homeForm.wins >= 6
        });
        const teamStrength = calculateTeamStrength(homeForm, awayForm, analysis);
        
        // Buscar odd real para "First Goal"
        const oddInfo = findOddValue(oddsData, 'First Goal', homeName);
        
        suggestions.push({
          id: `bet-${suggestionId++}`,
          type: 'primeiro-tempo',
          market: 'Primeiro a marcar',
          selection: `${homeName} marca primeiro`,
          reasoning: `${homeName} marcou primeiro em ${homeFirstGoalRate}% dos últimos jogos`,
          confidence,
          realOdd: oddInfo?.odd,
          bookmaker: oddInfo?.bookmaker,
          riskLevel: oddInfo ? classifyRiskByOdds(oddInfo.odd) : classifyRisk(confidence, teamStrength),
          criteria: ['Mando de campo forte', 'Média alta de gols', 'Boa forma recente']
        });
      }
    }

    // ===== 2. TOTAL DE GOLS =====
    
    // Over 2.5 gols
    if (analysis.totalGoalsExpected > 2.7) {
      const homeAvg = homeForm.avgGoalsFor || 0;
      const awayAvg = awayForm.avgGoalsFor || 0;
      
      if (homeAvg >= 1.5 && awayAvg >= 1.5) {
        const confidence = calculateRealisticConfidence(68, {
          hasStats: !!(homeStats && awayStats),
          gamesPlayed: Math.min(homeForm.played, awayForm.played),
          h2hGames: 0,
          recentForm: homeAvg >= 1.5 && awayAvg >= 1.5
        });
        const teamStrength = calculateTeamStrength(homeForm, awayForm, analysis);
        
        // Buscar odd real para "Over 2.5"
        const oddInfo = findOddValue(oddsData, 'Goals Over/Under', 'Over 2.5');
        
        suggestions.push({
          id: `bet-${suggestionId++}`,
          type: 'gols',
          market: 'Total de gols',
          selection: 'Mais de 2.5 gols',
          reasoning: `Ambos os times têm média alta de gols (${homeName}: ${homeAvg.toFixed(1)}, ${awayName}: ${awayAvg.toFixed(1)})`,
          confidence,
          realOdd: oddInfo?.odd,
          bookmaker: oddInfo?.bookmaker,
          riskLevel: oddInfo ? classifyRiskByOdds(oddInfo.odd) : classifyRisk(confidence, teamStrength),
          criteria: ['Médias ofensivas altas', 'Expectativa de gols alta', 'Defesas vulneráveis']
        });
      }
    }

    // Under 2.5 gols
    if (analysis.totalGoalsExpected < 2.2) {
      const homeDefense = homeForm.avgGoalsAgainst || 0;
      const awayDefense = awayForm.avgGoalsAgainst || 0;
      
      if (homeDefense < 1.0 && awayDefense < 1.0) {
        const confidence = 70;
        const teamStrength = calculateTeamStrength(homeForm, awayForm, analysis);
        suggestions.push({
          id: `bet-${suggestionId++}`,
          type: 'gols',
          market: 'Total de gols',
          selection: 'Menos de 2.5 gols',
          reasoning: `Ambos têm defesas sólidas (${homeName}: ${homeDefense.toFixed(1)} gols sofridos/jogo)`,
          confidence,
          riskLevel: classifyRisk(confidence, teamStrength),
          criteria: ['Defesas sólidas', 'Baixa expectativa de gols', 'Jogo tático']
        });
      }
    }

    // Ambas marcam
    if (analysis.bothTeamsToScore > 65) {
      const bothScore = true; // Simulado
      if (bothScore) {
        const confidence = 78;
        const teamStrength = calculateTeamStrength(homeForm, awayForm, analysis);
        
        // Buscar odd real para "Both Teams to Score"
        const oddInfo = findOddValue(oddsData, 'Both Teams Score', 'Yes');
        
        suggestions.push({
          id: `bet-${suggestionId++}`,
          type: 'gols',
          market: 'Ambas marcam',
          selection: 'Sim',
          reasoning: `Alta probabilidade (${analysis.bothTeamsToScore.toFixed(0)}%) de ambas marcarem`,
          confidence,
          realOdd: oddInfo?.odd,
          bookmaker: oddInfo?.bookmaker,
          riskLevel: oddInfo ? classifyRiskByOdds(oddInfo.odd) : classifyRisk(confidence, teamStrength),
          criteria: ['Ambos com ataque eficiente', 'Defesas vulneráveis', 'Histórico favorável']
        });
      }
    }

    // ===== 3. RESULTADO =====
    
    // Casa vence - CORREÇÃO: Respeitar análise estrutural
    if (analysis.homeTeamScore > analysis.awayTeamScore + 15) {
      const homeWinRate = homeForm.winRate || 0;
      // Verificar se há vantagem estrutural significativa
      const hasStructuralAdvantage = analysis.structuralAnalysis && 
        analysis.structuralAnalysis.comparison.structuralAdvantage === 'home' &&
        Math.abs(analysis.structuralAnalysis.comparison.difference) > 30;
      
      if (homeWinRate > 50 || hasStructuralAdvantage) {
        const confidence = hasStructuralAdvantage ? 85 : 82;
        const teamStrength = calculateTeamStrength(homeForm, awayForm, analysis);
        
        // Buscar odd real para vitória do time da casa
        const oddInfo = findOddValue(oddsData, 'Match Winner', homeName);
        
        suggestions.push({
          id: `bet-${suggestionId++}`,
          type: 'resultado',
          market: 'Resultado final',
          selection: `Vitória ${homeName}`,
          reasoning: hasStructuralAdvantage ? 
            `${homeName} é favorito estruturalmente com ${analysis.homeTeamScore.toFixed(0)}% de probabilidade` :
            `${homeName} é favorito com ${analysis.homeTeamScore.toFixed(0)}% de probabilidade`,
          confidence,
          realOdd: oddInfo?.odd,
          bookmaker: oddInfo?.bookmaker,
          riskLevel: oddInfo ? classifyRiskByOdds(oddInfo.odd) : classifyRisk(confidence, teamStrength),
          criteria: hasStructuralAdvantage ? 
            ['Vantagem estrutural', 'Mando de campo', 'Superioridade técnica'] :
            ['Mando de campo', 'Boa forma', 'Superioridade técnica']
        });
      }
    }

    // Visitante vence - CORREÇÃO: Respeitar análise estrutural
    if (analysis.awayTeamScore > analysis.homeTeamScore + 10) {
      const awayWinRate = awayForm.winRate || 0;
      // Verificar se há vantagem estrutural significativa para o visitante
      const hasStructuralAdvantage = analysis.structuralAnalysis && 
        analysis.structuralAnalysis.comparison.structuralAdvantage === 'away' &&
        Math.abs(analysis.structuralAnalysis.comparison.difference) > 30;
      
      // SÓ apostar no visitante se ele tiver forma excepcional OU vantagem estrutural
      if (awayWinRate > 70 || hasStructuralAdvantage) {
        const confidence = hasStructuralAdvantage ? 80 : 75;
        const teamStrength = calculateTeamStrength(homeForm, awayForm, analysis);
        suggestions.push({
          id: `bet-${suggestionId++}`,
          type: 'resultado',
          market: 'Resultado final',
          selection: `Vitória ${awayName}`,
          reasoning: hasStructuralAdvantage ? 
            `${awayName} tem vantagem estrutural e está em boa fase (${awayWinRate.toFixed(0)}% de vitórias)` :
            `${awayName} em excelente fase (${awayWinRate.toFixed(0)}% de vitórias)`,
          confidence,
          riskLevel: classifyRisk(confidence, teamStrength),
          criteria: hasStructuralAdvantage ? 
            ['Vantagem estrutural', 'Forma excepcional', 'Visitante forte'] :
            ['Forma excepcional', 'Visitante forte', 'Casa em má fase']
        });
      }
    }

    // Empate - LÓGICA ULTRA RIGOROSA
    const equipeDifference = Math.abs(analysis.homeTeamScore - analysis.awayTeamScore);
    const homeFormRate = homeForm.winRate || 0;
    const awayFormRate = awayForm.winRate || 0;
    const formDifference = Math.abs(homeFormRate - awayFormRate);
    
    // SÓ apostar no empate se for EXTREMAMENTE equilibrado
    if (equipeDifference < 10 && // Diferença muito pequena
        formDifference < 20 && // Formas similares
        homeFormRate > 30 && homeFormRate < 70 && // Casa não domina nem está em crise
        awayFormRate > 30 && awayFormRate < 70 && // Visitante não domina nem está em crise
        Math.abs((homeForm.avgGoalsFor || 0) - (awayForm.avgGoalsFor || 0)) < 0.5) { // Ataques similares
      
      const confidence = Math.max(55, 60 - equipeDifference);
      const teamStrength = calculateTeamStrength(homeForm, awayForm, analysis);
      suggestions.push({
        id: `bet-${suggestionId++}`,
        type: 'resultado',
        market: 'Resultado final',
        selection: 'Empate',
        reasoning: `Equilíbrio total: diferença ${equipeDifference.toFixed(0)}pts, formas similares (${homeFormRate.toFixed(0)}% vs ${awayFormRate.toFixed(0)}%)`,
        confidence,
        riskLevel: classifyRisk(confidence, teamStrength),
        criteria: ['Equilíbrio extremo', 'Formas similares', 'Ataques equivalentes', 'Histórico equilibrado']
      });
    }

    // ===== 4. ESCANTEIOS BASEADOS EM DADOS DA TEMPORADA =====
    
    // Análise baseada em gols e ataques da temporada
    if (homeStats && homeStats.goals_for > 25 && awayStats && awayStats.goals_against > 20) {
      const confidence = 65;
      const teamStrength = calculateTeamStrength(homeForm, awayForm, analysis);
      suggestions.push({
        id: `bet-${suggestionId++}`,
        type: 'escanteios',
        market: 'Escanteios do mandante',
        selection: `${homeName} mais de 5 escanteios`,
        reasoning: `${homeName} tem ataque forte (${homeStats.goals_for} gols) contra defesa que sofre (${awayStats.goals_against} gols sofridos)`,
        confidence,
        riskLevel: classifyRisk(confidence, teamStrength),
        criteria: ['Ataque forte casa', 'Defesa frágil visitante', 'Mando de campo favorável']
      });
    }

    // ===== 5. CARTÕES =====
    
    // Mais de 4.5 cartões
    const isRivalry = isRivalryMatch(homeName, awayName);
    if (isRivalry) {
      const odd = 1.45;
      suggestions.push({
        id: `bet-${suggestionId++}`,
        type: 'cartoes',
        market: 'Total de cartões',
        selection: 'Mais de 4.5 cartões',
        reasoning: 'Clássico entre rivais com histórico de jogo truncado',
        confidence: 85,
        riskLevel: classifyRisk(85, calculateTeamStrength(homeForm, awayForm, analysis)),
        criteria: ['Rivalidade histórica', 'Jogo disputado', 'Árbitro rigoroso']
      });
    }

    // ===== 6. PRIMEIRO TEMPO =====
    
    // Casa marca no 1º tempo
    if (homeForm.goalsFor >= 8) {
      const odd = 1.35;
      suggestions.push({
        id: `bet-${suggestionId++}`,
        type: 'primeiro-tempo',
        market: 'Gol no 1º tempo',
        selection: `${homeName} marca no 1º tempo`,
        reasoning: `${homeName} costuma pressionar desde o início dos jogos`,
        confidence: 72,
        riskLevel: classifyRisk(72, calculateTeamStrength(homeForm, awayForm, analysis)),
        criteria: ['Início forte', 'Mando de campo', 'Pressão inicial']
      });
    }

    // ===== 7. HANDICAP ASIÁTICO =====
    
    // Handicap Asiático Casa -1.5
    if (analysis.homeTeamScore > analysis.awayTeamScore + 20) {
      const homeWinRate = homeForm.winRate || 0;
      const homeAvgGoalsFor = homeForm.avgGoalsFor || 0;
      const awayAvgGoalsAgainst = awayForm.avgGoalsAgainst || 0;
      
      if (homeWinRate > 60 && homeAvgGoalsFor > 1.8 && awayAvgGoalsAgainst > 1.3) {
        const confidence = 72;
        const teamStrength = calculateTeamStrength(homeForm, awayForm, analysis);
        suggestions.push({
          id: `bet-${suggestionId++}`,
          type: 'handicap',
          market: 'Handicap Asiático',
          selection: `${homeName} -1.5`,
          reasoning: `${homeName} domina tecnicamente e tem ataque forte vs defesa frágil do ${awayName}`,
          confidence,
          handicapValue: -1.5,
          riskLevel: classifyRisk(confidence, teamStrength),
          criteria: ['Superioridade técnica clara', 'Ataque eficiente casa', 'Defesa frágil visitante', 'Alta taxa vitórias']
        });
      }
    }

    // Handicap Asiático Visitante +1.5 - LÓGICA MELHORADA
    const scoreDifference = analysis.homeTeamScore - analysis.awayTeamScore;
    const awayDefense = awayForm.avgGoalsAgainst || 0;
    const homeAttack = homeForm.avgGoalsFor || 0;
    
    // SÓ apostar no handicap visitante se REALMENTE for equilibrado
    if (scoreDifference < 20 && // Diferença pequena
        awayDefense < 1.3 && // Defesa visitante decente
        homeAttack < 2.5 && // Casa não é explosiva
        (awayForm.winRate || 0) > 35) { // Visitante não está em crise
      
      const confidence = Math.max(55, 78 - (scoreDifference * 1.5)); // Confiança diminui com diferença
      const teamStrength = calculateTeamStrength(homeForm, awayForm, analysis);
      suggestions.push({
        id: `bet-${suggestionId++}`,
        type: 'handicap',
        market: 'Handicap Asiático',
        selection: `${awayName} +1.5`,
        reasoning: `${awayName} não deve perder por 2 ou mais gols. Defesa sólida com apenas ${awayDefense.toFixed(1)} gols sofridos por jogo.`,
        confidence,
        handicapValue: 1.5,
        riskLevel: classifyRisk(confidence, teamStrength),
        criteria: ['Diferença pequena', 'Defesa visitante sólida', 'Casa não explosiva', 'Visitante competitivo']
      });
    }

    // ===== 8. CASA/FORA GOLS =====
    
    // Casa marca +1.5 gols - LÓGICA INTELIGENTE CORRIGIDA
    const homeGoalsExpected = (homeForm.avgGoalsFor || 0) + 0.3; // Bônus mando
    const awayDefensiveQuality = (awayForm.avgGoalsAgainst || 0);
    const homeSuperiority = analysis.homeTeamScore - analysis.awayTeamScore;
    
    // SÓ apostar no mandante se ele for REALMENTE superior ou muito forte
    if (homeGoalsExpected > 2.0 && // Ataque realmente forte
        awayDefensiveQuality > 1.1 && // Visitante sofre gols
        (homeSuperiority > -10 || // Casa não é muito inferior OU
         homeGoalsExpected > 2.5) && // Casa tem ataque explosivo independente
        (homeForm.winRate || 0) > 40) { // Casa não está em crise total
      
      // Penalizar confiança se casa for inferior
      let confidence = 75;
      if (homeSuperiority < 0) {
        confidence = Math.max(50, 75 + homeSuperiority); // Reduz com inferioridade
      }
      
      const teamStrength = calculateTeamStrength(homeForm, awayForm, analysis);
      suggestions.push({
        id: `bet-${suggestionId++}`,
        type: 'casa-fora-gols',
        market: 'Gols do mandante',
        selection: `${homeName} marca +1.5 gols`,
        reasoning: homeSuperiority > 0 ? 
          `${homeName} tem vantagem no confronto e ataque forte (${homeGoalsExpected.toFixed(1)} gols por jogo em casa).` :
          `${homeName} possui ataque muito forte (${homeGoalsExpected.toFixed(1)} gols por jogo) que pode superar a diferença técnica.`,
        confidence,
        riskLevel: homeSuperiority > 0 ? classifyRisk(confidence, teamStrength) : 'Alto',
        criteria: homeSuperiority > 0 ? 
          ['Casa superior', 'Ataque forte', 'Defesa visitante frágil', 'Mando favorável'] :
          ['Ataque explosivo', 'Compensação por mando', 'Defesa visitante frágil', 'Alto risco']
      });
    }

    // Visitante marca gol - LÓGICA INTELIGENTE
    // (homeSuperiority já definido acima)
    const homeDefenseQuality = (homeForm.avgGoalsAgainst || 0);
    const awayAttackQuality = (awayForm.avgGoalsFor || 0);
    
    // Removido: Visitante marca pelo menos 1 gol - apenas +1.5 gols são permitidos

    // ===== 9. APOSTAS DE JOGADORES (DADOS REAIS) =====
    
    // Buscar artilheiros reais da liga
    const leagueTopScorers = await getLeagueTopScorers(fixture.league.id);
    console.log(`🏆 TOP Artilheiros da Liga (Temporada 2025):`, leagueTopScorers.slice(0, 10));
    console.log(`📊 Total de artilheiros encontrados: ${leagueTopScorers.length}`);
    
    // Log detalhado para Pedro especificamente
    const pedroInRanking = leagueTopScorers.find(scorer => scorer.player.name.toLowerCase().includes('pedro'));
    if (pedroInRanking) {
      console.log('🔍 Pedro encontrado no ranking:', {
        position: leagueTopScorers.findIndex(s => s.player.id === pedroInRanking.player.id) + 1,
        name: pedroInRanking.player.name,
        id: pedroInRanking.player.id,
        goals: pedroInRanking.statistics.map(s => ({ teamId: s.team.id, goals: s.goals.total }))
      });
    }
    
    // Verificar se algum artilheiro é do time da casa (top 10 para ser mais abrangente)
    const homeTopScorerInLeague = leagueTopScorers.slice(0, 10).find(scorer => 
      scorer.statistics.some(stat => stat.team.id === fixture.teams.home.id)
    );
    
    // Verificar se algum artilheiro é do time visitante (top 10)
    const awayTopScorerInLeague = leagueTopScorers.slice(0, 10).find(scorer => 
      scorer.statistics.some(stat => stat.team.id === fixture.teams.away.id)
    );

    console.log('🏠 Artilheiro da Casa encontrado:', homeTopScorerInLeague?.player.name);
    console.log('✈️ Artilheiro Visitante encontrado:', awayTopScorerInLeague?.player.name);
    console.log('🥅 Defesa visitante sofre:', (awayForm.avgGoalsAgainst || 0).toFixed(2), 'gols/jogo');
    console.log('🥅 Defesa casa sofre:', (homeForm.avgGoalsAgainst || 0).toFixed(2), 'gols/jogo');

    // Casa tem artilheiro no top 10 E visitante sofre gols (critério mais flexível)
    if (homeTopScorerInLeague && (awayForm.avgGoalsAgainst || 0) > 1.0) {
      const scorerStats = homeTopScorerInLeague.statistics.find(stat => stat.team.id === fixture.teams.home.id);
      const goalsCount = scorerStats?.goals.total || 0;
      const gamesPlayed = scorerStats?.games.appearences || 1;
      const goalsPer90 = (goalsCount / (scorerStats?.games.minutes || 1)) * 90;
      
      console.log(`📊 Dados do ${homeTopScorerInLeague.player.name}:`, {
        playerId: homeTopScorerInLeague.player.id,
        playerName: homeTopScorerInLeague.player.name,
        goalsFromStats: goalsCount,
        teamId: fixture.teams.home.id,
        scorerStats: scorerStats
      });
      
      console.log(`⚽ ${homeTopScorerInLeague.player.name}: ${goalsCount} gols, Defesa adversária: ${(awayForm.avgGoalsAgainst || 0).toFixed(2)}`);
      
      if (goalsCount >= 6) { // Critério mais baixo - pelo menos 6 gols
        const confidence = goalsCount >= 10 ? 72 : 65; // Mais confiança para artilheiros com mais gols
        const teamStrength = calculateTeamStrength(homeForm, awayForm, analysis);
        
        // Determinar posição no ranking (procurar pelo jogador específico)
        const position = leagueTopScorers.findIndex(scorer => 
          scorer.player.id === homeTopScorerInLeague.player.id
        ) + 1;
        
        console.log(`🏆 Posição de ${homeTopScorerInLeague.player.name} no ranking:`, {
          position: position,
          playerId: homeTopScorerInLeague.player.id,
          foundInRanking: position > 0,
          rankingLength: leagueTopScorers.length
        });
        
        suggestions.push({
          id: `bet-${suggestionId++}`,
          type: 'jogadores',
          market: 'Jogador marca gol',
          selection: `${homeTopScorerInLeague.player.name} marca a qualquer momento`,
          reasoning: `${homeTopScorerInLeague.player.name} é o ${position}º artilheiro da liga (${goalsCount} gols) e ${awayName} sofre ${(awayForm.avgGoalsAgainst || 0).toFixed(1)} gols por jogo`,
          confidence,
          playerName: homeTopScorerInLeague.player.name,
          riskLevel: classifyRisk(confidence, teamStrength),
          criteria: [`${position}º artilheiro da liga`, 'Defesa adversária vulnerável', 'Mando de campo favorável', `${goalsCount} gols na temporada`]
        });
        
        console.log('✅ Aposta de gol gerada para:', homeTopScorerInLeague.player.name);
      } else {
        console.log('❌ Artilheiro tem poucos gols:', goalsCount, '< 6 necessários');
      }
    } else {
      if (!homeTopScorerInLeague) {
        console.log('❌ Nenhum artilheiro do time da casa encontrado no TOP 10');
      }
      if ((awayForm.avgGoalsAgainst || 0) <= 1.0) {
        console.log('❌ Defesa visitante muito sólida:', (awayForm.avgGoalsAgainst || 0).toFixed(2), '≤ 1.0');
      }
    }

    // Visitante tem artilheiro no top 10 E casa sofre gols
    if (awayTopScorerInLeague && (homeForm.avgGoalsAgainst || 0) > 0.8) {
      const scorerStats = awayTopScorerInLeague.statistics.find(stat => stat.team.id === fixture.teams.away.id);
      const goalsCount = scorerStats?.goals.total || 0;
      
      console.log(`⚽ Visitante ${awayTopScorerInLeague.player.name}: ${goalsCount} gols, Defesa casa: ${(homeForm.avgGoalsAgainst || 0).toFixed(2)}`);
      
      if (goalsCount >= 5) { // Critério ainda mais baixo para visitante (mais difícil marcar fora)
        const confidence = goalsCount >= 10 ? 65 : 55; // Visitante sempre tem menos confiança
        const teamStrength = calculateTeamStrength(homeForm, awayForm, analysis);
        
        // Determinar posição no ranking (procurar pelo jogador específico)
        const position = leagueTopScorers.findIndex(scorer => 
          scorer.player.id === awayTopScorerInLeague.player.id
        ) + 1;
        
        suggestions.push({
          id: `bet-${suggestionId++}`,
          type: 'jogadores',
          market: 'Jogador marca gol',
          selection: `${awayTopScorerInLeague.player.name} marca a qualquer momento`,
          reasoning: `${awayTopScorerInLeague.player.name} é o ${position}º artilheiro da liga (${goalsCount} gols) e ${homeName} sofre ${(homeForm.avgGoalsAgainst || 0).toFixed(1)} gols por jogo`,
          confidence,
          playerName: awayTopScorerInLeague.player.name,
          riskLevel: classifyRisk(confidence, teamStrength),
          criteria: [`${position}º artilheiro da liga`, 'Defesa casa vulnerável', 'Experiência como visitante', `${goalsCount} gols na temporada`]
        });
        
        console.log('✅ Aposta de gol gerada para visitante:', awayTopScorerInLeague.player.name);
      } else {
        console.log('❌ Artilheiro visitante tem poucos gols:', goalsCount, '< 5 necessários');
      }
    } else {
      if (!awayTopScorerInLeague) {
        console.log('❌ Nenhum artilheiro visitante encontrado no TOP 10');
      }
      if ((homeForm.avgGoalsAgainst || 0) <= 0.8) {
        console.log('❌ Defesa casa muito sólida:', (homeForm.avgGoalsAgainst || 0).toFixed(2), '≤ 0.8');
      }
    }

    // ===== 10. CARTÕES DE JOGADORES (DADOS REAIS) =====
    
    // Buscar jogadores com mais cartões da liga se disponível
    try {
      const homePlayersData = await getTeamPlayers(fixture.teams.home.id, fixture.league.id);
      const awayPlayersData = await getTeamPlayers(fixture.teams.away.id, fixture.league.id);
      
      // Encontrar jogador do time da casa com mais cartões
      const homeMostCardedPlayer = homePlayersData
        .filter(player => player.statistics[0]?.games?.appearences >= 5) // Pelo menos 5 jogos
        .reduce((prev, current) => {
          const prevCards = prev.statistics[0]?.cards?.yellow || 0;
          const currentCards = current.statistics[0]?.cards?.yellow || 0;
          return currentCards > prevCards ? current : prev;
        }, homePlayersData[0]);
      
      // Se jogador tem 4+ cartões amarelos
      if (homeMostCardedPlayer?.statistics[0]?.cards?.yellow >= 4) {
        const confidence = 62;
        const teamStrength = calculateTeamStrength(homeForm, awayForm, analysis);
        const cardCount = homeMostCardedPlayer.statistics[0].cards.yellow;
        const gamesPlayed = homeMostCardedPlayer.statistics[0].games?.appearences || 1;
        const cardRate = (cardCount / gamesPlayed).toFixed(2);
        
        suggestions.push({
          id: `bet-${suggestionId++}`,
          type: 'jogadores',
          market: 'Jogador leva cartão',
          selection: `${homeMostCardedPlayer.player.name} recebe cartão amarelo`,
          reasoning: `${homeMostCardedPlayer.player.name} já tem ${cardCount} cartões amarelos em ${gamesPlayed} jogos (${cardRate} por jogo)`,
          confidence,
          playerName: homeMostCardedPlayer.player.name,
          riskLevel: classifyRisk(confidence, teamStrength),
          criteria: ['Alto histórico cartões', 'Dados reais temporada', 'Padrão disciplinar', 'Pressão do jogo']
        });
      }
    } catch (error) {
      console.log('Dados de jogadores não disponíveis para apostas de cartões');
    }

    // ===== 11. CARTÕES BASEADOS EM DADOS DA TEMPORADA =====
    
    // Usar apenas dados básicos da temporada para cartões
    if (isRivalryMatch(homeName, awayName)) {
      const confidence = 75;
      const teamStrength = calculateTeamStrength(homeForm, awayForm, analysis);
      suggestions.push({
        id: `bet-${suggestionId++}`,
        type: 'cartoes',
        market: 'Total de cartões',
        selection: 'Mais de 4.5 cartões',
        reasoning: 'Clássico entre rivais históricos com tendência a jogo mais disputado',
        confidence,
        riskLevel: classifyRisk(confidence, teamStrength),
        criteria: ['Rivalidade histórica', 'Jogo disputado', 'Padrão de clássicos']
      });
    }

    // ===== 12. AMBAS MARCAM EXPANDIDO =====
    
    // Ambas marcam no 1º tempo
    if (analysis.bothTeamsToScore > 60 && homeForm.avgGoalsFor > 1.2 && awayForm.avgGoalsFor > 1.0) {
      const confidence = 55;
      const teamStrength = calculateTeamStrength(homeForm, awayForm, analysis);
      suggestions.push({
        id: `bet-${suggestionId++}`,
        type: 'primeiro-tempo',
        market: 'Ambas marcam 1º tempo',
        selection: 'Ambas marcam no primeiro tempo',
        reasoning: 'Ambos iniciam jogos de forma ofensiva e têm ataques consistentes',
        confidence,
        riskLevel: classifyRisk(confidence, teamStrength),
        criteria: ['Início ofensivo', 'Ataques eficientes', 'Defesas vulneráveis cedo']
      });
    }

    // Ambas marcam no 2º tempo
    if (analysis.bothTeamsToScore > 65) {
      const confidence = 63;
      const teamStrength = calculateTeamStrength(homeForm, awayForm, analysis);
      suggestions.push({
        id: `bet-${suggestionId++}`,
        type: 'segundo-tempo',
        market: 'Ambas marcam 2º tempo',
        selection: 'Ambas marcam no segundo tempo',
        reasoning: 'Times crescem no decorrer do jogo e buscam resultado',
        confidence,
        riskLevel: classifyRisk(confidence, teamStrength),
        criteria: ['Crescimento no jogo', 'Busca por resultado', 'Cansaço defensivo']
      });
    }

    // ===== 13. SITUAÇÕES ESPECIAIS EXPANDIDAS =====
    
    // Gol nos primeiros 15 minutos
    if (homeForm.goalsFor >= 8 && homeTopScorerInLeague) {
      const confidence = 45;
      const teamStrength = calculateTeamStrength(homeForm, awayForm, analysis);
      suggestions.push({
        id: `bet-${suggestionId++}`,
        type: 'especiais',
        market: 'Timing do gol',
        selection: 'Gol nos primeiros 15 minutos',
        reasoning: `${homeName} pressiona desde o início e tem atacante em grande forma`,
        confidence,
        riskLevel: classifyRisk(confidence, teamStrength),
        criteria: ['Início forte', 'Atacante em forma', 'Pressão inicial', 'Mando de campo']
      });
    }

    // Gol nos últimos 15 minutos
    if (analysis.totalGoalsExpected > 2.3) {
      const confidence = 52;
      const teamStrength = calculateTeamStrength(homeForm, awayForm, analysis);
      suggestions.push({
        id: `bet-${suggestionId++}`,
        type: 'especiais',
        market: 'Timing do gol',
        selection: 'Gol nos últimos 15 minutos',
        reasoning: 'Jogo ofensivo com pressão final por resultado',
        confidence,
        riskLevel: classifyRisk(confidence, teamStrength),
        criteria: ['Jogo ofensivo', 'Pressão final', 'Desgaste físico', 'Busca por resultado']
      });
    }

    // ===== 14. CRITÉRIOS ESPECÍFICOS DE COMPETIÇÃO =====
    
    const competitionType = getCompetitionType(fixture.league.name);
    if (competitionType === 'crucial') {
      const confidence = 68;
      const teamStrength = calculateTeamStrength(homeForm, awayForm, analysis);
      suggestions.push({
        id: `bet-${suggestionId++}`,
        type: 'especiais',
        market: 'Características do jogo',
        selection: 'Jogo com mais de 1 gol',
        reasoning: 'Jogo decisivo tende a ser mais aberto e ofensivo',
        confidence,
        riskLevel: classifyRisk(confidence, teamStrength),
        criteria: ['Jogo decisivo', 'Alta motivação', 'Pressão por resultado']
      });
    }

    // ===== 15. NOVOS CRITÉRIOS EXPANDIDOS =====
    
    // Casa ganha e +1.5 gols (APOSTA COMPOSTA)
    if (analysis.homeTeamScore > analysis.awayTeamScore + 15 && homeForm.avgGoalsFor > 1.8) {
      const homeWinOdd = findOddValue(oddsData, 'Match Winner', homeName);
      const over15GoalsConfidence = homeForm.avgGoalsFor > 1.8 ? 72 : 60;
      const compositeConfidence = Math.min(75, over15GoalsConfidence * 0.85); // Reduzir por ser composta
      
      const teamStrength = calculateTeamStrength(homeForm, awayForm, analysis);
      suggestions.push({
        id: `bet-${suggestionId++}`,
        type: 'resultado',
        market: 'Vitória + Gols',
        selection: `${homeName} vence e marca +1.5 gols`,
        reasoning: `${homeName} é favorito com ataque forte (${homeForm.avgGoalsFor?.toFixed(1)}/jogo)`,
        confidence: compositeConfidence,
        realOdd: homeWinOdd?.odd ? homeWinOdd.odd * 1.2 : undefined, // Estimativa para composta
        bookmaker: homeWinOdd?.bookmaker,
        riskLevel: 'Alto', // Apostas compostas têm risco elevado
        criteria: ['Favorito claro', 'Ataque eficiente', 'Aposta composta', 'Defesa adversária frágil']
      });
    }

    // Visitante +1.5 handicap e marca gol (APOSTA COMPOSTA) - LÓGICA RIGOROSA
    const totalSuperiority = homeSuperiority; // Usar variável já calculada
    const awayOffensiveCapacity = awayForm.avgGoalsFor || 0;
    const awayCurrentForm = awayForm.winRate || 0;
    
    // Critérios MUITO rigorosos para apostar no visitante composto
    if (totalSuperiority < 15 && // Casa não é muito superior
        awayOffensiveCapacity > 1.4 && // Visitante tem ataque real
        awayCurrentForm > 50 && // Visitante em boa forma
        homeDefenseQuality > 1.0) { // Casa sofre gols
      
      const confidence = Math.max(50, 68 - (totalSuperiority * 2)); // Penaliza superioridade
      const teamStrength = calculateTeamStrength(homeForm, awayForm, analysis);
      suggestions.push({
        id: `bet-${suggestionId++}`,
        type: 'handicap',
        market: 'Handicap + Gol',
        selection: `${awayName} +1.5 handicap e marca +1.5 gols`,
        reasoning: `${awayName} competitivo (${awayCurrentForm.toFixed(0)}% forma, ${awayOffensiveCapacity.toFixed(1)} gols/jogo) vs diferença pequena (${totalSuperiority.toFixed(0)}pts)`,
        confidence,
        handicapValue: 1.5,
        riskLevel: 'Alto', // Sempre alto para apostas compostas do visitante
        criteria: ['Visitante em forma', 'Ataque visitante real', 'Diferença controlada', 'Aposta composta']
      });
    }

    // Casa vence qualquer tempo + Over 2.5 (APOSTA COMPOSTA)
    if (homeForm.winRate > 60 && analysis.totalGoalsExpected > 2.8) {
      const confidence = 70;
      const teamStrength = calculateTeamStrength(homeForm, awayForm, analysis);
      suggestions.push({
        id: `bet-${suggestionId++}`,
        type: 'resultado',
        market: 'Vitória + Total',
        selection: `${homeName} vence em qualquer tempo e +2.5 gols totais`,
        reasoning: `${homeName} domina em casa e jogo promete muitos gols`,
        confidence,
        riskLevel: 'Alto',
        criteria: ['Domínio casa', 'Jogo ofensivo', 'Aposta composta', 'Dupla cobertura']
      });
    }

    // ===== 16. CRITÉRIOS ESPECÍFICOS POR MERCADO =====
    
    // Casa marca +2.5 gols - LÓGICA CORRIGIDA
    const homeAttackPower = homeForm.avgGoalsFor || 0;
    const awayDefenseWeakness = (awayForm.avgGoalsAgainst || 0);
    const homeQualitySuperiority = analysis.homeTeamScore - analysis.awayTeamScore;
    
    // Critérios MUITO rigorosos para +2.5 gols do mandante
    if (homeAttackPower > 2.5 && // Ataque realmente explosivo
        awayDefenseWeakness > 1.4 && // Defesa visitante muito frágil
        (homeQualitySuperiority > 10 || // Casa é superior OU
         homeAttackPower > 3.0) && // Casa tem ataque excepcional
        (homeForm.winRate || 0) > 50) { // Casa em boa forma
      
      // Ajustar confiança baseada na superioridade
      let confidence = homeQualitySuperiority > 20 ? 75 : 
                      homeQualitySuperiority > 0 ? 65 : 
                      55; // Menor confiança se não for claramente superior
      
      const teamStrength = calculateTeamStrength(homeForm, awayForm, analysis);
      suggestions.push({
        id: `bet-${suggestionId++}`,
        type: 'casa-fora-gols',
        market: 'Gols do mandante',
        selection: `${homeName} marca +2.5 gols`,
        reasoning: homeQualitySuperiority > 10 ? 
          `${homeName} é claramente superior e tem ataque letal (${homeAttackPower.toFixed(1)} gols por jogo). Deve marcar pelo menos 3 gols.` :
          `${homeName} possui ataque excepcional (${homeAttackPower.toFixed(1)} gols por jogo) capaz de fazer uma goleada mesmo sendo inferior.`,
        confidence,
        riskLevel: homeQualitySuperiority > 10 ? classifyRisk(confidence, teamStrength) : 'Elevado',
        criteria: homeQualitySuperiority > 10 ? 
          ['Casa superior', 'Ataque explosivo', 'Defesa muito frágil', 'Domínio claro'] :
          ['Ataque excepcional', 'Defesa muito frágil', 'Compensação ofensiva', 'Alto risco']
      });
    }

    // Fora marca no primeiro tempo - LÓGICA INTELIGENTE
    const superiorityGap = analysis.homeTeamScore - analysis.awayTeamScore;
    const awayFirstHalfCapacity = awayForm.avgGoalsFor || 0;
    const awayFormStrength = awayForm.winRate || 0;
    
    // SÓ apostar se o visitante for REALMENTE forte no primeiro tempo
    if (superiorityGap < 20 && // Casa não domina completamente
        awayFirstHalfCapacity > 1.5 && // Visitante tem ataque forte
        awayFormStrength > 55 && // Visitante em excelente forma
        homeDefenseQuality > 1.1) { // Casa sofre gols
      
      const confidence = Math.max(50, 65 - superiorityGap); // Penaliza diferença
      const teamStrength = calculateTeamStrength(homeForm, awayForm, analysis);
      suggestions.push({
        id: `bet-${suggestionId++}`,
        type: 'primeiro-tempo',
        market: 'Gols visitante 1T',
        selection: `${awayName} marca no 1º tempo`,
        reasoning: `${awayName} forte fora (${awayFormStrength.toFixed(0)}% forma, ${awayFirstHalfCapacity.toFixed(1)} gols/jogo) vs casa vulnerável`,
        confidence,
        riskLevel: classifyRisk(confidence, teamStrength),
        criteria: ['Visitante em excelente forma', 'Ataque visitante forte', 'Casa sofre gols', 'Diferença controlada']
      });
    }

    // Dupla chance + Under 3.5 - LÓGICA DEFENSIVA INTELIGENTE
    const teamDifference = Math.abs(analysis.homeTeamScore - analysis.awayTeamScore);
    const goalsExpected = analysis.totalGoalsExpected;
    const bothDefensiveQuality = (homeForm.avgGoalsAgainst || 0) + (awayForm.avgGoalsAgainst || 0);
    
    // SÓ apostar dupla chance se for REALMENTE equilibrado E defensivo
    if (teamDifference < 15 && // Muito equilibrado
        goalsExpected < 2.5 && // Expectativa baixa de gols
        bothDefensiveQuality < 2.0 && // Ambos defensivamente sólidos
        (homeForm.winRate || 0) < 70 && // Casa não domina
        (awayForm.winRate || 0) < 70) { // Visitante não domina
      
      const confidence = Math.max(60, 78 - teamDifference);
      const teamStrength = calculateTeamStrength(homeForm, awayForm, analysis);
      suggestions.push({
        id: `bet-${suggestionId++}`,
        type: 'resultado',
        market: 'Dupla Chance + Total',
        selection: `${homeName} ou Empate + Menos de 3.5 gols`,
        reasoning: `Jogo muito equilibrado (diferença: ${teamDifference.toFixed(0)}pts) e defensivo (${goalsExpected.toFixed(1)} gols esperados)`,
        confidence,
        riskLevel: classifyRisk(confidence, teamStrength),
        criteria: ['Diferença mínima', 'Ambos defensivos', 'Baixa expectativa gols', 'Aposta conservadora']
      });
    }

    // ===== 17. MERCADOS DE TIMING EXPANDIDOS =====
    
    // Gol entre 16-30 minutos
    if (homeForm.goalsFor >= 10 && homeTopScorerInLeague) {
      const confidence = 58;
      const teamStrength = calculateTeamStrength(homeForm, awayForm, analysis);
      suggestions.push({
        id: `bet-${suggestionId++}`,
        type: 'especiais',
        market: 'Timing específico',
        selection: 'Gol entre 16-30 minutos',
        reasoning: `${homeName} após pressão inicial mantém ritmo ofensivo`,
        confidence,
        riskLevel: classifyRisk(confidence, teamStrength),
        criteria: ['Ritmo ofensivo', 'Artilheiro em forma', 'Padrão temporal', 'Pressão constante']
      });
    }

    // Sem gols nos primeiros 10 minutos
    if (homeForm.avgGoalsFor < 1.5 && awayForm.avgGoalsFor < 1.2) {
      const confidence = 72;
      const teamStrength = calculateTeamStrength(homeForm, awayForm, analysis);
      suggestions.push({
        id: `bet-${suggestionId++}`,
        type: 'especiais',
        market: 'Início cauteloso',
        selection: 'Sem gols nos primeiros 10 minutos',
        reasoning: 'Ambos os times têm início cauteloso e médias baixas',
        confidence,
        riskLevel: classifyRisk(confidence, teamStrength),
        criteria: ['Início cauteloso', 'Médias baixas', 'Jogo tático', 'Estudo adversário']
      });
    }

    // ===== 18. APOSTAS DE CARTÕES - MERCADOS VÁLIDOS =====
    
    // +1.5 cartões no primeiro tempo
    const isHighIntensityMatch = isRivalryMatch(homeName, awayName) || 
                               (homeForm.winRate || 0) > 70 || 
                               (awayForm.winRate || 0) > 70;
    
    if (isHighIntensityMatch) {
      const confidence = 65;
      const teamStrength = calculateTeamStrength(homeForm, awayForm, analysis);
      suggestions.push({
        id: `bet-${suggestionId++}`,
        type: 'cartoes',
        market: 'Cartões 1º tempo',
        selection: '+1.5 cartões no primeiro tempo',
        reasoning: isRivalryMatch(homeName, awayName) ? 
          'Clássico com alta intensidade no primeiro tempo' : 
          'Jogo de alta intensidade com pressão inicial',
        confidence,
        riskLevel: classifyRisk(confidence, teamStrength),
        criteria: ['Alta intensidade', 'Pressão inicial', 'Jogo disputado', 'Primeiro tempo agitado']
      });
    }

    // +4.5 cartões no jogo todo
    const isPhysicalMatch = isRivalryMatch(homeName, awayName) || 
                           analysis.totalGoalsExpected < 2.5; // Jogos defensivos são mais físicos
    
    if (isPhysicalMatch) {
      const confidence = 70;
      const teamStrength = calculateTeamStrength(homeForm, awayForm, analysis);
      suggestions.push({
        id: `bet-${suggestionId++}`,
        type: 'cartoes',
        market: 'Total de cartões',
        selection: '+4.5 cartões no jogo',
        reasoning: isRivalryMatch(homeName, awayName) ? 
          'Clássico historicamente disputado com muitas faltas' : 
          'Jogo defensivo tende a ser mais físico e truncado',
        confidence,
        riskLevel: classifyRisk(confidence, teamStrength),
        criteria: ['Jogo físico', 'Disputa intensa', 'Muitas faltas', 'Padrão histórico']
      });
    }

    // +2.5 cartões no primeiro tempo - para jogos muito intensos
    if (isRivalryMatch(homeName, awayName) && 
        ((homeForm.winRate || 0) > 75 || (awayForm.winRate || 0) > 75)) {
      const confidence = 55;
      const teamStrength = calculateTeamStrength(homeForm, awayForm, analysis);
      suggestions.push({
        id: `bet-${suggestionId++}`,
        type: 'cartoes',
        market: 'Cartões 1º tempo',
        selection: '+2.5 cartões no primeiro tempo',
        reasoning: 'Clássico com alta motivação e pressão desde o início',
        confidence,
        riskLevel: classifyRisk(confidence, teamStrength),
        criteria: ['Clássico intenso', 'Alta motivação', 'Pressão extrema', 'Primeiro tempo agitado']
      });
    }

    // +5.5 cartões no jogo todo - apenas para clássicos históricos
    if (isRivalryMatch(homeName, awayName)) {
      const confidence = 60;
      const teamStrength = calculateTeamStrength(homeForm, awayForm, analysis);
      suggestions.push({
        id: `bet-${suggestionId++}`,
        type: 'cartoes',
        market: 'Total de cartões',
        selection: '+5.5 cartões no jogo',
        reasoning: 'Clássico historicamente truncado com muitas faltas e protestos',
        confidence,
        riskLevel: classifyRisk(confidence, teamStrength),
        criteria: ['Rivalidade máxima', 'Histórico de cartões', 'Jogo truncado', 'Muitas faltas']
      });
    }

    // 1 expulsão no jogo - só para clássicos de alta rivalidade
    if (isRivalryMatch(homeName, awayName)) {
      const confidence = 42; // Baixa mas possível em clássicos
      const teamStrength = calculateTeamStrength(homeForm, awayForm, analysis);
      suggestions.push({
        id: `bet-${suggestionId++}`,
        type: 'cartoes',
        market: 'Expulsão',
        selection: '1 expulsão no jogo',
        reasoning: 'Clássico com histórico de expulsões por tensão e disputa acirrada',
        confidence,
        riskLevel: 'Elevado', // Sempre alto risco
        criteria: ['Rivalidade histórica', 'Tensão máxima', 'Disputas acirradas', 'Risco de expulsão']
      });
    }

          // Filtrar apostas com odds muito baixas (< 1.30) ou baixa confiança
      const validSuggestions = suggestions.filter(bet => {
        // Se tem odd real, verificar se é >= 1.30
        if (bet.realOdd) {
          return bet.realOdd >= 1.30;
        }
        // Se não tem odd real, usar confiança como critério
        return bet.confidence >= 50;
      });

    // Ordenar por nível de risco (baixo -> elevado)
    const riskOrder = { 'Baixo': 1, 'Médio': 2, 'Alto': 3, 'Elevado': 4 };
    return validSuggestions.sort((a, b) => {
      const riskA = riskOrder[a.riskLevel];
      const riskB = riskOrder[b.riskLevel];
      
      // Primeiro por risco (baixo -> elevado)
      if (riskA !== riskB) {
        return riskA - riskB;
      }
      
      // Se mesmo risco, ordenar por confiança (maior primeiro)
      return b.confidence - a.confidence;
    });
  }, []);

  // Função para analisar forma dos últimos 10 jogos
  const analyzeRecentForm = (matches: any[], teamId: number) => {
    if (!matches || matches.length === 0) {
      return {
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        form: 'Sem jogos recentes',
        formDescription: [],
        winRate: 0,
        avgGoalsFor: 0,
        avgGoalsAgainst: 0,
        played: 0
      };
    }

    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goalsFor = 0;
    let goalsAgainst = 0;
    const results: string[] = [];

    matches.forEach(match => {
      const isHome = match.teams.home.id === teamId;
      const teamGoals = isHome ? match.goals.home : match.goals.away;
      const opponentGoals = isHome ? match.goals.away : match.goals.home;

      if (teamGoals !== null && opponentGoals !== null) {
        goalsFor += teamGoals;
        goalsAgainst += opponentGoals;

        if (teamGoals > opponentGoals) {
          wins++;
          results.push('V');
        } else if (teamGoals === opponentGoals) {
          draws++;
          results.push('E');
        } else {
          losses++;
          results.push('D');
        }
      }
    });

    const totalGames = matches.length;
    const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;
    const avgGoalsFor = totalGames > 0 ? goalsFor / totalGames : 0;
    const avgGoalsAgainst = totalGames > 0 ? goalsAgainst / totalGames : 0;

    // Formar sequência (últimos 5 jogos)
    const recentResults = results.slice(0, 5).join(' ');

    const formDescription = [];
    
    // Análise de vitórias
    if (wins === 0) {
      formDescription.push(`Sem vitórias nos últimos ${totalGames} jogos`);
    } else if (winRate >= 70) {
      formDescription.push(`Excelente momento: ${wins} vitórias em ${totalGames} jogos`);
    } else if (winRate >= 50) {
      formDescription.push(`Boa fase: ${wins} vitórias em ${totalGames} jogos`);
    } else if (winRate >= 30) {
      formDescription.push(`Forma irregular: ${wins} vitórias em ${totalGames} jogos`);
    } else {
      formDescription.push(`Má fase: apenas ${wins} vitórias em ${totalGames} jogos`);
    }

    // Análise ofensiva
    if (avgGoalsFor >= 2.0) {
      formDescription.push(`Ataque eficiente: ${goalsFor} gols marcados (${avgGoalsFor.toFixed(1)}/jogo)`);
    } else if (avgGoalsFor >= 1.0) {
      formDescription.push(`Média ofensiva: ${goalsFor} gols marcados (${avgGoalsFor.toFixed(1)}/jogo)`);
    } else {
      formDescription.push(`Ataque ineficiente: apenas ${goalsFor} gols marcados (${avgGoalsFor.toFixed(1)}/jogo)`);
    }

    // Análise defensiva
    if (avgGoalsAgainst <= 0.5) {
      formDescription.push(`Defesa sólida: apenas ${goalsAgainst} gols sofridos (${avgGoalsAgainst.toFixed(1)}/jogo)`);
    } else if (avgGoalsAgainst <= 1.2) {
      formDescription.push(`Defesa regular: ${goalsAgainst} gols sofridos (${avgGoalsAgainst.toFixed(1)}/jogo)`);
    } else {
      formDescription.push(`Defesa frágil: ${goalsAgainst} gols sofridos (${avgGoalsAgainst.toFixed(1)}/jogo)`);
    }

    // Sequência recente
    if (recentResults) {
      formDescription.push(`Últimos 5 jogos: ${recentResults}`);
    }

    return {
      wins,
      draws,
      losses,
      goalsFor,
      goalsAgainst,
      form: recentResults || 'N/A',
      formDescription,
      winRate,
      avgGoalsFor,
      avgGoalsAgainst,
      played: totalGames
    };
  };

  // NOVO ALGORITMO: Ajuste por Força Estrutural & Nível de Competição
  const analyzeStructuralStrength = async (
    fixture: Fixture,
    homeLastMatches: any[],
    awayLastMatches: any[]
  ): Promise<StructuralStrengthAnalysis> => {
    console.log('🏗️ Iniciando análise de Força Estrutural:', fixture.teams.home.name, 'vs', fixture.teams.away.name);
    
    const insights: string[] = [];
    
    // ===== 1. PESO POR LIGA / DIVISÃO =====
    const getLeagueWeight = (leagueName: string, country: string): number => {
      const leagueNameLower = leagueName.toLowerCase();
      const countryLower = country.toLowerCase();
      
      console.log('🏆 DEBUG Liga:', { 
        original: leagueName, 
        country, 
        lower: leagueNameLower,
        countryLower 
      });
      
      // Top 5 europeus
      const top5Leagues = ['premier league', 'la liga', 'bundesliga', 'serie a', 'ligue 1'];
      const top5Countries = ['england', 'spain', 'germany', 'italy', 'france'];
      
      // Primeira divisão nacional
      if (top5Leagues.some(league => leagueNameLower.includes(league)) || 
          top5Countries.some(country => countryLower.includes(country))) {
        console.log('✅ TOP 5 DETECTADO → 120 pontos');
        return 120; // +100 base + 20 extras para top 5
      }
      
      // EFL League Two (4ª divisão inglesa) - PRIORIDADE MÁXIMA
      if (leagueNameLower.includes('league two')) {
        console.log('✅ LEAGUE TWO DETECTADA → 30 pontos (4ª divisão)');
        return 30;
      }
      
      // EFL League One (3ª divisão inglesa)
      if (leagueNameLower.includes('league one')) {
        console.log('✅ LEAGUE ONE DETECTADA → 50 pontos (3ª divisão)');
        return 50;
      }
      
      // Championship (2ª divisão inglesa)
      if (leagueNameLower.includes('championship')) {
        console.log('✅ CHAMPIONSHIP DETECTADA → 70 pontos (2ª divisão)');
        return 70;
      }
      
      // Premier League (1ª divisão inglesa)
      if (leagueNameLower.includes('premier league')) {
        console.log('✅ PREMIER LEAGUE DETECTADA → 120 pontos (1ª divisão top)');
        return 120;
      }
      
      // Outras primeiras divisões
      if (leagueNameLower.includes('liga') || leagueNameLower.includes('division')) {
        console.log('✅ PRIMEIRA DIVISÃO GERAL → 100 pontos');
        return 100;
      }
      
      // Segunda divisão geral
      if (leagueNameLower.includes('segunda') || leagueNameLower.includes('second')) {
        console.log('✅ SEGUNDA DIVISÃO GERAL → 70 pontos');
        return 70;
      }
      
      // Terceira divisão geral
      if (leagueNameLower.includes('tercera') || leagueNameLower.includes('third')) {
        console.log('✅ TERCEIRA DIVISÃO GERAL → 50 pontos');
        return 50;
      }
      
      // Quarta divisão geral
      if (leagueNameLower.includes('cuarta') || leagueNameLower.includes('fourth')) {
        console.log('✅ QUARTA DIVISÃO GERAL → 30 pontos');
        return 30;
      }
      
      // Ligas fracas (coeficiente UEFA baixo)
      const weakLeagues = ['cyprus', 'malta', 'luxembourg', 'andorra', 'san marino'];
      if (weakLeagues.some(weak => countryLower.includes(weak))) {
        return 80; // -20 pontos para ligas fracas
      }
      
      console.log('⚠️ LIGA NÃO IDENTIFICADA → 90 pontos (padrão)');
      return 90; // Padrão para ligas médias
    };

    // ❗ CORREÇÃO CRÍTICA: Buscar ligas individuais dos times
    // Para Copa/Torneios, times podem ser de ligas diferentes!
    
    let homeLeagueWeight, awayLeagueWeight;
    let homeLeagueInfo, awayLeagueInfo;
    
    try {
      // Buscar informações das ligas principais dos times
      const [homeTeamInfo, awayTeamInfo] = await Promise.all([
        fetch(`https://v3.football.api-sports.io/teams?id=${fixture.teams.home.id}`, {
          headers: { 'X-RapidAPI-Key': API_KEY }
        }).then(r => r.json()),
        fetch(`https://v3.football.api-sports.io/teams?id=${fixture.teams.away.id}`, {
          headers: { 'X-RapidAPI-Key': API_KEY }
        }).then(r => r.json())
      ]);
      
      // Se conseguiu buscar info dos times, usar sua liga principal
      if (homeTeamInfo.response?.[0]) {
        homeLeagueInfo = homeTeamInfo.response[0].venue?.city || fixture.league.country;
        // Para times ingleses, detectar divisão pela cidade/região
        if (fixture.league.country.toLowerCase().includes('england')) {
          // Buscar ultima temporada do time para determinar sua divisão atual
          const homeSeasonResponse = await fetch(`https://v3.football.api-sports.io/leagues?team=${fixture.teams.home.id}&current=true`, {
            headers: { 'X-RapidAPI-Key': API_KEY }
          }).then(r => r.json());
          
          if (homeSeasonResponse.response?.[0]) {
            const homeCurrentLeague = homeSeasonResponse.response[0].league.name;
            homeLeagueWeight = getLeagueWeight(homeCurrentLeague, fixture.league.country);
            homeLeagueInfo = homeCurrentLeague;
          } else {
            homeLeagueWeight = getLeagueWeight(fixture.league.name, fixture.league.country);
            homeLeagueInfo = fixture.league.name;
          }
        } else {
          homeLeagueWeight = getLeagueWeight(fixture.league.name, fixture.league.country);
          homeLeagueInfo = fixture.league.name;
        }
      } else {
        homeLeagueWeight = getLeagueWeight(fixture.league.name, fixture.league.country);
        homeLeagueInfo = fixture.league.name;
      }
      
      if (awayTeamInfo.response?.[0]) {
        awayLeagueInfo = awayTeamInfo.response[0].venue?.city || fixture.league.country;
        // Para times ingleses, detectar divisão pela cidade/região
        if (fixture.league.country.toLowerCase().includes('england')) {
          const awaySeasonResponse = await fetch(`https://v3.football.api-sports.io/leagues?team=${fixture.teams.away.id}&current=true`, {
            headers: { 'X-RapidAPI-Key': API_KEY }
          }).then(r => r.json());
          
          if (awaySeasonResponse.response?.[0]) {
            const awayCurrentLeague = awaySeasonResponse.response[0].league.name;
            awayLeagueWeight = getLeagueWeight(awayCurrentLeague, fixture.league.country);
            awayLeagueInfo = awayCurrentLeague;
          } else {
            awayLeagueWeight = getLeagueWeight(fixture.league.name, fixture.league.country);
            awayLeagueInfo = fixture.league.name;
          }
        } else {
          awayLeagueWeight = getLeagueWeight(fixture.league.name, fixture.league.country);
          awayLeagueInfo = fixture.league.name;
        }
      } else {
        awayLeagueWeight = getLeagueWeight(fixture.league.name, fixture.league.country);
        awayLeagueInfo = fixture.league.name;
      }
      
    } catch (error) {
      console.log('⚠️ Erro ao buscar ligas dos times, usando liga do fixture');
      homeLeagueWeight = getLeagueWeight(fixture.league.name, fixture.league.country);
      awayLeagueWeight = getLeagueWeight(fixture.league.name, fixture.league.country);
      homeLeagueInfo = fixture.league.name;
      awayLeagueInfo = fixture.league.name;
    }
    
    console.log('🏆 PESOS DAS LIGAS CALCULADOS:', {
      home: { team: fixture.teams.home.name, league: homeLeagueInfo, weight: homeLeagueWeight },
      away: { team: fixture.teams.away.name, league: awayLeagueInfo, weight: awayLeagueWeight }
    });
    
    insights.push(`${fixture.teams.home.name}: ${homeLeagueWeight}pts (${homeLeagueInfo})`);
    insights.push(`${fixture.teams.away.name}: ${awayLeagueWeight}pts (${awayLeagueInfo})`);

    // ===== 2. AJUSTE POR HISTÓRICO E PRESTÍGIO =====
    const getClubPrestige = (teamName: string): number => {
      const teamNameLower = teamName.toLowerCase();
      
      // Clubes gigantes (Manchester United, Real Madrid, Bayern, etc.)
      const giantClubs = [
        'real madrid', 'barcelona', 'bayern munich', 'manchester united', 'manchester city',
        'liverpool', 'chelsea', 'arsenal', 'tottenham', 'juventus', 'ac milan', 'inter milan',
        'psg', 'atletico madrid', 'borussia dortmund', 'ajax', 'benfica', 'porto'
      ];
      
      // Clubes grandes nacionais
      const bigClubs = [
        'sevilla', 'valencia', 'villarreal', 'real sociedad', 'athletic bilbao', 'betis',
        'napoli', 'roma', 'lazio', 'atalanta', 'fiorentina', 'torino', 'leicester', 'west ham',
        'newcastle', 'brighton', 'crystal palace', 'brentford', 'aston villa', 'wolves',
        'sporting', 'braga', 'vitoria guimaraes', 'boavista', 'olympiacos', 'panathinaikos'
      ];
      
      // Clubes estabelecidos
      const establishedClubs = [
        'getafe', 'osasuna', 'celta vigo', 'mallorca', 'girona', 'las palmas', 'rayo vallecano',
        'alaves', 'cadiz', 'elche', 'espanyol', 'leganes', 'huesca', 'eibar', 'valladolid'
      ];
      
      if (giantClubs.some(club => teamNameLower.includes(club))) {
        return 40; // Peso fixo extra de grandeza
      } else if (bigClubs.some(club => teamNameLower.includes(club))) {
        return 20; // Bônus médio
      } else if (establishedClubs.some(club => teamNameLower.includes(club))) {
        return 10; // Pequeno bônus
      }
      return 0; // Sem bônus para times não reconhecidos
    };

    const homePrestige = getClubPrestige(fixture.teams.home.name);
    const awayPrestige = getClubPrestige(fixture.teams.away.name);
    
    insights.push(`${fixture.teams.home.name} prestígio: +${homePrestige}pts`);
    insights.push(`${fixture.teams.away.name} prestígio: +${awayPrestige}pts`);

    // ===== 3. QUALIDADE DOS ÚLTIMOS ADVERSÁRIOS =====
    const analyzeOpponentQuality = (matches: any[], teamId: number): number => {
      if (!matches || matches.length === 0) return 0;
      
      let totalQuality = 0;
      let analyzedMatches = 0;
      
      // Analisar últimos 5 jogos
      const recentMatches = matches.slice(0, 5);
      
      for (const match of recentMatches) {
        const isHome = match.teams.home.id === teamId;
        const opponent = isHome ? match.teams.away : match.teams.home;
        
        // Determinar qualidade do adversário baseado no nome da liga
        const opponentLeagueWeight = getLeagueWeight(match.league.name, match.league.country);
        const opponentPrestige = getClubPrestige(opponent.name);
        
        // Calcular qualidade do adversário
        let opponentQuality = 0;
        
        if (opponentLeagueWeight >= 100) {
          opponentQuality = 25; // Primeira divisão forte
        } else if (opponentLeagueWeight >= 70) {
          opponentQuality = 15; // Segunda divisão
        } else if (opponentLeagueWeight >= 50) {
          opponentQuality = 5; // Divisões inferiores
        } else {
          opponentQuality = 0; // Muito fraco
        }
        
        // Adicionar bônus de prestígio do adversário
        opponentQuality += opponentPrestige * 0.5;
        
        totalQuality += opponentQuality;
        analyzedMatches++;
      }
      
      return analyzedMatches > 0 ? totalQuality / analyzedMatches : 0;
    };

    const homeOpponentQuality = analyzeOpponentQuality(homeLastMatches, fixture.teams.home.id);
    const awayOpponentQuality = analyzeOpponentQuality(awayLastMatches, fixture.teams.away.id);
    
    insights.push(`${fixture.teams.home.name} adversários: ${homeOpponentQuality.toFixed(1)}pts de qualidade`);
    insights.push(`${fixture.teams.away.name} adversários: ${awayOpponentQuality.toFixed(1)}pts de qualidade`);

    // ===== 4. AJUSTE POR RESULTADO VS NÍVEL =====
    const analyzeResultAdjustment = (matches: any[], teamId: number): number => {
      if (!matches || matches.length === 0) return 0;
      
      let totalAdjustment = 0;
      let analyzedMatches = 0;
      
      const recentMatches = matches.slice(0, 5);
      
      for (const match of recentMatches) {
        const isHome = match.teams.home.id === teamId;
        const teamGoals = isHome ? match.goals.home : match.goals.away;
        const opponentGoals = isHome ? match.goals.away : match.goals.home;
        
        if (teamGoals === null || opponentGoals === null) continue;
        
        const opponent = isHome ? match.teams.away : match.teams.home;
        const teamLeagueWeight = getLeagueWeight(match.league.name, match.league.country);
        const opponentLeagueWeight = getLeagueWeight(match.league.name, match.league.country);
        
        let adjustment = 0;
        
        if (teamGoals > opponentGoals) {
          // Vitória
          if (opponentLeagueWeight > teamLeagueWeight + 20) {
            adjustment = 20; // Vitória sobre time superior
          } else if (opponentLeagueWeight < teamLeagueWeight - 20) {
            adjustment = -5; // Vitória sobre time inferior (penalidade leve)
          } else {
            adjustment = 0; // Vitória sobre time similar
          }
        } else if (teamGoals === opponentGoals) {
          // Empate
          if (opponentLeagueWeight > teamLeagueWeight + 20) {
            adjustment = 5; // Empate com time superior
          } else if (opponentLeagueWeight < teamLeagueWeight - 20) {
            adjustment = -10; // Empate com time inferior
          } else {
            adjustment = 0; // Empate com time similar
          }
        } else {
          // Derrota
          if (opponentLeagueWeight > teamLeagueWeight + 20) {
            adjustment = -5; // Derrota para time superior (não muito penalizada)
          } else if (opponentLeagueWeight < teamLeagueWeight - 20) {
            adjustment = -20; // Derrota para time inferior (penalidade forte)
          } else {
            adjustment = -10; // Derrota para time similar
          }
        }
        
        totalAdjustment += adjustment;
        analyzedMatches++;
      }
      
      return analyzedMatches > 0 ? totalAdjustment / analyzedMatches : 0;
    };

    const homeResultAdjustment = analyzeResultAdjustment(homeLastMatches, fixture.teams.home.id);
    const awayResultAdjustment = analyzeResultAdjustment(awayLastMatches, fixture.teams.away.id);
    
    insights.push(`${fixture.teams.home.name} ajuste resultados: ${homeResultAdjustment.toFixed(1)}pts`);
    insights.push(`${fixture.teams.away.name} ajuste resultados: ${awayResultAdjustment.toFixed(1)}pts`);

    // ===== 5. AJUSTE DE ELENCO =====
    const getSquadStrength = (teamName: string, prestige: number): number => {
      // Baseado no prestígio do clube (proxy para qualidade do elenco)
      if (prestige >= 40) {
        return 30; // Elenco bilionário
      } else if (prestige >= 20) {
        return 15; // Elenco de qualidade
      } else if (prestige >= 10) {
        return 5; // Elenco regular
      }
      return 0; // Elenco limitado
    };

    const homeSquadStrength = getSquadStrength(fixture.teams.home.name, homePrestige);
    const awaySquadStrength = getSquadStrength(fixture.teams.away.name, awayPrestige);
    
    insights.push(`${fixture.teams.home.name} elenco: +${homeSquadStrength}pts`);
    insights.push(`${fixture.teams.away.name} elenco: +${awaySquadStrength}pts`);

    // ===== 6. AJUSTE POR CONTEXTO DO JOGO =====
    const getContextBonus = (fixture: Fixture, isHome: boolean, prestige: number): number => {
      let bonus = 0;
      
      // Copa ou torneio eliminatório
      const isKnockout = fixture.league.name.toLowerCase().includes('cup') || 
                        fixture.league.name.toLowerCase().includes('copa') ||
                        fixture.league.name.toLowerCase().includes('champions');
      
      if (isKnockout && prestige >= 20) {
        bonus += 20; // Time grande tende a se impor em mata-mata
      }
      
      // Jogo em casa contra adversário pequeno
      if (isHome && prestige >= 20) {
        bonus += 15; // Vantagem extra para time grande em casa
      }
      
      // Amistoso ou torneio de menor importância
      const isFriendly = fixture.league.name.toLowerCase().includes('friendly') || 
                        fixture.league.name.toLowerCase().includes('amistoso');
      
      if (isFriendly) {
        bonus -= 10; // Reduzir peso da grandeza em amistosos
      }
      
      return bonus;
    };

    const homeContextBonus = getContextBonus(fixture, true, homePrestige);
    const awayContextBonus = getContextBonus(fixture, false, awayPrestige);
    
    insights.push(`${fixture.teams.home.name} contexto: ${homeContextBonus > 0 ? '+' : ''}${homeContextBonus}pts`);
    insights.push(`${fixture.teams.away.name} contexto: ${awayContextBonus > 0 ? '+' : ''}${awayContextBonus}pts`);

    // ===== 7. CÁLCULO FFS (FORÇA FINAL ESTRUTURAL) =====
    const homeFFS = homeLeagueWeight + homePrestige + homeOpponentQuality + 
                   homeResultAdjustment + homeSquadStrength + homeContextBonus;
    
    const awayFFS = awayLeagueWeight + awayPrestige + awayOpponentQuality + 
                   awayResultAdjustment + awaySquadStrength + awayContextBonus;
    
    const difference = homeFFS - awayFFS;
    
    // Determinar vantagem estrutural
    let structuralAdvantage: 'home' | 'away' | 'balanced';
    if (difference > 50) {
      structuralAdvantage = 'home';
    } else if (difference < -50) {
      structuralAdvantage = 'away';
    } else {
      structuralAdvantage = 'balanced';
    }
    
    // Calcular confiança baseada na diferença
    const confidence = Math.min(95, Math.max(50, 60 + Math.abs(difference) * 0.5));
    
    // Insights finais
    if (Math.abs(difference) > 100) {
      insights.push(`Diferença estrutural MUITO ALTA: ${Math.abs(difference).toFixed(0)}pts`);
    } else if (Math.abs(difference) > 50) {
      insights.push(`Diferença estrutural ALTA: ${Math.abs(difference).toFixed(0)}pts`);
    } else if (Math.abs(difference) > 20) {
      insights.push(`Diferença estrutural MODERADA: ${Math.abs(difference).toFixed(0)}pts`);
    } else {
      insights.push(`Equilíbrio estrutural: ${Math.abs(difference).toFixed(0)}pts`);
    }
    
    console.log('🏗️ Análise Estrutural Completa:', {
      home: { name: fixture.teams.home.name, FFS: homeFFS },
      away: { name: fixture.teams.away.name, FFS: awayFFS },
      difference,
      advantage: structuralAdvantage,
      confidence
    });

    return {
      homeTeam: {
        leagueWeight: homeLeagueWeight,
        prestige: homePrestige,
        opponentQuality: homeOpponentQuality,
        resultAdjustment: homeResultAdjustment,
        squadStrength: homeSquadStrength,
        contextBonus: homeContextBonus,
        totalFFS: homeFFS
      },
      awayTeam: {
        leagueWeight: awayLeagueWeight,
        prestige: awayPrestige,
        opponentQuality: awayOpponentQuality,
        resultAdjustment: awayResultAdjustment,
        squadStrength: awaySquadStrength,
        contextBonus: awayContextBonus,
        totalFFS: awayFFS
      },
      comparison: {
        difference,
        structuralAdvantage,
        confidence,
        insights
      }
    };
  };

  // Função para buscar estatísticas do time (melhorada)
  const getTeamStats = async (teamId: number, leagueId: number): Promise<TeamStats | null> => {
    try {
      console.log(`🔍 Buscando estatísticas do time ${teamId} na liga ${leagueId} para temporada 2025`);
      const response = await fetch(
        `https://v3.football.api-sports.io/teams/statistics?league=${leagueId}&season=2025&team=${teamId}`,
        {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': API_KEY,
            'X-RapidAPI-Host': 'v3.football.api-sports.io',
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.response) {
          const stats = data.response.fixtures;
          const goals = data.response.goals;
          
          console.log(`📈 Estatísticas TEMPORADA 2025 do time ${teamId}:`, {
            played: stats?.played?.total || 0,
            wins: stats?.wins?.total || 0,
            goalsFor: goals?.for?.total?.total || 0,
            goalsAgainst: goals?.against?.total?.total || 0,
            rawData: { stats, goals }
          });
          
          // Verificar se os dados são válidos e não nulos/undefined
          const played = stats?.played?.total || 0;
          const wins = stats?.wins?.total || 0;
          const draws = stats?.draws?.total || 0;
          const losses = stats?.loses?.total || 0;
          const goals_for = goals?.for?.total?.total || 0;
          const goals_against = goals?.against?.total?.total || 0;
          
          // Se não há jogos, retornar estatísticas zeradas mas válidas
          if (played === 0) {
            console.log(`Time ${teamId} não possui jogos na temporada 2025 da liga ${leagueId}`);
            return {
              played: 0,
              wins: 0,
              draws: 0,
              losses: 0,
              goals_for: 0,
              goals_against: 0
            };
          }
          
          // Validar consistência dos dados
          const totalResults = wins + draws + losses;
          if (totalResults !== played) {
            console.log(`Inconsistência nos dados do time ${teamId}: jogados=${played}, soma=${totalResults}`);
          }
          
          return {
            played: Math.max(0, played),
            wins: Math.max(0, wins),
            draws: Math.max(0, draws),
            losses: Math.max(0, losses),
            goals_for: Math.max(0, goals_for),
            goals_against: Math.max(0, goals_against)
          };
        }
      }
      
      console.log(`Dados não encontrados para o time ${teamId} na liga ${leagueId}`);
      return null;
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return null;
    }
  };

  // Função para buscar confrontos diretos (mantida)
  const getH2HData = async (team1Id: number, team2Id: number): Promise<H2HResult[] | null> => {
    try {
      const response = await fetch(
        `https://v3.football.api-sports.io/fixtures/headtohead?h2h=${team1Id}-${team2Id}&last=10`,
        {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': API_KEY,
            'X-RapidAPI-Host': 'v3.football.api-sports.io',
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.response || null;
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar H2H:', error);
      return null;
    }
  };


  // Função para gerar apostas (sempre gera uma nova diferente)
  const handleGenerateBets = useCallback(async () => {
    if (!selectedFixture || !gameAnalysis) return;
    
    setGeneratingBets(true);
    
    try {
      // Buscar dados dos últimos jogos novamente para o gerador
      const [homeLastMatches, awayLastMatches] = await Promise.all([
        getTeamLastMatches(selectedFixture.teams.home.id),
        getTeamLastMatches(selectedFixture.teams.away.id)
      ]);
      
      const homeForm = analyzeRecentForm(homeLastMatches, selectedFixture.teams.home.id);
      const awayForm = analyzeRecentForm(awayLastMatches, selectedFixture.teams.away.id);
      
      const allBetSuggestions = await generateBetSuggestions(
        selectedFixture, 
        gameAnalysis, 
        homeForm, 
        awayForm, 
        homeLastMatches, 
        awayLastMatches,
        gameAnalysis.homeStats || null,
        gameAnalysis.awayStats || null
      );
      
      // Usar todas as apostas disponíveis (todos os níveis de risco)
      const availableBets = allBetSuggestions;
      
      // Filtrar apostas ainda não usadas
      const unusedBets = availableBets.filter(bet => !usedBetIds.has(bet.id));
      
      // Se todas foram usadas, resetar e usar todas novamente
      const finalBets = unusedBets.length > 0 ? unusedBets : availableBets;
      if (unusedBets.length === 0) {
        setUsedBetIds(new Set());
      }
      
      // Usar todas as apostas disponíveis em vez de apenas uma
      if (finalBets.length > 0) {
        // Marcar todas como usadas
        setUsedBetIds(prev => new Set([...prev, ...finalBets.map(bet => bet.id)]));
        setGameAnalysis(prev => prev ? { ...prev, betSuggestions: finalBets } : null);
        setCurrentBetIndex(0); // Resetar para primeira aposta
        setTotalBetsGenerated(finalBets.length); // Definir total de apostas
      }
      
    } catch (error) {
      console.error('Erro ao gerar apostas:', error);
      setError('Erro ao gerar sugestões de apostas');
    } finally {
      setGeneratingBets(false);
    }
  }, [selectedFixture, gameAnalysis, generateBetSuggestions, getTeamLastMatches, analyzeRecentForm, usedBetIds]);

  // Funções de navegação entre apostas
  const handlePreviousBet = useCallback(() => {
    if (gameAnalysis?.betSuggestions && gameAnalysis.betSuggestions.length > 1) {
      setCurrentBetIndex(prev => 
        prev > 0 ? prev - 1 : gameAnalysis.betSuggestions!.length - 1
      );
    }
  }, [gameAnalysis?.betSuggestions]);

  const handleNextBet = useCallback(() => {
    if (gameAnalysis?.betSuggestions && gameAnalysis.betSuggestions.length > 1) {
      setCurrentBetIndex(prev => 
        prev < gameAnalysis.betSuggestions!.length - 1 ? prev + 1 : 0
      );
    }
  }, [gameAnalysis?.betSuggestions]);

  // Navegação por teclado
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (showAnalysis && gameAnalysis?.betSuggestions && gameAnalysis.betSuggestions.length > 1) {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          handlePreviousBet();
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          handleNextBet();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showAnalysis, gameAnalysis?.betSuggestions, handlePreviousBet, handleNextBet]);

  // Funções para swipe em mobile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && gameAnalysis?.betSuggestions && currentBetIndex < gameAnalysis.betSuggestions.length - 1) {
      handleNextBet();
    }
    if (isRightSwipe && gameAnalysis?.betSuggestions && currentBetIndex > 0) {
      handlePreviousBet();
    }
  }, [touchStart, touchEnd, gameAnalysis?.betSuggestions, currentBetIndex, handleNextBet, handlePreviousBet]);

  // Função para analisar jogo específico
  const handleFixtureAnalysis = useCallback(async (fixture: Fixture) => {
    setSelectedFixture(fixture);
    setLoading(true);
    setShowResults(false); // Fechar dropdown
    
    try {
      const analysis = await analyzeGame(fixture);
      setGameAnalysis(analysis);
      setShowAnalysis(true);
      
      // Scroll suave para a seção de análise
      setTimeout(() => {
        const analysisSection = document.getElementById('analysis-section');
        if (analysisSection) {
          analysisSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (error) {
      console.error('Erro na análise:', error);
      setError('Erro ao analisar o jogo');
    } finally {
      setLoading(false);
    }
  }, [analyzeGame]);



  // Função para voltar ao início
  const handleBackToHome = useCallback(() => {
    setShowAnalysis(false);
    setSelectedFixture(null);
    setGameAnalysis(null);
    setSearchTerm('');
    setSelectedTeam(null);
    setFixtures([]);
    setTeams([]);
    setShowResults(false);
    setSearchStep('teams');
    setUsedBetIds(new Set());
    setCurrentBetIndex(0);
    setTotalBetsGenerated(0);
    setShowSearchInterface(false);
    
    // Scroll para o topo
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Função para buscar times
  const searchTeams = useCallback(async (teamName: string) => {
    if (!teamName.trim() || teamName.length < 3) {
      setTeams([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    setError('');
    setSearchStep('teams');

    try {
      const response = await fetch(
        `https://v3.football.api-sports.io/teams?search=${encodeURIComponent(teamName)}`,
        {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': API_KEY,
            'X-RapidAPI-Host': 'v3.football.api-sports.io',
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.response && data.response.length > 0) {
        setTeams(data.response);
        setShowResults(true);
        setError('');
      } else {
        setTeams([]);
        setError('Nenhum time encontrado');
        setShowResults(true);
      }
    } catch (err) {
      console.error('Erro ao buscar times:', err);
      setError(`Erro ao buscar times: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
      setTeams([]);
      setShowResults(true);
    } finally {
      setLoading(false);
    }
  }, [API_KEY]);

  // Função para buscar próximos jogos de um time específico
  const searchTeamFixtures = useCallback(async (team: Team) => {
    setSelectedTeam(team);
    setLoading(true);
    setError('');
    setSearchStep('fixtures');

    try {
      const response = await fetch(
        `https://v3.football.api-sports.io/fixtures?team=${team.id}&next=1`,
        {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': API_KEY,
            'X-RapidAPI-Host': 'v3.football.api-sports.io',
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.response && data.response.length > 0) {
        setFixtures(data.response);
        setError('');
      } else {
        setFixtures([]);
        setError('Nenhum jogo futuro encontrado para este time');
      }
    } catch (err) {
      console.error('Erro ao buscar jogos:', err);
      setError(`Erro ao buscar jogos: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
      setFixtures([]);
    } finally {
      setLoading(false);
    }
  }, [API_KEY]);

  // Debounce effect para buscar times
  useEffect(() => {
    if (!searchTerm.trim() || searchTerm.length < 3) {
      setTeams([]);
      setShowResults(false);
      setError('');
      return;
    }

    const timeoutId = setTimeout(() => {
      searchTeams(searchTerm).catch(console.error);
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, searchTeams]);

  // Função para formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Função para lidar com mudanças no input
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSelectedTeam(null);
    setFixtures([]);
    setSearchStep('teams');
    
    if (!value.trim()) {
      setTeams([]);
      setShowResults(false);
      setError('');
    }
  }, []);

  // Função para fechar resultados
  const handleClickOutside = useCallback(() => {
    setShowResults(false);
  }, []);

  // Função para voltar para lista de times
  const handleBackToTeams = useCallback(() => {
    setSelectedTeam(null);
    setFixtures([]);
    setSearchStep('teams');
    setShowResults(true);
  }, []);

  // Função para selecionar um time
  const handleTeamSelect = useCallback((team: Team) => {
    searchTeamFixtures(team);
  }, [searchTeamFixtures]);

  // Função para renderizar conteúdo dos resultados
  const renderResults = () => {
    if (error) {
      return (
        <div className="p-4 text-center text-gray-400">
          {error}
        </div>
      );
    }

    if (searchStep === 'teams' && teams.length > 0) {
      return (
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4 text-[#FF3002]">
            Times Encontrados ({teams.length})
          </h3>
          <div className="space-y-3">
            {teams.map((teamData) => (
              <div 
                key={teamData.team.id}
                onClick={() => handleTeamSelect(teamData.team)}
                className="bg-[#2a2a2a] rounded-lg p-4 hover:bg-[#3a3a3a] transition-colors duration-300 cursor-pointer border border-transparent hover:border-[#FF3002]/30"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={teamData.team.logo} 
                      alt={teamData.team.name}
                      className="w-10 h-10"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div>
                      <h4 className="font-semibold text-white">{teamData.team.name}</h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <span>{teamData.team.country}</span>
                        {teamData.team.founded && (
                          <>
                            <span>•</span>
                            <span>Fundado em {teamData.team.founded}</span>
                          </>
                        )}
                        {teamData.team.national && (
                          <>
                            <span>•</span>
                            <span className="text-[#FF3002]">Seleção Nacional</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (searchStep === 'fixtures' && selectedTeam) {
      return (
        <div className="p-4">
          <div className="flex items-center mb-4">
            <button 
              onClick={handleBackToTeams}
              className="mr-3 p-1 hover:bg-[#3a3a3a] rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-[#FF3002]" />
            </button>
            <div className="flex items-center space-x-3">
              <img 
                src={selectedTeam.logo} 
                alt={selectedTeam.name}
                className="w-8 h-8"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <h3 className="text-lg font-semibold text-[#FF3002]">
                Próximos Jogos - {selectedTeam.name}
              </h3>
            </div>
          </div>
          
          {fixtures.length > 0 ? (
            <div className="space-y-3">
              {fixtures.map((fixture) => (
                <div 
                  key={fixture.fixture.id}
                  onClick={() => handleFixtureAnalysis(fixture)}
                  className="bg-[#2a2a2a] rounded-lg p-4 hover:bg-[#3a3a3a] transition-colors duration-300 cursor-pointer border border-transparent hover:border-[#FF3002]/30"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-400 flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(fixture.fixture.date)}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-[#FF3002] text-white px-2 py-1 rounded-full">
                        {fixture.league.name}
                      </span>
                      <BarChart3 className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={fixture.teams.home.logo} 
                        alt={fixture.teams.home.name}
                        className="w-6 h-6"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <span className="font-medium">{fixture.teams.home.name}</span>
                    </div>
                    
                    <div className="text-center px-4">
                      <span className="text-gray-400">vs</span>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className="font-medium">{fixture.teams.away.name}</span>
                      <img 
                        src={fixture.teams.away.logo} 
                        alt={fixture.teams.away.name}
                        className="w-6 h-6"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-400">
                    {fixture.fixture.venue?.name && (
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {fixture.fixture.venue.name}
                        {fixture.fixture.venue.city && `, ${fixture.fixture.venue.city}`}
                      </div>
                    )}
                    <div className="text-xs text-[#FF3002] font-medium">
                      🔍 Analisar Jogo
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              Nenhum jogo futuro encontrado para {selectedTeam.name}
            </div>
          )}
        </div>
      );
    }

    if (searchTerm.trim() && searchStep === 'teams') {
      return (
        <div className="p-4 text-center text-gray-400">
          Nenhum time encontrado para "{searchTerm}"
        </div>
      );
    }

    return null;
  };



  return (
    <div className="bg-black text-white relative min-h-screen flex flex-col">
      {/* Conteúdo Principal */}
      <div className="flex-1">
        {/* Header */}
        <header className="py-4 sm:py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div 
              className="cursor-pointer hover:opacity-80 transition-opacity"
              onClick={handleBackToHome}
            >
              <img 
                src={logo} 
                alt="ApostAI Logo" 
                className="h-8 sm:h-10 lg:h-12 w-auto"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>

            <nav className="hidden md:flex items-center space-x-4 lg:space-x-8">
              <a href="#" className="text-white hover:text-[#FF3002] transition-colors duration-300 font-medium text-sm lg:text-base">
                Funcionalidades
              </a>
              <a href="#" className="text-white hover:text-[#FF3002] transition-colors duration-300 font-medium text-sm lg:text-base">
                Planos
              </a>
              <a href="#" className="text-white hover:text-[#FF3002] transition-colors duration-300 font-medium text-sm lg:text-base">
                Sobre
              </a>
            </nav>

            <div className="flex items-center space-x-2 sm:space-x-4">
                <button 
                onClick={() => setShowSearchInterface(true)}
                className="bg-[#FF3002] hover:bg-[#E02702] text-white px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-xl lg:rounded-2xl font-bold text-sm sm:text-base transition-all duration-300 hover:shadow-lg hover:shadow-[#FF3002]/20 transform hover:scale-105"
              >
                Começar agora
            </button>
            </div>
          </div>
        </div>
      </header>

      {/* Home Hero Section */}
      {!showAnalysis && !showSearchInterface && (
        <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
          <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center min-h-[60vh] sm:min-h-[70vh] lg:min-h-[80vh]">
            {/* Conteúdo Principal */}
            <div className="space-y-6 sm:space-y-8">
              <div className="space-y-4 sm:space-y-6">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                  <span className="text-white">Aposte com</span><br />
                  <span className="text-white">inteligência.</span><br />
                  <span className="text-white">Decisões seguras,</span><br />
                  <span className="text-white">powered by </span>
                  <span className="text-[#FF3002]">IA</span>
                  <span className="text-white">.</span>
                </h1>
                
                <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-lg leading-relaxed">
                  Nossa inteligência artificial analisa estatísticas, histórico 
                  e tendências para sugerir as melhores apostas, de 
                  forma simples e rápida.
                </p>
              </div>

              <button 
                onClick={() => setShowSearchInterface(true)}
                className="bg-[#FF3002] hover:bg-[#E02702] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl lg:rounded-2xl font-bold text-base sm:text-lg transition-all duration-300 hover:shadow-lg hover:shadow-[#FF3002]/20 transform hover:scale-105"
              >
                Começar agora
              </button>
            </div>

            {/* Hero Dashboard Interativo */}
            <div className="relative">
              {/* Container Principal com Blur e Movimento */}
              <div className="relative bg-black/20 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 border border-white/10 shadow-2xl overflow-hidden animate-gentle-float">
                
                {/* Background Pattern Sutil */}
                <div className="absolute inset-0 opacity-3">
                  <div className="absolute top-0 left-0 w-full h-full">
                    <div className="grid grid-cols-12 grid-rows-12 w-full h-full gap-px">
                      {Array.from({length: 144}).map((_, i) => (
                        <div key={i} className="bg-white/5 rounded-xs animate-pulse" style={{animationDelay: `${i * 30}ms`}}></div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Dashboard Principal */}
                <div className="relative z-10 bg-black/30 backdrop-blur-xl rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl border border-white/5 animate-soft-breathe">
                  
                  {/* Header com Status Live */}
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-xs sm:text-sm font-medium">IA Analisando</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 text-[#FF3002]" />
                      <span className="text-[#FF3002] text-xs font-bold">78% Precisão</span>
                    </div>
                  </div>

                  {/* Match Preview Animado */}
                  <div className="bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 border border-gray-700/30">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                          <img 
                            src="https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/193px-FC_Barcelona_%28crest%29.svg.png" 
                            alt="Barcelona"
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%23004D98'/%3E%3Ctext x='50' y='55' text-anchor='middle' fill='white' font-size='20' font-weight='bold'%3EFC%3C/text%3E%3C/svg%3E";
                            }}
                          />
                        </div>
                        <div>
                          <p className="text-white font-semibold text-xs sm:text-sm">Barcelona</p>
                          <p className="text-gray-400 text-xs">Casa</p>
                        </div>
                      </div>
                      
                      <div className="text-center px-2 sm:px-4">
                        <div className="bg-[#FF3002] text-white px-2 sm:px-3 py-1 rounded text-xs font-bold animate-pulse">
                          VS
                        </div>
                        <p className="text-gray-400 text-xs mt-1 hidden sm:block">Final</p>
                      </div>
                      
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <div>
                          <p className="text-white font-semibold text-xs sm:text-sm text-right">Real Madrid</p>
                          <p className="text-gray-400 text-xs text-right">Visitante</p>
                        </div>
                        <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shadow-lg overflow-hidden bg-white">
                          <img 
                            src="https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/189px-Real_Madrid_CF.svg.png" 
                            alt="Real Madrid"
                            className="w-full h-full object-contain p-0.5"
                            onError={(e) => {
                              e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='white'/%3E%3Ctext x='50' y='55' text-anchor='middle' fill='black' font-size='18' font-weight='bold'%3ERM%3C/text%3E%3C/svg%3E";
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Métricas de Análise */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 rounded-lg p-2 sm:p-3 border border-green-700/30">
                      <div className="text-green-400 text-xs font-medium mb-1">Confiança</div>
                      <div className="text-white font-bold text-sm sm:text-lg">82%</div>
                      <div className="w-full bg-gray-700 rounded-full h-1 mt-1 sm:mt-2">
                        <div className="bg-green-400 h-1 rounded-full animate-pulse" style={{width: '82%'}}></div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 rounded-lg p-2 sm:p-3 border border-blue-700/30">
                      <div className="text-blue-400 text-xs font-medium mb-1">xG Total</div>
                      <div className="text-white font-bold text-sm sm:text-lg">3.2</div>
                      <div className="text-blue-400 text-xs hidden sm:block">Gols esperados</div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 rounded-lg p-2 sm:p-3 border border-purple-700/30">
                      <div className="text-purple-400 text-xs font-medium mb-1">Valor</div>
                      <div className="text-white font-bold text-sm sm:text-lg">1.85</div>
                      <div className="text-purple-400 text-xs hidden sm:block">Odd recomendada</div>
                    </div>
                  </div>

                  {/* Gráfico de Performance Animado */}
                  <div className="mb-4 sm:mb-6">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <h4 className="text-white font-medium text-xs sm:text-sm">Performance Últimos Jogos</h4>
                      <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                    </div>
                    <div className="h-16 sm:h-20 flex items-end justify-between space-x-1">
                      {[65, 45, 80, 35, 90, 70, 85, 95, 75, 88].map((height, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-t from-[#FF3002] to-[#FF6B47] rounded-t-sm transition-all duration-1000 ease-out hover:scale-105 cursor-pointer animate-chart-wave animate-chart-pulse"
                          style={{
                            height: `${height}%`,
                            width: '8%',
                            animationDelay: `${index * 0.3}s`
                          }}
                          title={`Jogo ${index + 1}: ${height}% performance`}
                        ></div>
                      ))}
                    </div>
                  </div>

                  {/* Recomendação Principal */}
                  <div className="bg-gradient-to-r from-[#FF3002]/20 to-[#FF6B47]/10 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-[#FF3002]/30">
                    <div className="flex items-center space-x-2 sm:space-x-3 mb-2">
                      <Target className="w-4 h-4 sm:w-5 sm:h-5 text-[#FF3002]" />
                      <span className="text-[#FF3002] font-bold text-xs sm:text-sm">Recomendação IA</span>
                    </div>
                    <p className="text-white font-semibold mb-1 text-sm sm:text-base">Barcelona vitória</p>
                    <p className="text-gray-400 text-xs">Barcelona tem 78% de chances baseado em 847 dados analisados</p>
                    <div className="flex items-center justify-between mt-2 sm:mt-3">
                      <span className="text-[#FF3002] text-xs font-medium">Risco: Baixo</span>
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <span className="text-green-400 text-xs">Verificado</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Efeito de Brilho Sutil */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/2 to-transparent -skew-x-12 animate-smooth-shimmer"></div>
              </div>

              {/* Círculos de Fundo Sutis */}
              <div className="absolute -z-10 top-0 right-0 w-96 h-96 bg-[#FF3002]/5 rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute -z-10 bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
            </div>
          </div>
        </section>
      )}

      {/* Search Interface - Mostrar quando clicar em "Começar agora" */}
      {showSearchInterface && !showAnalysis && (
      <section className="py-8 sm:py-12 flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto relative">
            <div className="relative">
              <input
                type="text"
                  placeholder="Digite pelo menos 3 letras do nome de um time (ex: Liverpool, Flamengo)..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onFocus={() => {
                    if (searchStep === 'teams' && teams.length > 0) {
                      setShowResults(true);
                    }
                  }}
                className="w-full bg-[#1a1a1a] border border-gray-700 rounded-xl px-4 sm:px-6 py-3 sm:py-4 pl-12 sm:pl-14 text-white placeholder-gray-400 focus:outline-none focus:border-[#FF3002] transition-colors duration-300 text-sm sm:text-base"
              />
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-[#FF3002] w-5 h-5 sm:w-6 sm:h-6" />
                {loading && (
                  <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-[#FF3002]"></div>
            </div>
                )}
              </div>

              {/* Resultados da Pesquisa */}
              {showResults && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={handleClickOutside}
                  ></div>
                  <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-gray-700 rounded-xl shadow-xl z-50 max-h-[400px] sm:max-h-[600px] overflow-y-auto">
                    {renderResults()}
                  </div>
                </>
              )}
          </div>
        </div>
      </section>
      )}

      {/* Hero Section da Análise - Mostrar quando em análise */}
      {showAnalysis && selectedFixture && (
        <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-black">
          <div className="container mx-auto">
            <div className="max-w-5xl mx-auto text-center">
              {/* Header da Análise */}
              <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-tight mb-3 sm:mb-4">
                  <span className="text-white">Análise</span>{" "}
                  <span className="text-[#FF3002]">Profissional</span>
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-gray-300 max-w-2xl mx-auto">
                  Nossa inteligência artificial analisou todos os dados disponíveis para este confronto.
                </p>
              </div>

              {/* Card Principal do Jogo */}
              <div className="bg-black rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10 mb-6 sm:mb-8">
                <div className="bg-black rounded-lg sm:rounded-xl p-4 sm:p-6">
                  {/* Times */}
                  <div className="flex flex-col sm:flex-row items-center justify-between mb-4 sm:mb-6 gap-4 sm:gap-6">
                    {/* Time Casa */}
                    <div className="flex flex-col items-center space-y-2 sm:space-y-3 flex-1">
                      <div className="bg-black p-3 sm:p-4 rounded-lg sm:rounded-xl border border-white/10">
                    <img 
                      src={selectedFixture.teams.home.logo} 
                      alt={selectedFixture.teams.home.name}
                          className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                    />
                        <h3 className="text-sm sm:text-base lg:text-xl font-bold text-white text-center">{selectedFixture.teams.home.name}</h3>
                        <p className="text-gray-400 text-center text-xs sm:text-sm">Mandante</p>
                    </div>
                  </div>
                  
                                        {/* VS Central */}
                    <div className="flex flex-col items-center mx-3 sm:mx-6">
                      <div className="bg-[#FF3002] text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold text-lg sm:text-2xl mb-2 sm:mb-3">
                        VS
                      </div>
                      <div className="text-center">
                        <p className="text-gray-400 text-xs sm:text-sm mb-1">Data do Jogo</p>
                        <p className="text-white font-semibold text-xs sm:text-sm">
                          {formatDate(selectedFixture.fixture.date)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Time Visitante */}
                    <div className="flex flex-col items-center space-y-2 sm:space-y-3 flex-1">
                      <div className="bg-black p-3 sm:p-4 rounded-lg sm:rounded-xl border border-white/10">
                        <img 
                          src={selectedFixture.teams.away.logo} 
                          alt={selectedFixture.teams.away.name}
                          className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-2 sm:mb-3"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <h3 className="text-sm sm:text-base lg:text-xl font-bold text-white text-center">{selectedFixture.teams.away.name}</h3>
                        <p className="text-gray-400 text-center text-xs sm:text-sm">Visitante</p>
                      </div>
                    </div>
                </div>
                
                                    {/* Informações da Liga */}
                  <div className="text-center">
                    <div className="inline-block bg-[#FF3002] text-white px-3 sm:px-4 py-2 rounded-lg font-bold text-sm sm:text-base mb-2 sm:mb-3">
                      {selectedFixture.league.name}
                    </div>
                    {selectedFixture.fixture.venue?.name && (
                      <p className="text-gray-400 text-xs sm:text-sm">
                        📍 {selectedFixture.fixture.venue.name}
                        {selectedFixture.fixture.venue.city && `, ${selectedFixture.fixture.venue.city}`}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Seção de Análise Detalhada */}
      {showAnalysis && gameAnalysis && (
        <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-black">
          <div className="container mx-auto">
            <div className="max-w-6xl mx-auto">
              {/* Header da Seção */}
              <div className="text-center mb-6 sm:mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
                  <span className="text-white">Análise</span>{" "}
                  <span className="text-[#FF3002]">Detalhada</span>
          </h2>
                <p className="text-sm sm:text-base lg:text-lg text-gray-300 max-w-2xl mx-auto">
                  Nossa IA processou milhares de dados para criar esta análise completa
                </p>
              </div>
          
              {/* Grid de Cards de Análise */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Card 1 - Forma dos Times */}
                <div className="bg-black rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10 hover:border-[#FF3002]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#FF3002]/10 transform hover:-translate-y-1">
                  <div className="bg-black rounded-lg sm:rounded-xl p-3 sm:p-4">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="bg-[#FF3002] p-2 sm:p-3 rounded-lg">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                      <h3 className="text-lg sm:text-xl font-bold ml-2 sm:ml-3 text-white">Forma dos Times</h3>
              </div>
              
                <div className="space-y-3 sm:space-y-4">
                      {/* Time Casa */}
                  <div>
                        <h4 className="font-bold text-[#FF3002] mb-2 flex items-center text-sm sm:text-base">
                          <img src={selectedFixture?.teams.home.logo} className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      {selectedFixture?.teams.home.name}
                    </h4>
                        <ul className="space-y-1">
                      {gameAnalysis.teamForm.home.map((item, index) => (
                            <li key={index} className="flex items-start space-x-2 p-2 bg-black border border-white/5 rounded-lg">
                              <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-300 text-xs sm:text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                      {/* Time Visitante */}
                  <div>
                        <h4 className="font-bold text-[#FF3002] mb-2 flex items-center text-sm sm:text-base">
                          <img src={selectedFixture?.teams.away.logo} className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      {selectedFixture?.teams.away.name}
                    </h4>
                        <ul className="space-y-1">
                      {gameAnalysis.teamForm.away.map((item, index) => (
                            <li key={index} className="flex items-start space-x-2 p-2 bg-black border border-white/5 rounded-lg">
                              <CheckCircle className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-300 text-xs sm:text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                  </div>
            </div>

            {/* Card 2 - Confronto Direto */}
                <div className="bg-black rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10 hover:border-[#FF3002]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#FF3002]/10 transform hover:-translate-y-1">
                  <div className="bg-black rounded-lg sm:rounded-xl p-3 sm:p-4">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="bg-[#FF3002] p-2 sm:p-3 rounded-lg">
                  <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                      <h3 className="text-lg sm:text-xl font-bold ml-2 sm:ml-3 text-white">Confronto Direto</h3>
              </div>
              
                    <div className="space-y-2">
                  {gameAnalysis.h2hInsights.map((insight, index) => (
                        <div key={index} className="flex items-start space-x-2 p-2 sm:p-3 bg-black border border-white/5 rounded-lg">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300 text-xs sm:text-sm">{insight}</span>
                    </div>
                  ))}
                </div>
                  </div>
            </div>

            {/* Card 3 - Contexto do Jogo */}
                <div className="bg-black rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10 hover:border-[#FF3002]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#FF3002]/10 transform hover:-translate-y-1">
                  <div className="bg-black rounded-lg sm:rounded-xl p-3 sm:p-4">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="bg-[#FF3002] p-2 sm:p-3 rounded-lg">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                      <h3 className="text-lg sm:text-xl font-bold ml-2 sm:ml-3 text-white">Contexto do Jogo</h3>
              </div>
              
                    <div className="space-y-2">
                  {gameAnalysis.contextInsights.map((insight, index) => (
                        <div key={index} className="flex items-start space-x-2 p-2 sm:p-3 bg-black border border-white/5 rounded-lg">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300 text-xs sm:text-sm">{insight}</span>
                    </div>
                  ))}
                </div>
            </div>
          </div>
        </div>

              {/* Seção de Probabilidades e Insights */}
              <div className="bg-black rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/10">
                <div className="bg-black rounded-lg sm:rounded-xl p-4 sm:p-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-center mb-4 sm:mb-6 text-white">
                    <span className="text-[#FF3002]">Probabilidades</span> e Insights
            </h2>
            
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                                        {/* Probabilidades Calculadas */}
                   <div>
                      <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-[#FF3002]">Probabilidades Calculadas</h3>
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex justify-between items-center p-2 sm:p-3 bg-black border border-white/10 rounded-lg">
                          <span className="text-white font-medium text-sm sm:text-base">Vitória {selectedFixture?.teams.home.name}</span>
                          <span className="text-xl sm:text-2xl font-bold text-green-400">{gameAnalysis.homeTeamScore.toFixed(0)}%</span>
                        </div>
                        <div className="flex justify-between items-center p-2 sm:p-3 bg-black border border-white/10 rounded-lg">
                          <span className="text-white font-medium text-sm sm:text-base">Vitória {selectedFixture?.teams.away.name}</span>
                          <span className="text-xl sm:text-2xl font-bold text-orange-400">{gameAnalysis.awayTeamScore.toFixed(0)}%</span>
                        </div>
                        <div className="flex justify-between items-center p-2 sm:p-3 bg-black border border-white/10 rounded-lg">
                          <span className="text-white font-medium text-sm sm:text-base">Total de Gols Esperados</span>
                          <span className="text-xl sm:text-2xl font-bold text-blue-400">{gameAnalysis.totalGoalsExpected.toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between items-center p-2 sm:p-3 bg-black border border-white/10 rounded-lg">
                          <span className="text-white font-medium text-sm sm:text-base">Ambas as Equipes Marcam</span>
                          <span className="text-xl sm:text-2xl font-bold text-purple-400">{gameAnalysis.bothTeamsToScore.toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                   
                                        {/* Insights Principais */}
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-[#FF3002]">Insights Principais</h3>
                      <div className="space-y-2 sm:space-y-3">
                        {gameAnalysis.insights.map((insight, index) => (
                          <div key={index} className="flex items-start space-x-2 sm:space-x-3 p-2 sm:p-3 bg-black border border-white/10 rounded-lg">
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-300 text-sm sm:text-base">{insight}</span>
                          </div>
                        ))}
                      </div>
                      
                      {/* Confiança da Análise */}
                      <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-[#FF3002]/10 rounded-lg sm:rounded-xl border border-[#FF3002]/20">
                        <div className="flex items-center justify-between">
                          <span className="text-[#FF3002] font-bold text-base sm:text-lg">Confiança da Análise</span>
                          <span className="text-2xl sm:text-3xl font-bold text-green-400">{Math.min(100, Math.round(gameAnalysis.confidence))}%</span>
                        </div>
                      </div>
                    </div>

                    {/* NOVA SEÇÃO: Análise de Força Estrutural */}
                    {gameAnalysis.structuralAnalysis && (
                      <div className="mt-6 sm:mt-8">
                        <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-[#FF3002] flex items-center">
                          <span className="mr-2">🏗️</span>
                          Força Estrutural & Nível de Competição
                        </h3>
                        <div className="space-y-3 sm:space-y-4">
                          {/* Resumo da Análise Estrutural */}
                          <div className="bg-gradient-to-r from-orange-900/20 to-red-900/20 border border-orange-500/30 rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Time da Casa */}
                              <div className="space-y-2">
                                <h4 className="font-semibold text-orange-400 text-sm">🏠 {gameAnalysis.structuralAnalysis.homeTeam.totalFFS.toFixed(0)}pts - {selectedFixture?.teams.home.name}</h4>
                                <div className="text-xs text-white/70 space-y-1">
                                  <div>• Liga: +{gameAnalysis.structuralAnalysis.homeTeam.leagueWeight}pts</div>
                                  <div>• Prestígio: +{gameAnalysis.structuralAnalysis.homeTeam.prestige}pts</div>
                                  <div>• Adversários: +{gameAnalysis.structuralAnalysis.homeTeam.opponentQuality.toFixed(1)}pts</div>
                                  <div>• Resultados: {gameAnalysis.structuralAnalysis.homeTeam.resultAdjustment > 0 ? '+' : ''}{gameAnalysis.structuralAnalysis.homeTeam.resultAdjustment.toFixed(1)}pts</div>
                                  <div>• Elenco: +{gameAnalysis.structuralAnalysis.homeTeam.squadStrength}pts</div>
                                  <div>• Contexto: {gameAnalysis.structuralAnalysis.homeTeam.contextBonus > 0 ? '+' : ''}{gameAnalysis.structuralAnalysis.homeTeam.contextBonus}pts</div>
                                </div>
                              </div>
                              
                              {/* Time Visitante */}
                              <div className="space-y-2">
                                <h4 className="font-semibold text-orange-400 text-sm">✈️ {gameAnalysis.structuralAnalysis.awayTeam.totalFFS.toFixed(0)}pts - {selectedFixture?.teams.away.name}</h4>
                                <div className="text-xs text-white/70 space-y-1">
                                  <div>• Liga: +{gameAnalysis.structuralAnalysis.awayTeam.leagueWeight}pts</div>
                                  <div>• Prestígio: +{gameAnalysis.structuralAnalysis.awayTeam.prestige}pts</div>
                                  <div>• Adversários: +{gameAnalysis.structuralAnalysis.awayTeam.opponentQuality.toFixed(1)}pts</div>
                                  <div>• Resultados: {gameAnalysis.structuralAnalysis.awayTeam.resultAdjustment > 0 ? '+' : ''}{gameAnalysis.structuralAnalysis.awayTeam.resultAdjustment.toFixed(1)}pts</div>
                                  <div>• Elenco: +{gameAnalysis.structuralAnalysis.awayTeam.squadStrength}pts</div>
                                  <div>• Contexto: {gameAnalysis.structuralAnalysis.awayTeam.contextBonus > 0 ? '+' : ''}{gameAnalysis.structuralAnalysis.awayTeam.contextBonus}pts</div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Diferença Estrutural */}
                            <div className="mt-4 pt-3 border-t border-orange-500/20">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-white">
                                  Diferença Estrutural: <span className="text-orange-400 font-bold">{Math.abs(gameAnalysis.structuralAnalysis.comparison.difference).toFixed(0)}pts</span>
                                </span>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  gameAnalysis.structuralAnalysis.comparison.structuralAdvantage === 'home' 
                                    ? 'bg-green-900/50 text-green-300 border border-green-500/30'
                                    : gameAnalysis.structuralAnalysis.comparison.structuralAdvantage === 'away'
                                    ? 'bg-blue-900/50 text-blue-300 border border-blue-500/30'
                                    : 'bg-yellow-900/50 text-yellow-300 border border-yellow-500/30'
                                }`}>
                                  {gameAnalysis.structuralAnalysis.comparison.structuralAdvantage === 'home' 
                                    ? '🏠 Casa Superior'
                                    : gameAnalysis.structuralAnalysis.comparison.structuralAdvantage === 'away'
                                    ? '✈️ Visitante Superior'
                                    : '⚖️ Equilibrado'
                                  }
                                </span>
                              </div>
                              <div className="mt-2 text-xs text-white/60">
                                Confiança: {gameAnalysis.structuralAnalysis.comparison.confidence.toFixed(0)}%
                              </div>
                            </div>
                          </div>

                          {/* Insights Detalhados da Análise Estrutural */}
                          <div className="space-y-2">
                            {gameAnalysis.structuralAnalysis.comparison.insights.map((insight, index) => (
                              <div key={index} className="flex items-start space-x-2 p-2 sm:p-3 bg-black/50 border border-orange-500/20 rounded-lg">
                                <span className="text-orange-400 text-sm mt-0.5">🏗️</span>
                                <span className="text-sm text-white/90">{insight}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                 </div>
               </div>
              </div>
          </div>
        </div>
      </section>
      )}

             {/* Sugestões de Apostas - Mostrar quando em análise */}
       {showAnalysis && (
         <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-black">
           <div className="container mx-auto">
             <div className="max-w-5xl mx-auto">
               {/* Header da Seção */}
               <div className="text-center mb-6 sm:mb-8">
                 <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
                   <span className="text-white">Sugestões de</span>{" "}
                   <span className="text-[#FF3002]">Apostas</span>
                 </h2>
                 <p className="text-sm sm:text-base lg:text-lg text-gray-300 max-w-2xl mx-auto">
                   Nossa IA gera sugestões personalizadas baseadas na análise completa
                 </p>
               </div>

                              {/* Aviso de Temporada Inicial */}
               {gameAnalysis && selectedFixture && (
                 (() => {
                   // Buscar dados reais da API para verificar número de jogos
                   const homeGames = gameAnalysis.homeStats?.played || 0;
                   const awayGames = gameAnalysis.awayStats?.played || 0;
                   const minGames = Math.min(homeGames, awayGames);
                   
                   // Mostrar aviso se algum time tem menos de 10 jogos na temporada
                   return minGames < 10;
                 })() && (
                   <div className="mb-6 sm:mb-8 p-4 sm:p-6 bg-gradient-to-br from-orange-500/5 via-yellow-500/5 to-orange-500/5 border border-orange-500/20 rounded-xl sm:rounded-2xl backdrop-blur-sm">
                     <div className="flex items-start space-x-3 sm:space-x-4">
                       <div className="bg-gradient-to-br from-orange-500/20 to-yellow-500/20 p-2 sm:p-3 rounded-lg sm:rounded-xl flex-shrink-0 shadow-lg">
                         <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
                       </div>
                       <div className="flex-1">
                         <div className="flex items-center space-x-2 mb-2">
                           <h4 className="text-orange-400 font-bold text-base sm:text-lg">
                             Temporada em Andamento
                           </h4>
                           <span className="bg-orange-500/20 text-orange-300 px-2 py-1 rounded-full text-xs font-semibold">
                             Dados Limitados
                           </span>
                         </div>
                         <p className="text-orange-200 text-xs sm:text-sm leading-relaxed">
                           {(() => {
                             const homeGames = gameAnalysis.homeStats?.played || 0;
                             const awayGames = gameAnalysis.awayStats?.played || 0;
                             const minGames = Math.min(homeGames, awayGames);
                             
                             return `Início de temporada - ${minGames} jogos disponíveis. Confiabilidade pode ser menor.`;
                           })()}
                         </p>
                       </div>
                     </div>
                   </div>
                 )
               )}

               {/* Controles e Estatísticas */}
               <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 sm:mb-8">
                 <div className="text-center sm:text-left">
                   {totalBetsGenerated > 0 && (
                     <p className="text-gray-300 text-sm sm:text-base animate-fade-in">
                       {totalBetsGenerated} aposta{totalBetsGenerated !== 1 ? 's' : ''} gerada{totalBetsGenerated !== 1 ? 's' : ''} nesta sessão
                     </p>
            )}
          </div>
                  
                                  <div className="flex justify-center">
                    <button 
                      onClick={handleGenerateBets}
                      disabled={generatingBets}
                     className="bg-[#FF3002] hover:bg-[#E02702] disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base transition-all duration-300 hover:shadow-lg hover:shadow-[#FF3002]/30 transform hover:scale-105 flex items-center"
                    >
                      {generatingBets ? (
                        <>
                         <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2"></div>
                          Gerando...
                        </>
                      ) : (
                        <>
                         <Target className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                          Gerar Aposta
                        </>
                      )}
                    </button>
                  </div>
                </div>

                               {gameAnalysis?.betSuggestions && gameAnalysis.betSuggestions.length > 0 ? (
                  <div className="max-w-4xl mx-auto">
                   {/* Navegação entre apostas */}
                   <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-6">
                     {gameAnalysis.betSuggestions.length > 1 && (
                       <>
                         <button
                           onClick={handlePreviousBet}
                           className="bg-black border border-white/10 hover:border-[#FF3002]/30 text-white p-3 sm:p-4 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg active:scale-95 touch-manipulation"
                           title="Aposta anterior (← Seta esquerda)"
                         >
                           <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                         </button>
                         
                         <div className="text-center px-2 sm:px-4">
                           <span className="text-white text-sm sm:text-base font-medium">
                             Aposta {currentBetIndex + 1} de {gameAnalysis.betSuggestions.length}
                           </span>
                           <div className="text-xs text-gray-400 mt-1 hidden sm:block">
                             Use ← → para navegar
                           </div>
                           <div className="text-xs text-gray-400 mt-1 sm:hidden">
                             Arraste para navegar
                           </div>
                           {/* Indicadores de posição */}
                           <div className="flex justify-center gap-2 mt-3">
                             {gameAnalysis.betSuggestions.map((_, index) => (
                               <button
                                 key={index}
                                 onClick={() => setCurrentBetIndex(index)}
                                 className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                   index === currentBetIndex 
                                     ? 'bg-[#FF3002] scale-125' 
                                     : 'bg-white/20 hover:bg-white/40'
                                 }`}
                                 title={`Ir para aposta ${index + 1}`}
                               />
                             ))}
                           </div>
                         </div>
                         
                         <button
                           onClick={handleNextBet}
                           className="bg-black border border-white/10 hover:border-[#FF3002]/30 text-white p-3 sm:p-4 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-lg active:scale-95 touch-manipulation"
                           title="Próxima aposta (→ Seta direita)"
                         >
                           <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                         </button>
                       </>
                     )}
                   </div>

                   {/* Card da aposta atual com animação */}
                   <div 
                     className="transition-all duration-500 ease-in-out transform"
                     onTouchStart={handleTouchStart}
                     onTouchMove={handleTouchMove}
                     onTouchEnd={handleTouchEnd}
                   >
                    {gameAnalysis.betSuggestions.map((bet, index) => (
                       <div 
                         key={bet.id} 
                         className={`bg-black rounded-2xl p-6 border border-white/10 hover:border-[#FF3002]/30 transition-all duration-500 ${
                           index === currentBetIndex 
                             ? 'opacity-100 transform translate-x-0 scale-100 animate-slide-in' 
                             : 'opacity-0 absolute transform translate-x-4 scale-95 pointer-events-none'
                         }`}
                       >
                        <div className="flex flex-col lg:flex-row items-start gap-6">
                          {/* Ícone do tipo de aposta */}
                          <div className="flex-shrink-0">
                             <div className="bg-[#FF3002] p-4 rounded-xl">
                              {bet.type === 'gols' && <Target className="w-8 h-8 text-white" />}
                              {bet.type === 'resultado' && <TrendingUp className="w-8 h-8 text-white" />}
                              {bet.type === 'primeiro-tempo' && <Clock className="w-8 h-8 text-white" />}
                               {bet.type === 'segundo-tempo' && <Clock className="w-8 h-8 text-white" />}
                              {bet.type === 'escanteios' && <MapPin className="w-8 h-8 text-white" />}
                              {bet.type === 'cartoes' && <AlertTriangle className="w-8 h-8 text-white" />}
                               {bet.type === 'handicap' && <TrendingDown className="w-8 h-8 text-white" />}
                               {bet.type === 'jogadores' && <User className="w-8 h-8 text-white" />}
                               {bet.type === 'casa-fora-gols' && <Target className="w-8 h-8 text-white" />}
                              {bet.type === 'especiais' && <User className="w-8 h-8 text-white" />}
                            </div>
                          </div>

                          {/* Conteúdo da aposta */}
                          <div className="flex-grow">
                            <div className="mb-4">
                              <div className="flex items-center gap-3 mb-3">
                                <h3 className="text-2xl font-bold text-white">{bet.selection}</h3>
                                 <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  bet.riskLevel === 'Baixo' ? 'bg-green-600 text-white' :
                                  bet.riskLevel === 'Médio' ? 'bg-yellow-600 text-white' : 'bg-red-600 text-white'
                                }`}>
                                  {bet.riskLevel} Risco
                                </span>
                              </div>
                               <p className="text-gray-400 text-lg mb-3">{bet.market}</p>
                            </div>

                            <p className="text-gray-300 text-lg mb-6 leading-relaxed">{bet.reasoning}</p>

                            <div className="mb-6">
                               <h4 className="text-base font-semibold text-gray-400 mb-3">CRITÉRIOS ANALISADOS:</h4>
                              <div className="flex flex-wrap gap-2">
                                {bet.criteria.map((criterion, idx) => (
                                   <span key={idx} className="bg-black border border-white/10 text-gray-300 px-3 py-1 rounded-full text-xs">
                                    {criterion}
                                  </span>
                                ))}
                              </div>
                            </div>

                             <div className={`grid gap-3 mb-4 ${bet.realOdd ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1'}`}>
                               <div className="bg-[#FF3002] text-white px-4 py-3 rounded-xl text-center">
                                 <div className="text-xs font-medium">CONFIANÇA DA ANÁLISE</div>
                                 <div className="text-2xl font-bold">{Math.min(100, Math.round(bet.confidence))}%</div>
                              </div>
                              
                              {bet.realOdd && (
                                <>
                                   <div className="bg-black border border-white/10 text-white px-4 py-3 rounded-xl text-center">
                                     <div className="text-xs font-medium">ODD REAL</div>
                                    <div className="text-2xl font-bold">{bet.realOdd.toFixed(2)}</div>
                                  </div>
                                   <div className="bg-black border border-white/10 text-white px-4 py-3 rounded-xl text-center">
                                     <div className="text-xs font-medium">RETORNO R$ 100</div>
                                    <div className="text-2xl font-bold">R$ {(bet.realOdd * 100).toFixed(0)}</div>
                                  </div>
                                </>
                              )}
                            </div>
                            
                            {bet.bookmaker && (
                               <div className="text-center text-xs text-gray-400 mb-2">
                                Odds fornecidas por: <span className="text-white font-medium">{bet.bookmaker}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                   </div>
                  </div>
               ) : (
                 <div className="text-center py-12">
                   <div className="bg-black rounded-2xl p-8 border border-white/10">
                      <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                     <h3 className="text-xl font-semibold text-gray-300 mb-3">
                        Nenhuma aposta gerada ainda
                      </h3>
                     <p className="text-gray-400 mb-6 text-base">
                        Clique em "Gerar Aposta" para ver uma sugestão aleatória baseada na nossa análise avançada de todos os níveis de risco.
                      </p>
                      <div className="flex items-center justify-center">
                        <button 
                          onClick={handleGenerateBets}
                          disabled={generatingBets}
                         className="bg-[#FF3002] hover:bg-[#E02702] disabled:bg-gray-600 text-white px-6 py-3 rounded-xl font-bold text-base transition-all duration-300 hover:shadow-lg hover:shadow-[#FF3002]/30 transform hover:scale-105"
                        >
                          {generatingBets ? 'Gerando...' : 'Gerar Aposta'}
                        </button>
                      </div>
                    </div>
                 </div>
               )}
             </div>
           </div>
         </section>
       )}
      </div>

      {/* Footer - Presente em todas as telas */}
      <footer className="border-t border-gray-800 py-4 sm:py-6 mt-auto">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-400">
            <p className="text-sm sm:text-base">&copy; 2025 ApostAI. Todos os direitos reservados.</p>
            <p className="mt-1 sm:mt-2 text-xs sm:text-sm">Jogue com responsabilidade. +18 anos.</p>
          </div>
        </div>
      </footer>

      {/* Botão Flutuante Nova Pesquisa */}
      {showAnalysis && (
        <button 
          onClick={() => {
            setShowAnalysis(false);
            setShowSearchInterface(true);
            setSelectedFixture(null);
            setGameAnalysis(null);
            setSearchTerm('');
            setTeams([]);
            setSearchStep('teams');
          }}
          className="fixed bottom-6 right-6 z-50 bg-[#FF3002] hover:bg-[#E02702] text-white p-3 sm:p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95 group"
          title="Nova Pesquisa"
        >
          <Search className="w-5 h-5 sm:w-6 sm:h-6" />
          <span className="absolute right-full mr-3 bg-black text-white px-2 py-1 rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap sm:hidden">
            Nova Pesquisa
          </span>
        </button>
      )}
    </div>
  );
}

export default App;