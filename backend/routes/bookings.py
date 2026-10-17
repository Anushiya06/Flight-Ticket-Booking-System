from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from schemas import BookingCreate, BookingResponse
from services.booking_service import book_flight, cancel_booking

router = APIRouter(tags=["Bookings"])


@router.post(
    "/flights/{flight_id}/book",
    response_model=BookingResponse,
    status_code=201
)
def create_booking(
    flight_id: int,
    data: BookingCreate,
    db: Session = Depends(get_db)
):
    return book_flight(
        db, flight_id, data.passenger_name
    )


@router.delete("/bookings/{booking_id}")
def delete_booking(
    booking_id: int,
    db: Session = Depends(get_db)
):
    return cancel_booking(db, booking_id)