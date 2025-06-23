/* eslint-disable */

"use client";
import React, { useState, useEffect } from 'react';
import { getDatabase, ref, onValue, push } from 'firebase/database';
import { app } from '../../../lib/firebaseConfig';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Menu, X, ArrowLeft, Clock, HelpCircle, CheckCircle } from 'lucide-react';

const CriarQuestaoDispositivo = () => {
  const [sensor, setSensor] = useState<any>(null);
  const [tempoMinutos, setTempoMinutos] = useState(0);
  const [tempoSegundos, setTempoSegundos] = useState(0);
  const [mostrarModalTempo, setMostrarModalTempo] = useState(false);
  const [enunciado, setEnunciado] = useState('');
  const [resolucao, setResolucao] = useState('');
  const [incognita, setIncognita] = useState('');
  const [alternativas, setAlternativas] = useState<{ [key: string]: string }>({
    A: '', B: '', C: '', D: '', E: '',
  });
  const [respostaCorreta, setRespostaCorreta] = useState('');
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);

  const router = useRouter();
  const tempoTotal = Math.max(0, tempoMinutos * 60 + tempoSegundos);

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
    const db = getDatabase(app);
    const sensorRef = ref(db, 'sensor');

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(`Prof. ${user.name || user.email}`);
      setUserId(user.uid);
      
      // NOVO: Carregar skin selecionada quando o usuário for carregado
      if (user.uid) {
        loadSelectedSkin(user.uid);
      }

      setLoading(false);
    } else {
      router.push("/login");
    }

    onValue(sensorRef, (snapshot) => {
      const dados = snapshot.val();
      if (dados) setSensor(dados);
    });
  }, [router]);

  const criarQuestao = () => {
    if (!sensor) {
      alert('Sensor não encontrado!');
      return;
    }

    const novaQuestao = {
      enunciado,
      tempo: tempoTotal,
      resolucao,
      criadoEm: new Date().toISOString(),
      professor: userName,
      dados_usados: {
        aceleracao: sensor.aceleracao,
        distancia: sensor.distancia,
        angulo: sensor.angulo,
        tempo: sensor.tempo,
      },
      incognita,
      alternativas,
      respostaCorreta,
    };

    const db = getDatabase(app);
    const questoesRef = ref(db, `questoesComBaseNosSensores/${userId}`);
    push(questoesRef, novaQuestao).then(() => {
      alert('Questão criada com sucesso!');
      setEnunciado('');
      setTempoMinutos(0);
      setTempoSegundos(0);
      setResolucao('');
      setIncognita('');
      setAlternativas({ A: '', B: '', C: '', D: '', E: '' });
      setRespostaCorreta('');
    });
  };

  const atualizarAlternativa = (letra: string, value: string) => {
    setAlternativas((prev) => ({ ...prev, [letra]: value }));
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-white text-lg sm:text-xl bg-purple-900">
        Carregando...
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{
        backgroundImage: "url('/images/FundoCanva.png')",
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Imagem fixa na esquerda - MODIFICADA para usar skin selecionada */}
     

      {/* Header Responsivo */}
        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Image
                src="/images/markim-Photoroom.png"
                alt="Logo Projeto Galileu"
                width={120}
                height={40}
                className="hover:scale-105 transition-transform duration-300 cursor-pointer sm:w-[150px] sm:h-[150px]"
                onClick={() => router.push("/dashboardprof")}
              />
            </div>

            {/* Menu Desktop */}
            <nav className="hidden md:block">
              <ul className="flex gap-4 lg:gap-6 items-center">
                <li>
                  <button
                    onClick={() => router.push('/dashboardprof')}
                    className="text-white hover:text-purple-300 px-4 lg:px-6 py-2 lg:py-3 rounded-md transition duration-300 text-sm lg:text-base"
                  >
                    Início
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push('/simuproftestesupabase')}
                    className="text-white hover:text-purple-300 px-4 lg:px-6 py-2 lg:py-3 rounded-md transition duration-300 text-sm lg:text-base border border-purple-400 rounded-lg shadow-lg"
                  >
                    Simulações
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => router.push('/editarperfilprof')}
                    className="bg-purple-600 text-white px-4 lg:px-8 py-2 lg:py-3 rounded-md font-bold transition duration-300 flex items-center gap-2 text-sm lg:text-base"
                  >
                    <span className="hidden lg:inline">{userName}</span>
                    <span className="lg:hidden">Perfil</span>
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
                <Menu size={24} />
              </button>

              {/* Menu Mobile */}
              {menuMobileAberto && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-purple-900 bg-opacity-95 backdrop-blur-sm border border-purple-400 rounded-lg shadow-lg z-50">
                  <ul className="py-2">
                    <li>
                      <button
                        onClick={() => {
                          router.push('/dashboardprof');
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
                          router.push('/simuproftestesupabase');
                          setMenuMobileAberto(false);
                        }}
                        className="w-full text-left text-white px-4 py-3 hover:bg-purple-700 transition duration-300"
                      >
                        Simulações
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => {
                          router.push('/editarperfilprof');
                          setMenuMobileAberto(false);
                        }}
                        className="w-full text-left text-white px-4 py-3 hover:bg-purple-700 transition duration-300"
                      >
                        Perfil
                      </button>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

      {/* Galileu + botão de ajuda - Oculto em mobile */}
      <div className="hidden lg:flex flex-col items-center fixed left-2 xl:left-4 bottom-4 z-20 gap-3">
        <Image 
          src={getCurrentSkinImage()} // MUDANÇA: Usar função para obter imagem da skin atual
          alt="Galileu" 
          width={150} 
          height={200} 
          className="xl:w-[200px] xl:h-[200px]" 
        />
        <button
          onClick={() => setShowModal(true)}
          className="bg-yellow-400 text-black px-3 xl:px-4 py-2 rounded hover:bg-yellow-300 transition duration-300 text-sm xl:text-base font-medium flex items-center gap-2"
        >
          <HelpCircle size={16} />
          Tipo / Exemplo
        </button>
      </div>

      {/* Botão de ajuda mobile */}
      <button
        onClick={() => setShowModal(true)}
        className="lg:hidden fixed bottom-4 right-4 z-20 bg-yellow-400 text-black p-3 rounded-full hover:bg-yellow-300 transition duration-300 shadow-lg"
        aria-label="Tipo / Exemplo"
      >
        <HelpCircle size={20} />
      </button>

      {/* Modal de ajuda */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-2 sm:p-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-md relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-black p-1"
            >
              <X size={20} />
            </button>
            <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-gray-800">Tipo e Exemplo de Uso</h2>
            <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
              Esta ferramenta permite criar questões baseadas nos dados coletados pelos sensores do dispositivo. 
              Use os valores de aceleração, distância, ângulo e tempo para formular problemas de física aplicada.
            </p>
          </div>
        </div>
      )}

      {/* Conteúdo principal */}
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 lg:py-8">
        <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 lg:gap-8 xl:gap-10">
          
          {/* Dados do sensor */}
          <div className="flex-1 order-2 xl:order-1">
            <div className="bg-purple-900 bg-opacity-90 backdrop-blur-sm border border-purple-300 rounded-lg p-3 sm:p-4 lg:p-6">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-3 sm:mb-4 lg:mb-6 text-white flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Dados do Sensor
              </h3>
              
              {sensor ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                  {[
                    { key: 'aceleracao', label: 'Aceleração', unit: 'm/s²' },
                    { key: 'distancia', label: 'Distância', unit: 'm' },
                    { key: 'angulo', label: 'Ângulo', unit: '°' },
                    { key: 'tempo', label: 'Tempo', unit: 's' }
                  ].map(({ key, label, unit }) => (
                    <div key={key} className="bg-white p-3 sm:p-4 rounded-lg shadow-lg border-l-4 border-purple-500">
                      <h4 className="font-semibold text-sm sm:text-base lg:text-lg text-gray-800 mb-1">
                        {label}:
                      </h4>
                      <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600">
                        {sensor[key]} <span className="text-sm text-gray-600">{unit}</span>
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-white mx-auto mb-3"></div>
                  <p className="text-white text-sm sm:text-base">Carregando dados do sensor...</p>
                </div>
              )}
            </div>
          </div>

          {/* Formulário */}
          <div className="flex-1 order-1 xl:order-2">
            <div className="bg-purple-900 bg-opacity-95 backdrop-blur-sm rounded-lg shadow-lg border border-purple-300 p-3 sm:p-4 lg:p-6 xl:p-8">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-4 sm:mb-6 text-white flex items-center gap-2">
                <CheckCircle size={20} className="sm:w-6 sm:h-6 text-green-400" />
                Criar Questão (Com Base no Sensor)
              </h2>

              <div className="space-y-3 sm:space-y-4">
                {/* Enunciado */}
                <div>
                  <label className="block text-white font-semibold mb-1 sm:mb-2 text-sm sm:text-base">
                    Enunciado:
                  </label>
                  <textarea
                    value={enunciado}
                    onChange={(e) => setEnunciado(e.target.value)}
                    className="w-full p-2 sm:p-3 rounded text-black text-sm sm:text-base resize-none"
                    rows={3}
                    placeholder="Digite o enunciado da questão..."
                  />
                </div>

                {/* Resolução */}
                <div>
                  <label className="block text-white font-semibold mb-1 sm:mb-2 text-sm sm:text-base">
                    Resolução:
                  </label>
                  <textarea
                    value={resolucao}
                    onChange={(e) => setResolucao(e.target.value)}
                    className="w-full p-2 sm:p-3 rounded text-black text-sm sm:text-base resize-none"
                    rows={3}
                    placeholder="Digite a resolução da questão..."
                  />
                </div>

                {/* Incógnita */}
                <div>
                  <label className="block text-white font-semibold mb-1 sm:mb-2 text-sm sm:text-base">
                    Incógnita:
                  </label>
                  <select
                    value={incognita}
                    onChange={(e) => setIncognita(e.target.value)}
                    className="w-full p-2 sm:p-3 rounded text-black text-sm sm:text-base"
                  >
                    <option value="">Selecione uma incógnita</option>
                    <option value="velocidade">Velocidade</option>
                    <option value="px">Px</option>
                    <option value="py">Py</option>
                    <option value="força normal">Força Normal</option>
                    <option value="força de atrito">Força de Atrito</option>
                    <option value="aceleração">Aceleração</option>
                  </select>
                </div>

                {/* Alternativas */}
                <div>
                  <label className="block text-white font-semibold mb-2 sm:mb-3 text-sm sm:text-base">
                    Alternativas:
                  </label>
                  <div className="space-y-2">
                    {['A', 'B', 'C', 'D', 'E'].map((letra) => (
                      <div key={letra} className="flex items-center gap-2 sm:gap-3">
                        <span className="w-6 sm:w-8 text-white font-bold text-sm sm:text-base flex-shrink-0">
                          {letra})
                        </span>
                        <input
                          type="text"
                          value={alternativas[letra]}
                          onChange={(e) => atualizarAlternativa(letra, e.target.value)}
                          className="flex-1 p-2 sm:p-3 rounded text-black text-sm sm:text-base"
                          placeholder={`Alternativa ${letra}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Resposta Correta */}
                <div>
                  <label className="block text-white font-semibold mb-1 sm:mb-2 text-sm sm:text-base">
                    Resposta Correta (A-E):
                  </label>
                  <input
                    type="text"
                    maxLength={1}
                    value={respostaCorreta}
                    onChange={(e) => setRespostaCorreta(e.target.value.toUpperCase())}
                    className="w-full p-2 sm:p-3 rounded text-black text-sm sm:text-base"
                    placeholder="Digite A, B, C, D ou E"
                  />
                </div>

                {/* Tempo */}
                <div>
                  <label className="block mb-2 text-white font-semibold text-sm sm:text-base">
                    Tempo da Questão
                  </label>
                  <button
                    onClick={() => setMostrarModalTempo(true)}
                    className="bg-purple-600 hover:bg-purple-500 text-white py-2 sm:py-3 px-4 sm:px-6 rounded transition duration-300 text-sm sm:text-base flex items-center gap-2"
                  >
                    <Clock size={16} className="sm:w-5 sm:h-5" />
                    {tempoTotal > 0 ? `${Math.floor(tempoTotal / 60)}:${String(tempoTotal % 60).padStart(2, '0')}` : 'Definir Tempo'}
                  </button>
                </div>

                {/* Botão Criar */}
                <div className="pt-2 sm:pt-4">
                  <button
                    onClick={criarQuestao}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-3 sm:py-4 px-6 rounded font-bold text-sm sm:text-base lg:text-lg transition duration-300 flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={20} />
                    Criar Questão
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de tempo */}
      {mostrarModalTempo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-purple-900 border border-purple-200 p-4 sm:p-6 lg:p-8 rounded-md w-full max-w-md">
            <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-white flex items-center gap-2">
              <Clock size={20} className="sm:w-6 sm:h-6" />
              Definir Tempo
            </h3>
            
            <div className="flex gap-4 sm:gap-6 mb-4 sm:mb-6 justify-center">
              <div className="text-center">
                <label htmlFor="minutos" className="text-white block mb-1 sm:mb-2 text-sm sm:text-base">
                  Minutos
                </label>
                <input
                  id="minutos"
                  type="number"
                  min="0"
                  value={tempoMinutos}
                  onChange={(e) => setTempoMinutos(Math.max(0, +e.target.value))}
                  className="p-2 sm:p-3 border rounded text-black w-16 sm:w-20 text-center text-sm sm:text-base"
                />
              </div>
              <div className="text-center">
                <label htmlFor="segundos" className="text-white block mb-1 sm:mb-2 text-sm sm:text-base">
                  Segundos
                </label>
                <input
                  id="segundos"
                  type="number"
                  min="0"
                  max="59"
                  value={tempoSegundos}
                  onChange={(e) => setTempoSegundos(Math.max(0, Math.min(59, +e.target.value)))}
                  className="p-2 sm:p-3 border rounded text-black w-16 sm:w-20 text-center text-sm sm:text-base"
                />
              </div>
            </div>
            
            {tempoTotal > 0 && (
              <div className="text-center mb-4 sm:mb-6">
                <p className="text-white text-sm sm:text-base">
                  Tempo total: <span className="font-bold text-yellow-300">
                    {Math.floor(tempoTotal / 60)}:{String(tempoTotal % 60).padStart(2, '0')}
                  </span>
                </p>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
              <button
                className="bg-red-500 hover:bg-red-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded transition duration-300 text-sm sm:text-base"
                onClick={() => setMostrarModalTempo(false)}
              >
                Cancelar
              </button>
              <button
                className="bg-green-500 hover:bg-green-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded transition duration-300 text-sm sm:text-base"
                onClick={() => setMostrarModalTempo(false)}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CriarQuestaoDispositivo;
