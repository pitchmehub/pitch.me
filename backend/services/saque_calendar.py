"""
Calendário de saques — janela mensal híbrida.

Regras:
  - Botão fica liberado a partir do dia JANELA_INICIO_DIA (default: 25)
  - Só vai até o último dia útil do mês (inclusive)
  - Cada usuário pode sacar apenas 1x por mês (controle por created_at)
  - Após o último dia útil, sistema cria saque automático para quem não clicou
"""
import os
from datetime import date, datetime, timedelta, timezone
from typing import Optional

try:
    import holidays
    _BR_HOLIDAYS = holidays.country_holidays("BR")
except Exception:
    _BR_HOLIDAYS = {}


JANELA_INICIO_DIA = int(os.environ.get("SAQUE_JANELA_INICIO_DIA", "25"))


def _eh_dia_util(d: date) -> bool:
    """Segunda a sexta E não é feriado nacional brasileiro."""
    if d.weekday() >= 5:  # 5=sábado, 6=domingo
        return False
    if d in _BR_HOLIDAYS:
        return False
    return True


def ultimo_dia_util_do_mes(ref: Optional[date] = None) -> date:
    """Retorna o último dia útil do mês de `ref` (default: mês atual)."""
    ref = ref or date.today()
    # Vai pro último dia do mês
    if ref.month == 12:
        ultimo = date(ref.year, 12, 31)
    else:
        prox_mes = date(ref.year, ref.month + 1, 1)
        ultimo = prox_mes - timedelta(days=1)
    # Volta dia a dia até achar um dia útil
    while not _eh_dia_util(ultimo):
        ultimo -= timedelta(days=1)
    return ultimo


def primeiro_dia_do_mes(ref: Optional[date] = None) -> date:
    ref = ref or date.today()
    return date(ref.year, ref.month, 1)


def janela_atual(ref: Optional[date] = None) -> dict:
    """
    Devolve informações sobre a janela de saque do mês de `ref`:
      - inicio:   data em que o botão fica disponível (dia 25)
      - fim:      último dia útil do mês (inclusive)
      - aberta:   bool, se hoje está dentro da janela
      - dias_ate_abrir:   quantos dias faltam pra abrir (0 se já aberta)
      - dias_ate_fechar:  quantos dias faltam pro último dia útil (None se já passou)
    """
    ref = ref or date.today()
    inicio = date(ref.year, ref.month, JANELA_INICIO_DIA)
    fim = ultimo_dia_util_do_mes(ref)

    aberta = inicio <= ref <= fim

    if ref < inicio:
        dias_ate_abrir = (inicio - ref).days
    else:
        dias_ate_abrir = 0

    if ref <= fim:
        dias_ate_fechar = (fim - ref).days
    else:
        dias_ate_fechar = None

    # Próxima janela (se a atual já fechou ou ainda não abriu)
    proxima_inicio: date
    proxima_fim: date
    if ref > fim:
        # Mês que vem
        if ref.month == 12:
            prox_ref = date(ref.year + 1, 1, 1)
        else:
            prox_ref = date(ref.year, ref.month + 1, 1)
        proxima_inicio = date(prox_ref.year, prox_ref.month, JANELA_INICIO_DIA)
        proxima_fim = ultimo_dia_util_do_mes(prox_ref)
    else:
        proxima_inicio = inicio
        proxima_fim = fim

    return {
        "hoje": ref.isoformat(),
        "inicio": inicio.isoformat(),
        "fim": fim.isoformat(),
        "aberta": aberta,
        "dias_ate_abrir": dias_ate_abrir,
        "dias_ate_fechar": dias_ate_fechar,
        "proxima_inicio": proxima_inicio.isoformat(),
        "proxima_fim": proxima_fim.isoformat(),
        "dia_inicio_config": JANELA_INICIO_DIA,
        "eh_ultimo_dia_util": ref == fim,
    }


def saque_permitido_hoje(ref: Optional[date] = None) -> bool:
    """True se hoje está dentro da janela mensal."""
    return janela_atual(ref)["aberta"]


def primeiro_dia_do_mes_iso(ref: Optional[date] = None) -> str:
    """ISO timestamp UTC do primeiro instante do mês de `ref`."""
    d = primeiro_dia_do_mes(ref)
    return datetime(d.year, d.month, d.day, tzinfo=timezone.utc).isoformat()
