/* eslint-disable */

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

type Props = {
  forcaPeso: number; // Agora são obrigatórias e vêm de fora
  forcaNormal: number;
  forcaAtrito: number;
  px: number; // Componente X do Peso
  py: number; // Componente Y do Peso
  forcaResultante: number;
  aceleracao: number; // Aceleração da simulação
  angulo: number; // Ângulo da simulação

  // anguloInicial não é mais necessário
};

const ForcasSVG: React.FC<Props> = ({ 
  forcaPeso, 
  forcaNormal, 
  forcaAtrito, 
  px, // Componente X do Peso
  py, // Componente Y do Peso
  forcaResultante,
  aceleracao,
  angulo // Usar o angulo da prop
}) => {
  const centerX = 150;
  const centerY = 150;
  const ESCALA = 200; // Aumentada para visualização com valores pequenos

  // Remover o useState para angulo e anguloInicial
  // const [angulo, setAngulo] = useState(anguloInicial); // REMOVER ESTA LINHA

  const [mostrarPeso, setMostrarPeso] = useState(true);
  const [mostrarNormal, setMostrarNormal] = useState(true);
  const [mostrarAtrito, setMostrarAtrito] = useState(true);
  const [mostrarResultante, setMostrarResultante] = useState(true);
  const [mostrarTodasForcas, setMostrarTodasForcas] = useState(true);

  // REMOVER TODAS AS LINHAS DE CÁLCULO DE FORÇAS AQUI:
  // const massa = 0.01735;
  // const g = 9.8;
  // const coefAtrito = 0.294;
  // const rad = (angulo * Math.PI) / 180;
  // const forcaPeso = massa * g;
  // const componentePesoX = massa * g * Math.sin(rad);
  // const componentePesoY = massa * g * Math.cos(rad);
  // const forcaNormal = componentePesoY;
  // const forcaAtrito = coefAtrito * forcaNormal;
  // const direcaoAtrito = aceleracao > 0 ? -1 : 1;
  // const resultanteX = massa * aceleracao * Math.cos(rad);
  // const resultanteY = massa * aceleracao * Math.sin(rad);

  // Use os valores das props diretamente para os vetores
  // Você precisará ajustar a escala para que os vetores sejam visíveis
  // Os valores de px e py já são as componentes do peso, então use-os.
  // A forcaResultante já é o valor final, não precisa de massa * aceleracao aqui.

  // Para desenhar os vetores, você precisa das componentes X e Y deles.
  // O componente ForcasSVG já tem px e py.
  // Para Atrito e Resultante, você precisaria das componentes X e Y também,
  // ou recalcular a direção com base no angulo e nos valores passados.
  // Vou assumir que px e py são as componentes do peso na direção do plano.

  // Vamos redefinir como os vetores são desenhados para usar as props
  // A direção dos vetores precisa ser consistente com o ângulo do plano.
  // O angulo aqui é o angulo da rampa.

  // Vetor Peso (sempre para baixo)
  // Se o objeto está no plano inclinado, o peso é vertical.
  // A representação SVG atual rotaciona o cubo, mas o vetor peso deve ser sempre para baixo.
  // A origem do vetor peso deve ser o centro do objeto.
  // Para simplificar, vamos manter a lógica de desenho que você já tem,
  // mas usando os valores das props.

  // Ajuste dos vetores para usar as props e o ângulo da simulação
  const rad = (angulo * Math.PI) / 180; // Converter o ângulo da prop para radianos

  // Vetor Peso (sempre vertical para baixo)
  // A origem do vetor peso é o centro do objeto.
  // A ponta do vetor peso é (centerX, centerY + ESCALA * forcaPeso / ESCALA_AJUSTE_VISUAL)
  // O ESCALA_AJUSTE_VISUAL é um fator para que o vetor seja visível no SVG.
  // Se forcaPeso é 0.17N, e ESCALA é 500, 0.17 * 500 = 85. É um bom tamanho.
  const vetorPesoX = 0;
  const vetorPesoY = ESCALA * forcaPeso; // Força Peso já vem da prop

  // Vetor Normal (perpendicular à superfície, para cima)
  // A força normal é perpendicular ao plano.
  // Sua componente X é -Normal * sin(angulo) e Y é -Normal * cos(angulo)
  // Mas no seu SVG, o cubo é rotacionado, então o "para cima" é relativo ao cubo.
  // Se o cubo está rotacionado por -angulo, o vetor normal deve ser vertical para cima no sistema de coordenadas do cubo.
  // No sistema de coordenadas do SVG, isso se traduz em:
  const vetorNormalX = -ESCALA * forcaNormal * Math.sin(rad);
  const vetorNormalY = -ESCALA * forcaNormal * Math.cos(rad);

  // Vetor Atrito (paralelo à superfície, oposto ao movimento)
  // A direção do atrito depende da aceleração. Se aceleracao > 0, movimento para baixo, atrito para cima.
  // Se aceleracao < 0, movimento para cima, atrito para baixo.
  // Se aceleracao == 0, atrito pode ser estático ou nulo.
  // Vamos usar a lógica que você já tinha para direcaoAtrito.
  const direcaoAtrito = aceleracao > 0 ? -1 : 1; // Se aceleração positiva (descendo), atrito é negativo (subindo)
                                                // Se aceleração negativa (subindo), atrito é positivo (descendo)
                                                // Se aceleração zero, atrito é contra a tendência de movimento (se houver)
                                                // ou zero. Para simplificar, mantenha a lógica atual.

  const vetorAtritoX = ESCALA * forcaAtrito * Math.cos(rad) * direcaoAtrito;
  const vetorAtritoY = ESCALA * forcaAtrito * Math.sin(rad) * direcaoAtrito;

  // Vetor Resultante (na direção da aceleração)
  // A força resultante já é passada como prop.
  // Para desenhar, precisamos da direção. Se a aceleração é ao longo do plano,
  // a resultante também é.
  // A direção da resultante é a mesma da aceleração.
  // Se a aceleração é positiva (descendo o plano), a resultante aponta para baixo no plano.
  // Se a aceleração é negativa (subindo o plano), a resultante aponta para cima no plano.
  const direcaoResultante = aceleracao >= 0 ? 1 : -1; // Se aceleração positiva ou zero, resultante para baixo no plano.
                                                      // Se aceleração negativa, resultante para cima no plano.

  const vetorResultanteX = ESCALA * forcaResultante * Math.cos(rad) * direcaoResultante;
  const vetorResultanteY = ESCALA * forcaResultante * Math.sin(rad) * direcaoResultante;


  const desenharVetor = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    cor: string,
    texto: string,
    deslocaTextoX: number,
    deslocaTextoY: number,
    largura: number = 2
  ) => (
    <>
      <motion.line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={cor}
        strokeWidth={largura}
        markerEnd="url(#arrow)"
        initial={{ x1, y1, x2, y2 }}
        animate={{ x2, y2 }}
        transition={{ duration: 1, ease: "easeInOut" }}
      />
      <text
        x={x2 + deslocaTextoX}
        y={y2 + deslocaTextoY}
        fill={cor}
        fontSize="12"
        fontWeight="bold"
      >
        {texto}
      </text>
    </>
  );

  const alternarTodasForcas = () => {
    const novoEstado = !mostrarTodasForcas;
    setMostrarTodasForcas(novoEstado);
    setMostrarPeso(novoEstado);
    setMostrarNormal(novoEstado);
    setMostrarAtrito(novoEstado);
    setMostrarResultante(novoEstado);
  };

  return (
    <div className="flex flex-col justify-center items-center mt-2">
      <svg width="320" height="320" viewBox="0 0 350 250">
        <defs>
          <marker
            id="arrow"
            markerWidth="5"
            markerHeight="5"
            refX="2.5"
            refY="2.5"
            orient="auto"
            markerUnits="strokeWidth"
          >
            <path d="M0,0 L0,5 L5,2.5 z" fill="black" />
          </marker>
        </defs>

        {/* Aumentando o tamanho do triângulo */}
        <polygon points="50,230 250,230 250,120" fill="#d3d3d3" /> {/* Ajuste no triângulo */}
        
        {/* Aumentando o cubo (quadrado) */}
        <rect
          x={centerX - 25} // Maior cubo (largura aumentada)
          y={centerY - 25} // Maior cubo (altura aumentada)
          width="50" // Maior cubo
          height="50" // Maior cubo
          fill="#8884d8"
          transform={`rotate(${-angulo}, ${centerX}, ${centerY})`} // Usar angulo da prop
        />

        {mostrarPeso &&
          desenharVetor(
            centerX,
            centerY,
            centerX + vetorPesoX,
            centerY + vetorPesoY,
            "red",
            `Peso (${forcaPeso.toFixed(2)} N)`,
            10,
            15
          )}

        {mostrarNormal &&
          desenharVetor(
            centerX,
            centerY,
            centerX + vetorNormalX,
            centerY + vetorNormalY,
            "green",
            `Normal (${forcaNormal.toFixed(2)} N)`,
            -40,
            0
          )}

        {mostrarAtrito &&
          desenharVetor(
            centerX,
            centerY,
            centerX + vetorAtritoX,
            centerY + vetorAtritoY,
            "orange",
            `Atrito (${forcaAtrito.toFixed(2)} N)`,
            -40,
            10
          )}

        {mostrarResultante &&
          desenharVetor(
            centerX,
            centerY,
            centerX + vetorResultanteX,
            centerY + vetorResultanteY,
            "blue",
            `Resultante (${forcaResultante.toFixed(2)} N)`, // Usar forcaResultante da prop
            10,
            0
          )}
      </svg>

    

      <div className="mt-6 space-x-4 flex flex-wrap justify-center">
        <button
          onClick={() => setMostrarPeso(!mostrarPeso)}
          className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          {mostrarPeso ? "Esconder Peso" : "Mostrar Peso"}
        </button>
        <button
          onClick={() => setMostrarNormal(!mostrarNormal)}
          className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          {mostrarNormal ? "Esconder Normal" : "Mostrar Normal"}
        </button>
        <button
          onClick={() => setMostrarAtrito(!mostrarAtrito)}
          className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
        >
          {mostrarAtrito ? "Esconder Atrito" : "Mostrar Atrito"}
        </button>
        <button
          onClick={() => setMostrarResultante(!mostrarResultante)}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          {mostrarResultante ? "Esconder Resultante" : "Mostrar Resultante"}
        </button>
      </div>

      <div className="mt-4">
        <button
          onClick={alternarTodasForcas}
          className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
        >
          {mostrarTodasForcas ? "Esconder Todas as Forças" : "Mostrar Todas as Forças"}
        </button>
      </div>

    </div>
  );
};

export default ForcasSVG;
