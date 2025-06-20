/* eslint-disable */

"use client";
import React, { useEffect, useState } from "react";
import { getDatabase, ref, onValue } from "firebase/database";
import { app } from "../../../lib/firebaseConfig";
import { useRouter } from "next/navigation";
import {
  ArrowLeftCircle,
  Eye,
  FileText,
  ClipboardCheck,
  Menu,
} from "lucide-react";
import Image from "next/image";

interface Questao {
  enunciado: string;
  resolucao: string;
  alternativas: { [key: string]: string };
  incognita: string;
  alternativaCorreta: string;
  respostaCorreta?: string;  // Agora temos respostaCorreta para sensor
  criadoEm: string;
  professor: string;
  isExpanded?: boolean;
}

const QuestoesCriadasProf = () => {
  const router = useRouter();
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [questoesSensores, setQuestoesSensores] = useState<Questao[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserId(user.uid);
      setUserName(`Prof. ${user.name || user.email}`);
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
    if (userId) {
      const db = getDatabase(app);

      // Busca as questões normais
      const questoesRef = ref(db, `questoes/${userId}`);
      onValue(questoesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const listaQuestoes = Object.values(data) as Questao[];
          setQuestoes(listaQuestoes);
        } else {
          setQuestoes([]);
        }
      });

      // Busca as questões com base nos sensores
      const questoesSensoresRef = ref(db, `questoesComBaseNosSensores/${userId}`);
      onValue(questoesSensoresRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const listaQuestoesSensores = Object.values(data).map((questao: any) => ({
            ...questao,
            respostaCorreta: questao.respostaCorreta,  // Agora inclui respostaCorreta
          })) as Questao[];
          setQuestoesSensores(listaQuestoesSensores);
        } else {
          setQuestoesSensores([]);
        }
      });
    }
  }, [userId]);

  // Função para alternar a exibição dos detalhes das questões
  const alternarDetalhes = (index: number, tipo: "normal" | "sensor") => {
    if (tipo === "normal") {
      const novaLista = [...questoes];
      novaLista[index].isExpanded = !novaLista[index].isExpanded;
      setQuestoes(novaLista);
    } else {
      const novaListaSensores = [...questoesSensores];
      novaListaSensores[index].isExpanded = !novaListaSensores[index].isExpanded;
      setQuestoesSensores(novaListaSensores);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center text-white"
      style={{
        backgroundImage: "url('/images/FundoCanva.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Imagem fixa na esquerda - oculta em mobile */}
     

      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Header Responsivo */}
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
                  className="text-white hover:text-purple-300 px-4 lg:px-6 py-2 lg:py-3 rounded-md transition duration-300 text-sm lg:text-base"
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
                      className="w-full text-left text-white px-4 py-3 hover:bg-purple-700 transition duration-300"
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

        {/* Container Principal Responsivo */}
        <main className="relative bg-purple-900 bg-opacity-40 p-3 sm:p-4 lg:p-6 rounded-2xl shadow-xl mb-10">
          {/* Back Button */}
          <button
            onClick={() => router.push("/escolhacriadasoucriarprof")}
            className="absolute top-3 sm:top-4 left-3 sm:left-4 text-purple-300 hover:text-white transition flex items-center gap-1 text-sm sm:text-base"
          >
            <ArrowLeftCircle size={20} className="sm:w-6 sm:h-6" /> 
            <span className="hidden sm:inline">Voltar</span>
          </button>

          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6 text-center mt-8 sm:mt-0">
            Questões Criadas
          </h1>

          {questoes.length === 0 && questoesSensores.length === 0 ? (
            <p className="text-gray-400 text-center text-sm sm:text-base">
              Nenhuma questão criada ainda.
            </p>
          ) : (
            <>
              {/* Container de Questões Normais */}
              {questoes.length > 0 && (
                <div className="mb-6 sm:mb-8 lg:mb-10">
                  <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-green-300">
                    Questões Normais ({questoes.length})
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                    {questoes.map((questao, index) => (
                      <div
                        key={index}
                        className="bg-purple-800 p-3 sm:p-4 rounded-lg shadow-md flex flex-col justify-between min-h-[200px] sm:min-h-[220px]"
                      >
                        <div>
                          <h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-2 flex items-start gap-2">
                            <FileText className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5" />
                            <span className="line-clamp-3">
                              {questao.enunciado.length > 80
                                ? questao.enunciado.slice(0, 80) + "..."
                                : questao.enunciado}
                            </span>
                          </h3>
                          
                          <div className="text-xs sm:text-sm text-gray-300 mb-3">
                            <p>Criado em: {new Date(questao.criadoEm).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => alternarDetalhes(index, "normal")}
                          className="mt-auto bg-purple-600 hover:bg-purple-500 transition px-3 sm:px-4 py-2 rounded flex items-center justify-center gap-2 text-xs sm:text-sm"
                        >
                          <Eye size={16} className="sm:w-5 sm:h-5" /> 
                          {questao.isExpanded ? "Ocultar" : "Ver Detalhes"}
                        </button>
                        
                        {questao.isExpanded && (
                          <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-200 bg-purple-900 bg-opacity-50 p-2 sm:p-3 rounded">
                            <div className="space-y-2">
                              <div>
                                <strong>Resolução:</strong> 
                                <p className="mt-1 text-gray-300">{questao.resolucao}</p>
                              </div>
                              
                              <div>
                                <strong>Alternativas:</strong>
                                <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
                                  {Object.entries(questao.alternativas).map(([key, value]) => (
                                    <li key={key} className="text-gray-300">
                                      <span className="font-medium">{key}</span> - {value}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <strong>Alternativa Correta:</strong> 
                                <span className="text-green-300 font-medium ml-1">
                                  {questao.alternativaCorreta}
                                </span>
                              </div>
                              
                              <div>
                                <strong>Professor:</strong> 
                                <span className="text-purple-300 ml-1">{questao.professor}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Container de Questões Baseadas em Sensores */}
              {questoesSensores.length > 0 && (
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-blue-300">
                    Questões Baseadas em Sensores ({questoesSensores.length})
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                    {questoesSensores.map((questao, index) => (
                      <div
                        key={index}
                        className="bg-purple-800 border-l-4 border-blue-400 p-3 sm:p-4 rounded-lg shadow-md flex flex-col justify-between min-h-[200px] sm:min-h-[220px]"
                      >
                        <div>
                          <h3 className="text-sm sm:text-base lg:text-lg font-semibold mb-2 flex items-start gap-2">
                            <ClipboardCheck className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 text-blue-400" />
                            <span className="line-clamp-3">
                              {questao.enunciado.length > 80
                                ? questao.enunciado.slice(0, 80) + "..."
                                : questao.enunciado}
                            </span>
                          </h3>
                          
                          <div className="text-xs sm:text-sm text-gray-300 mb-3">
                            <p>Criado em: {new Date(questao.criadoEm).toLocaleDateString()}</p>
                          </div>
                        </div>

                        <button
                          onClick={() => alternarDetalhes(index, "sensor")}
                          className="mt-auto bg-blue-600 hover:bg-blue-500 transition px-3 sm:px-4 py-2 rounded flex items-center justify-center gap-2 text-xs sm:text-sm"
                        >
                          <Eye size={16} className="sm:w-5 sm:h-5" /> 
                          {questao.isExpanded ? "Ocultar" : "Ver Detalhes"}
                        </button>
                        
                        {questao.isExpanded && (
                          <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-200 bg-purple-900 bg-opacity-50 p-2 sm:p-3 rounded">
                            <div className="space-y-2">
                              <div>
                                <strong>Resolução:</strong> 
                                <p className="mt-1 text-gray-300">{questao.resolucao}</p>
                              </div>
                              
                              <div>
                                <strong>Alternativas:</strong>
                                <ul className="list-disc list-inside ml-2 mt-1 space-y-1">
                                  {Object.entries(questao.alternativas).map(([key, value]) => (
                                    <li key={key} className="text-gray-300">
                                      <span className="font-medium">{key}</span> - {value}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <strong>Resposta Correta:</strong> 
                                <span className="text-green-300 font-medium ml-1">
                                  {questao.respostaCorreta}
                                </span>
                              </div>
                              
                              <div>
                                <strong>Incógnita:</strong> 
                                <span className="text-yellow-300 ml-1">{questao.incognita}</span>
                              </div>
                              
                              <div>
                                <strong>Professor:</strong> 
                                <span className="text-purple-300 ml-1">{questao.professor}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default QuestoesCriadasProf;

