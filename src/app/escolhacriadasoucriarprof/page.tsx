/* eslint-disable */

"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Menu } from "lucide-react";
import { database } from "../../../lib/firebaseConfig"; // Certifique-se de ter configurado o Firebase corretamente
import { set, ref } from "firebase/database";

const EscolhasCriadasOuCriarProf: React.FC = () => {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [codigoGerado, setCodigoGerado] = useState<string>("");
  const [codigoSalvo, setCodigoSalvo] = useState(false); // Para controlar se o código foi enviado ao Firebase
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

  const gerarCodigo = async () => {
    // Verificar se o código já foi gerado e enviado
    if (codigoSalvo) return;

    // Gerar um código único
    const codigo = Math.random().toString(36).substring(2, 8).toUpperCase(); // Exemplo de código
    setCodigoGerado(codigo);
    
    // Lógica para enviar ao Firebase
    const salaRef = ref(database, 'salas/' + codigo); // 'salas' é o caminho no Firebase

    try {
      await set(salaRef, {
        nome: "Sala do Professor", // Adapte conforme necessário
        professor: userName,
        dataCriacao: new Date().toISOString(),
        codigo: codigo,
      });
      setCodigoSalvo(true); // Marcar que o código foi enviado ao Firebase
      console.log("Código gerado e salvo no Firebase!");
    } catch (error) {
      console.error("Erro ao salvar o código no Firebase: ", error);
    }
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
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: "url('/images/FundoCanva.png')",
      }}
    >
      {/* Imagem fixa na esquerda - oculta em mobile */}
      <div className="hidden lg:block fixed left-0 bottom-0 z-10">
        <Image
          src="/images/galileufrente.png"
          alt="Galileu"
          width={300}
          height={300}
          className="object-contain"
        />
      </div>

      {/* Header Responsivo */}
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <header className="flex justify-between items-center mb-8 sm:mb-16 relative">
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

        {/* Bloco de escolha responsivo */}
        <div className="flex justify-center px-2 sm:px-4">
          <div className="bg-purple-800 border border-purple-300 text-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-lg w-full max-w-sm sm:max-w-md lg:max-w-lg text-center relative">
            <button
              onClick={() => router.push("/simuproftestesupabase")}
              className="absolute top-3 sm:top-4 left-3 sm:left-4 text-white hover:text-gray-300 transition duration-300"
            >
              <ArrowLeft size={24} className="sm:w-7 sm:h-7" />
            </button>

            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-6 sm:mb-8 mt-6 sm:mt-2">
              O que deseja fazer?
            </h1>

            <div className="space-y-3 sm:space-y-4">
              <button
                onClick={() => router.push("/questoescriadasprof")}
                className="w-full bg-purple-900 hover:bg-purple-950 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg text-sm sm:text-base lg:text-lg font-semibold transition-all duration-200"
              >
                Questões Criadas
              </button>

              <button
                onClick={() => router.push("/criarquestaoprof")}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg text-sm sm:text-base lg:text-lg font-semibold transition-all duration-200"
              >
                Criar Questão
              </button>

              <button
                onClick={() => router.push("/criarquestaodispositivo")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 sm:py-3 px-4 sm:px-6 rounded-lg text-sm sm:text-base lg:text-lg font-semibold transition-all duration-200"
              >
                <span className="hidden sm:inline">Criar Questão com base no Aparelho</span>
                <span className="sm:hidden">Questão com Aparelho</span>
              </button>
            </div>

            {/* Exibe o código gerado */}
            {codigoGerado && !codigoSalvo && (
              <div className="mt-4 sm:mt-6 text-sm sm:text-base lg:text-lg font-semibold text-yellow-400 p-2 sm:p-3 bg-yellow-900 bg-opacity-30 rounded-lg">
                Código Gerado: <span className="font-mono">{codigoGerado}</span>
              </div>
            )}

            {/* Mensagem caso o código já tenha sido salvo */}
            {codigoSalvo && (
              <div className="mt-4 sm:mt-6 text-sm sm:text-base lg:text-lg font-semibold text-green-400 p-2 sm:p-3 bg-green-900 bg-opacity-30 rounded-lg">
                Código salvo no Firebase!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EscolhasCriadasOuCriarProf;

