import { useState } from 'react';
import { FaPlus } from 'react-icons/fa';

function UrlInput({ onAdd, disabled }) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) {
      onAdd(url.trim());
      setUrl('');
    }
  };

  const handlePaste = async (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    setUrl(pastedText);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        className="input flex-grow"
        placeholder="Paste YouTube URL here (e.g., https://www.youtube.com/watch?v=...)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onPaste={handlePaste}
        disabled={disabled}
      />
      <button
        type="submit"
        className="btn btn-primary"
        disabled={!url.trim() || disabled}
      >
        <FaPlus className="mr-1" /> Add
      </button>
    </form>
  );
}

export default UrlInput;
