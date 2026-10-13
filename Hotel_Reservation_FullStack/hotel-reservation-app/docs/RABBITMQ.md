# RabbitMQ pub/sub experiment

The core reservation app works without RabbitMQ so it is easy to run for a lab demo. This document outlines the assignment experiment.

## Event design
After a reservation is confirmed, publish a `ReservationConfirmed` event to exchange `hotel.events` with routing key `reservation.confirmed`. A notification consumer subscribes to a durable queue named `hotel.notifications`, then sends an email/SMS confirmation. Publish cancellation events using `reservation.cancelled`.

Example event:
```json
{
  "eventId": "uuid",
  "eventType": "ReservationConfirmed",
  "reservationId": 123,
  "guestEmail": "guest@example.com",
  "checkIn": "2026-10-20",
  "checkOut": "2026-10-22"
}
```

## Local RabbitMQ
With Docker installed, start RabbitMQ:
```bash
docker run -d --name hotel-rabbitmq -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```
Management UI: http://localhost:15672 (default demo credentials: guest / guest).

For a production implementation, add `spring-boot-starter-amqp`, define a durable topic exchange, durable queue and binding, publish events after the database transaction commits, and make the consumer idempotent. Use retry with backoff and a dead-letter queue for repeated failures.
