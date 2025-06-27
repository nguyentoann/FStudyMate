import axios from 'axios';
import { API_BASE_URL } from '../config';

const API_URL = `${API_BASE_URL}/api/auth`;

/**
 * Gửi yêu cầu quên mật khẩu
 * @param email Email người dùng
 * @returns Promise với kết quả từ API
 */
export const forgotPassword = async (email: string) => {
  try {
    const response = await axios.post(`${API_URL}/forgot-password`, { email });
    return {
      success: true,
      data: response.data,
      message: response.data.message
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Không thể kết nối đến server'
    };
  }
};

/**
 * Kiểm tra token reset có hợp lệ không
 * @param token Token đặt lại mật khẩu
 * @returns Promise với kết quả từ API
 */
export const validateResetToken = async (token: string) => {
  try {
    const response = await axios.get(`${API_URL}/validate-reset-token`, {
      params: { token }
    });
    return {
      success: true,
      valid: response.data.valid
    };
  } catch (error) {
    return {
      success: false,
      valid: false
    };
  }
};

/**
 * Đặt lại mật khẩu
 * @param token Token đặt lại mật khẩu
 * @param password Mật khẩu mới
 * @param confirmPassword Xác nhận mật khẩu mới
 * @returns Promise với kết quả từ API
 */
export const resetPassword = async (
  token: string,
  password: string,
  confirmPassword: string
) => {
  try {
    const response = await axios.post(`${API_URL}/reset-password`, {
      token,
      password,
      confirmPassword
    });
    return {
      success: true,
      data: response.data,
      message: response.data.message
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Không thể đặt lại mật khẩu'
    };
  }
}; 