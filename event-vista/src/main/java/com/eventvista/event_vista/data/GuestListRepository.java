package com.eventvista.event_vista.data;

import com.eventvista.event_vista.model.GuestList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository
public interface GuestListRepository extends JpaRepository<GuestList, Integer> {

}
