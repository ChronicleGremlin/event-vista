package com.eventvista.event_vista.controller;

import com.eventvista.event_vista.model.*;
import com.eventvista.event_vista.service.ClientService;
import com.eventvista.event_vista.utilities.AuthUtil;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/clients")
@CrossOrigin(origins = "http://localhost:3000")
public class ClientController {


    private final ClientService clientService;
    private final AuthUtil authUtil;

    public ClientController(ClientService clientService, AuthUtil authUtil) {
        this.clientService = clientService;
        this.authUtil = authUtil;
    }

    @GetMapping("/all")
    public ResponseEntity<List<Client>> getAllClients () {
        User user = authUtil.getUserFromAuthentication();
        List<Client> clients = clientService.findAllClients(user);
        return ResponseEntity.ok(clients);
    }

    @GetMapping("/find/{id}")
    public ResponseEntity<Client> getClientById (@PathVariable("id") Integer id) {
        User user = authUtil.getUserFromAuthentication();
        return ResponseEntity.of(clientService.findClientById(id, user));
    }

    @GetMapping("/find/name/{name}")
    public ResponseEntity<Client> getClientByName (@PathVariable("name") String name) {
        User user = authUtil.getUserFromAuthentication();
        return ResponseEntity.of(clientService.findClientByName(name, user));
    }

    @GetMapping("/find/phone/{phoneNumber}")
    public ResponseEntity<Client> getClientByPhoneNumber (@PathVariable("phoneNumber") PhoneNumber phoneNumber) {
        User user = authUtil.getUserFromAuthentication();
        return ResponseEntity.of(clientService.findClientByPhoneNumber(phoneNumber, user));
    }


    @GetMapping("/find/email/{emailAddress}")
    public ResponseEntity<Client> getClientByEmailAddress (@PathVariable("emailAddress") String emailAddress) {
        User user = authUtil.getUserFromAuthentication();
        return ResponseEntity.of(clientService.findClientByEmailAddress(emailAddress, user));
    }

    @PostMapping("/add")
    public ResponseEntity<?> addClient (@Valid @RequestBody Client client, BindingResult bindingResult) {
        try {
            if (bindingResult.hasErrors()) {
                Map<String, String> errors = new HashMap<>();
                bindingResult.getFieldErrors().forEach(error -> {
                    errors.put(error.getField(), error.getDefaultMessage());
                });
                return ResponseEntity.badRequest().body(errors);
            }

            User user = authUtil.getUserFromAuthentication();
            Client newClient = clientService.addClient(client, user);
            return ResponseEntity.ok(newClient);
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Error creating client: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<?> updateClient(@PathVariable("id") Integer id, @Valid @RequestBody Client updatedClient, BindingResult bindingResult) {

        if (bindingResult.hasErrors()) {
            Map<String, String> errors = new HashMap<>();
            bindingResult.getFieldErrors().forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));
            return ResponseEntity.badRequest().body(errors);
        }
        try {
            User user = authUtil.getUserFromAuthentication();
            return clientService.updateClient(id, updatedClient, user)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Error updating client: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteClient(@PathVariable("id") Integer id) {
        try {
            User user = authUtil.getUserFromAuthentication();
            boolean isDeleted = clientService.deleteClient(id, user);

            if (isDeleted) {
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("error", "Error deleting client: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
