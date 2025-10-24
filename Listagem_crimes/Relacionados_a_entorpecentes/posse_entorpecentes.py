import pandas as pd

arquivo = "DADOS_JAN_SET_2025.csv"

dados = pd.read_csv(arquivo, sep=";", encoding="latin1", low_memory=False)

dados["Municipio Fato"] = dados["Municipio Fato"].astype(str).str.upper()
dados["Tipo Enquadramento"] = dados["Tipo Enquadramento"].astype(str).str.upper()

poa = dados[dados["Municipio Fato"] == "PORTO ALEGRE"]

posse = poa[poa["Tipo Enquadramento"].str.contains("ENTORPECENTES  POSSE", na=False)]

por_bairro = posse["Bairro"].value_counts()

print("Posse de entorpecentes por bairro em Porto Alegre (2025):\n")
for bairro, quantidade in por_bairro.items():
    print(f"{bairro}: {quantidade}")