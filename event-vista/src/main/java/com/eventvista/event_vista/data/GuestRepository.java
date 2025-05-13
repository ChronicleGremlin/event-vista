package com.eventvista.event_vista.data;

import com.eventvista.event_vista.model.Guest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GuestRepository extends JpaRepository<Guest, Integer> {
    Optional<Guest> findByEmailAddress(String emailAddress);
}
