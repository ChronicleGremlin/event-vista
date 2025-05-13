package com.eventvista.event_vista.service;

import com.eventvista.event_vista.data.ClientRepository;
import com.eventvista.event_vista.model.Client;
import com.eventvista.event_vista.model.PhoneNumber;
import com.eventvista.event_vista.model.User;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ClientService {

    private final ClientRepository clientRepository;


    public ClientService(ClientRepository clientRepository) {
        this.clientRepository = clientRepository;

    }

    public List<Client> findAllClients(User user) {
        return clientRepository.findAllByUser(user);
    }


    public Optional<Client> findClientById(Integer id, User user) {
        return clientRepository.findByIdAndUser(id, user)
                .filter(client -> client.getUser().getId().equals(user.getId()));
    }

    public Optional<Client> findClientByName(String name, User user) {
        return clientRepository.findByNameAndUser(name, user)
                .filter(client -> client.getUser().getId().equals(user.getId()));
    }

    public Optional<Client> findClientByEmailAddress(String emailAddress, User user) {
        return clientRepository.findByEmailAddressAndUser(emailAddress, user)
                .filter(client -> client.getUser().getId().equals(user.getId()));
    }

    public Optional<Client> findClientByPhoneNumber(PhoneNumber phoneNumber, User user) {
        return clientRepository.findByPhoneNumberAndUser(phoneNumber, user)
                .filter(client -> client.getUser().getId().equals(user.getId()));
    }

    public Client addClient(Client client, User user) {
        client.setUser(user);
        return clientRepository.save(client);
    }

    public Optional<Client> updateClient(Integer id, Client updatedClient, User user) {
        return clientRepository.findByIdAndUser(id, user)
                .map(client -> {

                    client.setName(updatedClient.getName());
                    client.setEmailAddress(updatedClient.getEmailAddress());
                    client.setNotes(updatedClient.getNotes());
                    client.setPhoneNumber(updatedClient.getPhoneNumber());

                    return clientRepository.save(client);
                });
    }

    public boolean deleteClient(Integer id, User user) {
        Optional<Client> clientOpt = clientRepository.findByIdAndUser(id, user);

        if (clientOpt.isPresent()) {
            clientRepository.delete(clientOpt.get());
            return true;
        }
        return false;
    }
}
