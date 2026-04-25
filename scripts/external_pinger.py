"""
Pinger externo — script standalone para rodar em qualquer máquina/servidor
e manter o backend Gravan acordado.

Uso:
    python scripts/external_pinger.py https://seu-app.replit.app

Ou agende em um cron / systemd timer / GitHub Action a cada 5 minutos.
Também funciona em serviços tipo UptimeRobot apontando para a mesma URL.
"""
import sys
import time
from urllib.request import Request, urlopen

INTERVAL = 5 * 60  # 5 minutos


def ping(base_url: str) -> None:
    url = base_url.rstrip("/") + "/api/keep-alive"
    try:
        req = Request(url, headers={"User-Agent": "gravan-external-pinger/1.0"})
        with urlopen(req, timeout=15) as resp:
            print(f"[OK]  {time.strftime('%H:%M:%S')}  {url} -> {resp.status}")
    except Exception as exc:  # noqa: BLE001
        print(f"[ERR] {time.strftime('%H:%M:%S')}  {url} -> {exc}")


def main() -> None:
    if len(sys.argv) < 2:
        print("Uso: python external_pinger.py <URL_BASE>")
        print("Ex.: python external_pinger.py https://seu-app.replit.app")
        sys.exit(1)

    base = sys.argv[1]
    print(f"Iniciando pinger -> {base} (a cada {INTERVAL}s)")
    while True:
        ping(base)
        time.sleep(INTERVAL)


if __name__ == "__main__":
    main()
