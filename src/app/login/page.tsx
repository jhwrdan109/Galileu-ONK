/* eslint-disable */

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, database } from "../../../lib/firebaseConfig";
import { ref, get } from "firebase/database";
import Image from "next/image";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const Login: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // 🔐 Dados fixos do usuário master
  const MASTER_EMAIL = "master@master.com";
  const MASTER_PASSWORD = "123456"; // Senha direta para login offline

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const isOffline = !navigator.onLine;
    const isMaster = email.trim() === MASTER_EMAIL;

    if (isOffline && isMaster) {
      if (password === MASTER_PASSWORD) {
        localStorage.setItem("user", JSON.stringify({
          uid: "offline-master",
          email: MASTER_EMAIL,
          accountType: "master",
        }));
        router.push("/dashboardprof");
        return;
      } else {
        setError("Senha incorreta para login offline.");
        return;
      }
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      console.log("Usuário logado:", user.uid);

      const userRef = ref(database, `users/${user.uid}`);
      const snapshot = await get(userRef);

      if (!snapshot.exists()) {
        setError("Usuário não encontrado no banco de dados.");
        return;
      }

      const userDataFromDB = snapshot.val();
      localStorage.setItem("user", JSON.stringify({ ...userDataFromDB, uid: user.uid })); // Incluímos o uid aqui

      router.push(userDataFromDB.accountType === "professor" ? "/dashboardprof" : "/dashboardaluno");
    } catch (err: any) {
      console.error("Erro no login:", err);
      setError("Erro ao fazer login. Verifique suas credenciais!");
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-cover bg-center p-4" // Adicionado p-4 para padding em telas pequenas
      style={{ backgroundImage: "url('/images/FundoCanva.png')", backgroundSize: "cover", backgroundAttachment: "fixed" }}>

      <ArrowBackIcon className="absolute top-4 left-4 text-white cursor-pointer hover:scale-110 transition"
        fontSize="large" onClick={() => router.push("/")} />

      <div className="p-6 rounded-lg shadow-lg w-full max-w-xs sm:max-w-sm md:max-w-md backdrop-blur-lg bg-transparent "> {/* Ajuste de max-w e remoção de posicionamento absoluto */}
        <div className="flex justify-center mb-4">
          <Image src="/images/markim-Photoroom.png" alt="Logo Projeto Galileu"
            width={120} height={40} // Mantido para proporção, mas a classe controlará o tamanho
            className="w-24 sm:w-32 hover:scale-105 transition-transform duration-300" /> {/* Ajuste de largura responsivo */}
        </div>
        <h2 className="text-white text-xl sm:text-2xl font-bold text-center mb-4">Login</h2> {/* Ajuste de tamanho de fonte e margem */}

        {error && <p className="text-red-400 text-center mb-3 text-sm">{error}</p>} {/* Ajuste de tamanho de fonte */}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="text-white text-sm font-semibold block mb-1">E-mail</label>
            <input type="email" className="w-full p-2 rounded bg-gray-100 text-gray-900 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Digite seu e-mail"
              value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="mb-3">
            <label className="text-white text-sm font-semibold block mb-1">Senha</label>
            <input type="password" className="w-full p-2 rounded bg-gray-100 text-gray-900 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Digite sua senha"
              value={password} onChange={(e) => setPassword(e.target.value)} required />
            <a href="/esqueceuasenha" className="text-purple-400 text-xs block mt-1 hover:underline text-left">
              Esqueceu a senha?
            </a>
          </div>

          <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-500 font-bold text-sm transition duration-300">
            Entrar
          </button>
        </form>

        <p className="text-white text-center text-sm mt-3">
          Ainda não tem uma conta?{" "}
          <a href="/cadastro" className="text-purple-400 font-bold hover:underline">
            Cadastre-se
          </a>
        </p>
      </div>
    </div>
  );
};

export default Login;
