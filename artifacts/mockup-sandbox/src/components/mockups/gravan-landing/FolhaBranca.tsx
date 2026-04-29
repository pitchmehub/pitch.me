import React from 'react';
import { ArrowRight, ArrowUpRight, Check } from 'lucide-react';
import './_group.css'; // Just in case it has some shared utilities, though we'll rely on inline and Tailwind

export function FolhaBranca() {
  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#0A0A0A] selection:bg-[#1A3A2A] selection:text-[#FAFAF8]" style={{ fontFamily: '"Inter", sans-serif' }}>
      
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-10 max-w-7xl mx-auto">
        <div className="text-2xl tracking-tighter" style={{ fontFamily: '"Fraunces", serif', fontWeight: 300 }}>
          GRAVAN.
        </div>
        <div className="hidden md:flex items-center gap-12 text-sm uppercase tracking-widest text-[#0A0A0A]/60">
          <a href="#como-funciona" className="hover:text-[#0A0A0A] transition-colors">Como Funciona</a>
          <a href="#precos" className="hover:text-[#0A0A0A] transition-colors">Preços</a>
          <a href="#catalogo" className="hover:text-[#0A0A0A] transition-colors">Catálogo</a>
        </div>
        <div className="flex items-center gap-6 text-sm uppercase tracking-widest">
          <button className="text-[#0A0A0A]/60 hover:text-[#0A0A0A] transition-colors">Login</button>
          <button className="border border-[#0A0A0A] px-6 py-3 hover:bg-[#0A0A0A] hover:text-[#FAFAF8] transition-colors">
            Cadastrar
          </button>
        </div>
      </nav>

      {/* Hero */}
      <header className="px-8 pt-32 pb-40 max-w-7xl mx-auto flex flex-col items-center text-center">
        <h1 
          className="text-6xl md:text-8xl lg:text-9xl leading-[0.9] tracking-tighter max-w-5xl mb-12 text-[#1A3A2A]" 
          style={{ fontFamily: '"Fraunces", serif', fontWeight: 300 }}
        >
          O valor da obra.
        </h1>
        <p className="text-lg md:text-xl text-[#0A0A0A]/70 max-w-2xl mb-16 font-light leading-relaxed">
          O mercado definitivo de licenciamento musical no Brasil. Conectamos quem cria a quem precisa, com contratos claros e proteção real.
        </p>
        <div className="flex flex-col sm:flex-row gap-8 items-center">
          <button className="group flex items-center gap-4 text-lg border-b border-[#0A0A0A] pb-2 hover:text-[#1A3A2A] hover:border-[#1A3A2A] transition-colors">
            Começar Agora
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-32 mt-40 text-left w-full border-t border-[#0A0A0A]/10 pt-12">
          <div>
            <div className="text-4xl mb-2" style={{ fontFamily: '"Fraunces", serif' }}>15k+</div>
            <div className="text-sm uppercase tracking-widest text-[#0A0A0A]/50">Obras no catálogo</div>
          </div>
          <div>
            <div className="text-4xl mb-2" style={{ fontFamily: '"Fraunces", serif' }}>8k+</div>
            <div className="text-sm uppercase tracking-widest text-[#0A0A0A]/50">Compositores ativos</div>
          </div>
          <div>
            <div className="text-4xl mb-2 text-[#1A3A2A]" style={{ fontFamily: '"Fraunces", serif' }}>R$ 4M</div>
            <div className="text-sm uppercase tracking-widest text-[#0A0A0A]/50">Repassados</div>
          </div>
        </div>
      </header>

      {/* Como Funciona */}
      <section id="como-funciona" className="px-8 py-40 max-w-7xl mx-auto border-t border-[#0A0A0A]/10">
        <h2 className="text-4xl md:text-5xl mb-32 tracking-tighter" style={{ fontFamily: '"Fraunces", serif', fontWeight: 300 }}>
          Como funciona
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-32">
          {/* Compositor */}
          <div>
            <h3 className="text-sm uppercase tracking-widest mb-16 text-[#1A3A2A]">Para Compositores</h3>
            <div className="space-y-16">
              <div className="relative">
                <span className="absolute -left-12 text-[#0A0A0A]/20" style={{ fontFamily: '"Fraunces", serif' }}>01</span>
                <h4 className="text-2xl mb-4" style={{ fontFamily: '"Fraunces", serif' }}>Suba seu catálogo</h4>
                <p className="text-[#0A0A0A]/60 font-light leading-relaxed">Cadastre suas obras com metadados completos. Você define os preços ou usa nossa sugestão baseada no mercado.</p>
              </div>
              <div className="relative">
                <span className="absolute -left-12 text-[#0A0A0A]/20" style={{ fontFamily: '"Fraunces", serif' }}>02</span>
                <h4 className="text-2xl mb-4" style={{ fontFamily: '"Fraunces", serif' }}>Aprove propostas</h4>
                <p className="text-[#0A0A0A]/60 font-light leading-relaxed">Receba solicitações de uso. Analise o projeto, os termos e aprove com um clique. O contrato é gerado automaticamente.</p>
              </div>
              <div className="relative">
                <span className="absolute -left-12 text-[#0A0A0A]/20" style={{ fontFamily: '"Fraunces", serif' }}>03</span>
                <h4 className="text-2xl mb-4" style={{ fontFamily: '"Fraunces", serif' }}>Receba seus royalties</h4>
                <p className="text-[#0A0A0A]/60 font-light leading-relaxed">A plataforma retém 25% e você recebe 75% direto na sua conta bancária, com total transparência e relatórios fiscais.</p>
              </div>
            </div>
          </div>

          {/* Comprador */}
          <div>
            <h3 className="text-sm uppercase tracking-widest mb-16 text-[#0A0A0A]/50">Para Compradores</h3>
            <div className="space-y-16">
              <div className="relative">
                <span className="absolute -left-12 text-[#0A0A0A]/20" style={{ fontFamily: '"Fraunces", serif' }}>01</span>
                <h4 className="text-2xl mb-4" style={{ fontFamily: '"Fraunces", serif' }}>Encontre a obra certa</h4>
                <p className="text-[#0A0A0A]/60 font-light leading-relaxed">Busque no maior catálogo de música autoral do Brasil. Filtre por gênero, mood, andamento e compositor.</p>
              </div>
              <div className="relative">
                <span className="absolute -left-12 text-[#0A0A0A]/20" style={{ fontFamily: '"Fraunces", serif' }}>02</span>
                <h4 className="text-2xl mb-4" style={{ fontFamily: '"Fraunces", serif' }}>Envie a proposta</h4>
                <p className="text-[#0A0A0A]/60 font-light leading-relaxed">Diga como a música será usada (TV, Web, Cinema), o prazo e o território. O preço é calculado na hora.</p>
              </div>
              <div className="relative">
                <span className="absolute -left-12 text-[#0A0A0A]/20" style={{ fontFamily: '"Fraunces", serif' }}>03</span>
                <h4 className="text-2xl mb-4" style={{ fontFamily: '"Fraunces", serif' }}>Licença garantida</h4>
                <p className="text-[#0A0A0A]/60 font-light leading-relaxed">Pagamento feito, contrato assinado digitalmente e arquivo em alta qualidade liberado. Sem burocracia.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recursos */}
      <section className="px-8 py-40 max-w-7xl mx-auto border-t border-[#0A0A0A]/10">
        <h2 className="text-4xl md:text-5xl mb-32 tracking-tighter" style={{ fontFamily: '"Fraunces", serif', fontWeight: 300 }}>
          Ferramentas projetadas<br />para a tranquilidade.
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-16 gap-y-24">
          <div>
            <h3 className="text-2xl mb-6" style={{ fontFamily: '"Fraunces", serif' }}>Proteção Contratual</h3>
            <p className="text-[#0A0A0A]/60 font-light leading-relaxed">Contratos com validade jurídica gerados automaticamente a cada transação. Segurança para ambas as partes, sem custos com advogados.</p>
          </div>
          <div>
            <h3 className="text-2xl mb-6" style={{ fontFamily: '"Fraunces", serif' }}>Analytics Detalhado</h3>
            <p className="text-[#0A0A0A]/60 font-light leading-relaxed">Entenda quem está buscando suas músicas, quais obras convertem mais e receba insights de precificação do mercado.</p>
          </div>
          <div>
            <h3 className="text-2xl mb-6" style={{ fontFamily: '"Fraunces", serif' }}>Precificação Dinâmica</h3>
            <p className="text-[#0A0A0A]/60 font-light leading-relaxed">Nossa calculadora cruza tipo de mídia, território e tempo de uso para sugerir o preço justo de licenciamento instantaneamente.</p>
          </div>
          <div>
            <h3 className="text-2xl mb-6" style={{ fontFamily: '"Fraunces", serif' }}>Split Automático</h3>
            <p className="text-[#0A0A0A]/60 font-light leading-relaxed">Obra com múltiplos autores? A plataforma divide o pagamento e os repasses automaticamente conforme a porcentagem de cada um.</p>
          </div>
          <div>
            <h3 className="text-2xl mb-6" style={{ fontFamily: '"Fraunces", serif' }}>Vitrine Personalizada</h3>
            <p className="text-[#0A0A0A]/60 font-light leading-relaxed">Sua própria página dentro da plataforma, com URL amigável, biografia e discografia organizada para enviar a clientes.</p>
          </div>
          <div>
            <h3 className="text-2xl mb-6" style={{ fontFamily: '"Fraunces", serif' }}>Suporte Especializado</h3>
            <p className="text-[#0A0A0A]/60 font-light leading-relaxed">Uma equipe de especialistas em direitos autorais pronta para mediar negociações complexas e dúvidas jurídicas.</p>
          </div>
        </div>
      </section>

      {/* Manifesto */}
      <section className="bg-[#1A3A2A] text-[#FAFAF8] py-40 px-8">
        <div className="max-w-5xl mx-auto">
          <p className="text-4xl md:text-6xl leading-[1.2] tracking-tight font-light" style={{ fontFamily: '"Fraunces", serif' }}>
            "Acreditamos que a música tem um valor inegociável. Nossa missão é criar o espaço onde a criatividade é respeitada, devolvendo o controle aos criadores e a tranquilidade aos compradores."
          </p>
          <div className="mt-16 text-sm uppercase tracking-widest text-[#FAFAF8]/60">
            Manifesto Gravan
          </div>
        </div>
      </section>

      {/* Preços */}
      <section id="precos" className="px-8 py-40 max-w-7xl mx-auto border-b border-[#0A0A0A]/10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-32 gap-8">
          <h2 className="text-4xl md:text-5xl tracking-tighter" style={{ fontFamily: '"Fraunces", serif', fontWeight: 300 }}>
            Simplicidade no acesso.
          </h2>
          <p className="text-[#0A0A0A]/60 font-light max-w-sm">
            Para quem está começando e para quem vive de música.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Free */}
          <div className="border border-[#0A0A0A]/20 p-12 hover:border-[#0A0A0A] transition-colors flex flex-col h-full">
            <h3 className="text-sm uppercase tracking-widest mb-4 text-[#0A0A0A]/60">Essencial</h3>
            <div className="mb-12">
              <span className="text-6xl" style={{ fontFamily: '"Fraunces", serif' }}>Gratuito</span>
            </div>
            
            <ul className="space-y-6 mb-16 flex-grow font-light text-[#0A0A0A]/80">
              <li className="flex items-center gap-4">
                <Check className="w-5 h-5 text-[#0A0A0A]/30" />
                Upload ilimitado de obras
              </li>
              <li className="flex items-center gap-4">
                <Check className="w-5 h-5 text-[#0A0A0A]/30" />
                Perfil público simples
              </li>
              <li className="flex items-center gap-4">
                <Check className="w-5 h-5 text-[#0A0A0A]/30" />
                Contratos automáticos padrão
              </li>
              <li className="flex items-center gap-4">
                <Check className="w-5 h-5 text-[#0A0A0A]/30" />
                Taxa de 25% por licenciamento
              </li>
            </ul>
            
            <button className="w-full border border-[#0A0A0A] py-4 hover:bg-[#0A0A0A] hover:text-[#FAFAF8] transition-colors">
              Criar Conta Gratuita
            </button>
          </div>

          {/* Pro */}
          <div className="border border-[#1A3A2A] bg-[#1A3A2A] text-[#FAFAF8] p-12 flex flex-col h-full relative">
            <h3 className="text-sm uppercase tracking-widest mb-4 text-[#FAFAF8]/60">Profissional</h3>
            <div className="mb-12">
              <span className="text-6xl" style={{ fontFamily: '"Fraunces", serif' }}>R$ 49</span>
              <span className="text-[#FAFAF8]/60 font-light ml-2">/mês</span>
            </div>
            
            <ul className="space-y-6 mb-16 flex-grow font-light text-[#FAFAF8]/80">
              <li className="flex items-center gap-4">
                <Check className="w-5 h-5 text-[#FAFAF8]/40" />
                Todas as ferramentas do Essencial
              </li>
              <li className="flex items-center gap-4">
                <Check className="w-5 h-5 text-[#FAFAF8]/40" />
                Destaque no algoritmo de busca
              </li>
              <li className="flex items-center gap-4">
                <Check className="w-5 h-5 text-[#FAFAF8]/40" />
                Analytics avançado e insights
              </li>
              <li className="flex items-center gap-4">
                <Check className="w-5 h-5 text-[#FAFAF8]/40" />
                Propostas ativas para compradores
              </li>
            </ul>
            
            <button className="w-full bg-[#FAFAF8] text-[#1A3A2A] py-4 hover:bg-transparent hover:text-[#FAFAF8] border border-[#FAFAF8] transition-colors">
              Assinar Profissional
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-20 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-16">
        <div>
          <div className="text-2xl tracking-tighter mb-8" style={{ fontFamily: '"Fraunces", serif', fontWeight: 300 }}>
            GRAVAN.
          </div>
          <p className="text-sm text-[#0A0A0A]/50 font-light max-w-xs">
            O marketplace brasileiro de licenciamento musical.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-16 text-sm font-light">
          <div className="flex flex-col gap-4">
            <span className="uppercase tracking-widest text-[#0A0A0A]/40 mb-2">Plataforma</span>
            <a href="#" className="hover:text-[#1A3A2A] transition-colors">Catálogo</a>
            <a href="#" className="hover:text-[#1A3A2A] transition-colors">Para Compositores</a>
            <a href="#" className="hover:text-[#1A3A2A] transition-colors">Para Compradores</a>
            <a href="#" className="hover:text-[#1A3A2A] transition-colors">Preços</a>
          </div>
          <div className="flex flex-col gap-4">
            <span className="uppercase tracking-widest text-[#0A0A0A]/40 mb-2">Empresa</span>
            <a href="#" className="hover:text-[#1A3A2A] transition-colors">Sobre Nós</a>
            <a href="#" className="hover:text-[#1A3A2A] transition-colors">Manifesto</a>
            <a href="#" className="hover:text-[#1A3A2A] transition-colors">Carreiras</a>
            <a href="#" className="hover:text-[#1A3A2A] transition-colors">Contato</a>
          </div>
          <div className="flex flex-col gap-4">
            <span className="uppercase tracking-widest text-[#0A0A0A]/40 mb-2">Legal</span>
            <a href="#" className="hover:text-[#1A3A2A] transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-[#1A3A2A] transition-colors">Privacidade</a>
            <a href="#" className="hover:text-[#1A3A2A] transition-colors">Contratos</a>
          </div>
        </div>
      </footer>

      <div className="px-8 py-8 border-t border-[#0A0A0A]/10 text-center text-xs text-[#0A0A0A]/40 font-light uppercase tracking-widest">
        &copy; {new Date().getFullYear()} Gravan. Todos os direitos reservados.
      </div>

    </div>
  );
}
