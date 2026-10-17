# Flight Ticket Booking System

A full-stack flight booking application built with FastAPI, SQLite, SQLAlchemy, Alembic, React, and Axios.

## Features

- Create and search flights
- Book seats and prevent overbooking
- Cancel bookings and restore seat availability
- Input validation and meaningful HTTP errors
- OpenAPI documentation through Swagger UI
- Database migrations using Alembic
- Automated backend tests
- Python SDK generated using OpenAPI Generator CLI
- Windows setup and launch scripts

## Prerequisites

- Python 3.10 or a compatible version supported by the dependencies
- Node.js and npm
- OpenAPI Generator CLI for SDK generation

## Project Setup

1. Clone the repository.
2. Open a terminal in the project root.
3. Run `setupdev.bat`.
4. Run `runapplication.bat`.

## API Documentation

With the backend running, visit:

`http://localhost:8000/docs`

## Run Backend Tests

Open a terminal in the `backend` directory and run:

`python -m pytest -v`

## Generate the Python SDK

Start the backend, then run the OpenAPI Generator CLI command documented in this repository.

## Technologies

- Backend: FastAPI, SQLAlchemy
- Database: SQLite
- Migrations: Alembic
- Frontend: React, Axios
- API specification: OpenAPI
- SDK: OpenAPI Generator CLI
- Testing: Pytest, HTTPX