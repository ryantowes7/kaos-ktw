import logging
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List

from dotenv import load_dotenv
from fastapi import APIRouter, FastAPI, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from starlette.middleware.cors import CORSMiddleware


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

app = FastAPI()
api_router = APIRouter(prefix="/api")


class OrderCreate(BaseModel):
    nama: str = Field(min_length=2)
    no_hp: str = Field(min_length=8)
    alamat: str = Field(min_length=5)
    size_anak_pendek: Dict[str, int] = Field(default_factory=dict)
    size_anak_panjang: Dict[str, int] = Field(default_factory=dict)
    size_dewasa_pendek: Dict[str, int] = Field(default_factory=dict)
    size_dewasa_panjang: Dict[str, int] = Field(default_factory=dict)
    total_harga: int = Field(ge=0)


class OrderResponse(BaseModel):
    id: str
    nama: str
    no_hp: str
    alamat: str
    size_anak_pendek: Dict[str, int]
    size_anak_panjang: Dict[str, int]
    size_dewasa_pendek: Dict[str, int]
    size_dewasa_panjang: Dict[str, int]
    total_harga: int
    created_at: datetime


def sanitize_size_map(size_map: Dict[str, int]) -> Dict[str, int]:
    return {k: int(v) for k, v in size_map.items() if isinstance(v, int) and v > 0}


@api_router.get("/")
async def root():
    return {"message": "Kaos Khatulistiwa Order API"}


@api_router.post("/orders", response_model=OrderResponse)
async def create_order(order_data: OrderCreate):
    try:
        cleaned_order = {
            "id": str(uuid.uuid4()),
            "nama": order_data.nama.strip(),
            "no_hp": order_data.no_hp.strip(),
            "alamat": order_data.alamat.strip(),
            "size_anak_pendek": sanitize_size_map(order_data.size_anak_pendek),
            "size_anak_panjang": sanitize_size_map(order_data.size_anak_panjang),
            "size_dewasa_pendek": sanitize_size_map(order_data.size_dewasa_pendek),
            "size_dewasa_panjang": sanitize_size_map(order_data.size_dewasa_panjang),
            "total_harga": int(order_data.total_harga),
            "created_at": datetime.now(timezone.utc).isoformat(),
        }

        if cleaned_order["total_harga"] <= 0:
            raise HTTPException(status_code=400, detail="Total harga harus lebih dari 0")

        await db.orders.insert_one(cleaned_order)

        return OrderResponse(
            **{
                **cleaned_order,
                "created_at": datetime.fromisoformat(cleaned_order["created_at"]),
            }
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Error creating order")
        raise HTTPException(status_code=500, detail=f"Failed to create order: {str(exc)}")


@api_router.get("/orders", response_model=List[OrderResponse])
async def get_orders():
    try:
        orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
        results: List[OrderResponse] = []

        for order in orders:
            created_at = order.get("created_at")
            if isinstance(created_at, str):
                order["created_at"] = datetime.fromisoformat(created_at)

            results.append(OrderResponse(**order))

        return results
    except Exception as exc:
        logger.exception("Error fetching orders")
        raise HTTPException(status_code=500, detail=f"Failed to fetch orders: {str(exc)}")


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()