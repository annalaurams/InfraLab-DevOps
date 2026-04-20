import httpx
from fastapi import HTTPException

async def busca_cep(cep: str):
    # Consulta a BrasilAPI e normaliza a resposta para o formato do ViaCEP,

    url = f"https://brasilapi.com.br/api/cep/v1/{cep}"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        
        if response.status_code != 200:
            raise HTTPException(status_code=404, detail="CEP não encontrado")

        data = response.json()

        return {
            "cep": data.get("cep", cep),
            "logradouro": data.get("street", ""),
            "bairro": data.get("neighborhood", ""),
            "localidade": data.get("city", ""),
            "uf": data.get("state", ""),
            "complemento": data.get("complement", ""),
            "ibge": data.get("ibge", ""),
            "gia": data.get("gia", ""),
            "ddd": data.get("ddd", ""),
            "siafi": data.get("siafi", ""),
        }