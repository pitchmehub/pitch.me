import React, { useRef, useState } from 'react'
import { api } from '../lib/api'

export default function BulkUploadObras() {
  const inputRef = useRef(null)
  const [arquivo, setArquivo] = useState(null)
  const [arrastando, setArrastando] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [relatorio, setRelatorio] = useState(null)
  const [erro, setErro] = useState('')
  const [baixando, setBaixando] = useState(false)

  function escolher(file) {
    setErro('')
    setRelatorio(null)
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.zip')) {
      setErro('Envie um arquivo .zip contendo o CSV e os arquivos .mp3.')
      return
    }
    if (file.size > 200 * 1024 * 1024) {
      setErro('O .zip excede o limite de 200 MB.')
      return
    }
    setArquivo(file)
  }

  function onDrop(e) {
    e.preventDefault(); e.stopPropagation(); setArrastando(false)
    const f = e.dataTransfer.files?.[0]
    escolher(f)
  }

  async function baixarTemplate() {
    setBaixando(true); setErro('')
    try {
      await api.download(
        '/publishers/bulk-upload/template',
        'gravan-bulk-obras-template.csv',
      )
    } catch (e) { setErro(e.message) }
    finally { setBaixando(false) }
  }

  async function enviar() {
    if (!arquivo) {
      setErro('Selecione um arquivo .zip primeiro.')
      return
    }
    setEnviando(true); setErro(''); setRelatorio(null)
    try {
      const fd = new FormData()
      fd.append('arquivo', arquivo)
      const r = await api.upload('/publishers/bulk-upload', fd)
      setRelatorio(r)
    } catch (e) {
      setErro(e.message)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <header style={{ marginBottom: 16 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Upload em massa de obras</h1>
        <p style={{ marginTop: 6, color: '#6b7280', fontSize: 14 }}>
          Cadastre várias obras de seus agregados de uma só vez enviando
          um arquivo <b>.zip</b> contendo um CSV e os arquivos <b>.mp3</b>.
        </p>
      </header>

      {/* Instruções */}
      <section style={card}>
        <h3 style={{ margin: '0 0 8px', fontSize: 15 }}>Como funciona</h3>
        <ol style={{ margin: '0 0 10px 18px', padding: 0, color: '#374151', fontSize: 14, lineHeight: 1.7 }}>
          <li>Baixe o <b>template CSV</b> abaixo e preencha uma linha por obra.</li>
          <li>Cada linha referencia um arquivo .mp3 pelo nome (coluna <code>arquivo_audio</code>).</li>
          <li>Identifique o titular pelo <code>titular_cpf</code> ou <code>titular_email</code>
              — o titular precisa ser <b>agregado desta editora</b>.</li>
          <li>Coautores opcionais: <code>email:share_pct;email2:share_pct</code>. Sem coautores, o titular fica com 100%.</li>
          <li>Compacte o CSV e os MP3s em um <b>.zip</b> (até 200 MB · 200 obras por upload).</li>
          <li>Envie o .zip — cada obra criada gera contrato de edição autor↔editora automaticamente.</li>
        </ol>
        <button onClick={baixarTemplate} disabled={baixando} style={btnSecundario}>
          {baixando ? 'Gerando…' : 'Baixar template CSV'}
        </button>
      </section>

      {/* Upload */}
      <section
        style={{
          ...card, marginTop: 16,
          border: arrastando ? '2px dashed var(--brand, #4338ca)' : '1px solid #e5e7eb',
          background: arrastando ? 'var(--brand-light, #eef2ff)' : '#fff',
          textAlign: 'center', padding: 28,
        }}
        onDragOver={e => { e.preventDefault(); setArrastando(true) }}
        onDragLeave={() => setArrastando(false)}
        onDrop={onDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".zip,application/zip"
          style={{ display: 'none' }}
          onChange={e => escolher(e.target.files?.[0])}
        />
        {arquivo ? (
          <div>
            <p style={{ margin: 0, fontSize: 15 }}>
              Arquivo selecionado: <b>{arquivo.name}</b>{' '}
              <span style={{ color: '#6b7280', fontSize: 13 }}>
                ({(arquivo.size / (1024 * 1024)).toFixed(2)} MB)
              </span>
            </p>
            <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'center' }}>
              <button onClick={() => inputRef.current?.click()} style={btnSecundario} disabled={enviando}>
                Trocar arquivo
              </button>
              <button onClick={enviar} disabled={enviando} style={btnPrimario}>
                {enviando ? 'Processando…' : 'Enviar e processar'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <p style={{ margin: 0, fontSize: 15, color: '#374151' }}>
              Arraste seu <b>.zip</b> aqui, ou clique para selecionar.
            </p>
            <button onClick={() => inputRef.current?.click()} style={{ ...btnPrimario, marginTop: 12 }}>
              Selecionar arquivo
            </button>
          </>
        )}
      </section>

      {erro && (
        <div style={{
          marginTop: 16, padding: 12, borderRadius: 8,
          background: '#fee2e2', color: '#7f1d1d', fontSize: 14,
        }}>
          {erro}
        </div>
      )}

      {relatorio && (
        <section style={{ ...card, marginTop: 16 }}>
          <h3 style={{ margin: '0 0 10px', fontSize: 16 }}>Resultado do processamento</h3>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8, marginBottom: 14,
          }}>
            <Stat label="Linhas no CSV" value={relatorio.total_csv} />
            <Stat label="Obras criadas" value={relatorio.criadas?.length || 0} cor="#065f46" />
            <Stat label="Erros" value={relatorio.erros?.length || 0} cor={relatorio.erros?.length ? '#7f1d1d' : '#374151'} />
          </div>

          {relatorio.criadas?.length > 0 && (
            <>
              <h4 style={subtitulo}>Obras criadas</h4>
              <Tabela
                cabecalho={['Linha', 'Título', 'Titular']}
                linhas={relatorio.criadas.map(c => [
                  c.linha, c.titulo, c.titular_nome || c.titular_id,
                ])}
              />
            </>
          )}

          {relatorio.erros?.length > 0 && (
            <>
              <h4 style={{ ...subtitulo, color: '#7f1d1d' }}>Linhas com erro</h4>
              <Tabela
                cabecalho={['Linha', 'Título', 'Motivo']}
                linhas={relatorio.erros.map(e => [e.linha, e.titulo, e.motivo])}
                erro
              />
            </>
          )}
        </section>
      )}
    </div>
  )
}

const card = {
  background: '#fff', border: '1px solid #e5e7eb',
  borderRadius: 10, padding: 16,
}

const btnPrimario = {
  background: 'var(--brand, #4338ca)', color: '#fff',
  border: 'none', padding: '10px 16px',
  borderRadius: 8, cursor: 'pointer',
  fontSize: 14, fontWeight: 600,
}

const btnSecundario = {
  background: '#fff', color: 'var(--brand, #4338ca)',
  border: '1px solid var(--brand, #4338ca)',
  padding: '9px 14px', borderRadius: 8, cursor: 'pointer',
  fontSize: 14, fontWeight: 500,
}

const subtitulo = { margin: '12px 0 8px', fontSize: 13, color: '#374151' }

function Stat({ label, value, cor }) {
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 10 }}>
      <p style={{ margin: 0, fontSize: 11, color: '#6b7280', textTransform: 'uppercase' }}>{label}</p>
      <p style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 700, color: cor || '#111827' }}>{value}</p>
    </div>
  )
}

function Tabela({ cabecalho, linhas, erro }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: '#f9fafb' }}>
            {cabecalho.map((h, i) => (
              <th key={i} style={{ padding: '8px 10px', textAlign: 'left', borderBottom: '1px solid #e5e7eb', color: '#374151', fontWeight: 600 }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((row, i) => (
            <tr key={i} style={{ background: erro ? '#fef2f2' : 'transparent' }}>
              {row.map((cell, j) => (
                <td key={j} style={{ padding: '8px 10px', borderBottom: '1px solid #f3f4f6' }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
