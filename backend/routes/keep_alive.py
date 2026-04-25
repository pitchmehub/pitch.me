"""
Rotas de keep-alive / heartbeat.

Servem para que serviços de monitoramento externos (UptimeRobot, BetterStack,
Cron-job.org, etc.) e o próprio frontend possam fazer "ping" periodicamente
e impedir o servidor de hibernar.

Endpoints:
    GET /api/ping          -> resposta minimalista, só "pong"
    GET /api/keep-alive    -> resposta com timestamp e uptime
"""
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
