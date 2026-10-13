from sqlalchemy import String, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database import Base


class Flight(Base):
    __tablename__ = "flights"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, index=True
    )
    code: Mapped[str] = mapped_column(
        String(20), unique=True, nullable=False
    )
    total_seats: Mapped[int] = mapped_column(
        Integer, nullable=False
    )
    available_seats: Mapped[int] = mapped_column(
        Integer, nullable=False
    )

    bookings: Mapped[list["Booking"]] = relationship(
        back_populates="flight"
    )


class Booking(Base):
    __tablename__ = "bookings"

    id: Mapped[int] = mapped_column(
        Integer, primary_key=True, index=True
    )
    flight_id: Mapped[int] = mapped_column(
        ForeignKey("flights.id"), nullable=False, index=True
    )
    passenger_name: Mapped[str] = mapped_column(
        String(100), nullable=False
    )

    flight: Mapped["Flight"] = relationship(
        back_populates="bookings"
    )