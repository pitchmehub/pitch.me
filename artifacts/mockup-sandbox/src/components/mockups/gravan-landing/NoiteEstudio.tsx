import React from 'react';
import { 
  Play, 
  Shield, 
  BarChart, 
  DollarSign, 
  ArrowRight, 
  Check, 
  Music, 
  Mic, 
  Headphones,
  Award,
  Star
} from 'lucide-react';

export function NoiteEstudio() {
  return (
    <div className="min-h-screen bg-[#0D0D0D] text-[#E0E0E0] font-body selection:bg-[#C9A84C] selection:text-black overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        .font-display { font-family: 'Space Grotesk', sans-serif; }
        .font-body { font-family: 'DM Sans', sans-serif; }
        .glass-panel { 
          background: rgba(255, 255, 255, 0.02); 
          backdrop-filter: blur(16px); 
          border: 1px solid rgba(201, 168, 76, 0.15); 
        }
        .glass-panel-hover:hover {
          border-color: rgba(201, 168, 76, 0.4);
          background: rgba(255, 255, 255, 0.04);
          transform: translateY(-4px);
        }
        .gold-gradient-text { 
          background: linear-gradient(135deg, #FDF5A9 0%, #D4AF37 50%, #A67C00 100%); 
          -webkit-background-clip: text; 
          -webkit-text-fill-color: transparent; 
        }
        .gold-glow { 
          box-shadow: 0 0 40px rgba(212, 175, 55, 0.15); 
        }
        .btn-gold {
          background: linear-gradient(135deg, #D4AF37 0%, #B5952F 100%);
          color: #000;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(212, 175, 55, 0.2);
        }
        .btn-gold:hover {
          background: linear-gradient(135deg, #E6C24A 0%, #C4A43D 100%);
          box-shadow: 0 6px 25px rgba(212, 175, 55, 0.4);
          transform: translateY(-2px);
        }
        .btn-secondary {
          background: #0A192F;
          color: #64FFDA;
          border: 1px solid rgba(100, 255, 218, 0.2);
          transition: all 0.3s ease;
        }
        .btn-secondary:hover {
          background: #112240;
          border-color: rgba(100, 255, 218, 0.5);
          box-shadow: 0 0 15px rgba(100, 255, 218, 0.1);
        }
        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201, 168, 76, 0.3), transparent);
        }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-panel border-b-0 border-t-0 border-r-0 border-l-0 border-b border-b-[rgba(201,168,76,0.1)]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#FDF5A9] flex items-center justify-center">
              <Music className="w-4 h-4 text-black" />
            </div>
            <span className="font-display font-bold text-2xl tracking-wider text-white">GRAVAN</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#como-funciona" className="text-sm font-medium text-gray-400 hover:text-[#D4AF37] transition-colors uppercase tracking-widest">Como funciona</a>
            <a href="#precos" className="text-sm font-medium text-gray-400 hover:text-[#D4AF37] transition-colors uppercase tracking-widest">Preços</a>
            <a href="#catalogo" className="text-sm font-medium text-gray-400 hover:text-[#D4AF37] transition-colors uppercase tracking-widest">Catálogo</a>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-sm font-medium text-white hover:text-[#D4AF37] transition-colors hidden sm:block">Login</button>
            <button className="btn-gold px-6 py-2.5 rounded text-sm font-bold uppercase tracking-wider">Cadastrar</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden min-h-screen flex items-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/__mockup/images/studio-night-hero.png" 
            alt="Recording Studio" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-[#0D0D0D] via-transparent to-[#0D0D0D]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 mb-8">
              <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse"></span>
              <span className="text-xs font-medium text-[#D4AF37] uppercase tracking-widest">O Padrão Ouro em Licenciamento</span>
            </div>
            
            <h1 className="font-display text-5xl md:text-7xl font-bold leading-tight mb-6 tracking-tight">
              A trilha sonora da sua próxima <span className="gold-gradient-text italic font-serif">obra-prima.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl font-light leading-relaxed">
              O marketplace exclusivo onde compositores de elite encontram produtores exigentes. 
              Licenciamento autoral descomplicado, seguro e com a qualidade que sua produção merece.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5">
              <button className="btn-gold px-8 py-4 rounded font-bold uppercase tracking-widest flex items-center justify-center gap-3">
                Explorar Catálogo <ArrowRight className="w-5 h-5" />
              </button>
              <button className="glass-panel px-8 py-4 rounded font-bold uppercase tracking-widest text-white hover:bg-white/5 transition-colors">
                Sou Compositor
              </button>
            </div>

            <div className="mt-16 grid grid-cols-2 md:grid-cols-3 gap-8 pt-8 border-t border-[rgba(201,168,76,0.2)]">
              <div>
                <p className="font-display text-4xl font-bold text-white mb-1">10k+</p>
                <p className="text-sm text-[#D4AF37] uppercase tracking-wider">Obras Exclusivas</p>
              </div>
              <div>
                <p className="font-display text-4xl font-bold text-white mb-1">2.5k</p>
                <p className="text-sm text-[#D4AF37] uppercase tracking-wider">Compositores Verificados</p>
              </div>
              <div className="hidden md:block">
                <p className="font-display text-4xl font-bold text-white mb-1">R$ 5M+</p>
                <p className="text-sm text-[#D4AF37] uppercase tracking-wider">Pagos aos Criadores</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="divider"></div>

      {/* Como Funciona */}
      <section id="como-funciona" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-20">
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4 tracking-tight">Duas vias. <span className="gold-gradient-text italic font-serif">Um compasso.</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">Nosso ecossistema foi desenhado para maximizar o valor de ambos os lados da mesa de som.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 lg:gap-24">
            {/* Compositores */}
            <div className="glass-panel p-10 md:p-12 rounded-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37] opacity-5 rounded-full blur-3xl -mr-20 -mt-20 transition-opacity group-hover:opacity-10"></div>
              
              <div className="w-14 h-14 rounded-full bg-[#1A1A1A] border border-[#D4AF37]/30 flex items-center justify-center mb-8">
                <Mic className="w-6 h-6 text-[#D4AF37]" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-8 text-white">Para Compositores</h3>
              
              <div className="space-y-8">
                <div className="flex gap-4">
                  <span className="font-display text-[#D4AF37] font-bold text-xl">01</span>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-2">Upload e Precificação</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">Suba suas obras, defina seus próprios preços ou utilize nosso algoritmo de sugestão baseado no mercado.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="font-display text-[#D4AF37] font-bold text-xl">02</span>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-2">Exposição Premium</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">Sua música é apresentada para os maiores players da indústria, agências e produtoras verificadas.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="font-display text-[#D4AF37] font-bold text-xl">03</span>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-2">Monetização Segura</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">Receba 75% de cada licença vendida, com repasse direto e transparente para sua conta bancária.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Compradores */}
            <div className="glass-panel p-10 md:p-12 rounded-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#64FFDA] opacity-5 rounded-full blur-3xl -mr-20 -mt-20 transition-opacity group-hover:opacity-10"></div>
              
              <div className="w-14 h-14 rounded-full bg-[#1A1A1A] border border-[#64FFDA]/30 flex items-center justify-center mb-8">
                <Headphones className="w-6 h-6 text-[#64FFDA]" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-8 text-white">Para Compradores</h3>
              
              <div className="space-y-8">
                <div className="flex gap-4">
                  <span className="font-display text-[#64FFDA] font-bold text-xl">01</span>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-2">Busca Inteligente</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">Encontre a trilha perfeita através de filtros precisos por BPM, gênero, mood ou instrumentação.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="font-display text-[#64FFDA] font-bold text-xl">02</span>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-2">Licenciamento Instantâneo</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">Esqueça a burocracia. Contratos gerados automaticamente, validados juridicamente no momento do checkout.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="font-display text-[#64FFDA] font-bold text-xl">03</span>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-2">Download Stems</h4>
                    <p className="text-gray-400 text-sm leading-relaxed">Acesso imediato aos arquivos master em alta qualidade e, quando disponíveis, às faixas abertas (stems).</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Manifesto / Quote */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[#0A0A0A]"></div>
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#D4AF37] opacity-5 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
          <Award className="w-12 h-12 text-[#D4AF37] mx-auto mb-10 opacity-80" />
          <h2 className="font-display text-3xl md:text-6xl font-light leading-tight text-white mb-10">
            "A música não é apenas um adorno para a imagem. Ela é a <span className="gold-gradient-text italic font-serif font-bold">alma invisível</span> que dita o que o público deve sentir."
          </h2>
          <p className="text-[#D4AF37] uppercase tracking-[0.3em] text-sm font-bold">O Manifesto Gravan</p>
        </div>
      </section>

      {/* Recursos / Features */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4 tracking-tight">O Estúdio <span className="text-white">Virtual</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">Ferramentas de nível profissional para gerenciar seu negócio musical.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="glass-panel glass-panel-hover p-8 rounded-lg transition-all duration-300">
              <Shield className="w-8 h-8 text-[#D4AF37] mb-6" />
              <h3 className="text-xl font-bold text-white mb-3">Proteção Contratual</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Contratos blindados gerados dinamicamente para cada transação, assegurando direitos patrimoniais e morais.</p>
            </div>
            
            <div className="glass-panel glass-panel-hover p-8 rounded-lg transition-all duration-300">
              <BarChart className="w-8 h-8 text-[#D4AF37] mb-6" />
              <h3 className="text-xl font-bold text-white mb-3">Analytics Profundo</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Métricas detalhadas de plays, saves, buscas e conversões para entender o que o mercado procura.</p>
            </div>
            
            <div className="glass-panel glass-panel-hover p-8 rounded-lg transition-all duration-300">
              <DollarSign className="w-8 h-8 text-[#D4AF37] mb-6" />
              <h3 className="text-xl font-bold text-white mb-3">Precificação Dinâmica</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Controle absoluto sobre os valores das licenças exclusivas e não-exclusivas do seu catálogo.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precos" className="py-24 bg-[#0A0A0A] relative border-t border-[rgba(201,168,76,0.1)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-4 tracking-tight">Acesso <span className="gold-gradient-text italic font-serif">Exclusivo</span></h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">Escolha o passe que melhor se adapta ao momento da sua carreira.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Tier */}
            <div className="glass-panel p-10 rounded-xl flex flex-col">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">Standard</h3>
                <p className="text-gray-400 text-sm mb-6">Para compositores iniciando sua jornada de licenciamento.</p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-display font-bold text-white">R$ 0</span>
                  <span className="text-gray-500 mb-1">/mês</span>
                </div>
              </div>
              
              <ul className="space-y-4 mb-10 flex-grow">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-gray-400 mt-0.5" />
                  <span className="text-gray-300 text-sm">Upload ilimitado de obras</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-gray-400 mt-0.5" />
                  <span className="text-gray-300 text-sm">Taxa de plataforma: 25%</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-gray-400 mt-0.5" />
                  <span className="text-gray-300 text-sm">Perfil público padrão</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-gray-400 mt-0.5" />
                  <span className="text-gray-300 text-sm">Geração de contratos básicos</span>
                </li>
              </ul>
              
              <button className="w-full py-4 rounded border border-gray-600 text-white font-bold uppercase tracking-widest hover:bg-white/5 transition-colors">
                Criar Conta Grátis
              </button>
            </div>

            {/* Pro Tier */}
            <div className="relative p-[1px] rounded-xl bg-gradient-to-b from-[#D4AF37] to-[rgba(212,175,55,0.1)] gold-glow">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#D4AF37] text-black text-xs font-bold uppercase tracking-widest py-1 px-4 rounded-full">
                Recomendado
              </div>
              <div className="bg-[#111] h-full rounded-xl p-10 flex flex-col">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-[#D4AF37] mb-2 flex items-center gap-2">
                    <Star className="w-5 h-5 fill-[#D4AF37]" /> Gravan PRO
                  </h3>
                  <p className="text-gray-400 text-sm mb-6">Para profissionais que geram volume de negócios.</p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-display font-bold text-white">R$ 49</span>
                    <span className="text-gray-500 mb-1">/mês</span>
                  </div>
                </div>
                
                <ul className="space-y-4 mb-10 flex-grow">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#D4AF37] mt-0.5" />
                    <span className="text-gray-300 text-sm font-medium">Todos os recursos do Standard</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#D4AF37] mt-0.5" />
                    <span className="text-white text-sm font-medium">Envio de Propostas Diretas a clientes</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#D4AF37] mt-0.5" />
                    <span className="text-white text-sm font-medium">Dashboard de Analytics Avançado</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-[#D4AF37] mt-0.5" />
                    <span className="text-white text-sm font-medium">Destaque nas buscas de compradores</span>
                  </li>
                </ul>
                
                <button className="w-full btn-gold py-4 rounded font-bold uppercase tracking-widest">
                  Assinar PRO
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#050505] pt-20 pb-10 border-t border-[rgba(201,168,76,0.1)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#FDF5A9] flex items-center justify-center">
                  <Music className="w-3 h-3 text-black" />
                </div>
                <span className="font-display font-bold tracking-wider text-white">GRAVAN</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                Elevando o padrão do licenciamento musical no Brasil. A ponte definitiva entre o talento e o mercado.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 tracking-wide">Plataforma</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-500 hover:text-[#D4AF37] text-sm transition-colors">Catálogo</a></li>
                <li><a href="#" className="text-gray-500 hover:text-[#D4AF37] text-sm transition-colors">Para Compositores</a></li>
                <li><a href="#" className="text-gray-500 hover:text-[#D4AF37] text-sm transition-colors">Para Compradores</a></li>
                <li><a href="#" className="text-gray-500 hover:text-[#D4AF37] text-sm transition-colors">Preços</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 tracking-wide">Suporte</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-500 hover:text-[#D4AF37] text-sm transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="text-gray-500 hover:text-[#D4AF37] text-sm transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="text-gray-500 hover:text-[#D4AF37] text-sm transition-colors">Privacidade</a></li>
                <li><a href="#" className="text-gray-500 hover:text-[#D4AF37] text-sm transition-colors">Contato</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6 tracking-wide">Siga</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-500 hover:text-[#D4AF37] text-sm transition-colors">Instagram</a></li>
                <li><a href="#" className="text-gray-500 hover:text-[#D4AF37] text-sm transition-colors">LinkedIn</a></li>
                <li><a href="#" className="text-gray-500 hover:text-[#D4AF37] text-sm transition-colors">Twitter</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-[rgba(255,255,255,0.05)] flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-600 text-xs">
              &copy; {new Date().getFullYear()} Gravan. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
              <span className="text-gray-600 text-xs uppercase tracking-widest">Sistemas Operacionais</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
