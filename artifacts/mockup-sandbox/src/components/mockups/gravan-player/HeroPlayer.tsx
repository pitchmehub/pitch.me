import { useState, useEffect, useRef } from "react";
import {
  ChevronDown, Share2, List, BookOpen, MoreHorizontal,
  Shuffle, SkipBack, Play, Pause, SkipForward, Repeat,
  Heart, X
} from "lucide-react";

const COVER = "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&q=80";

const LETRA = `[Verso 1]
Nas vielas do sertão
Nasce um canto de esperança
A viola chora baixo
E o coração dança

Lembro os tempos de criança
Debaixo do pé de maçã
Meu avô cantava assim
Nas tardes de manhã

[Refrão]
Amor de terra vermelha
Bate forte no peito
Como cheiro de chuva
No cerrado perfeito

Amor de terra vermelha
Vai longe, mas volta
Com a voz que me encontra
E a saudade que me devolva

[Verso 2]
Hoje estou longe de lá
Mas a música me segura
Toda vez que o rádio toca
Sinto a mesma ternura

O violeiro da cidade
Aprendeu com o velho pai
Que a canção que vem do fundo
É a que nunca vai embora

[Refrão]
Amor de terra vermelha
Bate forte no peito
Como cheiro de chuva
No cerrado perfeito

Amor de terra vermelha
Vai longe, mas volta
Com a voz que me encontra
E a saudade que me devolva

[Ponte]
E se a estrada for longa
E o destino incerto
Carrego na minha viola
Um pedaço do meu sertão aberto

[Refrão Final]
Amor de terra vermelha
Bate forte no peito
Como cheiro de chuva
No cerrado perfeito

Amor de terra vermelha
Vai longe, mas volta
Com a voz que me encontra
E a saudade que me devolva`;

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60).toString().padStart(2, "0");
  return `${m}:${sec}`;
}

export function HeroPlayer() {
  const [playing, setPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(67);
  const [duration] = useState(214);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [showFicha, setShowFicha] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const pct = (currentTime / duration) * 100;

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setCurrentTime(c => Math.min(c + 1, duration)), 1000);
    return () => clearInterval(t);
  }, [playing, duration]);

  return (
    <div style={{ width: 390, height: 844, background: "#09090B", color: "#fff", fontFamily: "'Inter', sans-serif", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>

      {/* ── HERO: capa full-width com gradiente ── */}
      <div style={{ position: "relative", width: "100%", height: 340, flexShrink: 0, overflow: "hidden" }}>
        {/* Capa em blur no fundo */}
        <img src={COVER} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "blur(0px)", transform: "scale(1.02)" }} />
        {/* Gradiente sobre a capa */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(9,9,11,0.3) 0%, rgba(9,9,11,0.0) 40%, rgba(9,9,11,0.85) 100%)" }} />

        {/* Header buttons */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "52px 20px 0" }}>
          <button style={{ background: "rgba(0,0,0,0.35)", border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer", backdropFilter: "blur(8px)" }}>
            <ChevronDown size={20} />
          </button>
          <span style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", color: "rgba(255,255,255,0.7)", textTransform: "uppercase" }}>Tocando agora</span>
          <button style={{ background: "rgba(0,0,0,0.35)", border: "none", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer", backdropFilter: "blur(8px)" }}>
            <MoreHorizontal size={20} />
          </button>
        </div>

        {/* Título e artista sobre a capa */}
        <div style={{ position: "absolute", bottom: 20, left: 20, right: 20 }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <div>
              <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.15, textShadow: "0 2px 16px rgba(0,0,0,0.6)", marginBottom: 4 }}>
                Amor de Terra Vermelha
              </div>
              <div style={{ fontSize: 15, color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>
                Lucas Drummond
              </div>
            </div>
            <button
              onClick={() => setLiked(l => !l)}
              style={{ background: "none", border: "none", color: liked ? "#ef4444" : "rgba(255,255,255,0.7)", cursor: "pointer", flexShrink: 0, marginBottom: 2 }}
            >
              <Heart size={24} fill={liked ? "#ef4444" : "none"} />
            </button>
          </div>
        </div>
      </div>

      {/* ── CONTROLES ── */}
      <div style={{ padding: "16px 20px 0", flexShrink: 0 }}>
        {/* Barra de progresso */}
        <div style={{ position: "relative", height: 3, background: "rgba(255,255,255,0.15)", borderRadius: 2, cursor: "pointer", marginBottom: 8 }}>
          <div style={{ height: "100%", width: `${pct}%`, background: "#fff", borderRadius: 2, position: "relative" }}>
            <div style={{ position: "absolute", right: -5, top: "50%", transform: "translateY(-50%)", width: 12, height: 12, background: "#fff", borderRadius: "50%" }} />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(255,255,255,0.45)", marginBottom: 14 }}>
          <span>{fmt(currentTime)}</span>
          <span>-{fmt(duration - currentTime)}</span>
        </div>

        {/* Botões principais */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <button onClick={() => setShuffle(s => !s)} style={{ background: "none", border: "none", color: shuffle ? "#a78bfa" : "rgba(255,255,255,0.5)", cursor: "pointer", position: "relative" }}>
            <Shuffle size={20} />
            {shuffle && <span style={{ position: "absolute", bottom: -4, left: "50%", transform: "translateX(-50%)", width: 4, height: 4, borderRadius: "50%", background: "#a78bfa" }} />}
          </button>
          <button style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}>
            <SkipBack size={28} fill="white" />
          </button>
          <button
            onClick={() => setPlaying(p => !p)}
            style={{ width: 64, height: 64, borderRadius: "50%", background: "#fff", border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 24px rgba(255,255,255,0.2)" }}
          >
            {playing
              ? <Pause size={28} fill="#09090B" color="#09090B" />
              : <Play size={28} fill="#09090B" color="#09090B" style={{ marginLeft: 3 }} />
            }
          </button>
          <button style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}>
            <SkipForward size={28} fill="white" />
          </button>
          <button onClick={() => setRepeat(r => !r)} style={{ background: "none", border: "none", color: repeat ? "#a78bfa" : "rgba(255,255,255,0.5)", cursor: "pointer", position: "relative" }}>
            <Repeat size={20} />
            {repeat && <span style={{ position: "absolute", bottom: -4, left: "50%", transform: "translateX(-50%)", width: 4, height: 4, borderRadius: "50%", background: "#a78bfa" }} />}
          </button>
        </div>

        {/* Ações secundárias */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", paddingBottom: 14, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <button style={{ background: "none", border: "none", color: "rgba(255,255,255,0.55)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontSize: 10 }}>
            <BookOpen size={18} />
            <span>Ficha</span>
          </button>
          <button
            onClick={() => setShowQueue(q => !q)}
            style={{ background: "none", border: "none", color: showQueue ? "#a78bfa" : "rgba(255,255,255,0.55)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontSize: 10 }}
          >
            <List size={18} />
            <span>Fila</span>
          </button>
          <button style={{ background: "none", border: "none", color: "rgba(255,255,255,0.55)", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontSize: 10 }}>
            <Share2 size={18} />
            <span>Compartilhar</span>
          </button>
        </div>
      </div>

      {/* ── LETRA — scroll fazendo parte da página ── */}
      <div
        ref={scrollRef}
        style={{ flex: 1, overflowY: "auto", padding: "20px 24px 24px" }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.35)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 16 }}>
          Letra
        </div>
        <pre style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 15,
          lineHeight: 1.85,
          color: "rgba(255,255,255,0.82)",
          whiteSpace: "pre-wrap",
          margin: 0,
          fontWeight: 400,
        }}>
          {LETRA}
        </pre>
      </div>

      {/* ── FILA (overlay deslizante de baixo) ── */}
      {showQueue && (
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          background: "#18181B", borderRadius: "20px 20px 0 0",
          padding: "0 0 32px",
          maxHeight: "60%",
          display: "flex", flexDirection: "column",
          boxShadow: "0 -8px 40px rgba(0,0,0,0.6)"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 20px 14px" }}>
            <span style={{ fontSize: 15, fontWeight: 700 }}>Fila de reprodução</span>
            <button onClick={() => setShowQueue(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.5)", cursor: "pointer" }}>
              <X size={20} />
            </button>
          </div>
          <div style={{ overflowY: "auto" }}>
            {["Amor de Terra Vermelha", "Coração Sertanejo", "Noites do Cerrado", "Viola Doida", "Cheiro de Terra"].map((nome, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 20px",
                background: i === 0 ? "rgba(167,139,250,0.1)" : "transparent",
                borderLeft: i === 0 ? "3px solid #a78bfa" : "3px solid transparent"
              }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: `hsl(${i * 60},40%,25%)`, flexShrink: 0, overflow: "hidden" }}>
                  <img src={COVER} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: i === 0 ? 700 : 400, color: i === 0 ? "#a78bfa" : "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{nome}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>Lucas Drummond</div>
                </div>
                {i === 0 && <span style={{ fontSize: 11, color: "#a78bfa", fontWeight: 600 }}>agora</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
