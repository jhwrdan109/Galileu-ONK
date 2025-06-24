/* eslint-disable */

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDatabase, ref, onValue, set, push, update } from "firebase/database";
import { app } from "../../../lib/firebaseConfig";
import ForcasSVG from "@/components/ForcasSVG";
import Image from "next/image";
import GalieluExplicacaoInicio from "../galileuexplicacaoinicio/page"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Ícone do hambúrguer
const HamburgerIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

// Ícone de fechar
const CloseIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ExplicacaoGalileu: React.FC<{
  angulo: number | null;
  forcaPeso: number | null;
  forcaNormal: number | null;
  forcaAtrito: number | null;
  aceleracao: number | null;
  velocidade: number | null;
  px: number | null;
  py: number | null;
  forcaResultante: number | null;
  distancia: number | null;
  tempo: number | null;
}> = ({ 
  angulo, 
  forcaPeso, 
  forcaNormal, 
  forcaAtrito, 
  aceleracao,
  velocidade,
  px,
  py,
  forcaResultante,
  distancia,
  tempo
}) => {
  const [explicando, setExplicando] = useState(false);
  const [textoAtual, setTextoAtual] = useState("");
  const [indiceExplicacao, setIndiceExplicacao] = useState(0);
  const [tooltipVisivel, setTooltipVisivel] = useState<string | null>(null);
  
  const explicacoes = [
    {
      id: "angulo",
      titulo: "Ângulo (θ)",
      texto: "O ângulo de inclinação da rampa em relação à horizontal. Quanto maior o ângulo, maior a componente da força peso na direção do movimento."
    },
    {
      id: "velocidade",
      titulo: "Velocidade (v)",
      texto: "A rapidez com que o objeto se desloca ao longo da rampa, medida em metros por segundo (m/s)."
    },
    {
      id: "forcaPeso",
      titulo: "Força Peso (P)",
      texto: "A força com a qual a gravidade atrai o objeto para baixo. Ela é calculada pela fórmula P = m × g, onde m é a massa do objeto e g é a aceleração da gravidade."
    },
    {
      id: "px",
      titulo: "Componente x do Peso (Px)",
      texto: "A componente da força peso paralela à superfície da rampa. Calculada como Px = P × sen(θ), esta é a força que efetivamente impulsiona o objeto para baixo na rampa."
    },
    {
      id: "py",
      titulo: "Componente y do Peso (Py)",
      texto: "A componente da força peso perpendicular à superfície da rampa. Calculada como Py = P × cos(θ), esta componente é contrabalançada pela força normal."
    },
    {
      id: "forcaNormal",
      titulo: "Força Normal (N)",
      texto: "A força que a superfície exerce sobre o objeto, sempre perpendicular à superfície de contato. Em um plano inclinado, ela é igual à componente y do peso: N = P × cos(θ)."
    },
    {
      id: "forcaAtrito",
      titulo: "Força de Atrito (Fa)",
      texto: "A força que resiste ao movimento do objeto. Sua intensidade é dada por Fa = μ × N, onde μ é o coeficiente de atrito entre as superfícies."
    },
    {
      id: "forcaResultante",
      titulo: "Força Resultante (Fr)",
      texto: "A soma de todas as forças agindo sobre o objeto na direção do movimento. Na rampa, é calculada como Fr = Px - Fa. Esta força resultante é responsável pela aceleração do objeto."
    },
    {
      id: "aceleracao",
      titulo: "Aceleração (a)",
      texto: "A taxa de variação da velocidade do objeto ao longo do tempo. Pela Segunda Lei de Newton, a = Fr / m, onde Fr é a força resultante e m é a massa do objeto."
    },
    {
      id: "distancia",
      titulo: "Distância (d)",
      texto: "O comprimento do caminho percorrido pelo objeto ao longo da rampa, medido em metros (m)."
    },
    {
      id: "tempo",
      titulo: "Tempo (t)",
      texto: "A duração do movimento do objeto, medida em segundos (s)."
    }
  ];

  const getExplicacaoPorId = (id: string) => {
    return explicacoes.find(exp => exp.id === id);
  };

  const mostrarTooltip = (id: string) => {
    setTooltipVisivel(id);
  };

  const esconderTooltip = () => {
    setTooltipVisivel(null);
  };

  const iniciarExplicacao = () => {
    setExplicando(true);
    setIndiceExplicacao(0);
    setTextoAtual("");
  };

  useEffect(() => {
    if (!explicando) return;

    let textoCompleto = "";
    const explicacaoAtual = explicacoes[indiceExplicacao];
    
    if (!explicacaoAtual) {
      setExplicando(false);
      return;
    }

    textoCompleto = `${explicacaoAtual.titulo}: ${explicacaoAtual.texto}`;
    
    let indiceCaractere = 0;
    const velocidadeDigitacao = 25; // milissegundos por caractere

    const intervalo = setInterval(() => {
      if (indiceCaractere <= textoCompleto.length) {
        setTextoAtual(textoCompleto.substring(0, indiceCaractere));
        indiceCaractere++;
      } else {
        clearInterval(intervalo);
        setTimeout(() => {
          setIndiceExplicacao(prev => prev + 1);
          setTextoAtual("");
        }, 1000);
      }
    }, velocidadeDigitacao);

    return () => clearInterval(intervalo);
  }, [explicando, indiceExplicacao]);

  // Componente de tooltip
  const TooltipComponent = ({ id }: { id: string }) => {
    const explicacao = getExplicacaoPorId(id);
    if (!explicacao) return null;
    
    return (
      <div className="absolute z-10 bg-gray-900 text-white p-3 rounded-lg shadow-lg max-w-xs transform -translate-y-full -translate-x-1/4 mb-2 opacity-90 text-xs sm:text-sm">
        <h4 className="font-bold mb-1">{explicacao.titulo}</h4>
        <p>{explicacao.texto}</p>
        <div className="absolute w-3 h-3 bg-gray-900 transform rotate-45 left-1/4 bottom-0 translate-y-1/2"></div>
      </div>
    );
  };

  return (
    <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-md mt-6 sm:mt-8 mb-4 sm:mb-5 mx-2 sm:mx-0">
      <h3 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4 text-black">Explicação dos Valores</h3>
      <div className="flex flex-col lg:flex-row">
        <div className="lg:w-1/3 flex flex-col items-center justify-center p-2 sm:p-4 mb-4 lg:mb-0">
          <img 
            src="/images/galileumexendo.gif" 
            alt="Galileu explicando" 
            className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full mb-3 sm:mb-4"
          />
          <button
            onClick={iniciarExplicacao}
            disabled={explicando}
            className="bg-purple-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-purple-500 transition duration-300 disabled:bg-gray-400 text-sm sm:text-base w-full sm:w-auto"
          >
            {explicando ? "Explicando..." : "Peça ao Galileu explicar"}
          </button>
        </div>
        <div className="lg:w-2/3 space-y-3 sm:space-y-4 text-black p-2 sm:p-4">
          {explicando ? (
            <div className="border-l-4 border-purple-600 pl-3 sm:pl-4 py-2 min-h-24 sm:min-h-32 flex items-center">
              <p className="text-sm sm:text-base md:text-lg">{textoAtual}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div 
                onMouseEnter={() => mostrarTooltip("velocidade")}
                onMouseLeave={esconderTooltip}
                className="border-l-4 border-green-600 pl-3 sm:pl-4 py-2 relative cursor-help"
              >
                <p className="text-sm sm:text-base"><strong className="text-green-600">Velocidade:</strong> {velocidade !== null ? `${velocidade.toFixed(2)} m/s` : "Carregando..."}</p>
                {tooltipVisivel === "velocidade" && <TooltipComponent id="velocidade" />}
              </div>
              <div 
                onMouseEnter={() => mostrarTooltip("px")}
                onMouseLeave={esconderTooltip}
                className="border-l-4 border-blue-600 pl-3 sm:pl-4 py-2 relative cursor-help"
              >
                <p className="text-sm sm:text-base"><strong className="text-blue-600">Px:</strong> {px !== null ? `${px.toFixed(2)} N` : "Carregando..."}</p>
                {tooltipVisivel === "px" && <TooltipComponent id="px" />}
              </div>
              <div 
                onMouseEnter={() => mostrarTooltip("py")}
                onMouseLeave={esconderTooltip}
                className="border-l-4 border-indigo-600 pl-3 sm:pl-4 py-2 relative cursor-help"
              >
                <p className="text-sm sm:text-base"><strong className="text-indigo-600">Py:</strong> {py !== null ? `${py.toFixed(2)} N` : "Carregando..."}</p>
                {tooltipVisivel === "py" && <TooltipComponent id="py" />}
              </div>
              <div 
                onMouseEnter={() => mostrarTooltip("forcaAtrito")}
                onMouseLeave={esconderTooltip}
                className="border-l-4 border-orange-500 pl-3 sm:pl-4 py-2 relative cursor-help"
              >
                <p className="text-sm sm:text-base"><strong className="text-orange-500">Força de Atrito:</strong> {forcaAtrito !== null ? `${forcaAtrito.toFixed(2)} N` : "Carregando..."}</p>
                {tooltipVisivel === "forcaAtrito" && <TooltipComponent id="forcaAtrito" />}
              </div>
              <div 
                onMouseEnter={() => mostrarTooltip("forcaPeso")}
                onMouseLeave={esconderTooltip}
                className="border-l-4 border-red-600 pl-3 sm:pl-4 py-2 relative cursor-help"
              >
                <p className="text-sm sm:text-base"><strong className="text-red-600">Força Peso:</strong> {forcaPeso !== null ? `${forcaPeso.toFixed(2)} N` : "Carregando..."}</p>
                {tooltipVisivel === "forcaPeso" && <TooltipComponent id="forcaPeso" />}
              </div>
              <div 
                onMouseEnter={() => mostrarTooltip("forcaResultante")}
                onMouseLeave={esconderTooltip}
                className="border-l-4 border-purple-600 pl-3 sm:pl-4 py-2 relative cursor-help"
              >
                <p className="text-sm sm:text-base"><strong className="text-purple-600">Força Resultante:</strong> {forcaResultante !== null ? `${forcaResultante.toFixed(2)} N` : "Carregando..."}</p>
                {tooltipVisivel === "forcaResultante" && <TooltipComponent id="forcaResultante" />}
              </div>
              <div 
                onMouseEnter={() => mostrarTooltip("forcaNormal")}
                onMouseLeave={esconderTooltip}
                className="border-l-4 border-green-500 pl-3 sm:pl-4 py-2 relative cursor-help"
              >
                <p className="text-sm sm:text-base"><strong className="text-green-500">Força Normal:</strong> {forcaNormal !== null ? `${forcaNormal.toFixed(2)} N` : "Carregando..."}</p>
                {tooltipVisivel === "forcaNormal" && <TooltipComponent id="forcaNormal" />}
              </div>
              <div 
                onMouseEnter={() => mostrarTooltip("aceleracao")}
                onMouseLeave={esconderTooltip}
                className="border-l-4 border-pink-500 pl-3 sm:pl-4 py-2 relative cursor-help"
              >
                <p className="text-sm sm:text-base"><strong className="text-pink-500">Aceleração:</strong> {aceleracao !== null ? `${aceleracao.toFixed(2)} m/s²` : "Carregando..."}</p>
                {tooltipVisivel === "aceleracao" && <TooltipComponent id="aceleracao" />}
              </div>
              <div 
                onMouseEnter={() => mostrarTooltip("distancia")}
                onMouseLeave={esconderTooltip}
                className="border-l-4 border-yellow-500 pl-3 sm:pl-4 py-2 relative cursor-help"
              >
                <p className="text-sm sm:text-base"><strong className="text-yellow-500">Distância:</strong> {distancia !== null ? `${distancia.toFixed(2)} cm` : "Carregando..."}</p>
                {tooltipVisivel === "distancia" && <TooltipComponent id="distancia" />}
              </div>
              <div 
                onMouseEnter={() => mostrarTooltip("tempo")}
                onMouseLeave={esconderTooltip}
                className="border-l-4 border-cyan-500 pl-3 sm:pl-4 py-2 relative cursor-help"
              >
                <p className="text-sm sm:text-base"><strong className="text-cyan-500">Tempo:</strong> {tempo !== null ? `${tempo.toFixed(2)} s` : "Carregando..."}</p>
                {tooltipVisivel === "tempo" && <TooltipComponent id="tempo" />}
              </div>
              <div 
                onMouseEnter={() => mostrarTooltip("angulo")}
                onMouseLeave={esconderTooltip}
                className="border-l-4 border-amber-500 pl-3 sm:pl-4 py-2 relative cursor-help"
              >
                <p className="text-sm sm:text-base"><strong className="text-amber-500">Ângulo:</strong> {angulo !== null ? `${angulo.toFixed(2)}°` : "Carregando..."}</p>
                {tooltipVisivel === "angulo" && <TooltipComponent id="angulo" />}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AnaliseSimulacao: React.FC = () => {
  const router = useRouter();
  const [loadingData, setLoadingData] = useState(false);
  const [menuAberto, setMenuAberto] = useState(false);

  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulationStarted, setSimulationStarted] = useState(false);
  const [simulacaoId, setSimulacaoId] = useState<string | null>(null);
  
  // Valores vindos do Firebase
  const [distancia, setDistancia] = useState<number | null>(null);
  const [angulo, setAngulo] = useState<number | null>(null);
  const [velocidade, setVelocidade] = useState<number | null>(null);
  const [px, setPx] = useState<number | null>(null);
  const [py, setPy] = useState<number | null>(null);
  const [tempo, setTempo] = useState<number | null>(null);
  const [aceleracao, setAceleracao] = useState<number | null>(null);
  const [forcaPeso, setForcaPeso] = useState<number | null>(null);
  const [forcaNormal, setForcaNormal] = useState<number | null>(null);
  const [forcaAtrito, setForcaAtrito] = useState<number | null>(null);
  
  // Calcula força resultante localmente
  const forcaResultante = py !== null && forcaAtrito !== null 
    ? py - forcaAtrito 
    : null;

  // Dados para o gráfico
  const [dadosGrafico, setDadosGrafico] = useState<Array<{angulo: number, aceleracao: number}>>([]);

  // Função para alternar o menu
  const alternarMenu = () => {
    setMenuAberto(!menuAberto);
  };

  // Função para fechar o menu ao clicar em um item
  const fecharMenu = () => {
    setMenuAberto(false);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(user.name || user.email);
      setLoading(false);
    } else {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (!simulationStarted || !simulacaoId) return;

    const database = getDatabase(app);
    const simulacaoDadosRef = ref(database, `simulacoes/${simulacaoId}/dados`);

    const updateSimulationData = () => {
      set(simulacaoDadosRef, {
        distancia,
        angulo,
        velocidade,
        px,
        py,
        tempo,
        aceleracao,
        forcaPeso,
        forcaNormal,
        forcaAtrito,
        forcaResultante: forcaResultante !== null ? forcaResultante.toFixed(2) : 0
      }).catch((error) => {
        console.error("Erro ao atualizar dados da simulação:", error);
      });
    };

    if (distancia !== null && angulo !== null && velocidade !== null) {
      updateSimulationData();
    }

    const interval = setInterval(updateSimulationData, 5000);
    
    return () => clearInterval(interval);
  }, [
    simulationStarted, 
    simulacaoId, 
    distancia, 
    angulo, 
    velocidade, 
    px, 
    py, 
    tempo,
    aceleracao, 
    forcaPeso, 
    forcaNormal, 
    forcaAtrito,
    forcaResultante
  ]);

  useEffect(() => {
    if (!simulationStarted) return;

    const database = getDatabase(app);

    const distRef = ref(database, "sensor/distancia");
    const angRef = ref(database, "sensor/angulo");
    const velRef = ref(database, "sensor/velocidade");
    const pxRef = ref(database, "sensor/px");
    const pyRef = ref(database, "sensor/py");
    const tempoRef = ref(database, "sensor/tempo");
    const accRef = ref(database, "sensor/aceleracao");
    const pesoRef = ref(database, "sensor/peso");
    const normalRef = ref(database, "sensor/normal");
    const atritoRef = ref(database, "sensor/atrito");
    const graficoRef = ref(database, "sensor/dadosGrafico");

    const unsub1 = onValue(distRef, (snap) => {
      if (snap.exists()) {
        setDistancia(parseFloat(parseFloat(snap.val()).toFixed(2)));
      }
    });
    
    const unsub2 = onValue(angRef, (snap) => {
      if (snap.exists()) {
        setAngulo(parseFloat(parseFloat(snap.val()).toFixed(2)));
      }
    });
    
    const unsub3 = onValue(velRef, (snap) => {
      if (snap.exists()) {
        setVelocidade(parseFloat(parseFloat(snap.val()).toFixed(2)));
      }
    });
    
    const unsub4 = onValue(pxRef, (snap) => {
      if (snap.exists()) {
        setPx(parseFloat(parseFloat(snap.val()).toFixed(2)));
      }
    });
    
    const unsub5 = onValue(pyRef, (snap) => {
      if (snap.exists()) {
        setPy(parseFloat(parseFloat(snap.val()).toFixed(2)));
      }
    });
    
    const unsub6 = onValue(tempoRef, (snap) => {
      if (snap.exists()) {
        setTempo(parseFloat(parseFloat(snap.val()).toFixed(2)));
      }
    });
    
    const unsub7 = onValue(accRef, (snap) => {
      if (snap.exists()) {
        setAceleracao(parseFloat(parseFloat(snap.val()).toFixed(2)));
      }
    });
    
    const unsub8 = onValue(pesoRef, (snap) => {
      if (snap.exists()) {
        setForcaPeso(parseFloat(parseFloat(snap.val()).toFixed(2)));
      }
    });
    
    const unsub9 = onValue(normalRef, (snap) => {
      if (snap.exists()) {
        setForcaNormal(parseFloat(parseFloat(snap.val()).toFixed(2)));
      }
    });
    
    const unsub10 = onValue(atritoRef, (snap) => {
      if (snap.exists()) {
        setForcaAtrito(parseFloat(parseFloat(snap.val()).toFixed(2)));
      }
    });
    
    const unsub11 = onValue(graficoRef, (snap) => {
      if (snap.exists()) {
        const graficoData = snap.val();
        if (Array.isArray(graficoData)) {
          setDadosGrafico(graficoData);
          
          if (simulacaoId) {
            const graficoSimulacaoRef = ref(database, `simulacoes/${simulacaoId}/grafico`);
            set(graficoSimulacaoRef, graficoData).catch((error) => {
              console.error("Erro ao atualizar gráfico na simulação:", error);
            });
          }
        } else {
          console.error("Dados do gráfico não estão em formato de array");
        }
      }
    });

    return () => {
      unsub1();
      unsub2();
      unsub3();
      unsub4();
      unsub5();
      unsub6();
      unsub7();
      unsub8();
      unsub9();
      unsub10();
      unsub11();
    };
  }, [simulationStarted, simulacaoId]);

  const gerarDadosGrafico = () => {
    const database = getDatabase(app);
    const graficoRef = ref(database, "sensor/dadosGrafico");
    
    const dadosGerados = Array.from({length: 91}, (_, i) => ({
      angulo: i,
      aceleracao: i > 0 ? parseFloat((Math.sin(i * Math.PI / 180) * 9.8).toFixed(2)) : 0
    }));
    
    set(graficoRef, dadosGerados).catch(error => {
      console.error("Erro ao gerar dados do gráfico:", error);
    });
  };

  // Função para registrar o início da simulação no ranking
  const registrarInicioSimulacao = async (userName: string) => {
    const database = getDatabase(app);
    const simulacoesIniciadasRef = ref(database, "simulacoes_iniciadas");
    const novoRegistroRef = push(simulacoesIniciadasRef);
    
    try {
      await set(novoRegistroRef, {
        userName: userName,
        timestamp: new Date().toISOString(),
        data: new Date().toLocaleDateString("pt-BR"),
        hora: new Date().toLocaleTimeString("pt-BR")
      });
      console.log("Início de simulação registrado com sucesso para:", userName);
    } catch (error) {
      console.error("Erro ao registrar início da simulação:", error);
    }
  };

  const iniciarSimulacao = () => {
    if (simulationStarted) return;

    const database = getDatabase(app);
    
    const simulacoesRef = ref(database, "simulacoes");
    const novaSimulacaoRef = push(simulacoesRef);
    const novoSimulacaoId = novaSimulacaoRef.key;
    
    const timestampInicio = new Date().toISOString();
    
    const liberarRef = ref(database, "sensor/liberar");
    
    // Definir o estado de carregamento como verdadeiro
    setLoadingData(true);

    // NOVO: Registrar o início da simulação para o ranking
    if (userName) {
      registrarInicioSimulacao(userName);
    }
      
    set(novaSimulacaoRef, {
      userName,
      timestamp: timestampInicio,
      status: "iniciada",
      dados: {
        distancia: 0,
        angulo: 0,
        velocidade: 0,
        px: 0,
        py: 0,
        tempo: 0,
        aceleracao: 0,
        forcaPeso: 0,
        forcaNormal: 0,
        forcaAtrito: 0,
        forcaResultante: 0
      }
    })
      .then(() => {
        return set(liberarRef, true); // Liberar imediatamente
      })
      .then(() => {
        setSimulacaoId(novoSimulacaoId);
        setSimulationStarted(true);
        
        const graficoRef = ref(database, "sensor/dadosGrafico");
        onValue(graficoRef, (snap) => {
          if (!snap.exists() || !Array.isArray(snap.val()) || snap.val().length === 0) {
            gerarDadosGrafico();
          }
        }, { onlyOnce: true });
        
        // Configurar um temporizador para desativar o estado de carregamento após 12 segundos
        setTimeout(() => {
          setLoadingData(false);
        }, 12000);
      })
      .catch((error) => {
        console.error("Erro ao iniciar simulação:", error);
        setLoadingData(false); // Garantir que o carregamento seja desativado em caso de erro
      });
  };

  const InfoCard = ({
    title,
    value,
    unit,
  }: {
    title: string;
    value: number | null;
    unit: string;
  }) => (
    <div className="p-3 sm:p-4 md:p-6 bg-white rounded-lg shadow-lg text-center">
      <h4 className="text-sm sm:text-lg md:text-xl font-semibold text-black mb-1 sm:mb-2">{title}</h4>
      <p className="text-lg sm:text-xl md:text-2xl font-bold text-black truncate">
        {loadingData || value === null ? "Carregando..." : `${value.toFixed(2)} ${unit}`}
      </p>
    </div>
  );

  const finalizarSimulacao = () => {
    if (!simulationStarted || !simulacaoId) return;

    const database = getDatabase(app);
    const liberarRef = ref(database, "sensor/liberar");
    const simulacaoRef = ref(database, `simulacoes/${simulacaoId}`);

    set(liberarRef, false)
      .then(() => {
        return update(simulacaoRef, { status: "finalizada" });
      })
      .then(() => {
        setSimulationStarted(false);
        setSimulacaoId(null);
      })
      .catch((error) => {
        console.error("Erro ao finalizar simulação:", error);
      });
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-white text-xl">
        Carregando...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cover bg-center relative" style={{
      backgroundImage: "url(\'/images/kokushibo.png\')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundAttachment: "fixed",
    }}>
      <GalieluExplicacaoInicio/>
      <div className="container mx-auto px-2 sm "></div><div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
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
                  onClick={() => router.push("/rankingaluno")} // Adicionado botão para o ranking
                  className="text-white px-4 lg:px-6 py-2 lg:py-3 rounded-md border border-purple-400 bg-transparent hover:text-purple-300 hover:border-purple-300 transition duration-300 shadow-md hover:shadow-lg text-sm lg:text-base"
                >
                  Ranking
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push("/editarperfilaluno")}
                  className="bg-purple-600 text-white px-4 lg:px-8 py-2 lg:py-3 rounded-md font-bold transition duration-300 shadow-lg hover:bg-purple-500 hover:shadow-xl text-sm lg:text-base"
                >
                  {userName}
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
                      router.push("/ranking"); // Adicionado botão para o ranking no menu mobile
                      fecharMenu();
                    }}
                    className="w-full text-left text-white px-4 py-3 hover:bg-purple-700 transition duration-300"
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
                    {userName}
                  </button>
                </li>
              </ul>
            </div>
          )}
        </header>

        <div className="relative max-w-6xl mx-auto bg-purple-900 bg-opacity-60 border border-purple-300 p-4 sm:p-6 md:p-8 rounded-xl mt-4 sm:mt-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-white">Análise</h2>

          {!simulationStarted ? (
            <div className="flex justify-center">
              <button
                onClick={iniciarSimulacao}
                className="bg-purple-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold hover:bg-purple-600 transition duration-300 shadow-lg text-sm sm:text-base"
              >
                Iniciar Simulação
              </button>
            </div>
          ) : (
            <>
              <div className="flex justify-center mb-6 sm:mb-10">
                <button
                  onClick={finalizarSimulacao}
                  className="bg-red-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold hover:bg-red-500 transition duration-300 shadow-lg text-sm sm:text-base"
                >
                  Fim da Simulação
                </button>
              </div>
              
              {/* Grid de cards responsivo */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 sm:gap-4 md:gap-6 text-black mb-8 sm:mb-14">
                <InfoCard title="Distância" value={distancia} unit="cm" />
                <InfoCard title="Ângulo" value={angulo} unit="°" />
                <InfoCard title="Velocidade" value={velocidade} unit="m/s" />
                <InfoCard title="Px" value={px} unit="N" />
                <InfoCard title="Py" value={py} unit="N" />
                <InfoCard title="Tempo" value={tempo} unit="s" />
                <InfoCard title="Força Peso" value={forcaPeso} unit="N" />
                <InfoCard title="Força Normal" value={forcaNormal} unit="N" />
                <InfoCard title="Força Atrito" value={forcaAtrito} unit="N" />
                <InfoCard title="Aceleração" value={aceleracao} unit="m/s²" />
                <InfoCard title="Força Resultante" value={forcaResultante} unit="N" />
              </div>

              {/* Representação das Forças */}
              <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-lg mb-6 sm:mb-12">
                <h3 className="text-lg sm:text-xl font-semibold text-black mb-3 sm:mb-4">Representação das Forças</h3>
                <div className="flex justify-center items-center h-64 sm:h-80 md:h-96 overflow-x-auto">
                  <ForcasSVG
                    forcaPeso={forcaPeso !== null ? forcaPeso : 0}
                    forcaNormal={forcaNormal !== null ? forcaNormal : 0}
                    forcaAtrito={forcaAtrito !== null ? forcaAtrito : 0}
                    px={px !== null ? px : 0}
                    py={py !== null ? py : 0}
                    forcaResultante={forcaResultante !== null ? forcaResultante : 0}
                    anguloInicial={30}
                    angulo={angulo !== null ? angulo : 30}
                  />
                </div>
              </div>

              {/* Componente de Explicação */}
              <ExplicacaoGalileu
                angulo={angulo}
                forcaPeso={forcaPeso}
                forcaNormal={forcaNormal}
                forcaAtrito={forcaAtrito}
                aceleracao={aceleracao}
                velocidade={velocidade}
                px={px}
                py={py}
                forcaResultante={forcaResultante}
                distancia={distancia}
                tempo={tempo}
              />
              
              {/* Gráfico */}
              <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-lg">
                <h3 className="text-lg sm:text-xl font-semibold text-black mb-3 sm:mb-4">
                  Gráfico: Aceleração vs Ângulo
                </h3>
                <div className="w-full overflow-x-auto">
                  <ResponsiveContainer width="100%" height={250} minWidth={300}>
                    <LineChart 
                      data={dadosGrafico.length > 0 ? dadosGrafico : Array.from({length: 91}, (_, i) => ({angulo: i, aceleracao: 0}))}
                      margin={{ top: 5, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="angulo" 
                        label={{ value: "Ângulo (°)", position: "insideBottomRight", offset: 0 }}
                        domain={[0, 90]}
                        ticks={[0, 15, 30, 45, 60, 75, 90]}
                      />
                      <YAxis 
                        label={{ value: "Aceleração (m/s²)", angle: -90, position: "insideLeft" }}
                        domain={[0, 10]}
                      />
                      <Tooltip 
                        formatter={(value) => [`${value} m/s²`, "Aceleração"]}
                        labelFormatter={(label) => `Ângulo: ${label}°`}
                      />
                      <Line
                        type="monotone"
                        dataKey="aceleracao"
                        stroke="#7c3aed"
                        strokeWidth={2}
                        dot={{ r: 2 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnaliseSimulacao;

