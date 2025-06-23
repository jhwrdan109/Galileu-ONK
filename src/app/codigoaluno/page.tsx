/* eslint-disable */

"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { supabase } from "../../../lib/supabase"; // Importe a instância do Supabase

const CodigoAluno: React.FC = () => {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null); // NOVO: Estado para userId
  const [loading, setLoading] = useState(true);
  const [codigoDigitado, setCodigoDigitado] = useState<string>("");
  const [codigoInvalido, setCodigoInvalido] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // Estado para o menu mobile

  // NOVO: Estado para a skin selecionada
  const [selectedSkin, setSelectedSkin] = useState('galileufrente'); // Skin padrão

  // NOVO: Lista de skins disponíveis (mesma do CriarQuestao)
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
    },
    {
      id: 'galileufuturo',
      name: 'Galileu do Futuro',
      image: '/images/galileufuturo.png'
    },
    {
      id: 'galileureddead',
      name: 'Galileu do Red Dead',
      image: '/images/galileuredead.png'
    },
    {
      id: 'galileuchina',
      name: 'Galileu Chinês',
      image: '/images/galileuchina.png'
    },
    {
      id: 'galileuegito',
      name: 'Galileu Egípcio',
      image: '/images/galileuegito.png'
    },
    {
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
    // Adicione mais skins aqui conforme necessário
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
      setUserName(user.name || user.email);
      setUserId(user.uid); // NOVO: Definir userId
      
      // NOVO: Carregar skin selecionada quando o usuário for carregado
      if (user.uid) {
        loadSelectedSkin(user.uid);
      }
      
      setLoading(false);
    } else {
      router.push("/login");
    }
  }, [router]);

  const handleNavigation = (path: string) => {
    router.push(path);
    setMobileMenuOpen(false); // Fecha o menu mobile após navegar
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center text-white text-xl">Carregando...</div>;
  }

  const handleCodigoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value.length <= 6) {
      setCodigoDigitado(event.target.value.toUpperCase());
    }
  };

  const handleSubmitCodigo = async () => {
    if (codigoDigitado.length === 6) {
      try {
        const { data, error } = await supabase
          .from("salas")
          .select("id")
          .eq("codigo", codigoDigitado.toUpperCase())
          .single(); // Espera-se apenas um resultado com o código

        if (error) {
          console.error("Erro ao verificar código no Supabase:", error);
          setCodigoInvalido(true);
        } else if (data) {
          console.log("Código válido! Redirecionando para a sala com ID:", data.id);
          router.push(`/saladeaulatestesupabase/${data.id}`); // Redireciona para a sala, passando o ID
        } else {
          setCodigoInvalido(true);
          console.log("Código inválido!");
        }
      } catch (error) {
        console.error("Erro inesperado ao verificar código:", error);
        setCodigoInvalido(true);
      }
    } else {
      alert("Por favor, insira um código de 6 dígitos.");
    }
  };

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
      <div className="hidden md:block fixed left-0 bottom-0 z-10">
        <Image
          src={getCurrentSkinImage()} // MUDANÇA: Usar função para obter imagem da skin atual
          alt="Galileu"
          width={300}
          height={300}
          className="object-contain"
        />
      </div>

      <div className="container mx-auto px-4 py-4 sm:py-8"> {/* Ajuste de padding */}
        <header className="flex justify-between items-center mb-8 sm:mb-16"> {/* Ajuste de margem */}
          <div className="relative w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] md:w-[150px] md:h-[150px]"> {/* Logo responsivo */}
            <Image
              onClick={() => handleNavigation("/dashboardaluno")}
              src="/images/markim-Photoroom.png"
              alt="Logo Projeto Galileu"
              fill
              className="cursor-pointer hover:scale-105 transition-transform duration-300 object-contain"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:block"> {/* Oculta em telas pequenas */}
            <ul className="flex gap-4 xl:gap-6"> {/* Ajuste de gap */}
              <li>
                <button
                  onClick={() => handleNavigation("/dashboardaluno")}
                  className="text-white px-4 py-2 xl:px-6 xl:py-3 rounded-md border border-purple-400 bg-transparent hover:text-purple-300 hover:border-purple-300 transition duration-300 shadow-md hover:shadow-lg text-sm xl:text-base"
                >
                  Início
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation("/simulacoesaluno")}
                  className="text-white px-4 py-2 xl:px-6 xl:py-3 rounded-md border border-purple-400 bg-transparent hover:text-purple-300 hover:border-purple-300 transition duration-300 shadow-md hover:shadow-lg text-sm xl:text-base"
                >
                  Simulações
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation("/editarperfilaluno")}
                  className="bg-purple-600 text-white px-4 py-2 xl:px-8 xl:py-3 rounded-md font-bold transition duration-300 shadow-lg hover:bg-purple-500 hover:shadow-xl text-sm xl:text-base truncate max-w-[120px] xl:max-w-none"
                >
                  {userName}
                </button>
              </li>
            </ul>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </header>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setMobileMenuOpen(false)}>
            <div className="fixed top-0 right-0 h-full w-64 bg-purple-900 shadow-lg z-50 p-6">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-white text-lg font-bold">Menu</h3>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white p-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <nav>
                <ul className="space-y-4">
                  <li>
                    <button
                      className="text-white w-full text-left px-4 py-3 rounded-md border border-purple-400 bg-transparent hover:text-purple-300 hover:border-purple-300 transition duration-300"
                      onClick={() => handleNavigation("/dashboardaluno")}
                    >
                      Início
                    </button>
                  </li>
                  <li>
                    <button
                      className="text-white w-full text-left px-4 py-3 rounded-md border border-purple-400 bg-transparent hover:text-purple-300 hover:border-purple-300 transition duration-300"
                      onClick={() => handleNavigation("/simulacoesaluno")}
                    >
                      Simulações
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleNavigation("/editarperfilaluno")}
                      className="bg-purple-600 text-white w-full text-left px-4 py-3 rounded-md font-bold transition duration-300 shadow-lg hover:bg-purple-500 hover:shadow-xl"
                    >
                      {userName}
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        )}

        <div className="flex justify-center items-center min-h-[calc(100vh-180px)] sm:min-h-[calc(100vh-220px)]"> {/* Ajuste de altura mínima para centralizar */}
          <div className="bg-purple-800 border border-purple-400 p-6 sm:p-8 rounded-lg shadow-xl w-full max-w-sm sm:max-w-md lg:max-w-lg relative flex flex-col items-center justify-center"> {/* Ajuste de padding e max-width */}
            <button
              onClick={() => router.push("/simulacoesaluno")}
              className="absolute top-4 left-4 text-white hover:text-purple-400" 
            >
              <ArrowBackIcon fontSize="large" />
            </button>

            <h2 className="text-2xl sm:text-3xl font-semibold text-center mb-4 sm:mb-6 text-white">Inserir Código</h2> {/* Ajuste de tamanho de fonte e cor */}

            <input
              type="text"
              value={codigoDigitado}
              onChange={handleCodigoChange}
              maxLength={6}
              className="w-full p-3 sm:p-4 text-3xl sm:text-4xl text-center border-2 border-purple-400 rounded-md text-black mb-4 sm:mb-6 uppercase" 
              placeholder="_____"
              autoFocus
            />

            {codigoInvalido && (
              <div className="text-red-400 text-base sm:text-xl mb-4"> 
                Código inválido. Tente novamente.
              </div>
            )}

            <div className="flex justify-center">
              <button
                onClick={handleSubmitCodigo}
                className="bg-purple-600 text-white py-2 px-6 sm:py-3 sm:px-8 rounded-md font-bold hover:bg-purple-500 transition duration-300 text-base sm:text-lg" 
              >
                Confirmar Código
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodigoAluno;