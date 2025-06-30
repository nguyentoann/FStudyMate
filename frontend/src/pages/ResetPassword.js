import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';

// URL gốc của API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

/**
 * Trang đặt lại mật khẩu
 */
const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpChecking, setIsOtpChecking] = useState(false);
  const [message, setMessage] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  /**
   * Lấy thông tin từ query params hoặc state
   */
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const otpParam = queryParams.get('otp');
    const emailParam = queryParams.get('email');
    const emailFromState = location.state?.email;
    
    if (emailFromState) {
      setEmail(emailFromState);
    } else if (emailParam) {
      setEmail(emailParam);
    }
    
    if (otpParam) {
      setOtp(otpParam);
      validateOtp(otpParam);
    }
  }, [location.search, location.state]);
  
  /**
   * Xác thực OTP
   */
  const validateOtp = async (otpValue) => {
    if (!otpValue) return;
    
    setIsOtpChecking(true);
    
    try {
      // Gửi yêu cầu API kiểm tra OTP
      const response = await fetch(`${API_BASE_URL}/api/auth/validate-otp?otp=${otpValue}`);
      const data = await response.json();
      
      if (response.ok && data.valid) {
        if (data.email && !email) {
          setEmail(data.email);
        }
        setMessage({ text: 'Mã OTP hợp lệ. Vui lòng nhập mật khẩu mới.', isError: false });
      } else {
        setMessage({ text: 'Mã OTP không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại.', isError: true });
      }
    } catch (error) {
      setMessage({ text: 'Không thể kết nối đến server', isError: true });
    } finally {
      setIsOtpChecking(false);
    }
  };
  
  /**
   * Xử lý khi form được submit
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Kiểm tra OTP
    if (!otp) {
      setMessage({ text: 'Vui lòng nhập mã OTP', isError: true });
      return;
    }
    
    // Kiểm tra mật khẩu
    if (password.length < 6) {
      setMessage({ text: 'Mật khẩu phải có ít nhất 6 ký tự', isError: true });
      return;
    }
    
    if (password !== confirmPassword) {
      setMessage({ text: 'Mật khẩu và xác nhận mật khẩu không khớp', isError: true });
      return;
    }
    
    setIsLoading(true);
    setMessage(null);
    
    try {
      // Gửi yêu cầu API reset password
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          otp,
          password,
          confirmPassword
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setMessage({ text: 'Đặt lại mật khẩu thành công', isError: false });
        setIsSubmitted(true);
        
        // Chuyển hướng về trang đăng nhập sau 2 giây
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setMessage({ text: data.message || 'Đặt lại mật khẩu thất bại', isError: true });
      }
    } catch (error) {
      setMessage({ text: 'Không thể kết nối đến server', isError: true });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Hiển thị loading khi đang kiểm tra OTP
  if (isOtpChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 mx-auto text-blue-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-600">Đang xác thực mã OTP...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Đặt lại mật khẩu
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Nhập mã OTP được gửi đến email và mật khẩu mới của bạn
          </p>
          {email && (
            <p className="mt-2 text-center text-sm text-blue-600">
              Email: {email}
            </p>
          )}
        </div>
        
        {/* Form đặt lại mật khẩu */}
        {!isSubmitted && (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {/* Nhập OTP */}
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700">Mã xác thực OTP</label>
              <input
                id="otp"
                name="otp"
                type="text"
                required
                className="mt-1 appearance-none rounded relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Nhập mã OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={isLoading}
              />
              <p className="mt-1 text-sm text-gray-500">
                Nhập mã OTP đã được gửi đến email của bạn
              </p>
            </div>
            
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="password" className="sr-only">Mật khẩu mới</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-t-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Mật khẩu mới"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="sr-only">Xác nhận mật khẩu</label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  required
                  className="appearance-none rounded-b-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Xác nhận mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Hiển thị thông báo */}
            {message && (
              <div className={`text-sm ${message.isError ? 'text-red-600' : 'text-green-600'}`}>
                {message.text}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isLoading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang xử lý...
                  </>
                ) : (
                  'Đặt lại mật khẩu'
                )}
              </button>
            </div>
            
            <div className="text-center text-sm">
              <button 
                type="button" 
                onClick={() => navigate('/forgot-password')}
                className="font-medium text-blue-600 hover:text-blue-500 mt-4"
              >
                Yêu cầu mã OTP mới
              </button>
            </div>
          </form>
        )}
        
        {/* Thông báo thành công */}
        {isSubmitted && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 mt-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  Đặt lại mật khẩu thành công! Bạn sẽ được chuyển hướng đến trang đăng nhập trong vài giây...
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="text-center">
          <Link 
            to="/login" 
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Trở về trang đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword; 