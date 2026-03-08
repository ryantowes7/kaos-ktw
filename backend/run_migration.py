import asyncio
import asyncpg
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / '.env')

async def run_migration():
    database_url = os.environ.get('DATABASE_URL')
    
    # Parse the connection string
    conn = await asyncpg.connect(database_url)
    
    try:
        # Check if table exists
        table_exists = await conn.fetchval("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'orders'
            );
        """)
        
        if table_exists:
            print("✅ Table 'orders' already exists. Skipping migration.")
            return
        
        # Create orders table
        await conn.execute("""
            CREATE TABLE orders (
                id VARCHAR(36) PRIMARY KEY,
                nama VARCHAR(255) NOT NULL,
                no_hp VARCHAR(50) NOT NULL,
                alamat TEXT NOT NULL,
                size_anak_pendek JSONB DEFAULT '{}',
                size_anak_panjang JSONB DEFAULT '{}',
                size_dewasa_pendek JSONB DEFAULT '{}',
                size_dewasa_panjang JSONB DEFAULT '{}',
                total_harga INTEGER NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
            );
        """)
        
        # Create indexes
        await conn.execute("CREATE INDEX idx_orders_nama ON orders(nama);")
        await conn.execute("CREATE INDEX idx_orders_created_at ON orders(created_at);")
        
        print("✅ Migration completed successfully!")
        print("✅ Table 'orders' created with indexes.")
        
    except Exception as e:
        print(f"❌ Migration error: {e}")
        raise
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(run_migration())