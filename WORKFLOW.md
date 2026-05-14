# RoboDraw - Complete Workflow Implementation

## Overview
RoboDraw is a CNC-ready design automation system that converts images into machine-readable formats through an automated 6-step workflow.

## Workflow Steps

### Step 1: Upload Image
- User uploads an image (PNG, JPG, GIF, WEBP - max 2MB)
- Server receives and validates the image
- Image is stored in the `uploads/` directory

### Step 2: Generate SVG
- Image is converted to SVG using the `convert_to_svg.py` script
- SVG preserves the important outline and details from the image
- Can be triggered manually by admin or automatically via workflow automation

### Step 3: Admin Download
- Generated SVG is available for download
- Admin can review the SVG before proceeding
- SVG can be edited in design tools like Inkscape

### Step 4: Generate G-code
- SVG is converted to G-code using the `gcode_generator.py` script
- G-code is machine-readable format for CNC machines
- Includes movement commands and pen control instructions

### Step 5: Run on Robot
- G-code is sent to the CNC machine via UGS (Universal G-code Sender)
- Machine draws the design on the target material
- Progress is tracked and updated

### Step 6: Drawing Complete
- Process completes successfully
- Celebration popup appears with confetti animation
- User receives confirmation that drawing is ready

## How to Use

### Setup
1. Install dependencies:
   ```bash
   npm install
   pip install -r requirements.txt
   ```

2. Start the server:
   ```bash
   node server.js
   ```

3. Open your browser to `http://localhost:3003`

### Manual Workflow (Using Admin Interface)

1. **Upload Image**
   - Use the upload form on the homepage
   - Drag and drop or click to select an image

2. **Trigger Workflow**
   - Run the workflow automation script:
   ```bash
   python workflow_automation.py <file-id> <image-path>
   ```
   - Replace `<file-id>` with the file ID returned from upload
   - Replace `<image-path>` with path to the uploaded image

### Automated Workflow

The `workflow_automation.py` script automates the entire process:

```bash
python workflow_automation.py my-image /path/to/image.jpg --output-dir ./uploads
```

This script will:
1. Update status to step 2 (SVG Generation)
2. Convert image to SVG
3. Update status to step 3 (Ready for download)
4. Convert SVG to G-code
5. Update status to step 5 (Running on robot)
6. Simulate drawing process
7. Update status to step 6 (Complete)
8. Trigger celebration popup

## File Descriptions

### Frontend Files
- **index.html**: Main user interface with upload form and process flow display
- **script.js**: Client-side logic for upload, status polling, and celebration popup
- **style.css**: Styling including responsive design and animations
- **admin.html**: Admin interface for managing files and processing

### Backend Files
- **server.js**: Express.js server with file upload and status management
- **process_status.json**: Persistent storage for processing status

### Processing Scripts
- **convert_to_svg.py**: Converts raster images to vector SVG format
- **gcode_generator.py**: Converts SVG paths to G-code commands
- **workflow_automation.py**: Orchestrates the complete workflow

## API Endpoints

### File Upload
```
POST /upload
- Accepts multipart form data with 'image' field
- Returns: { success: true, file: { id, originalName, storedName, size, url } }
```

### Get Status
```
GET /status/:fileId
- Returns: { step, message, timestamp }
```

### Update Status (Admin Only)
```
POST /admin/update-status
- Headers: { 'x-admin-key': 'robodraw-secret' }
- Body: { fileId, step, message }
- Returns: { success: true }
```

### Get Files (Admin Only)
```
GET /admin/files
- Headers: { 'x-admin-key': 'robodraw-secret' }
- Returns: { files: [{ name, url, fileId }] }
```

## Celebration Features

When the drawing completes (Step 6):
- Automatic popup appears with celebration message
- Confetti animation falls across the screen
- Celebratory sound plays (if audio context available)
- Smooth animations and transitions
- Close button to dismiss and restart

## Customization

### Change Celebration Message
Edit `index.html` in the celebration popup section:
```html
<p class="celebration-message">Your drawing is complete!</p>
```

### Adjust Animation Speed
Modify timeout in `workflow_automation.py`:
```python
for i in range(5):
    time.sleep(2)  # Adjust this value
```

### G-code Parameters
Customize G-code generation in `gcode_generator.py`:
- `--speed`: Movement speed (default: 100)
- `--z-move`: Pen up position (default: 5)
- `--z-draw`: Pen down position (default: -2)

## Troubleshooting

### Images not uploading
- Check file size (max 2MB)
- Verify file format (PNG, JPG, GIF, WEBP)
- Check server logs

### SVG generation failing
- Ensure OpenCV is installed: `pip install opencv-python`
- Try a different image (high contrast works better)
- Check image resolution

### G-code generation issues
- Verify SVG file is valid XML
- Check SVG contains path elements
- Review G-code output for errors

### Celebration popup not showing
- Check browser console for errors
- Verify status updates to step 6
- Clear browser cache and refresh

## System Requirements
- Node.js 12+
- Python 3.7+
- 512MB RAM minimum
- 100MB disk space

## License
MIT License - Built for makers and fabricators
