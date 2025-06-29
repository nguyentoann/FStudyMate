import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { useTheme } from "../context/ThemeContext";
import { useChat } from "../context/ChatContext";
import LessonViewer from "./LessonViewer";
import { getLessons, getSubjects } from "../services/api";
import QuizGeneratorModal from "./QuizGeneratorModal";

const MyCourses = ({ onGenerateQuiz }) => {
  const { darkMode } = useTheme();
  const { openConversation } = useChat();

  // State for courses and subjects
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for lessons/course materials
  const [lessons, setLessons] = useState([]);

  // State for quiz generation
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [generatingLessonId, setGeneratingLessonId] = useState(null);

  // State for quiz generator modal
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);

  // Filter lessons by selected subject
  const filteredLessons = lessons.filter(
    (lesson) => lesson.subjectId === selectedSubject
  );

  useEffect(() => {
    // Fetch subjects when component mounts
    fetchSubjects();
  }, []);

  useEffect(() => {
    // If a subject is selected, fetch its lessons
    if (selectedSubject) {
      fetchLessons(selectedSubject);
    }
  }, [selectedSubject]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const data = await getSubjects();
      setSubjects(data);
      if (data.length > 0) {
        setSelectedSubject(data[0].id);
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      setError("Failed to fetch subjects");
      setLoading(false);
    }
  };

  const fetchLessons = async (subjectId) => {
    try {
      setLoading(true);
      console.log(
        `[MyCourses] Fetching lessons for subject ID: "${subjectId}" (type: ${typeof subjectId})`
      );

      // Ensure subjectId is a number
      const numericSubjectId = parseInt(subjectId, 10);
      if (isNaN(numericSubjectId)) {
        console.error(`[MyCourses] Invalid subject ID: ${subjectId}`);
        setError("Invalid subject ID");
        setLoading(false);
        return;
      }

      const data = await getLessons(numericSubjectId);
      console.log(`[MyCourses] Lessons received:`, data);

      setLessons(data);
      setLoading(false);
    } catch (error) {
      console.error("[MyCourses] Error fetching lessons:", error);
      setError("Failed to fetch lessons");
      setLoading(false);
    }
  };

  // Toggle favorite status
  const toggleFavorite = (lessonId) => {
    setLessons((prevLessons) =>
      prevLessons.map((lesson) =>
        lesson.id === lessonId
          ? { ...lesson, isFavorite: !lesson.isFavorite }
          : lesson
      )
    );
  };

  // Toggle like status
  const toggleLike = (lessonId) => {
    setLessons((prevLessons) =>
      prevLessons.map((lesson) => {
        if (lesson.id === lessonId) {
          const newIsLiked = !lesson.isLiked;
          return {
            ...lesson,
            isLiked: newIsLiked,
            likes: lesson.likes + (newIsLiked ? 1 : -1),
          };
        }
        return lesson;
      })
    );
  };

  // Chat with lecturer
  const startChatWithLecturer = (lecturerId) => {
    openConversation(lecturerId);
  };

  // Open quiz generator modal
  const openQuizGenerator = (lesson) => {
    setSelectedLesson(lesson);
    setQuizModalOpen(true);
  };

  // Handle quiz generation
  const handleGenerateQuiz = async (lessonId, numQuestions, difficulty) => {
    try {
      setGeneratingQuiz(true);
      setGeneratingLessonId(lessonId);

      // Call the parent component's onGenerateQuiz function
      if (onGenerateQuiz) {
        await onGenerateQuiz(lessonId, numQuestions, difficulty);
      }

      // Close modal
      setQuizModalOpen(false);
    } catch (error) {
      console.error("[MyCourses] Error generating quiz:", error);
      alert("Failed to generate quiz. Please try again.");
    } finally {
      setGeneratingQuiz(false);
      setGeneratingLessonId(null);
    }
  };

  return (
    <div
      className={`rounded-lg shadow overflow-hidden ${
        darkMode ? "bg-gray-800" : "bg-white"
      }`}
    >
      <div className={`p-4 border-b ${darkMode ? "border-gray-700" : ""}`}>
        <h2 className={`text-lg font-semibold ${darkMode ? "text-white" : ""}`}>
          My Courses
        </h2>
      </div>

      {/* Subject Navigation */}
      <div
        className={`p-4 border-b overflow-x-auto ${
          darkMode ? "border-gray-700" : ""
        }`}
      >
        <div className="flex space-x-2">
          {subjects.map((subject) => (
            <button
              key={subject.id}
              onClick={() => setSelectedSubject(subject.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                selectedSubject === subject.id
                  ? "bg-indigo-600 text-white"
                  : darkMode
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {subject.name}
            </button>
          ))}
        </div>
      </div>

      {/* Lessons/Materials */}
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : error ? (
          <div
            className={`text-center py-8 ${
              darkMode ? "text-red-400" : "text-red-500"
            }`}
          >
            {error}
          </div>
        ) : filteredLessons.length === 0 ? (
          <div
            className={`text-center py-8 ${
              darkMode ? "text-gray-400" : "text-gray-500"
            }`}
          >
            No lessons available for this subject yet.
          </div>
        ) : (
          <div className="space-y-6">
            {filteredLessons.map((lesson) => (
              <div
                key={lesson.id}
                className={`border rounded-lg overflow-hidden ${
                  darkMode ? "border-gray-700" : ""
                }`}
              >
                {/* Lesson Header */}
                <div
                  className={`p-4 border-b flex justify-between items-center ${
                    darkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50"
                  }`}
                >
                  <div>
                    <h3
                      className={`font-semibold text-lg ${
                        darkMode ? "text-white" : ""
                      }`}
                    >
                      {lesson.title}
                    </h3>
                    <div
                      className={`flex items-center mt-1 text-sm ${
                        darkMode ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      <span>
                        Posted on{" "}
                        {format(new Date(lesson.date), "MMM dd, yyyy")}
                      </span>
                      <span className="mx-2">•</span>
                      <span>by {lesson.lecturer?.fullName || "Unknown"}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleFavorite(lesson.id)}
                      className={`p-1.5 rounded-full ${
                        lesson.isFavorite
                          ? "text-yellow-500 hover:text-yellow-600"
                          : "text-gray-400 hover:text-gray-500"
                      }`}
                      title={
                        lesson.isFavorite
                          ? "Remove from favorites"
                          : "Add to favorites"
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => toggleLike(lesson.id)}
                      className={`p-1.5 rounded-full flex items-center ${
                        lesson.isLiked
                          ? "text-red-500 hover:text-red-600"
                          : "text-gray-400 hover:text-gray-500"
                      }`}
                      title={lesson.isLiked ? "Unlike" : "Like"}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="ml-1 text-xs font-medium">
                        {lesson.likes}
                      </span>
                    </button>
                    <button
                      onClick={() =>
                        startChatWithLecturer(
                          lesson.lecturer?.id || lesson.lecturerId
                        )
                      }
                      className="p-1.5 rounded-full text-gray-400 hover:text-indigo-500"
                      title="Chat with lecturer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => openQuizGenerator(lesson)}
                      disabled={generatingQuiz}
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        generatingQuiz && generatingLessonId === lesson.id
                          ? darkMode
                            ? "bg-indigo-700 text-white cursor-wait"
                            : "bg-indigo-300 text-indigo-800 cursor-wait"
                          : "bg-indigo-600 text-white hover:bg-indigo-700"
                      }`}
                      title="Generate AI quiz from this lesson"
                    >
                      {generatingQuiz && generatingLessonId === lesson.id ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Creating Quiz...
                        </>
                      ) : (
                        <>Create Quiz</>
                      )}
                    </button>
                  </div>
                </div>

                {/* Lesson Content */}
                <div className={`p-4 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
                  <LessonViewer content={lesson.content} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedLesson && (
        <QuizGeneratorModal
          isOpen={quizModalOpen}
          onClose={() => setQuizModalOpen(false)}
          onGenerate={handleGenerateQuiz}
          lessonId={selectedLesson.id}
          lessonTitle={selectedLesson.title}
          isGenerating={generatingQuiz}
        />
      )}
    </div>
  );
};

export default MyCourses;
