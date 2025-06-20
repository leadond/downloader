import { FaYoutube, FaMusic } from 'react-icons/fa';

function Header() {
  return (
    <header className="bg-secondary text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex items-center mr-2">
              <FaYoutube className="text-primary text-3xl mr-1" />
              <FaMusic className="text-white text-xl" />
            </div>
            <h1 className="text-xl font-bold">YouTube to MP3 Bulk Downloader</h1>
          </div>
          
          <div className="text-sm">
            <span className="opacity-75">Convert videos to audio files</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
