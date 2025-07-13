import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import DashboardLayout from "../components/DashboardLayout";
import Calendar from "../components/Calendar";
import EventsList from "../components/EventsList";
import "./CalendarPage.css";

const CalendarPage = () => {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [activeTab, setActiveTab] = useState("calendar"); // 'calendar' or 'events'
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUpcomingEvents();
    }
  }, [user]);

  const fetchUpcomingEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${
          process.env.REACT_APP_API_URL || "http://localhost:8080"
        }/api/events/public/upcoming`
      );
      if (response.ok) {
        const events = await response.json();
        setUpcomingEvents(events.slice(0, 5)); // Show only 5 upcoming events
      }
    } catch (error) {
      console.error("Error fetching upcoming events:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="calendar-page">
        <div className="loading">Please log in to access the calendar.</div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className={`calendar-page ${darkMode ? "dark" : ""}`}>
        <div className="calendar-page-header">
          <div className="header-content">
            <h1>Calendar & Events</h1>
            <p>Manage your personal schedule and discover campus events</p>
          </div>

          <div className="header-stats">
            <div className="stat-card">
              <div className="stat-number">{upcomingEvents.length}</div>
              <div className="stat-label">Upcoming Events</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Available</div>
            </div>
          </div>
        </div>

        <div className="calendar-page-tabs">
          <button
            className={`shadow-xl rounded-xl px-6 py-4 font-bold ${
              activeTab === "calendar" ? "bg-sky-500 " : " bg-white"
            }`}
            onClick={() => setActiveTab("calendar")}
          >
            <i className="fas fa-calendar-alt"></i>
            My Calendar
          </button>
          <button
            className={`shadow-xl rounded-xl px-6 py-4 font-bold ${
              activeTab === "events" ? "bg-sky-500" : "bg-white"
            }`}
            onClick={() => setActiveTab("events")}
          >
            <i className="fas fa-calendar-day"></i>
            Campus Events
          </button>
        </div>

        <div className="calendar-page-content">
          {activeTab === "calendar" ? (
            <div className="calendar-section">
              <Calendar />
            </div>
          ) : (
            <div className="events-section">
              <EventsList />
            </div>
          )}
        </div>

        {/* Quick Actions Sidebar */}
        <div className="quick-actions-sidebar">
          <div className="sidebar-section">
            <h3>Quick Actions</h3>
            <button className="quick-action-btn">
              <i className="fas fa-plus"></i>
              Add Schedule
            </button>
            <button className="quick-action-btn">
              <i className="fas fa-calendar-plus"></i>
              Create Event
            </button>
            <button className="quick-action-btn">
              <i className="fas fa-bell"></i>
              Set Reminder
            </button>
          </div>

          <div className="sidebar-section">
            <h3>Today's Schedule</h3>
            {loading ? (
              <div className="loading">Loading...</div>
            ) : (
              <div className="today-schedule">
                {upcomingEvents.length === 0 ? (
                  <div className="no-events">No events scheduled for today</div>
                ) : (
                  upcomingEvents.map((event) => (
                    <div key={event.id} className="event-item">
                      <div className="event-time">
                        {new Date(event.startDate).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="event-details">
                        <div className="event-title">{event.title}</div>
                        <div className="event-location">{event.location}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="sidebar-section">
            <h3>Calendar Tips</h3>
            <div className="tips-list">
              <div className="tip-item">
                <i className="fas fa-lightbulb"></i>
                <span>Click on any date to add a new schedule</span>
              </div>
              <div className="tip-item">
                <i className="fas fa-lightbulb"></i>
                <span>Use different colors to organize your schedules</span>
              </div>
              <div className="tip-item">
                <i className="fas fa-lightbulb"></i>
                <span>Set reminders to never miss important events</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CalendarPage;
