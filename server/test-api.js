import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const API_BASE_URL = 'http://localhost:3000/api';
const TEST_FILES_DIR = path.join(__dirname, 'test-files');

// Create a test client
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Accept': 'application/json',
  }
});

// Helper function to read file as buffer
function readTestFile(filename) {
  const filePath = path.join(TEST_FILES_DIR, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Test file not found: ${filePath}`);
  }
  return fs.readFileSync(filePath);
}

// Test cases
const TEST_CASES = [
  {
    name: 'Get supported formats',
    run: async () => {
      const response = await api.get('/formats');
      console.log('Supported formats:', JSON.stringify(response.data, null, 2));
      return response.status === 200 && response.data.success === true;
    }
  },
  {
    name: 'Convert text to PDF',
    run: async () => {
      const fileBuffer = readTestFile('sample.txt');
      const formData = new FormData();
      formData.append('file', new Blob([fileBuffer]), 'sample.txt');
      formData.append('outputFormat', 'pdf');
      
      const response = await api.post('/convert', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        responseType: 'arraybuffer'
      });
      
      // Save the converted file
      const outputPath = path.join(TEST_FILES_DIR, 'output', 'sample-converted.pdf');
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, response.data);
      
      console.log(`Converted file saved to: ${outputPath}`);
      return response.status === 200;
    }
  },
  {
    name: 'Convert HTML to DOCX',
    run: async () => {
      const fileBuffer = readTestFile('sample.html');
      const formData = new FormData();
      formData.append('file', new Blob([fileBuffer]), 'sample.html');
      formData.append('outputFormat', 'docx');
      
      const response = await api.post('/convert', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        responseType: 'arraybuffer'
      });
      
      // Save the converted file
      const outputPath = path.join(TEST_FILES_DIR, 'output', 'sample-converted.docx');
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
      fs.writeFileSync(outputPath, response.data);
      
      console.log(`Converted file saved to: ${outputPath}`);
      return response.status === 200;
    }
  }
];

// Run tests
async function runTests() {
  console.log('Starting API tests...\n');
  let passed = 0;
  
  for (const test of TEST_CASES) {
    process.stdout.write(`Running test: ${test.name}... `);
    
    try {
      const success = await test.run();
      
      if (success) {
        console.log('✅ PASSED');
        passed++;
      } else {
        console.log('❌ FAILED');
      }
    } catch (error) {
      console.log('❌ ERROR');
      console.error('  ' + error.message);
      if (error.response) {
        console.error('  Status:', error.response.status);
        console.error('  Data:', error.response.data);
      }
    }
  }
  
  console.log(`\nTests completed: ${passed}/${TEST_CASES.length} passed`);
  process.exit(passed === TEST_CASES.length ? 0 : 1);
}

// Run the tests
runTests().catch(error => {
  console.error('Test runner error:', error);
  process.exit(1);
});
