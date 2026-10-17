import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Get all flights
export const getFlights = async () => {
  const response = await api.get("/flights/");
  return response.data;
};

// Add a new flight
export const addFlight = async (flightData) => {
  const response = await api.post("/flights/", flightData);
  return response.data;
};

// Book one seat
export const bookSeat = async (flightId, passengerName) => {
  const response = await api.post(`/flights/${flightId}/book`, {
    passenger_name: passengerName,
  });

  return response.data;
};

// Get all bookings
export const getBookings = async () => {
  const response = await api.get("/bookings/");
  return response.data;
};

// Cancel a booking
export const cancelBooking = async (bookingId) => {
  const response = await api.delete(`/bookings/${bookingId}`);
  return response.data;
};

// Convert backend errors into readable messages
export const getErrorMessage = (error) => {
  const detail = error.response?.data?.detail;

  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).join(", ");
  }

  if (typeof detail === "string") {
    return detail;
  }

  if (!error.response) {
    return "Cannot connect to the backend. Check whether FastAPI is running.";
  }

  return "Something went wrong. Please try again.";
};