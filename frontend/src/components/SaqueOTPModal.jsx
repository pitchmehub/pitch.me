import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { api } from '../lib/api'

function fmt(cents) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
    .format((cents ?? 0) / 100)
}

export default function SaqueOTPModal({ meta, onClose, onConfirmado }) {
  const [codigo, setCodigo]       = useState('')
  const [erro, setErro]           = useState('')
  const [enviando, setEnviando]   = useState(false)
  const [reenviando, setReenv]    = useState(false)
  const [restante, setRestante]   = useState(meta.expira_em_segundos || 600)
  const [saqueId, setSaqueId]     = useState(meta.saque_id)
  const [emailMask, setEmail]     = useState(meta.email_destino_mascarado)
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  useEffect(() => {
    if (restante <= 0) return
    const t = setInterval(() => setRestante(r => Math.max(0, r - 1)), 1000)
    return () => clearInterval(t)
  }, [restante])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  function fmtTempo(s) {
    const m = Math.floor(s / 60), ss = s % 60
    return `${m}:${ss.toString().padStart(2, '0')}`
  }

  async function confirmar(e) {
    e?.preventDefault()
    setErro(''); setEnviando(true)
    try {
      if (!/^\d{6}$/.test(codigo)) throw new Error('Digite os 6 dígitos do código.')
      const r = await api.post(`/saques/${saqueId}/confirmar`, { codigo })
      onConfirmado(r)
    } catch (e) {
      setErro(e.message ?? 'Código inválido.')
    } finally { setEnviando(false) }
  }

  async function reenviar() {
    setErro(''); setReenv(true)
    try {
      const r = await api.post(`/saques/${saqueId}/reenviar-otp`, {})
      setSaqueId(r.saque_id)
      setEmail(r.email_destino_mascarado)
      setRestante(r.expira_em_segundos)
      setCodigo('')
      inputRef.current?.focus()
    } catch (e) {
      setErro(e.message ?? 'Não foi possível reenviar.')
    } finally { setReenv(false) }
  }

  async function cancelar() {
    if (!confirm('Cancelar esta solicitação? Você poderá iniciar outra a qualquer momento.')) return
    try {
      await api.post(`/saques/${saqueId}/cancelar`, { motivo: 'Cancelado no modal de OTP' })
    } catch { }
    onClose()
  }

  const node = (
    <div
      className="gv-modal-bg"
      role="dialog" aria-modal="true" aria-labelledby="otp-titulo"
      onClick={onClose}
    >
      <div
        className="gv-modal-box"
        style={{ maxWidth: 420, padding: 28, display: 'block' }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <h2 id="otp-titulo" style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, color: '#fff' }}>
              Confirme seu saque
            </h2>
            <p style={{ fontSize: 13, color: 'rgba(200,215,235,0.65)', margin: 0 }}>
              Enviamos um código para <strong style={{ color: 'rgba(200,215,235,0.9)' }}>{emailMask}</strong>
            </p>
            <p style={{ fontSize: 13, color: 'rgba(200,215,235,0.65)', margin: '2px 0 0' }}>
              Valor: <strong style={{ color: '#86efac' }}>{fmt(meta.valor_cents)}</strong>
            </p>
          </div>
          <button className="gv-modal-close" onClick={onClose} aria-label="Fechar">×</button>
        </div>

        <form onSubmit={confirmar}>
          <input
            ref={inputRef}
            type="text" inputMode="numeric" autoComplete="one-time-code"
            maxLength={6} pattern="\d{6}"
            value={codigo}
            onChange={e => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            data-testid="saque-otp-input"
            style={{
              width: '100%', padding: '16px 12px', fontSize: 28, textAlign: 'center',
              letterSpacing: 12, fontFamily: 'monospace', fontWeight: 700,
              border: '2px solid rgba(55,138,221,0.40)', borderRadius: 12, marginBottom: 10,
              color: '#a8d4ff', background: 'rgba(255,255,255,0.06)',
              boxSizing: 'border-box', outline: 'none',
              transition: 'border-color .15s',
            }}
          />

          <div style={{
            fontSize: 12,
            color: restante > 60 ? 'rgba(200,215,235,0.50)' : '#fca5a5',
            textAlign: 'center', marginBottom: 14,
          }}>
            {restante > 0
              ? <>Código expira em <strong>{fmtTempo(restante)}</strong></>
              : 'Código expirado — peça reenvio.'}
          </div>

          {erro && (
            <div style={{
              padding: '10px 12px',
              background: 'rgba(220,38,38,0.15)',
              border: '1px solid rgba(220,38,38,0.30)',
              color: '#fca5a5',
              borderRadius: 10, fontSize: 13, marginBottom: 12, textAlign: 'center',
            }}>{erro}</div>
          )}

          <button
            type="submit" className="gv-btn-primary"
            disabled={enviando || codigo.length !== 6 || restante === 0}
            data-testid="saque-otp-confirmar"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {enviando ? 'Confirmando…' : '✓ Confirmar saque'}
          </button>
        </form>

        <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'space-between' }}>
          <button
            className="gv-btn-ghost"
            disabled={reenviando}
            onClick={reenviar}
            style={{ fontSize: 12 }}
          >
            {reenviando ? 'Reenviando…' : 'Não recebi — reenviar'}
          </button>
          <button
            className="gv-btn-ghost"
            onClick={cancelar}
            style={{ fontSize: 12, color: '#fca5a5', borderColor: 'rgba(220,38,38,0.25)' }}
          >
            Cancelar
          </button>
        </div>

        <p style={{ fontSize: 11, color: 'rgba(180,200,225,0.40)', marginTop: 16, lineHeight: 1.5 }}>
          Seu saque só é efetivado <strong style={{ color: 'rgba(180,200,225,0.65)' }}>24h após a confirmação</strong>.
          Durante esse tempo, você pode cancelar pelo link enviado ao seu e-mail.
        </p>
      </div>
    </div>
  )

  return createPortal(node, document.body)
}
