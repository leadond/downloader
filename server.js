import express from 'express';
import cors from 'cors';
import ytdl from 'ytdl-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Create downloads directory if it doesn't exist
const downloadsDir = path.join(__dirname, 'downloads');
if (!fs.existsSync(downloadsDir)) {
  fs.mkdirSync(downloadsDir, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use('/api/download', express.static(downloadsDir));

// Add a simple test endpoint
app.get('/api/test', (req, res) => {
  res.json({ status: 'Server is running correctly' });
});

app.post('/api/download', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    console.log(`Processing download request for URL: ${url}`);
    
    // Validate YouTube URL
    if (!ytdl.validateURL(url)) {
      console.log(`Invalid YouTube URL: ${url}`);
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }
    
    try {
      // Get video info
      console.log('Fetching video info...');
      const info = await ytdl.getInfo(url);
      const videoTitle = info.videoDetails.title;
      const sanitizedTitle = videoTitle.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_');
      
      console.log(`Video title: ${videoTitle}`);
      
      // Create a unique filename
      const timestamp = Date.now();
      const filename = `${sanitizedTitle}_${timestamp}.mp3`;
      const outputPath = path.join(downloadsDir, filename);
      
      console.log(`Output path: ${outputPath}`);
      
      // Create a write stream
      const writeStream = fs.createWriteStream(outputPath);
      
      // Set up event handlers for the write stream
      writeStream.on('finish', () => {
        console.log(`Download completed: ${filename}`);
      });
      
      writeStream.on('error', (err) => {
        console.error(`Write stream error: ${err.message}`);
      });
      
      // Download audio only with more specific format options
      console.log('Starting download...');
      const audioStream = ytdl(url, {
        filter: 'audioonly',
        quality: 'highestaudio',
        requestOptions: {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          }
        }
      });
      
      // Set up event handlers for the audio stream
      audioStream.on('error', (err) => {
        console.error(`ytdl stream error: ${err.message}`);
      });
      
      audioStream.on('info', (info, format) => {
        console.log(`Format selected: ${format.audioBitrate}kbps`);
      });
      
      audioStream.on('progress', (chunkLength, downloaded, total) => {
        const percent = downloaded / total * 100;
        console.log(`Download progress: ${percent.toFixed(2)}%`);
      });
      
      // Pipe the audio stream to the file
      audioStream.pipe(writeStream);
      
      // Respond immediately with the filename
      res.json({
        title: videoTitle,
        filename: filename,
      });
      
    } catch (infoError) {
      console.error('Error getting video info:', infoError);
      return res.status(500).json({ 
        error: `Failed to get video info: ${infoError.message}` 
      });
    }
    
  } catch (error) {
    console.error('General error:', error);
    res.status(500).json({ 
      error: error.message || 'An error occurred during download' 
    });
  }
});

// Add a route to check if a file exists and is ready for download
app.get('/api/check-file/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(downloadsDir, filename);
  
  if (fs.existsSync(filePath)) {
    // Get file stats to check size
    const stats = fs.statSync(filePath);
    if (stats.size > 0) {
      res.json({ exists: true, size: stats.size });
    } else {
      res.json({ exists: true, size: 0, message: 'File exists but is empty' });
    }
  } else {
    res.json({ exists: false });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Downloads directory: ${downloadsDir}`);
});
