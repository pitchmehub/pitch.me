"""
Geração de capas de obra via Pollinations.ai (gratuito, sem chave).

Estratégia MVP:
  • Constrói um prompt em inglês baseado no nome + gênero da obra
  • Gera URL determinística do Pollinations.ai (a própria URL é a imagem)
  • Salva a URL em obras.cover_url

Pollinations não exige chave nem cadastro. Para escala maior trocar
por Hugging Face / OpenAI sem alterar o resto da app.
"""
import logging
import urllib.parse
from db.supabase_client import get_supabase

log = logging.getLogger(__name__)

POLLINATIONS_BASE = "https://image.pollinations.ai/prompt"

# Mapa de gênero → estilo visual (em inglês p/ melhor resultado do modelo)
GENERO_STYLE = {
    "Sertanejo": "rustic countryside, acoustic guitar, warm sunset, cinematic",
    "MPB":       "vintage brazilian art, watercolor, tropical, bossa nova vibes",
    "Funk":      "neon urban, favela art, vibrant pink and purple, energetic",
    "Samba":     "rio de janeiro carnival, golden colors, percussion, festive",
    "Rock":      "dark dramatic, electric guitar, bold contrast, gritty texture",
    "Pop":       "modern minimalist, vibrant colors, glossy, contemporary",
    "Gospel":    "ethereal, light beams, peaceful, sacred geometry",
    "Forró":     "northeastern brazil, accordion, warm earthy tones, rural",
    "Pagode":    "samba circle, brazilian instruments, golden hour, cheerful",
    "RNB":       "smooth elegant, deep blues and gold, soulful, late night",
    "RAP":       "urban graffiti, bold typography, street art, hip-hop culture",
    "OUTROS":    "abstract artistic, balanced composition, musical theme",
}


def _build_prompt(nome: str, genero: str) -> str:
    """Monta um prompt curto em inglês p/ Pollinations gerar capa de música."""
    style = GENERO_STYLE.get(genero, GENERO_STYLE["OUTROS"])
    return (
        f"album cover artwork for the song '{nome}', "
        f"{style}, "
        f"professional music album art, "
        f"square 1:1, no text, no logo, no watermark"
    )


def gerar_url_capa(nome: str, genero: str, seed: int | None = None) -> str:
    """
    Retorna URL pública e estável do Pollinations.ai pra capa da obra.
    A própria URL serve a imagem (CDN do Pollinations).
    """
    prompt = _build_prompt(nome or "Música", genero or "OUTROS")
    encoded = urllib.parse.quote(prompt, safe="")
    params = {
        "width":   "768",
        "height":  "768",
        "nologo":  "true",
        "enhance": "true",
        "model":   "flux",
    }
    if seed is not None:
        params["seed"] = str(seed)

    qs = "&".join(f"{k}={v}" for k, v in params.items())
    return f"{POLLINATIONS_BASE}/{encoded}?{qs}"


def gerar_e_salvar_capa(obra_id: str, nome: str, genero: str,
                        seed: int | None = None) -> str | None:
    """
    Gera URL da capa e persiste em obras.cover_url.
    Retorna a URL ou None em caso de erro.
    """
    try:
        url = gerar_url_capa(nome, genero, seed=seed)
        sb = get_supabase()
        sb.table("obras").update({"cover_url": url}).eq("id", obra_id).execute()
        log.info("[ai_capa] capa gerada para obra %s", obra_id)
        return url
    except Exception as e:
        log.exception("[ai_capa] falha ao gerar capa para obra %s: %s", obra_id, e)
        return None
