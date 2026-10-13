from sqlalchemy import update
from sqlalchemy.orm import Session
from fastapi import HTTPException

from models import Flight, Booking


def book_flight(
    db: Session,
    flight_id: int,
    passenger_name: str
):
    try:
        # Reduce seats only if a seat is still available.
        result = db.execute(
            update(Flight)
            .where(
                Flight.id == flight_id,
                Flight.available_seats > 0
            )
            .values(
                available_seats=Flight.available_seats - 1
            )
        )

        if result.rowcount == 0:
            flight = db.get(Flight, flight_id)

            if flight is None:
                raise HTTPException(
                    status_code=404,
                    detail="Flight not found"
                )

            raise HTTPException(
                status_code=409,
                detail="No seats available"
            )

        booking = Booking(
            flight_id=flight_id,
            passenger_name=passenger_name.strip()
        )

        db.add(booking)
        db.commit()
        db.refresh(booking)

        return booking

    except Exception:
        db.rollback()
        raise


def cancel_booking(db: Session, booking_id: int):
    try:
        booking = db.get(Booking, booking_id)

        if booking is None:
            raise HTTPException(
                status_code=404,
                detail="Booking not found"
            )

        flight = db.get(Flight, booking.flight_id)

        if flight is None:
            raise HTTPException(
                status_code=500,
                detail="Booking has no valid flight"
            )

        db.delete(booking)

        db.execute(
            update(Flight)
            .where(Flight.id == flight.id)
            .values(
                available_seats=Flight.available_seats + 1
            )
        )

        db.commit()

        return {
            "message": "Booking cancelled successfully",
            "booking_id": booking_id
        }

    except Exception:
        db.rollback()
        raise