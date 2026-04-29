import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../lib/api'

const GRAVAN_UUID = 'e96bd8af-dfb8-4bf1-9ba5-7746207269cd'

const ROLE_LABEL = {
  editora:   'Editora Musical',
  compositor: 'Compositor(a) / Autor(a)',
}

function maskEmail(email) {
  if (!email || !email.includes('@')) return '—'
  const [local, domain] = email.split('@')
  return local[0] + '***@' + domain
}

function fmtTs(iso) {
  if (!iso) return '—'
  try { return new Date(iso).toLocaleString('pt-BR', { timeZone: 'UTC' }) + ' UTC' }
  catch { return iso }
}

function CertificadoEdicao({ c }) {
  const assinado = c?.status === 'assinado'
  if (!assinado) return null

  const hash      = c.certificado_hash
  const emitidoEm = c.certificado_at
    ? fmtTs(c.certificado_at)
    : fmtTs(c.completed_at)

  return (
    <div style={{
      marginBottom: 16,
      border: '2px solid #1a1a2e',
      borderRadius: 12,
      overflow: 'hidden',
      background: '#f9f9ff',
      fontFamily: 'Georgia, "Times New Roman", serif',
    }}>
      <div style={{
        background: '#1a1a2e', color: '#fff',
        padding: '14px 24px',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <span style={{ fontSize: 20 }}>🔐</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, letterSpacing: 1 }}>
            CERTIFICADO DE ASSINATURAS DIGITAIS — GRAVAN
          </div>
          <div style={{ fontSize: 11, opacity: 0.75, marginTop: 2 }}>
            Emitido em {emitidoEm} · Base legal: MP 2.200-2/2001 · Lei 14.063/2020 · LGPD 13.709/2018
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 24px' }}>
        <div style={{
          fontSize: 11, fontWeight: 700, letterSpacing: 1,
          textTransform: 'uppercase', color: '#555', marginBottom: 12,
        }}>
          Registro de Assinaturas
        </div>

        {(c.signers || []).map((s, i) => {
          const isGravan = s.user_id === GRAVAN_UUID
          const nome = isGravan
            ? 'GRAVAN EDITORA MUSICAL LTDA.'
            : (s?.perfis?.nome_completo || s?.perfis?.nome || 'Não informado')
          const email = isGravan ? 'editora@gravan.com.br' : maskEmail(s?.perfis?.email || '')
          const papel = ROLE_LABEL[s.role] || s.role || '—'
          const share = s.share_pct != null ? ` · ${Number(s.share_pct).toFixed(2)}%` : ''
          const signedAt = fmtTs(s.signed_at)
          const ipHash = s.ip_hash || 'Não capturado'
          const tipoAssina = isGravan ? 'Automática (plataforma)' : 'Voluntária (usuário)'

          return (
            <div key={s.user_id || i} style={{
              background: '#fff', border: '1px solid #dde',
              borderRadius: 8, padding: '14px 18px',
              marginBottom: 10, fontSize: 12.5, lineHeight: 1.8,
            }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, color: '#1a1a2e' }}>
                [{i + 1}] {nome}
                {isGravan && (
                  <span style={{
                    marginLeft: 8, fontSize: 10, background: '#1a1a2e',
                    color: '#fff', borderRadius: 3, padding: '1px 6px',
                  }}>PLATAFORMA</span>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', rowGap: 2, color: '#333' }}>
                <span style={{ color: '#666', fontWeight: 600 }}>Papel:</span>
                <span>{papel}{share}</span>
                <span style={{ color: '#666', fontWeight: 600 }}>E-mail:</span>
                <span>{email}</span>
                <span style={{ color: '#666', fontWeight: 600 }}>Tipo assinatura:</span>
                <span>{tipoAssina}</span>
                <span style={{ color: '#666', fontWeight: 600 }}>Data / Hora:</span>
                <span style={{ color: s.signed ? '#0E6B2B' : '#999', fontWeight: s.signed ? 600 : 400 }}>
                  {s.signed ? '✓ ' : '⏱ Pendente · '}{signedAt}
                </span>
                <span style={{ color: '#666', fontWeight: 600 }}>IP (hash):</span>
                <span style={{ fontFamily: 'monospace', fontSize: 11 }}>{ipHash}</span>
              </div>
            </div>
          )
        })}

        {hash && (
          <div style={{
            background: '#fff', border: '1px solid #1a1a2e',
            borderRadius: 8, padding: '12px 18px', marginTop: 4,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#1a1a2e', marginBottom: 6 }}>
              🔒 Integridade do Documento
            </div>
            <div style={{ fontSize: 11, color: '#444', lineHeight: 1.6 }}>
              <b>Hash SHA-256:</b><br />
              <code style={{
                display: 'block', fontFamily: 'monospace', fontSize: 10.5,
                wordBreak: 'break-all', background: '#f4f4f8',
                padding: '6px 10px', borderRadius: 4, margin: '4px 0',
              }}>{hash}</code>
              Qualquer alteração posterior ao documento invalida este hash.
              Este certificado faz parte integrante e inseparável do contrato,
              com plena validade jurídica nos termos da MP 2.200-2/2001 e Lei 14.063/2020.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ContratoEdicaoDetalhe() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const focoAssinar = searchParams.get('assinar') === '1'

  const [c, setC] = useState(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState('')
  const [concordo, setConcordo] = useState(false)
  const [assinando, setAssinando] = useState(false)
  const [baixando, setBaixando] = useState(false)
  const acoesRef = useRef(null)

  async function reload() {
    try {
      setLoading(true)
      const d = await api.get(`/contratos-edicao/${id}`)
      setC(d)
    } catch (e) { setErro(e.message) }
    finally { setLoading(false) }
  }

  useEffect(() => { reload() /* eslint-disable-next-line */ }, [id])

  useEffect(() => {
    if (!loading && focoAssinar && acoesRef.current) {
      setTimeout(() => {
        acoesRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 250)
    }
  }, [loading, focoAssinar])

  const assinado   = c?.status === 'assinado'
  const cancelado  = c?.status === 'cancelado'
  const gravanPub  = c?.publisher_id === GRAVAN_UUID
  const euSouAutor = c?.autor_id === user?.id
  const euSouPub   = c?.publisher_id === user?.id && !gravanPub
  const jaAssinou  = euSouAutor ? !!c?.signed_by_autor_at : euSouPub ? !!c?.signed_by_publisher_at : false
  const podeAssinar = c && !assinado && !cancelado && !jaAssinou && (euSouAutor || euSouPub)

  const assinadosCount = (c?.signers || []).filter(s => s.signed).length
  const totalSigners   = (c?.signers || []).length
  const progresso      = totalSigners ? Math.round((assinadosCount / totalSigners) * 100) : 0

  async function assinar() {
    if (!concordo) { alert('Marque que leu e concorda para assinar.'); return }
    setAssinando(true)
    try {
      await api.post(`/contratos-edicao/${id}/assinar`, {})
      await reload()
    } catch (e) { alert('Erro: ' + e.message) }
    finally { setAssinando(false) }
  }

  async function baixarPdf() {
    setBaixando(true)
    try {
      const nome = (c?.obra_nome || 'obra').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)
      await api.download(`/contratos-edicao/${id}/pdf`, `contrato-edicao-${nome}.pdf`)
    } catch (e) { alert('Erro ao baixar PDF: ' + e.message) }
    finally { setBaixando(false) }
  }

  if (loading) return <div style={{ padding: 40 }}>Carregando…</div>
  if (erro)    return <div style={{ padding: 40, color: '#c0392b' }}> {erro}</div>
  if (!c)      return null

  const share = c.share_pct != null ? `${Number(c.share_pct).toFixed(2)}%` : '—'

  function statusLabel() {
    if (assinado)  return { txt: 'CONCLUÍDO',            bg: '#E8F8EC', fg: '#0E6B2B' }
    if (cancelado) return { txt: 'CANCELADO',            bg: '#FBEAEA', fg: '#8B1C1C' }
    return             { txt: 'AGUARDANDO ASSINATURAS', bg: '#FFF4E5', fg: '#7A4D00' }
  }
  const sl = statusLabel()

  return (
    <div data-testid="contrato-edicao-detalhe" style={{ maxWidth: 880, margin: '0 auto', padding: '32px 20px' }}>
      <button onClick={() => navigate(-1)} className="btn btn-ghost" style={{ fontSize: 12, marginBottom: 16 }}>
        ← Voltar
      </button>

      {/* ── Cabeçalho ── */}
      <div style={{
        padding: 20, background: '#fff', border: '1px solid var(--border)',
        borderRadius: 12, marginBottom: 16,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>
              Contrato de Edição Musical
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Obra: <b>{c.obra_nome || '—'}</b>
              {' · '}Split do autor: <b style={{ color: 'var(--brand)' }}>{share}</b>
              {euSouAutor && <> · Seu papel: <b>Compositor(a)</b></>}
              {euSouPub   && <> · Seu papel: <b>Editora</b></>}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{
              padding: '4px 10px', borderRadius: 4, fontSize: 11, fontWeight: 700,
              background: sl.bg, color: sl.fg,
            }}>{sl.txt}</span>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
              {assinadosCount} de {totalSigners} assinou(ram) · {progresso}%
            </div>
          </div>
        </div>

        {/* Barra de progresso */}
        <div style={{ height: 4, background: 'var(--surface-2,#f0f0f0)', borderRadius: 2, marginTop: 12, overflow: 'hidden' }}>
          <div style={{
            width: `${progresso}%`, height: '100%',
            background: assinado ? '#0E6B2B' : 'var(--brand)',
            transition: 'width .3s',
          }} />
        </div>
      </div>

      {/* ── Participantes ── */}
      <div style={{
        padding: 16, background: '#fff', border: '1px solid var(--border)',
        borderRadius: 12, marginBottom: 16,
      }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 1 }}>
          Participantes
        </h3>
        {(c.signers || []).map((s, i) => {
          const isGravan = s.user_id === GRAVAN_UUID
          const nome = isGravan
            ? 'GRAVAN Editora Musical Ltda.'
            : (s?.perfis?.nome_completo || s?.perfis?.nome || 'Sem nome')
          return (
            <div key={s.user_id || i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '8px 0',
              borderBottom: i < (c.signers.length - 1) ? '1px solid var(--border)' : 'none',
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>
                  {nome}
                  {s.user_id === user?.id && (
                    <span style={{ color: 'var(--brand)', fontSize: 11, marginLeft: 6 }}>(você)</span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                  {ROLE_LABEL[s.role] || s.role}
                  {s.share_pct != null && ` · ${Number(s.share_pct).toFixed(2)}%`}
                </div>
              </div>
              <div style={{ fontSize: 11, fontWeight: 600 }}>
                {s.signed
                  ? <span style={{ color: '#0E6B2B' }}>
                      ✓ {isGravan ? 'Assinatura automática' : 'Assinou'}
                      {s.signed_at ? ` · ${new Date(s.signed_at).toLocaleDateString('pt-BR')}` : ''}
                    </span>
                  : <span style={{ color: 'var(--text-muted)' }}>⏱ Pendente</span>
                }
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Texto do contrato ── */}
      <div style={{
        background: '#fff', border: '1px solid var(--border)',
        borderRadius: 12, marginBottom: 16, overflow: 'hidden',
      }}>
        <div style={{
          padding: '10px 20px', background: '#f8f8f8',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-muted)' }}>
            Documento original do contrato
          </span>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            Texto exato gerado no momento da assinatura — sem alterações
          </span>
        </div>
        <pre style={{
          margin: 0, padding: '32px 36px',
          whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: 13.5, lineHeight: 1.9, color: 'var(--text-secondary)',
        }}>
          {c.contract_text || '(texto do contrato não disponível)'}
        </pre>
      </div>

      {/* ── Certificado de Assinaturas Digitais ── */}
      <CertificadoEdicao c={c} />

      {/* ── Ações ── */}
      <div ref={acoesRef} style={{
        padding: 16, background: '#fff',
        border: focoAssinar && podeAssinar
          ? '2px solid #f59e0b'
          : '1px solid var(--border)',
        borderRadius: 12,
        boxShadow: focoAssinar && podeAssinar
          ? '0 0 0 4px rgba(245,158,11,0.15)'
          : 'none',
      }}>
        {podeAssinar && (
          <>
            <label style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 14, fontSize: 13, cursor: 'pointer' }}>
              <input
                type="checkbox" checked={concordo}
                onChange={e => setConcordo(e.target.checked)}
                style={{ marginTop: 3 }}
              />
              <span>
                Li e concordo com os termos deste <b>Contrato de Edição Musical</b>.
                Entendo que a assinatura eletrônica é válida nos termos da MP 2.200-2/2001 e da Lei 14.063/2020.
              </span>
            </label>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn btn-primary"
                disabled={!concordo || assinando}
                onClick={assinar}
              >{assinando ? 'Assinando…' : 'Confirmar assinatura'}</button>
              <button
                className="btn btn-ghost"
                disabled={baixando}
                onClick={baixarPdf}
              >{baixando ? 'Gerando…' : 'Baixar PDF'}</button>
            </div>
          </>
        )}

        {jaAssinou && !assinado && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <p style={{ fontSize: 13, color: '#0E6B2B', fontWeight: 600 }}>
              ✓ Você já assinou. Aguardando demais participantes.
            </p>
            <button className="btn btn-ghost" onClick={baixarPdf} disabled={baixando}>
              {baixando ? 'Gerando…' : 'Baixar PDF'}
            </button>
          </div>
        )}

        {assinado && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <p style={{ fontSize: 13, color: '#0E6B2B', fontWeight: 600 }}>
              ✓ Contrato concluído — todas as partes assinaram.
            </p>
            <button className="btn btn-primary" onClick={baixarPdf} disabled={baixando}>
              {baixando ? 'Gerando…' : 'Baixar PDF (com certificado)'}
            </button>
          </div>
        )}

        {cancelado && (
          <p style={{ fontSize: 13, color: '#8B1C1C', fontWeight: 600 }}>
            Este contrato foi cancelado.
          </p>
        )}

        {!podeAssinar && !jaAssinou && !assinado && !cancelado && (
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Você tem acesso a este contrato mas não precisa assinar.
          </p>
        )}
      </div>
    </div>
  )
}
