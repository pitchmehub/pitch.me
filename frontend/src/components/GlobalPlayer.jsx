import React, { useRef, useState, useEffect, useCallback } from 'react'
import { usePlayer } from '../contexts/PlayerContext'
import { supabase } from '../lib/supabase'
import BotaoCurtir from './BotaoCurtir'
import FichaTecnica from './FichaTecnica'
import './GlobalPlayer.css'

function fmt(s) {
  if (!isFinite(s) || isNaN(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60).toString().padStart(2, '0')
  return `${m}:${sec}`
}

const GRADIENTS = [
  'linear-gradient(160deg,#083257 0%,#09090B 100%)',
  'linear-gradient(160deg,#0F6E56 0%,#09090B 100%)',
  'linear-gradient(160deg,#854F0B 0%,#09090B 100%)',
  'linear-gradient(160deg,#185FA5 0%,#09090B 100%)',
  'linear-gradient(160deg,#993556 0%,#09090B 100%)',
  'linear-gradient(160deg,#3F3F46 0%,#09090B 100%)',
]
function obraGrad(obra) {
  if (!obra) return GRADIENTS[0]
  return GRADIENTS[(obra.id?.charCodeAt(0) ?? 0) % GRADIENTS.length]
}
function miniColor(obra) {
  if (!obra) return '#3F3F46'
  return ['#083257','#0F6E56','#854F0B','#185FA5','#993556','#3F3F46'][(obra.id?.charCodeAt(0) ?? 0) % 6]
}

export default function GlobalPlayer() {
  const {
    obra, queue, index, playing, minimized, expanded, visible,
    currentTime, duration, loading, volume,
    shuffle, repeat,
    togglePlay, seek, nextTrack, prevTrack, goToIndex, reorderQueue, removeFromQueue,
    toggleShuffle, cycleRepeat,
    close, setMinimized, setExpanded, expandPlayer, setVolume,
  } = usePlayer()

  const [showQueue,    setShowQueue]    = useState(false)
  const [letra,        setLetra]        = useState(null)
  const [letraLoading, setLetraLoading] = useState(false)
  const [fichaOpen,    setFichaOpen]    = useState(false)
  const [shareToast,   setShareToast]   = useState(false)

  // Drag-to-reorder state
  const [dragIdx,     setDragIdx]     = useState(null)
  const [dragOverIdx, setDragOverIdx] = useState(null)
  const touchDragRef  = useRef({ idx: null, startY: 0 })
  const queueListRef  = useRef(null)
  const barRef        = useRef(null)
  const touchStart    = useRef(null)

  // Reset letra/ficha on obra change
  useEffect(() => {
    setLetra(null)
    setFichaOpen(false)
  }, [obra?.id])

  // Auto-load letra when player expands
  useEffect(() => {
    if (!expanded || !obra?.id) return
    if (letra !== null || letraLoading) return
    setLetraLoading(true)
    supabase.from('obras').select('letra').eq('id', obra.id).maybeSingle()
      .then(({ data }) => setLetra(data?.letra || ''))
      .catch(() => setLetra(''))
      .finally(() => setLetraLoading(false))
  }, [expanded, obra?.id])

  // Close queue when player collapses
  useEffect(() => {
    if (!expanded) setShowQueue(false)
  }, [expanded])

  async function shareTrack() {
    if (!obra) return
    const url = `${window.location.origin}/obra/${obra.id}`
    const title = obra.nome || 'Música na Gravan'
    const text = nomeArtistico
      ? `Ouça "${obra.nome}" de ${nomeArtistico} na Gravan`
      : `Ouça "${obra.nome}" na Gravan`
    if (navigator.share) {
      try { await navigator.share({ title, text, url }) } catch (_) {}
    } else {
      try {
        await navigator.clipboard.writeText(url)
        setShareToast(true)
        setTimeout(() => setShareToast(false), 2500)
      } catch (_) {}
    }
  }

  function colapsarParaMini() {
    setExpanded(false)
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setMinimized(true)
    }
  }

  if (!visible || !obra) return null

  const pct = duration > 0 ? (currentTime / duration) * 100 : 0
  const nomeArtistico = obra.nome_artistico || obra.titular_nome || ''
  const iniciais = (obra.nome || nomeArtistico)?.charAt(0).toUpperCase() ?? ''

  // ── Seek ─────────────────────────────────────────────────
  function seekFromEvent(e) {
    if (!barRef.current || !duration) return
    const rect = barRef.current.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
    seek((x / rect.width) * duration)
  }
  function handleBarMouseDown(e) {
    seekFromEvent(e)
    const onMove = ev => seekFromEvent(ev)
    const onUp   = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  // ── Swipe down no hero para colapsar ─────────────────────
  function handleExpandedTouchStart(e) {
    if (e.target.closest('.gp-exp-scroll') || e.target.closest('.gp-queue-sheet') || e.target.closest('.gp-q-grip')) return
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }
  }
  function handleExpandedTouchEnd(e) {
    if (!touchStart.current) return
    const dx = e.changedTouches[0].clientX - touchStart.current.x
    const dy = e.changedTouches[0].clientY - touchStart.current.y
    touchStart.current = null
    if (dy > 80 && Math.abs(dy) > Math.abs(dx) * 1.5) { colapsarParaMini(); return }
    if (!showQueue) {
      if (dx < -60 && Math.abs(dx) > Math.abs(dy) * 1.5) { nextTrack(); return }
      if (dx > 60  && Math.abs(dx) > Math.abs(dy) * 1.5) { prevTrack() }
    }
  }

  // ── Drag-to-reorder (touch) ───────────────────────────────
  function handleGripTouchStart(e, idx) {
    e.stopPropagation()
    touchDragRef.current = { idx, startY: e.touches[0].clientY }
    setDragIdx(idx)
  }
  function handleQueueTouchMove(e) {
    if (touchDragRef.current.idx === null) return
    const el = queueListRef.current
    if (!el) return
    const items = [...el.querySelectorAll('.gp-q-item')]
    const y = e.touches[0].clientY
    let over = null
    items.forEach((item, i) => {
      const r = item.getBoundingClientRect()
      if (y >= r.top && y <= r.bottom) over = i
    })
    if (over !== null) setDragOverIdx(over)
  }
  function handleQueueTouchEnd() {
    if (dragIdx !== null && dragOverIdx !== null && dragIdx !== dragOverIdx) {
      reorderQueue(dragIdx, dragOverIdx)
    }
    setDragIdx(null)
    setDragOverIdx(null)
    touchDragRef.current = { idx: null, startY: 0 }
  }

  // ── Drag-to-reorder (mouse/desktop) ──────────────────────
  function handleDragStart(e, idx) { e.dataTransfer.effectAllowed = 'move'; setDragIdx(idx) }
  function handleDragOver(e, idx)  { e.preventDefault(); setDragOverIdx(idx) }
  function handleDrop(e, idx)      { e.preventDefault(); if (dragIdx !== null && dragIdx !== idx) reorderQueue(dragIdx, idx); setDragIdx(null); setDragOverIdx(null) }
  function handleDragEnd()         { setDragIdx(null); setDragOverIdx(null) }

  // ════════════════════════════════════════════════════════
  // PLAYER EXPANDIDO — novo design hero
  // ════════════════════════════════════════════════════════
  if (expanded) {
    return (
      <div
        className="gp-expanded"
        onTouchStart={handleExpandedTouchStart}
        onTouchEnd={handleExpandedTouchEnd}
      >
        {/* ─── HERO: capa full-bleed ─── */}
        <div className="gp-hero">
          {obra.cover_url
            ? <img src={obra.cover_url} alt="" className="gp-hero-img" />
            : <div className="gp-hero-bg" style={{ background: obraGrad(obra) }}>
                <span className="gp-hero-iniciais">{iniciais}</span>
              </div>
          }
          <div className="gp-hero-grad" />

          {/* Header sobreposto */}
          <div className="gp-hero-header">
            <button className="gp-hero-btn" onClick={colapsarParaMini} aria-label="Fechar player">
              <ChevronDownIcon />
            </button>
            <span className="gp-hero-label">Tocando agora</span>
            <button className="gp-hero-btn" onClick={() => setFichaOpen(true)} aria-label="Ficha técnica">
              <DotsIcon />
            </button>
          </div>

          {/* Título + artista + curtir na base da capa */}
          <div className="gp-hero-info">
            <div className="gp-hero-text">
              <div className="gp-hero-nome">{obra.nome}</div>
              <div className="gp-hero-autor">{nomeArtistico}</div>
            </div>
            <div className="gp-hero-like">
              <BotaoCurtir obraId={obra.id} size={26} />
            </div>
          </div>
        </div>

        {/* ─── CONTROLES (fixo, não rola) ─── */}
        <div className="gp-exp-ctrl-section">
          {/* Barra de progresso */}
          <div className="gp-exp-progress-wrap">
            <div
              className="gp-exp-progress-bar"
              ref={barRef}
              onMouseDown={handleBarMouseDown}
              onTouchStart={e => { e.stopPropagation(); seekFromEvent(e) }}
              onTouchMove={e => { e.stopPropagation(); seekFromEvent(e) }}
            >
              <div className="gp-exp-progress-fill" style={{ width: `${pct}%` }}>
                <div className="gp-exp-progress-thumb" />
              </div>
            </div>
            <div className="gp-exp-times">
              <span>{fmt(currentTime)}</span>
              <span>-{fmt(Math.max(0, duration - currentTime))}</span>
            </div>
          </div>

          {/* Transport */}
          <div className="gp-exp-controls">
            <button
              className={`gp-exp-ctrl-btn gp-exp-ctrl-side ${shuffle ? 'gp-exp-ctrl-on' : ''}`}
              onClick={toggleShuffle}
              aria-label={shuffle ? 'Desativar aleatório' : 'Aleatório'}
            >
              <ShuffleIcon />
            </button>
            <button className="gp-exp-ctrl-btn" onClick={prevTrack} aria-label="Anterior"><PrevIcon size={30} /></button>
            <button className="gp-exp-play-btn" onClick={togglePlay} aria-label={playing ? 'Pausar' : 'Tocar'}>
              {loading ? <Spinner size={32} /> : playing ? <PauseIcon size={34} /> : <PlayIcon size={34} />}
            </button>
            <button className="gp-exp-ctrl-btn" onClick={nextTrack} aria-label="Próxima"><NextIcon size={30} /></button>
            <button
              className={`gp-exp-ctrl-btn gp-exp-ctrl-side ${repeat !== 'off' ? 'gp-exp-ctrl-on' : ''}`}
              onClick={cycleRepeat}
              aria-label={`Repetir: ${repeat}`}
            >
              <RepeatIcon />
              {repeat === 'one' && <span className="gp-exp-ctrl-badge">1</span>}
            </button>
          </div>

          {/* Ações: Ficha | Fila | Compartilhar */}
          <div className="gp-exp-actions">
            <button className="gp-exp-action-btn" onClick={() => setFichaOpen(true)} aria-label="Ficha técnica">
              <BookIcon />
              <span>Ficha</span>
            </button>
            <button
              className={`gp-exp-action-btn ${showQueue ? 'gp-exp-action-on' : ''}`}
              onClick={() => setShowQueue(q => !q)}
              aria-label="Fila"
            >
              <QueueIcon />
              <span>Fila</span>
              {queue.length > 1 && <span className="gp-exp-action-badge">{queue.length}</span>}
            </button>
            <button className="gp-exp-action-btn" onClick={shareTrack} aria-label="Compartilhar">
              <ShareIcon />
              <span>Compartilhar</span>
            </button>
          </div>

          <div className="gp-exp-divider" />
        </div>

        {/* ─── LETRA (rola como parte da página) ─── */}
        <div
          className="gp-exp-scroll"
          onTouchStart={e => e.stopPropagation()}
          onTouchMove={e => e.stopPropagation()}
        >
          <div className="gp-exp-lyrics-label">Letra</div>
          {letraLoading
            ? <div className="gp-letra-empty">Carregando letra…</div>
            : (letra && letra.trim())
              ? <pre className="gp-exp-lyrics-text">{letra}</pre>
              : letra === ''
                ? <div className="gp-letra-empty">Letra não disponível para esta obra.</div>
                : null
          }
        </div>

        {/* ─── FILA (bottom sheet) ─── */}
        {showQueue && (
          <div className="gp-queue-sheet" onTouchStart={e => e.stopPropagation()}>
            <div className="gp-queue-sheet-header">
              <span className="gp-queue-sheet-title">Fila de reprodução</span>
              <button className="gp-queue-sheet-close" onClick={() => setShowQueue(false)} aria-label="Fechar fila">
                <CloseIcon />
              </button>
            </div>
            <div
              className="gp-queue-list"
              ref={queueListRef}
              onTouchMove={handleQueueTouchMove}
              onTouchEnd={handleQueueTouchEnd}
            >
              {queue.map((item, i) => (
                <div
                  key={item.id + i}
                  className={[
                    'gp-q-item',
                    i === index      ? 'gp-q-item-active'  : '',
                    i === dragIdx    ? 'gp-q-item-dragging' : '',
                    i === dragOverIdx && i !== dragIdx ? 'gp-q-item-over' : '',
                  ].join(' ')}
                  draggable
                  onDragStart={e => handleDragStart(e, i)}
                  onDragOver={e => handleDragOver(e, i)}
                  onDrop={e => handleDrop(e, i)}
                  onDragEnd={handleDragEnd}
                  onClick={() => { if (dragIdx === null) goToIndex(i) }}
                >
                  <span className="gp-q-grip" onTouchStart={e => handleGripTouchStart(e, i)}><GripIcon /></span>
                  <div className="gp-q-mini-cover" style={!item.cover_url ? { background: miniColor(item) } : undefined}>
                    {item.cover_url && <img src={item.cover_url} alt="" className="gp-q-mini-cover-img" />}
                    {i === index && playing
                      ? <span className="gp-q-playing-dot"><PlayIcon size={10} /></span>
                      : (!item.cover_url && <span style={{ fontSize: 11, fontWeight: 700 }}>{(item.nome || '').charAt(0).toUpperCase()}</span>)
                    }
                  </div>
                  <div className="gp-q-info">
                    <div className="gp-q-nome">{item.nome}</div>
                    <div className="gp-q-autor">{item.nome_artistico || item.titular_nome}</div>
                  </div>
                  {i === index && <span className="gp-q-now-badge">agora</span>}
                  {queue.length > 1 && (
                    <button
                      className="gp-q-remove"
                      onClick={e => { e.stopPropagation(); removeFromQueue(i) }}
                      title="Remover da fila"
                    >×</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {shareToast && <div className="gp-share-toast">Link copiado!</div>}

        {fichaOpen && (
          <FichaTecnica
            obra={obra}
            onClose={() => setFichaOpen(false)}
            onPlay={() => togglePlay()}
            isPlaying={playing}
            isActive
          />
        )}
      </div>
    )
  }

  // ════════════════════════════════════════════════════════
  // MINIMIZADO
  // ════════════════════════════════════════════════════════
  if (minimized) {
    return (
      <div className="gp-mini" onClick={expandPlayer}>
        <div className="gp-mini-cover">
          {obra.cover_url
            ? <img src={obra.cover_url} alt="" className="gp-mini-cover-img" />
            : iniciais}
        </div>
        <div className="gp-mini-info">
          <span className="gp-mini-nome">{obra.nome}</span>
          <span className="gp-mini-autor">{nomeArtistico}</span>
        </div>
        <button className="gp-icon-btn" onClick={e => { e.stopPropagation(); prevTrack() }}><PrevIcon /></button>
        <button className="gp-icon-btn" onClick={e => { e.stopPropagation(); togglePlay() }}>
          {loading ? <Spinner /> : playing ? <PauseIcon /> : <PlayIcon />}
        </button>
        <button className="gp-icon-btn" onClick={e => { e.stopPropagation(); nextTrack() }}><NextIcon /></button>
        <button className="gp-icon-btn" onClick={e => { e.stopPropagation(); shareTrack() }} title="Compartilhar"><ShareIcon /></button>
        <div className="gp-mini-bar"><div className="gp-mini-bar-fill" style={{ width: `${pct}%` }} /></div>
      </div>
    )
  }

  // ════════════════════════════════════════════════════════
  // BARRA (desktop / clique no mobile → expande)
  // ════════════════════════════════════════════════════════
  return (
    <div className="gp-root" onClick={() => { if (window.innerWidth <= 767) expandPlayer() }}>
      <div className="gp-top-bar" ref={barRef} onMouseDown={e => { e.stopPropagation(); handleBarMouseDown(e) }}>
        <div className="gp-top-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <div className="gp-body">
        <div className="gp-track-info">
          <div className="gp-cover">
            {obra.cover_url
              ? <img src={obra.cover_url} alt="" className="gp-cover-img" />
              : <span>{iniciais}</span>}
          </div>
          <div className="gp-meta">
            <div className="gp-nome">{obra.nome}</div>
            <div className="gp-autor">{nomeArtistico}</div>
          </div>
        </div>
        <div className="gp-controls" onClick={e => e.stopPropagation()}>
          <button className="gp-icon-btn" onClick={prevTrack}><PrevIcon /></button>
          <button className="gp-play-btn" onClick={togglePlay}>
            {loading ? <Spinner size={22} /> : playing ? <PauseIcon size={22} /> : <PlayIcon size={22} />}
          </button>
          <button className="gp-icon-btn" onClick={nextTrack}><NextIcon /></button>
        </div>
        <div className="gp-right" onClick={e => e.stopPropagation()}>
          <span className="gp-time">{fmt(currentTime)} / {fmt(duration)}</span>
          <div className="gp-volume">
            <VolumeIcon />
            <input type="range" min="0" max="1" step="0.05" value={volume}
              onChange={e => setVolume(Number(e.target.value))} className="gp-vol-slider" />
          </div>
          {queue.length > 1 && <span className="gp-queue-info">{index + 1}/{queue.length}</span>}
          <button className="gp-icon-btn" onClick={() => setMinimized(true)}><MinimizeIcon /></button>
          <button className="gp-icon-btn" onClick={shareTrack} title="Compartilhar"><ShareIcon /></button>
          {shareToast && <span className="gp-bar-share-toast">Link copiado!</span>}
        </div>
      </div>
    </div>
  )
}

// ── Ícones ────────────────────────────────────────────────
function PlayIcon({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21" /></svg>
}
function PauseIcon({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
}
function PrevIcon({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><polygon points="19,20 9,12 19,4"/><rect x="5" y="4" width="3" height="16" rx="1"/></svg>
}
function NextIcon({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><polygon points="5,4 15,12 5,20"/><rect x="16" y="4" width="3" height="16" rx="1"/></svg>
}
function CloseIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
}
function MinimizeIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
}
function ChevronDownIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
}
function VolumeIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>
}
function DotsIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
}
function ShuffleIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>
}
function RepeatIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
}
function BookIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
}
function QueueIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
}
function ShareIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  )
}
function GripIcon() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg>
}
function Spinner({ size = 16 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" strokeOpacity=".25"/><path d="M12 2 a10 10 0 0 1 10 10" strokeLinecap="round" style={{ animation: 'gp-spin .8s linear infinite' }}/></svg>
}
