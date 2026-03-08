import logging
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, List

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, FastAPI, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.middleware.cors import CORSMiddleware

from database import get_db, engine, Base
from models import Order

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

app = FastAPI()
api_router = APIRouter(prefix="/api")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


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

    class Config:
        from_attributes = True


def sanitize_size_map(size_map: Dict[str, int]) -> Dict[str, int]:
    """Remove zero or negative values from size map"""
    return {k: int(v) for k, v in size_map.items() if isinstance(v, (int, float)) and v > 0}


@api_router.get("/")
async def root():
    return {"message": "Kaos Khatulistiwa Order API"}


@api_router.post("/orders", response_model=OrderResponse)
async def create_order(order_data: OrderCreate, db: AsyncSession = Depends(get_db)):
    try:
        # Sanitize size maps (remove zero values)
        cleaned_size_anak_pendek = sanitize_size_map(order_data.size_anak_pendek)
        cleaned_size_anak_panjang = sanitize_size_map(order_data.size_anak_panjang)
        cleaned_size_dewasa_pendek = sanitize_size_map(order_data.size_dewasa_pendek)
        cleaned_size_dewasa_panjang = sanitize_size_map(order_data.size_dewasa_panjang)

        if order_data.total_harga <= 0:
            raise HTTPException(status_code=400, detail="Total harga harus lebih dari 0")

        # Create new order
        new_order = Order(
            id=str(uuid.uuid4()),
            nama=order_data.nama.strip(),
            no_hp=order_data.no_hp.strip(),
            alamat=order_data.alamat.strip(),
            size_anak_pendek=cleaned_size_anak_pendek,
            size_anak_panjang=cleaned_size_anak_panjang,
            size_dewasa_pendek=cleaned_size_dewasa_pendek,
            size_dewasa_panjang=cleaned_size_dewasa_panjang,
            total_harga=int(order_data.total_harga),
        )

        db.add(new_order)
        await db.commit()
        await db.refresh(new_order)

        logger.info(f"Order created successfully: {new_order.id} - {new_order.nama}")

        return OrderResponse(
            id=new_order.id,
            nama=new_order.nama,
            no_hp=new_order.no_hp,
            alamat=new_order.alamat,
            size_anak_pendek=new_order.size_anak_pendek or {},
            size_anak_panjang=new_order.size_anak_panjang or {},
            size_dewasa_pendek=new_order.size_dewasa_pendek or {},
            size_dewasa_panjang=new_order.size_dewasa_panjang or {},
            total_harga=new_order.total_harga,
            created_at=new_order.created_at,
        )
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Error creating order")
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create order: {str(exc)}")


@api_router.get("/orders", response_model=List[OrderResponse])
async def get_orders(db: AsyncSession = Depends(get_db)):
    try:
        result = await db.execute(select(Order).order_by(Order.created_at.desc()))
        orders = result.scalars().all()

        return [
            OrderResponse(
                id=order.id,
                nama=order.nama,
                no_hp=order.no_hp,
                alamat=order.alamat,
                size_anak_pendek=order.size_anak_pendek or {},
                size_anak_panjang=order.size_anak_panjang or {},
                size_dewasa_pendek=order.size_dewasa_pendek or {},
                size_dewasa_panjang=order.size_dewasa_panjang or {},
                total_harga=order.total_harga,
                created_at=order.created_at,
            )
            for order in orders
        ]
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


@app.on_event("startup")
async def startup_event():
    logger.info("Creating database tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created successfully")


@app.on_event("shutdown")
async def shutdown_event():
    await engine.dispose()
    logger.info("Database connection closed")