from fastapi import APIRouter, HTTPException

from app.services.viacep import busca_cep

router = APIRouter(prefix="/address", tags=["Address"])


@router.get("/cep/{cep}")
async def get_address_by_cep(cep: str):
    cleaned_cep = "".join(ch for ch in cep if ch.isdigit())

    if len(cleaned_cep) != 8:
        raise HTTPException(status_code=400, detail="CEP inválido. Informe 8 dígitos.")

    return await busca_cep(cleaned_cep)