// Import only what's needed
import { convertImage } from './imageConverter.js';
import { convertText } from './textConverter.js';
import { convertData } from './dataConverter.js';
import {
  convertDocumentV2,
  SUPPORTED_FORMATS as DOC_SUPPORTED_FORMATS,
} from './documentConverterV2.js';

const MIME_TYPES = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  txt: 'text/plain',
  html: 'text/html',
  md: 'text/markdown',
  json: 'application/json',
  xml: 'application/xml',
  csv: 'text/csv',
  yaml: 'application/x-yaml',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  bmp: 'image/bmp',
};

// Helper function to get file extension from filename
function getFileExtension(filename) {
  return filename.split('.').pop().toLowerCase();
}

export async function convertFile(file, outputFormat) {
  const inputExtension = getFileExtension(file.originalname);
  const mimeType = file.mimetype;
  // Log conversion request details
  // console.log(`Converting file: ${file.originalname} (${mimeType}) to ${outputFormat}`);

  // Determine the appropriate converter based on input type
  let result;

  try {
    // Check if this is an HTML file - route to text converter
    if (inputExtension === 'html' || mimeType === 'text/html') {
      result = await convertText(file, outputFormat);
    }
    // Check if this is a document type we can handle
    else if (
      Object.values(DOC_SUPPORTED_FORMATS).includes(mimeType) ||
      ['doc', 'docx', 'odt', 'rtf', 'txt', 'pdf'].includes(inputExtension)
    ) {
      // console.log('Using document converter');
      result = await convertDocumentV2(file, outputFormat);
    }
    // Check if this is an image
    else if (
      mimeType.startsWith('image/') ||
      ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(inputExtension)
    ) {
      // console.log('Using image converter');
      result = await convertImage(file, outputFormat);
    }
    // Check if this is a data file (json, xml, csv, etc.)
    else if (
      ['json', 'xml', 'csv', 'yaml', 'yml'].includes(inputExtension) ||
      mimeType.includes('json') ||
      mimeType.includes('xml') ||
      mimeType.includes('csv')
    ) {
      // console.log('Using data converter');
      result = await convertData(file, outputFormat);
    }
    // Default to text converter
    else {
      // console.log('Using text converter as fallback');
      result = await convertText(file, outputFormat);
    }

    if (!result || !result.success) {
      throw new Error(result?.error || 'Conversion failed');
    }

    // Determine the output MIME type
    const outputMimeType = MIME_TYPES[outputFormat] || 'application/octet-stream';

    return {
      success: true,
      data: result.data,
      mimeType: outputMimeType,
      fileName: `${file.originalname.split('.')[0]}.${outputFormat}`,
    };
  } catch (error) {
    // console.error('Conversion error:', error);
    return {
      success: false,
      error: error.message || 'Unknown conversion error',
      stack: error.stack,
    };
  }
}
