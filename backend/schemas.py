from pydantic import BaseModel, Field, ConfigDict


class FlightCreate(BaseModel):
    code: str = Field(min_length=2, max_length=20)
    total_seats: int = Field(gt=0)


class FlightResponse(BaseModel):
    id: int
    code: str
    total_seats: int
    available_seats: int

    model_config = ConfigDict(from_attributes=True)


class BookingCreate(BaseModel):
    passenger_name: str = Field(min_length=1, max_length=100)


class BookingResponse(BaseModel):
    id: int
    flight_id: int
    passenger_name: str

    model_config = ConfigDict(from_attributes=True)