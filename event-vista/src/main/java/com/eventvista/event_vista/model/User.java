package com.eventvista.event_vista.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(columnNames = "emailAddress"),
        @UniqueConstraint(columnNames = "name")
})
public class User extends AbstractEntity {

    @NotBlank
    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @NotBlank
    @Email
    @Column(name = "emailAddress", nullable = false, unique = true)
    private String emailAddress;

    private String passwordHash;

    @Enumerated(EnumType.STRING)
    private AuthProvider provider;

    private String providerId;

    private boolean emailVerified = false;

    private String verificationToken;

    private LocalDateTime verificationTokenExpiryDate;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Event> events = new ArrayList<>();

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Calendar calendar;

    @Lob
    private String pictureUrl;

    // Static method to use the bcrypt dependency for encoding
    private static final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public User() {}

//    public User(String username, String password) {
//        this.username = username;
//        this.pwHash = encoder.encode(password);
//    }

    public User(String username, String passwordHash, String emailAddress) {
        this.name = username;
        this.passwordHash = passwordHash;
        this.emailAddress = emailAddress;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getEmailAddress() {
        return emailAddress;
    }

    public void setEmailAddress(String emailAddress) {
        this.emailAddress = emailAddress;
    }

    public AuthProvider getProvider() {
        return provider;
    }

    public void setProvider(AuthProvider provider) {
        this.provider = provider;
    }

    public String getProviderId() {
        return providerId;
    }

    public void setProviderId(String providerId) {
        this.providerId = providerId;
    }


    // Instance method to use the bcrypt multi-step matcher (.equals is not enough)
    public boolean isMatchingPassword(String password) {
        return encoder.matches(password, this.passwordHash);
    }


    public List<Event> getEvents() {
        return events;
    }

    public void setEvents(List<Event> events) {
        this.events = events;
    }

    public Calendar getCalendar() {
        return calendar;
    }

    public void setCalendar(Calendar calendar) {
        this.calendar = calendar;
        if (calendar != null) {
            calendar.setUser(this);
        }
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public String getVerificationToken() {
        return verificationToken;
    }

    public void setVerificationToken(String verificationToken) {
        this.verificationToken = verificationToken;
    }

    public LocalDateTime getVerificationTokenExpiryDate() {
        return verificationTokenExpiryDate;
    }

    public void setVerificationTokenExpiryDate(LocalDateTime verificationTokenExpiryDate) {
        this.verificationTokenExpiryDate = verificationTokenExpiryDate;
    }

    public String getPictureUrl() {
        return pictureUrl;
    }

    public void setPictureUrl(String pictureUrl) {
        this.pictureUrl = pictureUrl;
    }

}

