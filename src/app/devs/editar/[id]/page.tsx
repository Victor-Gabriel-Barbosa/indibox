'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { Header, Footer, Icons, Breadcrumb, DotLottieReact, SeletorArquivo, SeletorScreenshots } from '@/components';
import { useRouter, useParams } from 'next/navigation';
import { getJogoPorId, updateJogo } from '@/lib/database';
import { uploadLote, formatarBytes } from '@/lib/storage';
import type { Jogo, JogoUpdate } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { GENEROS_DISPONIVEIS, PLATAFORMAS_DISPONIVEIS } from '@/lib/dadosJogos';

export default function EditarJogoPage() {
  const { usuario, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const idJogo = params.id as string;
  
  const [jogo, setJogo] = useState<Jogo | null>(null);
  const [loadingJogo, setLoadingJogo] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progressoUpload, setProgressoUpload] = useState(0);
  
  // Arquivos selecionados pelo usuário
  const [arquivosSelecionados, setArquivosSelecionados] = useState({
    arquivoJogo: null as File | null,
    imagemCapa: null as File | null,
    screenshots: [] as File[]
  });

  // Dados do formulário
  const [formData, setFormData] = useState({ 
    titulo: '',
    descricao: '',
    descricao_curta: '',
    desenvolvedor: '',
    data_lancamento: '',
    genero: [] as string[],
    tags: '',
    url_download: '',
    url_site: '',
    url_github: '',
    imagem_capa: '',
    capturas_tela: '',
    plataforma: [] as string[],
    status: 'rascunho' as 'rascunho' | 'publicado' | 'arquivado'
  });

  // Carrega e valida dados do jogo
  useEffect(() => {
    async function carregarJogo() {
      if (!idJogo) return;

      try {
        setLoadingJogo(true);
        const { data, error } = await getJogoPorId(idJogo);
        
        if (error || !data) {
          setError('Jogo não encontrado');
          return;
        }

        // Verifica permissão do usuário
        if (usuario?.id && data.id_usuario !== usuario.id) {
          setError('Você não tem permissão para editar este jogo');
          return;
        }

        setJogo(data);
        
        // Preenche formulário
        setFormData({
          titulo: data.titulo || '',
          descricao: data.descricao || '',
          descricao_curta: data.descricao_curta || '',
          desenvolvedor: data.desenvolvedor || '',
          data_lancamento: data.data_lancamento || '',
          genero: data.genero || [],
          tags: data.tags?.join(', ') || '',
          url_download: data.url_download || '',
          url_site: data.url_site || '',
          url_github: data.url_github || '',
          imagem_capa: data.imagem_capa || '',
          capturas_tela: data.capturas_tela?.join(', ') || '',
          plataforma: data.plataforma || [],
          status: (data.status as 'rascunho' | 'publicado' | 'arquivado') || 'rascunho'
        });
      } catch (error) {
        console.error('Erro ao carregar jogo:', error);
        setError('Erro ao carregar dados do jogo');
      } finally {
        setLoadingJogo(false);
      }
    }

    carregarJogo();
  }, [idJogo, usuario?.id]);

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
    if (!usuario?.id || !jogo) return;

    setEnviando(true);
    setError(null);
    setProgressoUpload(0);

    try {
      // Prepara arquivos para upload
      const arquivosParaUpload = [];
      
      if (arquivosSelecionados.arquivoJogo) {
        arquivosParaUpload.push({
          arquivo: arquivosSelecionados.arquivoJogo,
          tipo: 'jogo' as const
        });
      }

      if (arquivosSelecionados.imagemCapa) {
        arquivosParaUpload.push({
          arquivo: arquivosSelecionados.imagemCapa,
          tipo: 'imagem' as const,
          tipoImagem: 'capa' as const
        });
      }

      // Adiciona screenshots
      arquivosSelecionados.screenshots.forEach(screenshot => {
        arquivosParaUpload.push({
          arquivo: screenshot,
          tipo: 'imagem' as const,
          tipoImagem: 'screenshot' as const
        });
      });

      let novoArquivoJogoUrl = formData.url_download;
      let novaImagemCapaUrl = formData.imagem_capa;
      let novasScreenshotsUrls = formData.capturas_tela ? formData.capturas_tela.split(',').map(url => url.trim()) : [];

      // Executa upload de novos arquivos
      if (arquivosParaUpload.length > 0) {
        const resultadoUpload = await uploadLote(
          arquivosParaUpload,
          usuario.id,
          setProgressoUpload
        );

        if (!resultadoUpload.sucesso) {
          setError(`Erro no upload: ${resultadoUpload.erros.join(', ')}`);
          return;
        }

        // Atualiza URLs dos arquivos
        let indiceResultado = 0;
        
        if (arquivosSelecionados.arquivoJogo) {
          const result = resultadoUpload.resultados[indiceResultado++];
          if (result.data) novoArquivoJogoUrl = result.data.publicUrl;
        }
        
        if (arquivosSelecionados.imagemCapa) {
          const result = resultadoUpload.resultados[indiceResultado++];
          if (result.data) novaImagemCapaUrl = result.data.publicUrl;
        }

        if (arquivosSelecionados.screenshots.length > 0) {
          const screenshotsResults = resultadoUpload.resultados.slice(indiceResultado);
          const novasScreenshots = screenshotsResults
            .filter(result => result.data)
            .map(result => result.data!.publicUrl);
          
          // Substitui screenshots existentes
          novasScreenshotsUrls = novasScreenshots;
        }
      }

      // Monta dados de atualização
      const dadosAtualizacao: JogoUpdate = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        descricao_curta: formData.descricao_curta,
        desenvolvedor: formData.desenvolvedor,
        data_lancamento: formData.data_lancamento || null,
        genero: formData.genero,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [],
        url_download: novoArquivoJogoUrl || null,
        url_site: formData.url_site || null,
        url_github: formData.url_github || null,
        imagem_capa: novaImagemCapaUrl || null,
        capturas_tela: novasScreenshotsUrls,
        tamanho_arquivo: arquivosSelecionados.arquivoJogo 
          ? formatarBytes(arquivosSelecionados.arquivoJogo.size)
          : jogo?.tamanho_arquivo || null,
        plataforma: formData.plataforma,
        status: formData.status
      };

      // Salva no banco de dados
      const { data, error } = await updateJogo(jogo.id, dadosAtualizacao);

      if (error) {
        setError('Erro ao atualizar o jogo. Tente novamente.');
        console.error('Erro ao atualizar jogo:', error);
      } else if (data) router.push('/devs/meus-jogos');
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  // Exibe loading durante carregamento
  if (loading || loadingJogo) {
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

  // Verifica autenticação
  if (!usuario) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <div className="mx-auto max-w-2xl">
              <DotLottieReact src={"/assets/error.lottie"} loop autoplay />
            </div>
            <h1 className="text-3xl font-bold mb-4">Acesso Restrito</h1>
            <p className="text-xl mb-8 text-gray-600 dark:text-gray-400">
              Você precisa estar logado para editar jogos.
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

  // Exibe erros de validação
  if (error) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <Icons.BsExclamationTriangle className="w-16 h-16 text-red-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Erro</h1>
            <p className="text-xl mb-8 text-gray-600 dark:text-gray-400">
              {error}
            </p>
            <Link href="/devs/meus-jogos" className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors">
              Voltar aos Meus Jogos
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
            { label: 'Meus Jogos', href: '/devs/meus-jogos' },
            { label: `Editar ${jogo?.titulo || 'Jogo'}`, isActive: true }
          ]} />

          {/* Cabeçalho */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">
              Editar <span className="text-indigo-600">{jogo?.titulo}</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Atualize as informações do seu jogo
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                      <label key={genero} htmlFor={`genero-${genero.toLowerCase().replace(/\s+/g, '-')}`} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`genero-${genero.toLowerCase().replace(/\s+/g, '-')}`}
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
                      <label key={plataforma} htmlFor={`plataforma-${plataforma.toLowerCase().replace(/\s+/g, '-')}`} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`plataforma-${plataforma.toLowerCase().replace(/\s+/g, '-')}`}
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
                <Icons.BsCloudUpload className="w-6 h-6 mr-2 text-indigo-600" />
                Arquivos e Links
              </h2>

              <div className="space-y-6">
                {/* Seletor de arquivo do jogo */}
                <fieldset>
                  <legend className="block text-sm font-medium mb-2">
                    Arquivo do Jogo
                  </legend>
                  <SeletorArquivo
                    tipo="jogo"
                    onArquivoSelecionado={handleArquivoJogoSelecionado}
                    onError={handleSeletorError}
                    arquivoAtual={arquivosSelecionados.arquivoJogo}
                    className="mb-2"
                  />
                  {formData.url_download && !arquivosSelecionados.arquivoJogo && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      📁 Arquivo atual: <a href={formData.url_download} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Download</a>
                      {jogo?.tamanho_arquivo && (
                        <>
                          <br />
                          📏 Tamanho: {jogo.tamanho_arquivo}
                        </>
                      )}
                      <br />
                      <span className="text-xs">Selecione um novo arquivo para substituir</span>
                    </div>
                  )}
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
                    Imagem de Capa
                  </legend>
                  <SeletorArquivo
                    tipo="imagem"
                    tipoImagem="capa"
                    onArquivoSelecionado={handleImagemCapaSelecionada}
                    onError={handleSeletorError}
                    arquivoAtual={arquivosSelecionados.imagemCapa}
                    className="mb-2"
                  />
                  {formData.imagem_capa && !arquivosSelecionados.imagemCapa && (
                    <div className="mt-2">
                      <Image 
                        src={formData.imagem_capa} 
                        alt="Capa atual" 
                        width={192}
                        height={128}
                        className="object-cover rounded-lg border"
                      />
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Imagem atual - selecione nova para substituir
                      </p>
                    </div>
                  )}
                  {arquivosSelecionados.imagemCapa && (
                    <div className="mt-2">
                      <Image 
                        src={URL.createObjectURL(arquivosSelecionados.imagemCapa)} 
                        alt="Nova capa" 
                        width={192}
                        height={128}
                        className="object-cover rounded-lg border"
                      />
                      <p className="text-sm text-orange-600 mt-1">
                        ⚠️ Nova imagem substituirá a atual
                      </p>
                    </div>
                  )}
                </fieldset>

                {/* Seletor de screenshots */}
                <fieldset>
                  <legend className="block text-sm font-medium mb-2">
                    Capturas de Tela
                  </legend>
                  <SeletorScreenshots
                    onArquivosSelecionados={handleScreenshotsSelecionadas}
                    onError={handleSeletorError}
                    arquivosAtuais={arquivosSelecionados.screenshots}
                    maxArquivos={5}
                    className="mb-2"
                  />
                  {formData.capturas_tela && arquivosSelecionados.screenshots.length === 0 && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Screenshots atuais:</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {formData.capturas_tela.split(',').filter(url => url.trim()).map((url, index) => (
                          <Image 
                            key={index}
                            src={url.trim()} 
                            alt={`Screenshot ${index + 1}`} 
                            width={200}
                            height={96}
                            className="object-cover rounded-lg border"
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        Selecione novas screenshots para substituir todas as atuais
                      </p>
                    </div>
                  )}
                  {arquivosSelecionados.screenshots.length > 0 && (
                    <p className="text-sm text-orange-600 mt-2">
                      ⚠️ {arquivosSelecionados.screenshots.length} nova(s) screenshot(s) substituirá(ão) as atuais
                    </p>
                  )}
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
                  <option value="arquivado">Arquivado (não visível publicamente)</option>
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
              <Link href="/devs/meus-jogos" className="w-full sm:w-auto px-6 py-2 border border-gray-600 rounded-lg text-gray-600 hover:bg-gray-600 hover:text-white transition-colors">
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={enviando || !formData.titulo || !formData.desenvolvedor || formData.genero.length === 0 || formData.plataforma.length === 0}
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
                      {progressoUpload > 0 ? `Fazendo Upload... ${Math.round(progressoUpload)}%` : 'Salvando...'}
                    </>
                  ) : (
                    <>
                      <Icons.FaCheck className="w-4 h-4 mr-2" />
                      Salvar Alterações
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