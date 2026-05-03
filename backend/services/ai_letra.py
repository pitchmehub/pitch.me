"""
Transcrição de letras via faster-whisper (local, gratuito).

Modelo `tiny` (~75MB) — rápido e leve o suficiente para português em CPU.
Carregado preguiçosamente no primeiro uso e reutilizado pelo processo.
Troque WHISPER_MODEL=base para qualidade melhor se tiver RAM disponível.
"""
import logging
import threading
import tempfile
import os

log = logging.getLogger(__name__)

_MODEL = None
_MODEL_LOCK = threading.Lock()
# "tiny" usa ~250 MB RAM e ~75 MB de download — compatível com Render free
_MODEL_NAME = os.environ.get("WHISPER_MODEL", "tiny")

# Diretório de cache persistente (evita re-download a cada restart)
_CACHE_DIR = os.environ.get("WHISPER_CACHE_DIR", "/tmp/whisper_cache")


def _get_model():
    """Carrega o modelo Whisper de forma preguiçosa e thread-safe."""
    global _MODEL
    if _MODEL is None:
        with _MODEL_LOCK:
            if _MODEL is None:
                from faster_whisper import WhisperModel
                os.makedirs(_CACHE_DIR, exist_ok=True)
                log.info("[ai_letra] carregando modelo whisper '%s'...", _MODEL_NAME)
                _MODEL = WhisperModel(
                    _MODEL_NAME,
                    device="cpu",
                    compute_type="int8",
                    download_root=_CACHE_DIR,
                )
                log.info("[ai_letra] modelo whisper '%s' carregado", _MODEL_NAME)
    return _MODEL


def transcrever_audio_bytes(audio_bytes: bytes, language: str = "pt") -> str:
    """
    Transcreve bytes de áudio (mp3/wav) e retorna a letra como string.
    Bloqueante — pode levar alguns segundos dependendo do tamanho do áudio.
    """
    if not audio_bytes:
        return ""

    # faster-whisper precisa de path em disco
    suffix = ".mp3"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    try:
        model = _get_model()
        segments, _info = model.transcribe(
            tmp_path,
            language=language,
            beam_size=1,       # mais rápido em CPU
            vad_filter=True,   # remove silêncios
            vad_parameters={"min_silence_duration_ms": 500},
        )
        partes = []
        for seg in segments:
            txt = (seg.text or "").strip()
            if txt:
                partes.append(txt)
        return "\n".join(partes).strip()
    finally:
        try:
            os.unlink(tmp_path)
        except Exception:
            pass


def transcrever_obra_async(obra_id: str, audio_bytes: bytes, language: str = "pt"):
    """
    Dispara transcrição em background (thread). Atualiza obras.letra_status
    e obras.letra conforme o progresso.
    """
    from db.supabase_client import get_supabase

    def _runner():
        sb = get_supabase()
        try:
            sb.table("obras").update({"letra_status": "transcrevendo"}).eq("id", obra_id).execute()
            texto = transcrever_audio_bytes(audio_bytes, language=language)
            if not texto:
                sb.table("obras").update({"letra_status": "erro"}).eq("id", obra_id).execute()
                return
            sb.table("obras").update({
                "letra": texto,
                "letra_status": "pronta",
            }).eq("id", obra_id).execute()
            log.info("[ai_letra] transcrição concluída para obra %s (%d chars)",
                     obra_id, len(texto))
        except Exception as e:
            log.exception("[ai_letra] falha na transcrição da obra %s: %s", obra_id, e)
            try:
                sb.table("obras").update({"letra_status": "erro"}).eq("id", obra_id).execute()
            except Exception:
                pass

    t = threading.Thread(target=_runner, daemon=True, name=f"transcrever-{obra_id}")
    t.start()
    return t
