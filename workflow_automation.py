#!/usr/bin/env python3
"""
RoboDraw Workflow Automation Script
Demonstrates the complete workflow: Upload -> SVG -> G-code -> Complete
"""

import argparse
import time
import pathlib as Path
import requests
import json



def update_status(file_id, step, message, base_url='http://localhost:3003'):
    """Update the processing status on the server."""
    url = f'{base_url}/admin/update-status'
    headers = {'x-admin-key': 'robodraw-secret'}
    payload = {
        'fileId': file_id,
        'step': step,
        'message': message
    }
    
    try:
        response = requests.post(url, json=payload, headers=headers)
        if response.status_code == 200:
            print(f"✓ Status updated to step {step}")
            return True
        else:
            print(f"✗ Failed to update status: {response.text}")
            return False
    except Exception as e:
        print(f"✗ Error updating status: {e}")
        return False


def process_image(file_id, input_image, output_dir, base_url='http://localhost:3003'):
    """Process image through the complete workflow."""
    
    # Step 1: Image uploaded
    print(f"\n📤 Step 1: Image uploaded ({input_image})")
    update_status(file_id, 1, 'Image uploaded successfully', base_url)
    time.sleep(1)
    
    # Step 2: Generate SVG
    print(f"\n🎨 Step 2: Generating SVG...")
    update_status(file_id, 2, 'Generating SVG from image using Inkscape', base_url)
    
    
    
    # Step 3: Admin download
    print(f"\n⬇️  Step 3: Admin can download SVG")
    update_status(file_id, 3, f'SVG ready for download at /uploads/{file_id}.svg', base_url)
    time.sleep(1)
    
    # Step 4: Generate G-code
    print(f"\n⚙️  Step 4: Generating G-code...")
    update_status(file_id, 4, 'Generating G-code from SVG', base_url)
    
    
    time.sleep(1)
    
    # Step 6: Complete
    print(f"\n✨ Step 6: Drawing complete!")
    update_status(file_id, 6, 'Drawing process completed successfully', base_url)
    
    print(f"\n🎉 Workflow complete!")
    print(f"   - SVG: {svg_path}")
    print(f"   - G-code: {gcode_path}")
    
    return True


def main():
    parser = argparse.ArgumentParser(description='RoboDraw Workflow Automation')
    parser.add_argument('file_id', help='File ID to process')
    parser.add_argument('input_image', help='Path to input image')
    parser.add_argument('--output-dir', default='./uploads', help='Output directory (default: ./uploads)')
    parser.add_argument('--base-url', default='http://localhost:3003', help='Server base URL')
    
    args = parser.parse_args()
    
    # Verify input image exists
    if not Path(args.input_image).exists():
        print(f"✗ Input image not found: {args.input_image}")
        return False
    
    # Process the image
    success = process_image(args.file_id, args.input_image, args.output_dir, args.base_url)
    
    return 0 if success else 1


if __name__ == '__main__':
    exit(main())
