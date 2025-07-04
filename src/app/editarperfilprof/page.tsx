/* eslint-disable */

"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from '../../../lib/supabase';
import { auth } from '../../../lib/firebaseConfig'; // Ajuste o caminho conforme sua estrutura
import { onAuthStateChanged, deleteUser, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import LogoutIcon from "@mui/icons-material/Logout";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import LanguageIcon from "@mui/icons-material/Language";
import PasswordIcon from "@mui/icons-material/Password";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import MenuIcon from "@mui/icons-material/Menu";
import PaletteIcon from "@mui/icons-material/Palette"; // Ícone para skins

const Editarperfilprof: React.FC = () => {
    const [showAranduSkin, setShowAranduSkin] = useState(false);
  const aranduSkin = {
    id: 'galileuarandu',
    name: 'Galileu Arandu',
    image: '/images/galileuarandu.png'
  };
  const router = useRouter();
  const [skinSearchText, setSkinSearchText] = useState('');
const [showSecretSkin, setShowSecretSkin] = useState(false);
const [showBurgaSkin, setShowBurgaSkin] = useState(false);
const [showSerafimSkin, setShowSerafimSkin] = useState(false);
const [showCorinthiansSkin, setShowCorinthiansSkin] = useState(false);
const [showVelocistaSkin, setShowVelocistaSkin] = useState(false);
const secretSkin = {
  id: 'galileudias',
  name: 'Galileu Dias',
  image: '/images/galileudias.png'
};
const burgaSkin = {
  id: 'galileuburga',
  name: 'Galileu Burga',
  image: '/images/galileuburga.png'
};
const serafimSkin = {
  id: 'galileuserafim', 
  name: 'Galileu Serafim',
  image: '/images/galileuserafim.png'
};
const corinthiansSkin = {
  id: 'galileucorinthians',
  name: 'Galileu Corinthians', 
  image: '/images/galileucorinthians.png'
};
const velocistaSkin = {
  id: 'galileuvelocista',
  name: 'Galileu Velocista',
  image: '/images/galileuvelocista.png'
};
const handleSearchChange = (text: string) => {
  setSkinSearchText(text);
  const lowerText = text.toLowerCase();
      setShowAranduSkin(lowerText.includes('arandu')); // Use 'gabrieleburga' para ativar

  setShowSecretSkin(lowerText.includes('dias'));
  setShowBurgaSkin(lowerText.includes('gabrieleburga'));
  setShowSerafimSkin(lowerText.includes('serafim')); 
  setShowCorinthiansSkin(lowerText.includes('corinthians'));
  setShowVelocistaSkin(lowerText.includes('velocista'));
};
  const [user, setUser] = useState({
    uid: "", // Mudança: usar UID do Firebase
    name: "Professor",
    email: "",
    accountType: "Professor",
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showTranslator, setShowTranslator] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSkinModal, setShowSkinModal] = useState(false); // Modal para skins
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);
  const [selectedSkin, setSelectedSkin] = useState('galileufrente'); // Skin padrão
const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
const [currentPassword, setCurrentPassword] = useState('');
const [newPassword, setNewPassword] = useState('');
const [confirmNewPassword, setConfirmNewPassword] = useState('');
const [passwordError, setPasswordError] = useState('');
const [passwordSuccess, setPasswordSuccess] = useState('');

const handleChangePassword = async () => {
  setPasswordError('');
  setPasswordSuccess('');

  if (newPassword !== confirmNewPassword) {
    setPasswordError('A nova senha e a confirmação não coincidem.');
    return;
  }

  if (newPassword.length < 6) { // Firebase exige no mínimo 6 caracteres
    setPasswordError('A nova senha deve ter pelo menos 6 caracteres.');
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    setPasswordError('Nenhum usuário logado.');
    return;
  }

  try {
    // Reautenticar o usuário
    const credential = EmailAuthProvider.credential(user.email!, currentPassword);
    await reauthenticateWithCredential(user, credential);

    // Se a reautenticação for bem-sucedida, atualize a senha
    await updatePassword(user, newPassword);
    setPasswordSuccess('Senha alterada com sucesso!');
    setShowChangePasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  } catch (error: any) {
    console.error('Erro ao alterar senha:', error);
    if (error.code === 'auth/wrong-password') {
      setPasswordError('Senha atual incorreta.');
    } else if (error.code === 'auth/requires-recent-login') {
      setPasswordError('Por favor, faça login novamente para alterar sua senha.');
      // Você pode redirecionar para a página de login aqui ou forçar um re-login
      // router.push('/login');
    } else {
      setPasswordError('Erro ao alterar senha. Tente novamente.');
    }
  }
};


const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
const [deletePassword, setDeletePassword] = useState('');
const [deleteError, setDeleteError] = useState('');

const handleDeleteAccount = async () => {
  setDeleteError('');

  const user = auth.currentUser;
  if (!user) {
    setDeleteError('Nenhum usuário logado.');
    return;
  }

  try {
    // Reautenticar o usuário antes de deletar
    const credential = EmailAuthProvider.credential(user.email!, deletePassword);
    await reauthenticateWithCredential(user, credential);

    // Se a reautenticação for bem-sucedida, delete a conta
    await deleteUser(user);
    localStorage.removeItem("user"); // Limpa o localStorage
    router.push("/login"); // Redireciona para a página de login
  } catch (error: any) {
    console.error('Erro ao deletar conta:', error);
    if (error.code === 'auth/wrong-password') {
      setDeleteError('Senha incorreta.');
    } else if (error.code === 'auth/requires-recent-login') {
      setDeleteError('Por favor, faça login novamente para deletar sua conta.');
      // Você pode redirecionar para a página de login aqui ou forçar um re-login
      // router.push('/login');
    } else {
      setDeleteError('Erro ao deletar conta. Tente novamente.');
    }
  }
};
  // Lista de skins disponíveis
  const skins = [
    {
      id: 'galileufrente',
      name: 'Galileu Clássico',
      image: '/images/galileufrente.png'
    },
    {
      id: 'galileuflamengo',
      name: 'Galileu Flamengo',
      image: '/images/galileuflamengo.png'
    },
     {
      id: 'galileureal',
      name: 'Galileu Real Madrid',
      image: '/images/galileurealremake.png'
    },
    {
      id: 'galileubrasil',
      name: 'Galileu Brasil',
      image: '/images/galileubrasil.png'
    },
    {
      id: 'galileukakuja',
      name: 'Galileu Kakuja',
      image: '/images/galileukakuja.png'
    },
    {
      id: 'galileuuchiha',
      name: 'Galileu Uchiha',
      image: '/images/galileuchiha.png'
    },
    {
      id: 'galileusaiyajin',
      name: 'Galileu Saiyajin',
      image: '/images/galileusaiyajin.png'
    },
    {
      id: 'galileufuturo',
      name: 'Galileu do Futuro',
      image: '/images/galileufuturo.png'
    },
    
    {
      id: 'galileusollus',
      name: 'Galileu do Sollus',
      image: '/images/galileusollus.png'
    },
      {
      id: 'galileureddead',
      name: 'Galileu do Red Dead',
      image: '/images/galileuredead.png'
    },{
      id: 'galileuchina',
      name: 'Galileu Chinês',
      image: '/images/galileuchina.png'
    },
    {
      id: 'galileuegito',
      name: 'Galileu Egípcio',
      image: '/images/galileuegito.png'
    },{
      id: 'galileuninja',
      name: 'Galileu Ninja',
      image: '/images/galileuninja.png'
    },
    {
      id: 'galileupoderoso',
      name: 'Galileu Poderoso',
      image: '/images/galileupoderoso.png'
    },
    {
      id: 'galileuelric',
      name: 'Galileu Elric',
      image: '/images/galileuelric.png'
    },
    {
      id: 'galileusukuna',
      name: 'Galileu Sukuna',
      image: '/images/galileusukuna.png'
    },
    {
      id: 'galileugojo',
      name: 'Galileu Egoísta',
      image: '/images/galileugojo.png'
    },
    {
      id: 'galileupolicial',
      name: 'Galileu Policial',
      image: '/images/galileupolicial.png'
    }

    // Adicione mais skins aqui conforme necessário
  ];

  useEffect(() => {
    // Escutar mudanças de autenticação do Firebase
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Usuário autenticado
        const storedUser = localStorage.getItem("user");
        let userData = {
          name: "Professor",
          email: firebaseUser.email || "",
          accountType: "Professor"
        };

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          userData = {
            name: parsedUser.name || firebaseUser.displayName || "Professor",
            email: parsedUser.email || firebaseUser.email || "",
            accountType: parsedUser.accountType || "Professor"
          };
        }

        setUser({
          uid: firebaseUser.uid, // UID único do Firebase
          name: userData.name,
          email: userData.email,
          accountType: userData.accountType,
        });

        // Carregar foto de perfil usando o UID do Firebase
        loadProfileImage(firebaseUser.uid);
        // Carregar skin selecionada
        loadSelectedSkin(firebaseUser.uid);
        setLoading(false);
      } else {
        // Usuário não autenticado
        router.push("/login");
      }
    });

    // Cleanup
    return () => unsubscribe();
  }, [router]);

  // Função para fechar o menu mobile ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (menuMobileAberto && !target.closest('.menu-mobile-container')) {
        setMenuMobileAberto(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuMobileAberto]);

  const toggleMenuMobile = () => {
    setMenuMobileAberto(!menuMobileAberto);
  };

  const loadProfileImage = async (userId: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('arquivos')
        .list(`foto-de-perfil/${userId}`, {
          limit: 1,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) {
        console.error('Erro ao buscar foto de perfil:', error);
        return;
      }

      if (data && data.length > 0) {
        const { data: urlData } = supabase.storage
          .from('arquivos')
          .getPublicUrl(`foto-de-perfil/${userId}/${data[0].name}`);
        
        setProfileImage(urlData.publicUrl);
      }
    } catch (error) {
      console.error('Erro ao carregar foto de perfil:', error);
    }
  };

  // Carregar skin selecionada do localStorage
  const loadSelectedSkin = (userId: string) => {
    const savedSkin = localStorage.getItem(`skin_${userId}`);
    if (savedSkin) {
      setSelectedSkin(savedSkin);
    }
  };

  // Salvar skin selecionada
 const handleSkinChange = (skinId: string) => {
  setSelectedSkin(skinId);
  localStorage.setItem(`skin_${user.uid}`, skinId);
  setShowSkinModal(false);
  setSkinSearchText('');
  setShowSecretSkin(false);
};

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];
    
    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    // Validar tamanho do arquivo (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB.');
      return;
    }

    setUploading(true);

    try {
      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `foto-de-perfil/${user.uid}/${fileName}`; // Usar UID do Firebase

      // Remover foto anterior se existir
      try {
        const { data: existingFiles } = await supabase.storage
          .from('arquivos')
          .list(`foto-de-perfil/${user.uid}`); // Usar UID do Firebase

        if (existingFiles && existingFiles.length > 0) {
          const filesToDelete = existingFiles.map(file => `foto-de-perfil/${user.uid}/${file.name}`);
          await supabase.storage
            .from('arquivos')
            .remove(filesToDelete);
        }
      } catch (error) {
        console.log('Nenhuma foto anterior encontrada ou erro ao remover:', error);
      }

      // Upload da nova foto
      const { error: uploadError } = await supabase.storage
        .from('arquivos')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Obter URL pública da imagem
      const { data: urlData } = supabase.storage
        .from('arquivos')
        .getPublicUrl(filePath);

      setProfileImage(urlData.publicUrl);
      
      // Opcional: Salvar URL no perfil do usuário no banco de dados
      // Aqui você pode adicionar código para atualizar a tabela de usuários com a URL da foto

    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error);
      alert('Erro ao fazer upload da imagem. Tente novamente.');
    } finally {
      setUploading(false);
    }
  };

  const handleLanguageToggle = () => {
    if (showTranslator) {
      setShowTranslator(false);
    } else {
      setShowTranslator(true);
      if (!document.querySelector("#google_translate_script")) {
        const script = document.createElement("script");
        script.id = "google_translate_script";
        script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        document.body.appendChild(script);

        // Define a função de callback global para o tradutor
        (window as any).googleTranslateElementInit = () => {
          new (window as any).google.translate.TranslateElement(
            {
              pageLanguage: "pt", // Define o idioma da página como Português
              includedLanguages: "en,pt,es,fr,de,it", // Idiomas incluídos
              layout: (window as any).google.translate.TranslateElement.InlineLayout.SIMPLE,
            },
            "google_translate_element"
          );
        };
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    router.push("/login");
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
      className="min-h-screen flex flex-col items-center text-white p-2 sm:p-4 md:p-8 bg-cover bg-center relative"
      style={{
        backgroundImage: "url('/images/sooroxo.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
      }}
    >
      {/* Header Responsivo */}
      <header className="w-full container mx-auto px-2 sm:px-4 py-4 sm:py-6 flex justify-between items-center relative">
        <div className="flex items-center gap-2 sm:gap-4">
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
                <AccountCircleOutlinedIcon />
                <span className="hidden lg:inline">{user.name}</span>
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
                    className="w-full text-left text-white px-4 py-3 hover:bg-purple-700 transition duration-300 font-bold"
                  >
                    Perfil
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </header>

      {/* Containers de Edição Responsivos */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-10 w-full max-w-6xl mt-6 sm:mt-8 lg:mt-12 px-2 sm:px-4">
        {/* Container da Esquerda */}
        <div className="bg-purple-800 p-4 sm:p-6 lg:p-8 rounded-lg w-full lg:w-2/5 shadow-lg border border-purple-400">
          <div className="space-y-3 sm:space-y-4 lg:space-y-5">
            <button
  className="w-full bg-red-600 py-2 sm:py-3 rounded-md hover:bg-red-500 flex items-center justify-center gap-2 text-sm sm:text-base lg:text-lg transition duration-300"
  onClick={() => setShowDeleteAccountModal(true)} // Adicione este onClick
>
  <DeleteIcon fontSize="small" />
  <span className="hidden sm:inline">Deletar conta</span>
  <span className="sm:hidden">Deletar</span>
</button>
            <button
              className="w-full bg-yellow-500 py-2 sm:py-3 rounded-md hover:bg-yellow-400 flex items-center justify-center gap-2 text-sm sm:text-base lg:text-lg transition duration-300"
              onClick={() => setShowAccountModal(true)}
            >
              <AccountCircleOutlinedIcon fontSize="small" />
              <span className="hidden sm:inline">Mudar tipo de conta</span>
              <span className="sm:hidden">Tipo conta</span>
            </button>
            <button
  className="w-full bg-blue-500 py-2 sm:py-3 rounded-md hover:bg-blue-400 flex items-center justify-center gap-2 text-sm sm:text-base lg:text-lg transition duration-300"
  onClick={() => setShowChangePasswordModal(true)} // Adicione este onClick
>
  <PasswordIcon fontSize="small" />
  <span className="hidden sm:inline">Alterar Senha</span>
  <span className="sm:hidden">Senha</span>
</button>
            
            {/* NOVO BOTÃO PARA SKINS */}
            <button
              className="w-full bg-pink-600 py-2 sm:py-3 rounded-md hover:bg-pink-500 flex items-center justify-center gap-2 text-sm sm:text-base lg:text-lg transition duration-300"
              onClick={() => setShowSkinModal(true)}
            >
              <PaletteIcon fontSize="small" />
              <span className="hidden sm:inline">Mudar Skin</span>
              <span className="sm:hidden">Skins</span>
            </button>
            {showTranslator && (
              <div id="google_translate_element" className="mt-4 text-black bg-white rounded-md p-2" />
            )}
          </div>
        </div>

        {/* Container da Direita */}
        <div className="bg-purple-900 p-6 sm:p-8 lg:p-10 rounded-lg w-full lg:w-3/5 shadow-lg border border-purple-400 bg-opacity-90 flex flex-col items-center">
          <div className="relative">
            {profileImage ? (
              <Image
                src={profileImage}
                alt="Perfil"
                width={120}
                height={120}
                className="rounded-full border-4 border-purple-400 object-cover w-[120px] h-[120px] sm:w-[150px] sm:h-[150px]"
              />
            ) : (
              <div className="w-[120px] h-[120px] sm:w-[150px] sm:h-[150px] rounded-full border-4 border-purple-400 bg-purple-700 flex items-center justify-center">
                <PersonIcon style={{ fontSize: 60 }} className="sm:text-[80px] text-purple-300" />
              </div>
            )}
            
            <input
              type="file"
              accept="image/*"
              id="fileInput"
              className="hidden"
              onChange={handleImageChange}
              disabled={uploading}
            />
            <label
              htmlFor="fileInput"
              className={`absolute bottom-0 right-0 p-2 sm:p-3 rounded-full text-white transition cursor-pointer ${
                uploading 
                  ? 'bg-gray-500 cursor-not-allowed' 
                  : 'bg-purple-500 hover:bg-purple-600'
              }`}
            >
              {uploading ? (
                <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <PhotoCameraIcon fontSize="small" />
              )}
            </label>
          </div>

          <div className="mt-4 sm:mt-6 text-center">
            <h2 className="text-xl sm:text-2xl font-bold">{user.name}</h2>
            <p className="text-sm sm:text-base text-gray-300 mt-1 sm:mt-2 break-words">
              <span className="font-semibold">Email:</span> {user.email}
            </p>
            <p className="text-sm sm:text-base text-gray-400 mt-1 sm:mt-2">
              <span className="font-semibold">Tipo de Conta:</span> Professor
            </p>
           <p className="text-sm sm:text-base text-gray-400 mt-1 sm:mt-2">
  <span className="font-semibold">Skin Atual:</span> {
    selectedSkin === 'galileudias' 
      ? secretSkin.name 
      : selectedSkin === 'galileuburga'
      ? burgaSkin.name
      : selectedSkin === 'galileuserafim' 
      ? serafimSkin.name
      : selectedSkin === 'galileucorinthians'
       ? aranduSkin.name 
      : selectedSkin === 'galileuarandu'
      ? corinthiansSkin.name  
      : selectedSkin === 'galileuvelocista'
      ? velocistaSkin.name
      : skins.find(s => s.id === selectedSkin)?.name
  }
</p>
          </div>

          <button
            className="mt-6 sm:mt-8 w-full bg-purple-600 py-2 sm:py-3 rounded-md hover:bg-purple-500 flex justify-center items-center gap-2 text-sm sm:text-base lg:text-lg transition duration-300"
            onClick={() => setShowLogoutModal(true)}
          >
            <LogoutIcon fontSize="small" />
            <span className="hidden sm:inline">Encerrar sessão</span>
            <span className="sm:hidden">Sair</span>
          </button>
        </div>
      </div>

      {/* MODAL - Seleção de Skins */}
      {/* MODAL - Seleção de Skins */}
{showSkinModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 p-4">
    <div className="bg-purple-900 border border-purple-400 p-6 sm:p-8 rounded-lg text-center shadow-lg w-full max-w-6xl max-h-[90vh] flex flex-col">
      <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6">Escolha sua Skin</h2>
      
      {/* Campo de busca secreto */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar skin especial..."
          className="w-full max-w-md mx-auto p-3 rounded-md bg-gray-700 text-white placeholder-gray-400"
          value={skinSearchText}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>
      
      {/* Container com scroll para as skins */}
      <div className="flex-1 overflow-y-auto mb-6 px-2" style={{ maxHeight: '60vh' }}>
        {/* Grid responsivo: 2 colunas no mobile, 9 colunas no desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-3 sm:gap-4">
          {/* Skin secreta aparece primeiro se ativada */}
          {showSecretSkin && (
            <div
              className={`cursor-pointer border-2 rounded-lg p-2 sm:p-3 transition duration-300 flex flex-col items-center animate-pulse ${
                selectedSkin === secretSkin.id 
                  ? 'border-gold-400 bg-yellow-800 shadow-lg shadow-yellow-400/50' 
                  : 'border-yellow-600 bg-yellow-700 hover:border-yellow-500 shadow-md shadow-yellow-400/30'
              }`}
              onClick={() => handleSkinChange(secretSkin.id)}
            >
              <div className="w-16 h-20 sm:w-20 sm:h-24 flex items-center justify-center">
                <Image
                  src={secretSkin.image}
                  alt={secretSkin.name}
                  width={60}
                  height={75}
                  className="object-contain max-w-full max-h-full"
                />
              </div>
              <p className="text-xs mt-2 font-medium text-center break-words leading-tight text-yellow-200">
                ⭐ {secretSkin.name} ⭐
              </p>
              {selectedSkin === secretSkin.id && (
                <p className="text-xs text-yellow-300 mt-1 text-center">✓ Selecionada</p>
              )}
            </div>
          )}
          {showBurgaSkin && (
  <div className={`cursor-pointer border-2 rounded-lg p-2 sm:p-3 transition duration-300 flex flex-col items-center animate-pulse ${
    selectedSkin === burgaSkin.id ? 'border-gold-400 bg-yellow-800 shadow-lg shadow-yellow-400/50' : 'border-yellow-600 bg-yellow-700 hover:border-yellow-500 shadow-md shadow-yellow-400/30'}`}
    onClick={() => handleSkinChange(burgaSkin.id)}>
    <div className="w-16 h-20 sm:w-20 sm:h-24 flex items-center justify-center">
      <Image src={burgaSkin.image} alt={burgaSkin.name} width={60} height={75} className="object-contain max-w-full max-h-full"/>
    </div>
    <p className="text-xs mt-2 font-medium text-center break-words leading-tight text-yellow-200">⭐ {burgaSkin.name} ⭐</p>
    {selectedSkin === burgaSkin.id && <p className="text-xs text-yellow-300 mt-1 text-center">✓ Selecionada</p>}
  </div>
)}

{showAranduSkin && (
  <div className={`cursor-pointer border-2 rounded-lg p-2 sm:p-3 transition duration-300 flex flex-col items-center animate-pulse ${
    selectedSkin === aranduSkin.id ? 'border-gold-400 bg-yellow-800 shadow-lg shadow-yellow-400/50' : 'border-yellow-600 bg-yellow-700 hover:border-yellow-500 shadow-md shadow-yellow-400/30'}`}
    onClick={() => handleSkinChange(aranduSkin.id)}>
    <div className="w-16 h-20 sm:w-20 sm:h-24 flex items-center justify-center">
      <Image src={aranduSkin.image} alt={aranduSkin.name} width={60} height={75} className="object-contain max-w-full max-h-full"/>
    </div>
    <p className="text-xs mt-2 font-medium text-center break-words leading-tight text-yellow-200">⭐ {aranduSkin.name} ⭐</p>
    {selectedSkin === aranduSkin.id && <p className="text-xs text-yellow-300 mt-1 text-center">✓ Selecionada</p>}
  </div>
)}

{showSerafimSkin && (
  
  <div className={`cursor-pointer border-2 rounded-lg p-2 sm:p-3 transition duration-300 flex flex-col items-center animate-pulse ${
    selectedSkin === serafimSkin.id ? 'border-gold-400 bg-yellow-800 shadow-lg shadow-yellow-400/50' : 'border-yellow-600 bg-yellow-700 hover:border-yellow-500 shadow-md shadow-yellow-400/30'}`}
    onClick={() => handleSkinChange(serafimSkin.id)}>
    <div className="w-16 h-20 sm:w-20 sm:h-24 flex items-center justify-center">
      <Image src={serafimSkin.image} alt={serafimSkin.name} width={60} height={75} className="object-contain max-w-full max-h-full"/>
    </div>
    <p className="text-xs mt-2 font-medium text-center break-words leading-tight text-yellow-200">⭐ {serafimSkin.name} ⭐</p>
    {selectedSkin === serafimSkin.id && <p className="text-xs text-yellow-300 mt-1 text-center">✓ Selecionada</p>}
  </div>
)
}

{showCorinthiansSkin && (
  
  <div className={`cursor-pointer border-2 rounded-lg p-2 sm:p-3 transition duration-300 flex flex-col items-center animate-pulse ${
    selectedSkin === corinthiansSkin.id ? 'border-gold-400 bg-yellow-800 shadow-lg shadow-yellow-400/50' : 'border-yellow-600 bg-yellow-700 hover:border-yellow-500 shadow-md shadow-yellow-400/30'}`}
    onClick={() => handleSkinChange(corinthiansSkin.id)}>
    <div className="w-16 h-20 sm:w-20 sm:h-24 flex items-center justify-center">
      <Image src={corinthiansSkin.image} alt={corinthiansSkin.name} width={60} height={75} className="object-contain max-w-full max-h-full"/>
    </div>
    <p className="text-xs mt-2 font-medium text-center break-words leading-tight text-yellow-200">⭐ {corinthiansSkin.name} ⭐</p>
    {selectedSkin === corinthiansSkin.id && <p className="text-xs text-yellow-300 mt-1 text-center">✓ Selecionada</p>}
  </div>
)
}

{showVelocistaSkin && (
  
  <div className={`cursor-pointer border-2 rounded-lg p-2 sm:p-3 transition duration-300 flex flex-col items-center animate-pulse ${
    selectedSkin === velocistaSkin.id ? 'border-gold-400 bg-yellow-800 shadow-lg shadow-yellow-400/50' : 'border-yellow-600 bg-yellow-700 hover:border-yellow-500 shadow-md shadow-yellow-400/30'}`}
    onClick={() => handleSkinChange(velocistaSkin.id)}>
    <div className="w-16 h-20 sm:w-20 sm:h-24 flex items-center justify-center">
      <Image src={velocistaSkin.image} alt={velocistaSkin.name} width={60} height={75} className="object-contain max-w-full max-h-full"/>
    </div>
    <p className="text-xs mt-2 font-medium text-center break-words leading-tight text-yellow-200">⭐ {velocistaSkin.name} ⭐</p>
    {selectedSkin === velocistaSkin.id && <p className="text-xs text-yellow-300 mt-1 text-center">✓ Selecionada</p>}
  </div>
)
}
          
          {/* Skins normais */}
          {skins.map((skin) => (
            <div
              key={skin.id}
              className={`cursor-pointer border-2 rounded-lg p-2 sm:p-3 transition duration-300 flex flex-col items-center ${
                selectedSkin === skin.id 
                  ? 'border-purple-400 bg-purple-800' 
                  : 'border-gray-600 bg-purple-700 hover:border-purple-500'
              }`}
              onClick={() => handleSkinChange(skin.id)}
            >
              <div className="w-16 h-20 sm:w-20 sm:h-24 flex items-center justify-center">
                <Image
                  src={skin.image}
                  alt={skin.name}
                  width={60}
                  height={75}
                  className="object-contain max-w-full max-h-full"
                />
              </div>
              <p className="text-xs mt-2 font-medium text-center break-words leading-tight">
                {skin.name}
              </p>
              {selectedSkin === skin.id && (
                <p className="text-xs text-purple-300 mt-1 text-center">✓ Selecionada</p>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <button 
        className="mt-2 sm:mt-4 text-white hover:text-gray-300 flex items-center justify-center gap-2 mx-auto transition duration-300" 
        onClick={() => {
          setShowSkinModal(false);
          setSkinSearchText('');
          setShowSecretSkin(false);
          setShowBurgaSkin(false);
                    setShowAranduSkin(false);

  setShowSerafimSkin(false); 
  setShowCorinthiansSkin(false);
  setShowVelocistaSkin(false);
        }}
      >
        <CloseIcon fontSize="small" />
        Fechar
      </button>
    </div>
  </div>
)}



      {/* MODAL - Mudar Tipo de Conta */}
      {showAccountModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 p-4">
          <div className="bg-purple-900 border border-purple-400 p-6 sm:p-8 rounded-lg text-center shadow-lg w-full max-w-sm sm:max-w-md">
            <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6">Escolha o tipo de conta</h2>
            <button 
              onClick={() => router.push("/editarperfilaluno")}
              className={`w-full py-2 sm:py-3 rounded-md mb-3 sm:mb-4 text-sm sm:text-base transition duration-300 ${
                user.accountType === "Estudante" 
                  ? "bg-purple-600 text-white" 
                  : "bg-white text-purple-600 border border-purple-600 hover:bg-purple-50"
              }`}
            >
              Estudante
            </button>
            <button 
              onClick={() => router.push("")}
              className={`w-full py-2 sm:py-3 rounded-md mb-3 sm:mb-4 text-sm sm:text-base transition duration-300 ${
                user.accountType === "Professor" 
                  ? "bg-purple-600 text-white" 
                  : "bg-white text-purple-600 border border-purple-600 hover:bg-purple-50"
              }`}
            >
              Professor
            </button>
            <button 
              className="mt-2 sm:mt-4 text-white hover:text-gray-300 flex items-center justify-center gap-2 mx-auto transition duration-300" 
              onClick={() => setShowAccountModal(false)}
            >
              <CloseIcon fontSize="small" />
              Fechar
            </button>
          </div>
        </div>
      )}

      {/* MODAL - Confirmação de Logout */}
      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 p-4">
          <div className="bg-purple-900 border border-purple-400 p-6 sm:p-8 rounded-lg text-center shadow-lg w-full max-w-sm sm:max-w-md">
            <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6">Você tem certeza que deseja encerrar a sessão?</h2>
            <button 
              onClick={handleLogout} 
              className="w-full py-2 sm:py-3 rounded-md mb-3 sm:mb-4 bg-red-600 text-white hover:bg-red-500 text-sm sm:text-base transition duration-300"
            >
              Sim, Encerrar
            </button>
            <button 
              onClick={() => setShowLogoutModal(false)} 
              className="w-full py-2 sm:py-3 rounded-md bg-gray-600 text-white hover:bg-gray-500 text-sm sm:text-base transition duration-300"
            >
              Não, Voltar
            </button>
          </div>
        </div>

      )}

      {showChangePasswordModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 p-4">
    <div className="bg-purple-900 border border-purple-400 p-6 sm:p-8 rounded-lg text-center shadow-lg w-full max-w-sm sm:max-w-md">
      <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6">Alterar Senha</h2>
      {passwordError && <p className="text-red-400 mb-4">{passwordError}</p>}
      {passwordSuccess && <p className="text-green-400 mb-4">{passwordSuccess}</p>}
      <input
        type="password"
        placeholder="Senha Atual"
        className="w-full p-3 mb-3 rounded-md bg-gray-700 text-white placeholder-gray-400"
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
      />
      <input
        type="password"
        placeholder="Nova Senha"
        className="w-full p-3 mb-3 rounded-md bg-gray-700 text-white placeholder-gray-400"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <input
        type="password"
        placeholder="Confirmar Nova Senha"
        className="w-full p-3 mb-6 rounded-md bg-gray-700  text-white placeholder-gray-400"
        value={confirmNewPassword}
        onChange={(e) => setConfirmNewPassword(e.target.value)}
      />
      <button
        onClick={handleChangePassword}
        className="w-full py-2 sm:py-3 rounded-md mb-3 sm:mb-4 bg-blue-600 text-white hover:bg-blue-500 text-sm sm:text-base transition duration-300"
      >
        Confirmar Alteração
      </button>
      <button
        onClick={() => {
          setShowChangePasswordModal(false);
          setPasswordError('');
          setPasswordSuccess('');
          setCurrentPassword('');
          setNewPassword('');
          setConfirmNewPassword('');
        }}
        className="w-full py-2 sm:py-3 rounded-md bg-gray-600 text-white hover:bg-gray-500 text-sm sm:text-base transition duration-300"
      >
        Cancelar
      </button>
    </div>
  </div>
)} 

{showDeleteAccountModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50 p-4">
    <div className="bg-purple-900 border border-purple-400 p-6 sm:p-8 rounded-lg text-center shadow-lg w-full max-w-sm sm:max-w-md">
      <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6">Deletar Conta</h2>
      {deleteError && <p className="text-red-400 mb-4">{deleteError}</p>}
      <p className="text-white mb-4">Tem certeza que deseja deletar sua conta? Esta ação é irreversível.</p>
      <input
        type="password"
        placeholder="Digite sua senha para confirmar"
        className="w-full p-3 mb-6 rounded-md bg-gray-700 text-white placeholder-gray-400"
        value={deletePassword}
        onChange={(e) => setDeletePassword(e.target.value)}
      />
      <button
        onClick={handleDeleteAccount}
        className="w-full py-2 sm:py-3 rounded-md mb-3 sm:mb-4 bg-red-600 text-white hover:bg-red-500 text-sm sm:text-base transition duration-300"
      >
        Sim, Deletar Minha Conta
      </button>
      <button
        onClick={() => {
          setShowDeleteAccountModal(false);
          setDeletePassword('');
          setDeleteError('');
        }}
        className="w-full py-2 sm:py-3 rounded-md bg-gray-600 text-white hover:bg-gray-500 text-sm sm:text-base transition duration-300"
      >
        Cancelar
      </button>
    </div>
  </div>
)}

    </div>
  );
};

export default Editarperfilprof;