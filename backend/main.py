from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from controllers.crypto_asset_router import router
from database.database import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup (safe to call even if tables already exist).
    engine, session = init_db()

    app.state.my_sql_session = session
    app.state.my_sql_engine = engine
    yield

    engine.dispose()


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router=router, prefix="/api")

@app.get("/")
def read_root():
    return {"message": "Hello, World!"}