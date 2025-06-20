/* eslint-disable */

"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const SimulacoesAluno: React.FC = () => {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // Estado para o menu mobile

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

  const handleNavigation = (path: string) => {
    router.push(path);
    setMobileMenuOpen(false); // Fecha o menu mobile após navegar
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
      {/* Imagem fixa na esquerda (oculta em telas menores) */}
      <div className="hidden md:block fixed left-0 bottom-0 z-10">
        <Image
          src="/images/galileuimagem.png"
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
              onClick={() => router.push("/dashboardaluno")}
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

        <main className="flex flex-col items-center justify-center text-center py-8 sm:py-16"> {/* Ajuste de padding */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-8"> {/* Título responsivo */}
            Simulações
          </h1>
          <div className="flex flex-col gap-4 sm:gap-6 w-full max-w-xs sm:max-w-sm md:max-w-md"> {/* Ajuste de gap e largura máxima */}
            <button
              onClick={() => router.push("/codigoaluno")}
              className="bg-gray-200 text-black px-6 py-3 rounded-md font-bold flex items-center justify-center gap-2 text-base sm:text-lg shadow-md hover:bg-gray-300 transition duration-300"
            >
               Entrar na Simulação
            </button>
            <button
              onClick={() => router.push("/analisegeraltesteum")}
              className="bg-gray-200 text-black px-6 py-3 rounded-md font-bold flex items-center justify-center gap-2 text-base sm:text-lg shadow-md hover:bg-gray-300 transition duration-300"
            >
            Ir para a análise
            </button>
            <button
              onClick={() => router.push("/simulacoesanterioresaluno")}
              className="bg-gray-200 text-black px-6 py-3 rounded-md font-bold flex items-center justify-center gap-2 text-base sm:text-lg shadow-md hover:bg-gray-300 transition duration-300"
            >
               Simulações Anteriores
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SimulacoesAluno;
