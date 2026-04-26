import React, { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { api } from '../lib/api'

function fmt(cents) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
    .format((cents ?? 0) / 100)
}

/**
 * Modal para criar uma oferta (intérprete -> compositor) ou contraproposta
 * (compositor -> intérprete).
 *
 * Props:
 *  - obra: { id, nome, preco_cents, titular_pro? }
 *  - onClose: () => void
 *  - onCriada: (oferta) => void
 *  - modo?: 'oferta' | 'contraproposta' (default 'oferta')
 *  - ofertaOriginal?: oferta — necessária quando modo === 'contraproposta'
 */
export default function OfertaModal({
  obra, onClose, onCriada,
  modo = 'oferta', ofertaOriginal = null,
}) {
  const preco = obra?.preco_cents || 0
  const piso = useMemo(() => Math.ceil(preco * 0.5), [preco])
  const titularPro = !!(obra?.titular_pro ?? obra?.titular?.is_pro)

  const [tipo, setTipo] = useState(
    ofertaOriginal?.tipo || 'padrao'
  )
  const valorInicial = ofertaOriginal
    ? ofertaOriginal.valor_cents
    : Math.round(preco * 0.7)
  const [valorReais, setValorReais] = useState(String((valorInicial / 100).toFixed(0)))
  const [mensagem, setMensagem] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')

  const valorCents = Math.round(Number(valorReais.replace(',', '.')) * 100) || 0
  const minimoEfetivo = tipo === 'exclusividade' ? preco : piso

  const podeEnviar = valorCents >= minimoEfetivo && valorCents <= preco * 5

  async function enviar() {
    setEnviando(true)
    setErro('')
    try {
      let resp
      if (modo === 'contraproposta' && ofertaOriginal) {
        resp = await api.post(
          `/catalogo/ofertas/${ofertaOriginal.id}/contra-propor`,
          { valor_cents: valorCents, mensagem: mensagem || undefined }
        )
      } else {
        resp = await api.post(
          `/catalogo/${obra.id}/ofertas`,
          {
            valor_cents: valorCents,
            tipo,
            mensagem: mensagem || undefined,
          }
        )
      }
      onCriada?.(resp)
      onClose()
    } catch (e) {
      setErro(e.message || 'Falha ao enviar oferta.')
    } finally {
      setEnviando(false)
    }
  }

  return createPortal(
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)',
        backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: 1000, padding: 16,
      }}
    >
      <div style={{
        background: '#fff', borderRadius: 14, width: '100%', maxWidth: 480,
        padding: 24, boxShadow: '0 12px 40px rgba(0,0,0,.25)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>
            {modo === 'contraproposta' ? 'Fazer contraproposta' : 'Fazer oferta'}
          </h2>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#666',
          }}>×</button>
        </div>
        <p style={{ color: '#666', fontSize: 13, marginBottom: 18 }}>
          Obra: <b>{obra.nome}</b> · valor de catálogo {fmt(preco)}
        </p>

        {/* Tipo: padrão | exclusividade — só na oferta inicial */}
        {modo === 'oferta' && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={() => setTipo('padrao')}
                style={{
                  flex: 1, padding: '10px 12px', borderRadius: 8,
                  border: `2px solid ${tipo === 'padrao' ? '#2563eb' : '#e5e7eb'}`,
                  background: tipo === 'padrao' ? '#eff6ff' : '#fff',
                  cursor: 'pointer', fontWeight: 600, fontSize: 13,
                }}
              >
                Licença padrão
                <div style={{ fontSize: 11, fontWeight: 400, color: '#666', marginTop: 2 }}>
                  Mínimo: {fmt(piso)}
                </div>
              </button>
              <button
                type="button"
                disabled={!titularPro}
                title={!titularPro ? 'Disponível apenas para obras de compositores PRO.' : ''}
                onClick={() => titularPro && setTipo('exclusividade')}
                style={{
                  flex: 1, padding: '10px 12px', borderRadius: 8,
                  border: `2px solid ${tipo === 'exclusividade' ? '#7c3aed' : '#e5e7eb'}`,
                  background: tipo === 'exclusividade' ? '#f5f3ff' : '#fff',
                  cursor: titularPro ? 'pointer' : 'not-allowed',
                  opacity: titularPro ? 1 : 0.5,
                  fontWeight: 600, fontSize: 13,
                }}
              >
                Exclusividade (5 anos)
                <div style={{ fontSize: 11, fontWeight: 400, color: '#666', marginTop: 2 }}>
                  Mínimo: {fmt(preco)}
                </div>
              </button>
            </div>
            {tipo === 'exclusividade' && (
              <div style={{
                marginTop: 10, fontSize: 12, color: '#5b21b6',
                background: '#f5f3ff', borderRadius: 8, padding: '8px 12px',
              }}>
                <b>Exclusividade:</b> ao aceitar, esta obra deixa de ser licenciável
                a terceiros pelos próximos 5 anos. Pague o valor cheio para garantir.
              </div>
            )}
          </div>
        )}

        <label style={{ fontSize: 12, fontWeight: 600, color: '#444', display: 'block', marginBottom: 4 }}>
          Seu valor (R$)
        </label>
        <input
          type="number"
          min={Math.ceil(minimoEfetivo / 100)}
          step="1"
          value={valorReais}
          onChange={e => { setValorReais(e.target.value); setErro('') }}
          style={{
            width: '100%', padding: '11px 14px', borderRadius: 8,
            border: '1px solid #d1d5db', fontSize: 16, fontWeight: 600,
          }}
        />
        <div style={{ fontSize: 12, color: valorCents < minimoEfetivo ? '#dc2626' : '#666', marginTop: 6 }}>
          {valorCents < minimoEfetivo
            ? `Mínimo permitido: ${fmt(minimoEfetivo)}.`
            : `Equivale a ${fmt(valorCents)} (${preco ? Math.round((valorCents/preco)*100) : 0}% do valor cheio).`}
        </div>

        <label style={{ fontSize: 12, fontWeight: 600, color: '#444', display: 'block', marginTop: 14, marginBottom: 4 }}>
          Mensagem (opcional)
        </label>
        <textarea
          value={mensagem}
          onChange={e => setMensagem(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Conte ao compositor por que você quer essa obra…"
          style={{
            width: '100%', padding: '10px 12px', borderRadius: 8,
            border: '1px solid #d1d5db', fontSize: 13, resize: 'vertical',
          }}
        />

        {erro && (
          <div style={{
            marginTop: 12, padding: '8px 12px', borderRadius: 8,
            background: '#fef2f2', color: '#991b1b', fontSize: 13,
          }}>
            {erro}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 18 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '11px 14px', borderRadius: 8,
              background: '#f3f4f6', border: 'none', cursor: 'pointer', fontWeight: 600,
            }}
          >
            Cancelar
          </button>
          <button
            onClick={enviar}
            disabled={!podeEnviar || enviando}
            style={{
              flex: 2, padding: '11px 14px', borderRadius: 8,
              background: podeEnviar ? '#0C447C' : '#9ca3af',
              color: '#fff', border: 'none',
              cursor: podeEnviar && !enviando ? 'pointer' : 'not-allowed',
              fontWeight: 700,
            }}
          >
            {enviando ? 'Enviando…'
              : modo === 'contraproposta'
                ? `Enviar contraproposta · ${fmt(valorCents)}`
                : `Fazer oferta · ${fmt(valorCents)}`}
          </button>
        </div>
        <p style={{ fontSize: 11, color: '#888', marginTop: 12, textAlign: 'center' }}>
          O compositor tem 48h para responder. Se aceitar, você paga o valor da oferta.
        </p>
      </div>
    </div>,
    document.body
  )
}
