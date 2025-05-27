import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getAllMaMon, getMaDeByMaMon } from '../services/api';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const [maMonList, setMaMonList] = useState([]);
  const [maDeList, setMaDeList] = useState([]);
  const [selectedMaMon, setSelectedMaMon] = useState('');
  const [selectedMaDe, setSelectedMaDe] = useState('');
  const [random, setRandom] = useState(false);
  const [timed, setTimed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Check if we're on the quiz selection or home page
    const isQuizPath = location.pathname === '/quiz';
    const isHomePath = location.pathname === '/home';
    
    // Only redirect to dashboard if not on quiz path or home path
    if (!isQuizPath && !isHomePath && user && user.role) {
      switch (user.role) {
        case 'student':
          navigate('/student/dashboard');
          return;
        case 'lecturer':
          navigate('/lecturer/dashboard');
          return;
        case 'admin':
          navigate('/admin/dashboard');
          return;
        case 'guest':
          navigate('/guest/dashboard');
          return;
        case 'outsrc_student':
          navigate('/outsource/dashboard');
          return;
        default:
          break;
      }
    }
    
    const fetchMaMonList = async () => {
      try {
        const data = await getAllMaMon();
        setMaMonList(data);
        setLoading(false);
      } catch (error) {
        setError('Failed to load subjects.');
        setLoading(false);
      }
    };
    
    fetchMaMonList();
  }, [user, navigate, location.pathname]);
  
  useEffect(() => {
    const fetchMaDeList = async () => {
      if (selectedMaMon) {
        try {
          const data = await getMaDeByMaMon(selectedMaMon);
          setMaDeList(data);
          setSelectedMaDe('');
        } catch (error) {
          setError('Failed to load exam codes.');
        }
      } else {
        setMaDeList([]);
      }
    };
    
    fetchMaDeList();
  }, [selectedMaMon]);
  
  const handleMaMonChange = (e) => {
    setSelectedMaMon(e.target.value);
  };
  
  const handleMaDeChange = (e) => {
    setSelectedMaDe(e.target.value);
  };
  
  const handleRandomChange = (e) => {
    setRandom(e.target.checked);
  };
  
  const handleTimedChange = (e) => {
    setTimed(e.target.checked);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedMaMon && selectedMaDe) {
      navigate(`/quiz/${selectedMaMon}/${selectedMaDe}`, {
        state: { random, timed }
      });
    }
  };
  
  if (loading) {
    return (
      <div className={`min-h-screen flex justify-center items-center ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`min-h-screen py-12 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
      <div className="max-w-md mx-auto">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden`}>
          <div className="bg-gradient-to-r from-indigo-600 to-blue-500 px-6 py-4 text-white">
            <h1 className="text-2xl font-bold">Multiple Choice Quiz</h1>
          </div>
          
          {error && (
            <div className={`m-6 ${darkMode ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-700'} p-4 rounded-lg`}>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-4">
              <label className="block mb-2 font-medium" htmlFor="maMon">
                Chọn môn học:
              </label>
              <select
                id="maMon"
                value={selectedMaMon}
                onChange={handleMaMonChange}
                className={`w-full px-3 py-2 border rounded-lg ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-indigo-500' 
                    : 'bg-white border-gray-300 focus:border-indigo-500'
                } focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                required
              >
                <option value="">-- Chọn môn học --</option>
                {maMonList.map((maMon) => (
                  <option key={maMon} value={maMon}>
                    {maMon}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block mb-2 font-medium" htmlFor="maDe">
                Chọn mã đề:
              </label>
              <select
                id="maDe"
                value={selectedMaDe}
                onChange={handleMaDeChange}
                disabled={!selectedMaMon}
                className={`w-full px-3 py-2 border rounded-lg ${
                  darkMode 
                    ? 'bg-gray-700 border-gray-600 text-white focus:border-indigo-500 disabled:bg-gray-800 disabled:text-gray-500' 
                    : 'bg-white border-gray-300 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-400'
                } focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                required
              >
                <option value="">-- Chọn mã đề --</option>
                {maDeList.map((maDe) => (
                  <option key={maDe} value={maDe}>
                    {maDe}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4 space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="random"
                  checked={random}
                  onChange={handleRandomChange}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="random" className="ml-2">
                  Trộn câu hỏi
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="timed"
                  checked={timed}
                  onChange={handleTimedChange}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="timed" className="ml-2">
                  Tính thời gian (30 phút)
                </label>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={!selectedMaMon || !selectedMaDe}
              className={`w-full py-2 px-4 rounded transition-colors ${
                !selectedMaMon || !selectedMaDe
                  ? (darkMode ? 'bg-gray-700 text-gray-400 cursor-not-allowed' : 'bg-gray-300 text-gray-500 cursor-not-allowed')
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              Bắt đầu
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Home; 