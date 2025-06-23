/* eslint-disable */

"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { supabase } from "../../../../lib/supabase";
import { getDatabase, ref, get } from "firebase/database";
import { app } from "../../../../lib/firebaseConfig";
import { Menu, X, ArrowLeft, Clock, CheckCircle, XCircle, HelpCircle } from "lucide-react";

interface Questao {
  id: string;
  enunciado: string;
  alternativas: { [key: string]: string };
  resolucao?: string;
  alternativa_correta?: string;
  tempo?: number;
  anexo?: string | null;
}

interface Sala {
  id: string;
  nome: string;
  codigo: string;
  questoes_firebase_ids: string[];
  created_by_user_id: string;
}

interface FAQ {
  pergunta: string;
  resposta: string;
}

const planoInclinadoFAQs: FAQ[] = [
  {
    pergunta: "O que é um plano inclinado?",
    resposta:
      "Um plano inclinado é uma superfície plana que forma um ângulo com a horizontal. É uma máquina simples que permite mover objetos para cima com menos força do que seria necessário para levantá-los verticalmente."
  },
  {
    pergunta: "Quais são as forças que atuam em um objeto sobre um plano inclinado?",
    resposta:
      "Em um objeto sobre um plano inclinado atuam: a força peso (P), que pode ser decomposta em uma componente paralela ao plano (Px) e uma componente perpendicular ao plano (Py); a força normal (N), perpendicular à superfície; e a força de atrito (Fa), que é paralela à superfície e oposta ao movimento."
  },
  {
    pergunta: "Como calcular a componente da força peso paralela ao plano inclinado?",
    resposta:
      "A componente da força peso paralela ao plano inclinado é dada por: Px = m·g·sen(θ), onde m é a massa do objeto, g é a aceleração da gravidade, e θ é o ângulo de inclinação do plano."
  },
  {
    pergunta: "Como calcular a componente da força peso perpendicular ao plano inclinado?",
    resposta:
      "A componente da força peso perpendicular ao plano inclinado é dada por: Py = m·g·cos(θ), onde m é a massa do objeto, g é a aceleração da gravidade, e θ é o ângulo de inclinação do plano."
  },
  {
    pergunta: "Como calcular a força normal em um plano inclinado?",
    resposta:
      "A força normal é igual à componente perpendicular do peso: N = m·g·cos(θ), onde m é a massa do objeto, g é a aceleração da gravidade, e θ é o ângulo de inclinação do plano."
  },
  {
    pergunta: "Como calcular a força de atrito em um plano inclinado?",
    resposta:
      "A força de atrito é dada por: Fa = μ·N, onde μ é o coeficiente de atrito entre as superfícies e N é a força normal. Substituindo, temos: Fa = μ·m·g·cos(θ)."
  },
  {
    pergunta: "Qual é a condição para que um objeto desça um plano inclinado?",
    resposta:
      "Um objeto deslizará para baixo em um plano inclinado quando a componente da força peso paralela ao plano (Px = m·g·sen(θ)) for maior que a força de atrito (Fa = μ·m·g·cos(θ)). Ou seja, quando sen(θ) > μ·cos(θ), ou quando tg(θ) > μ."
  },
  {
    pergunta: "Como calcular a aceleração de um objeto em um plano inclinado sem atrito?",
    resposta:
      "A aceleração de um objeto em um plano inclinado sem atrito é dada por: a = g·sen(θ), onde g é a aceleração da gravidade e θ é o ângulo de inclinação do plano."
  },
  {
    pergunta: "Como calcular a aceleração de um objeto em um plano inclinado com atrito?",
    resposta:
      "A aceleração de um objeto em um plano inclinado com atrito é dada por: a = g·sen(θ) - μ·g·cos(θ), onde g é a aceleração da gravidade, θ é o ângulo de inclinação do plano, e μ é o coeficiente de atrito."
  },
  {
    pergunta: "Qual é a vantagem mecânica de um plano inclinado?",
    resposta:
      "A vantagem mecânica de um plano inclinado é a razão entre o comprimento do plano (L) e a altura (h): VM = L/h. Isso significa que a força necessária para mover um objeto para cima no plano é reduzida por esse fator em comparação com levantá-lo verticalmente."
  }
];

const SalaDeAulaTesteSupabase: React.FC = () => {
  const router = useRouter();
  const { id: salaId } = useParams();

  const [sala, setSala] = useState<Sala | null>(null);
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [loadingSala, setLoadingSala] = useState(true);
  const [errorSala, setErrorSala] = useState<string | null>(null);
  const [loadingQuestoes, setLoadingQuestoes] = useState(true);
  const [errorQuestoes, setErrorQuestoes] = useState<string | null>(null);
  const database = getDatabase(app);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isTimeRunning, setIsTimeRunning] = useState(false);
  const [showModalFinal, setShowModalFinal] = useState(false);
  const [showResolucaoGeral, setShowResolucaoGeral] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<{ [questaoId: string]: string }>({});
  const [isRevising, setIsRevising] = useState(false);
  const [showGalileuFAQs, setShowGalileuFAQs] = useState(false);
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [quizFinished, setQuizFinished] = useState(false);
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);

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
    }
  ];

  // NOVO: Função para carregar skin selecionada do localStorage
  const loadSelectedSkin = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.uid) {
        const savedSkin = localStorage.getItem(`skin_${user.uid}`);
        if (savedSkin) {
          setSelectedSkin(savedSkin);
        }
      }
    }
  };

  // NOVO: Função para obter a imagem da skin atual
  const getCurrentSkinImage = () => {
    const skin = skins.find(s => s.id === selectedSkin);
    return skin ? skin.image : '/images/galileufrente.png'; // Fallback para skin padrão
  };

  const currentQuestion = questoes[currentQuestionIndex];

  // Função para fechar o menu mobile ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (menuMobileAberto && !target.closest(".menu-mobile-container")) {
        setMenuMobileAberto(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuMobileAberto]);

  const toggleMenuMobile = () => {
    setMenuMobileAberto(!menuMobileAberto);
  };

  useEffect(() => {
    if (typeof salaId === 'string') {
      fetchSala(salaId);
    } else {
      setErrorSala("ID da sala não encontrado ou inválido.");
      setLoadingSala(false);
    }
    // NOVO: Carregar a skin quando o componente montar
    loadSelectedSkin();
  }, [salaId]);

  useEffect(() => {
    if (sala?.questoes_firebase_ids && sala.created_by_user_id) {
      fetchQuestoesFromFirebase(sala.created_by_user_id, sala.questoes_firebase_ids);
    }
  }, [sala]);

  useEffect(() => {
    if (currentQuestion?.tempo && !isRevising && !quizFinished) {
      setTimeRemaining(currentQuestion.tempo);
    } else {
      setTimeRemaining(null);
    }
    setIsTimeRunning(!isRevising && !quizFinished);
    setSelectedAnswer(userAnswers[currentQuestion?.id] || null);
  }, [currentQuestionIndex, currentQuestion?.tempo, userAnswers, isRevising, quizFinished]);

  useEffect(() => {
    if (isTimeRunning && timeRemaining !== null && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prevTime => prevTime !== null ? prevTime - 1 : null);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeRemaining === 0 && isTimeRunning) {
      setIsTimeRunning(false);
      goToNextQuestion();
    }
  }, [isTimeRunning, timeRemaining]);

  const fetchSala = async (id: string) => {
    setLoadingSala(true);
    setErrorSala(null);
    try {
      const { data, error } = await supabase
        .from("salas")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setErrorSala("Erro ao carregar os detalhes da sala.");
      } else if (data) {
        setSala(data as Sala);
      } else {
        setErrorSala("Sala não encontrada.");
      }
    } catch {
      setErrorSala("Erro inesperado ao carregar a sala.");
    } finally {
      setLoadingSala(false);
    }
  };

  const fetchQuestoesFromFirebase = async (userId: string, questaoIds: string[]) => {
    setLoadingQuestoes(true);
    setErrorQuestoes(null);
    if (!userId || !questaoIds || questaoIds.length === 0) {
      setQuestoes([]);
      setLoadingQuestoes(false);
      return;
    }
    try {
      const fetchedQuestoes: Questao[] = [];
      // Buscar questões da primeira referência
      for (const questaoId of questaoIds) {
        const questaoRef = ref(database, `questoes/${userId}/${questaoId}`);
        const snapshot = await get(questaoRef);
        if (snapshot.exists()) {
          fetchedQuestoes.push({ id: questaoId, ...snapshot.val() });
        }
      }
      // Buscar questões da segunda referência
      for (const questaoId of questaoIds) {
        const questaoComBaseNosSensoresRef = ref(database, `questoesComBaseNosSensores/${userId}/${questaoId}`);
        const snapshot = await get(questaoComBaseNosSensoresRef);
        if (snapshot.exists()) {
          fetchedQuestoes.push({ id: questaoId, ...snapshot.val() });
        }
      }
      setQuestoes(fetchedQuestoes);
    } catch {
      setErrorQuestoes("Erro ao carregar as questões.");
    } finally {
      setLoadingQuestoes(false);
    }
  };

  const goToNextQuestion = () => {
    if (currentQuestion?.id && selectedAnswer) {
      setUserAnswers(prevAnswers => ({ ...prevAnswers, [currentQuestion.id]: selectedAnswer }));
    }
    setSelectedAnswer(null);
    if (currentQuestionIndex < questoes.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setShowModalFinal(true);
      setQuizFinished(true);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleToggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const handleVerResolucao = () => {
    setShowModalFinal(false);
    setShowResolucaoGeral(true);
  };

  const handleReverQuestoes = () => {
    setShowModalFinal(false);
    setIsRevising(true);
    setTimeRemaining(null);
    setIsTimeRunning(false);
    setQuizFinished(false);
  };

  const closeModalResolucao = () => {
    setShowResolucaoGeral(false);
  };

  const handleFinalizarRevisao = () => {
    setIsRevising(false);
    setShowModalFinal(true);
  };

  const toggleGalileuFAQs = () => {
    setShowGalileuFAQs(!showGalileuFAQs);
  };

  if (loadingSala) {
    return (
      <div className="h-screen flex items-center justify-center text-white text-lg sm:text-xl bg-purple-900">
        Carregando detalhes da sala...
      </div>
    );
  }

  if (errorSala) {
    return (
      <div className="h-screen flex items-center justify-center text-red-500 text-lg sm:text-xl bg-purple-900 px-4">
        {errorSala}
      </div>
    );
  }

  if (loadingQuestoes) {
    return (
      <div className="h-screen flex items-center justify-center text-white text-lg sm:text-xl bg-purple-900">
        Carregando questões...
      </div>
    );
  }

  if (errorQuestoes) {
    return (
      <div className="h-screen flex items-center justify-center text-red-500 text-lg sm:text-xl bg-purple-900 px-4">
        {errorQuestoes}
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
        backgroundAttachment: "fixed"
      }}
    >
      {/* Header Responsivo */}
      
        <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Image
                src="/images/markim-Photoroom.png"
                alt="Logo Projeto Galileu"
                width={100}
                height={30}
                className="hover:scale-105 transition-transform duration-300 cursor-pointer sm:w-[120px] sm:h-[35px] lg:w-[150px] lg:h-[150px]"
                onClick={() => router.push("/")}
              />
            </div>

            {/* Menu Desktop - Agora inclui o nome da sala e botão voltar */}
            

            {/* Container do Menu Mobile */}
            <div className="menu-mobile-container relative md:hidden">
              {/* Botão Menu Mobile */}
              <button
                onClick={toggleMenuMobile}
                className="text-white p-2 rounded-md border border-purple-400 hover:bg-purple-600 transition duration-300"
                aria-label="Menu"
              >
                <Menu size={20} />
              </button>

              {/* Menu Mobile - Agora contém o botão voltar e nome da sala */}
              {menuMobileAberto && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-purple-900 bg-opacity-95 backdrop-blur-sm border border-purple-400 rounded-lg shadow-lg z-50">
                  <ul className="py-2">
                    <li>
                      <button
                        onClick={() => {
                          router.back();
                          setMenuMobileAberto(false);
                        }}
                        className="w-full text-left text-white px-4 py-3 hover:bg-purple-700 transition duration-300 flex items-center gap-2"
                      >
                        <ArrowLeft size={16} />
                        Voltar
                      </button>
                    </li>
                    <li className="px-4 py-2 text-purple-300 text-sm border-t border-purple-600">
                      Sala: {sala?.nome}
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
     

      {/* Galileu e FAQ - Oculto em mobile */}
      <div className="hidden lg:block fixed left-2 xl:left-4 bottom-4 z-20">
        <div className="flex flex-col items-center">
          <Image
            src={getCurrentSkinImage()} // MODIFICADO: Usando a skin selecionada
            alt="Galileu"
            width={150}
            height={150}
            className="object-contain xl:w-[200px] xl:h-[200px]"
          />
          <button
            onClick={toggleGalileuFAQs}
            className="mt-2 bg-purple-950 text-white border border-purple-950 rounded-full py-2 px-3 xl:px-4 hover:bg-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm xl:text-base transition duration-300"
          >
            <HelpCircle size={16} className="inline mr-1 xl:mr-2" />
            Pergunte ao Galileu
          </button>
        </div>
      </div>

      {/* Botão FAQ Mobile */}
      <button
        onClick={toggleGalileuFAQs}
        className="lg:hidden fixed bottom-4 right-4 z-20 bg-purple-950 text-white border border-purple-950 rounded-full p-3 hover:bg-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-lg transition duration-300"
        aria-label="Pergunte ao Galileu"
      >
        <HelpCircle size={20} />
      </button>

      {/* Container Principal */}
      <div className="pb-4 px-2 sm:px-4">
        <div className="container mx-auto">
          <div className="flex justify-center lg:justify-end">
            <div className="w-full lg:w-4/5 xl:w-3/4 bg-purple-950 bg-opacity-95 p-3 sm:p-4 lg:p-6 xl:p-8 rounded-lg shadow-lg border border-purple-300 text-white">
              
              {questoes.length > 0 && currentQuestion ? (
                <div className="space-y-4 sm:space-y-6">
                  {/* Header da Questão */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold">
                      Questão {currentQuestionIndex + 1} de {questoes.length}
                    </h2>
                    <nav className="hidden md:flex items-center gap-2 lg:gap-4">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-1 lg:gap-2 text-white hover:text-purple-300 px-2 lg:px-4 py-1 lg:py-2 rounded-md transition duration-300 text-sm lg:text-base"
              >
                <ArrowLeft size={16} className="lg:w-5 lg:h-5" />
                <span className="hidden lg:inline">Voltar</span>
              </button>
              
              <div className="text-white text-sm lg:text-base font-medium">
                Sala: <span className="text-purple-300">{sala?.nome}</span>
              </div>
            </nav>
                    {/* Timer */}
                    {!isRevising && !quizFinished && currentQuestion.tempo && timeRemaining !== null && (
                      <div className="flex items-center gap-2 bg-yellow-600 bg-opacity-20 border border-yellow-400 rounded-lg px-3 py-2">
                        <Clock size={16} className="sm:w-5 sm:h-5 text-yellow-300" />
                        <span className="text-sm sm:text-base lg:text-lg text-yellow-300 font-bold">
                          {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card da Questão */}
                  <div className="bg-purple-800 bg-opacity-80 p-3 sm:p-4 lg:p-6 rounded-md border border-purple-400" key={currentQuestion.id}>
                    <h3 className="font-semibold text-sm sm:text-base lg:text-lg mb-3 sm:mb-4 leading-relaxed">
                      {currentQuestion.enunciado}
                    </h3>
                    
                    {/* Anexo da Questão */}
                    {currentQuestion.anexo && (
                      <div className="mt-3 mb-4 flex justify-center">
                        <Image
                          src={currentQuestion.anexo}
                          alt={`Anexo da questão ${currentQuestionIndex + 1}`}
                          width={250}
                          height={200}
                          className="object-contain rounded-md sm:w-[300px] sm:h-[200px] lg:w-[400px] lg:h-[250px]"
                        />
                      </div>
                    )}
                    
                    {/* Alternativas */}
                    <ul className="list-none pl-0 mt-3 sm:mt-4 space-y-2 sm:space-y-3">
                      {Object.entries(currentQuestion.alternativas).map(([letra, texto]) => (
                        <li key={letra}>
                          <label className="flex items-start gap-2 sm:gap-3 cursor-pointer hover:bg-purple-700 hover:bg-opacity-50 p-2 rounded-md transition duration-200">
                            <input
                              type="radio"
                              className="form-radio h-4 w-4 sm:h-5 sm:w-5 text-purple-600 mt-0.5 flex-shrink-0"
                              value={letra}
                              checked={selectedAnswer === letra}
                              onChange={() => handleAnswerSelect(letra)}
                              disabled={isRevising}
                            />
                            <span className="text-sm sm:text-base leading-relaxed">
                              <span className="font-medium text-purple-300">{letra}:</span> {texto}
                            </span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Botões de Navegação */}
                  <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-4">
                    {currentQuestionIndex > 0 && (
                      <button
                        onClick={isRevising ? undefined : () => setCurrentQuestionIndex(prev => prev - 1)}
                        disabled={isRevising}
                        className={`bg-purple-700 hover:bg-purple-600 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded focus:outline-none focus:shadow-outline text-sm sm:text-base transition duration-300 ${isRevising ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        ← Anterior
                      </button>
                    )}
                    
                    <button
                      onClick={isRevising ? handleFinalizarRevisao : goToNextQuestion}
                      className={`bg-purple-700 hover:bg-purple-600 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded focus:outline-none focus:shadow-outline text-sm sm:text-base transition duration-300 ${!selectedAnswer && !isRevising ? 'opacity-50 cursor-not-allowed' : ''} ${currentQuestionIndex === 0 ? 'w-full sm:w-auto' : ''}`}
                      disabled={!selectedAnswer && !isRevising}
                    >
                      {isRevising ? 'Finalizar Revisão' : currentQuestionIndex < questoes.length - 1 ? 'Próxima →' : 'Finalizar'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <p className="text-lg sm:text-xl text-gray-300">Nenhuma questão encontrada para esta sala.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal FAQ do Galileu */}
      {showGalileuFAQs && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-purple-900 p-4 sm:p-6 rounded-lg shadow-lg border border-purple-300 text-white w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold">Dúvidas Frequentes sobre Plano Inclinado</h2>
              <button 
                onClick={toggleGalileuFAQs} 
                className="text-gray-400 hover:text-white focus:outline-none p-1"
              >
                <X size={20} className="sm:w-6 sm:h-6" />
              </button>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {planoInclinadoFAQs.map((faq, index) => (
                <div key={index} className="border border-purple-400 rounded-md overflow-hidden">
                  <button 
                    className="w-full text-left bg-purple-800 hover:bg-purple-700 px-3 sm:px-4 py-2 sm:py-3 focus:outline-none transition duration-200"
                    onClick={() => handleToggleFAQ(index)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm sm:text-base">{faq.pergunta}</span>
                      <span className="text-purple-300 ml-2 flex-shrink-0">
                        {expandedFAQ === index ? '−' : '+'}
                      </span>
                    </div>
                  </button>
                  {expandedFAQ === index && (
                    <div className="p-3 sm:p-4 bg-purple-700">
                      <p className="whitespace-pre-line text-sm sm:text-base leading-relaxed">{faq.resposta}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal Final */}
      {showModalFinal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-purple-900 p-4 sm:p-6 lg:p-8 rounded-lg shadow-lg border border-purple-300 text-white relative w-full max-w-md">
            <button 
              onClick={() => setShowModalFinal(false)} 
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-100 p-1"
            >
              <X size={20} className="sm:w-6 sm:h-6" />
            </button>
            
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Fim das Questões!</h2>
            <p className="mb-4 sm:mb-6 text-sm sm:text-base">O que você gostaria de fazer?</p>
            
            <div className="flex flex-col space-y-2 sm:space-y-3">
              <button 
                onClick={handleVerResolucao} 
                className="bg-blue-700 hover:bg-blue-600 text-white font-bold py-2 sm:py-3 px-4 rounded focus:outline-none focus:shadow-outline text-sm sm:text-base transition duration-300"
              >
                Ver Resolução de Todas as Questões
              </button>
              <button  
                onClick={() => router.push('/analisegeraltesteum')} 
                className="bg-green-700 hover:bg-green-600 text-white font-bold py-2 sm:py-3 px-4 rounded focus:outline-none focus:shadow-outline text-sm sm:text-base transition duration-300"
              >
                Ver Análise Geral
              </button>
              {!isRevising && (
                <button 
                  onClick={handleReverQuestoes} 
                  className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 sm:py-3 px-4 rounded focus:outline-none focus:shadow-outline text-sm sm:text-base transition duration-300"
                >
                  Rever Questões
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Resolução Geral */}
      {showResolucaoGeral && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-purple-800 p-4 sm:p-6 lg:p-8 rounded-lg shadow-lg border border-purple-400 text-white relative max-h-[90vh] w-full max-w-4xl">
            <button 
              onClick={closeModalResolucao} 
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-100 p-1"
            >
              <X size={20} className="sm:w-6 sm:h-6" />
            </button>
            
            <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Resoluções das Questões</h2>
            
            <div className="space-y-4 sm:space-y-6 overflow-y-auto max-h-[calc(90vh-120px)] pr-2">
              {questoes.map((questao, index) => (
                <div key={questao.id} className="p-3 sm:p-4 border border-purple-400 rounded-md">
                  <h3 className="text-base sm:text-lg font-semibold mb-2">Questão {index + 1}:</h3>
                  <p className="mb-3 text-sm sm:text-base leading-relaxed">{questao.enunciado}</p>
                  
                  {questao.anexo && (
                    <div className="mt-2 mb-3 flex justify-center">
                      <Image
                        src={questao.anexo}
                        alt={`Anexo da questão ${index + 1}`}
                        width={250}
                        height={200}
                        className="object-contain rounded-md sm:w-[300px] sm:h-[200px]"
                      />
                    </div>
                  )}
                  
                  <div className="mt-3 p-3 sm:p-4 bg-purple-700 rounded-md">
                    <h4 className="font-medium text-yellow-300 mb-2 flex items-center gap-2">
                      <CheckCircle size={16} />
                      Resolução:
                    </h4>
                    <p className="whitespace-pre-line text-sm sm:text-base leading-relaxed">
                      {questao.resolucao || "Resolução não disponível."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal Revisão */}
      {isRevising && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-purple-800 p-4 sm:p-6 lg:p-8 rounded-lg shadow-lg border border-purple-400 text-white relative max-h-[90vh] w-full max-w-4xl">
            <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Revisão de Questões</h2>
            
            <div className="space-y-4 sm:space-y-6 overflow-y-auto max-h-[calc(90vh-160px)] pr-2">
              {questoes.map((questao, index) => {
                const userAnswer = userAnswers[questao.id];
                const isCorrect = userAnswer === questao.alternativa_correta;
                return (
                  <div key={questao.id} className="p-3 sm:p-4 border rounded-md bg-purple-900">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-base sm:text-lg font-semibold">Questão {index + 1}:</h3>
                      {isCorrect ? (
                        <CheckCircle size={20} className="text-green-400" />
                      ) : (
                        <XCircle size={20} className="text-red-400" />
                      )}
                    </div>
                    
                    <p className="whitespace-pre-line mb-3 text-sm sm:text-base leading-relaxed">{questao.enunciado}</p>
                    
                    {questao.anexo && (
                      <div className="mt-2 mb-3 flex justify-center">
                        <Image 
                          src={questao.anexo} 
                          alt={`Anexo da questão ${index + 1}`} 
                          width={250} 
                          height={200} 
                          className="object-contain rounded-md sm:w-[300px] sm:h-[200px]" 
                        />
                      </div>
                    )}
                    
                    {questao.alternativas && (
                      <ul className="list-none pl-0 mt-3 space-y-2">
                        {Object.entries(questao.alternativas).map(([letra, texto]) => {
                          const isUserAnswer = userAnswer === letra;
                          const isCorrectAnswer = questao.alternativa_correta === letra;
                          return (
                            <li key={letra}>
                              <label className="flex items-start gap-2 sm:gap-3 p-2 rounded-md">
                                <input 
                                  type="radio" 
                                  className="form-radio h-4 w-4 sm:h-5 sm:w-5 text-purple-600 mt-0.5 flex-shrink-0" 
                                  value={letra} 
                                  checked={isUserAnswer} 
                                  disabled 
                                />
                                <span className={`text-sm sm:text-base leading-relaxed ${
                                  isUserAnswer && isCorrectAnswer ? "text-green-400" : 
                                  isUserAnswer && !isCorrectAnswer ? "text-red-400" : ""
                                }`}>
                                  <span className="font-medium text-purple-300">{letra}:</span> {texto}
                                </span>
                                {isUserAnswer && isCorrectAnswer && <CheckCircle size={16} className="text-green-400 mt-0.5 flex-shrink-0" />}
                                {isUserAnswer && !isCorrectAnswer && <XCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />}
                                {isCorrectAnswer && !isUserAnswer && <span className="text-yellow-400 text-sm mt-0.5 flex-shrink-0">(Correta)</span>}
                              </label>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                    
                    {questao.resolucao && (
                      <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-purple-700 rounded-md">
                        <h4 className="font-medium text-yellow-300 mb-2 flex items-center gap-2">
                          <CheckCircle size={16} />
                          Resolução:
                        </h4>
                        <p className="whitespace-pre-line text-white text-sm sm:text-base leading-relaxed">{questao.resolucao}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 sm:mt-6 flex justify-end">
              <button 
                onClick={handleFinalizarRevisao} 
                className="bg-green-700 hover:bg-green-600 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded focus:outline-none focus:shadow-outline text-sm sm:text-base transition duration-300"
              >
                Finalizar Revisão
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaDeAulaTesteSupabase;

