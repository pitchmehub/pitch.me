import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import GravanLogo from '../components/GravanLogo'
import './Login.css'

export default function RedefinirSenha() {
  const navigate = useNavigate()

  const [emailUsuario, setEmailUsuario] = useState('')
  const [emailDigitado, setEmailDigitado] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [sessaoOk, setSessaoOk] = useState(null) // null=loading, true=ok, false=link inválido

  useEffect(() => {
    // O Supabase processa o token do link de recovery automaticamente e cria
    // uma sessão. Se a sessão existir, podemos pedir nova senha.
    let cancelado = false

    async function checa() {
      const { data } = await supabase.auth.getSession()
      if (cancelado) return
      const email = data?.session?.user?.email
      if (email) {
        setEmailUsuario(email)
        setSessaoOk(true)
      } else {
        // Pode ainda estar processando o token – escuta o evento
        const sub = supabase.auth.onAuthStateChange((_event, session) => {
          if (session?.user?.email) {
            setEmailUsuario(session.user.email)
            setSessaoOk(true)
            sub.data?.subscription?.unsubscribe?.()
          }
        })
        // dá 2s e desiste
        setTimeout(() => {
          if (!cancelado && sessaoOk === null) setSessaoOk(false)
          sub.data?.subscription?.unsubscribe?.()
        }, 2500)
      }
    }
    checa()
    return () => { cancelado = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function salvar(e) {
    e.preventDefault()
    setErro('')
    if (emailDigitado.trim().toLowerCase() !== emailUsuario.toLowerCase()) {
      setErro('O e-mail digitado não confere com o e-mail desta conta.')
      return
    }
    if (novaSenha.length < 6) {
      setErro('A senha deve ter no mínimo 6 caracteres.')
      return
    }
    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem.')
      return
    }
    setSalvando(true)
    const { error } = await supabase.auth.updateUser({ password: novaSenha })
    if (error) {
      setErro(error.message || 'Não foi possível alterar a senha. Tente novamente.')
      setSalvando(false)
      return
    }
    setSucesso('Senha alterada com sucesso! Você será redirecionado para o login.')
    setSalvando(false)
    setTimeout(async () => {
      await supabase.auth.signOut()
      navigate('/login', { replace: true })
    }, 2500)
  }

  if (sessaoOk === null) {
    return (
      <div className="login-root">
        <div className="login-card" style={{ textAlign: 'center' }}>
          <div className="login-logo"><GravanLogo height={56}/></div>
          <p style={{ color: '#71717A', fontSize: 13 }}>Validando link…</p>
        </div>
      </div>
    )
  }

  if (sessaoOk === false) {
    return (
      <div className="login-root">
        <div className="login-card">
          <div className="login-logo"><GravanLogo height={56}/></div>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>
            Link inválido ou expirado
          </h2>
          <p style={{ fontSize: 13, color: '#71717A', marginBottom: 16, textAlign: 'center' }}>
            Solicite um novo link em <strong>Editar perfil → Trocar senha</strong>.
          </p>
          <button className="login-btn-primary" onClick={() => navigate('/login', { replace: true })}>
            Voltar para login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="login-root">
      <div className="login-card">
        <div className="login-logo"><GravanLogo height={56}/></div>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, textAlign: 'center' }}>
          Redefinir senha
        </h2>
        <p style={{ fontSize: 13, color: '#71717A', marginBottom: 20, textAlign: 'center' }}>
          Confirme o e-mail da sua conta GRAVAN e escolha uma nova senha.
        </p>

        <form onSubmit={salvar} className="login-form">
          <div className="login-field">
            <label>E-mail da plataforma *</label>
            <input
              type="email" required
              value={emailDigitado}
              onChange={e => setEmailDigitado(e.target.value)}
              placeholder="seu@email.com"
              autoComplete="email"
            />
          </div>
          <div className="login-field">
            <label>Nova senha *</label>
            <input
              type="password" required minLength={6}
              value={novaSenha}
              onChange={e => setNovaSenha(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
            />
          </div>
          <div className="login-field">
            <label>Confirmar nova senha *</label>
            <input
              type="password" required minLength={6}
              value={confirmarSenha}
              onChange={e => setConfirmarSenha(e.target.value)}
              placeholder="Repita a nova senha"
              autoComplete="new-password"
            />
          </div>
          {erro && <div className="login-erro">{erro}</div>}
          {sucesso && <div className="login-sucesso">{sucesso}</div>}
          <button type="submit" className="login-btn-primary" disabled={salvando}>
            {salvando ? 'Salvando…' : 'Alterar senha'}
          </button>
        </form>
      </div>
    </div>
  )
}
