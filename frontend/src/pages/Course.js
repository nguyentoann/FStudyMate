import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import LandingHeader from "../components/LandingHeader";
import LandingFooter from "../components/LandingFooter";

const Course = () => {
  const { darkMode } = useTheme();
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setCourse({
        id: courseId,
        title: courseId,
        image: "https://files.fullstack.edu.vn/f8-prod/courses/13/13.png",
        description: "Mathematics for Engineering",
        content:
          "This course covers fundamental mathematical concepts for engineering students. This course covers fundamental mathematical concepts for engineering students.This course covers fundamental mathematical concepts for engineering students.This course covers fundamental mathematical concepts for engineering students.This course covers fundamental mathematical concepts for engineering students.",
        relatedSubjects: ["PRF192", "PRO192", "LAB211"],
        materials: [
          { id: 1, title: "Introduction to Calculus", type: "pdf" },
          { id: 2, title: "Linear Algebra Basics", type: "pdf" },
          { id: 3, title: "Differential Equations", type: "video" },
        ],
      });
      setLoading(false);
    }, 1000);
  }, [courseId]);

  const handleLoginRedirect = () => {
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Course Not Found</h2>
          <Link to="/" className="text-purple-600 hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-800"
      }`}
    >
      <LandingHeader />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link to="/" className="text-[#525fe1] hover:underline">
            &larr; Back to Home
          </Link>
        </div>

        <div className="bg-[#f5eaff] dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg">
          <div className="md:flex">
            <div className="md:w-1/3">
              <img
                src={course.image}
                alt={course.title}
                className="w-full h-auto object-cover"
              />
            </div>
            <div className="p-6 md:w-2/3">
              <h1 className="text-3xl font-bold mb-4 text-[#1c1c1c] dark:text-white">
                {course.title}
              </h1>
              <p className="text-lg mb-4 text-[#4c4c4c] dark:text-gray-300">
                {course.description}
              </p>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2 text-[#1c1c1c] dark:text-white">
                  Course Content
                </h2>
                <p className="text-[#4c4c4c] dark:text-gray-300">
                  {course.content}
                </p>
              </div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2 text-[#1c1c1c] dark:text-white">
                  Related Subjects
                </h2>
                <div className="flex flex-wrap gap-2">
                  {course.relatedSubjects.map((subject, index) => (
                    <span
                      key={index}
                      className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-6">
                <button
                  onClick={handleLoginRedirect}
                  className="bg-[#525fe1] hover:bg-[#4a4eb3] text-white text-[14px] font-bold py-[12px] px-[25px] rounded-lg transition-transform hover:scale-105"
                >
                  ĐĂNG NHẬP ĐỂ HỌC NGAY
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4 text-[#1c1c1c] dark:text-white">
            Course Materials
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {course.materials.map((material) => (
              <div
                key={material.id}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center">
                  <div className="mr-4">
                    {material.type === "pdf" ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-red-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8 text-blue-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-[#1c1c1c] dark:text-white">
                      {material.title}
                    </h3>
                    <p className="text-sm text-[#4c4c4c] dark:text-gray-400">
                      {material.type.toUpperCase()}
                    </p>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <button
                    onClick={handleLoginRedirect}
                    className="text-[#525fe1] hover:underline text-sm font-medium"
                  >
                    Đăng nhập để xem
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <LandingFooter />
    </div>
  );
};

export default Course;
