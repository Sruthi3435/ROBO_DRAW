const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


const app = express();
const PORT = process.env.PORT || 3003;

const STATUS_FILE = path.join(__dirname, 'process_status.json');

// Initialize status file if it doesn't exist
if (!fs.existsSync(STATUS_FILE)) {
  fs.writeFileSync(STATUS_FILE, JSON.stringify({}, null, 2));
}

let isProcessing = false;
let currentProcessingFile = null;


function getStatus(fileId) {
  try {
    const data = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf8'));
    return data[fileId] || { step: 1, message: 'Image uploaded successfully' };
  } catch (error) {
    return { step: 1, message: 'Image uploaded successfully' };
  }
}

function updateStatus(fileId, step, message) {
  try {
    const data = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf8'));
    data[fileId] = { step, message, timestamp: new Date().toISOString() };
    fs.writeFileSync(STATUS_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error updating status:', error);
  }
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
    filename: (req, file, cb) => {
      const timestamp = Date.now();
      const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
      cb(null, `${timestamp}-${safeName}`);
    }
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /png|jpe?g|gif|webp/;
    const valid = allowed.test(file.mimetype);
    cb(valid ? null : new Error('Only image files are allowed'), valid);
  }
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

function adminAuth(req, res, next) {
  const secret = req.headers['x-admin-key'];
  if (secret === 'robodraw-secret') {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
}

app.post('/upload', upload.single('image'), (req, res) => {
  if (isProcessing) {
    return res.status(400).json({ error: 'System is busy processing another image. Please wait.' });
  }
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded or invalid file type' });
  }

  const fileId = path.parse(req.file.filename).name;
  updateStatus(fileId, 2, 'Generating SVG from image');
isProcessing = true;
currentProcessingFile = req.file.filename;

  res.json({
    success: true,
    message: 'Image uploaded successfully.',
    file: {
      id: fileId,
      originalName: req.file.originalname,
      storedName: req.file.filename,
      size: req.file.size,
      url: `/uploads/${req.file.filename}`,
    
    }
  });


});

app.get('/admin/files', adminAuth, (req, res) => {
  if (currentProcessingFile) {
    const fileId = path.parse(currentProcessingFile).name;
    res.json({ files: [{ name: currentProcessingFile, url: `/uploads/${encodeURIComponent(currentProcessingFile)}`, fileId }] });
  } else {
    res.json({ files: [] });
  }
});

app.get('/status/:fileId', (req, res) => {
  const fileId = req.params.fileId;
  const status = getStatus(fileId);
  res.json(status);
});

app.get('/status/global', (req, res) => {
  res.json({ isProcessing });
});

app.get('/status/current', (req, res) => {
  if (isProcessing && currentProcessingFile) {
    const fileId = path.parse(currentProcessingFile).name;
    res.json({ fileId });
  } else {
    res.json({ fileId: null });
  }
});

app.post('/admin/update-status', adminAuth, express.json(), (req, res) => {
  const { fileId, step, message } = req.body;
  if (!fileId || !step || !message) {
    return res.status(400).json({ error: 'Missing required fields: fileId, step, message' });
  }
  updateStatus(fileId, step, message);
  if (step === 6) {
    isProcessing = false;
    currentProcessingFile = null;
  }
  res.json({ success: true, message: 'Status updated successfully' });
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Test endpoint to simulate workflow progression (for testing celebration popup)
app.post('/admin/test-workflow/:fileId', adminAuth, (req, res) => {
  const fileId = req.params.fileId;
  
  // Simulate workflow progression
  const steps = [
    { step: 1, message: 'Image uploaded successfully' },
    { step: 2, message: 'Generating SVG from image' },
    { step: 3, message: 'SVG generated successfully, ready for download' },
    { step: 4, message: 'Generating G-code from SVG' },
    { step: 5, message: 'Drawing in progress on robot machine' },
    { step: 6, message: 'Drawing process completed successfully! 🎉' }
  ];
  
  let currentStep = 0;
  const interval = setInterval(() => {
    if (currentStep < steps.length) {
      const step = steps[currentStep];
      updateStatus(fileId, step.step, step.message);
      console.log(`[Test Workflow] Updated to step ${step.step}: ${step.message}`);
      currentStep++;
    } else {
      clearInterval(interval);
      isProcessing = false;
      currentProcessingFile = null;
    }
  }, 2000); // 2 second interval between steps
  
  res.json({ 
    success: true, 
    message: 'Test workflow started. Workflow will progress through all steps.' 
  });
});

// Download files endpoint
app.get('/admin/download/:fileName', adminAuth, (req, res) => {
  const fileName = req.params.fileName;
  const filePath = path.join(__dirname, 'uploads', fileName);
  
  // Security: prevent directory traversal
  if (!path.resolve(filePath).startsWith(path.resolve(path.join(__dirname, 'uploads')))) {
    return res.status(400).json({ error: 'Invalid file path' });
  }
  
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

app.listen(PORT, () => {
  console.log(`RoboDraw server running at http://localhost:${PORT}`);
  console.log(`Test workflow endpoint: POST /admin/test-workflow/:fileId`);
});
