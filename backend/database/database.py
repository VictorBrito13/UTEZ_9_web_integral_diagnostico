from typing import Tuple
import os
import sys
from sqlalchemy import Engine, create_engine
from sqlalchemy.orm import Session, declarative_base, sessionmaker

SQLALCHEMY_DATABASE_URL = os.getenv("MYSQL_CONNECTION_STRING")


# Lazily created by `_create_engine_and_session()` so importing this module
# doesn't crash when env vars are not set (e.g. local lint/test runs).
engine = None
session = None

Base = declarative_base()


def _create_engine_and_session() -> Tuple[Engine, Session]:
    """
    Create SQLAlchemy engine/session on demand.
    """

    global engine, session

    if engine is not None and session is not None:
        return

    if not SQLALCHEMY_DATABASE_URL:
        raise RuntimeError(
            "Missing MYSQL_CONNECTION_STRING env var; cannot create tables."
        )

    url = SQLALCHEMY_DATABASE_URL

    engine = create_engine(url)
    sessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    session = sessionLocal()

    return engine, session


def init_db() -> Tuple[Engine, Session]:
    """
    Ensure all SQLAlchemy models are registered and create database tables.
    This is intended to be called once on application startup.
    """

    engine, session = _create_engine_and_session()

    # Import models so they register themselves in Base.metadata.
    # This must happen before `create_all()`.
    try:
        import models.crypto_asset  # noqa: F401
    except Exception as e:
        raise RuntimeError(f"Failed to import models for table creation: {e}") from e

    Base.metadata.create_all(bind=engine)

    return engine, session