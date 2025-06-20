import xml2js from 'xml2js';
import csvParser from 'csv-parser';
import { createObjectCsvWriter } from 'csv-writer';
import { Readable } from 'stream';

export async function convertData(file, outputFormat) {
  try {
    const inputExtension = file.originalname.split('.').pop()?.toLowerCase();
    const inputText = file.buffer.toString('utf-8');

    // Parse input data
    let data;
    let parser;
    let xmlString;
    let csvString;
    let yamlString;
    let textContent;

    // Parse input data
    switch (inputExtension) {
      case 'json':
        try {
          data = JSON.parse(inputText);
        } catch (error) {
          throw new Error(`Invalid JSON: ${error.message}`);
        }
        break;

      case 'xml':
        try {
          parser = new xml2js.Parser({ explicitArray: false });
          data = await parser.parseStringPromise(inputText);
        } catch (error) {
          throw new Error(`Invalid XML: ${error.message}`);
        }
        break;

      case 'csv':
        try {
          data = await parseCSV(inputText);
        } catch (error) {
          throw new Error(`Invalid CSV: ${error.message}`);
        }
        break;

      case 'yaml':
      case 'yml':
        // Simple YAML parsing (basic key-value pairs)
        try {
          data = parseSimpleYAML(inputText);
        } catch (error) {
          throw new Error(`Invalid YAML: ${error.message}`);
        }
        break;

      default:
        // Try to parse as JSON first, then as plain text
        try {
          data = JSON.parse(inputText);
        } catch {
          data = { content: inputText };
        }
    }

    // Convert to output format
    let outputBuffer;

    switch (outputFormat.toLowerCase()) {
      case 'json':
        outputBuffer = Buffer.from(JSON.stringify(data, null, 2), 'utf-8');
        break;

      case 'xml':
        parser = new xml2js.Builder({ rootName: 'root' });
        xmlString = parser.buildObject(data);
        outputBuffer = Buffer.from(xmlString, 'utf-8');
        break;

      case 'csv':
        csvString = await convertToCSV(data);
        outputBuffer = Buffer.from(csvString, 'utf-8');
        break;

      case 'yaml':
        yamlString = convertToYAML(data);
        outputBuffer = Buffer.from(yamlString, 'utf-8');
        break;

      case 'txt':
        if (typeof data === 'string') {
          textContent = data;
        } else {
          textContent = JSON.stringify(data, null, 2);
        }
        outputBuffer = Buffer.from(textContent, 'utf-8');
        break;

      default:
        throw new Error(`Unsupported data output format: ${outputFormat}`);
    }

    return {
      success: true,
      data: outputBuffer,
    };
  } catch (error) {
    return {
      success: false,
      error: `Data conversion failed: ${error.message}`,
      stack: error.stack,
    };
  }
}

// Helper function to parse CSV
function parseCSV(csvText) {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = Readable.from([csvText]);
    stream
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (error) => reject(error));
  });
}

// Helper function to convert data to CSV
async function convertToCSV(data) {
  if (Array.isArray(data) && data.length > 0) {
    // Array of objects - convert to CSV
    const headers = Object.keys(data[0]);
    // Note: csvWriter is not used but kept for reference
    // const csvWriter = createObjectCsvWriter({
    //   path: '', // We'll capture the output
    //   header: headers.map((h) => ({ id: h, title: h })),
    // });

    // Manually create CSV string
    let csvString = headers.join(',') + '\n';
    for (const row of data) {
      const values = headers.map((h) => {
        const value = row[h];
        const stringValue = value !== null && value !== undefined ? String(value) : '';
        // Escape quotes and wrap in quotes if contains comma or quote
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return '"' + stringValue.replace(/"/g, '""') + '"';
        }
        return stringValue;
      });
      csvString += values.join(',') + '\n';
    }

    return csvString;
  } else if (typeof data === 'object') {
    // Single object - convert key-value pairs to CSV
    const keys = Object.keys(data);
    const values = keys.map((k) => data[k]);
    return keys.join(',') + '\n' + values.join(',');
  } else {
    // Simple value
    return String(data);
  }
}

// Helper function to parse simple YAML
function parseSimpleYAML(yamlText) {
  const lines = yamlText.split('\n');
  const result = {};

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) continue;

    const key = trimmed.substring(0, colonIndex).trim();
    const value = trimmed.substring(colonIndex + 1).trim();

    // Simple type conversion
    if (value === 'true') {
      result[key] = true;
    } else if (value === 'false') {
      result[key] = false;
    } else if (!isNaN(value) && value !== '') {
      result[key] = Number(value);
    } else {
      // Remove quotes if present
      result[key] = value.replace(/^["']|["']$/g, '');
    }
  }

  return result;
}

// Helper function to convert data to YAML
function convertToYAML(data, indent = 0) {
  const spaces = '  '.repeat(indent);

  if (Array.isArray(data)) {
    return data
      .map((item) => {
        if (typeof item === 'object') {
          return spaces + '-\n' + convertToYAML(item, indent + 1);
        } else {
          return spaces + '- ' + String(item);
        }
      })
      .join('\n');
  } else if (typeof data === 'object' && data !== null) {
    return Object.keys(data)
      .map((key) => {
        const value = data[key];
        if (typeof value === 'object' && value !== null) {
          return spaces + key + ':\n' + convertToYAML(value, indent + 1);
        } else {
          return spaces + key + ': ' + String(value);
        }
      })
      .join('\n');
  } else {
    return spaces + String(data);
  }
}
