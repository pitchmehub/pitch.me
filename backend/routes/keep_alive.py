"""
Rotas de keep-alive / heartbeat.

Servem para que serviços de monitoramento externos (UptimeRobot, BetterStack,
Cron-job.org, etc.) e o próprio frontend possam fazer "ping" periodicamente
e impedir o servidor de hibernar.

Endpoints:
    GET /api/ping          -> resposta minimalista, só "pong"
    GET /api/keep-alive    -> resposta com timestamp e uptime
"""
import subprocess
import time
from flask import Blueprint, jsonify

keep_alive_bp = Blueprint("keep_alive", __name__)

_BOOT_TIME = time.time()


@keep_alive_bp.route("/ping", methods=["GET", "HEAD"])
def ping():
    """Endpoint super leve — apenas devolve "pong"."""
    return jsonify({"pong": True}), 200


@keep_alive_bp.route("/keep-alive", methods=["GET", "HEAD"])
def keep_alive():
    """Endpoint de keep-alive com informações úteis."""
    uptime = time.time() - _BOOT_TIME
    return jsonify({
        "status": "alive",
        "uptime_seconds": round(uptime, 2),
        "timestamp": int(time.time()),
    }), 200


@keep_alive_bp.route("/version", methods=["GET"])
def version():
    """Retorna o commit git e timestamp do deploy para diagnóstico de produção."""
    try:
        commit = subprocess.check_output(
            ["git", "rev-parse", "HEAD"], stderr=subprocess.DEVNULL
        ).decode().strip()
        short = commit[:12]
    except Exception:
        commit = "desconhecido"
        short = "desconhecido"
    try:
        msg = subprocess.check_output(
            ["git", "log", "-1", "--pretty=%s"], stderr=subprocess.DEVNULL
        ).decode().strip()
    except Exception:
        msg = ""
    return jsonify({
        "commit":       commit,
        "commit_short": short,
        "commit_msg":   msg,
        "boot_time":    int(_BOOT_TIME),
        "uptime_s":     round(time.time() - _BOOT_TIME, 0),
    }), 200
