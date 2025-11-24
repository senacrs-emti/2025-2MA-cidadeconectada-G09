import pandas as pd
import json
import unicodedata

arquivo = "DADOS_JAN_SET_2025.csv"
saida = "crimes.json"

# -------------------------------
# FUNÇÃO DE NORMALIZAÇÃO
# -------------------------------
def normalizar(texto):
    if not isinstance(texto, str):
        return ""
    texto = texto.upper()
    texto = unicodedata.normalize("NFD", texto)
    texto = texto.encode("ascii", "ignore").decode("utf-8")
    return texto.strip()

# -------------------------------
# CARREGAR CSV
# -------------------------------
dados = pd.read_csv(arquivo, sep=";", encoding="latin1", low_memory=False)

# Normalização
dados["Municipio Fato"] = dados["Municipio Fato"].astype(str).apply(normalizar)
dados["Tipo Enquadramento"] = dados["Tipo Enquadramento"].astype(str).apply(normalizar)

# Algumas planilhas vêm com "Bairro" ou "Bairro Fato"
if "Bairro Fato" in dados.columns:
    dados["Bairro"] = dados["Bairro Fato"]
else:
    dados["Bairro"] = dados["Bairro"]

dados["Bairro"] = dados["Bairro"].astype(str).apply(normalizar)

# Filtrar Porto Alegre
poa = dados[dados["Municipio Fato"] == "PORTO ALEGRE"]

# -------------------------------
# GERAR DICIONÁRIO DE CRIMES
# -------------------------------
crimes = {}

tipos = sorted(poa["Tipo Enquadramento"].unique())

for crime in tipos:
    df_crime = poa[poa["Tipo Enquadramento"] == crime]
    contagem = df_crime["Bairro"].value_counts().to_dict()
    crimes[crime] = contagem  # { "CRIME": { BAIRRO: QUANTIDADE } }

# -------------------------------
# SALVAR JSON
# -------------------------------
with open(saida, "w", encoding="utf-8") as f:
    json.dump(crimes, f, indent=2, ensure_ascii=False)

print("crimes.json gerado com sucesso!")
