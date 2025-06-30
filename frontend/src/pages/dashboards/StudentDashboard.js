import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import DashboardLayout from "../../components/DashboardLayout";
import { format } from "date-fns";
import { useChat } from "../../context/ChatContext";
import LessonViewer from "../../components/LessonViewer";
import ProgressTracker from "../../components/ProgressTracker";
import {
  getLessons,
  getSubjects,
  generateAIQuiz,
  getQuizDashboardStats,
} from "../../services/api";
import { useNavigate, Link } from "react-router-dom";
import QuizGeneratorModal from "../../components/QuizGeneratorModal";
import JokeNotification from "../../components/JokeNotification";

const StudentDashboard = () => {
  const { user } = useAuth();
  const { darkMode } = useTheme();
  const { openConversation } = useChat();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    quizzesTaken: 0,
    averageScore: 0,
    completedCourses: 0,
    activeCourses: 0,
    recentQuizScore: null,
    completionRate: 0,
    inProgressQuizzes: 0,
  });

  const [recentActivity, setRecentActivity] = useState([
    {
      id: 1,
      type: "quiz",
      name: "Weekly Test",
      date: "2025-05-15",
      score: "85%",
    },
    {
      id: 2,
      type: "course",
      name: "Introduction to Programming",
      date: "2025-05-12",
      status: "In Progress",
    },
    {
      id: 3,
      type: "assignment",
      name: "Data Structures Practice",
      date: "2025-05-10",
      status: "Completed",
    },
  ]);

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
    // Fetch quiz stats
    const fetchQuizStats = async () => {
      try {
        const quizStats = await getQuizDashboardStats();

        // Update stats with quiz data and default values for other stats
        setStats((prevStats) => ({
          ...prevStats,
          quizzesTaken: quizStats.quizzesTaken,
          averageScore: quizStats.averageScore,
          recentQuizScore: quizStats.recentQuizScore,
          completionRate: quizStats.completionRate,
          inProgressQuizzes: quizStats.inProgressQuizzes,
        }));
      } catch (error) {
        console.error("Error fetching quiz stats:", error);
      }
    };

    // Set default values
    setStats({
      quizzesTaken: 0,
      averageScore: 0,
      completedCourses: 3,
      activeCourses: 2,
      recentQuizScore: null,
      completionRate: 0,
      inProgressQuizzes: 0,
    });

    // Fetch quiz stats and subjects
    fetchQuizStats();
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
        `[StudentDashboard] Fetching lessons for subject ID: "${subjectId}" (type: ${typeof subjectId})`
      );

      // Ensure subjectId is a number
      const numericSubjectId = parseInt(subjectId, 10);
      if (isNaN(numericSubjectId)) {
        console.error(`[StudentDashboard] Invalid subject ID: ${subjectId}`);
        setError("Invalid subject ID");
        setLoading(false);
        return;
      }

      const data = await getLessons(numericSubjectId);
      console.log(`[StudentDashboard] Lessons received:`, data);

      setLessons(data);
      setLoading(false);
    } catch (error) {
      console.error("[StudentDashboard] Error fetching lessons:", error);
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

  // Generate AI quiz from lesson
  const handleGenerateQuiz = async (lessonId, numQuestions, difficulty) => {
    try {
      setGeneratingQuiz(true);
      setGeneratingLessonId(lessonId);

      console.log(
        `[StudentDashboard] Generating quiz for lesson ID: ${lessonId}, questions: ${numQuestions}, difficulty: ${difficulty}`
      );
      const result = await generateAIQuiz(lessonId, numQuestions, difficulty);

      console.log(`[StudentDashboard] Quiz generated:`, result);

      // Close modal
      setQuizModalOpen(false);

      // Navigate to the generated quiz
      navigate(`/quiz/${result.maMon}/${result.maDe}`);
    } catch (error) {
      console.error("[StudentDashboard] Error generating quiz:", error);
      alert("Failed to generate quiz. Please try again.");
    } finally {
      setGeneratingQuiz(false);
      setGeneratingLessonId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className={darkMode ? "text-white" : ""}>
        <h1 className="text-2xl font-bold mb-6">Student Dashboard</h1>
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Welcome back, {user?.fullName}!
          </h2>
          <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
            Continue where you left off and keep track of your progress.
          </p>
        </div>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 flex flex-col relative">
            {/* Top section with title and view button */}
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium text-gray-500">
                Quizzes Taken
              </h3>
              <Link
                to="/quiz-history"
                className="text-xs text-indigo-600 hover:text-indigo-900 flex items-center"
              >
                View
                <svg
                  className="w-3 h-3 ml-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  ></path>
                </svg>
              </Link>
            </div>

            {/* Quiz count */}
            <div className="mb-1">
              <p className="text-3xl font-semibold">{stats.quizzesTaken}</p>
            </div>

            {/* Details */}
            <div className="text-xs text-gray-500 space-y-1 mb-auto">
              <p>
                Completion rate:{" "}
                <span className="font-medium text-gray-700">
                  {stats.completionRate}%
                </span>
              </p>
              {stats.recentQuizScore && (
                <p>
                  Recent score:{" "}
                  <span className="font-medium text-gray-700">
                    {stats.recentQuizScore}%
                  </span>
                </p>
              )}
              {stats.inProgressQuizzes > 0 && (
                <p className="text-blue-500">
                  {stats.inProgressQuizzes} in progress
                </p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Average Score</h3>
            <p className="text-3xl font-semibold">{stats.averageScore}%</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">
              Completed Courses
            </h3>
            <p className="text-3xl font-semibold">{stats.completedCourses}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">
              Active Courses
            </h3>
            <p className="text-3xl font-semibold">{stats.activeCourses}</p>
          </div>
        </div>
        {/* Two-column layout for Progress Tracker and My Courses */}
        // Trong phần return, thay thế phần My Courses bằng link đến trang mới
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Progress Tracker (1/3 width on large screens) */}
          <div className="lg:col-span-1">
            <ProgressTracker />
          </div>

          {/* My Courses Preview (2/3 width on large screens) */}
          <div
            className={`rounded-lg shadow overflow-hidden lg:col-span-2 ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div
              className={`p-4 border-b ${darkMode ? "border-gray-700" : ""}`}
            >
              <div className="flex justify-between items-center">
                <h2
                  className={`text-lg font-semibold ${
                    darkMode ? "text-white" : ""
                  }`}
                >
                  My Courses
                </h2>
                <Link
                  to="/my-courses"
                  className="text-sm text-indigo-600 hover:text-indigo-900 flex items-center"
                >
                  View All
                  <svg
                    className="w-4 h-4 ml-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    ></path>
                  </svg>
                </Link>
              </div>
            </div>

            <div className="p-4">
              <div
                className={`text-center py-8 ${
                  darkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                <p className="mb-4">
                  Access your course materials, lessons, and generate quizzes.
                </p>
                <Link
                  to="/my-courses"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Go to My Courses
                </Link>
              </div>
            </div>
          </div>
        </div>
        {/* Recent Activity */}
        <div
          className={`rounded-lg shadow mb-8 overflow-hidden ${
            darkMode ? "bg-gray-800" : "bg-white"
          }`}
        >
          <div className={`p-4 border-b ${darkMode ? "border-gray-700" : ""}`}>
            <h2
              className={`text-lg font-semibold ${
                darkMode ? "text-white" : ""
              }`}
            >
              Recent Activity
            </h2>
          </div>
          <div className="p-4">
            <div className="overflow-x-auto">
              <table
                className={`min-w-full divide-y ${
                  darkMode ? "divide-gray-700" : "divide-gray-200"
                }`}
              >
                <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
                  <tr>
                    <th
                      className={`px-4 py-3 text-left text-xs font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-500"
                      } uppercase tracking-wider`}
                    >
                      Activity
                    </th>
                    <th
                      className={`px-4 py-3 text-left text-xs font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-500"
                      } uppercase tracking-wider`}
                    >
                      Date
                    </th>
                    <th
                      className={`px-4 py-3 text-left text-xs font-medium ${
                        darkMode ? "text-gray-300" : "text-gray-500"
                      } uppercase tracking-wider`}
                    >
                      Status/Score
                    </th>
                  </tr>
                </thead>
                <tbody
                  className={`${
                    darkMode
                      ? "bg-gray-800 divide-y divide-gray-700"
                      : "bg-white divide-y divide-gray-200"
                  }`}
                >
                  {recentActivity.map((activity) => (
                    <tr key={activity.id}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                              activity.type === "quiz"
                                ? "bg-blue-100 text-blue-500"
                                : activity.type === "course"
                                ? "bg-green-100 text-green-500"
                                : "bg-purple-100 text-purple-500"
                            }`}
                          >
                            {activity.type === "quiz" ? (
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                />
                              </svg>
                            ) : activity.type === "course" ? (
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                            )}
                          </div>
                          <div className="ml-3">
                            <p
                              className={`text-sm font-medium ${
                                darkMode ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {activity.name}
                            </p>
                            <p
                              className={`text-xs ${
                                darkMode ? "text-gray-400" : "text-gray-500"
                              } capitalize`}
                            >
                              {activity.type}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td
                        className={`px-4 py-3 whitespace-nowrap text-sm ${
                          darkMode ? "text-gray-300" : "text-gray-500"
                        }`}
                      >
                        {activity.date}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {activity.type === "quiz" ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                            {activity.score}
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            {activity.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {/* Upcoming Quizzes/Tests */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Upcoming Quizzes</h2>
          </div>
          <div className="p-4">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
              <div className="flex">
                <div className="flex-1">
                  <p className="text-sm text-yellow-700">
                    Mid-term Assessment - Introduction to Programming
                  </p>
                  <p className="text-xs text-yellow-600">
                    Scheduled for: May 25, 2025
                  </p>
                </div>
                <div>
                  <button className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700">
                    Prepare
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-1">
                  <p className="text-sm text-yellow-700">
                    Weekly Quiz - Data Structures
                  </p>
                  <p className="text-xs text-yellow-600">
                    Scheduled for: May 22, 2025
                  </p>
                </div>
                <div>
                  <button className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700">
                    Prepare
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Quiz Game Section */}
        <div className="bg-white rounded-lg shadow mt-8">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Fun Learning Games</h2>
          </div>
          <div className="p-4">
            <div className="bg-green-50 border-l-4 border-green-400 p-4">
              <div className="flex">
                <div className="flex-1">
                  <p className="text-sm text-green-700 font-medium">
                    Quiz Game Challenge
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Test your knowledge with our fun quiz game! Feed your
                    character with correct answers.
                  </p>
                </div>
                <div className="self-center">
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                    onClick={() => navigate("/quiz-game")}
                  >
                    <span className="mr-2">Play</span>
                    <span role="img" aria-label="game">
                      🎮
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
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

      {/* Add the JokeNotification component directly in the StudentDashboard */}
      <JokeNotification />
    </DashboardLayout>
  );
};

export default StudentDashboard;
