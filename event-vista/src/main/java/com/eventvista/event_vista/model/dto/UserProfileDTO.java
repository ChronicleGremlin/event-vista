package com.eventvista.event_vista.model.dto;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;

public class UserProfileDTO {

    private Integer id;
    private String name;
    private String emailAddress;
    private String pictureUrl;

    public UserProfileDTO() {}

    public UserProfileDTO(Integer id, String name, String emailAddress, String pictureUrl) {
        this.id = id;
        this.name = name;
        this.emailAddress = emailAddress;
        this.pictureUrl = pictureUrl;
    }

    public Integer getId() {
        return id;
    }
    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }

    public String getEmailAddress() {
        return emailAddress;
    }
    public void setEmailAddress(String emailAddress) {
        this.emailAddress = emailAddress;
    }

    public String getPictureUrl() {
        return pictureUrl;
    }
    public void setPictureUrl(String pictureUrl) {
        this.pictureUrl = pictureUrl;
    }
}
