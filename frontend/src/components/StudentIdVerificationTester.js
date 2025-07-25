import React, { useState } from "react";
import { API_URL } from "../services/config";

/**
 * Test component for Student ID verification
 */
const StudentIdVerificationTester = () => {
  const [idCardImage, setIdCardImage] = useState(null);
  const [idCardFile, setIdCardFile] = useState(null);
  const [idCardFilename, setIdCardFilename] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [rawResponse, setRawResponse] = useState("");
  const [error, setError] = useState("");

  // Handle ID card upload
  const handleIdCardUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIdCardFile(file);
    setIdCardFilename(file.name);
    setVerificationResult(null);
    setRawResponse("");
    setError("");

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
    setRawResponse("");
    setError("");
  };

  // Verify the uploaded ID card
  const handleVerifyIdCard = async () => {
    if (!idCardFile) {
      setError("Please upload an image first");
      return;
    }

    setVerifying(true);
    setError("");
    
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
      setRawResponse(JSON.stringify(result, null, 2));
      
    } catch (error) {
      console.error("Error verifying student ID:", error);
      setError(`Error: ${error.message}`);
      setVerificationResult({
        isValid: false,
        validationErrors: ["Error connecting to verification service. Please try again."],
      });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6">Student ID Verification Tester</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-semibold mb-4">Upload Image</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Student ID Card Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleIdCardUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>
          
          {idCardImage && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preview
              </label>
              <div className="relative border rounded-md overflow-hidden" style={{ maxWidth: '400px' }}>
                <img
                  src={idCardImage}
                  alt="Student ID preview"
                  className="w-full h-auto"
                  style={{ maxHeight: '300px', objectFit: 'contain' }}
                />
                {verifying && (
                  <div className="absolute inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
              <div className="mt-4 flex space-x-3">
                <button
                  type="button"
                  onClick={handleVerifyIdCard}
                  disabled={verifying}
                  className={`${
                    verifying
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  } text-white py-2 px-4 rounded-md transition-colors duration-200`}
                >
                  {verifying ? "Verifying..." : "Verify Card"}
                </button>
                <button
                  type="button"
                  onClick={handleRemoveIdCard}
                  disabled={verifying}
                  className="bg-white hover:bg-gray-100 text-gray-700 py-2 px-4 border border-gray-300 rounded-md transition-colors duration-200"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-4">Verification Results</h2>
          
          {verificationResult ? (
            <>
              <div className={`mb-4 p-4 rounded-md ${verificationResult.isValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
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
                          <li><strong>Student ID:</strong> {verificationResult.studentId}</li>
                          <li><strong>Full Name:</strong> {verificationResult.fullName}</li>
                          <li><strong>Valid Until:</strong> {verificationResult.validTillDate}</li>
                        </ul>
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
              
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Raw API Response:</h3>
                <pre className="bg-gray-50 p-4 rounded-md text-xs overflow-auto max-h-96">
                  {rawResponse}
                </pre>
              </div>
            </>
          ) : (
            <div className="text-gray-500 italic">
              No verification results yet. Upload an image and click "Verify Card" to test.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentIdVerificationTester; 