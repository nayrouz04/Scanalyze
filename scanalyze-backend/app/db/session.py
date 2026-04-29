# c'est un gestionnaire de connexion à la BD
from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import DeclarativeBase

from app.config import get_settings

settings = get_settings()

engine = create_async_engine(
    settings.DATABASE_URL,      #l'@ de la BD
    echo=settings.DEBUG,          # log SQL only in dev (affiche les requetes SQL en dev)
    pool_pre_ping=True,            # drop stale connections
    pool_size=10,
    max_overflow=20,                
    pool_recycle=3600,              #renouvelle les connexions toutes les heures
)
#async = non bloquant
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)


class Base(DeclarativeBase):
    """Shared declarative base — all models inherit from this."""
    pass

#Ouvre une session BDD pour chaque requete, la ferme automatiquement après
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency — yields a DB session per request."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()