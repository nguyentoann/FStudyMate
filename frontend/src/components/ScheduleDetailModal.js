import React from "react";
import { format } from "date-fns";
import { useTheme } from "../context/ThemeContext";
import "./Modal.css";

const ScheduleDetailModal = ({
  isOpen,
  onClose,
  schedule,
  subjects,
  lecturers,
}) => {
  const { darkMode } = useTheme();

  if (!isOpen || !schedule) return null;

  // Format time for display
  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    try {
      if (timeStr.includes("T")) {
        const date = new Date(timeStr);
        if (!isNaN(date.getTime())) {
          return format(date, "HH:mm");
        }
      }
      return timeStr;
    } catch (err) {
      console.error("Error formatting time:", err);
      return timeStr;
    }
  };

  // Find subject name by ID
  const getSubjectInfo = () => {
    if (!schedule.subjectId)
      return { code: "Unknown", name: "Unknown Subject" };

    const subject = subjects.find((s) => s.id === parseInt(schedule.subjectId));
    if (subject) {
      return { code: subject.code, name: subject.name };
    }

    return {
      code: `Subject ${schedule.subjectId}`,
      name: `Subject ${schedule.subjectId}`,
    };
  };

  // Find lecturer name by ID
  const getLecturerName = () => {
    if (!schedule.lecturerId) return "Unknown Lecturer";

    const lecturer = lecturers.find(
      (l) => l.id === parseInt(schedule.lecturerId)
    );
    if (lecturer) {
      return lecturer.fullName;
    }

    return `Lecturer ${schedule.lecturerId}`;
  };

  // Get room information
  const getRoomInfo = () => {
    if (!schedule.room) return "No room assigned";

    const roomName =
      typeof schedule.room === "object" ? schedule.room.name : schedule.room;
    const building = schedule.building ? ` (${schedule.building})` : "";

    return `${roomName}${building}`;
  };

  // Get date formatted
  const getFormattedDate = () => {
    if (!schedule.specificDate) return "Not specified";

    try {
      const date = new Date(schedule.specificDate);
      if (isNaN(date.getTime())) return "Invalid date";
      return format(date, "EEEE, dd/MM/yyyy");
    } catch (err) {
      console.error("Error formatting date:", err);
      return "Error formatting date";
    }
  };

  const subjectInfo = getSubjectInfo();

  // Map status to Vietnamese
  const getStatusText = (status) => {
    switch (status) {
      case "NotYet":
        return "Not yet";
      case "Attended":
        return "Attended";
      case "Online":
        return "Online";
      case "Absent":
        return "Absent";
      default:
        return status || "Not yet";
    }
  };

  return (
    <div className={`modal-overlay ${darkMode ? "dark" : ""}`}>
      <div className={`modal-content ${darkMode ? "dark" : ""}`}>
        <div className="modal-header">
          <h2>Subject information</h2>
          <button className="modal-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          <div className="detail-item">
            <div className="detail-label">Subject:</div>
            <div className="detail-value">
              <strong>{subjectInfo.code}</strong> - {subjectInfo.name}
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-label">Day:</div>
            <div className="detail-value">{getFormattedDate()}</div>
          </div>

          <div className="detail-item">
            <div className="detail-label">Timen:</div>
            <div className="detail-value">
              {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
            </div>
          </div>

          <div className="detail-item">
            <div className="detail-label">Lecturer:</div>
            <div className="detail-value">{getLecturerName()}</div>
          </div>

          <div className="detail-item">
            <div className="detail-label">Romm:</div>
            <div className="detail-value">{getRoomInfo()}</div>
          </div>

          <div className="detail-item">
            <div className="detail-label">Class:</div>
            <div className="detail-value">{schedule.classId || "None"}</div>
          </div>

          <div className="detail-item">
            <div className="detail-label">Statusi:</div>
            <div className="detail-value">
              <span
                className={`status-badge ${(
                  schedule.status || "notyet"
                ).toLowerCase()}`}
              >
                {getStatusText(schedule.status)}
              </span>
            </div>
          </div>

          {schedule.meetUrl && (
            <div className="detail-item">
              <div className="detail-label">Link học:</div>
              <div className="detail-value">
                <a
                  href={schedule.meetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="meeting-link"
                >
                  Join
                </a>
              </div>
            </div>
          )}

          <div className="detail-note">
            <em>
              Note: You can only view the schedule information, not edit it.
            </em>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleDetailModal;
