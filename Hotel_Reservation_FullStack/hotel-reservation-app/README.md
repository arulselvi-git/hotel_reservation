# Hotel Reservation & Room Allocation System

Full-stack educational application for the supplied assignment.

## Stack
- Frontend: React + Vite
- Backend: Java 17 + Spring Boot + Spring Data JPA
- Database: H2 file database (persists locally)
- Optional RabbitMQ experiment: see `docs/RABBITMQ.md`

## Features
- Browse hotel properties and rooms
- Search available rooms by dates and guest count
- Create reservations with validation and price calculation
- Prevent overlapping bookings for the same room using a transaction and pessimistic lock
- View reservations and cancel bookings
- Simulated deposit payment and payment retry endpoint
- Responsive frontend

## Requirements
Install Java 17+, Maven 3.9+, and Node.js 18+.

## Run backend
Open a terminal in `backend`:
```bash
mvn spring-boot:run
```
API runs at http://localhost:8080. The database is stored in `backend/data/`.

## Run frontend
Open another terminal in `frontend`:
```bash
npm install
npm run dev
```
Open the local URL shown by Vite (usually http://localhost:5173).

## Main API endpoints
- `GET /api/health`
- `GET /api/properties`
- `GET /api/rooms?checkIn=2026-10-20&checkOut=2026-10-22&guests=2`
- `GET /api/reservations`
- `GET /api/reservations/{id}`
- `POST /api/reservations`
- `POST /api/reservations/{id}/cancel`
- `POST /api/reservations/{id}/payment/retry`

Example booking JSON:
```json
{
  "guestName": "Arun Kumar",
  "email": "arun@example.com",
  "roomId": 1,
  "checkIn": "2026-10-20",
  "checkOut": "2026-10-22",
  "guests": 2
}
```

## Notes
This is a learning/demo app. Payment is simulated; no real money is charged. Before production deployment, add authentication, authorization, real payment-provider integration, rate limiting, audit logs, and production database backups.
