/* eslint-disable */

"use client";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
// Não precisamos mais de Menu e X do lucide-react se usarmos SVG genérico como no Dashboardaluno
// import { Menu, X } from 'lucide-react';

const Dashboardprof: React.FC = () => {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTutorial, setShowTutorial] = useState(true);
  const [tutorialType, setTutorialType] = useState("fisica"); // "fisica" ou "sala"
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // Estado para controlar a visibilidade do menu mobile

  const quemSomosRef = useRef<HTMLDivElement>(null); // Referência para seção "Quem Somos"
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(`Prof. ${user.name || user.displayName || user.email}`);
      setLoading(false);
      
      // Sempre mostrar o tutorial
      setShowTutorial(true);
    } else {
      router.push("/login");
    }
  }, [router]);

  if (loading) {
    return <div className="h-screen flex items-center justify-center text-white text-xl">Carregando...</div>;
  }

  const scrollToQuemSomos = () => {
    quemSomosRef.current?.scrollIntoView({ behavior: "smooth" });
    setMobileMenuOpen(false); // Fecha o menu ao navegar
  };

  const closeTutorial = () => {
    setShowTutorial(false);
  };

  const switchToSalaTutorial = () => {
    setTutorialType("sala");
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setMobileMenuOpen(false); // Fecha o menu ao navegar
  };

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
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80 ">
          <div className=" border border-purple-300 bg-gradient-to-br from-purple-800 to-purple-900 rounded-lg shadow-2xl w-full max-w-5xl p-8 text-white mx-4 overflow-y-auto max-h-screen">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">
                {tutorialType === "fisica" ? "Tutorial - Simulação Física" : "Tutorial - Como Criar Sala"}
              </h2>
              <button 
                onClick={closeTutorial} 
                className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-md transition duration-300"
              >
                Pular Tutorial
              </button>
            </div>
            
            {tutorialType === "fisica" ? (
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold mb-4">Instruções para a Simulação</h3>
                
                <div className="bg-purple-700 bg-opacity-40 p-6 rounded-lg mb-6">
                  <h4 className="text-xl font-semibold mb-3">1. Ajuste do Ângulo</h4>
                  <p className="text-lg mb-4">
                    Após criar a questão, o professor deve ajustar o ângulo da superfície inclinada utilizando o parafuso manípulo.
                    O valor do ângulo será exibido no indicador de angulação, permitindo a conferência da medida.
                  </p>
                </div>
                
                <div className="bg-purple-700 bg-opacity-40 p-6 rounded-lg mb-6">
                  <h4 className="text-xl font-semibold mb-3">2. Posicionamento da Barreira Móvel</h4>
                  <p className="text-lg mb-4">
                    Em seguida, o professor deve mover a barreira móvel para a distância especificada na questão.
                    Para isso, deve afrouxar o parafuso que fixa a barreira, movê-la para a posição desejada e, em seguida, 
                    apertar o parafuso para fixá-la no lugar. A indicação no lado direito da tela mostrará a distância 
                    medida desde a posição inicial do cubo.
                  </p>
                </div>
                
                <div className="bg-purple-700 bg-opacity-40 p-6 rounded-lg mb-6">
                  <h4 className="text-xl font-semibold mb-3">3. Início da Simulação</h4>
                  <p className="text-lg mb-4">
                    Após os ajustes, o professor deve iniciar a simulação clicando no botão "Iniciar Simulação".
                    O sistema realizará os cálculos necessários enquanto o cubo é liberado para o movimento.
                  </p>
                </div>
                
                <div className="bg-purple-700 bg-opacity-40 p-6 rounded-lg mb-6">
                  <h4 className="text-xl font-semibold mb-3">4. Encerramento da Simulação</h4>
                  <p className="text-lg mb-4">
                    Quando o cubo atingir o final do deslocamento, o professor deve clicar no botão "Terminar Simulação" 
                    para encerrar o teste e registrar os dados de análise.
                  </p>
                </div>
                
                <div className="mt-8 mb-8">
                  <h4 className="text-xl font-semibold mb-4">Vídeo Demonstrativo</h4>
                  <div className="bg-black bg-opacity-50 rounded-lg p-4 flex items-center justify-center">
                    <video 
                      ref={videoRef}
                      className="w-full max-w-3xl rounded-lg shadow-lg" 
                      controls
                      src="/images/gabrielTutorial.mp4"
                      preload="metadata"
                    >
                      Seu navegador não suporta vídeos HTML5.
                    </video>
                  </div>
                </div>
                
                <div className="flex justify-center mt-8">
                  <button
                    onClick={switchToSalaTutorial}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-md transition duration-300 text-lg"
                  >
                    Ver tutorial de como criar sala
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <h3 className="text-2xl font-semibold mb-4">Como Criar uma Sala de Aula</h3>
                
                <div className="bg-purple-700 bg-opacity-40 p-6 rounded-lg mb-6">
                  <h4 className="text-xl font-semibold mb-3">1. Criação de Questões</h4>
                  <p className="text-lg mb-4">
                    Comece criando questões para sua sala de aula. Você pode criar tanto questões sobre o tema de Plano Inclinado 
                    quanto questões de outros assuntos relacionados à Física. O sistema é flexível para acomodar diversos tipos de conteúdo.
                  </p>
                </div>
                
                <div className="bg-purple-700 bg-opacity-40 p-6 rounded-lg mb-6">
                  <h4 className="text-xl font-semibold mb-3">2. Adição de Questões à Sala</h4>
                  <p className="text-lg mb-4">
                    Após criar as questões, adicione-as à sala de aula. Você pode selecionar múltiplas questões para compor 
                    uma única sala, organizando o conteúdo de acordo com seus objetivos pedagógicos.
                  </p>
                </div>
                
                <div className="bg-purple-700 bg-opacity-40 p-6 rounded-lg mb-6">
                  <h4 className="text-xl font-semibold mb-3">3. Geração do Código da Sala</h4>
                  <p className="text-lg mb-4">
                    Ao finalizar a configuração da sala, o sistema gerará automaticamente um código único. Este código deve ser 
                    compartilhado com seus alunos para que eles possam acessar a sala e participar das atividades.
                  </p>
                </div>
                
                <div className="mt-8 mb-8">
                  <h4 className="text-xl font-semibold mb-4">Vídeo Tutorial</h4>
                  <div className="bg-black bg-opacity-50 rounded-lg p-4 flex items-center justify-center">
                    <video 
                      className="w-full max-w-3xl rounded-lg shadow-lg" 
                      controls
                      src="/images/criarsala.mp4"
                      preload="metadata"
                    >
                      Seu navegador não suporta vídeos HTML5.
                    </video>
                  </div>
                </div>
                
                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => setTutorialType("fisica")}
                    className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-md transition duration-300 text-lg"
                  >
                    Voltar ao tutorial da simulação física
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-4 sm:py-8">
        <header className="flex justify-between items-center mb-8 sm:mb-16">
          <div className="relative w-[140px] h-[140px] sm:w-[150px] sm:h-[150px]">
            <Image
              onClick={() => handleNavigation("")} // Usar handleNavigation
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
                  onClick={() => handleNavigation("")} // Usar handleNavigation
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
                  onClick={() => handleNavigation("/simuproftestesupabase")} // Usar handleNavigation
                  className="text-white px-4 py-2 xl:px-6 xl:py-3 rounded-md border border-purple-400 bg-transparent hover:text-purple-300 hover:border-purple-300 transition duration-300 shadow-md hover:shadow-lg text-sm xl:text-base"
                >
                  Simulações
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation("/editarperfilprof")} // Usar handleNavigation
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

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setMobileMenuOpen(false)}>
            <div className="fixed top-0 right-0 h-full w-64 bg-purple-900 shadow-lg z-50 p-6" onClick={(e) => e.stopPropagation()}> {/* Impede que o clique no painel feche o menu */}
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
                      onClick={() => handleNavigation("/simuproftestesupabase")}
                      className="text-white w-full text-left px-4 py-3 rounded-md border border-purple-400 bg-transparent hover:text-purple-300 hover:border-purple-300 transition duration-300"
                    >
                      Simulações
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleNavigation("/editarperfilprof")}
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

        {/* Conteúdo principal */}
        <main className="flex flex-col items-start justify-center py-8 sm:py-16 px-4 sm:px-0">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-4 sm:mb-6 max-w-full lg:max-w-3xl text-left leading-tight">
            Uma aprendizagem sobre Plano Inclinado de uma forma interativa
          </h1>

          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-purple-200 mb-8 sm:mb-12 max-w-full lg:max-w-3xl text-left leading-relaxed">
            O Projeto Galileu busca melhorar a compreensão da matéria de Plano Inclinado da disciplina de Física, tornando-a mais eficaz.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => setShowTutorial(true)}
              className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-3 rounded-md font-medium transition duration-300"
            >
              Ver Tutorial
            </button>
          </div>
        </main>
      </div>

      {/* Seção Quem Somos com borda preta */}
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

export default Dashboardprof;
