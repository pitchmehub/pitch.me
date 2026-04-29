import React from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/modal.css'

/**
 * Modal genérico de upgrade para PRO.
 *
 * Props:
 *   open      – boolean
 *   onClose   – fn()
 *   titulo    – string opcional (default contextual ao preço)
 *   mensagem  – string opcional
 *   ctaLabel  – default "Assinar PRO agora"
 *   contexto  – objeto opcional (ex.: dados da obra que o usuário tentou salvar).
 *               É passado para /planos via state, para a tela poder retomar.
 */
export default function UpgradeProModal({
  open,
  onClose,
  titulo = 'Esta funcionalidade é exclusiva do plano PRO',
  mensagem = 'Assine o plano PRO para enviar e receber propostas de licenciamento, precificar até R$ 10.000 e acessar o analytics completo.',
  ctaLabel = 'Assinar PRO agora',
  contexto,
}) {
  const navigate = useNavigate()
  if (!open) return null

  return (
    <div
      data-testid="upgrade-pro-modal"
      className="gv-modal-bg"
      onClick={onClose}
      style={{ zIndex: 9999 }}
    >
      <div
        className="gv-modal-box"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 420, textAlign: 'center' }}
      >
        <button className="gv-modal-close" onClick={onClose} aria-label="Fechar"
          style={{ position: 'absolute', top: 14, right: 14 }}>×</button>
        <div style={{ padding: '28px 24px 24px' }}>
          <div style={{
            display: 'inline-block', padding: '4px 12px',
            background: 'linear-gradient(135deg, var(--brand-dark), var(--brand))', color: '#fff',
            fontSize: 11, fontWeight: 800, letterSpacing: 1.2, borderRadius: 4,
            marginBottom: 16,
          }}>
            PLANO PRO
          </div>

          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10, lineHeight: 1.3, color: 'var(--text-primary)' }}>
            {titulo}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 22, lineHeight: 1.5 }}>
            {mensagem}
          </p>

          <ul style={{ textAlign: 'left', fontSize: 13, color: 'var(--text-primary)', listStyle: 'none', padding: 0, marginBottom: 22 }}>
            <li style={{ padding: '6px 0' }}>✓ Enviar e receber propostas de licenciamento</li>
            <li style={{ padding: '6px 0' }}>✓ Precificação até R$ 10.000 por obra</li>
            <li style={{ padding: '6px 0' }}>✓ Analytics completo de receita e propostas</li>
            <li style={{ padding: '6px 0' }}>✓ Selo PRO no seu perfil e obras</li>
            <li style={{ padding: '6px 0' }}>✓ Destaque na plataforma</li>
          </ul>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              data-testid="btn-assinar-pro"
              className="btn btn-primary"
              onClick={() => {
                navigate('/planos', { state: contexto ? { contexto } : undefined })
              }}
              style={{ padding: '12px 18px', fontSize: 14, fontWeight: 600 }}
            >
              {ctaLabel}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none', border: 'none', color: 'var(--text-muted)',
                fontSize: 13, cursor: 'pointer', padding: 8,
              }}
            >
              Agora não
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
