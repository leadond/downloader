import { exec } from 'child_process';
import { createServer } from 'http';
import { createReadStream } from 'fs';
import { join } from 'path';

// Start the backend server
const serverProcess = exec('node server.js', (error, stdout, stderr) => {
  if (error) {
    console.error(`Backend server error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Backend stderr: ${stderr}`);
    return;
  }
  console.log(`Backend stdout: ${stdout}`);
});

console.log('Backend server started on http://localhost:3001');

// Start the frontend dev server
const frontendProcess = exec('pnpm run dev', (error, stdout, stderr) => {
  if (error) {
    console.error(`Frontend server error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Frontend stderr: ${stderr}`);
    return;
  }
  console.log(`Frontend stdout: ${stdout}`);
});

console.log('Frontend dev server starting...');

// Create a simple status server
const statusServer = createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>YouTube to MP3 App Status</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .status { padding: 15px; border-radius: 5px; margin-bottom: 15px; }
            .running { background-color: #d4edda; color: #155724; }
            .info { background-color: #d1ecf1; color: #0c5460; }
            pre { background: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; }
          </style>
        </head>
        <body>
          <h1>YouTube to MP3 App Status</h1>
          
          <div class="status running">
            <h2>✅ Servers Running</h2>
            <p><strong>Backend:</strong> http://localhost:3001</p>
            <p><strong>Frontend:</strong> Check the terminal for the Vite URL (typically http://localhost:5173)</p>
          </div>
          
          <div class="status info">
            <h2>ℹ️ Usage Instructions</h2>
            <ol>
              <li>Open the frontend URL in your browser</li>
              <li>Paste YouTube URLs into the input field</li>
              <li>Click "Add" to add each URL to the list</li>
              <li>Click "Download All as MP3" to process the downloads</li>
              <li>Once processing is complete, click the "Download MP3" button for each item</li>
            </ol>
          </div>
          
          <h2>Troubleshooting</h2>
          <p>If you encounter issues:</p>
          <ul>
            <li>Make sure both servers are running</li>
            <li>Check the console for error messages</li>
            <li>Verify that the YouTube URLs are valid</li>
          </ul>
          
          <p><small>To stop the servers, press Ctrl+C in the terminal.</small></p>
        </body>
      </html>
    `);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

statusServer.listen(3002, () => {
  console.log('Status page available at http://localhost:3002');
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down servers...');
  serverProcess.kill();
  frontendProcess.kill();
  statusServer.close();
  process.exit();
});
