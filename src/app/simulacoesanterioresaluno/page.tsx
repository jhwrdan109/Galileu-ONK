/* eslint-disable */

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import { getDatabase, ref, onValue, remove } from "firebase/database";
import { app } from "../../../lib/firebaseConfig";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import MenuIcon from "@mui/icons-material/Menu";

interface Simulacao {
  id: string;
  userName: string;
  timestamp: string;
  status: string;
  dados: {
    distancia: number;
    angulo: number;
    velocidade: number;
    px: number;
    py: number;
    aceleracao: number;
    forcaPeso: number;
    forcaNormal: number;
    forcaAtrito: number;
    forcaResultante: number;
  };
}

const SimulacoesAnterioresAluno: React.FC = () => {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulacoes, setSimulacoes] = useState<Simulacao[]>([]);
  const [simulacaoSelecionada, setSimulacaoSelecionada] = useState<Simulacao | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);
  
  // Estados para o modo de comparação
  const [modoComparacao, setModoComparacao] = useState(false);
  const [simulacoesSelecionadas, setSimulacoesSelecionadas] = useState<Simulacao[]>([]);
  const [modalComparacaoAberto, setModalComparacaoAberto] = useState(false);

  // Estados para confirmação de exclusão
  const [modalConfirmacaoAberto, setModalConfirmacaoAberto] = useState(false);
  const [simulacaoParaExcluir, setSimulacaoParaExcluir] = useState<Simulacao | null>(null);

  // NOVO: Estado para a skin selecionada
  const [selectedSkin, setSelectedSkin] = useState('galileufrente'); // Skin padrão

  // NOVO: Lista de skins disponíveis (mesma do editarperfil)
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
    },{
  id: 'galileudias',
  name: 'Galileu Dias',
  image: '/images/galileudias.png'
},{
  id: 'galileuburga',
  name: 'Galileu Burga',
  image: '/images/galileuburga.png'
},{
  id: 'galileuserafim', 
  name: 'Galileu Serafim',
  image: '/images/galileuserafim.png'
}, {
  id: 'galileucorinthians',
  name: 'Galileu Corinthians', 
  image: '/images/galileucorinthians.png'
},{
  id: 'galileuvelocista',
  name: 'Galileu Velocista',
  image: '/images/galileuvelocista.png'
}
  ];

  // NOVO: Função para carregar skin selecionada do localStorage
  const loadSelectedSkin = (userId: string) => {
    const savedSkin = localStorage.getItem(`skin_${userId}`);
    if (savedSkin) {
      setSelectedSkin(savedSkin);
    }
  };

  // NOVO: Função para obter a imagem da skin atual
  const getCurrentSkinImage = () => {
    const skin = skins.find(s => s.id === selectedSkin);
    return skin ? skin.image : '/images/galileufrente.png'; // Fallback para skin padrão
  };

  // Função para garantir que o valor seja um número e formatá-lo
  const formatarNumero = (valor: any, casasDecimais: number = 2): string => {
    if (valor === null || valor === undefined || valor === '') {
      return "N/A";
    }
    
    const numero = Number(valor);
    if (isNaN(numero)) {
      return "N/A";
    }
    
    return numero.toFixed(casasDecimais);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(user.name || user.email);
      setLoading(false);
      carregarSimulacoes(user.name || user.email);
      // NOVO: Carregar skin selecionada quando o usuário for carregado
      if (user.uid) {
        loadSelectedSkin(user.uid);
      }
    } else {
      router.push("/login");
    }
  }, [router]);

  const carregarSimulacoes = (userNome: string) => {
    const database = getDatabase(app);
    const simulacoesRef = ref(database, "simulacoes");

    onValue(simulacoesRef, (snapshot) => {
      if (snapshot.exists()) {
        const simulacoesData = snapshot.val();
        const simulacoesArray: Simulacao[] = [];

        Object.keys(simulacoesData).forEach((key) => {
          if (simulacoesData[key].userName === userNome) {
            simulacoesArray.push({
              id: key,
              ...simulacoesData[key],
              dados: simulacoesData[key].dados || {},
            });
          }
        });

        simulacoesArray.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        setSimulacoes(simulacoesArray);
      }
    });
  };

  const abrirModal = (simulacao: Simulacao) => {
    if (modoComparacao) {
      selecionarParaComparacao(simulacao);
    } else {
      setSimulacaoSelecionada(simulacao);
      setModalAberto(true);
    }
  };

  const fecharModal = () => {
    setModalAberto(false);
    setSimulacaoSelecionada(null);
  };

  const formatarData = (timestamp: string) => {
    if (!timestamp) return "Data não disponível";
    const data = new Date(timestamp);
    return data.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Funções para a comparação
  const toggleModoComparacao = () => {
    setModoComparacao(!modoComparacao);
    setSimulacoesSelecionadas([]);
  };

  const selecionarParaComparacao = (simulacao: Simulacao) => {
    if (simulacoesSelecionadas.find(s => s.id === simulacao.id)) {
      // Remover se já estiver selecionada
      setSimulacoesSelecionadas(simulacoesSelecionadas.filter(s => s.id !== simulacao.id));
    } else {
      // Adicionar, mantendo no máximo 2 seleções
      const novaSelecao = [...simulacoesSelecionadas, simulacao].slice(-2);
      setSimulacoesSelecionadas(novaSelecao);
      
      // Se tiver 2 simulações selecionadas, abrir o modal de comparação
      if (novaSelecao.length === 2) {
        setModalComparacaoAberto(true);
      }
    }
  };

  const fecharModalComparacao = () => {
    setModalComparacaoAberto(false);
    setModoComparacao(false);
    setSimulacoesSelecionadas([]);
  };

  // Funções para exclusão de simulação
  const confirmarExclusao = (simulacao: Simulacao, event: React.MouseEvent) => {
    event.stopPropagation(); // Impede que o modal de detalhes seja aberto
    setSimulacaoParaExcluir(simulacao);
    setModalConfirmacaoAberto(true);
  };

  const excluirSimulacao = async () => {
    if (!simulacaoParaExcluir) return;

    try {
      const database = getDatabase(app);
      const simulacaoRef = ref(database, `simulacoes/${simulacaoParaExcluir.id}`);
      await remove(simulacaoRef);
      
      // Atualizar a lista local removendo a simulação excluída
      setSimulacoes(simulacoes.filter(s => s.id !== simulacaoParaExcluir.id));
      
      setModalConfirmacaoAberto(false);
      setSimulacaoParaExcluir(null);
    } catch (error) {
      console.error("Erro ao excluir simulação:", error);
      alert("Erro ao excluir simulação. Tente novamente.");
    }
  };

  const cancelarExclusao = () => {
    setModalConfirmacaoAberto(false);
    setSimulacaoParaExcluir(null);
  };

  const toggleMenuMobile = () => {
    setMenuMobileAberto(!menuMobileAberto);
  };

  // Função para fechar o menu mobile ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (menuMobileAberto && !target.closest('.menu-mobile-container')) {
        setMenuMobileAberto(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuMobileAberto]);

  const DetalhesModal = () => {
    if (!simulacaoSelecionada) return null;
    const { timestamp, dados } = simulacaoSelecionada;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto mx-2 sm:mx-0">
          <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-lg sm:text-2xl font-bold text-purple-800">
              Detalhes da Simulação
            </h2>
            <button
              onClick={fecharModal}
              className="text-gray-500 hover:text-gray-700 p-1"
            >
              <CloseIcon fontSize="large" />
            </button>
          </div>

          <div className="p-4 sm:p-6">
            <p className="text-base sm:text-lg font-medium mb-4 text-black">
              <span className="text-purple-600">Data da Simulação:</span>{" "}
              {formatarData(timestamp)}
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
              <div className="bg-purple-100 p-3 sm:p-4 rounded-lg">
                <h3 className="text-base sm:text-lg font-bold mb-3 text-purple-800">
                  Medidas
                </h3>
                <div className="space-y-2 text-black text-sm sm:text-base">
                  <p>
                    <span className="font-semibold">Distância:</span>{" "}
                    {formatarNumero(dados?.distancia)} m
                  </p>
                  <p>
                    <span className="font-semibold">Ângulo:</span>{" "}
                    {formatarNumero(dados?.angulo)}°
                  </p>
                  <p>
                    <span className="font-semibold">Velocidade:</span>{" "}
                    {formatarNumero(dados?.velocidade)} m/s
                  </p>
                  <p>
                    <span className="font-semibold">Aceleração:</span>{" "}
                    {formatarNumero(dados?.aceleracao)} m/s²
                  </p>
                </div>
              </div>

              <div className="bg-purple-100 p-3 sm:p-4 rounded-lg">
                <h3 className="text-base sm:text-lg font-bold mb-3 text-purple-800">
                  Forças
                </h3>
                <div className="space-y-2 text-black text-sm sm:text-base">
                  <p>
                    <span className="font-semibold">Força Peso:</span>{" "}
                    {formatarNumero(dados?.forcaPeso)} N
                  </p>
                  <p>
                    <span className="font-semibold">Força Normal:</span>{" "}
                    {formatarNumero(dados?.forcaNormal)} N
                  </p>
                  <p>
                    <span className="font-semibold">Força de Atrito:</span>{" "}
                    {formatarNumero(dados?.forcaAtrito)} N
                  </p>
                  <p>
                    <span className="font-semibold">Força Resultante:</span>{" "}
                    {formatarNumero(dados?.forcaResultante)} N
                  </p>
                  <p>
                    <span className="font-semibold">Px / Py:</span>{" "}
                    {formatarNumero(dados?.px)} /{" "}
                    {formatarNumero(dados?.py)} N
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={fecharModal}
                className="bg-purple-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-md font-bold hover:bg-purple-700 transition duration-300 text-sm sm:text-base"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ModalConfirmacaoExclusao = () => {
    if (!simulacaoParaExcluir) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-2">
          <div className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-red-600 mb-4">
              Confirmar Exclusão
            </h2>
            <p className="text-gray-700 mb-4 sm:mb-6 text-sm sm:text-base">
              Tem certeza que deseja excluir a simulação de{" "}
              <strong>{formatarData(simulacaoParaExcluir.timestamp)}</strong>?
            </p>
            <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-end">
              <button
                onClick={cancelarExclusao}
                className="px-4 sm:px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition duration-300 text-sm sm:text-base"
              >
                Cancelar
              </button>
              <button
                onClick={excluirSimulacao}
                className="px-4 sm:px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-300 text-sm sm:text-base"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const ComparacaoModal = () => {
    if (simulacoesSelecionadas.length !== 2) return null;
    
    const simulacao1 = simulacoesSelecionadas[0];
    const simulacao2 = simulacoesSelecionadas[1];

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto mx-2 sm:mx-0">
          <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-lg sm:text-2xl font-bold text-purple-800">
              Comparação de Simulações
            </h2>
            <button
              onClick={fecharModalComparacao}
              className="text-gray-500 hover:text-gray-700 p-1"
            >
              <CloseIcon fontSize="large" />
            </button>
          </div>

          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-2 gap-4 sm:gap-8 mb-6">
              <div className="text-center">
                <h3 className="text-base sm:text-xl font-bold mb-2 text-purple-800">
                  Experimento 1
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-4">
                  {formatarData(simulacao1.timestamp)}
                </p>
              </div>
              <div className="text-center">
                <h3 className="text-base sm:text-xl font-bold mb-2 text-purple-800">
                  Experimento 2
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-4">
                  {formatarData(simulacao2.timestamp)}
                </p>
              </div>
            </div>

            {/* Aceleração */}
            <div className="mb-4">
              <div className="text-purple-950 font-bold text-center py-2 bg-gray-200 text-sm sm:text-base">Aceleração</div>
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div className="bg-purple-600 text-white text-center py-2 sm:py-3 rounded text-sm sm:text-base">
                  {formatarNumero(simulacao1.dados?.aceleracao)} m/s²
                </div>
                <div className="bg-purple-600 text-white text-center py-2 sm:py-3 rounded text-sm sm:text-base">
                  {formatarNumero(simulacao2.dados?.aceleracao)} m/s²
                </div>
              </div>
            </div>

            {/* Força Peso */}
            <div className="mb-4">
              <div className="text-purple-950 font-bold text-center py-2 bg-gray-200 text-sm sm:text-base">Força Peso</div>
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div className="bg-purple-600 text-white text-center py-2 sm:py-3 rounded text-sm sm:text-base">
                  {formatarNumero(simulacao1.dados?.forcaPeso)} N
                </div>
                <div className="bg-purple-600 text-white text-center py-2 sm:py-3 rounded text-sm sm:text-base">
                  {formatarNumero(simulacao2.dados?.forcaPeso)} N
                </div>
              </div>
            </div>

            {/* Força Atrito */}
            <div className="mb-4">
              <div className="text-purple-950 font-bold text-center py-2 bg-gray-200 text-sm sm:text-base">Força Atrito</div>
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div className="bg-purple-600 text-white text-center py-2 sm:py-3 rounded text-sm sm:text-base">
                  {formatarNumero(simulacao1.dados?.forcaAtrito)} N
                </div>
                <div className="bg-purple-600 text-white text-center py-2 sm:py-3 rounded text-sm sm:text-base">
                  {formatarNumero(simulacao2.dados?.forcaAtrito)} N
                </div>
              </div>
            </div>

            {/* Px/Py */}
            <div className="mb-4">
              <div className="text-purple-950 font-bold text-center py-2 bg-gray-200 text-sm sm:text-base">Px/Py</div>
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div className="bg-purple-600 text-white text-center py-2 sm:py-3 rounded text-sm sm:text-base">
                  {formatarNumero(simulacao1.dados?.px)} / {formatarNumero(simulacao1.dados?.py)} N
                </div>
                <div className="bg-purple-600 text-white text-center py-2 sm:py-3 rounded text-sm sm:text-base">
                  {formatarNumero(simulacao2.dados?.px)} / {formatarNumero(simulacao2.dados?.py)} N
                </div>
              </div>
            </div>

            {/* Força Normal */}
            <div className="mb-4">
              <div className="text-purple-950 font-bold text-center py-2 bg-gray-200 text-sm sm:text-base">Força Normal</div>
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div className="bg-purple-600 text-white text-center py-2 sm:py-3 rounded text-sm sm:text-base">
                  {formatarNumero(simulacao1.dados?.forcaNormal)} N
                </div>
                <div className="bg-purple-600 text-white text-center py-2 sm:py-3 rounded text-sm sm:text-base">
                  {formatarNumero(simulacao2.dados?.forcaNormal)} N
                </div>
              </div>
            </div>

            {/* Força Resultante */}
            <div className="mb-4">
              <div className="text-purple-950 font-bold text-center py-2 bg-gray-200 text-sm sm:text-base">Força Resultante</div>
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div className="bg-purple-600 text-white text-center py-2 sm:py-3 rounded text-sm sm:text-base">
                  {formatarNumero(simulacao1.dados?.forcaResultante)} N
                </div>
                <div className="bg-purple-600 text-white text-center py-2 sm:py-3 rounded text-sm sm:text-base">
                  {formatarNumero(simulacao2.dados?.forcaResultante)} N
                </div>
              </div>
            </div>

            <div className="mt-6 sm:mt-8 text-center">
              <button
                onClick={fecharModalComparacao}
                className="bg-purple-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-md font-bold hover:bg-purple-700 transition duration-300 text-sm sm:text-base"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-white text-xl">
        Carregando...
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{
        backgroundImage: "url('/images/FundoCanva.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Imagem do Galileu - oculta em mobile - MODIFICADA para usar skin selecionada */}
      <div className="hidden lg:block fixed right-0 bottom-0 z-10">
        <Image
          src={getCurrentSkinImage()} // MUDANÇA: Usar função para obter imagem da skin atual
          alt="Galileu"
          width={300}
          height={300}
          className="object-contain"
        />
      </div>

      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Header responsivo */}
        <header className="flex justify-between items-center mb-8 sm:mb-16 relative">
          <div className="flex-shrink-0">
            <Image
              onClick={() => router.push("/dashboardaluno")}
              src="/images/markim-Photoroom.png"
              alt="Logo Projeto Galileu"
              width={120}
              height={40}
              className="hover:scale-105 transition-transform duration-300 cursor-pointer sm:w-[150px] sm:h-[150px]"
            />
          </div>

          {/* Menu Desktop */}
          <nav className="hidden md:block">
            <ul className="flex gap-4 lg:gap-6">
              <li>
                <button
                  onClick={() => router.push("/dashboardaluno")}
                  className="text-white hover:text-purple-300 px-4 lg:px-6 py-2 lg:py-3 rounded-md transition duration-300 text-sm lg:text-base"
                >
                  Início
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push("/simulacoesaluno")}
                  className="text-white px-4 lg:px-6 py-2 lg:py-3 rounded-md font-bold border border-purple-400 text-sm lg:text-base"
                >
                  Simulações
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push("/editarperfilaluno")}
                  className="bg-purple-600 text-white px-4 lg:px-8 py-2 lg:py-3 rounded-md font-bold transition duration-300 text-sm lg:text-base"
                >
                  {userName}
                </button>
              </li>
            </ul>
          </nav>

          {/* Container do Menu Mobile */}
          <div className="menu-mobile-container relative md:hidden">
            {/* Botão Menu Mobile */}
            <button
              onClick={toggleMenuMobile}
              className="text-white p-2 rounded-md border border-purple-400 hover:bg-purple-600 transition duration-300"
              aria-label="Menu"
            >
              <MenuIcon />
            </button>

            {/* Menu Mobile */}
            {menuMobileAberto && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-purple-900 bg-opacity-95 backdrop-blur-sm border border-purple-400 rounded-lg shadow-lg z-50">
                <ul className="py-2">
                  <li>
                    <button
                      onClick={() => {
                        router.push("/dashboardaluno");
                        setMenuMobileAberto(false);
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
                        setMenuMobileAberto(false);
                      }}
                      className="w-full text-left text-white px-4 py-3 hover:bg-purple-700 transition duration-300 font-bold"
                    >
                      Simulações
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        router.push("/editarperfilaluno");
                        setMenuMobileAberto(false);
                      }}
                      className="w-full text-left text-white px-4 py-3 hover:bg-purple-700 transition duration-300"
                    >
                      {userName}
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </header>

        <main className="flex flex-col items-center text-center py-8 sm:py-16">
          {/* Título com botão de voltar */}
          <div className="bg-purple-800 text-white px-4 sm:px-8 py-4 sm:py-6 rounded-lg shadow-lg mb-6 sm:mb-8 flex items-center gap-2 sm:gap-4 w-full max-w-4xl">
            <button
              onClick={() => router.push("/simulacoesaluno")}
              className="text-white hover:text-gray-300 flex-shrink-0"
            >
              <ArrowBackIcon fontSize="large" />
            </button>
            <h1 className="text-xl sm:text-2xl lg:text-4xl font-bold truncate">Simulações Anteriores</h1>
          </div>

          <div className="w-full max-w-4xl px-2 sm:px-0">
            {/* Controles de comparação */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6 gap-4">
              {simulacoes.length >= 2 && (
                <button
                  onClick={toggleModoComparacao}
                  className={`flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-md font-bold transition duration-300 text-sm sm:text-base ${
                    modoComparacao
                      ? "bg-purple-800 text-white"
                      : "bg-purple-200 text-purple-800"
                  }`}
                >
                  <CompareArrowsIcon />
                  <span className="hidden sm:inline">
                    {modoComparacao ? "Cancelar Comparação" : "Comparar Simulações"}
                  </span>
                  <span className="sm:hidden">
                    {modoComparacao ? "Cancelar" : "Comparar"}
                  </span>
                </button>
              )}
              
              {modoComparacao && (
                <div className="text-white bg-purple-950 py-2 px-3 border border-purple-300 rounded-lg shadow-lg text-xs sm:text-sm text-center">
                  {simulacoesSelecionadas.length === 0 && (
                    <span className="hidden sm:inline">Selecione duas simulações para comparar</span>
                  )}
                  {simulacoesSelecionadas.length === 0 && (
                    <span className="sm:hidden">Selecione duas simulações</span>
                  )}
                  {simulacoesSelecionadas.length === 1 && "Selecione mais uma simulação"}
                  {simulacoesSelecionadas.length === 2 && "Duas simulações selecionadas"}
                </div>
              )}
            </div>

            {/* Lista de simulações */}
            <div className="bg-purple-200 bg-opacity-20 rounded-lg p-4 sm:p-8">
              {simulacoes.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {simulacoes.map((simulacao) => (
                    <div
                      key={simulacao.id}
                      className={`bg-white p-4 sm:p-6 rounded-lg shadow-md hover:bg-purple-50 transition duration-300 cursor-pointer relative ${
                        modoComparacao && simulacoesSelecionadas.find(s => s.id === simulacao.id)
                          ? "border-4 border-purple-600"
                          : ""
                      }`}
                      onClick={() => abrirModal(simulacao)}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <h2 className="text-base sm:text-xl font-bold text-purple-800 mb-2 truncate">
                            Simulação em {formatarData(simulacao.timestamp)}
                          </h2>
                          <p className="text-gray-700 text-sm sm:text-base">Status: {simulacao.status}</p>
                        </div>
                        <button
                          onClick={(e) => confirmarExclusao(simulacao, e)}
                          className="flex-shrink-0 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full transition duration-300"
                          title="Excluir simulação"
                        >
                          <DeleteIcon fontSize="small" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-white text-base sm:text-lg">Nenhuma simulação encontrada.</p>
              )}
            </div>
          </div>
        </main>
      </div>

      {modalAberto && <DetalhesModal />}
      {modalComparacaoAberto && <ComparacaoModal />}
      {modalConfirmacaoAberto && <ModalConfirmacaoExclusao />}
    </div>
  );
};

export default SimulacoesAnterioresAluno;

