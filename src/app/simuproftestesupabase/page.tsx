/* eslint-disable */

"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";

const SimulacoesProf: React.FC = () => {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(`Prof. ${user.name || user.email}`);
      setLoading(false);
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
        backgroundImage: "url(\'/images/FundoCanva.png\')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Imagem fixa na esquerda - oculta em mobile */}
      <div className="hidden md:block fixed left-0 bottom-0 z-10">
        <Image
          src="/images/galileufrente.png"
          alt="Galileu"
          width={300}
          height={300}
          className="object-contain"
        />
      </div>

      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <header className="flex justify-between items-center mb-8 sm:mb-16 relative">
          <div className="flex-shrink-0">
            <Image
              onClick={() => router.push("/dashboardprof")}
              src="/images/markim-Photoroom.png"
              alt="Logo Projeto Galileu"
              width={120}
              height={40}
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
                  onClick={() => router.push("")}
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
                  <AccountCircleOutlinedIcon fontSize="small" />
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
              <MenuIcon />
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
                        router.push("");
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

        <main className="flex flex-col items-center justify-center text-center py-8 sm:py-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 sm:mb-8">
            Simulações
          </h1>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <button
              onClick={() => router.push("/criarsalaproftestesupabase")}
              className="bg-gray-200 text-black px-6 sm:px-8 py-2 sm:py-3 rounded-md font-bold flex items-center justify-center gap-2 text-base sm:text-lg shadow-md hover:bg-gray-300 transition duration-300"
            >
              ➕ <span className="hidden sm:inline">Criar Nova Sala de Aula</span>
              <span className="sm:hidden">Nova Sala</span>
            </button>
            <button
              onClick={() => router.push("/escolhacriadasoucriarprof")}
              className="bg-gray-200 text-black px-6 sm:px-8 py-2 sm:py-3 rounded-md font-bold flex items-center justify-center gap-2 text-base sm:text-lg shadow-md hover:bg-gray-300 transition duration-300"
            >
              Questões
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SimulacoesProf;


