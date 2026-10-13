package com.example.hotel;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
class SeedData {
    @Bean
    CommandLineRunner seed(PropertyRepository properties, RoomRepository rooms) {
        return args -> {
            if (properties.count() == 0) {
                HotelProperty p1=properties.save(new HotelProperty("Palm Grove Hotel","Coimbatore","Comfortable stay close to the city."));
                HotelProperty p2=properties.save(new HotelProperty("Blue Lotus Residency","Pollachi","Relaxing rooms for families and business travellers."));
                HotelProperty p3=properties.save(new HotelProperty("Hillview Suites","Ooty","A cosy base for a hill-station trip."));
                rooms.save(new HotelRoom(p1.id,"Standard Queen",2,2200,"Queen bed, Wi-Fi and private bathroom."));
                rooms.save(new HotelRoom(p1.id,"Deluxe Twin",3,3200,"Twin beds and a work desk."));
                rooms.save(new HotelRoom(p2.id,"Family Room",4,2800,"Spacious room for a small family."));
                rooms.save(new HotelRoom(p2.id,"Standard Double",2,1800,"Simple and comfortable double room."));
                rooms.save(new HotelRoom(p3.id,"Mountain View",2,4200,"Room with a scenic mountain view."));
                rooms.save(new HotelRoom(p3.id,"Family Suite",4,5600,"Large suite with extra seating space."));
            }
        };
    }
}
