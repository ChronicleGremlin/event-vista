package com.eventvista.event_vista.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Entity
public class Guest extends AbstractEntity{

    @NotBlank
    @Size(min = 3, max = 50, message = "Name must be between 3 and 50 characters")
    public String name;

    @Email
    public String emailAddress;

    @Enumerated(EnumType.STRING)
    private RSVPStatus rsvpStatus = RSVPStatus.PENDING;

    @ManyToOne
    //JoinColumn(name = "guest_list_id")
    private GuestList guestList;

    public Guest() {}

    public Guest(String name, String emailAddress, GuestList guestList) {
        this.name = name;
        this.emailAddress = emailAddress;
        this.guestList = guestList;
        //this.rsvpStatus = RSVPStatus.PENDING;
    }

    public @NotBlank @Size(min = 3, max = 50, message = "Name must be between 3 and 50 characters") String getName() {
        return name;
    }

    public void setName(@NotBlank @Size(min = 3, max = 50, message = "Name must be between 3 and 50 characters") String name) {
        this.name = name;
    }

    public @Email String getEmailAddress() {
        return emailAddress;
    }

    public void setEmailAddress(@Email String emailAddress) {
        this.emailAddress = emailAddress;
    }

    public RSVPStatus getRsvpStatus() {
        return rsvpStatus;
    }

    public void setRsvpStatus(RSVPStatus rsvpStatus) {
        this.rsvpStatus = rsvpStatus;
    }

    public GuestList getGuestList() {
        return guestList;
    }

    public void setGuestList(GuestList guestList) {
        this.guestList = guestList;
    }

    public void setRsvp(boolean rsvpStatus) {
    }
}


