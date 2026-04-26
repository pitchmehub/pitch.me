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
      className="gv-modal-bg"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="gv-modal-box" style={{ maxWidth: 680 }}>
        <div className="gv-modal-head">
          <div className="gv-modal-head-info">
            <h2>{conteudo.titulo}</h2>
            <p>Versão {conteudo.versao}</p>
          </div>
          <button className="gv-modal-close" onClick={onClose} aria-label="Fechar">×</button>
        </div>

        <div className="gv-modal-body" style={{ whiteSpace: 'pre-wrap' }}>
          {conteudo.texto || 'Carregando termos…'}
        </div>

        <div className="gv-modal-footer">
          <button className="gv-btn-primary" onClick={onClose}>Fechar</button>
        </div>
      </div>
    </div>
  )

  return createPortal(node, document.body)
}
