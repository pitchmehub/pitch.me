"""
Configuração do Gunicorn carregada automaticamente quando o servidor sobe.
Único objetivo: mascarar o header `Server: gunicorn/X.Y.Z` (defesa contra
fingerprinting de versão). Demais opções continuam vindo da CLI.
"""
import gunicorn

gunicorn.SERVER_SOFTWARE = "Gravan"
