"""
Motor Financeiro do Gravan.

Todos os cálculos são realizados EXCLUSIVAMENTE aqui, no servidor.

Estrutura de receita (taxa ÚNICA de plataforma, independente do plano):
  25% plataforma | 75% compositores

REGRA DE TAXA STRIPE (atualizada):
  A taxa cobrada pela Stripe pelo processamento do pagamento é
  ABSORVIDA PROPORCIONALMENTE PELA EDITORA E PELOS AUTORES, e nunca
  pela Gravan. A fatia de 25% da plataforma é calculada sobre o BRUTO
  da venda e é repassada integralmente — Gravan não absorve nenhum
  centavo da taxa Stripe. Veja `services.repasses._calcular_split_sobre_net`
  para a aplicação prática (que recebe gross + net e roda a regra).

Quando a obra possui editora vinculada (titular agregado a uma editora,
ou seja, perfis.publisher_id preenchido), 10% do valor é destinado à
editora. A função `calcular_split` abaixo é usada principalmente em
PREVIEWS (sem taxa Stripe envolvida); para o split real após o
pagamento veja `repasses._calcular_split_sobre_net`.
"""
from decimal import Decimal, ROUND_DOWN
from dataclasses import dataclass, field

PLATFORM_RATE = Decimal("0.25")   # 25% — taxa única para todos os planos
EDITORA_RATE  = Decimal("0.10")   # 10% para editora vinculada


def fee_rate_for_plano(plano: str | None) -> Decimal:
    """Taxa de plataforma é fixa em 25% independente do plano."""
    return PLATFORM_RATE


@dataclass
class SplitResult:
    valor_cents:         int
    plataforma_cents:    int
    liquido_cents:       int
    intermediacao_cents: int
    edicao_cents:        int
    payouts:             list
    editora_payout:      dict | None = None


def calcular_split(
    valor_cents: int,
    coautorias: list,
    plano_titular: str = "STARTER",
    publisher_id: str | None = None,
) -> SplitResult:
    if valor_cents <= 0:
        raise ValueError("Valor da venda deve ser positivo.")

    total_pct = sum(Decimal(str(c["share_pct"])) for c in coautorias)
    if total_pct != Decimal("100"):
        raise ValueError(
            f"A soma dos splits deve ser exatamente 100%. Recebido: {total_pct}%"
        )

    platform_rate = fee_rate_for_plano(plano_titular)
    v = Decimal(str(valor_cents))
    plataforma = (v * platform_rate).to_integral_value(ROUND_DOWN)

    # Editora (se aplicável) recebe 10% do valor bruto.
    editora_cents = Decimal("0")
    editora_payout = None
    if publisher_id:
        editora_cents = (v * EDITORA_RATE).to_integral_value(ROUND_DOWN)
        editora_payout = {
            "perfil_id":   publisher_id,
            "valor_cents": int(editora_cents),
            "share_pct":   float(EDITORA_RATE * Decimal("100")),
        }

    liquido = v - plataforma - editora_cents

    payouts = []
    distribuido = Decimal("0")

    for i, coautoria in enumerate(coautorias):
        pct = Decimal(str(coautoria["share_pct"]))
        if i == len(coautorias) - 1:
            valor_compositor = int(liquido - distribuido)
        else:
            valor_compositor = int(
                (liquido * pct / Decimal("100")).to_integral_value(ROUND_DOWN)
            )
            distribuido += Decimal(str(valor_compositor))

        payouts.append({
            "perfil_id":   coautoria["perfil_id"],
            "valor_cents": valor_compositor,
            "share_pct":   float(pct),
        })

    return SplitResult(
        valor_cents=valor_cents,
        plataforma_cents=int(plataforma),
        liquido_cents=int(liquido),
        intermediacao_cents=int(plataforma),
        edicao_cents=int(editora_cents),
        payouts=payouts,
        editora_payout=editora_payout,
    )


def validar_preco(preco_cents: int) -> None:
    if not isinstance(preco_cents, int) or preco_cents < 100:
        raise ValueError("Preço mínimo: R$ 1,00 (100 centavos).")
