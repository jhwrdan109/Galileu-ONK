/* eslint-disable */

"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  scrollToQuemSomos?: () => void;
}

const Header: React.FC<HeaderProps> = ({ scrollToQuemSomos }) => {
  const router = useRouter();

  return (
    <header className="absolute top-0 left-0 w-full py-3 px-4 sm:py-4 sm:px-8 flex flex-col md:flex-row justify-between items-center z-50 bg-transparent">
      {/* Logo */}
      <div className="mb-4 md:mb-0">
        <img
          src="/images/markim-Photoroom.png"
          alt="Logo Projeto Galileu"
          // Ajuste de largura responsivo: menor em mobile, maior em telas maiores
          width={150} // Valor padrão para telas maiores
          height={50} // Valor padrão para telas maiores
          className="w-32 sm:w-40 md:w-48 lg:w-auto hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Navegação */}
      <nav>
        {/* Ajuste do gap responsivo: menor em mobile, maior em telas maiores */}
        <ul className="flex flex-wrap justify-center gap-2 sm:gap-4 md:gap-6">
          {["Início", "Simulações"].map((item) => (
            <li key={item}>
              <button
                onClick={() => router.push("/login")}
                className="text-white px-4 py-2 sm:px-6 sm:py-3 rounded-md border border-purple-400 bg-transparent hover:text-purple-300 hover:border-purple-300 transition duration-300 shadow-md hover:shadow-lg text-sm sm:text-base"
              >
                {item}
              </button>
            </li>
          ))}

          {/* Botão Quem Somos */}
          <li>
            <button
              onClick={scrollToQuemSomos}
              className="text-white px-4 py-2 sm:px-6 sm:py-3 rounded-md border border-purple-400 bg-transparent hover:text-purple-300 hover:border-purple-300 transition duration-300 shadow-md hover:shadow-lg text-sm sm:text-base"
            >
              Quem Somos
            </button>
          </li>

          {/* Botão Entrar */}
          <li>
            <button
              onClick={() => router.push("/login")}
              className="bg-purple-600 text-white px-6 py-2 sm:px-8 sm:py-3 rounded-md font-bold transition duration-300 shadow-lg hover:bg-purple-500 hover:shadow-xl text-sm sm:text-base"
            >
              ENTRAR
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
