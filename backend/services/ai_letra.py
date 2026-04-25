"""
Transcrição de letras via faster-whisper (local, gratuito).

Modelo `base` (~140MB) — bom equilíbrio entre velocidade e qualidade
em português. Carregado preguiçosamente no primeiro uso e reutilizado
pelo processo (singleton). Para escala alta, trocar por API.
"""
import io
import logging
import threading
import tempfile
import os

log = logging.getLogger(__name__)

_MODEL = None
_MODEL_LOCK = threading.Lock()
_MODEL_NAME = os.environ.get("WHISPER_MODEL", "base")


def _get_model():
    """Carrega o modelo Whisper de forma preguiçosa e thread-safe."""
    global _MODEL
    if _MODEL is None:
        with _MODEL_LOCK:
            if _MODEL is None:
                from faster_whisper import WhisperModel
                log.info("[ai_letra] carregando modelo whisper '%s'...", _MODEL_NAME)
                _MODEL = WhisperModel(
                    _MODEL_NAME,
                    device="cpu",
                    compute_type="int8",
                )
                log.info("[ai_letra] modelo whisper carregado")
    return _MODEL


def transcrever_audio_bytes(audio_bytes: bytes, language: str = "pt") -> str:
    """
    Transcreve bytes de áudio (mp3) e retorna a letra como string única.
    Bloqueante — pode levar dezenas de segundos pra alguns minutos.
    """
    if not audio_bytes:
        return ""

    # faster-whisper precisa de path em disco (ou file-like com seek)
    with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp:
        tmp.write(audio_bytes)
        tmp_path = tmp.name

    try:
        model = _get_model()
        segments, _info = model.transcribe(
            tmp_path,
            language=language,
            beam_size=1,            # mais rápido p/ MVP
            vad_filter=True,        # remove silêncios
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
