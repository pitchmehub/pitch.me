import React from 'react';
import { Play, Music, Shield, BarChart3, Tag, Heart, Users, CheckCircle2, ArrowRight } from 'lucide-react';
import './_group.css';

export function CalorBrasileiro() {
  return (
    <div className="min-h-screen font-dm-sans bg-[#fef3c7] text-[#431407] relative overflow-hidden">
      {/* Noise overlay */}
      <div className="fixed inset-0 bg-texture-noise mix-blend-multiply z-50"></div>

      {/* Nav */}
      <nav className="fixed w-full z-40 bg-[#fef3c7]/90 backdrop-blur-md border-b-2 border-[#431407]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#ea580c] rounded-full flex items-center justify-center border-2 border-[#431407]">
              <Music className="text-[#fef3c7]" size={20} />
            </div>
            <span className="font-fraunces font-bold text-2xl tracking-tight">GRAVAN</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 font-medium">
            <a href="#como-funciona" className="hover:text-[#ea580c] transition-colors">Como Funciona</a>
            <a href="#recursos" className="hover:text-[#ea580c] transition-colors">Recursos</a>
            <a href="#precos" className="hover:text-[#ea580c] transition-colors">Preços</a>
            <a href="#catalogo" className="hover:text-[#ea580c] transition-colors">Catálogo</a>
          </div>

          <div className="flex items-center gap-4">
            <button className="font-bold hover:text-[#ea580c] transition-colors">Entrar</button>
            <button className="btn-primary px-6 py-2 font-bold rounded-full">
              Cadastrar
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 relative z-10">
            <div className="inline-block bg-[#fbbf24] border-2 border-[#431407] px-4 py-1 rounded-full font-bold text-sm transform -rotate-2">
              A trilha sonora do Brasil 🇧🇷
            </div>
            <h1 className="font-fraunces text-5xl lg:text-7xl font-black leading-[1.1] text-[#431407]">
              Sua música tem <span className="text-[#ea580c]">valor</span>. Nós damos o palco.
            </h1>
            <p className="text-xl md:text-2xl text-[#431407]/80 font-medium max-w-xl">
              O maior marketplace do Brasil conectando compositores apaixonados com criadores que precisam de música autêntica.
            </p>
            
            <div className="flex flex-wrap gap-4 pt-4">
              <button className="btn-primary px-8 py-4 font-bold rounded-full text-lg flex items-center gap-2">
                Começar Agora <ArrowRight size={20} />
              </button>
              <button className="btn-secondary px-8 py-4 font-bold rounded-full text-lg flex items-center gap-2 bg-[#fef3c7]">
                <Play size={20} fill="currentColor" /> Ver Catálogo
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8 border-t-2 border-[#431407]/20">
              <div>
                <div className="font-fraunces text-3xl font-black text-[#ea580c]">50k+</div>
                <div className="font-medium text-sm mt-1">Obras Originais</div>
              </div>
              <div>
                <div className="font-fraunces text-3xl font-black text-[#ea580c]">12k+</div>
                <div className="font-medium text-sm mt-1">Compositores</div>
              </div>
              <div>
                <div className="font-fraunces text-3xl font-black text-[#ea580c]">R$ 2M+</div>
                <div className="font-medium text-sm mt-1">Pagos aos criadores</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-[#ea580c] translate-x-4 translate-y-4 rounded-3xl border-2 border-[#431407]"></div>
            <img 
              src="/__mockup/images/calor-hero.png" 
              alt="Músicos brasileiros tocando" 
              className="relative z-10 w-full h-[600px] object-cover rounded-3xl border-2 border-[#431407]"
            />
            
            <div className="absolute -bottom-6 -left-6 z-20 bg-[#fef3c7] p-4 rounded-xl border-2 border-[#431407] card-shadow-warm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500 rounded-full border-2 border-[#431407] flex items-center justify-center">
                  <CheckCircle2 className="text-white" />
                </div>
                <div>
                  <div className="font-bold">Licença Vendida!</div>
                  <div className="text-sm">R$ 1.500 garantidos.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section id="como-funciona" className="py-24 bg-[#ea580c] text-[#fef3c7] border-y-4 border-[#431407] relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-fraunces text-4xl lg:text-5xl font-black mb-4">Como a mágica acontece</h2>
            <p className="text-xl max-w-2xl mx-auto opacity-90">Uma ponte direta entre quem cria e quem precisa de música de verdade.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 lg:gap-24">
            {/* Compositor */}
            <div className="bg-[#431407] p-8 md:p-12 rounded-3xl border-2 border-[#fef3c7] relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Music size={120} />
              </div>
              <h3 className="font-fraunces text-3xl font-bold mb-8 text-[#fbbf24] flex items-center gap-3">
                Para Compositores
              </h3>
              <div className="space-y-8 relative z-10">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#fbbf24] text-[#431407] font-black flex items-center justify-center shrink-0 border-2 border-[#fef3c7]">1</div>
                  <div>
                    <h4 className="font-bold text-xl mb-2">Suba suas obras</h4>
                    <p className="opacity-80">Cadastre suas músicas, defina os gêneros, moods e crie seu portfólio profissional.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#fbbf24] text-[#431407] font-black flex items-center justify-center shrink-0 border-2 border-[#fef3c7]">2</div>
                  <div>
                    <h4 className="font-bold text-xl mb-2">Defina seu preço</h4>
                    <p className="opacity-80">Você no controle. Ajuste valores ou use nossa precificação inteligente.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#fbbf24] text-[#431407] font-black flex items-center justify-center shrink-0 border-2 border-[#fef3c7]">3</div>
                  <div>
                    <h4 className="font-bold text-xl mb-2">Receba com segurança</h4>
                    <p className="opacity-80">Apenas 25% de taxa. Você fica com a maior parte e tem proteção contratual automática.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Comprador */}
            <div className="bg-[#fef3c7] text-[#431407] p-8 md:p-12 rounded-3xl border-2 border-[#431407] relative overflow-hidden card-shadow-warm">
               <div className="absolute top-0 right-0 p-8 opacity-10">
                <Play size={120} />
              </div>
              <h3 className="font-fraunces text-3xl font-bold mb-8 text-[#ea580c] flex items-center gap-3">
                Para Compradores
              </h3>
              <div className="space-y-8 relative z-10">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#ea580c] text-[#fef3c7] font-black flex items-center justify-center shrink-0 border-2 border-[#431407]">1</div>
                  <div>
                    <h4 className="font-bold text-xl mb-2">Explore o catálogo</h4>
                    <p className="opacity-80">Busque por estilo, clima, instrumento ou andamento. Ache a trilha perfeita.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#ea580c] text-[#fef3c7] font-black flex items-center justify-center shrink-0 border-2 border-[#431407]">2</div>
                  <div>
                    <h4 className="font-bold text-xl mb-2">Negocie e Licencie</h4>
                    <p className="opacity-80">Compre direto ou faça uma proposta para o compositor. Tudo na plataforma.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#ea580c] text-[#fef3c7] font-black flex items-center justify-center shrink-0 border-2 border-[#431407]">3</div>
                  <div>
                    <h4 className="font-bold text-xl mb-2">Baixe e Use</h4>
                    <p className="opacity-80">Arquivos em alta qualidade e contrato gerado instantaneamente. Zero dor de cabeça.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recursos */}
      <section id="recursos" className="py-24 bg-[#fbbf24] border-b-4 border-[#431407]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-fraunces text-4xl lg:text-5xl font-black mb-4">Tudo que você precisa</h2>
            <p className="text-xl max-w-2xl mx-auto text-[#431407]/80">Foque na arte, nós cuidamos da burocracia.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-[#fef3c7] p-8 rounded-2xl card-shadow-warm">
              <div className="w-14 h-14 bg-[#ea580c] rounded-xl border-2 border-[#431407] flex items-center justify-center mb-6">
                <Shield className="text-[#fef3c7]" size={28} />
              </div>
              <h3 className="font-fraunces font-bold text-2xl mb-3">Proteção Contratual</h3>
              <p className="text-[#431407]/80 leading-relaxed">Contratos gerados automaticamente com validade jurídica para cada licenciamento feito.</p>
            </div>
            
            <div className="bg-[#fef3c7] p-8 rounded-2xl card-shadow-warm">
              <div className="w-14 h-14 bg-[#ea580c] rounded-xl border-2 border-[#431407] flex items-center justify-center mb-6">
                <BarChart3 className="text-[#fef3c7]" size={28} />
              </div>
              <h3 className="font-fraunces font-bold text-2xl mb-3">Analytics Detalhado</h3>
              <p className="text-[#431407]/80 leading-relaxed">Acompanhe visualizações, plays e faturamento em tempo real com gráficos intuitivos.</p>
            </div>

            <div className="bg-[#fef3c7] p-8 rounded-2xl card-shadow-warm">
              <div className="w-14 h-14 bg-[#ea580c] rounded-xl border-2 border-[#431407] flex items-center justify-center mb-6">
                <Tag className="text-[#fef3c7]" size={28} />
              </div>
              <h3 className="font-fraunces font-bold text-2xl mb-3">Precificação Dinâmica</h3>
              <p className="text-[#431407]/80 leading-relaxed">Liberdade para definir seus valores ou receber propostas diretas de compradores interessados.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Manifesto */}
      <section className="py-32 bg-[#431407] text-[#fef3c7] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#ea580c] via-transparent to-transparent"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <Heart className="mx-auto text-[#ea580c] mb-8" size={48} />
          <blockquote className="font-fraunces text-3xl md:text-5xl font-bold leading-tight mb-8 text-[#fbbf24]">
            "A música brasileira é rica, plural e intensa. Merece uma plataforma que entenda o seu valor e a leve para o mundo com respeito e transparência."
          </blockquote>
          <div className="text-xl font-medium tracking-wide text-[#ea580c] uppercase">Manifesto Gravan</div>
        </div>
      </section>

      {/* Preços */}
      <section id="precos" className="py-24 bg-[#fef3c7]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-fraunces text-4xl lg:text-5xl font-black mb-4">Feito para o seu ritmo</h2>
            <p className="text-xl max-w-2xl mx-auto text-[#431407]/80">Escolha o plano ideal para a sua carreira.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free */}
            <div className="bg-white p-8 md:p-12 rounded-3xl border-2 border-[#431407] card-shadow-warm">
              <div className="inline-block bg-[#fef3c7] border-2 border-[#431407] px-4 py-1 rounded-full font-bold text-sm mb-6">
                ESSENCIAL
              </div>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="font-fraunces text-5xl font-black">R$ 0</span>
                <span className="text-[#431407]/60 font-bold">/mês</span>
              </div>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="text-[#ea580c]" size={20} />
                  <span className="font-medium">Obras ilimitadas</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="text-[#ea580c]" size={20} />
                  <span className="font-medium">Venda com contratos automáticos</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="text-[#ea580c]" size={20} />
                  <span className="font-medium">Suporte padrão</span>
                </li>
              </ul>
              <button className="w-full btn-secondary py-4 font-bold rounded-full text-lg border-2 border-[#431407]">
                Criar Conta Grátis
              </button>
            </div>

            {/* Pro */}
            <div className="bg-[#ea580c] text-[#fef3c7] p-8 md:p-12 rounded-3xl border-2 border-[#431407] relative transform md:-translate-y-4">
              <div className="absolute -top-4 right-8 bg-[#fbbf24] text-[#431407] border-2 border-[#431407] px-4 py-1 rounded-full font-bold text-sm transform rotate-3">
                Mais Popular
              </div>
              <div className="inline-block bg-[#431407] border-2 border-[#fef3c7] px-4 py-1 rounded-full font-bold text-sm mb-6">
                PROFISSIONAL
              </div>
              <div className="flex items-baseline gap-2 mb-8 text-[#fef3c7]">
                <span className="font-fraunces text-5xl font-black">R$ 49</span>
                <span className="opacity-80 font-bold">/mês</span>
              </div>
              <ul className="space-y-4 mb-10">
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="text-[#fbbf24]" size={20} />
                  <span className="font-medium text-[#fef3c7]">Tudo do Essencial</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="text-[#fbbf24]" size={20} />
                  <span className="font-medium text-[#fef3c7]">Receber e negociar propostas</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="text-[#fbbf24]" size={20} />
                  <span className="font-medium text-[#fef3c7]">Analytics avançado de acessos</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle2 className="text-[#fbbf24]" size={20} />
                  <span className="font-medium text-[#fef3c7]">Destaque nos resultados de busca</span>
                </li>
              </ul>
              <button className="w-full bg-[#fbbf24] text-[#431407] py-4 font-bold rounded-full text-lg border-2 border-[#431407] hover:bg-white transition-colors">
                Assinar PRO
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#431407] text-[#fef3c7] py-16 border-t-4 border-[#ea580c]">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-[#ea580c] rounded-full flex items-center justify-center border-2 border-[#fef3c7]">
                <Music className="text-[#fef3c7]" size={20} />
              </div>
              <span className="font-fraunces font-bold text-2xl tracking-tight">GRAVAN</span>
            </div>
            <p className="opacity-80 max-w-sm mb-6">
              O marketplace que celebra e rentabiliza a verdadeira música brasileira. Do Brasil para o mundo.
            </p>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full border-2 border-[#fef3c7]/20 flex items-center justify-center hover:bg-[#ea580c] hover:border-[#ea580c] transition-colors cursor-pointer">
                <Music size={18} />
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-[#fef3c7]/20 flex items-center justify-center hover:bg-[#ea580c] hover:border-[#ea580c] transition-colors cursor-pointer">
                <Users size={18} />
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-6 text-[#fbbf24]">Plataforma</h4>
            <ul className="space-y-4 opacity-80">
              <li><a href="#" className="hover:text-[#ea580c] transition-colors">Catálogo</a></li>
              <li><a href="#" className="hover:text-[#ea580c] transition-colors">Compositores</a></li>
              <li><a href="#" className="hover:text-[#ea580c] transition-colors">Preços</a></li>
              <li><a href="#" className="hover:text-[#ea580c] transition-colors">Como Funciona</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6 text-[#fbbf24]">Legal</h4>
            <ul className="space-y-4 opacity-80">
              <li><a href="#" className="hover:text-[#ea580c] transition-colors">Termos de Uso</a></li>
              <li><a href="#" className="hover:text-[#ea580c] transition-colors">Privacidade</a></li>
              <li><a href="#" className="hover:text-[#ea580c] transition-colors">Licenças</a></li>
              <li><a href="#" className="hover:text-[#ea580c] transition-colors">Contato</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-[#fef3c7]/10 text-center opacity-60 text-sm">
          &copy; {new Date().getFullYear()} Gravan. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
}
