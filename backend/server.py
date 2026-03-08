from fastapi import FastAPI, APIRouter, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from dotenv import load_dotenv
from pathlib import Path
from pydantic import BaseModel, Field
from typing import Dict, Optional
import os
import logging

from database import get_db
from models import Order

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Pydantic Models for API
class OrderCreate(BaseModel):
    nama: str
    no_hp: str
    alamat: str
    size_anak_pendek: Dict[str, int] = Field(default_factory=dict)
    size_anak_panjang: Dict[str, int] = Field(default_factory=dict)
    size_dewasa_pendek: Dict[str, int] = Field(default_factory=dict)
    size_dewasa_panjang: Dict[str, int] = Field(default_factory=dict)
    total_harga: int

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
    created_at: str
    
    class Config:
        from_attributes = True

@api_router.get("/")
async def root():
    return {"message": "Kaos Khatulistiwa Order API"}

@api_router.post("/orders", response_model=OrderResponse)
async def create_order(order_data: OrderCreate, db: AsyncSession = Depends(get_db)):
    """Create new t-shirt order"""
    try:
        # Create order instance
        new_order = Order(
            nama=order_data.nama,
            no_hp=order_data.no_hp,
            alamat=order_data.alamat,
            size_anak_pendek=order_data.size_anak_pendek,
            size_anak_panjang=order_data.size_anak_panjang,
            size_dewasa_pendek=order_data.size_dewasa_pendek,
            size_dewasa_panjang=order_data.size_dewasa_panjang,
            total_harga=order_data.total_harga
        )
        
        db.add(new_order)
        await db.commit()
        await db.refresh(new_order)
        
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
            created_at=new_order.created_at.isoformat()
        )
    except Exception as e:
        await db.rollback()
        logging.error(f"Error creating order: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create order: {str(e)}")

@api_router.get("/orders")
async def get_orders(db: AsyncSession = Depends(get_db)):
    """Get all orders (for admin viewing in database)"""
    try:
        result = await db.execute(
            select(Order).order_by(Order.created_at.desc())
        )
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
                created_at=order.created_at.isoformat()
            )
            for order in orders
        ]
    except Exception as e:
        logging.error(f"Error fetching orders: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch orders: {str(e)}")

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
