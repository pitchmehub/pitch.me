"""
Serviço de Carimbo de Tempo RFC 3161 — Gravan
==============================================
Integra com o FreeTSA.org (gratuito, confiável) para obter um token
de carimbo de tempo criptograficamente verificável a cada assinatura.

O token TSR (DER) é gravado no banco junto ao registro de assinatura e
incluído no Certificado de Assinaturas Digitais como linha adicional de
não-repúdio, conforme RFC 3161 / RFC 3628.

Uso:
    from services.tsa import carimbar
    resultado = carimbar(payload_bytes)
    # resultado = {"ok": True, "token_b64": "...", "payload_hash": "..."}
    # ou         {"ok": False, "erro": "..."}

O carimbo é SEMPRE best-effort: se o servidor TSA estiver indisponível
ou lento, a assinatura prossegue normalmente e ok=False é retornado.
"""
import base64
import hashlib
import logging
import os

import requests

logger = logging.getLogger("gravan.tsa")

# FreeTSA.org — RFC 3161, gratuito, sem necessidade de conta
_TSA_URL     = os.environ.get("TSA_URL", "https://freetsa.org/tsr")
_TSA_TIMEOUT = int(os.environ.get("TSA_TIMEOUT_S", "12"))


# ─── Construção manual do TSQ (DER) ────────────────────────────────────────
# Não usamos bibliotecas externas de ASN.1 para manter zero dependências novas.
# A estrutura é fixa para SHA-256 (32 bytes), tornando a codificação trivial.

def _encode_length(n: int) -> bytes:
    """DER definite-form length encoding."""
    if n < 0x80:
        return bytes([n])
    if n < 0x100:
        return bytes([0x81, n])
    return bytes([0x82, (n >> 8) & 0xFF, n & 0xFF])


def _tlv(tag: int, content: bytes) -> bytes:
    """DER TLV (tag-length-value) wrapper."""
    return bytes([tag]) + _encode_length(len(content)) + content


def _build_tsq(hash32: bytes) -> bytes:
    """
    Monta um TimeStampReq RFC 3161 mínimo para SHA-256 (32 bytes).

    TimeStampReq ::= SEQUENCE {
        version         INTEGER { v1(1) },
        messageImprint  MessageImprint,   -- SHA-256 do payload
        certReq         BOOLEAN TRUE      -- inclui cert da TSA na resposta
    }
    """
    if len(hash32) != 32:
        raise ValueError("hash32 deve ter exatamente 32 bytes (SHA-256)")

    # SHA-256 OID: 2.16.840.1.101.3.4.2.1
    # Encodificação DER: 60 86 48 01 65 03 04 02 01
    oid_sha256 = bytes([0x60, 0x86, 0x48, 0x01, 0x65, 0x03, 0x04, 0x02, 0x01])

    # AlgorithmIdentifier ::= SEQUENCE { OID, NULL }
    alg_id = _tlv(0x30, _tlv(0x06, oid_sha256) + bytes([0x05, 0x00]))

    # MessageImprint ::= SEQUENCE { AlgorithmIdentifier, OCTET STRING }
    msg_imprint = _tlv(0x30, alg_id + _tlv(0x04, hash32))

    # version INTEGER v1 = 1
    version = bytes([0x02, 0x01, 0x01])

    # certReq BOOLEAN TRUE
    cert_req = bytes([0x01, 0x01, 0xFF])

    # TimeStampReq SEQUENCE
    return _tlv(0x30, version + msg_imprint + cert_req)


def _parse_tsr_status(tsr: bytes) -> int:
    """
    Extrai o PKIStatus (0=granted, 1=grantedWithMods) do TSR DER.
    Retorna -1 se não conseguir parsear.
    """
    try:
        # TSR: SEQUENCE { PKIStatusInfo SEQUENCE { status INTEGER ... } ... }
        # Pulamos: tag(1) + length(1..3) + tag(1) + length(1..3) + tag(1) + length(1)
        i = 0
        if tsr[i] != 0x30:
            return -1
        i += 1
        # skip outer length
        if tsr[i] & 0x80:
            i += 1 + (tsr[i] & 0x7F)
        else:
            i += 1
        # PKIStatusInfo SEQUENCE
        if tsr[i] != 0x30:
            return -1
        i += 1
        if tsr[i] & 0x80:
            i += 1 + (tsr[i] & 0x7F)
        else:
            i += 1
        # status INTEGER
        if tsr[i] != 0x02:
            return -1
        i += 1
        length = tsr[i]; i += 1
        status = int.from_bytes(tsr[i:i + length], "big")
        return status
    except Exception:
        return -1


# ─── API pública ────────────────────────────────────────────────────────────

def carimbar(payload: bytes) -> dict:
    """
    Obtém um carimbo de tempo RFC 3161 para o payload informado.

    O hash SHA-256 do payload é enviado à TSA. O token DER retornado
    (TSR) é armazenado em base64 no banco de dados junto ao contrato.

    Args:
        payload: bytes arbitrários que identificam esta assinatura de
                 forma única (contract_id + user_id + timestamp + ip_hash).

    Returns:
        {
            "ok":           bool,
            "token_b64":    str | None,   # TSR base64 (DER)
            "payload_hash": str,          # hex SHA-256 do payload
            "tsa_url":      str,
            "erro":         str | None,
        }
    """
    payload_hash = hashlib.sha256(payload).digest()
    result: dict = {
        "ok":           False,
        "token_b64":    None,
        "payload_hash": payload_hash.hex(),
        "tsa_url":      _TSA_URL,
        "erro":         None,
    }

    try:
        tsq = _build_tsq(payload_hash)
        resp = requests.post(
            _TSA_URL,
            data=tsq,
            headers={"Content-Type": "application/timestamp-query"},
            timeout=_TSA_TIMEOUT,
        )
        resp.raise_for_status()

        tsr = resp.content
        if not tsr or tsr[0] != 0x30:
            result["erro"] = "Resposta TSA com formato inválido"
            logger.warning("TSA: resposta inválida (len=%d)", len(tsr))
            return result

        status = _parse_tsr_status(tsr)
        if status not in (0, 1):
            result["erro"] = f"TSA rejeitou a requisição (status={status})"
            logger.warning("TSA: status=%d", status)
            return result

        result["ok"]        = True
        result["token_b64"] = base64.b64encode(tsr).decode("ascii")
        logger.info(
            "TSA: carimbo obtido com sucesso (payload_hash=%s, tsr_bytes=%d)",
            payload_hash.hex()[:16] + "…",
            len(tsr),
        )

    except requests.Timeout:
        result["erro"] = f"Timeout ({_TSA_TIMEOUT}s) ao contactar TSA"
        logger.warning("TSA: timeout")
    except requests.RequestException as exc:
        result["erro"] = f"Erro de rede TSA: {exc}"
        logger.warning("TSA: erro de rede: %s", exc)
    except Exception as exc:
        result["erro"] = f"Erro inesperado TSA: {exc}"
        logger.exception("TSA: erro inesperado")

    return result


def montar_payload_edicao(
    contract_id: str,
    user_id: str,
    role: str,
    timestamp_utc: str,
    ip_hash: str,
) -> bytes:
    """Monta o payload canônico para um evento de assinatura de contrato de edição."""
    s = f"gravan|edicao|{contract_id}|{user_id}|{role}|{timestamp_utc}|{ip_hash}"
    return s.encode("utf-8")


def montar_payload_licenciamento(
    contract_id: str,
    user_id: str,
    role: str,
    timestamp_utc: str,
    ip_hash: str,
) -> bytes:
    """Monta o payload canônico para assinatura de contrato de licenciamento."""
    s = f"gravan|licenciamento|{contract_id}|{user_id}|{role}|{timestamp_utc}|{ip_hash}"
    return s.encode("utf-8")


def resumo_token(token_b64: str | None) -> str:
    """
    Retorna os primeiros e últimos 8 chars do token (para exibição no certificado).
    Ex.: 'MIIHoDADB…(+2847 bytes)…+Xq=='
    """
    if not token_b64:
        return "—"
    if len(token_b64) <= 20:
        return token_b64
    total_bytes = len(base64.b64decode(token_b64))
    return f"{token_b64[:16]}…(+{total_bytes - 12} bytes)…{token_b64[-8:]}"
