from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.flights import router as flights_router
from routes.bookings import router as bookings_router

app = FastAPI(
    title="Flight Ticket Booking System",
    description="API for flight search, seat booking and cancellation",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["Content-Type"]
)

app.include_router(flights_router)
app.include_router(bookings_router)


@app.get("/")
def home():
    return {"message": "Flight Booking API is running"}