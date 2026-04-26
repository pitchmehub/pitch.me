import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from '../lib/supabase'

export default function TermosModal({ onClose }) {
  const [conteudo, setConteudo] = useState({ titulo: '', versao: '', texto: '' })

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('landing_content')
        .select('id, valor')
        .in('id', ['termos_uso_titulo', 'termos_uso_versao', 'termos_uso_texto'])
      const map = {}
      data?.forEach(r => { map[r.id] = r.valor })
      setConteudo({
        titulo: map.termos_uso_titulo ?? 'Termos de Uso',
        versao: map.termos_uso_versao ?? '1.0',
        texto:  map.termos_uso_texto ?? '',
      })
    }
    load()
  }, [])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  const node = (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(20,25,40,.35)',
        backdropFilter: 'blur(28px) saturate(140%)',
        WebkitBackdropFilter: 'blur(28px) saturate(140%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000, padding: 24,
        animation: 'gv-fade-in .22s ease',
      }}
    >
      <div style={{
        background: 'rgba(255,255,255,.78)',
        backdropFilter: 'blur(40px) saturate(180%)',
        WebkitBackdropFilter: 'blur(40px) saturate(180%)',
        border: '1px solid rgba(255,255,255,.5)',
        borderRadius: 28,
        boxShadow: '0 30px 80px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.6)',
        width: '100%', maxWidth: 680,
        maxHeight: '85vh', display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        animation: 'gv-pop-in .32s cubic-bezier(.18,1.2,.4,1)',
      }}>
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid rgba(0,0,0,.06)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700 }}>{conteudo.titulo}</h2>
            <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>Versão {conteudo.versao}</p>
          </div>
          <button onClick={onClose} aria-label="Fechar" style={{
            background: 'rgba(0,0,0,.04)', border: 'none', fontSize: 20,
            cursor: 'pointer', color: 'var(--text-muted)',
            width: 36, height: 36, borderRadius: 999,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>

        <div style={{
          padding: '20px 24px', overflowY: 'auto', flex: 1,
          fontSize: 13, lineHeight: 1.7, color: 'var(--text-secondary)',
          whiteSpace: 'pre-wrap', fontFamily: 'inherit',
        }}>
          {conteudo.texto}
        </div>

        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid rgba(0,0,0,.06)',
          display: 'flex', justifyContent: 'flex-end',
        }}>
          <button className="btn btn-primary" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  )

  return createPortal(node, document.body)
}
