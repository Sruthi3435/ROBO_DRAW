const dropArea = document.getElementById('dropArea');
const browseButton = document.getElementById('browseButton');
const fileInput = document.getElementById('fileInput');
const uploadMessage = document.getElementById('uploadMessage');
const previewFrame = document.getElementById('previewFrame');
const uploadForm = document.getElementById('uploadForm');
const sampleGrid = document.getElementById('sampleGrid');
const busyMessage = document.getElementById('busyMessage');

const sampleImages = [
  {
    id: 'sample-dog',
    type: 'image',
    title: 'Dog Sample',
    description: 'A sample dog image.',
    src: '/uploads/dog_test.jpeg'
  },
  {
    id: 'sample-ganesh',
    type: 'image',
    title: 'Ganesh Sample',
    description: 'A sample Ganesh image.',
    src: '/uploads/ganesh.jpg'
  },
  {
    id: 'sample-square',
    type: 'image',
    title: 'Square Sample',
    description: 'A square-shaped sample image.',
    src: '/uploads/1777892021647-square.jpg'
  },
  {
    id: 'sample-portrait1',
    type: 'image',
    title: 'Portrait Sample 1',
    description: 'A portrait-style sample image.',
    src: '/uploads/girl.jpg'
  },
  {
    id: 'sample-portrait2',
    type: 'image',
    title: 'Portrait Sample 2',
    description: 'Another portrait sample image.',
    src: '/uploads/Girl2.jpeg'
  },
  {
    id: 'sample-muggu',
    type: 'image',
    title: 'Muggu Sample',
    description: 'A sample image of Muggu.',
    src: '/uploads/muggu.jpg'
  }
];
 
let currentFileId = null;
let statusInterval = null;
let globalStatusInterval = null;

const processSteps = [
  { step: 1, title: 'Upload Image', description: 'Image uploaded successfully.' },
  { step: 2, title: 'Generate SVG', description: 'Converting your image into vector format.' },
  { step: 3, title: 'SVG Ready', description: 'Your SVG is ready for download and review.' },
  { step: 4, title: 'Generate G-code', description: 'Generating G-code using JSCUT' },
  { step: 5, title: 'Run on Robot', description: 'Running G-code on robot machine using UGS' },
  { step: 6, title: 'Drawing Complete', description: 'Drawing process completed successfully' }
];

function showMessage(message, isError = false) {
  uploadMessage.textContent = message;
  uploadMessage.style.color = isError ? '#c2410c' : '#0f172a';
}

function renderProcessFlow(fileId) {
  currentFileId = fileId;
  const container = document.createElement('div');
  container.className = 'process-flow';
  container.innerHTML = `
    <h3>Processing Status</h3>
    <div class="process-steps">
      ${processSteps.map(step => `
        <div class="process-step" data-step="${step.step}">
          <div class="step-number">${step.step}</div>
          <div class="step-content">
            <div class="step-title">${step.title}</div>
            <div class="step-description">${step.description}</div>
          </div>
          <div class="step-status">
            <div class="status-indicator pending"></div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
  uploadMessage.innerHTML = '';
  uploadMessage.appendChild(container);
  startStatusPolling();
}

function createPngFileFromSvg(svgMarkup, name) {
  return new Promise((resolve, reject) => {
    const svgBlob = new Blob([svgMarkup], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 1024;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url);
        if (blob) {
          resolve(new File([blob], `${name}.png`, { type: 'image/png' }));
        } else {
          reject(new Error('Failed to export sample image.'));
        }
      }, 'image/png');
    };

    image.onerror = (error) => {
      URL.revokeObjectURL(url);
      reject(error);
    };

    image.src = url;
  });
}

function getExtensionFromType(mimeType) {
  const map = {
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg'
  };
  return map[mimeType] || '.jpg';
}

function createFileFromImageUrl(url, name) {
  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Unable to load sample image.');
      }
      return response.blob();
    })
    .then((blob) => {
      const extension = getExtensionFromType(blob.type);
      return new File([blob], `${name}${extension}`, { type: blob.type || 'image/jpeg' });
    });
}

function setActiveSample(selectedId) {
  const cards = document.querySelectorAll('.sample-card');
  cards.forEach((card) => {
    card.classList.toggle('selected', card.dataset.id === selectedId);
  });
}

function renderSampleGallery() {
  if (!sampleGrid) return;
  sampleGrid.innerHTML = sampleImages.map((sample) => `
    <button class="sample-card" type="button" data-id="${sample.id}">
      <img src="${sample.type === 'svg' ? `data:image/svg+xml;base64,${btoa(sample.svg)}` : sample.src}" alt="${sample.title}" />
      <h4>${sample.title}</h4>
      <p>${sample.description}</p>
    </button>
  `).join('');

  sampleGrid.querySelectorAll('.sample-card').forEach((card) => {
    card.addEventListener('click', async () => {
      const selectedSample = sampleImages.find((sample) => sample.id === card.dataset.id);
      if (!selectedSample) return;

      setActiveSample(selectedSample.id);
      try {
        const file = selectedSample.type === 'svg'
          ? await createPngFileFromSvg(selectedSample.svg, selectedSample.id)
          : await createFileFromImageUrl(selectedSample.src, selectedSample.id);
        renderPreview(file);
        uploadFile(file);
        document.getElementById('upload').scrollIntoView({ behavior: 'smooth' });
      } catch (error) {
        showMessage('Unable to load sample image. Please try another sample.', true);
      }
    });
  });
}

renderSampleGallery();

fetch('/status/current')
  .then(res => res.json())
  .then(data => {
    if (data.fileId) {
      renderProcessFlow(data.fileId);
    }
  })
  .catch(error => console.error('Error fetching current status:', error));

function pollGlobalStatus() {
  fetch('/status/global')
    .then(res => res.json())
    .then(data => {
      if (data.isProcessing) {
        busyMessage.style.display = 'block';
        busyMessage.textContent = 'RoboDraw is processing and drawing an image right now. Please wait.';
        uploadForm.style.pointerEvents = 'none';
        uploadForm.style.opacity = '0.5';
      } else {
        busyMessage.style.display = 'none';
        uploadForm.style.pointerEvents = '';
        uploadForm.style.opacity = '';
      }
    })
    .catch(error => console.error('Error polling global status:', error));
}

pollGlobalStatus();
globalStatusInterval = setInterval(pollGlobalStatus, 2000);

function updateProcessFlow(currentStep, message) {
  const steps = document.querySelectorAll('.process-step');
  steps.forEach((stepEl, index) => {
    const stepNum = index + 1;
    const indicator = stepEl.querySelector('.status-indicator');
    const description = stepEl.querySelector('.step-description');

    if (stepNum < currentStep) {
      indicator.className = 'status-indicator completed';
      description.textContent = processSteps[index].description;
    } else if (stepNum === currentStep) {
      indicator.className = 'status-indicator active';
      description.textContent = message;
    } else {
      indicator.className = 'status-indicator pending';
      description.textContent = processSteps[index].description;
    }
  });
}

function startStatusPolling() {
  if (statusInterval) clearInterval(statusInterval);
  statusInterval = setInterval(() => {
    if (!currentFileId) return;
    fetch(`/status/${currentFileId}`)
      .then(res => res.json())
      .then(status => {
        updateProcessFlow(status.step, status.message);
        if (status.step >= 6) {
          clearInterval(statusInterval);
          showCelebrationPopup();
        }
      })
      .catch(error => console.error('Error polling status:', error));
  }, 2000); // Poll every 2 seconds
}

function renderPreview(file) {
  previewFrame.innerHTML = '';
  const image = document.createElement('img');
  image.src = URL.createObjectURL(file);
  image.onload = () => URL.revokeObjectURL(image.src);
  previewFrame.appendChild(image);
}

function resetPreview() {
  previewFrame.innerHTML = '<p>No image selected yet.</p>';
  if (statusInterval) {
    clearInterval(statusInterval);
    statusInterval = null;
  }
  currentFileId = null;
  uploadMessage.innerHTML = '';
}

function validateFile(file) {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    showMessage('Only image files are allowed.', true);
    return false;
  }

  if (file.size > 2 * 1024 * 1024) {
    showMessage('The file exceeds the 2MB size limit.', true);
    return false;
  }

  return true;
}

function uploadFile(file) {
  const formData = new FormData();
  formData.append('image', file);

  fetch('/upload', {
    method: 'POST',
    body: formData
  })
    .then(async (response) => {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }
      renderProcessFlow(data.file.id);
    })
    .catch((error) => {
      showMessage(error.message, true);
    });
}

function handleFiles(files) {
  const file = files[0];
  if (!file) return;

  if (!validateFile(file)) {
    resetPreview();
    return;
  }

  renderPreview(file);
  uploadFile(file);
}

browseButton.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => handleFiles(fileInput.files));

['dragenter', 'dragover'].forEach(eventName => {
  dropArea.addEventListener(eventName, (event) => {
    event.preventDefault();
    event.stopPropagation();
    dropArea.classList.add('dragover');
  });
});

['dragleave', 'drop'].forEach(eventName => {
  dropArea.addEventListener(eventName, (event) => {
    event.preventDefault();
    event.stopPropagation();
    dropArea.classList.remove('dragover');
  });
});

dropArea.addEventListener('drop', (event) => {
  const files = event.dataTransfer.files;
  handleFiles(files);
});

uploadForm.addEventListener('submit', (event) => {
  event.preventDefault();
});

// Celebration Popup Functions
function createConfetti() {
  const container = document.getElementById('confettiContainer');
  const colors = ['#795dff', '#00d1ff', '#81f299', '#ff9a7b', '#6ee7b7', '#ffb347'];
  
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.setProperty('--tx', (Math.random() - 0.5) * 300 + 'px');
    confetti.style.setProperty('--ty', Math.random() * 400 + 100 + 'px');
    confetti.style.animationDelay = Math.random() * 0.5 + 's';
    container.appendChild(confetti);
  }
}

function showCelebrationPopup() {
  const popup = document.getElementById('celebrationPopup');
  popup.classList.add('show');
  createConfetti();
  
  // Play celebration sound (optional)
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    // Play a celebratory tone
    osc.frequency.setValueAtTime(523.25, now); // C5
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    
    osc.start(now);
    osc.stop(now + 0.3);
  } catch (e) {
    console.log('Audio context not available');
  }
}

function hideCelebrationPopup() {
  const popup = document.getElementById('celebrationPopup');
  popup.classList.remove('show');
  const container = document.getElementById('confettiContainer');
  container.innerHTML = '';
}

// Close button functionality
document.getElementById('closePopupBtn').addEventListener('click', () => {
  hideCelebrationPopup();
  resetPreview();
});
