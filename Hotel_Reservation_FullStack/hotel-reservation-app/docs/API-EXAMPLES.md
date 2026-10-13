# API examples

## Search rooms
`GET http://localhost:8080/api/rooms?checkIn=2026-10-20&checkOut=2026-10-22&guests=2`

## Create reservation
`POST http://localhost:8080/api/reservations`
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

## Cancel reservation
`POST http://localhost:8080/api/reservations/1/cancel`

## Retry demo payment
`POST http://localhost:8080/api/reservations/1/payment/retry`
