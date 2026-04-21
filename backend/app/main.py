from datetime import date
from pathlib import Path
from typing import List

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

app = FastAPI(title="Expense Tracker API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Expense(BaseModel):
    date: date
    category: str = Field(min_length=2)
    description: str = ""
    amount: float = Field(ge=0)


EXPENSES: List[Expense] = []


@app.get("/health")
def health() -> dict:
    return {"status": "ok"}


@app.post("/expenses")
def add_expense(expense: Expense) -> dict:
    EXPENSES.append(expense)
    return {"message": "Expense added", "count": len(EXPENSES)}


@app.get("/expenses")
def get_expenses() -> List[Expense]:
    return EXPENSES


@app.post("/expenses/upload")
async def upload_expenses(file: UploadFile = File(...)) -> dict:
    content = await file.read()
    lines = content.decode("utf-8").splitlines()
    inserted = max(0, len(lines) - 1)
    return {"filename": file.filename, "rows_received": inserted}


frontend_build = Path(__file__).resolve().parent / "static"
if frontend_build.exists():
    app.mount("/", StaticFiles(directory=frontend_build, html=True), name="frontend")
