import MarkdownIt from 'markdown-it';
// File system and path utilities are currently not used but may be needed for future enhancements
import * as fontkit from 'fontkit';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Document, Paragraph, TextRun, Packer } from 'docx';

const md = new MarkdownIt();

// Create a promise for fontkit initialization
const fontkitPromise = Promise.resolve(fontkit)
  .then((mod) => mod.default || mod)
  .catch((err) => {
    const error = new Error(`Failed to load fontkit: ${err.message}`);
    error.originalError = err;
    throw error;
  });

// Function to get fontkit instance (currently unused but kept for future use)
// eslint-disable-next-line no-unused-vars
async function getFontkit() {
  return fontkitPromise;
}

// Helper function to escape HTML
function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Helper function to convert text to PDF
async function convertTextToPdf(text, _filename) {
  try {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();

    // Register fontkit for better font support
    pdfDoc.registerFontkit(fontkit);

    // Use a font that supports a wide range of characters
    let font;
    try {
      // First try to use a system font that might support more characters
      font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    } catch (error) {
      // Fall back to standard font if custom font loading fails
      // eslint-disable-next-line no-console
      console.warn('Could not load system font, falling back to built-in font');
      font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    }

    // Function to check if a character is a control character we want to remove
    const isControlChar = (char) => {
      const code = char.charCodeAt(0);
      // Keep tab (9), newline (10), and carriage return (13)
      return (
        (code <= 31 || (code >= 127 && code <= 159)) && code !== 9 && code !== 10 && code !== 13
      );
    };

    // Sanitize the text by removing control characters and normalizing line endings
    const sanitizedText = (() => {
      return text
        .replace(/\r\n?/g, '\n')
        .split('')
        .map((char) => (isControlChar(char) ? ' ' : char.charCodeAt(0) <= 255 ? char : ' '))
        .join('');
    })();

    // Create a new page
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size in points
    const { width, height } = page.getSize();

    const fontSize = 12;
    const margin = 50;
    const maxWidth = width - 2 * margin;
    const lineHeight = fontSize * 1.5;

    // Process the sanitized text
    const lines = sanitizedText.split('\n');
    const wrappedLines = [];

    // Simple text wrapping
    for (const line of lines) {
      let currentLine = '';
      for (const word of line.split(' ')) {
        if (currentLine.length * fontSize > maxWidth) {
          wrappedLines.push(currentLine);
          currentLine = word + ' ';
        } else {
          currentLine += word + ' ';
        }
      }
      wrappedLines.push(currentLine);
    }

    // Draw the text
    let y = height - margin;
    for (const line of wrappedLines) {
      if (y < margin) {
        // Add a new page if we run out of space
        pdfDoc.addPage([595.28, 841.89]);
        y = height - margin;
      }

      const x = margin;
      page.drawText(line, {
        x,
        y,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
      y -= lineHeight;
    }

    // Save the PDF
    const pdfBytes = await pdfDoc.save();
    return {
      success: true,
      data: pdfBytes,
    };
  } catch (error) {
    // console.error('PDF conversion error:', error);
    return {
      success: false,
      error: error.message || 'PDF conversion failed',
      stack: error.stack,
    };
  }
}

// Helper function to convert text to DOCX
async function convertTextToDocx(text, _filename) {
  try {
    // Convert text to DOCX

    // Create a new document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [new TextRun(text)],
            }),
          ],
        },
      ],
    });

    // Generate the DOCX file
    const docxBuffer = await Packer.toBuffer(doc);
    return {
      success: true,
      data: docxBuffer,
    };
  } catch (error) {
    // console.error('DOCX conversion error:', error);
    return {
      success: false,
      error: error.message || 'DOCX conversion failed',
      stack: error.stack,
    };
  }
}

// Helper function to convert text to JSON
function convertTextToJson(text) {
  try {
    // Try to parse as JSON first to validate
    JSON.parse(text);
    return {
      success: true,
      data: Buffer.from(text, 'utf-8'),
    };
  } catch (e) {
    // If not valid JSON, create a JSON object with the text as content
    const jsonObj = { content: text };
    return {
      success: true,
      data: Buffer.from(JSON.stringify(jsonObj, null, 2), 'utf-8'),
    };
  }
}

/**
 * Convert text file to another format
 * @param {Object} file - The input file object with buffer and metadata
 * @param {string} outputFormat - The desired output format
 * @returns {Object} - Standardized response with success flag, data buffer, and error info
 */
export async function convertText(file, outputFormat) {
  try {
    if (!file || !file.buffer || !file.originalname) {
      throw new Error('Invalid file object provided');
    }

    const inputExtension = file.originalname.split('.').pop()?.toLowerCase() || '';
    const inputText = file.buffer.toString('utf-8');

    if (!inputText) {
      throw new Error('File is empty');
    }

    // Logging disabled for production
    // console.log(`Converting text from ${inputExtension} to ${outputFormat}`);

    let outputBuffer;

    switch (outputFormat.toLowerCase()) {
      case 'txt':
        // Convert any format to plain text
        if (inputExtension === 'html') {
          // Simple HTML to text conversion
          const plainText = inputText
            .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/\s+/g, ' ')
            .trim();
          outputBuffer = Buffer.from(plainText, 'utf-8');
        } else if (inputExtension === 'md') {
          // Markdown to text
          const html = md.render(inputText);
          const plainText = html
            .replace(/<[^>]*>/g, '')
            .replace(/\s+/g, ' ')
            .trim();
          outputBuffer = Buffer.from(plainText, 'utf-8');
        } else {
          outputBuffer = Buffer.from(inputText, 'utf-8');
        }
        break;

      case 'html':
        if (inputExtension === 'md') {
          // Markdown to HTML
          const htmlContent = md.render(inputText);
          const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Converted Document</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; }
        pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow-x: auto; }
        blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 20px; color: #666; }
    </style>
</head>
<body>
    ${htmlContent}
</body>
</html>`;
          outputBuffer = Buffer.from(fullHtml, 'utf-8');
        } else {
          // Plain text to HTML
          const htmlContent = `<pre>${escapeHtml(inputText)}</pre>`;
          const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Converted Document</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        pre { white-space: pre-wrap; word-wrap: break-word; font-family: 'Monaco', 'Menlo', monospace; }
    </style>
</head>
<body>
    ${htmlContent}
</body>
</html>`;
          outputBuffer = Buffer.from(fullHtml, 'utf-8');
        }
        break;

      case 'md':
        if (inputExtension === 'html') {
          // Simple HTML to Markdown conversion
          const markdown = inputText
            .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
            .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
            .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
            .replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n')
            .replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n')
            .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
            .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
            .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
            .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
            .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
            .replace(/<ul[^>]*>(.*?)<\/ul>/gi, '$1\n')
            .replace(/<ol[^>]*>(.*?)<\/ol>/gi, '$1\n')
            .replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n')
            .replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`')
            .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
            .replace(/<br\s*\/?>/gi, '\n')
            .replace(/<[^>]*>/g, '') // Remove remaining HTML tags
            .replace(/\n\s*\n\s*\n/g, '\n\n'); // Clean up multiple newlines

          outputBuffer = Buffer.from(markdown, 'utf-8');
        } else {
          // Plain text to Markdown (just wrap in code block)
          const markdown = `\`\`\`\n${inputText}\n\`\`\``;
          outputBuffer = Buffer.from(markdown, 'utf-8');
        }
        break;

      case 'pdf':
        try {
          const pdfResult = await convertTextToPdf(inputText, file.originalname);
          if (!pdfResult.success) {
            return pdfResult; // Return error directly
          }
          outputBuffer = pdfResult.data;
        } catch (error) {
          return {
            success: false,
            error: `Failed to convert to PDF: ${error.message}`,
            stack: error.stack,
          };
        }
        break;

      case 'docx':
        try {
          const docxResult = await convertTextToDocx(inputText, file.originalname);
          if (!docxResult.success) {
            return docxResult; // Return error directly
          }
          outputBuffer = docxResult.data;
        } catch (error) {
          return {
            success: false,
            error: `Failed to convert to DOCX: ${error.message}`,
            stack: error.stack,
          };
        }
        break;

      case 'json': {
        const jsonResult = convertTextToJson(inputText);
        outputBuffer = jsonResult.data;
        break;
      }

      case 'csv': {
        // Simple text to CSV - just one column
        const lines = inputText.split('\n');
        const csv = lines.map((line) => `"${line.replace(/"/g, '""')}"`);
        outputBuffer = Buffer.from(csv.join('\n'), 'utf-8');
        break;
      }

      case 'xml': {
        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<document>
  <content><![CDATA[${inputText}]]></content>
</document>`;
        outputBuffer = Buffer.from(xml, 'utf-8');
        break;
      }

      case 'yaml': {
        const yaml = `---\ncontent: |\n  ${inputText.split('\n').join('\n  ')}\n`;
        outputBuffer = Buffer.from(yaml, 'utf-8');
        break;
      }

      default:
        throw new Error(`Unsupported output format for text: ${outputFormat}`);
    }

    return {
      success: true,
      data: outputBuffer,
    };
  } catch (error) {
    // console.error('Text conversion error:', error);
    return {
      success: false,
      error: error.message || 'Text conversion failed',
      stack: error.stack,
    };
  }
}
