# 🎨 RoboDraw - Quick Start Guide

## 🚀 Getting Started

### 1. Install Dependencies
```bash
# Install Node.js packages
npm install

# Install Python packages (requires Python 3.7+)
pip install -r requirements.txt
```

### 2. Start the Server
```bash
node server.js
```
The server will start at `http://localhost:3003`

### 3. Test the Celebration Popup

#### Option A: Using the Test Script (Recommended)
Open TWO terminal windows:

**Terminal 1** - Keep the server running:
```bash
node server.js
```

**Terminal 2** - Run the test script:
```bash
node test-celebration.js
```

Then open `http://localhost:3003` in your browser and watch the celebration popup!

#### Option B: Using cURL
```bash
# Generate a test file ID
FILE_ID="test-$(date +%s)"

# Start the workflow progression
curl -X POST http://localhost:3003/admin/test-workflow/$FILE_ID \
  -H "x-admin-key: robodraw-secret"
```

#### Option C: Manual Upload and Workflow
1. Open `http://localhost:3003`
2. Upload an image from the interface
3. Get the file ID from the response
4. Run the workflow automation:
```bash
python workflow_automation.py <file-id> /path/to/uploaded/image.jpg
```

## 📊 Workflow Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    RoboDraw Workflow                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Step 1: 📤 Upload Image                                     │
│    → User uploads image via web form                        │
│    → Server validates and stores image                      │
│                ↓                                             │
│  Step 2: 🎨 Generate SVG                                    │
│    → convert_to_svg.py processes image                      │
│    → Outputs clean vector paths                            │
│                ↓                                             │
│  Step 3: ⬇️  Admin Download                                 │
│    → SVG available for review/download                      │
│    → Optional: Manual editing in Inkscape                   │
│                ↓                                             │
│  Step 4: ⚙️  Generate G-code                                │
│    → gcode_generator.py converts SVG to G-code              │
│    → Machine-readable format ready                         │
│                ↓                                             │
│  Step 5: 🤖 Run on Robot                                    │
│    → G-code sent to CNC machine via UGS                     │
│    → Machine draws the design                              │
│                ↓                                             │
│  Step 6: 🎉 Drawing Complete                               │
│    → Celebration popup with confetti                        │
│    → User notified and can check results                   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 🎉 Celebration Features

When the workflow reaches step 6:
- ✨ **Animated popup** appears with celebration message
- 🎊 **Confetti animation** falls across the screen
- 🔊 **Celebratory sound** plays (browser audio context)
- 📱 **Responsive design** works on all devices
- ✅ **Close button** to dismiss and start over

## 📝 API Usage Examples

### Upload an Image
```bash
curl -X POST -F "image=@image.jpg" http://localhost:3003/upload
```

### Check Processing Status
```bash
curl http://localhost:3003/status/{fileId}
```

### Update Status (Admin)
```bash
curl -X POST http://localhost:3003/admin/update-status \
  -H "x-admin-key: robodraw-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "fileId": "timestamp-filename",
    "step": 6,
    "message": "Drawing process completed successfully"
  }'
```

### Test Workflow Progression (Admin)
```bash
curl -X POST http://localhost:3003/admin/test-workflow/{fileId} \
  -H "x-admin-key: robodraw-secret"
```

## 🎯 What Was Implemented

### ✅ Frontend Enhancements
- [x] Added celebration popup modal
- [x] Confetti animation effect
- [x] Celebratory sound (optional)
- [x] Smooth transitions and animations
- [x] Close button functionality
- [x] Automatic popup trigger on step 6

### ✅ Backend Enhancements
- [x] Added `/admin/test-workflow/:fileId` endpoint for testing
- [x] Added `/admin/download/:fileName` endpoint
- [x] Enhanced status update handling
- [x] Test endpoint for simulation

### ✅ Processing Scripts
- [x] Created `gcode_generator.py` - SVG to G-code conversion
- [x] Created `workflow_automation.py` - Complete workflow orchestration
- [x] Support for customizable G-code parameters

### ✅ Testing & Documentation
- [x] Created `test-celebration.js` - Easy popup testing
- [x] Created `WORKFLOW.md` - Comprehensive workflow documentation
- [x] Created this `QUICKSTART.md` guide

## 🔧 Customization

### Change Celebration Message
Edit `public/index.html`:
```html
<p class="celebration-message">Your drawing is complete!</p>
```

### Adjust Animation Speed
Edit `public/style.css`:
```css
@keyframes slideUp {
  0% { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}
/* Change the timing: 0.6s */
```

### Change Confetti Colors
Edit `public/script.js`:
```javascript
const colors = ['#795dff', '#00d1ff', '#81f299', '#ff9a7b', '#6ee7b7', '#ffb347'];
```

## 📋 File Structure

```
project/
├── server.js                    # Express server
├── convert_to_svg.py           # Image to SVG conversion
├── gcode_generator.py          # SVG to G-code conversion
├── workflow_automation.py       # Workflow orchestration
├── test-celebration.js         # Popup testing script
├── package.json                # Node dependencies
├── requirements.txt            # Python dependencies
├── process_status.json         # Processing status storage
│
├── public/
│   ├── index.html              # Main UI
│   ├── admin.html              # Admin interface
│   ├── script.js               # Frontend logic + celebration popup
│   ├── style.css               # Styles + popup animations
│
├── uploads/                    # Uploaded files & outputs
│
├── WORKFLOW.md                 # Complete workflow documentation
└── QUICKSTART.md              # This file
```

## 🐛 Troubleshooting

### Server won't start
- Check if port 3003 is in use
- Try: `node server.js` to see error messages

### Popup not showing
- Check browser console (F12) for errors
- Make sure server is running
- Try the test script: `node test-celebration.js`

### Confetti not displaying
- Check if CSS is loading (check Sources tab in DevTools)
- Refresh browser cache: Ctrl+Shift+R

### G-code generation failing
- Verify SVG file is valid
- Check Python path: `which python3`
- Test conversion: `python gcode_generator.py input.svg output.gcode`

## 📞 Support

For issues or questions:
1. Check `WORKFLOW.md` for detailed documentation
2. Review browser console errors (F12)
3. Check server logs
4. Run test script: `node test-celebration.js`

## 🎓 Next Steps

1. **Test the popup** using `node test-celebration.js`
2. **Upload real images** through the web interface
3. **Integrate CNC machine** via UGS (Universal G-code Sender)
4. **Customize colors and messages** to match your branding
5. **Deploy to production** (update CORS settings as needed)

---

**Built with ❤️ for makers and fabricators**

RoboDraw - Turn Images into CNC Drawings
