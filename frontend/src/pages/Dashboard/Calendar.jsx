import React, { useState } from "react";
import styles from "./Calendar.module.css";
import EventActionsModal from "../../components/EventActionsModal/EventActionsModal";

const Calendar = ({ events = [], onEventUpdated }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("month");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);

  const formatTime = (timeStr) => {
    if (!timeStr) return "";

    const timeWithoutSeconds = timeStr.split(":").slice(0, 2).join(":");

    const [hours, minutes] = timeWithoutSeconds.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;

    return `${hour12}:${minutes} ${ampm}`;
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getEventsForDate = (date) => {
    console.log("Processing events for date:", date);
    console.log("All events:", events);

    return events.filter((event) => {
      try {
        console.log("Processing event:", event);
        console.log("Event date:", event.date);
        console.log("Event time:", event.time);

        // The date is already in YYYY-MM-DD format from the backend
        const eventDate = new Date(event.date);

        // Check if the date is valid
        if (isNaN(eventDate.getTime())) {
          console.warn(`Invalid date for event ${event.id}: ${event.date}`);
          return false;
        }

        // Format both dates to YYYY-MM-DD for comparison
        const eventDateStr = event.date; // Already in YYYY-MM-DD format
        const compareDateStr = date.toISOString().split("T")[0];

        console.log("Comparing dates:", {
          eventDateStr,
          compareDateStr,
          matches: eventDateStr === compareDateStr,
        });

        return eventDateStr === compareDateStr;
      } catch (error) {
        console.error(`Error processing event ${event.id}:`, error);
        return false;
      }
    });
  };

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    switch (viewMode) {
      case "month":
        newDate.setMonth(currentDate.getMonth() - 1);
        break;
      case "week":
        newDate.setDate(currentDate.getDate() - 7);
        break;
      case "day":
        newDate.setDate(currentDate.getDate() - 1);
        break;
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    switch (viewMode) {
      case "month":
        newDate.setMonth(currentDate.getMonth() + 1);
        break;
      case "week":
        newDate.setDate(currentDate.getDate() + 7);
        break;
      case "day":
        newDate.setDate(currentDate.getDate() + 1);
        break;
    }
    setCurrentDate(newDate);
  };

  const getWeekDates = () => {
    const dates = [];
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
    }
    return slots;
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleEventUpdated = () => {
    setShowEventModal(false);
    setSelectedEvent(null);
    if (onEventUpdated) {
      onEventUpdated();
    }
  };

  const renderMonthView = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add weekday headers
    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weekdayHeaders = (
      <div className={styles.calendarWeekdays}>
        {weekdays.map((day, index) => (
          <div key={index} className={styles.calendarWeekday}>
            {day}
          </div>
        ))}
      </div>
    );

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className={`${styles.calendarDay} ${styles.calendarDayEmpty}`}
        />
      );
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      const dayEvents = getEventsForDate(date);

      days.push(
        <div key={day} className={styles.calendarDay}>
          <div className={styles.calendarDayNumber}>{day}</div>
          <div className={styles.calendarDayEvents}>
            {dayEvents.map((event) => (
              <div
                key={event.id}
                className={styles.calendarEvent}
                onClick={() => handleEventClick(event)}
                title={`${formatTime(event.time)} - ${event.name}${
                  event.venue ? " at " + event.venue.name : ""
                }${
                  event.vendors && event.vendors.length > 0
                    ? "\nVendors: " +
                      event.vendors.map((v) => v.name).join(", ")
                    : ""
                }${
                    event.client ? " at " + event.client.name : ""
                    }${event.notes ? "\nNotes: " + event.notes : ""}`}
              >
                <div className={styles.eventTime}>{formatTime(event.time)}</div>
                <div className={styles.eventName}>{event.name}</div>
                {event.venue && (
                  <div className={styles.eventVenue}>📍 {event.venue.name}</div>
                )}
                {event.client && (
                    <div className={styles.eventClient}>🧍 {event.client.name}</div>
                )}
                {event.vendors && event.vendors.length > 0 && (
                  <div className={styles.eventVendors}>
                    👥 {event.vendors.map((v) => v.name).join(", ")}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Add empty cells for remaining days to complete the grid
    const totalDays = firstDay + daysInMonth;
    const remainingDays = Math.ceil(totalDays / 7) * 7 - totalDays;
    for (let i = 0; i < remainingDays; i++) {
      days.push(
        <div
          key={`empty-end-${i}`}
          className={`${styles.calendarDay} ${styles.calendarDayEmpty}`}
        />
      );
    }

    return (
      <>
        {weekdayHeaders}
        <div className={styles.calendarGrid}>{days}</div>
      </>
    );
  };

  const renderWeekView = () => {
    const weekDates = getWeekDates();

    return (
      <div className={styles.calendarWeekView}>
        <div className={styles.calendarWeekHeader}>
          {weekDates.map((date, index) => (
            <div key={index} className={styles.calendarWeekDay}>
              <div className={styles.calendarWeekDayName}>
                {date.toLocaleDateString("en-US", { weekday: "short" })}
              </div>
              <div className={styles.calendarWeekDayNumber}>
                {date.getDate()}
              </div>
            </div>
          ))}
        </div>
        <div className={styles.calendarWeekGrid}>
          {weekDates.map((date, dateIndex) => {
            const dayEvents = getEventsForDate(date);
            return (
              <div key={dateIndex} className={styles.calendarWeekDayColumn}>
                {dayEvents.map((event) => (
                  <div key={event.id} className={styles.calendarEventWeek}>
                    <div className={styles.weekEventTime}>
                      {formatTime(event.time)}
                    </div>
                    <div className={styles.weekEventName}>{event.name}</div>
                    {event.venue && (
                      <div className={styles.weekEventVenue}>
                        📍 {event.venue.name}
                      </div>
                    )}
                    {event.vendors && event.vendors.length > 0 && (
                      <div className={styles.weekEventVendors}>
                        👥 {event.vendors.map((v) => v.name).join(", ")}
                      </div>
                    )}
                    {event.client && (
                        <div className={styles.weekEventClient}>
                            🧍 {event.client.name}
                        </div>
                    )}
                    {event.notes && (
                      <div className={styles.weekEventNotes}>
                        📝 {event.notes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const timeSlots = getTimeSlots();
    const dayEvents = getEventsForDate(currentDate);

    return (
      <div className={styles.calendarDayView}>
        <div className={styles.calendarDayHeader}>
          <div className={styles.calendarDayTitle}>
            {currentDate.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
        <div className={styles.calendarDayTimeline}>
          {timeSlots.map((time, index) => (
            <React.Fragment key={index}>
              <div className={styles.calendarTime}>{time}</div>
              <div className={styles.calendarSlotContent}>
                {dayEvents
                  .filter(
                    (event) => event.time.split(":")[0] === time.split(":")[0]
                  )
                  .map((event) => (
                    <div key={event.id} className={styles.calendarEventWeek}>
                      <div className={styles.weekEventTime}>
                        {formatTime(event.time)}
                      </div>
                      <div className={styles.weekEventName}>{event.name}</div>
                      {event.venue && (
                        <div className={styles.weekEventVenue}>
                          📍 {event.venue.name}
                        </div>
                      )}
                      {event.vendors && event.vendors.length > 0 && (
                        <div className={styles.weekEventVendors}>
                          👥 {event.vendors.map((v) => v.name).join(", ")}
                        </div>
                      )}
                      {event.client && (
                        <div className={styles.weekEventClient}>
                            🧍 {event.client.name}
                        </div>
                      )}
                      {event.notes && (
                        <div className={styles.weekEventNotes}>
                          📝 {event.notes}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  const getViewTitle = () => {
    switch (viewMode) {
      case "month":
        return currentDate.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });
      case "week":
        const weekDates = getWeekDates();
        const startDate = weekDates[0];
        const endDate = weekDates[6];
        return `${startDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })} - ${endDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}`;
      case "day":
        return currentDate.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        });
      default:
        return "";
    }
  };

  const renderEvents = () => {
    if (!events || events.length === 0) return null;

    return events.map((event) => {
      console.log("Event data:", event);
      console.log("Date:", event.date);
      console.log("Time:", event.time);

      // The time is already in HH:mm format from the backend
      const timeStr = event.time;

      return (
        <div
          key={event.id}
          className={`calendar-event ${
            viewMode === "week" ? "week-event" : ""
          }`}
        >
          <span className="event-time">{timeStr}</span>
          <span className="event-name">{event.name}</span>
          {event.venue && (
            <span className="event-venue">
              <i className="fas fa-map-marker-alt"></i>
              {event.venue.name}
            </span>
          )}
        </div>
      );
    });
  };

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <div className={styles.navigation}>
          <button onClick={handlePrevious}>&lt;</button>
          <h2>{getViewTitle()}</h2>
          <button onClick={handleNext}>&gt;</button>
        </div>
        <div className={styles.viewControls}>
          <button
            className={viewMode === "month" ? styles.active : ""}
            onClick={() => setViewMode("month")}
          >
            Month
          </button>
          <button
            className={viewMode === "week" ? styles.active : ""}
            onClick={() => setViewMode("week")}
          >
            Week
          </button>
          <button
            className={viewMode === "day" ? styles.active : ""}
            onClick={() => setViewMode("day")}
          >
            Day
          </button>
        </div>
      </div>
      {viewMode === "month" && renderMonthView()}
      {viewMode === "week" && renderWeekView()}
      {viewMode === "day" && renderDayView()}
      {showEventModal && selectedEvent && (
        <EventActionsModal
          event={selectedEvent}
          onClose={() => setShowEventModal(false)}
          onEventUpdated={handleEventUpdated}
        />
      )}
    </div>
  );
};

export default Calendar;
