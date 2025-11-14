import pandas as pd

arquivo = "DADOS_JAN_SET_2025.csv"

dados = pd.read_csv(arquivo, sep=";", encoding="latin1", low_memory=False)

dados["Municipio Fato"] = dados["Municipio Fato"].astype(str).str.upper()
dados["Tipo Enquadramento"] = dados["Tipo Enquadramento"].astype(str).str.upper()

poa = dados[dados["Municipio Fato"] == "PORTO ALEGRE"]

sequestro_c = poa[poa["Tipo Enquadramento"].str.contains("SEQUESTRO E CARCERE PRIVADO", na=False)]

por_bairro = sequestro_c["Bairro"].value_counts()

print("Sequestros com cárcere por bairro em Porto Alegre (2025):\n")
for bairro, quantidade in por_bairro.items():
    print(f"{bairro}: {quantidade}")