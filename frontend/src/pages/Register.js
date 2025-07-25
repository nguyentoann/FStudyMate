import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate, Link } from "react-router-dom";
import {
  PUBLIC_URL,
  OPEN_URL,
  EMERGENCY_URL,
  API_URL,
} from "../services/config";
import { motion } from "framer-motion";
import axios from "axios";
import { Typography } from "antd";

// Add API emergency URL
const API_EMERGENCY_URL = `${API_URL}/emergency`;

const Register = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    username: "",
    fullName: "",
    phoneNumber: "",
    role: "student",
    // Student-specific fields
    dateOfBirth: "",
    gender: "Male",
    academicMajor: "Software Engineering",
    // Lecturer-specific fields
    department: "",
    specializations: "",
    // Guest-specific fields
    institutionName: "",
    accessReason: "",
    // Outsource student fields
    organization: "",
  });

  const [error, setError] = useState("");
  const [debug, setDebug] = useState("");
  const [activeTab, setActiveTab] = useState("signup");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validation states
  const [emailValid, setEmailValid] = useState(true);
  const [phoneValid, setPhoneValid] = useState(true);
  const [emailTaken, setEmailTaken] = useState(false);
  const [usernameTaken, setUsernameTaken] = useState(false);
  const [phoneTaken, setPhoneTaken] = useState(false);
  const [dobValid, setDobValid] = useState(true);

  // Validation loading states
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [checkingPhone, setCheckingPhone] = useState(false);

  // Add inside the useState declarations section at the top of the component
  const [idCardImage, setIdCardImage] = useState(null);
  const [idCardFile, setIdCardFile] = useState(null);
  const [idCardFilename, setIdCardFilename] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  // Add these state variables with the other useState declarations
  const [lockedFields, setLockedFields] = useState({
    fullName: false,
    username: false
  });

  const { register } = useAuth();
  const { darkMode } = useTheme();
  const navigate = useNavigate();

  // Add debounce function for API calls
  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => func.apply(this, args), delay);
    };
  };

  // Test API connection
  const testApiConnection = async () => {
    try {
      console.log("Testing API connection...");
      const response = await fetch(
        `${API_URL.replace("/api", "")}/validation/test`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = await response.json();
      console.log("API test response:", data);
      return data;
    } catch (error) {
      console.error("API test error:", error);
      return { status: "error", message: error.message };
    }
  };

  // Call the test function when component mounts
  useEffect(() => {
    testApiConnection();
  }, []);

  // Check if username is taken
  const checkUsername = async (username) => {
    if (!username || username.length < 3) return;

    setCheckingUsername(true);
    try {
      // Call the API to check if username exists
      const response = await fetch(
        `${API_URL.replace(
          "/api",
          ""
        )}/validation/username?username=${encodeURIComponent(username)}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      ).catch(() => {
        // Fallback to simulated check if API fails
        return new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: () =>
                  Promise.resolve({
                    exists: username === "admin" || username === "test",
                  }),
              }),
            600
          )
        );
      });

      const data = await response.json();
      setUsernameTaken(data.exists);
    } catch (error) {
      console.error("Error checking username:", error);
      // Fallback to simulated check
      setUsernameTaken(username === "admin" || username === "test");
    } finally {
      setCheckingUsername(false);
    }
  };

  // Check if email is taken
  const checkEmail = async (email) => {
    if (!email || !emailValid) return;

    setCheckingEmail(true);
    try {
      // Call the API to check if email exists
      const response = await fetch(
        `${API_URL.replace(
          "/api",
          ""
        )}/validation/email?email=${encodeURIComponent(email)}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      ).catch(() => {
        // Fallback to simulated check if API fails
        return new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: () =>
                  Promise.resolve({
                    exists:
                      email === "admin@example.com" ||
                      email === "test@example.com",
                  }),
              }),
            600
          )
        );
      });

      const data = await response.json();
      setEmailTaken(data.exists);
    } catch (error) {
      console.error("Error checking email:", error);
      // Fallback to simulated check
      setEmailTaken(
        email === "admin@example.com" || email === "test@example.com"
      );
    } finally {
      setCheckingEmail(false);
    }
  };

  // Check if phone is taken
  const checkPhone = async (phone) => {
    if (!phone || !phoneValid) return;

    setCheckingPhone(true);
    try {
      // Call the API to check if phone exists
      const response = await fetch(
        `${API_URL.replace(
          "/api",
          ""
        )}/validation/phone?phone=${encodeURIComponent(phone)}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      ).catch(() => {
        // Fallback to simulated check if API fails
        return new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                ok: true,
                json: () =>
                  Promise.resolve({
                    exists: phone === "1234567890" || phone === "0987654321",
                  }),
              }),
            600
          )
        );
      });

      const data = await response.json();
      setPhoneTaken(data.exists);
    } catch (error) {
      console.error("Error checking phone:", error);
      // Fallback to simulated check
      setPhoneTaken(phone === "1234567890" || phone === "0987654321");
    } finally {
      setCheckingPhone(false);
    }
  };

  // Check if user is at least 16 years old
  const checkAge = (dob) => {
    if (!dob) return true;

    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age >= 16;
  };

  // Create debounced versions of the check functions
  const debouncedCheckUsername = debounce(checkUsername, 500);
  const debouncedCheckEmail = debounce(checkEmail, 500);
  const debouncedCheckPhone = debounce(checkPhone, 500);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    validateField(name, value);
  };

  // Handle paste events
  const handlePaste = (e) => {
    const { name } = e.target;
    // Use setTimeout to get the value after the paste event completes
    setTimeout(() => {
      const value = e.target.value;
      validateField(name, value);
    }, 0);
  };

  // Validate a specific field
  const validateField = (name, value) => {
    // Validate email
    if (name === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const isValid = emailRegex.test(value);
      setEmailValid(isValid);
      if (isValid) {
        setEmailTaken(false); // Reset before checking
        debouncedCheckEmail(value);
      }
    }

    // Validate phone
    if (name === "phoneNumber") {
      const phoneRegex = /^[0-9]{9,10}$/;
      const isValid = phoneRegex.test(value);
      setPhoneValid(isValid);
      if (isValid) {
        setPhoneTaken(false); // Reset before checking
        debouncedCheckPhone(value);
      }
    }

    // Validate username
    if (name === "username") {
      if (value.length >= 3) {
        setUsernameTaken(false); // Reset before checking
        debouncedCheckUsername(value);
      }
    }

    // Validate date of birth
    if (name === "dateOfBirth") {
      setDobValid(checkAge(value));
    }
  };

  // Add these functions inside the component but before the return statement
  // Handle ID card upload
  const handleIdCardUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIdCardFile(file);
    setIdCardFilename(file.name);
    setVerificationResult(null);

    // Create a preview of the image
    const reader = new FileReader();
    reader.onload = () => {
      setIdCardImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Remove the uploaded ID card
  const handleRemoveIdCard = () => {
    setIdCardImage(null);
    setIdCardFile(null);
    setIdCardFilename("");
    setVerificationResult(null);
  };

  // Verify the uploaded ID card
  const handleVerifyIdCard = async () => {
    if (!idCardFile) return;

    setVerifying(true);
    
    try {
      // Create a FormData object
      const formData = new FormData();
      formData.append("file", idCardFile);
      
      // Send the request to the API
      const response = await fetch(`${API_URL}/verify/student-id-card`, {
        method: "POST",
        body: formData,
      });
      
      const result = await response.json();
      setVerificationResult(result);
      
      // If verification was successful, auto-fill the form fields
      if (result.isValid) {
        const newFullName = result.fullName || formData.fullName;
        const newUsername = result.studentId || formData.username;
        
        setFormData({
          ...formData,
          fullName: newFullName,
          username: newUsername,
          // Update other fields as needed
        });
        
        // Lock the fields that were auto-filled
        setLockedFields({
          fullName: !!result.fullName, // Only lock if the AI provided a value
          username: !!result.studentId // Only lock if the AI provided a value
        });
        
        // Set a success message
        setError(""); // Clear any existing error
        setDebug("Student ID successfully verified! You're free to proceed with registration.");
      }
    } catch (error) {
      console.error("Error verifying student ID:", error);
      setVerificationResult({
        isValid: false,
        validationErrors: ["Error connecting to verification service. Please try again."],
      });
    } finally {
      setVerifying(false);
    }
  };

  // Add this new function to handle unlocking fields
  const handleUnlockField = (fieldName) => {
    if (window.confirm(`Are you sure you want to unlock the ${fieldName} field? This will remove the verification lock.`)) {
      setLockedFields(prev => ({
        ...prev,
        [fieldName]: false
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setDebug("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Check if email is valid and not taken
    if (!emailValid || emailTaken) {
      setError("Please correct the email field");
      return;
    }

    // Check if phone is valid and not taken
    if (!phoneValid || phoneTaken) {
      setError("Please correct the phone number field");
      return;
    }

    // Check if username is not taken
    if (usernameTaken) {
      setError("Please choose a different username");
      return;
    }

    // Check if date of birth makes user at least 16
    if (formData.dateOfBirth && !dobValid) {
      setError("You must be at least 16 years old to register");
      return;
    }

    // Require ID verification for 'student' role if we're enforcing verification
    if (formData.role === "student" && !verificationResult?.isValid) {
      // We can decide whether to make this a hard requirement or just a warning
      // setError("Please verify your student ID card before proceeding");
      // return;
    }

    try {
      setDebug("Submitting registration data...");

      // Create user object with correct field mapping
      const userData = {
        email: formData.email,
        passwordHash: formData.password, // This will be hashed on the server
        username: formData.username,
        fullName: formData.fullName,
        role: formData.role,
        phoneNumber: formData.phoneNumber,
      };

      // Add role-specific fields based on selected role
      switch (formData.role) {
        case "student":
          userData.dateOfBirth = formData.dateOfBirth;
          userData.gender = formData.gender;
          userData.academicMajor = formData.academicMajor;
          break;
        case "lecturer":
          userData.department = formData.department;
          userData.specializations = formData.specializations;
          break;
        case "guest":
          userData.institutionName = formData.institutionName;
          userData.accessReason = formData.accessReason;
          break;
        case "outsrc_student":
          userData.dateOfBirth = formData.dateOfBirth;
          userData.organization = formData.organization;
          break;
        default:
          // No additional fields needed
          break;
      }

      setDebug((prev) => prev + "\nSending data: " + JSON.stringify(userData));

      // Call register API
      const response = await register(userData);
      setDebug(
        (prev) =>
          prev +
          "\nRegistration successful! Response: " +
          JSON.stringify(response)
      );

      // After successful registration, generate OTP using a separate call
      setDebug(
        (prev) =>
          prev + "\n\nAttempting to generate OTP using multiple endpoints..."
      );

      // Try all three possible OTP generation endpoints
      let otpGenerationSuccessful = false;

      // 1. Try API endpoint first
      try {
        setDebug(
          (prev) => prev + "\nTrying API endpoint for OTP generation..."
        );
        const otpResponse = await fetch(`${API_URL}/auth/generate-otp`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: userData.email }),
          credentials: "omit",
        });

        const otpData = await otpResponse.json().catch(() => ({}));

        if (otpResponse.ok) {
          setDebug(
            (prev) =>
              prev +
              "\nAPI OTP generation successful: " +
              JSON.stringify(otpData)
          );
          otpGenerationSuccessful = true;
        } else {
          setDebug(
            (prev) =>
              prev + "\nAPI OTP generation failed, trying emergency endpoint..."
          );
        }
      } catch (apiError) {
        setDebug(
          (prev) =>
            prev + "\nError with API OTP generation: " + apiError.message
        );
      }

      // 2. Try direct emergency endpoint if needed
      if (!otpGenerationSuccessful) {
        try {
          setDebug(
            (prev) => prev + "\nTrying emergency endpoint for OTP generation..."
          );
          const emergencyResponse = await fetch(
            `${EMERGENCY_URL}/generate-otp`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ email: userData.email }),
              credentials: "omit",
            }
          );

          const emergencyData = await emergencyResponse
            .json()
            .catch(() => ({}));

          if (emergencyResponse.ok) {
            // Check if emergency OTP endpoint returned the OTP directly (for testing)
            if (emergencyData.otp) {
              setDebug(
                (prev) =>
                  prev +
                  "\nEmergency OTP generation successful. For testing use: " +
                  emergencyData.otp
              );
            } else {
              setDebug(
                (prev) =>
                  prev +
                  "\nEmergency OTP generation successful: " +
                  JSON.stringify(emergencyData)
              );
            }
            otpGenerationSuccessful = true;
          } else {
            setDebug(
              (prev) =>
                prev +
                "\nEmergency OTP generation failed: " +
                JSON.stringify(emergencyData)
            );
          }
        } catch (emergencyError) {
          setDebug(
            (prev) =>
              prev +
              "\nError with emergency OTP endpoint: " +
              emergencyError.message
          );
        }
      }

      // Navigate to verification page regardless of OTP generation success
      navigate("/verify-otp", {
        state: { email: userData.email },
      });
    } catch (error) {
      setDebug((prev) => prev + "\nRegistration error: " + error.message);
      setError("Registration failed: " + error.message);
    }
  };

  // Function to conditionally render role-specific fields
  const renderRoleSpecificFields = () => {
    const inputClassName = `appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-all duration-300`;

    switch (formData.role) {
      case "student":
        return (
          <>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <label
                htmlFor="academicMajor"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Academic Major
              </label>
              <motion.input
                id="academicMajor"
                name="academicMajor"
                type="text"
                required
                className={inputClassName}
                placeholder="Academic Major"
                value={formData.academicMajor}
                onChange={handleChange}
                onPaste={handlePaste}
                whileFocus={{ scale: 1.01, borderColor: "#3b82f6" }}
              />
            </motion.div>
          </>
        );
      case "lecturer":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <label
                  htmlFor="department"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Department
                </label>
                <motion.input
                  id="department"
                  name="department"
                  type="text"
                  required
                  className={inputClassName}
                  placeholder="Department"
                  value={formData.department}
                  onChange={handleChange}
                  onPaste={handlePaste}
                  whileFocus={{ scale: 1.01, borderColor: "#3b82f6" }}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <label
                  htmlFor="specializations"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Specializations
                </label>
                <motion.input
                  id="specializations"
                  name="specializations"
                  type="text"
                  required
                  className={inputClassName}
                  placeholder="Specializations (comma separated)"
                  value={formData.specializations}
                  onChange={handleChange}
                  onPaste={handlePaste}
                  whileFocus={{ scale: 1.01, borderColor: "#3b82f6" }}
                />
              </motion.div>
            </div>
          </>
        );
      case "guest":
        return (
          <>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <label
                htmlFor="institutionName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Institution Name
              </label>
              <motion.input
                id="institutionName"
                name="institutionName"
                type="text"
                required
                className={inputClassName}
                placeholder="Institution Name"
                value={formData.institutionName}
                onChange={handleChange}
                onPaste={handlePaste}
                whileFocus={{ scale: 1.01, borderColor: "#3b82f6" }}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <label
                htmlFor="accessReason"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Access Reason
              </label>
              <motion.textarea
                id="accessReason"
                name="accessReason"
                required
                className={inputClassName}
                placeholder="Reason for access"
                value={formData.accessReason}
                onChange={handleChange}
                onPaste={handlePaste}
                rows={3}
                whileFocus={{ scale: 1.01, borderColor: "#3b82f6" }}
              />
            </motion.div>
          </>
        );
      case "outsrc_student":
        return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <label
                  htmlFor="organization"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Organization
                </label>
                <motion.input
                  id="organization"
                  name="organization"
                  type="text"
                  required
                  className={inputClassName}
                  placeholder="Organization"
                  value={formData.organization}
                  onChange={handleChange}
                  onPaste={handlePaste}
                  whileFocus={{ scale: 1.01, borderColor: "#3b82f6" }}
                />
              </motion.div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden z-0">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white bg-opacity-10"
            style={{
              width: `${Math.random() * 300 + 50}px`,
              height: `${Math.random() * 300 + 50}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <motion.div
        className="max-w-5xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex z-10"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        {/* Left side with illustration */}
        <div
          className="hidden md:block w-1/2 bg-cover bg-center relative"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-blue-400/30 to-purple-800/50 flex items-center justify-center">
            <motion.div
              className="text-white text-center p-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
              <p className="text-lg opacity-90">
                Create an account to start your learning journey
              </p>
            </motion.div>
          </div>
        </div>

        {/* Right side with registration form */}
        <div
          className="w-full md:w-1/2 py-6 px-8 overflow-y-auto"
          style={{ maxHeight: "90vh", minHeight: "650px" }}
        >
          <div className="mb-8 flex border-b">
            <motion.button
              className={`pb-4 px-4 text-base font-medium relative ${
                activeTab === "login" ? "text-blue-600" : "text-gray-500"
              }`}
              onClick={() => navigate("/login")}
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              Login
              {activeTab === "login" && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                  layoutId="activeTab"
                  initial={false}
                />
              )}
            </motion.button>
            <motion.button
              className={`pb-4 px-4 text-base font-medium relative ${
                activeTab === "signup" ? "text-blue-600" : "text-gray-500"
              }`}
              onClick={() => setActiveTab("signup")}
              whileHover={{ y: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              Sign up
              {activeTab === "signup" && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                  layoutId="activeTab"
                  initial={false}
                />
              )}
            </motion.button>
          </div>

          {error && (
            <motion.div
              className="rounded-md bg-red-50 p-4 mb-4"
              placeholder="Full Name"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-sm text-red-700">{error}</div>
            </motion.div>
          )}

          {/* Main form content */}
          <motion.form
            onSubmit={handleSubmit}
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Email and Username in one row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="min-h-[85px]" // Add minimum height to accommodate validation message
              >
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <motion.input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onPaste={handlePaste}
                    className={`pl-10 pr-10 block w-full rounded-lg border h-[42px] ${
                      (formData.email && !emailValid) || emailTaken
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    } shadow-sm transition-all duration-300`}
                    placeholder="you@example.com"
                    required
                    whileFocus={{ scale: 1.01 }}
                  />
                  {formData.email && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      {!emailValid ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-red-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      ) : checkingEmail ? (
                        <svg
                          className="animate-spin h-5 w-5 text-gray-500"
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
                      ) : emailTaken ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-red-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-green-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  )}
                </div>
                {formData.email && !emailValid && (
                  <p className="text-sm text-red-600 mt-1">
                    Please enter a valid email address.
                  </p>
                )}
                {emailValid && emailTaken && (
                  <p className="text-sm text-red-600 mt-1">
                    This email is already registered.
                  </p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.05 }}
                className="min-h-[85px]" // Add minimum height to accommodate validation message
              >
                <label
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Username
                </label>
                <div className="relative">
                  <motion.input
                    type="text"
                    id="username"
                    name="username"
                    placeholder="User Name"
                    value={formData.username}
                    onChange={handleChange}
                    onPaste={handlePaste}
                    className={`pl-10 pr-10 block w-full rounded-lg border h-[42px] ${
                      lockedFields.username
                        ? "bg-gray-100 border-green-300 text-gray-700"
                        : usernameTaken
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    } shadow-sm transition-all duration-300`}
                    required
                    readOnly={lockedFields.username}
                    whileFocus={{ scale: lockedFields.username ? 1 : 1.01 }}
                  />
                  {lockedFields.username && (
                    <div className="mt-1 flex items-center justify-between">
                      <div className="flex items-center text-xs text-green-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        Verified student ID (locked)
                      </div>
                      <button 
                        type="button" 
                        onClick={() => handleUnlockField('username')}
                        className="text-xs text-blue-500 hover:text-blue-700"
                      >
                        
                      </button>
                    </div>
                  )}
                  {formData.username && formData.username.length >= 3 && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      {checkingUsername ? (
                        <svg
                          className="animate-spin h-5 w-5 text-gray-500"
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
                      ) : usernameTaken ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-red-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-green-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  )}
                </div>
                {usernameTaken && (
                  <p className="text-sm text-red-600 mt-1">
                    This username is already taken.
                  </p>
                )}
              </motion.div>
            </div>

            {/* Full Name and Phone Number in one row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="min-h-[85px]" // Add minimum height
              >
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Full Name
                </label>
                <motion.input
                  type="text"
                  id="fullName"
                  placeholder="Full Name"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  onPaste={handlePaste}
                  className={`block w-full rounded-lg border ${
                    lockedFields.fullName 
                      ? "bg-gray-100 border-green-300 text-gray-700" 
                      : "border-gray-300"
                  } shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-300 h-[42px] px-3`}
                  required
                  readOnly={lockedFields.fullName}
                  whileFocus={{ scale: lockedFields.fullName ? 1 : 1.01, borderColor: lockedFields.fullName ? "#10B981" : "#3b82f6" }}
                />
                {lockedFields.fullName && (
                  <div className="mt-1 flex items-center justify-between">
                    <div className="flex items-center text-xs text-green-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      Verified name (locked)
                    </div>
                    <button 
                      type="button" 
                      onClick={() => handleUnlockField('fullName')}
                      className="text-xs text-blue-500 hover:text-blue-700"
                    >
                      
                    </button>
                  </div>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 }}
                className="min-h-[85px]" // Add minimum height to accommodate validation message
              >
                <label
                  htmlFor="phoneNumber"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone Number
                </label>
                <div className="relative flex">
                  <div className="inline-flex">
                    <button
                      type="button"
                      className="inline-flex items-center px-3 h-[42px] border border-gray-300 rounded-l-lg bg-gray-50 hover:bg-gray-100 focus:outline-none"
                    >
                      <img
                        src="https://flagcdn.com/w20/vn.png"
                        alt="Vietnam"
                        className="mr-1"
                      />
                      <span className="text-sm font-medium">+84</span>
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
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  </div>
                  <motion.input
                    type="tel"
                    id="phoneNumber"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    onPaste={handlePaste}
                    className={`block w-full rounded-none rounded-r-lg border h-[42px] ${
                      (formData.phoneNumber && !phoneValid) || phoneTaken
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    } shadow-sm transition-all duration-300 px-3`}
                    required
                    placeholder="123456789"
                    whileFocus={{ scale: 1.01 }}
                  />
                  {formData.phoneNumber && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      {!phoneValid ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-red-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      ) : checkingPhone ? (
                        <svg
                          className="animate-spin h-5 w-5 text-gray-500"
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
                      ) : phoneTaken ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-red-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-green-500"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  )}
                </div>
                {formData.phoneNumber && !phoneValid && (
                  <p className="text-sm text-red-600 mt-1">
                    Please enter a valid phone number!
                  </p>
                )}
                {phoneValid && phoneTaken && (
                  <p className="text-sm text-red-600 mt-1">
                    This phone number is already registered.
                  </p>
                )}
              </motion.div>
            </div>

            {/* Password and Confirm Password in one row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="min-h-[85px]" // Add minimum height
              >
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                      />
                    </svg>
                  </div>
                  <motion.input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    onPaste={handlePaste}
                    className="pl-10 pr-10 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-300 h-[42px]"
                    required
                    whileFocus={{ scale: 1.01, borderColor: "#3b82f6" }}
                  />
                  <div
                    className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-500 hover:text-gray-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-500 hover:text-gray-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25 }}
                className="min-h-[85px]" // Add minimum height
              >
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                      />
                    </svg>
                  </div>
                  <motion.input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    placeholder="Confirm Password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onPaste={handlePaste}
                    className="pl-10 pr-10 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-300 h-[42px]"
                    required
                    whileFocus={{ scale: 1.01, borderColor: "#3b82f6" }}
                  />
                  <div
                    className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                  >
                    {showConfirmPassword ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-500 hover:text-gray-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 text-gray-500 hover:text-gray-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Role, Gender and Date of Birth in one row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="min-h-[85px]" // Add minimum height
              >
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Role
                </label>
                <motion.select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  onPaste={handlePaste}
                  className="block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-300 h-[42px] px-3"
                  required
                  whileFocus={{ scale: 1.01, borderColor: "#3b82f6" }}
                >
                  <option value="student">Student</option>
                  <option value="lecturer">Lecturer</option>
                  <option value="guest">Guest</option>
                  <option value="outsrc_student">Outsource Student</option>
                </motion.select>
              </motion.div>

              {formData.role === "student" ||
              formData.role === "outsrc_student" ? (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="min-h-[85px]" // Add minimum height
                  >
                    <label
                      htmlFor="gender"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Gender
                    </label>
                    <motion.select
                      id="gender"
                      name="gender"
                      required
                      className="block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-all duration-300 h-[42px] px-3"
                      value={formData.gender}
                      onChange={handleChange}
                      onPaste={handlePaste}
                      whileFocus={{ scale: 1.01, borderColor: "#3b82f6" }}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </motion.select>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="min-h-[85px]" // Add minimum height
                  >
                    <label
                      htmlFor="dateOfBirth"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Date of Birth
                    </label>
                    <motion.input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      required
                      className={`block w-full rounded-lg border h-[42px] ${
                        formData.dateOfBirth && !dobValid
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      } shadow-sm transition-all duration-300 px-3`}
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      onPaste={handlePaste}
                      whileFocus={{ scale: 1.01 }}
                    />
                    {formData.dateOfBirth && !dobValid && (
                      <p className="text-sm text-red-600 mt-1">
                        You must be at least 16 years old to register.
                      </p>
                    )}
                  </motion.div>
                </>
              ) : null}
            </div>

            {/* Role-specific fields */}
            {renderRoleSpecificFields()}

            {/* Student ID Card Verification - Only show for 'student' and 'outsrc_student' roles */}
            {(formData.role === "student" || formData.role === "outsrc_student") && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="mt-6 p-4 border border-blue-200 rounded-lg bg-blue-50"
              >
                <h3 className="font-medium text-lg text-blue-700 mb-3">Student ID Card Verification</h3>
                <p className="text-sm text-gray-700 mb-4">
                  {formData.role === "student" 
                    ? "Please upload your FPT student ID card for verification. This helps us confirm you're an internal student."
                    : "If you're an FPT student, please upload your student ID card to verify your identity."}
                </p>
                
                {/* Card upload section */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Student ID Card
                  </label>
                  <div className="mt-1 flex items-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleIdCardUpload}
                      className="hidden"
                      id="student-id-upload"
                    />
                    <label
                      htmlFor="student-id-upload"
                      className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Select image
                    </label>
                    {idCardImage && (
                      <span className="ml-2 text-sm text-gray-500 truncate max-w-xs">
                        {idCardFilename}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Preview of uploaded image */}
                {idCardImage && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preview
                    </label>
                    <div className="relative border rounded-md overflow-hidden" style={{ maxWidth: '300px' }}>
                      <img
                        src={idCardImage}
                        alt="Student ID preview"
                        className="w-full h-auto"
                        style={{ maxHeight: '200px', objectFit: 'contain' }}
                      />
                      {verifying && (
                        <div className="absolute inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                        </div>
                      )}
                    </div>
                    <div className="mt-2 flex space-x-2">
                      <button
                        type="button"
                        onClick={handleVerifyIdCard}
                        disabled={verifying}
                        className={`${
                          verifying
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                        } text-white py-1 px-3 rounded-md text-sm transition-colors duration-200`}
                      >
                        {verifying ? "Verifying..." : "Verify Card"}
                      </button>
                      <button
                        type="button"
                        onClick={handleRemoveIdCard}
                        disabled={verifying}
                        className="bg-white hover:bg-gray-100 text-gray-700 py-1 px-3 border border-gray-300 rounded-md text-sm transition-colors duration-200"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Verification results */}
                {verificationResult && (
                  <div className={`mt-4 p-3 rounded-md ${verificationResult.isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 h-6 w-6 ${verificationResult.isValid ? 'text-green-500' : 'text-red-500'}`}>
                        {verificationResult.isValid ? (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      <div className="ml-3">
                        <h3 className={`text-sm font-medium ${verificationResult.isValid ? 'text-green-800' : 'text-red-800'}`}>
                          {verificationResult.isValid ? 'Student ID Card Verified' : 'Verification Failed'}
                        </h3>
                        {verificationResult.isValid ? (
                          <div className="mt-2 text-sm text-green-700">
                            <ul className="list-disc pl-5 space-y-1">
                              <li>Student ID: {verificationResult.studentId}</li>
                              <li>Full Name: {verificationResult.fullName}</li>
                              <li>Valid Until: {verificationResult.validTillDate}</li>
                            </ul>
                            <div className="mt-3 font-semibold">
                              Verification successful! You're free to continue with registration.
                              <div className="text-xs mt-1 text-green-600">
                                Your student ID has been applied to the username field and relevant fields have been locked for security.
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="mt-2 text-sm text-red-700">
                            <ul className="list-disc pl-5 space-y-1">
                              {verificationResult.validationErrors && verificationResult.validationErrors.map((error, index) => (
                                <li key={index}>{error}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Go Back and Register Buttons */}
            <div className="flex gap-4 pt-4">
              <motion.button
                type="button"
                onClick={() => navigate("/")}
                className="flex-1 flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                whileHover={{
                  y: -2,
                  boxShadow: "0 10px 15px -5px rgba(0, 0, 0, 0.1)",
                }}
                whileTap={{ scale: 0.98 }}
              >
                <Typography className="mt-1">Go Back Home</Typography>
              </motion.button>
              <motion.button
                type="submit"
                className="flex-1 flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 uppercase transition-all duration-300"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.35 }}
                whileHover={{
                  y: -2,
                  boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.5)",
                }}
                whileTap={{ scale: 0.98 }}
              >
                Register
              </motion.button>
            </div>
          </motion.form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Register;
