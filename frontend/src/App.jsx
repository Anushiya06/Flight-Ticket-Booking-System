import { useCallback, useEffect, useState } from "react";

import {
  addFlight,
  bookSeat,
  cancelBooking,
  getBookings,
  getErrorMessage,
  getFlights,
} from "./services/api";

import "./index.css";

function App() {
  const [flights, setFlights] = useState([]);
  const [bookings, setBookings] = useState([]);

  const [loadingFlights, setLoadingFlights] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);

  const [flightCode, setFlightCode] = useState("");
  const [totalSeats, setTotalSeats] = useState("");

  const [passengerNames, setPassengerNames] = useState({});
  const [submittingFlight, setSubmittingFlight] = useState(false);
  const [submittingBooking, setSubmittingBooking] = useState(null);
  const [cancellingBooking, setCancellingBooking] = useState(null);

  const [message, setMessage] = useState(null);
  const [flightError, setFlightError] = useState("");
  const [bookingError, setBookingError] = useState("");

  // FEATURE 1: Load all flights from the backend
  const loadFlights = useCallback(async () => {
    setLoadingFlights(true);
    setFlightError("");

    try {
      const data = await getFlights();
      setFlights(data);
    } catch (error) {
      setFlightError(getErrorMessage(error));
    } finally {
      setLoadingFlights(false);
    }
  }, []);

  // FEATURE 2: Load all bookings
  const loadBookings = useCallback(async () => {
    setLoadingBookings(true);
    setBookingError("");

    try {
      const data = await getBookings();
      setBookings(data);
    } catch (error) {
      setBookingError(getErrorMessage(error));
    } finally {
      setLoadingBookings(false);
    }
  }, []);

  // Run when the application first opens
  useEffect(() => {
    loadFlights();
    loadBookings();
  }, [loadFlights, loadBookings]);

  // FEATURE 3: Add a new flight
  const handleAddFlight = async (event) => {
    event.preventDefault();
    setMessage(null);

    const code = flightCode.trim().toUpperCase();
    const seats = Number(totalSeats);

    if (!code) {
      setMessage({
        type: "error",
        text: "Please enter a flight code.",
      });
      return;
    }

    if (!Number.isInteger(seats) || seats <= 0) {
      setMessage({
        type: "error",
        text: "Total seats must be a positive whole number.",
      });
      return;
    }

    setSubmittingFlight(true);

    try {
      await addFlight({
        code,
        total_seats: seats,
      });

      setFlightCode("");
      setTotalSeats("");

      setMessage({
        type: "success",
        text: "Flight added successfully!",
      });

      await loadFlights();
    } catch (error) {
      setMessage({
        type: "error",
        text: getErrorMessage(error),
      });
    } finally {
      setSubmittingFlight(false);
    }
  };

  // FEATURE 4: Book one seat on a selected flight
  const handleBookSeat = async (event, flightId) => {
    event.preventDefault();
    setMessage(null);

    const passengerName = (passengerNames[flightId] || "").trim();

    if (!passengerName) {
      setMessage({
        type: "error",
        text: "Please enter the passenger's name.",
      });
      return;
    }

    setSubmittingBooking(flightId);

    try {
      const result = await bookSeat(flightId, passengerName);

      setPassengerNames((previous) => ({
        ...previous,
        [flightId]: "",
      }));

      const bookingId =
        result?.id ?? result?.booking_id ?? result?.booking?.id;

      setMessage({
        type: "success",
        text:
          bookingId !== undefined
            ? `Booking successful! Your booking ID is ${bookingId}.`
            : "Booking successful!",
      });

      await Promise.all([loadFlights(), loadBookings()]);
    } catch (error) {
      setMessage({
        type: "error",
        text: getErrorMessage(error),
      });

      // Refresh in case another passenger took the last seat.
      await loadFlights();
    } finally {
      setSubmittingBooking(null);
    }
  };

  // FEATURE 5: Cancel an existing booking
  const handleCancelBooking = async (bookingId) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel booking ${bookingId}?`
    );

    if (!confirmed) return;

    setMessage(null);
    setCancellingBooking(bookingId);

    try {
      await cancelBooking(bookingId);

      setMessage({
        type: "success",
        text: `Booking ${bookingId} cancelled successfully.`,
      });

      await Promise.all([loadFlights(), loadBookings()]);
    } catch (error) {
      setMessage({
        type: "error",
        text: getErrorMessage(error),
      });
    } finally {
      setCancellingBooking(null);
    }
  };

  return (
    <div className="app">
      <header className="hero">
        <div className="hero-content">
          <p className="eyebrow">FLIGHT MANAGEMENT PORTAL</p>

          <h1>Flight Ticket Booking</h1>

          <p className="hero-description">
            Find flights, reserve your seat, and manage your bookings
            in one place.
          </p>
        </div>

        <div className="hero-icon" aria-hidden="true">
          ✈
        </div>
      </header>

      <main className="container">
        {/* Summary cards */}
        <section className="summary-grid">
          <div className="summary-card">
            <span className="summary-label">Total flights</span>
            <strong>{flights.length}</strong>
          </div>

          <div className="summary-card">
            <span className="summary-label">Available seats</span>
            <strong>
              {flights.reduce(
                (sum, flight) => sum + (flight.available_seats || 0),
                0
              )}
            </strong>
          </div>

          <div className="summary-card">
            <span className="summary-label">Current bookings</span>
            <strong>{bookings.length}</strong>
          </div>
        </section>

        {/* Success and error messages */}
        {message && (
          <div
            className={`notice ${
              message.type === "success" ? "notice-success" : "notice-error"
            }`}
            role="status"
          >
            <span>{message.text}</span>

            <button
              className="notice-close"
              type="button"
              aria-label="Dismiss message"
              onClick={() => setMessage(null)}
            >
              ×
            </button>
          </div>
        )}

        {/* Add flight form */}
        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">MANAGEMENT</p>
              <h2>Add a flight</h2>
            </div>
            <span className="section-icon">＋</span>
          </div>

          <form className="flight-form" onSubmit={handleAddFlight}>
            <div className="form-field">
              <label htmlFor="flightCode">Flight code</label>
              <input
                id="flightCode"
                type="text"
                placeholder="e.g. AI101"
                value={flightCode}
                onChange={(event) => setFlightCode(event.target.value)}
                maxLength={20}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="totalSeats">Total seats</label>
              <input
                id="totalSeats"
                type="number"
                placeholder="e.g. 100"
                min="1"
                step="1"
                value={totalSeats}
                onChange={(event) => setTotalSeats(event.target.value)}
                required
              />
            </div>

            <button
              className="button button-primary add-button"
              type="submit"
              disabled={submittingFlight}
            >
              {submittingFlight ? "Adding..." : "Add flight"}
            </button>
          </form>
        </section>

        {/* Flight listing and booking */}
        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">EXPLORE</p>
              <h2>Available flights</h2>
              <p className="section-description">
                Enter a passenger name to reserve one seat.
              </p>
            </div>

            <button
              className="button button-secondary"
              type="button"
              onClick={loadFlights}
              disabled={loadingFlights}
            >
              {loadingFlights ? "Loading..." : "Refresh"}
            </button>
          </div>

          {flightError && (
            <div className="inline-error" role="alert">
              {flightError}
            </div>
          )}

          {loadingFlights ? (
            <p className="empty-state">Loading flights...</p>
          ) : flights.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">✈</span>
              <h3>No flights available</h3>
              <p>Add a flight using the form above to get started.</p>
            </div>
          ) : (
            <div className="flight-grid">
              {flights.map((flight) => {
                const available = flight.available_seats > 0;
                const full = !available;

                return (
                  <article className="flight-card" key={flight.id}>
                    <div className="flight-card-top">
                      <span className="flight-symbol">✈</span>

                      <span
                        className={`status ${
                          full ? "status-full" : "status-available"
                        }`}
                      >
                        {full ? "Fully booked" : "Seats available"}
                      </span>
                    </div>

                    <p className="flight-label">FLIGHT CODE</p>
                    <h3>{flight.code}</h3>

                    <div className="seat-details">
                      <div>
                        <span>Total seats</span>
                        <strong>{flight.total_seats}</strong>
                      </div>

                      <div>
                        <span>Seats left</span>
                        <strong>{flight.available_seats}</strong>
                      </div>
                    </div>

                    <form
                      className="booking-form"
                      onSubmit={(event) =>
                        handleBookSeat(event, flight.id)
                      }
                    >
                      <label htmlFor={`passenger-${flight.id}`}>
                        Passenger name
                      </label>

                      <input
                        id={`passenger-${flight.id}`}
                        type="text"
                        placeholder="Enter full name"
                        value={passengerNames[flight.id] || ""}
                        onChange={(event) =>
                          setPassengerNames((previous) => ({
                            ...previous,
                            [flight.id]: event.target.value,
                          }))
                        }
                        maxLength={100}
                        required
                        disabled={full}
                      />

                      <button
                        className="button button-primary full-width"
                        type="submit"
                        disabled={
                          full || submittingBooking === flight.id
                        }
                      >
                        {submittingBooking === flight.id
                          ? "Booking..."
                          : full
                            ? "No seats left"
                            : "Book one seat"}
                      </button>
                    </form>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Booking list and cancellation */}
        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">MANAGE</p>
              <h2>Your booking records</h2>
              <p className="section-description">
                Review existing bookings and cancel when necessary.
              </p>
            </div>

            <button
              className="button button-secondary"
              type="button"
              onClick={loadBookings}
              disabled={loadingBookings}
            >
              Refresh
            </button>
          </div>

          {bookingError && (
            <div className="inline-error" role="alert">
              {bookingError}
              <p>
                Make sure your backend implements <code>GET /bookings/</code>.
              </p>
            </div>
          )}

          {loadingBookings ? (
            <p className="empty-state">Loading bookings...</p>
          ) : bookings.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">▤</span>
              <h3>No bookings yet</h3>
              <p>Your successful bookings will appear here.</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Booking ID</th>
                    <th>Flight</th>
                    <th>Passenger</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id}>
                      <td>#{booking.id}</td>
                      <td>
                        {booking.flight_code ||
                          booking.flight?.code ||
                          booking.flight_id}
                      </td>
                      <td>{booking.passenger_name}</td>
                      <td>
                        <button
                          className="button button-danger"
                          type="button"
                          onClick={() => handleCancelBooking(booking.id)}
                          disabled={cancellingBooking === booking.id}
                        >
                          {cancellingBooking === booking.id
                            ? "Cancelling..."
                            : "Cancel"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <footer className="footer">
          <p>Flight Ticket Booking System · React + FastAPI</p>
        </footer>
      </main>
    </div>
  );
}

export default App;