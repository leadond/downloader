import { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaSpinner, FaDownload, FaSync } from 'react-icons/fa';
import axios from 'axios';

function DownloadList({ downloads }) {
  const [fileStatus, setFileStatus] = useState({});
  const [checkingFiles, setCheckingFiles] = useState({});
  
  // Function to check if a file is ready for download
  const checkFileStatus = async (filename, index) => {
    if (!filename) return;
    
    setCheckingFiles(prev => ({ ...prev, [index]: true }));
    
    try {
      const response = await axios.get(`http://localhost:3001/api/check-file/${filename}`);
      setFileStatus(prev => ({ 
        ...prev, 
        [index]: { 
          exists: response.data.exists,
          size: response.data.size,
          checked: true
        } 
      }));
    } catch (error) {
      console.error('Error checking file status:', error);
      setFileStatus(prev => ({ 
        ...prev, 
        [index]: { exists: false, checked: true, error: error.message } 
      }));
    } finally {
      setCheckingFiles(prev => ({ ...prev, [index]: false }));
    }
  };
  
  // Check file status for completed downloads
  useEffect(() => {
    downloads.forEach((download, index) => {
      if (download.status === 'completed' && download.filename && !fileStatus[index]?.checked) {
        checkFileStatus(download.filename, index);
      }
    });
  }, [downloads]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle className="text-green-500" />;
      case 'failed':
        return <FaTimesCircle className="text-red-500" />;
      case 'pending':
      default:
        return <FaSpinner className="text-blue-500 animate-spin" />;
    }
  };

  return (
    <div className="border rounded-md divide-y">
      {downloads.map((download, index) => (
        <div key={index} className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium truncate flex-1 mr-2">{download.title}</div>
            <div className="flex items-center">
              {getStatusIcon(download.status)}
              <span className="ml-2 text-sm">
                {download.status === 'completed' ? 'Completed' : 
                 download.status === 'failed' ? 'Failed' : 'Processing...'}
              </span>
            </div>
          </div>
          
          <div className="text-sm text-gray-500 truncate mb-2">{download.url}</div>
          
          {download.status === 'pending' && (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-500 h-2.5 rounded-full" 
                style={{ width: `${download.progress}%` }}
              ></div>
            </div>
          )}
          
          {download.status === 'failed' && download.error && (
            <div className="text-sm text-red-500 mt-1">{download.error}</div>
          )}
          
          {download.status === 'completed' && download.filename && (
            <div className="mt-2">
              {fileStatus[index]?.exists ? (
                <a 
                  href={`http://localhost:3001/api/download/${download.filename}`}
                  download
                  className="btn btn-secondary text-sm inline-flex items-center"
                >
                  <FaDownload className="mr-1" /> Download MP3 
                  {fileStatus[index]?.size && (
                    <span className="ml-1 text-xs">
                      ({(fileStatus[index].size / (1024 * 1024)).toFixed(2)} MB)
                    </span>
                  )}
                </a>
              ) : (
                <div className="flex items-center">
                  <span className="text-sm text-amber-600 mr-2">
                    {checkingFiles[index] ? 'Checking file...' : 'File is still processing...'}
                  </span>
                  <button 
                    onClick={() => checkFileStatus(download.filename, index)}
                    className="btn btn-sm btn-outline inline-flex items-center"
                    disabled={checkingFiles[index]}
                  >
                    <FaSync className={`mr-1 ${checkingFiles[index] ? 'animate-spin' : ''}`} /> 
                    Check Status
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default DownloadList;
