import { useState, useEffect } from 'react';
import { FaYoutube, FaMusic, FaTrash, FaPlus, FaDownload } from 'react-icons/fa';
import axios from 'axios';
import UrlInput from './components/UrlInput';
import DownloadList from './components/DownloadList';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  const [urls, setUrls] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [serverStatus, setServerStatus] = useState('checking');

  // Set the base URL for API requests
  const API_BASE_URL = 'http://localhost:3001';
  
  useEffect(() => {
    // Configure axios to use the base URL
    axios.defaults.baseURL = API_BASE_URL;
    
    // Check if the server is running
    const checkServer = async () => {
      try {
        await axios.get(`${API_BASE_URL}/api/test`);
        setServerStatus('connected');
      } catch (err) {
        console.error('Server connection error:', err);
        setServerStatus('disconnected');
      }
    };
    
    checkServer();
  }, []);

  const addUrl = (url) => {
    if (!url) return;
    if (urls.includes(url)) {
      setError('This URL is already in the list');
      return;
    }
    
    // Basic YouTube URL validation
    if (!url.match(/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/)) {
      setError('Please enter a valid YouTube URL');
      return;
    }
    
    setUrls([...urls, url]);
    setError('');
  };

  const removeUrl = (index) => {
    const newUrls = [...urls];
    newUrls.splice(index, 1);
    setUrls(newUrls);
  };

  const clearUrls = () => {
    setUrls([]);
  };

  const processDownloads = async () => {
    if (urls.length === 0) {
      setError('Please add at least one YouTube URL');
      return;
    }
    
    if (serverStatus !== 'connected') {
      setError('Cannot connect to the server. Please make sure the server is running.');
      return;
    }
    
    setIsProcessing(true);
    setError('');
    
    try {
      // Initialize downloads with pending status
      const initialDownloads = urls.map(url => ({
        url,
        title: 'Fetching info...',
        status: 'pending',
        progress: 0,
      }));
      
      setDownloads(initialDownloads);
      
      // Process each URL
      for (let i = 0; i < urls.length; i++) {
        try {
          console.log(`Sending request for URL: ${urls[i]}`);
          const response = await axios.post(`${API_BASE_URL}/api/download`, { url: urls[i] });
          console.log('Response:', response.data);
          
          setDownloads(prev => {
            const updated = [...prev];
            updated[i] = {
              ...updated[i],
              title: response.data.title,
              status: 'completed',
              progress: 100,
              filename: response.data.filename,
            };
            return updated;
          });
        } catch (err) {
          console.error('Download error:', err);
          setDownloads(prev => {
            const updated = [...prev];
            updated[i] = {
              ...updated[i],
              status: 'failed',
              error: err.response?.data?.error || 'Download failed',
            };
            return updated;
          });
        }
      }
    } catch (err) {
      console.error('Process error:', err);
      setError('An error occurred while processing downloads');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {serverStatus === 'disconnected' && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p className="font-bold">Server Connection Error</p>
            <p>Cannot connect to the backend server. Please make sure the server is running at {API_BASE_URL}</p>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <FaYoutube className="text-primary mr-2" />
            Add YouTube URLs
          </h2>
          
          <UrlInput 
            onAdd={addUrl} 
            disabled={isProcessing || serverStatus !== 'connected'}
          />
          
          {error && (
            <div className="mt-2 text-red-500 text-sm">{error}</div>
          )}
          
          <div className="mt-4">
            <h3 className="font-semibold mb-2">URLs to download ({urls.length})</h3>
            {urls.length > 0 ? (
              <div className="border rounded-md divide-y">
                {urls.map((url, index) => (
                  <div key={index} className="p-3 flex justify-between items-center">
                    <div className="truncate flex-1 text-sm">{url}</div>
                    <button 
                      onClick={() => removeUrl(index)}
                      className="ml-2 text-gray-500 hover:text-red-500"
                      disabled={isProcessing}
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-center py-4 border rounded-md">
                No URLs added yet
              </div>
            )}
          </div>
          
          <div className="mt-4 flex gap-2">
            <button 
              onClick={clearUrls}
              className="btn btn-secondary flex items-center"
              disabled={isProcessing || urls.length === 0}
            >
              <FaTrash className="mr-1" /> Clear All
            </button>
            
            <button 
              onClick={processDownloads}
              className="btn btn-primary flex items-center ml-auto"
              disabled={isProcessing || urls.length === 0 || serverStatus !== 'connected'}
            >
              {isProcessing ? (
                <>Processing...</>
              ) : (
                <>
                  <FaDownload className="mr-1" /> Download All as MP3
                </>
              )}
            </button>
          </div>
        </div>
        
        {downloads.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-4 flex items-center">
              <FaMusic className="text-accent mr-2" />
              Downloads
            </h2>
            
            <DownloadList downloads={downloads} />
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}

export default App;
