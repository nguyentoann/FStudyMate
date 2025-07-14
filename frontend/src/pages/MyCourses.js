import React from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import DashboardLayout from "../components/DashboardLayout";
import MyCourses from "../components/MyCourses";
import { generateAIQuiz } from "../services/api";

const MyCoursesPage = () => {
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  // Generate AI quiz from lesson
  const handleGenerateQuiz = async (lessonId, numQuestions, difficulty) => {
    try {
      console.log(
        `[MyCoursesPage] Generating quiz for lesson ID: ${lessonId}, questions: ${numQuestions}, difficulty: ${difficulty}`
      );
      const result = await generateAIQuiz(lessonId, numQuestions, difficulty);

      console.log(`[MyCoursesPage] Quiz generated:`, result);

      // Navigate to the generated quiz
      navigate(`/quiz/${result.maMon}/${result.maDe}`);
    } catch (error) {
      console.error("[MyCoursesPage] Error generating quiz:", error);
      alert("Failed to generate quiz. Please try again.");
    }
  };

  return (
    <DashboardLayout>
      <div className={`${darkMode ? "text-white" : ""} pt-4`}>
        <h1 className="text-2xl font-bold mb-6">My Courses</h1>

        <div className="mb-8">
          <p className={darkMode ? "text-gray-300" : "text-gray-600"}>
            Browse your courses, access learning materials, and create quizzes.
          </p>
        </div>

        <MyCourses onGenerateQuiz={handleGenerateQuiz} />
      </div>
    </DashboardLayout>
  );
};

export default MyCoursesPage;
