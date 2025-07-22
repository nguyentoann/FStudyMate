import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import DashboardLayout from "../components/DashboardLayout";
import ProfileCard from "../components/ProfileCard";
import { API_URL, PUBLIC_URL } from "../services/config";
import { Link } from "react-router-dom";

const Profile = () => {
  const { user, setUser } = useAuth();
  const { darkMode } = useTheme();
  const [editing, setEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    profileImageUrl: "",
    // Role-specific fields will be conditionally rendered
    department: "",
    specializations: "",
    academicMajor: "",
    gender: "",
    dateOfBirth: "",
    organization: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [studentImageUrl, setStudentImageUrl] = useState("");
  const [originalImageUrl, setOriginalImageUrl] = useState("");
  // Thêm state để lưu trữ thông tin lớp học
  const [userClasses, setUserClasses] = useState([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [classError, setClassError] = useState("");

  // Code icon SVG for software engineers/students
  const codeIconSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="white" stroke-width="1">
      <path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  `;
  const codeIconUrl = `data:image/svg+xml;base64,${btoa(codeIconSvg)}`;

  // Get the student image URL based on student ID
  useEffect(() => {
    try {
      if (user) {
        console.log("User object:", user);

        let newStudentImageUrl = "";
        let originalUrl = "";

        // Safely get the original URL
        if (user.profileImageUrl && typeof user.profileImageUrl === "string") {
          originalUrl = user.profileImageUrl;
          console.log("Original profile image URL:", originalUrl);

          // Extract student ID from the original URL
          if (originalUrl.includes("/profile/image/")) {
            try {
              const parts = originalUrl.split("/");
              const fileName = parts[parts.length - 1]; // This will be like "DE180045.jpg"
              console.log("Extracted filename:", fileName);

              const studentId = fileName.split(".")[0]; // Extract DE180045 from DE180045.jpg
              console.log("Extracted student ID:", studentId);

              if (studentId) {
                // Use the exact same format as the working endpoint
                newStudentImageUrl = `${API_URL.replace(
                  /\/api$/,
                  ""
                )}/api/StudentImages/${studentId}.png`;
                console.log("New student image URL:", newStudentImageUrl);
              }
            } catch (err) {
              console.error("Error extracting student ID from URL:", err);
            }
          }
        }

        setStudentImageUrl(
          newStudentImageUrl || originalUrl || "/images/default-avatar.svg"
        );
        setOriginalImageUrl(originalUrl);
      }
    } catch (err) {
      console.error("Error in student image URL processing:", err);
      // Set default values in case of error
      setStudentImageUrl("/images/default-avatar.svg");
      setOriginalImageUrl("");
    }
  }, [user, API_URL]);

  // Load user data into form
  useEffect(() => {
    if (user) {
      setProfileData({
        fullName: user.fullName || "",
        email: user.email || "",
        phoneNumber: user.phoneNumber || "",
        profileImageUrl: user.profileImageUrl || "",
        // Role-specific fields
        department: user.department || "",
        specializations: user.specializations || "",
        academicMajor: user.academicMajor || "",
        gender: user.gender || "",
        dateOfBirth: user.dateOfBirth || "",
        organization: user.organization || "",
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({ ...profileData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Create the payload with only the fields that should be updated
      const payload = {
        userId: user.id,
        fullName: profileData.fullName,
        phoneNumber: profileData.phoneNumber,
        profileImageUrl: profileData.profileImageUrl,
      };

      // Add role-specific fields
      if (user.role === "lecturer") {
        payload.department = profileData.department;
        payload.specializations = profileData.specializations;
      } else if (user.role === "student") {
        payload.academicMajor = profileData.academicMajor;
        payload.gender = profileData.gender;
        payload.dateOfBirth = profileData.dateOfBirth;
      } else if (user.role === "outsrc_student") {
        payload.organization = profileData.organization;
        payload.dateOfBirth = profileData.dateOfBirth;
      }

      const response = await fetch(`${API_URL}/update-profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      const updatedUser = await response.json();

      // Update local user data
      const newUserData = { ...user, ...updatedUser };
      localStorage.setItem("user", JSON.stringify(newUserData));

      // If setUser is available in AuthContext, update it
      if (setUser) {
        setUser(newUserData);
      }

      setSuccess("Profile updated successfully");
      setEditing(false);
    } catch (error) {
      setError(
        error.message || "An error occurred while updating your profile"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleContactClick = () => {
    // You can implement contact functionality here
    console.log("Contact button clicked");
  };

  // Get user role in a formatted way
  const getUserTitle = () => {
    if (!user || !user.role) return "User";

    // Convert role to a more readable format
    switch (user.role) {
      case "lecturer":
        return "Lecturer";
      case "student":
        return "Student";
      case "outsrc_student":
        return "External Student";
      default:
        return user.role.charAt(0).toUpperCase() + user.role.slice(1);
    }
  };

  // Get user handle from email
  const getUserHandle = () => {
    if (!user || !user.email) return "user";
    return user.email.split("@")[0];
  };

  // Thêm hàm để lấy thông tin lớp học của người dùng
  const fetchUserClasses = async () => {
    if (!user) return;

    try {
      setLoadingClasses(true);
      setClassError("");

      // Nếu là giảng viên, lấy các lớp mà giảng viên đó dạy
      if (user.role === "lecturer") {
        const response = await fetch(`${API_URL}/classes/teacher/${user.id}`);

        if (response.ok) {
          const data = await response.json();
          setUserClasses(data);
        } else {
          setClassError("Failed to fetch classes");
        }
      }
      // Nếu là sinh viên, lấy lớp mà sinh viên đó thuộc về
      else if (user.role === "student") {
        // Thử lấy tất cả các lớp và tìm lớp mà sinh viên này thuộc về
        const response = await fetch(`${API_URL}/classes`);

        if (response.ok) {
          const allClasses = await response.json();
          // Lọc các lớp có sinh viên này
          const studentClasses = [];

          // Kiểm tra từng lớp xem sinh viên có thuộc lớp đó không
          for (const classObj of allClasses) {
            try {
              const studentsResponse = await fetch(
                `${API_URL}/classes/${classObj.classId}/students`
              );
              if (studentsResponse.ok) {
                const students = await studentsResponse.json();
                if (students.some((student) => student.id === user.id)) {
                  studentClasses.push(classObj);
                }
              }
            } catch (err) {
              console.error(
                `Error checking students for class ${classObj.classId}:`,
                err
              );
            }
          }

          setUserClasses(studentClasses);
        } else {
          setClassError("Failed to fetch classes");
        }
      }
    } catch (err) {
      setClassError("An error occurred while fetching classes");
      console.error(err);
    } finally {
      setLoadingClasses(false);
    }
  };

  // Gọi hàm fetchUserClasses khi component được mount
  useEffect(() => {
    fetchUserClasses();
  }, [user]);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">User Profile</h1>

        {error && (
          <div
            className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6"
            role="alert"
          >
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div
            className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6"
            role="alert"
          >
            <p>{success}</p>
          </div>
        )}

        {!user ? (
          <div
            className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6"
            role="alert"
          >
            <p>Loading user data...</p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Profile Card Section - Take 40% width on large screens */}
            <div className="lg:w-5/12 flex justify-center mb-8 lg:mb-0">
              <div className="w-full max-w-[350px]">
                <ProfileCard
                  name={user?.fullName || "User Name"}
                  title={getUserTitle()}
                  handle={getUserHandle()}
                  status={user?.isActive ? "Active" : "Offline"}
                  contactText="Message"
                  avatarUrl={studentImageUrl}
                  originalUrl={originalImageUrl}
                  iconUrl={codeIconUrl}
                  showUserInfo={true}
                  enableTilt={true}
                  onContactClick={handleContactClick}
                />
              </div>
            </div>

            {/* Profile Details Section - Take 60% width on large screens */}
            <div className="lg:w-7/12 bg-white/80 backdrop-blur-md rounded-[30px] shadow-md overflow-hidden">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-semibold">Profile Information</h3>
                  <div>
                    {!editing ? (
                      <div className="space-x-2">
                        <button
                          onClick={() => setEditing(true)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                        >
                          Edit Profile
                        </button>
                        <a
                          href="/change-password"
                          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 inline-block"
                        >
                          Change Password
                        </a>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEditing(false)}
                        className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      {editing ? (
                        <input
                          type="text"
                          name="fullName"
                          value={profileData.fullName}
                          onChange={handleInputChange}
                          className="mt-1 p-2 w-full border rounded-md"
                          required
                        />
                      ) : (
                        <p className="mt-1">{profileData.fullName}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <p className="mt-1">{profileData.email}</p>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      {editing ? (
                        <input
                          type="text"
                          name="phoneNumber"
                          value={profileData.phoneNumber}
                          onChange={handleInputChange}
                          className="mt-1 p-2 w-full border rounded-md"
                        />
                      ) : (
                        <p className="mt-1">
                          {profileData.phoneNumber || "Not provided"}
                        </p>
                      )}
                    </div>

                    {/* Profile Image URL */}
                    {editing && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Profile Image URL
                        </label>
                        <input
                          type="text"
                          name="profileImageUrl"
                          value={profileData.profileImageUrl}
                          onChange={handleInputChange}
                          className="mt-1 p-2 w-full border rounded-md"
                          placeholder="Image URL"
                        />
                      </div>
                    )}

                    {/* Role */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Role
                      </label>
                      <p className="mt-1 capitalize">{user?.role}</p>
                    </div>

                    {/* Conditional Fields based on Role */}
                    {user?.role === "lecturer" && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Department
                          </label>
                          {editing ? (
                            <input
                              type="text"
                              name="department"
                              value={profileData.department}
                              onChange={handleInputChange}
                              className="mt-1 p-2 w-full border rounded-md"
                            />
                          ) : (
                            <p className="mt-1">
                              {profileData.department || "Not provided"}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Specializations
                          </label>
                          {editing ? (
                            <input
                              type="text"
                              name="specializations"
                              value={profileData.specializations}
                              onChange={handleInputChange}
                              className="mt-1 p-2 w-full border rounded-md"
                            />
                          ) : (
                            <p className="mt-1">
                              {profileData.specializations || "Not provided"}
                            </p>
                          )}
                        </div>
                      </>
                    )}

                    {user?.role === "student" && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Academic Major
                          </label>
                          {editing ? (
                            <input
                              type="text"
                              name="academicMajor"
                              value={profileData.academicMajor}
                              onChange={handleInputChange}
                              className="mt-1 p-2 w-full border rounded-md"
                            />
                          ) : (
                            <p className="mt-1">
                              {profileData.academicMajor || "Not provided"}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Gender
                          </label>
                          {editing ? (
                            <select
                              name="gender"
                              value={profileData.gender}
                              onChange={handleInputChange}
                              className="mt-1 p-2 w-full border rounded-md"
                            >
                              <option value="">Select Gender</option>
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                          ) : (
                            <p className="mt-1">
                              {profileData.gender || "Not provided"}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Date of Birth
                          </label>
                          {editing ? (
                            <input
                              type="date"
                              name="dateOfBirth"
                              value={profileData.dateOfBirth}
                              onChange={handleInputChange}
                              className="mt-1 p-2 w-full border rounded-md"
                            />
                          ) : (
                            <p className="mt-1">
                              {profileData.dateOfBirth || "Not provided"}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Classes
                          </label>
                          <p className="mt-1">
                            {userClasses.map((classObj) => (
                              <div key={classObj.classId}>
                                <p> {classObj.className}</p>
                              </div>
                            ))}
                          </p>
                        </div>
                      </>
                    )}

                    {user?.role === "outsrc_student" && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Organization
                          </label>
                          {editing ? (
                            <input
                              type="text"
                              name="organization"
                              value={profileData.organization}
                              onChange={handleInputChange}
                              className="mt-1 p-2 w-full border rounded-md"
                            />
                          ) : (
                            <p className="mt-1">
                              {profileData.organization || "Not provided"}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Date of Birth
                          </label>
                          {editing ? (
                            <input
                              type="date"
                              name="dateOfBirth"
                              value={profileData.dateOfBirth}
                              onChange={handleInputChange}
                              className="mt-1 p-2 w-full border rounded-md"
                            />
                          ) : (
                            <p className="mt-1">
                              {profileData.dateOfBirth || "Not provided"}
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {editing && (
                    <div className="mt-6">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-indigo-300"
                      >
                        {loading ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      {user && (user.role === "lecturer" || user.role === "student") && (
        <div className="mt-8 bg-white/80 backdrop-blur-md rounded-[30px] shadow-md overflow-hidden">
          <div className="p-8">
            <h3 className="text-xl font-semibold mb-6">My Classes</h3>

            {classError && (
              <div
                className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6"
                role="alert"
              >
                <p>{classError}</p>
              </div>
            )}

            {loadingClasses ? (
              <p>Loading classes...</p>
            ) : userClasses.length === 0 ? (
              <p>You are not associated with any classes.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {userClasses.map((classObj) => (
                  <div
                    key={classObj.classId}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <h4 className="text-lg font-medium mb-2">
                      {classObj.className}
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">ID:</span>{" "}
                        {classObj.classId}
                      </p>
                      <p>
                        <span className="font-medium">Term:</span>{" "}
                        {classObj.term ? classObj.term.name : "N/A"}
                      </p>
                      <p>
                        <span className="font-medium">Department:</span>{" "}
                        {classObj.academicMajor
                          ? classObj.academicMajor.name
                          : "N/A"}
                      </p>
                      <p>
                        <span className="font-medium">Students:</span>{" "}
                        {classObj.currentStudents}/{classObj.maxStudents}
                      </p>
                    </div>
                    <div className="mt-4">
                      <Link
                        to="/classes"
                        className="text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Profile;
