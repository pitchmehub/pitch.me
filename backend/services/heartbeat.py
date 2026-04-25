"""
Heartbeat interno — uma thread em background que faz uma chamada HTTP local
para o próprio servidor a cada N segundos.

Utilidade: mantém o processo "ocupado" (eventos em loop, métricas, logs),
impedindo que o servidor seja considerado ocioso por sistemas que mediriam
inatividade.

Variáveis de ambiente:
    HEARTBEAT_ENABLED     -> "1" para ligar (padrão: "1")
    HEARTBEAT_INTERVAL    -> intervalo em segundos (padrão: 240 = 4 min)
    HEARTBEAT_URL         -> URL alvo. Padrão: http://127.0.0.1:8000/api/ping
"""
import logging
import os
import threading
import time
from urllib.error import URLError
from urllib.request import Request, urlopen

logger = logging.getLogger(__name__)

_started = False
_lock = threading.Lock()


def _loop(url: str, interval: int) -> None:
    while True:
        try:
            req = Request(url, headers={"User-Agent": "gravan-heartbeat/1.0"})
            with urlopen(req, timeout=10) as resp:
                logger.debug("Heartbeat OK (%s) -> %s", url, resp.status)
        except URLError as exc:
            logger.warning("Heartbeat falhou: %s", exc)
        except Exception as exc:  # noqa: BLE001
            logger.warning("Heartbeat erro inesperado: %s", exc)
        time.sleep(interval)


def start_heartbeat() -> None:
    """Inicia a thread de heartbeat — idempotente entre workers."""
    global _started

    if os.getenv("HEARTBEAT_ENABLED", "1") != "1":
        logger.info("Heartbeat desativado via HEARTBEAT_ENABLED=0")
        return

    with _lock:
        if _started:
            return
        _started = True

    interval = int(os.getenv("HEARTBEAT_INTERVAL", "240"))
    url = os.getenv("HEARTBEAT_URL", "http://127.0.0.1:8000/api/ping")

    thread = threading.Thread(
        target=_loop,
        args=(url, interval),
        name="gravan-heartbeat",
        daemon=True,
    )
    thread.start()
    logger.info("Heartbeat iniciado: %s a cada %ss", url, interval)
