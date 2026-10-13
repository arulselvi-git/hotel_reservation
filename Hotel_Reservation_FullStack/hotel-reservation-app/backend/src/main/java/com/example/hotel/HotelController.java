package com.example.hotel;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.transaction.annotation.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5173")
public class HotelController {
    private final PropertyRepository properties;
    private final RoomRepository rooms;
    private final ReservationRepository reservations;

    public HotelController(PropertyRepository properties, RoomRepository rooms, ReservationRepository reservations) {
        this.properties=properties; this.rooms=rooms; this.reservations=reservations;
    }

    @GetMapping("/health") public Map<String,String> health() { return Map.of("status","UP"); }
    @GetMapping("/properties") public List<HotelProperty> getProperties() { return properties.findAll(); }
    @GetMapping("/rooms") public List<Map<String,Object>> getRooms(
            @RequestParam(required=false) String checkIn,
            @RequestParam(required=false) String checkOut,
            @RequestParam(defaultValue="1") int guests) {
        LocalDate in = parseDate(checkIn, LocalDate.now().plusDays(1));
        LocalDate out = parseDate(checkOut, in.plusDays(1));
        if (!out.isAfter(in)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Check-out must be after check-in");
        List<Map<String,Object>> result = new ArrayList<>();
        for (HotelRoom room : rooms.findAll()) {
            if (room.capacity < guests) continue;
            if (reservations.hasOverlap(room.id, in, out)) continue;
            HotelProperty property = properties.findById(room.propertyId).orElse(null);
            Map<String,Object> item = new LinkedHashMap<>();
            item.put("id", room.id); item.put("propertyId", room.propertyId);
            item.put("propertyName", property == null ? "Hotel" : property.name);
            item.put("city", property == null ? "" : property.city);
            item.put("roomType", room.roomType); item.put("capacity", room.capacity);
            item.put("pricePerNight", room.pricePerNight); item.put("description", room.description);
            item.put("nights", ChronoUnit.DAYS.between(in,out));
            item.put("totalPrice", room.pricePerNight * ChronoUnit.DAYS.between(in,out));
            result.add(item);
        }
        return result;
    }
    @GetMapping("/reservations") public List<Reservation> getReservations() { return reservations.findAll(); }
    @GetMapping("/reservations/{id}") public Reservation getReservation(@PathVariable Long id) {
        return reservations.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Reservation not found"));
    }

    public record BookingRequest(@NotBlank String guestName, @Email @NotBlank String email,
        @NotNull Long roomId, @NotNull LocalDate checkIn, @NotNull LocalDate checkOut,
        @Min(1) int guests) {}

    @PostMapping("/reservations")
    @Transactional
    public Reservation book(@Valid @RequestBody BookingRequest request) {
        if (!request.checkOut().isAfter(request.checkIn())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Check-out must be after check-in");
        if (request.checkIn().isBefore(LocalDate.now())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Check-in cannot be in the past");
        HotelRoom room = rooms.findLockedById(request.roomId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Room not found"));
        if (request.guests() > room.capacity) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Guest count exceeds room capacity");
        if (reservations.hasOverlap(room.id, request.checkIn(), request.checkOut())) throw new ResponseStatusException(HttpStatus.CONFLICT,"Room is no longer available for these dates");
        Reservation b = new Reservation();
        b.guestName=request.guestName().trim(); b.email=request.email().trim(); b.roomId=room.id;
        b.checkIn=request.checkIn(); b.checkOut=request.checkOut(); b.guests=request.guests();
        b.totalPrice=room.pricePerNight * ChronoUnit.DAYS.between(b.checkIn,b.checkOut);
        b.status="CONFIRMED"; b.paymentStatus="PAID_DEMO"; b.createdAt=java.time.LocalDateTime.now();
        return reservations.save(b);
    }

    @PostMapping("/reservations/{id}/cancel")
    @Transactional
    public Reservation cancel(@PathVariable Long id) {
        Reservation b = reservations.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Reservation not found"));
        if ("CANCELLED".equals(b.status)) throw new ResponseStatusException(HttpStatus.CONFLICT,"Reservation is already cancelled");
        b.status="CANCELLED"; return reservations.save(b);
    }

    @PostMapping("/reservations/{id}/payment/retry")
    public Map<String,Object> retryPayment(@PathVariable Long id) {
        Reservation b = reservations.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,"Reservation not found"));
        b.paymentStatus="PAID_DEMO"; reservations.save(b);
        return Map.of("reservationId",id,"paymentStatus",b.paymentStatus,"message","Demo payment retry succeeded");
    }

    private LocalDate parseDate(String value, LocalDate fallback) {
        if (value == null || value.isBlank()) return fallback;
        try { return LocalDate.parse(value); }
        catch (Exception e) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Dates must use YYYY-MM-DD format"); }
    }
}
