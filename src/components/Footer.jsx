function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-4">
      <div className="container mx-auto px-4 text-center text-sm">
        <p>
          This tool is for personal use only. Please respect copyright laws and YouTube's Terms of Service.
        </p>
        <p className="mt-1 text-gray-400">
          &copy; {new Date().getFullYear()} YouTube to MP3 Bulk Downloader
        </p>
      </div>
    </footer>
  );
}

export default Footer;
