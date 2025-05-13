package com.eventvista.event_vista.controller;

import com.eventvista.event_vista.model.Guest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.eventvista.event_vista.service.GuestService;

import java.util.List;

@RestController
@RequestMapping("/guests")
public class GuestController {

    @Autowired
    private GuestService guestService;

    @PostMapping("/add")
    public Guest addGuest(@RequestBody Guest guest) {
        return guestService.addGuest(guest);
    }

    @GetMapping("/all")
    public List<Guest> getAllGuests() {
        return guestService.getAllGuests();
    }

    @PutMapping("/update-rsvp")
    public String updateRsvp(@RequestParam String email, @RequestParam boolean rsvp) {
        return guestService.updateRsvp(email, rsvp) ? "RSVP updated successfully" : "Guest not found";
    }

    @DeleteMapping("/remove")
    public String removeGuest(@RequestParam String email) {
        return guestService.removeGuest(email) ? "Guest removed successfully" : "Guest not found";
    }
}