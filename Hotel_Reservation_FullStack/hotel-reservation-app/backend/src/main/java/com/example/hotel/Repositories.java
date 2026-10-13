package com.example.hotel;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import jakarta.persistence.LockModeType;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

interface PropertyRepository extends JpaRepository<HotelProperty, Long> {}

interface RoomRepository extends JpaRepository<HotelRoom, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select r from HotelRoom r where r.id = :id")
    Optional<HotelRoom> findLockedById(@Param("id") Long id);
}

interface ReservationRepository extends JpaRepository<Reservation, Long> {
    @Query("select count(b) > 0 from Reservation b where b.roomId = :roomId and b.status = 'CONFIRMED' and b.checkIn < :checkOut and b.checkOut > :checkIn")
    boolean hasOverlap(@Param("roomId") Long roomId, @Param("checkIn") LocalDate checkIn, @Param("checkOut") LocalDate checkOut);
}
