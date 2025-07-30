import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import DashboardLayout from "../components/DashboardLayout";
import Calendar from "../components/Calendar";
import EventsList from "../components/EventsList";
import TeachingScheduleManager from "./admin/TeachingScheduleManager";
import StudentScheduleView from "./student/StudentScheduleView";
import LecturerClassRegistration from "../components/LecturerClassRegistration";
import "./CalendarPage.css";

const CalendarPage = () => {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const [activeTab, setActiveTab] = useState("calendar"); // 'calendar', 'events', 'schedule', 'classreg'
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

  // Check if user is admin or lecturer
  const isAdminOrLecturer = () => {
    return user && (user.role === "admin" || user.role === "lecturer");
  };

  // Check if user is a student
  const isStudent = () => {
    return user && user.role === "student";
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
          {isAdminOrLecturer() && (
            <button
              className={`shadow-xl rounded-xl px-6 py-4 font-bold ${
                activeTab === "schedule" ? "bg-sky-500" : "bg-white"
              }`}
              onClick={() => setActiveTab("schedule")}
            >
              <i className="fas fa-chalkboard-teacher"></i>
              Teaching Schedule
            </button>
          )}
          {isStudent() && (
            <button
              className={`shadow-xl rounded-xl px-6 py-4 font-bold ${
                activeTab === "classschedule" ? "bg-sky-500" : "bg-white"
              }`}
              onClick={() => setActiveTab("classschedule")}
            >
              <i className="fas fa-user-graduate"></i>
              Class Schedule
            </button>
          )}
          {user.role === "lecturer" && (
            <button
              className={`shadow-xl rounded-xl px-6 py-4 font-bold ${
                activeTab === "classreg" ? "bg-sky-500" : "bg-white"
              }`}
              onClick={() => setActiveTab("classreg")}
            >
              <i className="fas fa-clipboard-list"></i>
              Register Classes
            </button>
          )}
        </div>

        <div className="calendar-page-content">
          {activeTab === "calendar" ? (
            <div className="calendar-section">
              <Calendar />
            </div>
          ) : activeTab === "events" ? (
            <div className="events-section">
              <EventsList />
            </div>
          ) : activeTab === "schedule" ? (
            <div className="teaching-schedule-section">
              <TeachingScheduleManager />
            </div>
          ) : activeTab === "classschedule" ? (
            <div className="student-schedule-section">
              <StudentScheduleView />
            </div>
          ) : (
            <div className="class-registration-section">
              <LecturerClassRegistration />
            </div>
          )}
        </div>

        {/* Quick Actions Sidebar */}
        <div className="quick-actions-sidebar">
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
