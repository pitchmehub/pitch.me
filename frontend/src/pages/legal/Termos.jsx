import React from 'react'
import { LegalLayout, Section, Bullet } from './LegalLayout'

export default function Termos() {
  return (
    <LegalLayout
      eyebrow="Termos de Uso"
      title="A Gravan é um marketplace. As negociações são entre você e a outra parte."
      lastUpdate="Abril de 2026"
      active="/termos"
    >
      <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.7 }}>
        Estes Termos regulam o uso da plataforma <b>GRAVAN</b> (“Plataforma”),
        operada pela GRAVAN TECNOLOGIA E MARKETPLACE LTDA. (“Gravan”, “nós”). Ao
        criar conta, completar seu cadastro ou clicar em <i>“Li e concordo com
        os Termos de Uso”</i>, você (“Usuário”) declara que leu, compreendeu e
        aceita integralmente as condições abaixo.
      </p>

      <div style={{
        background: '#FEF3C7', border: '1px solid #FBBF24', color: '#78350F',
        padding: '14px 16px', borderRadius: 12, fontSize: 13.5, lineHeight: 1.6,
        marginBottom: 32,
      }}>
        <b>Resumo em uma frase:</b> a Gravan é um marketplace de tecnologia que
        conecta partes e fornece a infraestrutura (cadastro, contratos
        eletrônicos, processamento de pagamento via Stripe). <b>Não somos parte
        dos contratos celebrados entre os Usuários</b>, não respondemos por
        obrigações financeiras desses contratos e não temos legitimidade
        passiva em disputas decorrentes deles.
      </div>

      <Section n="1" title="Natureza jurídica: marketplace, não parte do contrato">
        A GRAVAN é um <b>marketplace digital</b> que disponibiliza ferramentas
        para que compositores, intérpretes, editoras e demais agentes do
        mercado musical:
        <ul style={{ marginTop: 10 }}>
          <Bullet>Cadastrem obras musicais e seus respectivos titulares e coautores;</Bullet>
          <Bullet>Negociem entre si licenciamentos, edições e demais relações jurídicas relativas a obras musicais;</Bullet>
          <Bullet>Formalizem essas negociações em contratos eletrônicos celebrados <b>diretamente entre as partes</b>;</Bullet>
          <Bullet>Recebam pagamentos por meio de processador terceirizado (Stripe).</Bullet>
        </ul>
        <p style={{ marginTop: 14 }}>
          Em todos os contratos celebrados na Plataforma, as <b>partes
          contratantes são exclusivamente os Usuários</b> envolvidos
          (compositor, intérprete, editora, comprador, etc.). A Gravan
          <b> não é parte</b> desses contratos, ainda que seu nome e logotipo
          apareçam por questão de identidade visual ou de geração técnica do
          documento. A Gravan figura apenas como <b>provedora da
          infraestrutura</b> (intermediadora tecnológica), sem assumir
          obrigações de natureza autoral, editorial, comercial ou financeira
          decorrentes desses contratos.
        </p>
      </Section>

      <Section n="2" title="Cadastro, veracidade e responsabilidade pelos dados">
        Para usar a Plataforma é necessário criar conta vinculada a um perfil
        (compositor, intérprete, editora ou administrador). O Usuário declara,
        sob as penas da lei, que:
        <ul style={{ marginTop: 10 }}>
          <Bullet>Os dados informados (nome, CPF/CNPJ, RG, endereço, dados bancários, etc.) são verdadeiros, completos e atualizados;</Bullet>
          <Bullet>Possui plena capacidade civil para contratar e operar na Plataforma;</Bullet>
          <Bullet>É responsável exclusivo pela guarda das credenciais de acesso (e-mail e senha) e por todas as ações realizadas em sua conta;</Bullet>
          <Bullet>Manterá a Plataforma indene em caso de fraude, omissão ou inveracidade nos dados que informou.</Bullet>
        </ul>
      </Section>

      <Section n="3" title="Direitos autorais e legitimidade sobre as obras">
        Ao cadastrar uma obra, o Usuário <b>declara e garante</b> que:
        <ul style={{ marginTop: 10 }}>
          <Bullet>É titular dos direitos autorais (letra, melodia, gravação, capa e demais materiais) ou possui autorização expressa de todos os titulares;</Bullet>
          <Bullet>Tem autorização de todos os coautores, intérpretes e detentores de direitos conexos para disponibilizar a obra na Plataforma e celebrar contratos a respeito dela;</Bullet>
          <Bullet>O conteúdo cadastrado não viola direitos de terceiros, marcas, patentes, segredos comerciais ou qualquer outra norma aplicável.</Bullet>
        </ul>
        <p style={{ marginTop: 14 }}>
          A Gravan <b>não verifica titularidade</b> nem realiza juízo
          editorial sobre o conteúdo cadastrado. A responsabilidade por
          eventuais conflitos de autoria, plágio, uso indevido ou qualquer
          violação a direitos de terceiros é <b>exclusiva</b> do Usuário que
          cadastrou ou utilizou a obra. A Plataforma poderá, a seu critério e
          sem necessidade de notificação prévia, suspender obras ou contas
          envolvidas em controvérsia até que a questão seja resolvida entre
          as partes ou pelo Poder Judiciário.
        </p>
      </Section>

      <Section n="4" title="Contratos celebrados na Plataforma">
        Os contratos eletrônicos gerados na Plataforma (licenciamento, edição
        musical, agregação, contratos trilaterais com editoras, ofertas de
        terceiros, etc.) são instrumentos particulares celebrados
        <b> exclusivamente entre os Usuários signatários</b>. As assinaturas
        eletrônicas são registradas com data, hora, IP e demais metadados
        técnicos para fins probatórios, nos termos do art. 10, §2º, da MP
        2.200-2/2001 e da Lei nº 14.063/2020.
        <p style={{ marginTop: 14 }}>
          Cada parte é responsável pela leitura integral do contrato antes de
          assiná-lo. <b>A Gravan não revisa, não chancela e não garante o
          conteúdo, a exequibilidade ou os efeitos jurídicos</b> dos contratos
          celebrados na Plataforma.
        </p>
      </Section>

      <Section n="5" title="Pagamentos e processamento financeiro">
        Os pagamentos realizados na Plataforma são processados pela{' '}
        <b>Stripe Payments do Brasil Instituição de Pagamento Ltda.</b>{' '}
        (“Stripe”), nos termos dos próprios Termos de Serviço da Stripe, aos
        quais o Usuário também adere ao operar na Plataforma.
        <ul style={{ marginTop: 10 }}>
          <Bullet>O <b>valor bruto</b> da venda é cobrado pela Stripe;</Bullet>
          <Bullet>A <b>taxa Gravan</b> (25% sobre o bruto, plataforma única) é repassada à Gravan como remuneração pela infraestrutura;</Bullet>
          <Bullet>A <b>taxa Stripe</b> (variável conforme método de pagamento) é absorvida proporcionalmente pela editora e pelos autores/coautores envolvidos na transação;</Bullet>
          <Bullet>O <b>saldo restante</b> é distribuído entre editora (10%, quando houver) e autores/coautores conforme os percentuais (<i>share_pct</i>) cadastrados na obra.</Bullet>
        </ul>
        <p style={{ marginTop: 14 }}>
          A Gravan <b>não é instituição financeira</b>, não atua como
          escrow/depositário e não retém valores em nome próprio. O fluxo
          financeiro é executado pela Stripe diretamente entre as contas dos
          Usuários (Stripe Connect). A Gravan apenas <b>orquestra
          tecnicamente</b> a divisão (split) conforme as regras acima.
        </p>
      </Section>

      <Section n="6" title="Saldo, saques e Stripe Connect">
        Cada venda gera saldo na carteira do compositor (e da editora vinculada,
        quando aplicável).
        <ul style={{ marginTop: 10 }}>
          <Bullet>O saque exige conta <b>Stripe Connect</b> ativa e verificada em nome do titular do perfil. A relação entre Usuário e Stripe é direta;</Bullet>
          <Bullet>O Usuário pode solicitar quantos saques quiser, com qualquer valor, desde que tenha saldo disponível;</Bullet>
          <Bullet>Cada saque exige confirmação por código de 6 dígitos enviado ao e-mail cadastrado;</Bullet>
          <Bullet>Há janela de segurança de 24 h em que o saque pode ser cancelado pelo próprio Usuário. Após esse prazo, o valor é processado pela Stripe;</Bullet>
          <Bullet>O tempo de crédito final na conta bancária depende exclusivamente do banco/PSP do Usuário e da Stripe.</Bullet>
        </ul>
      </Section>

      <Section n="7" title="Disputas entre Usuários — Gravan não é parte">
        Toda e qualquer controvérsia decorrente de contratos celebrados na
        Plataforma — incluindo, sem limitação, inadimplência, divergência de
        autoria, falha de entrega, vício de obra, rescisão, indenização,
        cobrança de royalties ou de saldos — deve ser tratada{' '}
        <b>diretamente entre as partes contratantes</b>.
        <ul style={{ marginTop: 10 }}>
          <Bullet>A Gravan <b>não tem legitimidade passiva</b> para responder por obrigações assumidas pelas partes em contratos celebrados na Plataforma;</Bullet>
          <Bullet>A Gravan <b>não responde, em qualquer hipótese</b>, por descumprimento contratual, tributos, encargos, danos materiais, morais, lucros cessantes ou qualquer outra obrigação financeira oriunda dos contratos entre Usuários;</Bullet>
          <Bullet>Em eventual demanda judicial ou administrativa em que a Gravan venha a ser indevidamente incluída, o Usuário responsável compromete-se desde já a requerer sua imediata exclusão do polo passivo e a arcar com os custos correspondentes;</Bullet>
          <Bullet>A Gravan poderá, a pedido fundamentado e mediante apresentação de ordem judicial, fornecer registros eletrônicos das assinaturas (data, hora, IP, metadados) para fins probatórios.</Bullet>
        </ul>
      </Section>

      <Section n="8" title="Limitação de responsabilidade">
        Na máxima extensão permitida pela legislação aplicável:
        <ul style={{ marginTop: 10 }}>
          <Bullet>A Plataforma é fornecida “como está” (<i>as is</i>), sem garantias de resultado comercial, sucesso de vendas, valorização de obras ou continuidade de qualquer funcionalidade específica;</Bullet>
          <Bullet>A Gravan <b>não responde</b> por indisponibilidades pontuais de provedores terceiros (Stripe, e-mail, hospedagem, redes de internet, autoridades certificadoras, etc.);</Bullet>
          <Bullet>A Gravan <b>não responde</b> por perda, vazamento ou indisponibilidade de dados causados por força maior, caso fortuito, ataque cibernético externo, falha de provedor terceirizado ou ato de terceiros;</Bullet>
          <Bullet>O Usuário é responsável por manter <b>cópias próprias</b> de suas obras e contratos. As exportações disponíveis na Plataforma (PDF, dossiê) são fornecidas como conveniência, não como obrigação contratual;</Bullet>
          <Bullet>Em qualquer hipótese, a responsabilidade total da Gravan perante o Usuário fica limitada ao valor que o Usuário tenha efetivamente pago à Gravan a título de assinatura ou taxa de plataforma nos 12 meses anteriores ao evento que originou o pleito.</Bullet>
        </ul>
      </Section>

      <Section n="9" title="Planos e taxas de serviço">
        A Gravan oferece dois planos:
        <ul style={{ marginTop: 10 }}>
          <Bullet><b>STARTER</b> — gratuito, com taxa de <b>25% sobre o valor bruto</b> de cada transação realizada na Plataforma.</Bullet>
          <Bullet><b>PRO</b> — assinatura mensal de <b>R$ 49,90</b>, com acesso a propostas de licenciamento direto, precificação até R$ 10.000, painel de analytics e benefícios adicionais descritos na página de Planos. A taxa de plataforma é de <b>25%</b> para todos os planos.</Bullet>
        </ul>
        <p style={{ marginTop: 14 }}>
          O plano PRO é renovado automaticamente pela Stripe a cada ciclo
          mensal. O Usuário pode cancelar a renovação a qualquer momento pela
          página de Planos: os benefícios PRO permanecem ativos até o final do
          ciclo já pago. <b>Não há reembolso proporcional</b> de assinaturas já
          cobradas.
        </p>
      </Section>

      <Section n="10" title="Conduta proibida">
        É expressamente proibido:
        <ul style={{ marginTop: 10 }}>
          <Bullet>Enviar conteúdo ilegal, ofensivo, discriminatório ou de terceiros sem autorização;</Bullet>
          <Bullet>Burlar o sistema de pagamento, intermediação ou taxação (ex.: combinar a venda dentro da Plataforma e fechar fora dela);</Bullet>
          <Bullet>Utilizar a Plataforma para fraude, lavagem de dinheiro, financiamento ilícito ou qualquer atividade contrária à legislação aplicável;</Bullet>
          <Bullet>Tentar acessar dados, contas ou áreas restritas de outros Usuários ou da própria Plataforma;</Bullet>
          <Bullet>Fazer engenharia reversa, raspagem em larga escala (<i>scraping</i>) ou exploração comercial não autorizada da Plataforma.</Bullet>
        </ul>
        <p style={{ marginTop: 14 }}>
          Violações poderão resultar em suspensão ou encerramento imediato da
          conta, sem prejuízo das medidas judiciais cabíveis.
        </p>
      </Section>

      <Section n="11" title="Encerramento de conta">
        Contas podem ser suspensas ou encerradas a qualquer tempo em caso de
        violação destes Termos. O Usuário também pode solicitar o
        encerramento da própria conta a qualquer momento. Saldo eventualmente
        disponível pode ser sacado antes do encerramento, observada a conexão
        ativa com a Stripe Connect. Contratos já celebrados <b>permanecem
        válidos entre as partes</b> mesmo após o encerramento da conta de
        qualquer dos signatários.
      </Section>

      <Section n="12" title="Privacidade e proteção de dados (LGPD)">
        O tratamento de dados pessoais segue a{' '}
        <a href="/privacidade">Política de Privacidade</a> da Plataforma e a
        Lei nº 13.709/2018 (LGPD). Dados sensíveis (CPF, RG, dados bancários)
        são armazenados de forma criptografada e usados apenas para finalidades
        operacionais (geração de contratos, KYC da Stripe, prevenção a fraude
        e cumprimento de obrigações legais).
      </Section>

      <Section n="13" title="Alterações e foro">
        A Gravan poderá atualizar estes Termos a qualquer momento. Mudanças
        relevantes serão comunicadas pela Plataforma ou por e-mail e o uso
        continuado após a comunicação implica aceitação da nova versão. Fica
        eleito o foro da Comarca de São Paulo/SP para dirimir qualquer
        controvérsia entre o Usuário e a Gravan oriunda da relação de uso da
        Plataforma, com expressa renúncia a qualquer outro, por mais
        privilegiado que seja.
      </Section>

      <p style={{
        marginTop: 32, padding: '14px 16px',
        background: 'var(--surface-2, #F8FAFC)',
        border: '1px solid var(--border, #E5E7EB)',
        borderRadius: 10, fontSize: 13, color: 'var(--text-secondary)',
        lineHeight: 1.6,
      }}>
        Ao concluir o cadastro na Plataforma você confirma ter lido e aceito
        integralmente estes Termos de Uso. A versão vigente fica registrada na
        sua conta com data, hora e IP, para fins probatórios.
      </p>
    </LegalLayout>
  )
}
