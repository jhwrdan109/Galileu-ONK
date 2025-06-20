/* eslint-disable */

"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const Dashboardaluno: React.FC = () => {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTutorial, setShowTutorial] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const quemSomosRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const tutorialSteps = [
    {
      title: "Bem-vindo ao Projeto Galileu",
      description: "Vamos te mostrar como entrar na sala e ver simulações anteriores.",
      isGif: true,
      media: "/gif1.gif"
    },
    {
      title: "Entrando na sala virtual",
      description: "Clique no botão 'Simulações' no menu superior, após isso, clique em 'Entrar na simulação', espere o código ser gerado pelo professor e colie-o nessa página.",
      isGif: false,
      media: "/images/entrarnasala.mp4",
    },
    {
      title: "Visualizando Simulações Anteriores",
      description: "Na página de simulações, você pode acessar simulações anteriores clicando no botão de mesmo nome, nessa página você pode ver dados de análises que já ocorreram e até compará-las.",
      isGif: false,
      media: "/images/simulacaoanterior.mp4",
    },
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(user.name || user.email);
      setLoading(false);
      setShowTutorial(true);
    } else {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    // Pausar o vídeo anterior ao mudar de passo
    if (videoRef.current) {
      videoRef.current.pause();
    }
  }, [currentStep]);

  const scrollToQuemSomos = () => {
    quemSomosRef.current?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false);
  };

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      closeTutorial();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const closeTutorial = () => {
    setShowTutorial(false);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setMobileMenuOpen(false);
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
      className="min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: "url('/images/kokushibo.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Tutorial Modal */}
      {showTutorial && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70 p-4">
          <div className="bg-gradient-to-br from-purple-800 to-purple-900 border border-purple-300 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 lg:p-8 text-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
              <h2 className="text-xl sm:text-2xl font-bold">Tutorial</h2>
              <button
                onClick={closeTutorial}
                className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-md transition duration-300 text-sm sm:text-base w-full sm:w-auto"
              >
                Pular Tutorial
              </button>
            </div>

            <div className="mb-6 sm:mb-8">
              <h3 className="text-lg sm:text-xl font-bold mb-4">{tutorialSteps[currentStep].title}</h3>
              <div className="flex flex-col gap-4 sm:gap-6">
                <div className="w-full h-48 sm:h-64 lg:h-80 bg-black bg-opacity-20 rounded-lg p-2 flex items-center justify-center">
                  {tutorialSteps[currentStep].isGif ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={tutorialSteps[currentStep].media}
                        alt={`Tutorial passo ${currentStep + 1}`}
                        fill
                        className="object-contain rounded-md"
                      />
                    </div>
                  ) : (
                    <video
                      ref={videoRef}
                      src={tutorialSteps[currentStep].media}
                      className="w-full h-full rounded-md object-contain"
                      controls
                      autoPlay
                      preload="metadata"
                    >
                      Seu navegador não suporta vídeos HTML5.
                    </video>
                  )}
                </div>
                <div className="w-full">
                  <p className="text-sm sm:text-base lg:text-lg leading-relaxed">{tutorialSteps[currentStep].description}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <button
                onClick={prevStep}
                className={`bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-md transition duration-300 text-sm sm:text-base w-full sm:w-auto ${currentStep === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={currentStep === 0}
              >
                Anterior
              </button>
              <div className="flex space-x-2">
                {tutorialSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full ${currentStep === index ? "bg-white" : "bg-purple-300"}`}
                  />
                ))}
              </div>
              <button
                onClick={nextStep}
                className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-md transition duration-300 text-sm sm:text-base w-full sm:w-auto"
              >
                {currentStep < tutorialSteps.length - 1 ? "Próximo" : "Concluir"}
              </button>
            </div>
          </div>
        </div>
      )}

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
                  onClick={() => router.push("")}
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
              <li>
                <button
                  onClick={() => router.push("/simulacoesaluno")}
                  className="text-white px-4 py-2 xl:px-6 xl:py-3 rounded-md border border-purple-400 bg-transparent hover:text-purple-300 hover:border-purple-300 transition duration-300 shadow-md hover:shadow-lg text-sm xl:text-base"
                >
                  Simulações
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push("/editarperfilaluno")}
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
                      onClick={() => handleNavigation("")}
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
                  <li>
                    <button
                      onClick={() => handleNavigation("/simulacoesaluno")}
                      className="text-white w-full text-left px-4 py-3 rounded-md border border-purple-400 bg-transparent hover:text-purple-300 hover:border-purple-300 transition duration-300"
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

        <main className="flex flex-col items-start justify-center py-8 sm:py-16 px-4 sm:px-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 max-w-full lg:max-w-3xl text-left leading-tight">
            Uma aprendizagem sobre Plano Inclinado de uma forma interativa
          </h1>

          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-purple-200 mb-8 sm:mb-12 max-w-full lg:max-w-3xl text-left leading-relaxed">
            O Projeto Galileu busca melhorar a compreensão da matéria de Plano Inclinado da disciplina de Física, tornando-a mais eficaz.
          </p>
        </main>
      </div>

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

export default Dashboardaluno;