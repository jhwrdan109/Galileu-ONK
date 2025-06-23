/* eslint-disable */

"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import { getDatabase, ref, get } from "firebase/database";
import { app } from "../../../lib/firebaseConfig";
import { ArrowLeft, Menu } from "lucide-react";
import Image from "next/image";

interface Questao {
  id: string;
  enunciado: string;
}

const gerarCodigoSala = () => {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let codigo = '';
  for (let i = 0; i < 6; i++) {
    codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
  }
  return codigo;
};

const CriarSalaSupabaseFirebase = () => {
  const router = useRouter();
  const database = getDatabase(app);
  const [nomeSala, setNomeSala] = useState("");
  const [questoesFirebase, setQuestoesFirebase] = useState<Questao[]>([]);
  const [questoesSensores, setQuestoesSensores] = useState<Questao[]>([]);
  const [questoesSelecionadas, setQuestoesSelecionadas] = useState<string[]>([]);
  const [isLoadingFirebase, setIsLoadingFirebase] = useState(true);
  const [errorFirebase, setErrorFirebase] = useState<string | null>(null);
  const [isLoadingSupabase, setIsLoadingSupabase] = useState(false);
  const [errorSupabase, setErrorSupabase] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [codigoSala, setCodigoSala] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState(''); // Adicionado para o nome do usuário no header
  const [salaId, setSalaId] = useState<string | null>(null);
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

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserId(user.uid);
      setUserName(`Prof. ${user.name || user.email}`); // Define o nome do usuário
      
      // NOVO: Carregar skin selecionada quando o usuário for carregado
      if (user.uid) {
        loadSelectedSkin(user.uid);
      }

    } else {
      router.push("/login");
    }
  }, [router]);

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
    const buscarQuestoes = async () => {
      if (!userId) return;
      setIsLoadingFirebase(true);
      setErrorFirebase(null);
      try {
        // Questões normais
        const refNormais = ref(database, `questoes/${userId}`);
        const snapNormais = await get(refNormais);
        const listaNormais: Questao[] = snapNormais.exists()
          ? Object.keys(snapNormais.val()).map((key) => ({
              id: key,
              enunciado: snapNormais.val()[key]?.enunciado || "Enunciado não disponível",
            }))
          : [];

        // Questões com sensores
        const refSensores = ref(database, `questoesComBaseNosSensores/${userId}`);
        const snapSensores = await get(refSensores);
        const listaSensores: Questao[] = snapSensores.exists()
          ? Object.keys(snapSensores.val()).map((key) => {
              const q = snapSensores.val()[key];
              return {
                id: key,
                enunciado: q?.enunciado || q?.descricao || q?.titulo || "Sem enunciado",
              };
            })
          : [];

        setQuestoesFirebase(listaNormais);
        setQuestoesSensores(listaSensores);
      } catch (error: any) {
        console.error("Erro ao buscar questões:", error);
        setErrorFirebase("Ocorreu um erro ao buscar as questões.");
      } finally {
        setIsLoadingFirebase(false);
      }
    };

    buscarQuestoes();
  }, [userId]);

  const handleQuestaoSelecionada = (questaoId: string) => {
    setQuestoesSelecionadas((prev) =>
      prev.includes(questaoId)
        ? prev.filter((id) => id !== questaoId)
        : [...prev, questaoId]
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoadingSupabase(true);
    setErrorSupabase(null);
    setSuccessMessage(null);
    setCodigoSala(null);

    if (!nomeSala.trim()) {
      setErrorSupabase("Por favor, insira um nome para a sala.");
      setIsLoadingSupabase(false);
      return;
    }

    const codigo = gerarCodigoSala();

    try {
      const { data, error } = await supabase
        .from("salas")
        .insert([
          {
            nome: nomeSala,
            codigo: codigo,
            questoes_firebase_ids: questoesSelecionadas,
            created_by_user_id: userId,
          },
        ])
        .select();

      if (error) {
        console.error("Erro ao criar sala:", error);
        setErrorSupabase("Ocorreu um erro ao criar a sala.");
      } else if (data && data.length > 0) {
        setSuccessMessage(`Sala "${nomeSala}" criada com sucesso!`);
        setCodigoSala(codigo);
        setSalaId(data[0].id);
      } else {
        setErrorSupabase("Falha ao criar a sala.");
      }
    } catch (error: any) {
      console.error("Erro inesperado:", error);
      setErrorSupabase("Erro inesperado. Tente novamente.");
    } finally {
      setIsLoadingSupabase(false);
    }
  };

  const finalizarAula = async () => {
    if (!salaId) return;
    const { error } = await supabase
      .from("salas")
      .delete()
      .eq("id", salaId);

    if (error) {
      console.error("Erro ao finalizar aula:", error);
      setErrorSupabase("Erro ao finalizar a aula.");
    } else {
      setSuccessMessage("Aula finalizada e sala removida com sucesso.");
      setCodigoSala(null);
      setSalaId(null);
    }
  };

  if (isLoadingFirebase) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white text-xl">
        Carregando questões...
      </div>
    );
  }

  if (errorFirebase) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 text-xl">
        {errorFirebase}
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
      {/* Imagem fixa na esquerda - MODIFICADA para usar skin selecionada */}
      <div className="hidden lg:block fixed left-0 bottom-0 z-10">
        <Image 
          src={getCurrentSkinImage()} // MUDANÇA: Usar função para obter imagem da skin atual
          alt="Galileu" 
          width={300} 
          height={300} 
          className="object-contain" 
        />
      </div>

      {/* Header Responsivo */}
      <header className="w-full px-2 sm:px-4 py-4 sm:py-6 flex justify-between items-center relative">
        <div className="flex-shrink-0">
          <Image
            src="/images/markim-Photoroom.png"
            alt="Logo Projeto Galileu"
            width={120}
            height={40}
            onClick={() => router.push("/dashboardprof")}
            className="hover:scale-105 transition-transform duration-300 cursor-pointer sm:w-[150px] sm:h-[150px]"
          />
        </div>

        {/* Menu Desktop */}
        <nav className="hidden md:block">
          <ul className="flex gap-4 lg:gap-6 items-center">
            <li>
              <button
                onClick={() => router.push("/dashboardprof")}
                className="text-white hover:text-purple-300 px-4 lg:px-6 py-2 lg:py-3 rounded-md transition duration-300 text-sm lg:text-base"
              >
                Início
              </button>
            </li>
            <li>
              <button
                onClick={() => router.push("/simuproftestesupabase")}
                className="text-white px-4 lg:px-6 py-2 lg:py-3 rounded-md font-bold border border-purple-400 text-sm lg:text-base"
              >
                Simulações
              </button>
            </li>
            <li>
              <button
                onClick={() => router.push("/editarperfilprof")}
                className="bg-purple-600 text-white px-4 lg:px-8 py-2 lg:py-3 rounded-md font-bold transition duration-300 flex items-center gap-2 text-sm lg:text-base"
              >
                <span className="hidden lg:inline">{userName}</span> {/* Usando userName aqui */}
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
                      router.push("/dashboardprof");
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
                      router.push("/simuproftestesupabase");
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
                      router.push("/editarperfilprof");
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
      </header>

      {/* Conteúdo Principal */}
      <div className="min-h-screen flex justify-center px-2 sm:px-4">
        <div className="relative py-3 w-full max-w-4xl">
          <div className="bg-purple-950 p-4 sm:p-6 lg:p-8 rounded-lg shadow-lg border border-purple-200 w-full text-center relative">
            <button
              onClick={() => router.push("/simuproftestesupabase")}
              className="absolute top-4 left-4 text-white hover:text-purple-300 transition duration-300"
            >
              <ArrowLeft size={24} className="sm:w-8 sm:h-8" />
            </button>
            
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white text-center mb-4 sm:mb-6 mt-8 sm:mt-0">
              Criar Nova Sala de Aula
            </h1>
            
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label htmlFor="nomeSala" className="block text-white text-sm sm:text-base font-bold mb-2">
                  Nome da Sala:
                </label>
                <input
                  type="text"
                  id="nomeSala"
                  className="shadow appearance-none border rounded w-full py-2 sm:py-3 px-3 sm:px-4 text-black leading-tight focus:outline-none focus:shadow-outline text-sm sm:text-base"
                  value={nomeSala}
                  onChange={(e) => setNomeSala(e.target.value)}
                  placeholder="Digite o nome da sala..."
                />
              </div>

              {/* Questões normais */}
              <div className="mt-4 sm:mt-6">
                <h2 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">
                  Questões Normais
                </h2>
                {questoesFirebase.length > 0 ? (
                  <ul className="space-y-2 max-h-32 sm:max-h-48 overflow-y-auto border rounded p-2 sm:p-3 bg-white bg-opacity-10">
                    {questoesFirebase.map((questao) => (
                      <li
                        key={questao.id}
                        className={`bg-gray-100 text-black p-2 sm:p-3 rounded-md shadow-sm cursor-pointer transition duration-300 hover:bg-gray-200 ${
                          questoesSelecionadas.includes(questao.id) ? "border-2 border-purple-500" : ""
                        }`}
                        onClick={() => handleQuestaoSelecionada(questao.id)}
                      >
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="form-checkbox h-4 w-4 sm:h-5 sm:w-5 text-black rounded focus:ring-purple-500 mr-2 sm:mr-3"
                            checked={questoesSelecionadas.includes(questao.id)}
                            onChange={() => handleQuestaoSelecionada(questao.id)}
                          />
                          <span className="text-xs sm:text-sm lg:text-base">
                            {questao.enunciado.substring(0, window.innerWidth < 640 ? 60 : 100)}...
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-300 text-sm sm:text-base">Nenhuma questão encontrada.</p>
                )}
              </div>

              {/* Questões com sensores */}
              <div className="mt-4 sm:mt-6">
                <h2 className="text-base sm:text-lg font-semibold text-white mb-2 sm:mb-3">
                  Questões com Base em Sensores
                </h2>
                {questoesSensores.length > 0 ? (
                  <ul className="space-y-2 max-h-32 sm:max-h-48 overflow-y-auto border rounded p-2 sm:p-3 bg-white bg-opacity-10">
                    {questoesSensores.map((questao) => (
                      <li
                        key={questao.id}
                        className={`bg-gray-100 text-black p-2 sm:p-3 rounded-md shadow-sm cursor-pointer transition duration-300 hover:bg-gray-200 ${
                          questoesSelecionadas.includes(questao.id) ? "border-2 border-green-500" : ""
                        }`}
                        onClick={() => handleQuestaoSelecionada(questao.id)}
                      >
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="form-checkbox h-4 w-4 sm:h-5 sm:w-5 text-black rounded focus:ring-green-500 mr-2 sm:mr-3"
                            checked={questoesSelecionadas.includes(questao.id)}
                            onChange={() => handleQuestaoSelecionada(questao.id)}
                          />
                          <span className="text-xs sm:text-sm lg:text-base">
                            {questao.enunciado.substring(0, window.innerWidth < 640 ? 60 : 100)}...
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-300 text-sm sm:text-base">Nenhuma questão com sensores encontrada.</p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between mt-6 sm:mt-8 gap-3 sm:gap-4">
                <button
                  onClick={() => router.back()}
                  className="w-full sm:w-auto bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 sm:py-3 px-4 sm:px-6 rounded focus:outline-none focus:shadow-outline transition duration-300 text-sm sm:text-base"
                  type="button"
                >
                  Voltar
                </button>
                <button
                  className={`w-full sm:w-auto bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded focus:outline-none focus:shadow-outline transition duration-300 text-sm sm:text-base ${
                    isLoadingSupabase ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  type="submit"
                  disabled={isLoadingSupabase}
                >
                  {isLoadingSupabase ? "Criando..." : "Criar Sala"}
                </button>
              </div>

              {codigoSala && (
                <div className="mt-4 sm:mt-6">
                  <button
                    onClick={finalizarAula}
                    type="button"
                    className="w-full sm:w-auto bg-red-500 hover:bg-red-700 text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded transition duration-300 text-sm sm:text-base"
                  >
                    Finalizar Aula
                  </button>
                </div>
              )}

              {errorSupabase && (
                <div className="text-red-400 text-sm sm:text-base mt-2 p-2 sm:p-3 bg-red-900 bg-opacity-50 rounded">
                  {errorSupabase}
                </div>
              )}
              
              {successMessage && (
                <div className="text-green-400 text-sm sm:text-base mt-2 p-2 sm:p-3 bg-green-900 bg-opacity-50 rounded">
                  {successMessage}
                  {codigoSala && (
                    <div className="mt-2 sm:mt-3 text-white font-bold">
                      Código da Sala:{" "}
                      <span className="bg-purple-100 text-black px-2 py-1 rounded text-sm sm:text-base">
                        {codigoSala}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CriarSalaSupabaseFirebase;
