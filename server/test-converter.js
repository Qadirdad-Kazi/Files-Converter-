import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { convertDocumentV2 } from './converters/documentConverterV2.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Test files directory
const TEST_FILES_DIR = path.join(__dirname, 'test-files');

// Create test files directory if it doesn't exist
if (!fs.existsSync(TEST_FILES_DIR)) {
  fs.mkdirSync(TEST_FILES_DIR, { recursive: true });
  console.log(`Created test files directory at: ${TEST_FILES_DIR}`);
}

// Test cases
const TEST_CASES = [
  {
    name: 'Simple DOCX',
    input: 'simple.docx',
    outputFormats: ['pdf', 'txt', 'html', 'docx']
  },
  {
    name: 'Complex DOCX with Formatting',
    input: 'formatted.docx',
    outputFormats: ['pdf', 'txt', 'html', 'docx']
  },
  {
    name: 'PDF Document',
    input: 'sample.pdf',
    outputFormats: ['docx', 'txt', 'html']
  },
  {
    name: 'Text File',
    input: 'sample.txt',
    outputFormats: ['pdf', 'docx', 'html']
  },
  {
    name: 'HTML File',
    input: 'sample.html',
    outputFormats: ['pdf', 'docx', 'txt']
  }
];

// Helper function to read file as buffer
function readTestFile(filename) {
  const filePath = path.join(TEST_FILES_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`Test file not found: ${filePath}`);
    return null;
  }
  return fs.readFileSync(filePath);
}

// Helper function to write test output
function writeTestOutput(filename, data) {
  const outputDir = path.join(TEST_FILES_DIR, 'output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const outputPath = path.join(outputDir, filename);
  fs.writeFileSync(outputPath, data);
  return outputPath;
}

// Run tests
async function runTests() {
  console.log('Starting document converter tests...\n');
  
  for (const testCase of TEST_CASES) {
    console.log(`\n=== ${testCase.name} (${testCase.input}) ===`);
    
    const inputBuffer = readTestFile(testCase.input);
    if (!inputBuffer) {
      console.log(`  ❌ Test file not found: ${testCase.input}`);
      continue;
    }
    
    const file = {
      originalname: testCase.input,
      buffer: inputBuffer,
      mimetype: getMimeType(testCase.input)
    };
    
    for (const outputFormat of testCase.outputFormats) {
      process.stdout.write(`  Converting to ${outputFormat.toUpperCase()}... `);
      
      try {
        const startTime = Date.now();
        const result = await convertDocumentV2(file, outputFormat);
        const duration = Date.now() - startTime;
        
        if (!result.success) {
          console.log(`❌ Failed: ${result.error}`);
          continue;
        }
        
        const outputFilename = `${path.parse(testCase.input).name}.${outputFormat}`;
        const outputPath = writeTestOutput(outputFilename, result.data);
        
        console.log(`✅ Success (${result.data.length} bytes, ${duration}ms)`);
        console.log(`     Output: ${outputPath}`);
      } catch (error) {
        console.log(`❌ Error: ${error.message}`);
        if (error.stack) {
          console.log(`     ${error.stack.split('\n')[1].trim()}`);
        }
      }
    }
  }
  
  console.log('\nTests completed.');
}

// Helper function to get MIME type from filename
function getMimeType(filename) {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.pdf': 'application/pdf',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.doc': 'application/msword',
    '.txt': 'text/plain',
    '.html': 'text/html',
    '.htm': 'text/html',
    '.rtf': 'application/rtf',
    '.odt': 'application/vnd.oasis.opendocument.text'
  };
  
  return mimeTypes[ext] || 'application/octet-stream';
}

// Run the tests
runTests().catch(console.error);
