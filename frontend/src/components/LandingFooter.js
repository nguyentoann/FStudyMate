import React from "react";

const LandingFooter = () => {
  return (
    <footer className="bg-[#525fe1] text-white py-8">
      <div className="max-w-[1366px] mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <h3 className="text-[22px] font-bold mb-4">
              <span className="text-white">F</span>
              <span className="text-[#ffcf59]">StudyMate</span>
            </h3>
            <p className="text-sm mb-4">
              Your Smart Learning & Mock Test Companion at FPT University
            </p>
          </div>
          <div>
            <h4 className="text-[18px] font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#why" className="text-sm hover:text-[#ffcf59]">
                  Why Choose Us
                </a>
              </li>
              <li>
                <a href="#features" className="text-sm hover:text-[#ffcf59]">
                  Features
                </a>
              </li>
              <li>
                <a href="#preview" className="text-sm hover:text-[#ffcf59]">
                  Platform Preview
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-[18px] font-semibold mb-4">Contact Us</h4>
            <p className="text-sm mb-2">📧 Email: cuutoan.nguyen@gmail.com</p>
            <p className="text-sm mb-2">📱 Phone: +84 374 230 377</p>
            <p className="text-sm">📍 FPT University Campuses</p>
          </div>
        </div>
        <div className="text-center border-t border-[#ffffff33] pt-6">
          <p className="text-sm">
            © {new Date().getFullYear()} FStudyMate. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
