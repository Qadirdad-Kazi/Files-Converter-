import sharp from 'sharp';
import { PDFDocument, rgb } from 'pdf-lib';

export async function convertImage(file, outputFormat) {
  try {
    console.log(`Converting image to ${outputFormat}`);

    // Ensure the input is a buffer
    const inputBuffer = Buffer.isBuffer(file.buffer) ? file.buffer : Buffer.from(file.buffer);

    // Create sharp instance with error handling for unsupported formats
    let sharpInstance;
    try {
      sharpInstance = sharp(inputBuffer, { failOnError: true });
    } catch (error) {
      throw new Error(`Unsupported image format: ${error.message}`);
    }

    // Get image info with error handling
    let metadata;
    try {
      metadata = await sharpInstance.metadata();
      console.log(`Image dimensions: ${metadata.width}x${metadata.height}`);
    } catch (error) {
      throw new Error(`Invalid image file: ${error.message}`);
    }

    let outputBuffer;
    const outputFormatLower = outputFormat.toLowerCase();

    try {
      switch (outputFormatLower) {
        case 'jpg':
        case 'jpeg':
          outputBuffer = await sharpInstance
            .jpeg({
              quality: 90,
              mozjpeg: true,
              force: true,
            })
            .toBuffer();
          break;

        case 'png':
          outputBuffer = await sharpInstance
            .png({
              quality: 90,
              force: true,
            })
            .toBuffer();
          break;

        case 'webp':
          outputBuffer = await sharpInstance
            .webp({
              quality: 90,
              force: true,
            })
            .toBuffer();
          break;

        case 'gif':
          // Convert to GIF using proper animation handling
          outputBuffer = await sharpInstance
            .gif({
              loop: 0, // Loop forever
              delay: metadata.delay || [],
              force: true,
            })
            .toBuffer();
          break;

        case 'bmp':
          // Convert to BMP with proper settings
          outputBuffer = await sharpInstance.toFormat('bmp').toBuffer();
          break;

        case 'pdf': {
          // For PDF conversion, create a PDF with the image
          const pdfDoc = await PDFDocument.create();
          // Convert image to PNG first for PDF embedding
          const pngBuffer = await sharpInstance.png().toBuffer();
          const pngImage = await pdfDoc.embedPng(pngBuffer);

          // Calculate page size based on image dimensions
          const imgDims = pngImage.scale(1);
          const page = pdfDoc.addPage([imgDims.width, imgDims.height]);
          page.drawImage(pngImage, {
            x: 0,
            y: 0,
            width: imgDims.width,
            height: imgDims.height,
          });

          outputBuffer = await pdfDoc.save();
          break;
        }

        default:
          throw new Error(`Unsupported image output format: ${outputFormat}`);
      }

      return {
        success: true,
        data: outputBuffer,
      };
    } catch (error) {
      console.error('Image conversion error:', error);
      return {
        success: false,
        error: error.message || 'Image conversion failed',
        stack: error.stack,
      };
    }
  } catch (error) {
    console.error('Image conversion error:', error);
    return {
      success: false,
      error: error.message || 'Image conversion failed',
      stack: error.stack,
    };
  }
}
