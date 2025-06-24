/* eslint-disable */

"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDatabase, ref, onValue } from 'firebase/database';
import { app } from '../../../lib/firebaseConfig';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import Image from "next/image"; // Importar Image do Next.js

// Ícone do hambúrguer (copiado do AnaliseSimulacao)
const HamburgerIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

// Ícone de fechar (copiado do AnaliseSimulacao)
const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

interface RankingItem {
  userName: string;
  simulationCount: number;
  lastSimulation?: string;
  position: number;
}

interface SimulationStats {
  totalSimulations: number;
  totalUsers: number;
  averageSimulationsPerUser: number;
  topUser: string;
}

// NOVO: Lista de skins disponíveis (copiado do SimulacoesAluno)
const skins = [
  {
    id: 'galileufrente',
    name: 'Galileu Clássico',
    image: '/images/galileufrente.png'
  },
  {
    id: 'galileuflamengo',
    name: 'Galileu Flamengo',
    image: '/images/galileuflamengo.png'
  },
  {
    id: 'galileureal',
    name: 'Galileu Real Madrid',
    image: '/images/galileurealremake.png'
  },
  {
    id: 'galileubrasil',
    name: 'Galileu Brasil',
    image: '/images/galileubrasil.png'
  },
  {
    id: 'galileukakuja',
    name: 'Galileu Kakuja',
    image: '/images/galileukakuja.png'
  },
  {
    id: 'galileuuchiha',
    name: 'Galileu Uchiha',
    image: '/images/galileuchiha.png'
  },
  {
    id: 'galileusaiyajin',
    name: 'Galileu Saiyajin',
    image: '/images/galileusaiyajin.png'
  },
  
  {
    id: 'galileusollus',
    name: 'Galileu do Sollus',
    image: '/images/galileusollus.png'
  },{
    id: 'galileufuturo',
    name: 'Galileu do Futuro',
    image: '/images/galileufuturo.png'
  },
    {
    id: 'galileureddead',
    name: 'Galileu do Red Dead',
    image: '/images/galileuredead.png'
  },{
    id: 'galileuchina',
    name: 'Galileu Chinês',
    image: '/images/galileuchina.png'
  },
  {
    id: 'galileuegito',
    name: 'Galileu Egípcio',
    image: '/images/galileuegito.png'
  },{
    id: 'galileuninja',
    name: 'Galileu Ninja',
    image: '/images/galileuninja.png'
  },
  {
    id: 'galileupoderoso',
    name: 'Galileu Poderoso',
    image: '/images/galileupoderoso.png'
  },
  {
    id: 'galileuelric',
    name: 'Galileu Elric',
    image: '/images/galileuelric.png'
  },
  {
    id: 'galileusukuna',
    name: 'Galileu Sukuna',
    image: '/images/galileusukuna.png'
  },
  {
    id: 'galileugojo',
    name: 'Galileu Gojo',
    image: '/images/galileugojo.png'
  },
  {
    id: 'galileupolicial',
    name: 'Galileu Policial',
    image: '/images/galileupolicial.png'
  }
];


const RankingPage: React.FC = () => {
  const router = useRouter();
  const [ranking, setRanking] = useState<RankingItem[]>([]);
  const [stats, setStats] = useState<SimulationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [animationClass, setAnimationClass] = useState('');
  const [menuAberto, setMenuAberto] = useState(false); // Estado para o menu móvel
const [simulationsPerDayData, setSimulationsPerDayData] = useState<Array<{ date: string; count: number }>>([]);
  const [simulationsByHourData, setSimulationsByHourData] = useState<Array<{ hour: string; count: number }>>([]);
  // NOVO: Estado para a skin selecionada (copiado do SimulacoesAluno)
  const [selectedSkin, setSelectedSkin] = useState('galileufrente'); // Skin padrão

  // Cores para o gráfico de pizza
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0', '#a4de6c', '#d0ed57'];

  // Função para alternar o menu
  const alternarMenu = () => {
    setMenuAberto(!menuAberto);
  };

  // Função para fechar o menu ao clicar em um item
  const fecharMenu = () => {
    setMenuAberto(false);
  };

  // NOVO: Função para carregar skin selecionada do localStorage (copiado do SimulacoesAluno)
  const loadSelectedSkin = (userId: string) => {
    const savedSkin = localStorage.getItem(`skin_${userId}`);
    if (savedSkin) {
      setSelectedSkin(savedSkin);
    }
  };

  // NOVO: Função para obter a imagem da skin atual (copiado do SimulacoesAluno)
  const getCurrentSkinImage = () => {
    const skin = skins.find(s => s.id === selectedSkin);
    return skin ? skin.image : '/images/galileufrente.png'; // Fallback para skin padrão
  };

  useEffect(() => {
    // Verificar usuário logado
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user.name || user.email);
      // NOVO: Carregar skin selecionada quando o usuário for carregado
      if (user.uid) {
        loadSelectedSkin(user.uid);
      }
    } else {
      // Redirecionar para login se não houver usuário logado
      router.push("/login");
      return; // Sair para evitar carregamento desnecessário
    }

    const database = getDatabase(app);
    const simulacoesIniciadasRef = ref(database, 'simulacoes_iniciadas');

    const unsubscribe = onValue(simulacoesIniciadasRef, (snapshot) => {
      try {
        const data = snapshot.val();
        if (data) {
          const userCounts: { [key: string]: { count: number; lastSimulation: string } } = {};
          const dailyCounts: { [date: string]: number } = {};
          const hourlyCounts: { [hour: string]: number } = {};

          // Inicializar hourlyCounts para todas as 24 horas
          for (let i = 0; i < 24; i++) {
            const hour = String(i).padStart(2, '0');
            hourlyCounts[hour] = 0;
          }
          
          Object.values(data).forEach((simulacao: any) => {
            const userName = simulacao.userName;
            const timestamp = simulacao.timestamp;

            if (userName && timestamp) {
              // Processar dados para ranking
              if (!userCounts[userName]) {
                userCounts[userName] = { count: 0, lastSimulation: timestamp };
              }
              userCounts[userName].count += 1;
              
              // Manter a simulação mais recente
              if (new Date(timestamp) > new Date(userCounts[userName].lastSimulation)) {
                userCounts[userName].lastSimulation = timestamp;
              }

              // Processar dados para simulações por dia
              const date = new Date(timestamp).toISOString().split('T')[0]; // YYYY-MM-DD
              dailyCounts[date] = (dailyCounts[date] || 0) + 1;

              // Processar dados para simulações por hora
              const hour = new Date(timestamp).getHours().toString().padStart(2, '0'); // HH
              hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1;
            }
          });

          const sortedRanking: RankingItem[] = Object.entries(userCounts)
            .map(([userName, data]) => ({ 
              userName, 
              simulationCount: data.count,
              lastSimulation: data.lastSimulation,
              position: 0
            }))
            .sort((a, b) => b.simulationCount - a.simulationCount)
            .map((item, index) => ({ ...item, position: index + 1 }));

          setRanking(sortedRanking);

          // Calcular estatísticas
          const totalSimulations = Object.values(userCounts).reduce((sum, data) => sum + data.count, 0);
          const totalUsers = Object.keys(userCounts).length;
          const averageSimulationsPerUser = totalUsers > 0 ? totalSimulations / totalUsers : 0;
          const topUser = sortedRanking.length > 0 ? sortedRanking[0].userName : '';

          setStats({
            totalSimulations,
            totalUsers,
            averageSimulationsPerUser,
            topUser
          });

          // Preparar dados para gráficos adicionais
          const sortedDailyData = Object.entries(dailyCounts)
            .map(([date, count]) => ({ date, count }))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          setSimulationsPerDayData(sortedDailyData);

          const sortedHourlyData = Object.entries(hourlyCounts)
            .map(([hour, count]) => ({ hour, count }))
            .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
          setSimulationsByHourData(sortedHourlyData);

        } else {
          setRanking([]);
          setStats({
            totalSimulations: 0,
            totalUsers: 0,
            averageSimulationsPerUser: 0,
            topUser: ''
          });
          setSimulationsPerDayData([]);
          setSimulationsByHourData([]);
        }
        setLoading(false);
        setAnimationClass('animate-fade-in');
      } catch (e: any) {
        console.error("Erro ao carregar ranking:", e);
        setError("Erro ao carregar dados do ranking: " + e.message);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]); // Adicionado router como dependência

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMedalIcon = (position: number) => {
    switch (position) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${position}`;
    }
  };

  const getPositionClass = (position: number) => {
    switch (position) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
      case 3:
        return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
      default:
        return 'bg-gray-100 text-gray-800'; // Alterado para combinar com o tema
    }
  };

  const isCurrentUser = (userName: string) => {
    return currentUser === userName;
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-white text-xl"
        style={{
          backgroundImage: "url('/images/kokushibo.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}>
        Carregando...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-red-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          <div className="text-red-600 text-center">
            <h2 className="text-2xl font-bold mb-4">Erro</h2>
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition duration-300"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cover bg-center relative" style={{
      backgroundImage: "url('/images/kokushibo.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
    }}>
      {/* NOVO: Imagem fixa na esquerda (oculta em telas menores) - Copiado do SimulacoesAluno */}
      <div className="hidden md:block fixed left-0 bottom-0 z-10">
        <Image
          src={getCurrentSkinImage()} // Usar função para obter imagem da skin atual
          alt="Galileu"
          width={300}
          height={300}
          className="object-contain"
        />
      </div>
     
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Header com navegação responsiva */}
        <header className="flex justify-between items-center mb-8 sm:mb-16 relative">
          <Image
            onClick={() => router.push("/dashboardaluno")}
            src="/images/markim-Photoroom.png"
            alt="Logo Projeto Galileu"
            width={120}
            height={40}
            className="hover:scale-105 transition-transform duration-300 cursor-pointer sm:w-[150px] sm:h-[150px]"
          />
          
          {/* Menu Desktop */}
          <nav className="hidden md:block">
            <ul className="flex gap-4 lg:gap-6">
              <li>
                <button
                  onClick={() => router.push("/dashboardaluno")}
                  className="text-white px-4 lg:px-6 py-2 lg:py-3 rounded-md border border-purple-400 bg-transparent hover:text-purple-300 hover:border-purple-300 transition duration-300 shadow-md hover:shadow-lg text-sm lg:text-base"
                >
                  Início
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push("/simulacoesaluno")}
                  className="text-white px-4 lg:px-6 py-2 lg:py-3 rounded-md border border-purple-400 bg-transparent hover:text-purple-300 hover:border-purple-300 transition duration-300 shadow-md hover:shadow-lg text-sm lg:text-base"
                >
                  Simulações
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push("/ranking")}
                  className="bg-purple-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-md font-bold transition duration-300 shadow-lg hover:bg-purple-500 hover:shadow-xl text-sm lg:text-base" // Estilo para o botão ativo
                >
                  Ranking
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push("/editarperfilaluno")}
                  className="bg-purple-600 text-white px-4 lg:px-8 py-2 lg:py-3 rounded-md font-bold transition duration-300 shadow-lg hover:bg-purple-500 hover:shadow-xl text-sm lg:text-base"
                >
                  {currentUser}
                </button>
              </li>
            </ul>
          </nav>

          {/* Botão Hambúrguer Mobile */}
          <button
            onClick={alternarMenu}
            className="md:hidden text-white p-2 rounded-md border border-purple-400 hover:bg-purple-600 transition duration-300"
            aria-label="Menu"
          >
            {menuAberto ? <CloseIcon /> : <HamburgerIcon />}
          </button>

          {/* Menu Mobile */}
          {menuAberto && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-purple-900 bg-opacity-95 backdrop-blur-sm border border-purple-400 rounded-lg shadow-lg md:hidden z-50">
              <ul className="py-2">
                <li>
                  <button
                    onClick={() => {
                      router.push("/dashboardaluno");
                      fecharMenu();
                    }}
                    className="w-full text-left text-white px-4 py-3 hover:bg-purple-700 transition duration-300"
                  >
                    Início
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      router.push("/simulacoesaluno");
                      fecharMenu();
                    }}
                    className="w-full text-left text-white px-4 py-3 hover:bg-purple-700 transition duration-300"
                  >
                    Simulações
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      router.push("/ranking");
                      fecharMenu();
                    }}
                    className="w-full text-left text-white px-4 py-3 bg-purple-700 transition duration-300 font-bold" // Estilo para o botão ativo
                  >
                    Ranking
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      router.push("/editarperfilaluno");
                      fecharMenu();
                    }}
                    className="w-full text-left text-white px-4 py-3 hover:bg-purple-700 transition duration-300 font-bold"
                  >
                    {currentUser}
                  </button>
                </li>
              </ul>
            </div>
          )}
        </header>

        {/* Conteúdo principal do ranking com a nova estética */}
        <div className="relative max-w-6xl mx-auto bg-purple-900 bg-opacity-60 border border-purple-300 p-4 sm:p-6 md:p-8 rounded-xl mt-4 sm:mt-8 text-white">
          <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-white text-center">
            🏆 Ranking de Simulações
          </h1>
          <p className="text-base sm:text-lg text-white mb-6 text-center">
            Veja quem está liderando nas simulações de física!
          </p>
          
          {/* Estatísticas */}
          {stats && (
            <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 ${animationClass}`}>
              <div className="bg-white p-6 rounded-lg shadow-lg text-center transform hover:scale-105 transition duration-300 text-black">
                <div className="text-3xl font-bold text-purple-600">{stats.totalSimulations}</div>
                <div className="text-gray-600">Total de Simulações</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg text-center transform hover:scale-105 transition duration-300 text-black">
                <div className="text-3xl font-bold text-green-600">{stats.totalUsers}</div>
                <div className="text-gray-600">Usuários Ativos</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg text-center transform hover:scale-105 transition duration-300 text-black">
                <div className="text-3xl font-bold text-blue-600">{stats.averageSimulationsPerUser.toFixed(1)}</div>
                <div className="text-gray-600">Média por Usuário</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-lg text-center transform hover:scale-105 transition duration-300 text-black">
                <div className="text-2xl font-bold text-yellow-600">👑 {stats.topUser}</div>
                <div className="text-gray-600">Líder Atual</div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Lista de Ranking */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6">
                  <h2 className="text-2xl font-bold">Ranking dos Alunos</h2>
                  <p className="text-purple-100">Classificação por número de simulações realizadas</p>
                </div>
                
                {ranking.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 bg-white">
                    <div className="text-6xl mb-4">📊</div>
                    <p className="text-xl">Nenhuma simulação registrada ainda.</p>
                    <p className="text-gray-400 mt-2">Seja o primeiro a iniciar uma simulação!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 bg-white text-black">
                    {ranking.map((item, index) => (
                      <div
                        key={index}
                        className={`p-6 flex items-center justify-between hover:bg-gray-50 transition duration-300 ${
                          isCurrentUser(item.userName) ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${getPositionClass(item.position)}`}>
                            {getMedalIcon(item.position)}
                          </div>
                          <div>
                            <p className="text-lg font-semibold text-gray-900 flex items-center">
                              {item.userName}
                              {isCurrentUser(item.userName) && (
                                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  Você
                                </span>
                              )}
                            </p>
                            {item.lastSimulation && (
                              <p className="text-sm text-gray-500">
                                Última simulação: {formatDate(item.lastSimulation)}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-purple-600">
                            {item.simulationCount}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.simulationCount === 1 ? 'simulação' : 'simulações'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Gráficos - Agora todos um embaixo do outro */}
            <div className="lg:col-span-1 space-y-6">
              {ranking.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-lg text-black">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Top 5 Usuários</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={ranking.slice(0, 5)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="userName" 
                          tick={{ fontSize: 12 }}
                          interval={0}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="simulationCount" fill="#7c3aed" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {ranking.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-lg text-black">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Distribuição de Simulações</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={ranking.slice(0, 6)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ userName, percent }) => `${userName} (${(percent * 100).toFixed(0)}%)`}
                          outerRadius={80}
                          fill="#7c3aed"
                          dataKey="simulationCount"
                        >
                          {ranking.slice(0, 6).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {simulationsPerDayData.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-lg text-black">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Simulações por Dia</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={simulationsPerDayData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tickFormatter={(tick) => new Date(tick).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="count" stroke="#82ca9d" activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {simulationsByHourData.length > 0 && (
                <div className="bg-white p-6 rounded-lg shadow-lg text-black">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Simulações por Hora do Dia</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={simulationsByHourData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="hour" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#ffc658" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
         
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default RankingPage;
