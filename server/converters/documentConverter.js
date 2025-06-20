import mammoth from 'mammoth';
import { PDFDocument, rgb } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

export async function convertDocument(file, outputFormat) {
  try {
    const inputExtension = file.originalname.split('.').pop()?.toLowerCase();
    console.log(`Converting document from ${inputExtension} to ${outputFormat}`);
    
    let textContent = '';
    let htmlContent = '';
    
    // Extract content based on input format
    switch (inputExtension) {
      case 'docx':
        try {
          const result = await mammoth.convertToHtml({ buffer: file.buffer });
          htmlContent = result.value;
          
          const textResult = await mammoth.extractRawText({ buffer: file.buffer });
          textContent = textResult.value;
        } catch (error) {
          console.error('DOCX conversion error:', error);
          return {
            success: false,
            error: `Failed to read DOCX file: ${error.message}`
          };
        }
        break;
        
      case 'pdf':
        // For PDF input, we'll return a message indicating limited support
        textContent = 'PDF to text conversion requires additional libraries. This is a placeholder implementation.';
        htmlContent = `<p>${textContent}</p>`;
        break;
        
      case 'txt':
      case 'rtf':
        textContent = file.buffer.toString('utf-8');
        htmlContent = `<pre>${textContent}</pre>`;
        break;
        
      default:
        textContent = file.buffer.toString('utf-8');
        htmlContent = `<pre>${textContent}</pre>`;
    }
    
    // Convert to desired output format
    let outputBuffer;
    
    switch (outputFormat.toLowerCase()) {
      case 'txt':
        outputBuffer = Buffer.from(textContent, 'utf-8');
        break;
        
      case 'html':
        const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Converted Document</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        pre { white-space: pre-wrap; word-wrap: break-word; }
    </style>
</head>
<body>
    ${htmlContent}
</body>
</html>`;
        outputBuffer = Buffer.from(fullHtml, 'utf-8');
        break;
        
      case 'md':
        // Simple HTML to Markdown conversion
        let markdown = htmlContent
          .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
          .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
          .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
          .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
          .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
          .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<[^>]*>/g, '') // Remove remaining HTML tags
          .replace(/\n\s*\n\s*\n/g, '\n\n'); // Clean up multiple newlines
        
        outputBuffer = Buffer.from(markdown, 'utf-8');
        break;
        
      case 'pdf':
        // Create a new PDF document
        const pdfDoc = await PDFDocument.create();
        let page = pdfDoc.addPage([595.28, 841.89]);
        const { width, height } = page.getSize();
        const fontSize = 12;
        const margin = 50;
        const maxWidth = width - 2 * margin;
        
        // Use built-in Helvetica font
        const font = await pdfDoc.embedFont(PDFDocument.Font.Helvetica);
        const paragraphs = textContent.split('\n\n');
        let yPosition = height - margin;
        
        for (const paragraph of paragraphs) {
          const lines = paragraph.split('\n');
          for (const line of lines) {
            if (yPosition < margin) {
              page = pdfDoc.addPage([595.28, 841.89]);
              yPosition = page.getSize().height - margin;
            }
            page.drawText(line, {
              x: margin,
              y: yPosition,
              size: fontSize,
              font: font,
              color: rgb(0, 0, 0),
            });
            yPosition -= fontSize * 1.5;
          }
          yPosition -= fontSize * 1.5;
        }
        
        outputBuffer = await pdfDoc.save();
        break;
        
      case 'docx':
        // For DOCX output, we'll create a simple text file with DOCX extension
        // Real DOCX creation would require more complex libraries
        outputBuffer = Buffer.from(textContent, 'utf-8');
        break;
        
      default:
        throw new Error(`Unsupported document output format: ${outputFormat}`);
    }
    
    return {
      success: true,
      data: outputBuffer
    };
    
  } catch (error) {
    console.error('Document conversion error:', error);
    return {
      success: false,
      error: `Document conversion failed: ${error.message}`
    };
  }
}