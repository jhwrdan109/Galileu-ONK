/* eslint-disable */

"use client";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import '@fontsource/poppins'; // Certifique-se de que esta fonte está sendo carregada corretamente

const LandingPage: React.FC = () => {
  const router = useRouter();
  const quemSomosRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToQuemSomos = () => {
    quemSomosRef.current?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false); // Fecha o menu mobile após clicar
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setMobileMenuOpen(false); // Fecha o menu mobile após navegar
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: "url('/images/kokushibo.png')", // Alterado para a imagem do Dashboardaluno
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="container mx-auto px-4 py-4 sm:py-8">
        <header className="flex justify-between items-center mb-8 sm:mb-16">
          <div className="relative w-[140px] h-[140px] sm:w-[150px] sm:h-[150px]">
            <Image
              onClick={() => router.push("/")}
              src="/images/markim-Photoroom.png"
              alt="Logo Projeto Galileu"
              fill
              className="cursor-pointer hover:scale-105 transition-transform duration-300 object-contain"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:block">
            <ul className="flex gap-4 xl:gap-6">
              <li>
                <button
                  className="text-white px-4 py-2 xl:px-6 xl:py-3 rounded-md border border-purple-400 bg-transparent hover:text-purple-300 hover:border-purple-300 transition duration-300 shadow-md hover:shadow-lg text-sm xl:text-base"
                  onClick={() => handleNavigation("/")} // Link para a própria Landing Page
                >
                  Início
                </button>
              </li>
              <li>
                <button
                  onClick={scrollToQuemSomos}
                  className="text-white px-4 py-2 xl:px-6 xl:py-3 rounded-md border border-purple-400 bg-transparent hover:text-purple-300 hover:border-purple-300 transition duration-300 shadow-md hover:shadow-lg text-sm xl:text-base"
                >
                  Quem Somos
                </button>
              </li>
              {/* Botão Simulações adicionado de volta */}
              <li>
                <button
                  onClick={() => handleNavigation("/login")} // Direciona para o login, pois simulações geralmente exigem autenticação
                  className="text-white px-4 py-2 xl:px-6 xl:py-3 rounded-md border border-purple-400 bg-transparent hover:text-purple-300 hover:border-purple-300 transition duration-300 shadow-md hover:shadow-lg text-sm xl:text-base"
                >
                  Simulações
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation("/login")} // Link para a página de login
                  className="bg-purple-600 text-white px-4 py-2 xl:px-8 xl:py-3 rounded-md font-bold transition duration-300 shadow-lg hover:bg-purple-500 hover:shadow-xl text-sm xl:text-base"
                >
                  ENTRAR
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
                      onClick={() => handleNavigation("/")}
                    >
                      Início
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={scrollToQuemSomos}
                      className="text-white w-full text-left px-4 py-3 rounded-md border border-purple-400 bg-transparent hover:text-purple-300 hover:border-purple-300 transition duration-300"
                    >
                      Quem Somos
                    </button>
                  </li>
                  {/* Botão Simulações no menu mobile */}
                  <li>
                    <button
                      onClick={() => handleNavigation("/login")}
                      className="text-white w-full text-left px-4 py-3 rounded-md border border-purple-400 bg-transparent hover:text-purple-300 hover:border-purple-300 transition duration-300"
                    >
                      Simulações
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleNavigation("/login")}
                      className="bg-purple-600 text-white w-full text-left px-4 py-3 rounded-md font-bold transition duration-300 shadow-lg hover:bg-purple-500 hover:shadow-xl"
                    >
                      ENTRAR
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        )}

        <main className="flex flex-col items-start justify-center py-8 sm:py-16 px-4 sm:px-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 max-w-full lg:max-w-3xl text-left leading-tight">
            Uma aprendizagem sobre Plano Inclinado de uma forma interativa
          </h1>

          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-purple-200 mb-8 sm:mb-12 max-w-full lg:max-w-3xl text-left leading-relaxed">
            O Projeto Galileu busca melhorar a compreensão da matéria de Plano Inclinado da disciplina de Física, tornando-a mais eficaz.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => router.push("/login")}
              className="bg-purple-600 text-white px-8 py-3 rounded-md hover:bg-purple-500 font-bold transition duration-300"
            >
              Começar Agora
            </button>
          </div>
        </main>
      </div>

      {/* Seção "Quem Somos" */}
      <div
        ref={quemSomosRef}
        className="bg-white py-8 sm:py-12 px-4 sm:px-6 mt-12 sm:mt-24 border-t-4 border-purple-950 shadow-lg"
      >
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-purple-700 mb-4">Quem Somos</h2>
          <p className="text-base sm:text-lg text-gray-800 leading-relaxed">
            Nós somos o Projeto Galileu, buscando melhorar a interação entre professor e aluno. Através da interação entre software e hardware, queremos tornar o estudo de Física mais acessível e interativo, focando no tema de Plano Inclinado para ajudar estudantes a melhorarem seu desempenho em vestibulares. Somos alunos da Fundação Matias Machline, cursando o terceiro ano do ensino médio técnico.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
