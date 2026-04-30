"""Unit tests dos parsers puros do bulk_obras.

Cobre:
  - _parse_preco com várias formatações
  - _parse_coautores com formatos válidos e inválidos
  - _digits / _resolver_titular
  - gerar_csv_template gera UTF-8 com BOM e cabeçalhos esperados
"""
import io
import os
import sys

import pytest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services import bulk_obras as bo


def test_parse_preco_aceita_virgula_brasileira():
    assert bo._parse_preco("199,90") == 19990
    assert bo._parse_preco("R$ 199,90") == 19990
    assert bo._parse_preco("1.234,56") == 123456


def test_parse_preco_aceita_ponto_decimal():
    assert bo._parse_preco("199.90") == 19990
    assert bo._parse_preco("0.01") == 1


def test_parse_preco_rejeita_zero_ou_vazio():
    with pytest.raises(ValueError):
        bo._parse_preco("")
    with pytest.raises(ValueError):
        bo._parse_preco("0")
    with pytest.raises(ValueError):
        bo._parse_preco("-10")


def test_parse_coautores_basico():
    out = bo._parse_coautores("a@b.com:30; c@d.com:20")
    assert out == [("a@b.com", 30.0), ("c@d.com", 20.0)]


def test_parse_coautores_vazio():
    assert bo._parse_coautores("") == []
    assert bo._parse_coautores(None) == []


def test_parse_coautores_email_invalido():
    with pytest.raises(ValueError):
        bo._parse_coautores("semarroba:30")


def test_parse_coautores_share_invalido():
    with pytest.raises(ValueError):
        bo._parse_coautores("a@b.com:abc")
    with pytest.raises(ValueError):
        bo._parse_coautores("a@b.com:0")
    with pytest.raises(ValueError):
        bo._parse_coautores("a@b.com:100")


def test_parse_coautores_falta_separador():
    with pytest.raises(ValueError):
        bo._parse_coautores("a@b.com 30")


def test_digits_extrai_apenas_numeros():
    assert bo._digits("123.456.789-09") == "12345678909"
    assert bo._digits(None) == ""
    assert bo._digits("abc") == ""


def test_resolver_titular_por_email():
    agregados = [
        {"id": "u1", "email": "JOAO@example.com", "cpf_display": None},
        {"id": "u2", "email": "maria@example.com", "cpf_display": "11122233344"},
    ]
    t = bo._resolver_titular(agregados, "", "joao@example.com")
    assert t["id"] == "u1"


def test_resolver_titular_por_cpf_display():
    agregados = [
        {"id": "u1", "email": "a@a.com", "cpf_display": "111.222.333-44"},
    ]
    t = bo._resolver_titular(agregados, "11122233344", "")
    assert t["id"] == "u1"


def test_resolver_titular_nao_encontrado():
    with pytest.raises(ValueError):
        bo._resolver_titular(
            [{"id": "u1", "email": "a@a.com"}],
            "99999999999",
            "outro@x.com",
        )


def test_resolver_titular_exige_cpf_ou_email():
    with pytest.raises(ValueError):
        bo._resolver_titular([{"id": "u1"}], "", "")


def test_csv_template_tem_bom_e_cabecalhos():
    raw = bo.gerar_csv_template()
    assert raw.startswith(b"\xef\xbb\xbf"), "CSV deve começar com BOM UTF-8"
    texto = raw.decode("utf-8-sig")
    primeira_linha = texto.splitlines()[0]
    for h in bo.CSV_HEADERS:
        assert h in primeira_linha, f"header '{h}' faltando no template"


def test_processar_zip_valida_zip_corrompido():
    with pytest.raises(ValueError):
        bo.processar_zip("pub-id", b"isso-nao-eh-um-zip")


def test_processar_zip_rejeita_vazio():
    with pytest.raises(ValueError):
        bo.processar_zip("pub-id", b"")
