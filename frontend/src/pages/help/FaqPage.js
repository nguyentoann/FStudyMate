import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';

const FaqPage = () => {
  const [activeQuestion, setActiveQuestion] = useState(null);

  const toggleQuestion = (index) => {
    setActiveQuestion(activeQuestion === index ? null : index);
  };

  const faqs = [
    {
      question: "FStudyMate là gì?",
      answer: "FStudyMate là nền tảng quản lý học tập giúp sinh viên và giảng viên tương tác hiệu quả. Hệ thống cung cấp các tính năng quản lý lớp học, lịch trình, trò chuyện trực tiếp, và công cụ học tập tương tác."
    },
    {
      question: "Làm thế nào để tham gia lớp học?",
      answer: "Để tham gia lớp học, bạn cần đăng nhập vào tài khoản và truy cập menu 'Class Management'. Tại đây, bạn có thể xem danh sách các lớp học hiện có hoặc tìm kiếm lớp học thông qua mã lớp được giảng viên cung cấp."
    },
    {
      question: "Làm thế nào để liên hệ với giảng viên?",
      answer: "Bạn có thể liên hệ với giảng viên thông qua hệ thống chat tích hợp. Nhấp vào biểu tượng chat ở góc màn hình, chọn người dùng là giảng viên của bạn và gửi tin nhắn trực tiếp."
    },
    {
      question: "Làm thế nào để nộp phản hồi về hệ thống?",
      answer: "Để nộp phản hồi, bạn có thể truy cập mục 'Feedback' trong phần Help trên menu. Tại đây, bạn có thể điền thông tin phản hồi của mình và gửi cho quản trị viên hệ thống."
    },
    {
      question: "Làm sao để thay đổi thông tin cá nhân?",
      answer: "Để thay đổi thông tin cá nhân, truy cập vào mục 'Profile' trong menu Settings. Tại đây, bạn có thể cập nhật thông tin cá nhân, đổi ảnh đại diện và các thông tin khác."
    },
    {
      question: "Làm thế nào để thay đổi mật khẩu?",
      answer: "Để thay đổi mật khẩu, truy cập vào mục 'Account' trong menu Settings. Tại đó, chọn 'Change Password', nhập mật khẩu cũ và mật khẩu mới của bạn, sau đó lưu thay đổi."
    },
    {
      question: "Làm thế nào để xem lịch học của tôi?",
      answer: "Để xem lịch học của bạn, truy cập vào mục 'Weekly Timetable' hoặc 'Calendar & Events' trên menu chính. Tại đây, bạn có thể xem tất cả các lớp học và sự kiện được sắp xếp theo thời gian."
    },
    {
      question: "Tôi quên mật khẩu, phải làm sao?",
      answer: "Nếu bạn quên mật khẩu, hãy nhấp vào 'Forgot Password' trên trang đăng nhập. Hệ thống sẽ gửi hướng dẫn đặt lại mật khẩu đến địa chỉ email đã đăng ký của bạn."
    }
  ];

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold mb-2">Câu hỏi thường gặp</h1>
          <p className="text-gray-600 mb-6">
            Dưới đây là những câu hỏi thường gặp về việc sử dụng nền tảng FStudyMate. Nếu bạn không tìm thấy câu trả lời cho câu hỏi của mình, vui lòng liên hệ với chúng tôi thông qua mục phản hồi.
          </p>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-4">
                <button
                  className="flex justify-between items-center w-full text-left font-medium text-gray-800 focus:outline-none"
                  onClick={() => toggleQuestion(index)}
                >
                  <span className="text-lg">{faq.question}</span>
                  <svg
                    className={`w-5 h-5 transform ${activeQuestion === index ? 'rotate-180' : ''} transition-transform`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {activeQuestion === index && (
                  <div className="mt-2 text-gray-600 pl-4 border-l-4 border-blue-500">
                    <p className="py-2">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-700">Bạn không tìm thấy câu trả lời?</h2>
            <p className="text-blue-600 mt-2">
              Nếu bạn có câu hỏi khác hoặc cần hỗ trợ thêm, vui lòng gửi phản hồi của bạn qua mục{' '}
              <a href="/help/feedback" className="text-blue-700 font-medium underline">
                Feedback
              </a>{' '}
              và chúng tôi sẽ phản hồi trong thời gian sớm nhất.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FaqPage; 