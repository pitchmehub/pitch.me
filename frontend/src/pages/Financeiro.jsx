import React, { useEffect, useState } from 'react'
import { api } from '../lib/api'

function fmt(cents) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
    .format((cents ?? 0) / 100)
}

function fmtData(iso) {
  if (!iso) return '—'
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('pt-BR')
  } catch { return '—' }
}

export default function Financeiro() {
  const [meses, setMeses] = useState([])
  const [carregandoMeses, setCarregandoMeses] = useState(true)
  const [erro, setErro] = useState('')
  const [selecionado, setSelecionado] = useState(null) // {ano, mes, label}
  const [recibo, setRecibo] = useState(null)
  const [carregandoRecibo, setCarregandoRecibo] = useState(false)
  const [baixando, setBaixando] = useState(false)

  useEffect(() => {
    (async () => {
      setCarregandoMeses(true); setErro('')
      try {
        const r = await api.get('/financeiro/recibos-mensais')
        setMeses(r.itens || [])
        if ((r.itens || []).length > 0) {
          setSelecionado({ ano: r.itens[0].ano, mes: r.itens[0].mes, label: r.itens[0].label })
        }
      } catch (e) {
        setErro(e.message)
      } finally {
        setCarregandoMeses(false)
      }
    })()
  }, [])

  useEffect(() => {
    if (!selecionado) { setRecibo(null); return }
    (async () => {
      setCarregandoRecibo(true)
      try {
        const r = await api.get(`/financeiro/recibo-mensal?ano=${selecionado.ano}&mes=${selecionado.mes}`)
        setRecibo(r)
      } catch (e) {
        setErro(e.message)
        setRecibo(null)
      } finally {
        setCarregandoRecibo(false)
      }
    })()
  }, [selecionado])

  async function baixarPdf() {
    if (!selecionado) return
    setBaixando(true)
    try {
      await api.download(
        `/financeiro/recibo-mensal/pdf?ano=${selecionado.ano}&mes=${selecionado.mes}`,
        `recibo-gravan-${selecionado.ano}-${String(selecionado.mes).padStart(2, '0')}.pdf`,
      )
    } catch (e) {
      setErro(e.message)
    } finally {
      setBaixando(false)
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 1100, margin: '0 auto' }}>
      <header style={{ marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Recibos fiscais mensais</h1>
        <p style={{ marginTop: 6, color: 'var(--muted, #6b7280)', fontSize: 14 }}>
          Documento informativo dos valores creditados na sua carteira pela
          GRAVAN. Útil para a sua escrituração fiscal e emissão de NFS-e.
        </p>
      </header>

      {erro && (
        <div style={{
          background: '#fee2e2', color: '#7f1d1d', padding: 12,
          borderRadius: 8, marginBottom: 12, fontSize: 14,
        }}>
          {erro}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20 }}>
        {/* Lista de meses */}
        <aside style={{
          background: '#fff', border: '1px solid #e5e7eb',
          borderRadius: 10, padding: 12, minHeight: 320,
        }}>
          <h3 style={{ margin: '4px 6px 10px', fontSize: 13, color: '#6b7280', textTransform: 'uppercase' }}>
            Últimos meses
          </h3>
          {carregandoMeses ? (
            <p style={{ padding: 12, fontSize: 14, color: '#6b7280' }}>Carregando…</p>
          ) : meses.length === 0 ? (
            <p style={{ padding: 12, fontSize: 14, color: '#6b7280' }}>
              Você ainda não recebeu créditos na plataforma.
            </p>
          ) : (
            <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {meses.map(m => {
                const ativo = selecionado && selecionado.ano === m.ano && selecionado.mes === m.mes
                return (
                  <li key={`${m.ano}-${m.mes}`}>
                    <button
                      onClick={() => setSelecionado({ ano: m.ano, mes: m.mes, label: m.label })}
                      style={{
                        width: '100%', textAlign: 'left',
                        padding: '10px 12px', borderRadius: 8,
                        background: ativo ? 'var(--brand-light, #eef2ff)' : 'transparent',
                        color: ativo ? 'var(--brand, #4338ca)' : '#111827',
                        border: 'none', cursor: 'pointer',
                        display: 'flex', justifyContent: 'space-between',
                        alignItems: 'center', fontSize: 14,
                        fontWeight: ativo ? 600 : 400,
                      }}
                    >
                      <span>{m.label}</span>
                      <span style={{ fontSize: 12, color: ativo ? 'var(--brand)' : '#6b7280' }}>
                        {fmt(m.total_cents)}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </aside>

        {/* Recibo */}
        <section style={{
          background: '#fff', border: '1px solid #e5e7eb',
          borderRadius: 10, padding: 18, minHeight: 320,
        }}>
          {!selecionado ? (
            <p style={{ color: '#6b7280' }}>Selecione um mês à esquerda para visualizar o recibo.</p>
          ) : carregandoRecibo ? (
            <p style={{ color: '#6b7280' }}>Carregando recibo…</p>
          ) : !recibo ? (
            <p style={{ color: '#6b7280' }}>Sem dados para este período.</p>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 18 }}>Recibo de {recibo.periodo.label}</h2>
                  <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>
                    {recibo.beneficiario.nome} · {recibo.beneficiario.tipo}
                    {recibo.beneficiario.documento !== '—' && <> · {recibo.beneficiario.documento}</>}
                  </p>
                </div>
                <button
                  onClick={baixarPdf}
                  disabled={baixando}
                  style={{
                    background: 'var(--brand, #4338ca)', color: '#fff',
                    border: 'none', padding: '10px 14px',
                    borderRadius: 8, cursor: baixando ? 'wait' : 'pointer',
                    fontSize: 14, fontWeight: 600,
                  }}
                >
                  {baixando ? 'Gerando PDF…' : 'Baixar PDF'}
                </button>
              </div>

              {/* Totais */}
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))',
                gap: 10, marginBottom: 16,
              }}>
                <Card label="Bruto creditado no mês" value={fmt(recibo.totais.bruto_creditado_cents)} destaque />
                <Card label="Transações" value={recibo.totais.qtd_transacoes} />
                <Card label={`Fee plataforma (${recibo.totais.platform_rate_pct.toFixed(0)}%)`}
                      value={fmt(recibo.totais.platform_fee_cents_informativo)} sub="informativo" />
                <Card label="Fee exploração comercial (5%)"
                      value={fmt(recibo.totais.exploracao_fee_cents_informativo)} sub="informativo" />
                <Card label={`Acumulado em ${recibo.periodo.ano}`}
                      value={fmt(recibo.totais.ytd_cents)} />
              </div>

              {/* Tabela */}
              <h3 style={{ margin: '4px 0 10px', fontSize: 14 }}>Detalhamento</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
                      <th style={th}>Data</th>
                      <th style={th}>Obra</th>
                      <th style={th}>Pagador</th>
                      <th style={th}>Papel</th>
                      <th style={{ ...th, textAlign: 'right' }}>Bruto</th>
                      <th style={{ ...th, textAlign: 'right' }}>Share</th>
                      <th style={{ ...th, textAlign: 'right' }}>Creditado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recibo.linhas.length === 0 ? (
                      <tr><td colSpan={7} style={{ ...td, color: '#6b7280', textAlign: 'center' }}>
                        Nenhum crédito no período.
                      </td></tr>
                    ) : recibo.linhas.map((l, i) => (
                      <tr key={i}>
                        <td style={td}>{fmtData(l.data)}</td>
                        <td style={td}>{l.obra_nome}</td>
                        <td style={td}>{l.pagador_nome || '—'}</td>
                        <td style={td}>{l.papel}</td>
                        <td style={{ ...td, textAlign: 'right' }}>{fmt(l.valor_total_cents)}</td>
                        <td style={{ ...td, textAlign: 'right' }}>
                          {l.share_pct != null ? `${l.share_pct.toFixed(2)}%` : '—'}
                        </td>
                        <td style={{ ...td, textAlign: 'right', fontWeight: 600 }}>
                          {fmt(l.valor_creditado_cents)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p style={{
                marginTop: 16, fontSize: 12, color: '#6b7280',
                background: '#f9fafb', padding: 10, borderRadius: 6,
                lineHeight: 1.5,
              }}>
                {recibo.disclaimer}
              </p>
            </>
          )}
        </section>
      </div>
    </div>
  )
}

const th = { padding: '8px 10px', borderBottom: '1px solid #e5e7eb', fontWeight: 600, color: '#374151' }
const td = { padding: '8px 10px', borderBottom: '1px solid #f3f4f6' }

function Card({ label, value, sub, destaque }) {
  return (
    <div style={{
      border: '1px solid #e5e7eb', borderRadius: 8, padding: 12,
      background: destaque ? 'var(--brand-light, #eef2ff)' : '#fff',
    }}>
      <p style={{ margin: 0, fontSize: 11, color: '#6b7280', textTransform: 'uppercase' }}>{label}</p>
      <p style={{
        margin: '4px 0 0', fontSize: destaque ? 18 : 16, fontWeight: 700,
        color: destaque ? 'var(--brand, #4338ca)' : '#111827',
      }}>{value}</p>
      {sub && <p style={{ margin: 0, fontSize: 11, color: '#9ca3af' }}>{sub}</p>}
    </div>
  )
}
