/* eslint-disable */

'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { database } from '../../../lib/firebaseConfig';
import { ref, set } from 'firebase/database';
import { ArrowLeft, Paperclip } from 'lucide-react'; // Removido Menu, XCircle já estava
import { Clock, XCircle } from 'lucide-react'; // XCircle já estava

const CriarQuestao = () => {
  const [enunciado, setEnunciado] = useState('');

  const [resolucao, setResolucao] = useState('');
  const [alternativas, setAlternativas] = useState('');
  const [alternativasVisualizacao, setAlternativasVisualizacao] = useState(['', '', '', '', '']);
  const [tempoMinutos, setTempoMinutos] = useState(0);
  const [tempoSegundos, setTempoSegundos] = useState(0);
  const [anexo, setAnexo] = useState<File | null>(null);

  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [mostrarModalTempo, setMostrarModalTempo] = useState(false);
  const [alternativaCorreta, setAlternativaCorreta] = useState('');
  const [erros, setErros] = useState({
    enunciado: '',
    resolucao: '',
    alternativas: '',
    alternativaCorreta: '',
  });
  const router = useRouter();

  // Estado para controlar a visibilidade do menu mobile
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserName(`Prof. ${user.name || user.email}`);
      setUserId(user.uid);
      setLoading(false);
    } else {
      router.push("/login");
    }
  }, [router]);

  // Quando o componente é montado, se alternativas tiver valor, preenche o array de visualização
  useEffect(() => {
    if (alternativas) {
      const alts = alternativas.split(',').map(alt => alt.trim());
      const novasAlternativas = [...alternativasVisualizacao];

      for (let i = 0; i < Math.min(alts.length, 5); i++) {
        novasAlternativas[i] = alts[i];
      }

      setAlternativasVisualizacao(novasAlternativas);
    }
  }, []); // Executa apenas na montagem

  // Função para atualizar uma alternativa específica
  const atualizarAlternativa = (index: number, valor: string) => {
    const novasAlternativas = [...alternativasVisualizacao];
    novasAlternativas[index] = valor;
    setAlternativasVisualizacao(novasAlternativas);

    // Converte o array de visualização para a string de alternativas
    setAlternativas(novasAlternativas.join(', '));
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center text-white text-xl">Carregando...</div>;
  }

  const handleAnexoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAnexo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };
  const handleRemoveImage = () => {
    setAnexo(null);
    setImageUrl(null);
  };

  const handleSalvarQuestao = async () => {
    if (!userId) return;

    // Valida que todas as alternativas estão preenchidas
    const todasAlternativasPreenchidas = alternativasVisualizacao.every(alt => alt.trim() !== '');

    const novosErros = {
      enunciado: !enunciado.trim() ? 'O enunciado é obrigatório.' : '',
      resolucao: !resolucao.trim() ? 'A resolução é obrigatória.' : '',
      alternativas: !todasAlternativasPreenchidas ? 'Todas as alternativas são obrigatórias.' : '',
      alternativaCorreta: !alternativaCorreta ? 'A alternativa correta é obrigatória.' : '',
    };
    setErros(novosErros);

    if (Object.values(novosErros).some((erro) => erro !== '')) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    const tempoTotal = Math.max(0, tempoMinutos * 60 + tempoSegundos); // Impede tempo negativo
    let anexoUrl = null;

    if (anexo) {
      try {
        const filePath = `questoes/${userId}/${Date.now()}-${anexo.name}`;
        const { data, error } = await supabase.storage
          .from('arquivos')
          .upload(filePath, anexo);

        if (error) {
          console.error("Erro ao fazer upload do anexo:", error);
          alert('Erro ao fazer upload do anexo.');
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from('arquivos')
          .getPublicUrl(data.path);

        anexoUrl = publicUrlData?.publicUrl || null;
      } catch (uploadError) {
        console.error("Erro inesperado no upload:", uploadError);
        alert('Erro inesperado ao fazer upload do anexo.');
        return;
      }
    }

    const letras = ['A', 'B', 'C', 'D', 'E'];
    const alternativasObj: { [key: string]: string } = {};

    const alternativasArray = alternativas.split(',').map((alt) => alt.trim());
    for (let i = 0; i < letras.length; i++) {
      alternativasObj[letras[i]] = alternativasArray[i] || '';
    }

    // Gerar uma chave única para a questão, usando um timestamp para garantir unicidade
    const chaveQuestao = `${Date.now()}-${enunciado.trim().substring(0, 20).replace(/\s+/g, '_')}`;

    const novaQuestao = {
      enunciado,
      resolucao,
      alternativas: alternativasObj,
      alternativaCorreta,
      criadoEm: new Date().toISOString(),
      professor: userName,
      professorId: userId,
      tempo: tempoTotal,
      anexo: anexoUrl,
    };

    try {
      const questaoRef = ref(database, `questoes/${userId}/${chaveQuestao}`);
      await set(questaoRef, novaQuestao);

      alert('Questão salva com sucesso!');
      setEnunciado('');
      setResolucao('');
      setAlternativas('');
      setAlternativasVisualizacao(['', '', '', '', '']);
      setTempoMinutos(0);
      setTempoSegundos(0);
      setAnexo(null);
      setImageUrl(null);
      setAlternativaCorreta('');

      // Redireciona para a página de escolha após salvar
      router.push("/escolhacriadasoucriarprof");
    } catch (dbError) {
      console.error("Erro ao salvar a questão no Firebase:", dbError);
      alert('Erro ao salvar a questão.');
    }
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setMobileMenuOpen(false); // Fecha o menu ao navegar
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center relative"
      style={{
        backgroundImage: "url('/images/FundoCanva.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Imagem fixa na esquerda */}
      <div className="hidden md:block fixed left-0 bottom-0 z-10">
        <Image
          src="/images/galileufrente.png"
          alt="Galileu"
          width={200} // Ajuste o tamanho conforme necessário
          height={300}
          className="object-contain"
        />
      </div>
      <div className="container mx-auto px-4 py-4 sm:py-8"> {/* Ajustado padding */}
        <header className="flex justify-between items-center mb-8 sm:mb-16"> {/* Ajustado margin-bottom */}
          <div className="relative w-[140px] h-[140px] sm:w-[150px] sm:h-[150px]"> {/* Logo com tamanho responsivo */}
            <Image
              onClick={() => handleNavigation("/dashboardprof")} // Usar handleNavigation
              src="/images/markim-Photoroom.png"
              alt="Logo Projeto Galileu"
              fill
              className="cursor-pointer hover:scale-105 transition-transform duration-300 object-contain"
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:block"> {/* Esconde em telas pequenas */}
            <ul className="flex gap-4 xl:gap-6"> {/* Ajustado gap */}
              <li>
                <button
                  onClick={() => handleNavigation('/dashboardprof')}
                  className="text-white px-4 py-2 xl:px-6 xl:py-3 rounded-md border border-purple-400 bg-transparent hover:text-purple-300 hover:border-purple-300 transition duration-300 shadow-md hover:shadow-lg text-sm xl:text-base"
                >
                  Início
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('/quemsomosprof')}
                  className="text-white px-4 py-2 xl:px-6 xl:py-3 rounded-md border border-purple-400 bg-transparent hover:text-purple-300 hover:border-purple-300 transition duration-300 shadow-md hover:shadow-lg text-sm xl:text-base"
                >
                  Quem Somos
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('/simuproftestesupabase')}
                  className="text-white px-4 py-2 xl:px-6 xl:py-3 rounded-md border border-purple-400 bg-transparent hover:text-purple-300 hover:border-purple-300 transition duration-300 shadow-md hover:shadow-lg text-sm xl:text-base"
                >
                  Simulações
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNavigation('/editarperfilprof')}
                  className="bg-purple-600 text-white px-4 py-2 xl:px-8 xl:py-3 rounded-md font-bold transition duration-300 shadow-lg hover:bg-purple-500 hover:shadow-xl text-sm xl:text-base truncate max-w-[120px] xl:max-w-none"
                >
                  {userName}
                </button>
              </li>
            </ul>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-white p-2" // Visível apenas em telas pequenas
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
                      onClick={() => handleNavigation("/dashboardprof")}
                    >
                      Início
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={() => handleNavigation("/quemsomosprof")}
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

        <div className="flex items-center justify-center h-full lg:pl-[200px]"> {/* Alterado md:pl-[200px] para lg:pl-[200px] */}
          <div className="bg-purple-950 p-4 rounded-lg shadow-lg border border-purple-300 max-w-7xl w-full text-center relative mx-auto">
            <button
              onClick={() => router.push("/escolhacriadasoucriarprof")}
              className="absolute top-4 left-4 text-white hover:text-purple-300 transition duration-300"
            >
              <ArrowLeft size={32} />
            </button>
            <h1 className="text-2xl font-bold mb-6">Criar Questão</h1>

            <form>
              <div className="mb-4">
                <label className="block mb-2 text-white">Enunciado</label>
                <textarea
                  className={`w-full p-2 border rounded text-black ${erros.enunciado ? 'border-red-500' : ''}`}
                  value={enunciado}
                  onChange={(e) => setEnunciado(e.target.value)}
                />
                {erros.enunciado && <p className="text-red-500 text-sm">{erros.enunciado}</p>}
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-white">Resolução</label>
                <textarea
                  className={`w-full p-2 border rounded text-black ${erros.resolucao ? 'border-red-500' : ''}`}
                  value={resolucao}
                  onChange={(e) => setResolucao(e.target.value)}
                />
                {erros.resolucao && <p className="text-red-500 text-sm">{erros.resolucao}</p>}
              </div>

              {/* Interface melhorada para as alternativas */}
              <div className="mb-4">
                <label className="block text-lg font-semibold text-white">Alternativas (A até E):</label>
                {['A', 'B', 'C', 'D', 'E'].map((letra, i) => (
                  <div key={i} className="flex items-center mb-2">
                    <span className="w-6 font-bold text-white">{letra})</span>
                    <input
                      type="text"
                      value={alternativasVisualizacao[i]}
                      onChange={(e) => atualizarAlternativa(i, e.target.value)}
                      className={`w-full p-2 border rounded-md text-black ${erros.alternativas ? 'border-red-500' : ''}`}
                    />
                  </div>
                ))}
                {erros.alternativas && <p className="text-red-500 text-sm">{erros.alternativas}</p>}
              </div>


              <div className="mb-4">
                <label className="block mb-2 text-white">Alternativa Correta</label>
                <select
                  value={alternativaCorreta}
                  onChange={(e) => setAlternativaCorreta(e.target.value)}
                  className={`w-full p-3 rounded-md text-black border border-gray-300 mb-4 ${erros.alternativaCorreta ? 'border-red-500' : ''}`}
                >
                  <option value="">Selecione a alternativa correta</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="E">E</option>
                </select>
                {erros.alternativaCorreta && <p className="text-red-500 text-sm">{erros.alternativaCorreta}</p>}
              </div>

              <div className="mb-4">
                <label className="block mb-2 text-white">Tempo</label>
                <button
                  type="button"
                  className="bg-purple-600 text-white py-2 px-4 rounded-md"
                  onClick={() => setMostrarModalTempo(true)}
                >
                  Definir Tempo
                </button>
                {mostrarModalTempo && (
                  <div className="modal bg-black bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center"> {/* Usado inset-0 para cobrir toda a tela */}
                    <div className="bg-purple-900 border border-purple-200 p-8 rounded-md">
                      <h3 className="text-xl font-bold mb-4">Tempo</h3>
                      <div className="flex flex-col sm:flex-row items-center mb-4"> {/* Flex-col para telas pequenas, flex-row para sm+ */}
                        <div className="flex items-center mb-2 sm:mb-0 sm:mr-4">
                          <label htmlFor="minutos" className="text-white mr-2">Minutos</label>
                          <input
                            id="minutos"
                            type="number"
                            min="0"
                            value={tempoMinutos}
                            onChange={(e) => setTempoMinutos(Math.max(0, +e.target.value))}
                            placeholder="Minutos"
                            className="p-2 border rounded text-black w-20"
                          />
                        </div>
                        <span className="text-white hidden sm:block">:</span> {/* Esconde o ":" em telas muito pequenas */}
                        <div className="flex items-center mt-2 sm:mt-0 sm:ml-4">
                          <label htmlFor="segundos" className="text-white mr-2">Segundos</label>
                          <input
                            id="segundos"
                            type="number"
                            min="0"
                            max="59"
                            value={tempoSegundos}
                            onChange={(e) => setTempoSegundos(Math.max(0, Math.min(59, +e.target.value)))}
                            placeholder="Segundos"
                            className="p-2 border rounded text-black w-20"
                          />
                        </div>
                      </div>
                      <div className="mt-4 flex justify-end"> {/* Botões alinhados à direita */}
                        <button
                          type="button"
                          className="bg-red-500 text-white py-2 px-4 rounded-md mr-2"
                          onClick={() => setMostrarModalTempo(false)}
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          className="bg-green-500 text-white py-2 px-4 rounded-md"
                          onClick={() => setMostrarModalTempo(false)}
                        >
                          Confirmar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="mb-4">
                <label className="block mb-2 text-white">Anexo</label>
                <input
                  type="file"
                  accept="image/*"
                  className="p-2 border rounded w-full text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100" // Estilização para o input file
                  onChange={handleAnexoChange}
                />
                {imageUrl && (
                  <div className="mt-4 relative w-fit mx-auto"> {/* Centraliza a imagem anexa */}
                    <Image
                      src={imageUrl}
                      alt="Imagem anexa"
                      width={200}
                      height={200}
                      className="object-contain border border-purple-400 rounded-md"
                    />
                    <button
                      type="button"
                      className="absolute -top-2 -right-2 text-red-500 bg-white rounded-full p-1" // Botão de remover mais visível
                      onClick={handleRemoveImage}
                    >
                      <XCircle size={24} />
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <button
                  type="button"
                  className="bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 transition duration-300"
                  onClick={handleSalvarQuestao}
                >
                  Salvar Questão
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CriarQuestao;
