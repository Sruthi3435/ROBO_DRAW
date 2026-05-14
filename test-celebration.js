#!/usr/bin/env node
/**
 * RoboDraw Test Script
 * Tests the celebration popup by simulating workflow progression
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const BASE_URL = 'http://localhost:3003';
const ADMIN_KEY = 'robodraw-secret';

function makeRequest(method, endpoint, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, BASE_URL);
    const options = {
      method: method,
      headers: {
        'x-admin-key': ADMIN_KEY,
        'Content-Type': 'application/json'
      }
    };

    const protocol = url.protocol === 'https:' ? require('https') : http;
    
    const req = protocol.request(url, options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(responseData)
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: responseData
          });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testCelebrationPopup() {
  console.log('🤖 RoboDraw Test Script - Celebration Popup Test\n');
  
  // Generate a test file ID
  const testFileId = `test-${Date.now()}`;
  console.log(`📋 Test File ID: ${testFileId}\n`);
  
  console.log('📝 Instructions:');
  console.log('1. Open http://localhost:3003 in your browser');
  console.log('2. This script will simulate workflow progression');
  console.log('3. Watch for the celebration popup after 12 seconds\n');
  
  console.log('⏳ Starting workflow simulation...\n');
  
  try {
    // Create initial status
    await makeRequest('POST', `${BASE_URL}/admin/update-status`, {
      fileId: testFileId,
      step: 1,
      message: 'Image uploaded successfully'
    });
    console.log('✓ Step 1: Image uploaded');
    
    // Wait and progress through steps
    const steps = [
      { step: 2, message: 'Generating SVG from image' },
      { step: 3, message: 'SVG generated successfully, ready for download' },
      { step: 4, message: 'Generating G-code from SVG' },
      { step: 5, message: 'Drawing in progress on robot machine' },
      { step: 6, message: 'Drawing process completed successfully! 🎉' }
    ];

    for (const stepInfo of steps) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const response = await makeRequest('POST', `${BASE_URL}/admin/update-status`, {
        fileId: testFileId,
        step: stepInfo.step,
        message: stepInfo.message
      });
      
      if (response.status === 200) {
        console.log(`✓ Step ${stepInfo.step}: ${stepInfo.message}`);
      } else {
        console.log(`✗ Failed to update step ${stepInfo.step}`);
      }
    }
    
    console.log('\n🎉 Workflow complete!');
    console.log('Check your browser - the celebration popup should be visible.');
    console.log('\nIf you want to test again with a different file:');
    console.log(`curl -X POST http://localhost:3003/admin/test-workflow/new-file-id -H "x-admin-key: robodraw-secret"`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run test
testCelebrationPopup().catch(console.error);
