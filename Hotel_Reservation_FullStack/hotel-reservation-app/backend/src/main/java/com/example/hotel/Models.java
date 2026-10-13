package com.example.hotel;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
class HotelProperty {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
    public String name;
    public String city;
    public String description;
    public HotelProperty() {}
    HotelProperty(String name, String city, String description) { this.name=name; this.city=city; this.description=description; }
}

@Entity
class HotelRoom {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
    public Long propertyId;
    public String roomType;
    public int capacity;
    public double pricePerNight;
    public String description;
    public HotelRoom() {}
    HotelRoom(Long propertyId, String roomType, int capacity, double pricePerNight, String description) {
        this.propertyId=propertyId; this.roomType=roomType; this.capacity=capacity; this.pricePerNight=pricePerNight; this.description=description;
    }
}

@Entity
class Reservation {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) public Long id;
    public String guestName;
    public String email;
    public Long roomId;
    public LocalDate checkIn;
    public LocalDate checkOut;
    public int guests;
    public double totalPrice;
    public String status;
    public String paymentStatus;
    public LocalDateTime createdAt;
    public Reservation() {}
}
