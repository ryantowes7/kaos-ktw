from sqlalchemy import Column, String, Integer, Text, DateTime, JSON
from sqlalchemy.sql import func
from database import Base
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class Order(Base):
    __tablename__ = 'orders'
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    nama = Column(String(255), nullable=False, index=True)
    no_hp = Column(String(50), nullable=False)
    alamat = Column(Text, nullable=False)
    
    # Size data stored as JSON
    size_anak_pendek = Column(JSON, default=dict)  # {"XS": 0, "S": 0, "M": 0, "L": 0, "XL": 0, "XXL": 0}
    size_anak_panjang = Column(JSON, default=dict)
    size_dewasa_pendek = Column(JSON, default=dict)  # {"S": 0, "M": 0, "L": 0, "XL": 0, "XXL": 0, "XXXL": 0, "4XL": 0, "5XL": 0}
    size_dewasa_panjang = Column(JSON, default=dict)
    
    total_harga = Column(Integer, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    def __repr__(self):
        return f"<Order {self.nama} - Rp {self.total_harga:,}>"
