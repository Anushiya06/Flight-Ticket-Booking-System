from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Flight
from schemas import FlightCreate, FlightResponse

router = APIRouter(prefix="/flights", tags=["Flights"])


@router.post("/", response_model=FlightResponse, status_code=201)
def create_flight(
    data: FlightCreate,
    db: Session = Depends(get_db)
):
    code = data.code.strip().upper()

    if not code:
        raise HTTPException(
            status_code=422,
            detail="Flight code cannot be empty"
        )

    existing = db.query(Flight).filter(
        Flight.code == code
    ).first()

    if existing:
        raise HTTPException(
            status_code=409,
            detail="Flight code already exists"
        )

    flight = Flight(
        code=code,
        total_seats=data.total_seats,
        available_seats=data.total_seats
    )

    db.add(flight)
    db.commit()
    db.refresh(flight)

    return flight


@router.get("/", response_model=list[FlightResponse])
def list_flights(db: Session = Depends(get_db)):
    return db.query(Flight).order_by(Flight.id).all()