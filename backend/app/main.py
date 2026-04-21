from datetime import date
from pathlib import Path
from typing import List

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

app = FastAPI(title="Expense Tracker API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ FIXED MODEL (simple & stable)
class Expense(BaseModel):
    date: date
    category: str
    description: str = ""
    amount: float

# in-memory storage
EXPENSES: List[Expense] = []

# routes
@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/expenses")
def add_expense(expense: Expense):
    EXPENSES.append(expense)
    return {"message": "Expense added", "count": len(EXPENSES)}

@app.get("/expenses")
def get_expenses():
    return EXPENSES

@app.post("/expenses/upload")
async def upload_expenses(file: UploadFile = File(...)):
    content = await file.read()
    lines = content.decode("utf-8").splitlines()
    inserted = max(0, len(lines) - 1)
    return {"filename": file.filename, "rows_received": inserted}

# optional frontend hosting
frontend_build = Path(__file__).resolve().parent / "static"
if frontend_build.exists():
    app.mount("/", StaticFiles(directory=frontend_build, html=True), name="frontend")
