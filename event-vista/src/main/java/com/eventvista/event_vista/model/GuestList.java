package com.eventvista.event_vista.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

@Entity
public class GuestList extends AbstractEntity{

    @NotBlank
    @Size(min = 3, max = 50, message = "Name must be between 3 and 50 characters")
    public String name;

    @OneToOne
    @JoinColumn(name = "event_id")
    private Event event;

    @OneToMany(mappedBy = "guestList", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Guest> guests;

    public @NotBlank @Size(min = 3, max = 50, message = "Name must be between 3 and 50 characters") String getName() {
        return name;
    }

    public void setName(@NotBlank @Size(min = 3, max = 50, message = "Name must be between 3 and 50 characters") String name) {
        this.name = name;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public List<Guest> getGuests() {
        return guests;
    }

    public void setGuests(List<Guest> guests) {
        this.guests = guests;
    }
}
