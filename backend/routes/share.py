"""
Routes: /api/share
GET /api/share/obra/<obra_id>  →  página HTML com Open Graph tags + meta-refresh
                                   para o frontend. Usada por crawlers de redes
                                   sociais (WhatsApp, Twitter, etc.) para gerar
                                   o preview rico (capa, título, descrição).
"""
import os
import html as _html
import logging
from flask import Blueprint, Response
from db.supabase_client import get_supabase

log = logging.getLogger(__name__)

share_bp = Blueprint("share", __name__)

FRONTEND_URL = os.environ.get("FRONTEND_URL", "https://gravan.com.br").rstrip("/")


def _escape(s):
    return _html.escape(str(s or ""), quote=True)


@share_bp.get("/api/share/obra/<obra_id>")
def share_obra(obra_id: str):
    sb = get_supabase()

    obra = {}
    try:
        r = sb.table("obras").select(
            "id, nome, cover_url, titular_id, genero, status"
        ).eq("id", obra_id).single().execute()
        obra = r.data or {}
    except Exception:
        pass

    nome     = _escape(obra.get("nome") or "Composição Musical")
    genero   = _escape(obra.get("genero") or "Música")
    cover    = obra.get("cover_url") or f"{FRONTEND_URL}/og-default.jpg"

    nome_artistico = ""
    try:
        if obra.get("titular_id"):
            pr = sb.table("perfis").select("nome_artistico, nome").eq(
                "id", obra["titular_id"]
            ).single().execute()
            p = pr.data or {}
            nome_artistico = _escape(
                p.get("nome_artistico") or p.get("nome") or ""
            )
    except Exception:
        pass

    if nome_artistico:
        descricao = f"Composição de {nome_artistico} · {genero} · Disponível para licenciamento na Gravan"
    else:
        descricao = f"{genero} · Disponível para licenciamento na Gravan"

    redirect_url  = f"{FRONTEND_URL}/catalogo?obra={obra_id}"
    canonical_url = f"{FRONTEND_URL}/obra/{obra_id}"

    page = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0; url={redirect_url}">
  <title>{nome} — Gravan</title>

  <!-- Open Graph -->
  <meta property="og:type"        content="music.song">
  <meta property="og:site_name"   content="Gravan">
  <meta property="og:locale"      content="pt_BR">
  <meta property="og:title"       content="{nome}">
  <meta property="og:description" content="{descricao}">
  <meta property="og:image"       content="{_escape(cover)}">
  <meta property="og:image:width"  content="600">
  <meta property="og:image:height" content="600">
  <meta property="og:url"         content="{canonical_url}">

  <!-- Twitter / X -->
  <meta name="twitter:card"        content="summary_large_image">
  <meta name="twitter:title"       content="{nome}">
  <meta name="twitter:description" content="{descricao}">
  <meta name="twitter:image"       content="{_escape(cover)}">

  <link rel="canonical" href="{canonical_url}">
</head>
<body>
  <p>Redirecionando para <a href="{redirect_url}">Gravan</a>…</p>
</body>
</html>"""

    resp = Response(page, status=200, mimetype="text/html; charset=utf-8")
    resp.headers["Access-Control-Allow-Origin"] = "*"
    resp.headers["Cache-Control"] = "public, max-age=300"
    # Crawlers não usam X-Frame-Options — mas mantemos para consistência
    return resp
