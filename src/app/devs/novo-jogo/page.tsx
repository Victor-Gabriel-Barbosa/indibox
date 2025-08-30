'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { Header, Footer, Icons, Breadcrumb, SeletorArquivo, SeletorScreenshots } from '@/components';
import { useRouter } from 'next/navigation';
import { insertJogo } from '@/lib/database';
import { uploadLote, formatarBytes } from '@/lib/storage';
import type { } from '@/types';
import Link from 'next/link';
import { GENEROS_DISPONIVEIS, PLATAFORMAS_DISPONIVEIS } from '@/lib/dadosJogos';

// Página para adicionar um novo jogo
export default function NovoJogoPage() {
  const { usuario, loading } = useAuth();
  const router = useRouter();
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progressoUpload, setProgressoUpload] = useState(0);
  
  // Dados do formulário
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    descricao_curta: '',
    desenvolvedor: '',
    data_lancamento: '',
    genero: [] as string[],
    tags: '',
    url_site: '',
    url_github: '',
    plataforma: [] as string[],
    status: 'rascunho' as const
  });

  // Arquivos selecionados pelo usuário
  const [arquivosSelecionados, setArquivosSelecionados] = useState({
    arquivoJogo: null as File | null,
    imagemCapa: null as File | null,
    screenshots: [] as File[]
  });

  // Atualiza campos do formulário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Gerencia seleção de gêneros
  const handleGeneroChange = (genero: string) => {
    setFormData(prev => ({
      ...prev,
      genero: prev.genero.includes(genero)
        ? prev.genero.filter(g => g !== genero)
        : [...prev.genero, genero]
    }));
  };

  // Gerencia seleção de plataformas
  const handlePlataformaChange = (plataforma: string) => {
    setFormData(prev => ({
      ...prev,
      plataforma: prev.plataforma.includes(plataforma)
        ? prev.plataforma.filter(p => p !== plataforma)
        : [...prev.plataforma, plataforma]
    }));
  };

  // Seleciona arquivo do jogo
  const handleArquivoJogoSelecionado = (arquivo: File | null) => {
    setArquivosSelecionados(prev => ({
      ...prev,
      arquivoJogo: arquivo
    }));
  };

  // Seleciona imagem de capa
  const handleImagemCapaSelecionada = (arquivo: File | null) => {
    setArquivosSelecionados(prev => ({
      ...prev,
      imagemCapa: arquivo
    }));
  };

  // Seleciona screenshots
  const handleScreenshotsSelecionadas = (arquivos: File[]) => {
    setArquivosSelecionados(prev => ({
      ...prev,
      screenshots: arquivos
    }));
  };

  // Trata erros de upload
  const handleSeletorError = (mensagem: string) => setError(mensagem);

  // Processa envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Verifica se o usuário está autenticado
    if (!usuario?.id) return;

    // Valida arquivo do jogo
    if (!arquivosSelecionados.arquivoJogo) {
      setError('Por favor, selecione o arquivo do jogo.');
      return;
    }

    // Valida imagem de capa
    if (!arquivosSelecionados.imagemCapa) {
      setError('Por favor, selecione a imagem de capa.');
      return;
    }

    setEnviando(true);
    setError(null);
    setProgressoUpload(0);

    try {
      // Prepara arquivos para upload
      const arquivosParaUpload: {
        arquivo: File;
        tipo: 'jogo' | 'imagem';
        tipoImagem?: 'capa' | 'screenshot';
      }[] = [
        {
          arquivo: arquivosSelecionados.arquivoJogo,
          tipo: 'jogo'
        },
        {
          arquivo: arquivosSelecionados.imagemCapa,
          tipo: 'imagem',
          tipoImagem: 'capa'
        }
      ];

      // Adiciona screenshots
      arquivosSelecionados.screenshots.forEach(screenshot => {
        arquivosParaUpload.push({
          arquivo: screenshot,
          tipo: 'imagem',
          tipoImagem: 'screenshot'
        });
      });

      // Executa upload dos arquivos
      const resultadoUpload = await uploadLote(
        arquivosParaUpload,
        usuario.id,
        setProgressoUpload
      );

      // Verifica se houve erros no upload
      if (!resultadoUpload.sucesso) {
        setError(`Erro no upload: ${resultadoUpload.erros.join(', ')}`);
        return;
      }

      // Processa resultados do upload
      const arquivoJogo = resultadoUpload.resultados[0];
      const imagemCapa = resultadoUpload.resultados[1];
      const screenshots = resultadoUpload.resultados.slice(2);

      // Verifica se os arquivos obrigatórios foram enviados
      if (!arquivoJogo.data || !imagemCapa.data) {
        setError('Erro ao processar uploads dos arquivos obrigatórios.');
        return;
      }

      // Extrai URLs das screenshots
      const screenshotsUrls = screenshots
        .filter(res => res.data)
        .map(res => res.data!.publicUrl);

      // Extrai caminhos das screenshots
      const screenshotsPaths = screenshots
        .filter(res => res.data)
        .map(res => res.data!.path);

      // Monta dados do jogo
      const dadosJogo = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        descricao_curta: formData.descricao_curta,
        desenvolvedor: formData.desenvolvedor,
        data_lancamento: formData.data_lancamento || null,
        genero: formData.genero,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        url_download: arquivoJogo.data.publicUrl,
        url_site: formData.url_site || null,
        url_github: formData.url_github || null,
        imagem_capa: imagemCapa.data.publicUrl,
        capturas_tela: screenshotsUrls,
        tamanho_arquivo: formatarBytes(arquivosSelecionados.arquivoJogo.size),
        plataforma: formData.plataforma,
        status: formData.status,
        id_usuario: usuario.id,
        destaque: false,
        avaliacao: 0,
        contador_download: 0,
        arquivo_jogo_path: arquivoJogo.data.path,
        imagem_capa_path: imagemCapa.data.path,
        capturas_tela_paths: screenshotsPaths
      } as const;

      // Salva no banco de dados
      const { data, error } = await insertJogo(dadosJogo);

      // Verifica se houve erro ao inserir jogo
      if (error) {
        setError('Erro ao publicar o jogo. Tente novamente.');
        console.error('Erro ao inserir jogo:', error);
      } else if (data) router.push('/devs');
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setEnviando(false);
      setProgressoUpload(0);
    }
  };

  // Exibe loading durante carregamento
  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  // Verifica se o usuário está autenticado
  if (!usuario) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <Icons.BsExclamationTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Acesso Restrito</h1>
            <p className="text-xl mb-8 text-gray-600 dark:text-gray-400">
              Você precisa estar logado para publicar jogos.
            </p>
            <Link href="/devs" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors">
              Voltar
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Breadcrumb items={[
            { label: 'Desenvolvedores', href: '/devs' },
            { label: 'Novo Jogo', isActive: true }
          ]} />

          {/* Cabeçalho */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">
              Publicar <span className="text-indigo-600">Novo Jogo</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Compartilhe sua criação com a comunidade indie
            </p>
          </div>

          {/* Formulário principal */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Informações Básicas */}
            <div className="p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Icons.BsInfoCircle className="w-6 h-6 mr-2 text-indigo-600" />
                Informações Básicas
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="titulo" className="block text-sm font-medium mb-2">
                    Título do Jogo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="titulo"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ex: Aventura Espacial"
                  />
                </div>

                <div>
                  <label htmlFor="desenvolvedor" className="block text-sm font-medium mb-2">
                    Nome do Desenvolvedor <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="desenvolvedor"
                    name="desenvolvedor"
                    value={formData.desenvolvedor}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Seu nome ou estúdio"
                  />
                </div>

                <div>
                  <label htmlFor="data_lancamento" className="block text-sm font-medium mb-2">
                    Data de Lançamento
                  </label>
                  <input
                    type="date"
                    id="data_lancamento"
                    name="data_lancamento"
                    value={formData.data_lancamento}
                    onChange={handleInputChange}
                    className="scheme-light dark:scheme-dark w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="descricao_curta" className="block text-sm font-medium mb-2">
                    Descrição Curta
                  </label>
                  <input
                    type="text"
                    id="descricao_curta"
                    name="descricao_curta"
                    value={formData.descricao_curta}
                    onChange={handleInputChange}
                    maxLength={100}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Uma breve descrição do seu jogo (máx. 100 caracteres)"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="descricao" className="block text-sm font-medium mb-2">
                    Descrição Completa
                  </label>
                  <textarea
                    id="descricao"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Descreva seu jogo em detalhes..."
                  />
                </div>
              </div>
            </div>

            {/* Seção de categorização */}
            <div className="p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Icons.BsTags className="w-6 h-6 mr-2 text-indigo-600" />
                Categorização
              </h2>

              <div className="space-y-6">
                <fieldset>
                  <legend className="block text-sm font-medium mb-3">
                    Gêneros <span className="text-red-500">*</span>
                  </legend>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {GENEROS_DISPONIVEIS.map((genero: string) => (
                      <label htmlFor={genero} key={genero} className="flex items-center">
                        <input
                          id={genero}
                          name="genero"
                          type="checkbox"
                          checked={formData.genero.includes(genero)}
                          onChange={() => handleGeneroChange(genero)}
                          className="mr-2"
                        />
                        <span className="text-sm">{genero}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <fieldset>
                  <legend className="block text-sm font-medium mb-3">
                    Plataformas <span className="text-red-500">*</span>
                  </legend>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {PLATAFORMAS_DISPONIVEIS.map((plataforma: string) => (
                      <label htmlFor={plataforma} key={plataforma} className="flex items-center">
                        <input
                          id={plataforma}
                          name="plataforma"
                          type="checkbox"
                          checked={formData.plataforma.includes(plataforma)}
                          onChange={() => handlePlataformaChange(plataforma)}
                          className="mr-2"
                        />
                        <span className="text-sm">{plataforma}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                <div>
                  <label htmlFor="tags" className="block text-sm font-medium mb-2">
                    Tags (separadas por vírgula)
                  </label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="indie, retro, pixel art, multiplayer"
                  />
                </div>
              </div>
            </div>

            {/* Seção de arquivos e links */}
            <div className="p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Icons.BsLink45Deg className="w-6 h-6 mr-2 text-indigo-600" />
                Arquivo do Jogo e Links
              </h2>

              <div className="space-y-6">
                {/* Seletor de arquivo do jogo */}
                <fieldset>
                  <legend className="block text-sm font-medium mb-2">
                    Arquivo do Jogo <span className="text-red-500">*</span>
                  </legend>
                  <SeletorArquivo
                    tipo="jogo"
                    onArquivoSelecionado={handleArquivoJogoSelecionado}
                    onError={handleSeletorError}
                    arquivoAtual={arquivosSelecionados.arquivoJogo}
                    className="mb-4"
                  />
                </fieldset>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="url_site" className="block text-sm font-medium mb-2">
                      Site do Jogo
                    </label>
                    <input
                      type="url"
                      id="url_site"
                      name="url_site"
                      value={formData.url_site}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label htmlFor="url_github" className="block text-sm font-medium mb-2">
                      Repositório GitHub
                    </label>
                    <input
                      type="url"
                      id="url_github"
                      name="url_github"
                      value={formData.url_github}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="https://github.com/..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Seção de imagens */}
            <div className="p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Icons.BsImage className="w-6 h-6 mr-2 text-indigo-600" />
                Imagens
              </h2>

              <div className="space-y-6">
                {/* Seletor de imagem de capa */}
                <fieldset>
                  <legend className="block text-sm font-medium mb-2">
                    Imagem de Capa <span className="text-red-500">*</span>
                  </legend>
                  <SeletorArquivo
                    tipo="imagem"
                    tipoImagem="capa"
                    onArquivoSelecionado={handleImagemCapaSelecionada}
                    onError={handleSeletorError}
                    arquivoAtual={arquivosSelecionados.imagemCapa}
                    className="mb-2"
                  />
                </fieldset>

                {/* Seletor de screenshots */}
                <fieldset>
                  <legend className="block text-sm font-medium mb-2">
                    Capturas de Tela <span className="text-sm text-gray-500">(opcional)</span>
                  </legend>
                  <SeletorScreenshots
                    onArquivosSelecionados={handleScreenshotsSelecionadas}
                    onError={handleSeletorError}
                    arquivosAtuais={arquivosSelecionados.screenshots}
                    maxArquivos={5}
                    className="mb-2"
                  />
                </fieldset>
              </div>
            </div>

            {/* Configurações de status */}
            <div className="p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <Icons.BsGear className="w-6 h-6 mr-2 text-indigo-600" />
                Configurações
              </h2>

              <div>
                <label htmlFor="status" className="block text-sm font-medium mb-2">
                  Status da Publicação
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-background border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="rascunho">Rascunho (não visível publicamente)</option>
                  <option value="publicado">Publicado (visível para todos)</option>
                </select>
              </div>
            </div>

            {/* Exibição de erros */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg p-4">
                <div className="flex items-center">
                  <Icons.BsExclamationTriangle className="w-5 h-5 text-red-500 mr-2" />
                  <span className="text-red-700 dark:text-red-200">{error}</span>
                </div>
              </div>
            )}

            {/* Botões de ação */}
            <div className="flex flex-col sm:flex-row gap-4 justify-end">
              <Link href="/devs" className="w-full sm:w-auto px-6 py-2 border border-gray-600 rounded-lg text-gray-600 hover:bg-gray-600 hover:text-white transition-colors">
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={enviando || !formData.titulo || !formData.desenvolvedor || formData.genero.length === 0 || formData.plataforma.length === 0 || !arquivosSelecionados.arquivoJogo || !arquivosSelecionados.imagemCapa}
                className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors flex items-center justify-center relative overflow-hidden"
              >
                {enviando && progressoUpload > 0 && (
                  <div 
                    className="absolute left-0 top-0 h-full bg-indigo-400 transition-all duration-300"
                    style={{ width: `${progressoUpload}%` }}
                  />
                )}
                <div className="relative z-10 flex items-center">
                  {enviando ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {progressoUpload > 0 ? `Fazendo Upload... ${Math.round(progressoUpload)}%` : 'Publicando...'}
                    </>
                  ) : (
                    <>
                      <Icons.BsCheck2 className="w-4 h-4 mr-2" />
                      {formData.status === 'rascunho' ? 'Salvar Rascunho' : 'Publicar Jogo'}
                    </>
                  )}
                </div>
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </main>
  );
}