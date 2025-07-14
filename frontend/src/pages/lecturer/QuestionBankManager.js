import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaPlus, FaUpload, FaDownload, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import { API_URL } from '../../services/config';

const QuestionBankManager = () => {
  const { currentUser } = useAuth();
  const [questionBanks, setQuestionBanks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedBank, setSelectedBank] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importSubject, setImportSubject] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBankName, setNewBankName] = useState('');
  const [newBankDescription, setNewBankDescription] = useState('');
  const [newBankSubject, setNewBankSubject] = useState('');

  useEffect(() => {
    fetchSubjects();
    fetchQuestionBanks();
  }, []);

  useEffect(() => {
    if (selectedBank) {
      fetchQuestions(selectedBank.id);
    }
  }, [selectedBank]);

  const fetchSubjects = async () => {
    try {
      const response = await axios.get(`${API_URL}/subjects`);
      setSubjects(response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to load subjects');
    }
  };

  const fetchQuestionBanks = async () => {
    setIsLoading(true);
    try {
      let url = `${API_URL}/question-banks`;
      if (selectedSubject) {
        url = `${API_URL}/question-banks/subject/${selectedSubject}`;
      }
      const response = await axios.get(url);
      setQuestionBanks(response.data);
    } catch (error) {
      console.error('Error fetching question banks:', error);
      toast.error('Failed to load question banks');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQuestions = async (bankId) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/question-banks/${bankId}`);
      setQuestions(response.data.questions || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Failed to load questions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubjectChange = (e) => {
    setSelectedSubject(e.target.value);
    setSelectedBank(null);
  };

  const handleBankSelect = (bank) => {
    setSelectedBank(bank);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/question-banks/search?keyword=${encodeURIComponent(searchQuery)}`);
      setQuestions(response.data);
    } catch (error) {
      console.error('Error searching questions:', error);
      toast.error('Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportFile = (e) => {
    setImportFile(e.target.files[0]);
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!importFile) {
      toast.error('Please select a file to import');
      return;
    }

    // Get user ID directly from localStorage
    const storedUser = localStorage.getItem('user');
    let userId;
    
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        userId = userData.id;
        console.log('User ID from localStorage:', userId);
      } catch (error) {
        console.error('Error parsing user data from localStorage:', error);
      }
    }
    
    // Also check sessionStorage as fallback
    if (!userId) {
      const userIdFromStorage = localStorage.getItem('userId');
      if (userIdFromStorage) {
        userId = userIdFromStorage;
        console.log('User ID from localStorage.userId:', userId);
      }
    }

    if (!userId) {
      console.error('No user ID available for import');
      toast.error('You must be logged in to import questions');
      return;
    }

    const formData = new FormData();
    formData.append('file', importFile);
    if (importSubject) {
      formData.append('subjectId', importSubject);
    }
    
    // Ensure userId is sent as a string
    formData.append('userId', String(userId));
    console.log('Added userId to form data:', userId);

    // Log the form data
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value}`);
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/question-banks/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Import response:', response.data);
      toast.success('Questions imported successfully');
      setShowImportModal(false);
      fetchQuestionBanks();
    } catch (error) {
      console.error('Error importing questions:', error);
      toast.error('Import failed: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (bankId) => {
    try {
      const response = await axios.get(`${API_URL}/question-banks/${bankId}/export`, {
        responseType: 'blob'
      });
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `question_bank_${bankId}.xml`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error exporting questions:', error);
      toast.error('Export failed');
    }
  };

  const handleCreateBank = async (e) => {
    e.preventDefault();
    if (!newBankName.trim()) {
      toast.error('Please enter a name for the question bank');
      return;
    }

    if (!currentUser || !currentUser.id) {
      toast.error('You must be logged in to create a question bank');
      return;
    }

    setIsLoading(true);
    try {
      const newBank = {
        name: newBankName,
        description: newBankDescription,
        subject: newBankSubject ? { id: newBankSubject } : null,
        createdBy: { id: currentUser.id }
      };
      
      await axios.post(`${API_URL}/question-banks`, newBank);
      toast.success('Question bank created successfully');
      setShowCreateModal(false);
      setNewBankName('');
      setNewBankDescription('');
      setNewBankSubject('');
      fetchQuestionBanks();
    } catch (error) {
      console.error('Error creating question bank:', error);
      toast.error('Failed to create question bank');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBank = async (bankId) => {
    if (!window.confirm('Are you sure you want to delete this question bank?')) {
      return;
    }

    setIsLoading(true);
    try {
      await axios.delete(`${API_URL}/question-banks/${bankId}`);
      toast.success('Question bank deleted successfully');
      if (selectedBank && selectedBank.id === bankId) {
        setSelectedBank(null);
      }
      fetchQuestionBanks();
    } catch (error) {
      console.error('Error deleting question bank:', error);
      toast.error('Failed to delete question bank');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Question Bank Manager</h1>
      
      <div className="flex flex-wrap gap-4 mb-6">
        <button 
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
          onClick={() => setShowCreateModal(true)}
        >
          <FaPlus /> Create Bank
        </button>
        
        <button 
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
          onClick={() => setShowImportModal(true)}
        >
          <FaUpload /> Import Questions
        </button>
        
        {selectedBank && (
          <button 
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded flex items-center gap-2"
            onClick={() => handleExport(selectedBank.id)}
          >
            <FaDownload /> Export Questions
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Panel - Question Banks */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-xl font-semibold mb-4">Question Banks</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Filter by Subject:</label>
            <select 
              className="w-full p-2 border rounded"
              value={selectedSubject}
              onChange={handleSubjectChange}
            >
              <option value="">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>
                  {subject.code} - {subject.name}
                </option>
              ))}
            </select>
          </div>
          
          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {questionBanks.length > 0 ? (
                <ul className="divide-y">
                  {questionBanks.map(bank => (
                    <li 
                      key={bank.id} 
                      className={`p-3 hover:bg-gray-100 cursor-pointer flex justify-between items-center ${selectedBank?.id === bank.id ? 'bg-blue-100' : ''}`}
                      onClick={() => handleBankSelect(bank)}
                    >
                      <div>
                        <div className="font-medium">{bank.name}</div>
                        <div className="text-sm text-gray-500">
                          {bank.subject ? `${bank.subject.code} - ${bank.subject.name}` : 'No Subject'}
                        </div>
                      </div>
                      <button 
                        className="text-red-500 hover:text-red-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBank(bank.id);
                        }}
                      >
                        <FaTrash />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No question banks found
                </div>
              )}
            </div>
          )}
        </div>
        
        {/* Right Panel - Questions */}
        <div className="bg-white rounded-lg shadow p-4 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">
            {selectedBank ? `Questions in ${selectedBank.name}` : 'Questions'}
          </h2>
          
          <div className="mb-4 flex gap-2">
            <input 
              type="text"
              placeholder="Search questions..."
              className="flex-1 p-2 border rounded"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
              onClick={handleSearch}
            >
              <FaSearch /> Search
            </button>
          </div>
          
          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {questions.length > 0 ? (
                <ul className="divide-y">
                  {questions.map(question => (
                    <li key={question.id} className="p-3 hover:bg-gray-100">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium">{question.name || 'Unnamed Question'}</div>
                          <div className="text-sm mt-1" dangerouslySetInnerHTML={{ __html: question.questionText }} />
                          
                          <div className="mt-2">
                            <div className="text-xs text-gray-500 mb-1">Answers:</div>
                            <ul className="pl-4">
                              {question.answers && question.answers.map((answer, index) => (
                                <li 
                                  key={answer.id} 
                                  className={`text-sm ${parseFloat(answer.fraction) > 0 ? 'text-green-600 font-medium' : 'text-gray-700'}`}
                                >
                                  {index + 1}. <span dangerouslySetInnerHTML={{ __html: answer.answerText }} />
                                  {parseFloat(answer.fraction) > 0 && ` (${answer.fraction}%)`}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                          {question.questionType}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  {selectedBank ? 'No questions found in this bank' : 'Select a question bank or search for questions'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Import Questions</h2>
            
            <form onSubmit={handleImportSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">XML File:</label>
                <input 
                  type="file" 
                  accept=".xml"
                  onChange={handleImportFile}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Subject (Optional):</label>
                <select 
                  className="w-full p-2 border rounded"
                  value={importSubject}
                  onChange={(e) => setImportSubject(e.target.value)}
                >
                  <option value="">No Subject</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.code} - {subject.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end gap-2">
                <button 
                  type="button"
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                  onClick={() => setShowImportModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                  disabled={isLoading}
                >
                  {isLoading ? 'Importing...' : 'Import'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Create Bank Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Create Question Bank</h2>
            
            <form onSubmit={handleCreateBank}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Name:</label>
                <input 
                  type="text" 
                  value={newBankName}
                  onChange={(e) => setNewBankName(e.target.value)}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Description:</label>
                <textarea 
                  value={newBankDescription}
                  onChange={(e) => setNewBankDescription(e.target.value)}
                  className="w-full p-2 border rounded"
                  rows="3"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Subject:</label>
                <select 
                  className="w-full p-2 border rounded"
                  value={newBankSubject}
                  onChange={(e) => setNewBankSubject(e.target.value)}
                >
                  <option value="">No Subject</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>
                      {subject.code} - {subject.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex justify-end gap-2">
                <button 
                  type="button"
                  className="px-4 py-2 border rounded hover:bg-gray-100"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionBankManager; 