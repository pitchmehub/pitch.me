import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { api } from '../lib/api'

const EMAIL_SUPORTE = 'contatogravan@gmail.com'
const MAX_MSG = 1000

export default function FaleConoscoModal({ onClose }) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  async function enviar(e) {
    e.preventDefault()
    setErro(''); setEnviando(true)
    try {
      await api.post('/contato/', {
        nome: nome.trim(),
        email: email.trim().toLowerCase(),
        mensagem: mensagem.trim(),
      })
      setEnviado(true)
      setTimeout(() => onClose(), 2500)
    } catch (e) {
      setErro(e.message)
    } finally { setEnviando(false) }
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px',
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.13)',
    borderRadius: 9, color: '#e8f0f8', fontSize: 14,
    outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
    transition: 'border-color .15s',
  }

  const labelStyle = {
    display: 'block', fontSize: 10, fontWeight: 700, marginBottom: 6,
    color: 'rgba(180,200,225,0.50)',
    letterSpacing: '0.12em', textTransform: 'uppercase',
  }

  const node = (
    <div
      className="gv-modal-bg"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="gv-modal-box" style={{ maxWidth: 500 }}>
        <div className="gv-modal-head">
          <div className="gv-modal-head-info">
            <h2>Fale Conosco</h2>
            <p>Resposta via e-mail em até 48h úteis</p>
          </div>
          <button className="gv-modal-close" onClick={onClose} aria-label="Fechar">×</button>
        </div>

        <div className="gv-modal-body">
          <div style={{
            padding: '10px 14px', borderRadius: 10,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            marginBottom: 20, fontSize: 13,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(180,200,225,0.45)', marginBottom: 4 }}>
              Email da plataforma
            </div>
            <a href={`mailto:${EMAIL_SUPORTE}`} style={{ color: 'rgba(200,215,235,0.85)', textDecoration: 'none', fontWeight: 600 }}>
              {EMAIL_SUPORTE}
            </a>
          </div>

          {enviado ? (
            <div style={{ padding: '24px 0', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>✓</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: '#86efac' }}>Mensagem enviada!</h3>
              <p style={{ color: 'rgba(200,215,235,0.60)', fontSize: 14 }}>
                Em breve entraremos em contato pelo email informado.
              </p>
            </div>
          ) : (
            <form onSubmit={enviar}>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Nome *</label>
                <input
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  required maxLength={120}
                  placeholder="Seu nome"
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required maxLength={200}
                  placeholder="seu@email.com"
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Mensagem *</label>
                <textarea
                  value={mensagem}
                  onChange={e => setMensagem(e.target.value.slice(0, MAX_MSG))}
                  required minLength={10} maxLength={MAX_MSG}
                  placeholder="Descreva seu contato…"
                  rows={5}
                  style={{ ...inputStyle, resize: 'vertical', minHeight: 110 }}
                />
                <div style={{ textAlign: 'right', fontSize: 11, color: 'rgba(180,200,225,0.35)', marginTop: 4 }}>
                  {mensagem.length} / {MAX_MSG}
                </div>
              </div>

              {erro && (
                <div style={{
                  padding: '10px 12px', marginBottom: 14,
                  background: 'rgba(220,38,38,0.15)',
                  border: '1px solid rgba(220,38,38,0.30)',
                  borderRadius: 10, fontSize: 13, color: '#fca5a5',
                }}>{erro}</div>
              )}

              <button
                type="submit" className="gv-btn-primary"
                disabled={enviando}
                style={{ width: '100%', justifyContent: 'center', padding: '13px' }}
              >
                {enviando ? 'Enviando…' : 'Enviar mensagem'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )

  return createPortal(node, document.body)
}
