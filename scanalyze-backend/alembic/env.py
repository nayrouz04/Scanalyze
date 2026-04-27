import asyncio
from logging.config import fileConfig

from sqlalchemy.ext.asyncio import create_async_engine
from alembic import context

from app.config import get_settings
from app.db.session import Base
from app.models import User, RefreshToken

# Alembic Config object
config = context.config
settings = get_settings()

# Logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Les modèles à surveiller pour générer les migrations
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Mode sans connexion réelle à la BDD."""
    context.configure(
        url=settings.DATABASE_URL,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    """Mode avec connexion réelle à la BDD."""
    connectable = create_async_engine(settings.DATABASE_URL)

    async with connectable.connect() as connection:
        await connection.run_sync(
            lambda conn: context.configure(
                connection=conn,
                target_metadata=target_metadata,
            )
        )
        async with connection.begin():
            await connection.run_sync(
                lambda conn: context.run_migrations()
            )
    await connectable.dispose()


asyncio.run(run_migrations_online())