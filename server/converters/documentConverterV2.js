import mammoth from 'mammoth';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { fileTypeFromBuffer } from 'file-type';
import textract from 'textract';

// Supported formats with their MIME types
export const SUPPORTED_FORMATS = {
  // Document formats
  txt: 'text/plain',
  md: 'text/markdown',
  html: 'text/html',
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  doc: 'application/msword',
  rtf: 'application/rtf',
  odt: 'application/vnd.oasis.opendocument.text',

  // Spreadsheet formats
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xls: 'application/vnd.ms-excel',
  ods: 'application/vnd.oasis.opendocument.spreadsheet',
  csv: 'text/csv',

  // Presentation formats
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ppt: 'application/vnd.ms-powerpoint',
  odp: 'application/vnd.oasis.opendocument.presentation',
};
// Convert buffer to text with textract
async function bufferToText(buffer, mimeType) {
  return new Promise((resolve, reject) => {
    textract.fromBufferWithMime(mimeType, buffer, (error, text) => {
      if (error) {
        reject(error);
      } else {
        resolve(text);
      }
    });
  });
}

// Convert text to PDF
async function textToPdf(text, options = {}) {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595.28, 841.89]); // A4 size in points
    const { width, height } = page.getSize();

    const fontSize = options.fontSize || 12;
    const margin = options.margin || 50;
    const maxWidth = width - 2 * margin;
    const lineHeight = fontSize * 1.5;

    // Use standard fonts that are always available
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Process text into lines
    const lines = [];
    const paragraphs = text.split(/\n\s*\n/);

    for (const paragraph of paragraphs) {
      if (!paragraph.trim()) {
        lines.push({ text: '', bold: false });
        continue;
      }

      // Simple markdown parsing for bold text
      const parts = paragraph.split(/(\*\*.*?\*\*)/g);

      for (const part of parts) {
        if (!part) continue;

        if (part.startsWith('**') && part.endsWith('**')) {
          // Bold text
          const text = part.slice(2, -2);
          const words = text.split(/\s+/);
          let currentLine = '';

          for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const textWidth = boldFont.widthOfTextAtSize(testLine, fontSize);

            if (textWidth > maxWidth && currentLine) {
              lines.push({ text: currentLine, bold: true });
              currentLine = word;
            } else {
              currentLine = testLine;
            }
          }

          if (currentLine) {
            lines.push({ text: currentLine, bold: true });
          }
        } else {
          // Regular text
          const words = part.split(/\s+/);
          let currentLine = '';

          for (const word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            const textWidth = font.widthOfTextAtSize(testLine, fontSize);

            if (textWidth > maxWidth && currentLine) {
              lines.push({ text: currentLine, bold: false });
              currentLine = word;
            } else {
              currentLine = testLine;
            }
          }

          if (currentLine) {
            lines.push({ text: currentLine, bold: false });
          }
        }
      }

      lines.push({ text: '', bold: false }); // Empty line after paragraph
    }

    // Add text to PDF
    let yPosition = height - margin;
    let currentPage = page;
    const pages = [currentPage];

    for (const { text, bold } of lines) {
      if (yPosition < margin) {
        currentPage = pdfDoc.addPage([595.28, 841.89]);
        pages.push(currentPage);
        yPosition = currentPage.getSize().height - margin;
      }

      if (text) {
        currentPage.drawText(text, {
          x: margin,
          y: yPosition,
          size: fontSize,
          font: bold ? boldFont : font,
          color: rgb(0, 0, 0),
        });
      }

      yPosition -= lineHeight;
    }

    // Add page numbers
    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const pageText = `Page ${i + 1} of ${pages.length}`;
      const textWidth = font.widthOfTextAtSize(pageText, 10);

      page.drawText(pageText, {
        x: (width - textWidth) / 2,
        y: 30,
        size: 10,
        font,
        color: rgb(0.5, 0.5, 0.5),
      });
    }

    const resultBuffer = await pdfDoc.save();
    return {
      success: true,
      data: resultBuffer,
    };
  } catch (error) {
    console.error('Error converting text to PDF:', error);
    return {
      success: false,
      error: error.message || 'PDF conversion failed',
      stack: error.stack,
    };
  }
}

// Convert document to text
async function convertToText(buffer, mimeType) {
  try {
    // First try textract for complex formats
    try {
      return await bufferToText(buffer, mimeType);
    } catch (error) {
      // Fallback to simple buffer conversion
      const text = buffer.toString('utf-8');
      return {
        success: true,
        data: text,
      };
    }
  } catch (error) {
    console.error('Error converting document to text:', error);
    return {
      success: false,
      error: error.message || 'Document conversion failed',
      stack: error.stack,
    };
  }
}

// Convert document to HTML
async function convertToHtml(buffer, mimeType) {
  try {
    if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword'
    ) {
      // Convert DOCX to HTML using mammoth
      const result = await mammoth.convertToHtml({ buffer });
      return {
        success: true,
        data: result.value,
      };
    }

    // For other formats, convert to text first and then wrap in HTML
    const textResult = await convertToText(buffer, mimeType);
    if (!textResult.success) {
      return textResult;
    }
    const text = textResult.data;
    const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Converted Document</title>
    <style>
      body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
      pre { white-space: pre-wrap; background: #f5f5f5; padding: 15px; border-radius: 5px; }
    </style>
  </head>
  <body>
    <pre>${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
  </body>
</html>
    `;
    return {
      success: true,
      data: html,
    };
  } catch (error) {
    console.error('Error converting document to HTML:', error);
    return {
      success: false,
      error: error.message || 'HTML conversion failed',
      stack: error.stack,
    };
  }
}

// Convert document to DOCX
async function convertToDocx(buffer, mimeType) {
  try {
    // If already DOCX, return as is
    if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      return {
        success: true,
        data: buffer,
      };
    }

    // Convert to text first
    const textResult = await convertToText(buffer, mimeType);
    if (!textResult.success) {
      return textResult;
    }
    const text = textResult.data;

    // Create a simple DOCX document
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Converted Document',
                  bold: true,
                  size: 28,
                }),
              ],
            }),
            new Paragraph({
              text: '\n',
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text,
                  size: 24,
                }),
              ],
            }),
          ],
        },
      ],
    });

    const resultBuffer = await Packer.toBuffer(doc);
    return {
      success: true,
      data: resultBuffer,
    };
  } catch (error) {
    console.error('Error converting document to DOCX:', error);
    return {
      success: false,
      error: error.message || 'DOCX conversion failed',
      stack: error.stack,
    };
  }
}

// Main conversion function
async function convertDocumentV2(file, outputFormat) {
  try {
    const { buffer, originalname } = file;
    const fileExt = originalname.split('.').pop()?.toLowerCase();

    // Detect MIME type
    let mimeType = SUPPORTED_FORMATS[fileExt];
    if (!mimeType) {
      const fileType = await fileTypeFromBuffer(buffer);
      if (fileType) {
        mimeType = fileType.mime;
      } else {
        mimeType = 'application/octet-stream';
      }
    }

    // Convert to the target format
    let resultBuffer;

    switch (outputFormat.toLowerCase()) {
      case 'txt': {
        const textResult = await convertToText(buffer, mimeType);
        if (!textResult.success) {
          return textResult;
        }
        resultBuffer = Buffer.from(textResult.data, 'utf-8');
        break;
      }

      case 'html': {
        const htmlResult = await convertToHtml(buffer, mimeType);
        if (!htmlResult.success) {
          return htmlResult;
        }
        resultBuffer = Buffer.from(htmlResult.data, 'utf-8');
        break;
      }

      case 'pdf': {
        const textResult = await convertToText(buffer, mimeType);
        if (!textResult.success) {
          return textResult;
        }
        resultBuffer = await textToPdf(textResult.data);
        break;
      }

      case 'docx': {
        const docxResult = await convertToDocx(buffer, mimeType);
        if (!docxResult.success) {
          return docxResult;
        }
        resultBuffer = docxResult.data;
        break;
      }

      default:
        throw new Error(`Unsupported output format: ${outputFormat}`);
    }

    return {
      success: true,
      data: resultBuffer,
      mimeType: SUPPORTED_FORMATS[outputFormat] || 'application/octet-stream',
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Document conversion failed',
      stack: error.stack,
    };
  }
}

export { convertDocumentV2 };
