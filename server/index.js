import express from 'express';
import multer from 'multer';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import winston from 'winston';
import { convertFile } from './converters/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      filename: path.join(__dirname, 'logs', 'error.log'),
      level: 'error',
    }),
    new winston.transports.File({
      filename: path.join(__dirname, 'logs', 'combined.log'),
    }),
  ],
});

// Ensure logs directory exists
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Security middleware
app.use(helmet());
app.use(helmet.hidePoweredBy());
app.use(helmet.noSniff());
app.use(helmet.xssFilter());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// CORS configuration
const corsOptions = {
  origin:
    NODE_ENV === 'development'
      ? ['http://localhost:3000', 'http://127.0.0.1:3000']
      : 'https://your-production-domain.com',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204,
};

// Enable pre-flight requests for all routes
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

// Logging middleware
app.use(
  morgan('combined', {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

// Configure multer for file uploads with better error handling
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    // Get all supported MIME types from our converters
    const allowedTypes = [
      // Image formats
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/bmp',
      'image/tiff',

      // Document formats
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.oasis.opendocument.text',
      'application/rtf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.oasis.opendocument.spreadsheet',
      'application/vnd.oasis.opendocument.presentation',

      // Text and data formats
      'text/plain',
      'text/html',
      'text/csv',
      'application/json',
      'application/xml',
      'text/xml',
      'application/x-yaml',
      'text/yaml',
      'text/markdown',
    ];

    // Also allow any Office document MIME type
    const isOfficeDocument =
      file.mimetype.startsWith('application/vnd.openxmlformats-officedocument.') ||
      file.mimetype.startsWith('application/vnd.ms-');

    if (allowedTypes.includes(file.mimetype) || isOfficeDocument) {
      cb(null, true);
    } else {
      const error = new Error(
        `Unsupported file type: ${file.mimetype}. Only images, documents, and text files are allowed.`
      );
      error.code = 'LIMIT_FILE_TYPES';
      cb(error, false);
    }
  },
});

// Ensure temp directory exists
const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Error handling middleware
app.use((err, req, res, _next) => {
  const statusCode = err.status || 500;
  const logMessage = `${statusCode} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`;

  if (statusCode >= 500) {
    logger.error(logMessage, { stack: err.stack });
  } else {
    logger.warn(logMessage);
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      error: 'File too large',
      details: 'The uploaded file exceeds the maximum allowed size of 50MB.',
    });
  }

  if (err.code === 'LIMIT_FILE_TYPES') {
    return res.status(415).json({
      success: false,
      error: 'Unsupported file type',
      details: err.message,
      supportedTypes: [
        'Images: JPEG, PNG, GIF, WebP, BMP, TIFF',
        'Documents: PDF, DOCX, DOC, RTF, ODT, XLSX, XLS, PPTX, PPT',
        'Text: TXT, MD, HTML, JSON, XML, CSV, YAML',
      ],
    });
  }

  if (err instanceof multer.MulterError) {
    // Log the error
    const errorDetails = {
      message: err.message,
      stack: err.stack,
      code: err.code,
      status: err.status || 500,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    };
    logger.error('Error processing request:', JSON.stringify(errorDetails, null, 2));
    return res.status(400).json({
      success: false,
      error: statusCode >= 500 ? 'Internal server error' : err.message,
      details: NODE_ENV === 'development' ? err.message : undefined,
      stack: NODE_ENV === 'development' ? err.stack : undefined,
    });
  }

  // Handle other errors
  const response = {
    success: false,
    error: statusCode >= 500 ? 'Internal server error' : err.message,
    details: NODE_ENV === 'development' ? err.message : undefined,
    stack: NODE_ENV === 'development' ? err.stack : undefined,
  };

  // Remove stack trace in production
  if (NODE_ENV !== 'development') {
    delete response.stack;
    delete response.details;
  }

  res.status(statusCode).json(response);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: new Date().toISOString(),
    checks: [
      {
        name: 'Memory Usage',
        status: 'ok',
        data: {
          rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
          heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`,
          heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
          external: `${Math.round(process.memoryUsage().external / 1024 / 1024)} MB`,
        },
      },
      {
        name: 'CPU Usage',
        status: 'ok',
        data: process.cpuUsage(),
      },
      {
        name: 'Environment',
        status: 'ok',
        data: {
          node: process.version,
          platform: process.platform,
          arch: process.arch,
          env: process.env.NODE_ENV || 'development',
        },
      },
    ],
  };

  try {
    res.json(healthcheck);
  } catch (error) {
    healthcheck.message = error.message;
    res.status(503).json(healthcheck);
  }
});

// File conversion endpoint
app.post('/api/convert', upload.single('file'), async (req, res, next) => {
  try {
    // Log request details for debugging
    const fileInfo = req.file
      ? {
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          buffer: req.file.buffer ? `Buffer(${req.file.buffer.length} bytes)` : 'No buffer',
        }
      : 'No file';

    const requestInfo = {
      file: fileInfo,
      body: req.body,
      headers: req.headers,
    };
    logger.info('Received conversion request:', JSON.stringify(requestInfo, null, 2));

    // Validate request
    if (!req.file) {
      const error = new Error('No file uploaded');
      error.status = 400;
      error.code = 'MISSING_FILE';
      throw error;
    }

    const { outputFormat } = req.body;
    if (!outputFormat) {
      const error = new Error('Output format not specified');
      error.status = 400;
      error.code = 'MISSING_OUTPUT_FORMAT';
      throw error;
    }

    logger.info(
      `Starting conversion: ${req.file.originalname} to ${outputFormat} (${req.file.size} bytes)`
    );

    // Ensure the file buffer is valid
    if (!req.file.buffer || !Buffer.isBuffer(req.file.buffer)) {
      if (req.file.buffer) {
        req.file.buffer = Buffer.from(req.file.buffer);
      } else {
        const error = new Error('Invalid file buffer');
        error.status = 400;
        error.code = 'INVALID_FILE_BUFFER';
        throw error;
      }
    }

    // Convert the file with comprehensive error handling
    const startTime = Date.now();
    let result;
    let conversionTime;

    try {
      // Attempt the conversion
      result = await convertFile(req.file, outputFormat);
      conversionTime = Date.now() - startTime;

      // Validate the conversion result
      if (!result) {
        throw new Error('No result returned from converter');
      }

      // Handle conversion errors from the converter
      if (!result.success) {
        const errorDetails = {
          originalname: req.file.originalname,
          outputFormat,
          error: result.error || 'Unknown error',
          stack: result.stack,
        };

        logger.error(
          `Conversion failed after ${conversionTime}ms: ${errorDetails.error}`,
          errorDetails
        );

        const error = new Error(`Failed to convert file: ${errorDetails.error}`);
        error.status = 400; // Bad Request for conversion-specific errors
        error.code = 'CONVERSION_FAILED';
        error.details = errorDetails;
        throw error;
      }

      // Validate the converted data
      if (!result.data && !result.buffer) {
        throw new Error('No data was generated during conversion');
      }

      if (!Buffer.isBuffer(result.data || result.buffer)) {
        throw new Error('Conversion did not return a valid buffer');
      }

      // Generate a safe filename
      const safeFilename = path
        .parse(req.file.originalname)
        .name.replace(/[^\w\d\s-]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 100);

      const filename = `${safeFilename}.${outputFormat}`;
      const convertedSize = result.data ? result.data.length : result.buffer.length;

      // Log successful conversion
      logger.info(
        `Conversion successful after ${conversionTime}ms: ${req.file.originalname} -> ${filename} (${convertedSize} bytes)`,
        {
          originalSize: req.file.size,
          convertedSize,
          conversionTime: `${conversionTime}ms`,
        }
      );

      // Set response headers
      res.setHeader('Content-Type', result.mimeType || 'application/octet-stream');
      res.setHeader('Content-Length', convertedSize);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('X-Conversion-Time', `${conversionTime}ms`);
      res.setHeader('X-Original-File', req.file.originalname);
      res.setHeader('X-Converted-File', filename);

      // Ensure we have valid data to send
      const responseData = result.data || result.buffer;
      if (!responseData) {
        throw new Error('No data was generated during conversion');
      }

      // Set response headers
      res.setHeader('Content-Type', result.mimeType || 'application/octet-stream');
      res.setHeader('Content-Length', responseData.length);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('X-Conversion-Time', `${conversionTime}ms`);
      res.setHeader('X-Original-File', req.file.originalname);
      res.setHeader('X-Converted-File', filename);

      // Send the response and end the connection
      res.end(responseData);
      return; // Important: Return to prevent further processing
    } catch (error) {
      // Log the error with detailed context
      const errorContext = {
        originalname: req.file?.originalname,
        outputFormat,
        error: error.message,
        stack: error.stack,
        duration: conversionTime !== undefined ? `${conversionTime}ms` : 'N/A',
        code: error.code || 'UNKNOWN_CONVERSION_ERROR',
      };

      logger.error('Conversion process failed:', errorContext);

      // Enhance the error with more context
      if (!error.status) {
        error.status = 500; // Default to 500 if no status was set
      }
      if (!error.code) {
        error.code = 'CONVERSION_PROCESS_ERROR';
      }
      error.details = errorContext;

      // Check if headers have already been sent
      if (res.headersSent) {
        logger.error('Headers already sent, cannot send error response');
        return;
      }

      next(error);
    }
  } catch (error) {
    const errorContext = {
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      code: error.code || 'INTERNAL_SERVER_ERROR',
      status: error.status || 500,
      originalname: req.file?.originalname,
      outputFormat: req.body?.outputFormat,
      timestamp: new Date().toISOString(),
    };

    logger.error('Error in /api/convert:', errorContext);

    // Send JSON response for API clients
    if (req.accepts('json')) {
      return res.status(errorContext.status).json({
        error: errorContext.message,
        code: errorContext.code,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
      });
    }

    // Fallback to error handler middleware
    next(error);
  }
});

// Get supported formats endpoint
app.get('/api/formats', (req, res) => {
  const formats = {
    document: {
      input: [
        // Document formats
        '.pdf',
        '.docx',
        '.doc',
        '.rtf',
        '.odt',
        // Spreadsheet formats
        '.xlsx',
        '.xls',
        '.ods',
        '.csv',
        // Presentation formats
        '.pptx',
        '.ppt',
        '.odp',
        // Text formats
        '.txt',
        '.md',
        '.html',
        '.json',
        '.xml',
        '.yaml',
        '.yml',
      ],
      output: ['.pdf', '.docx', '.txt', '.html', '.md'],
    },
    image: {
      input: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff', '.webp', '.svg'],
      output: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.pdf'],
    },
    text: {
      input: ['.txt', '.md', '.html', '.css', '.js', '.json', '.xml', '.csv', '.yaml', '.yml'],
      output: ['.txt', '.md', '.html', '.pdf', '.json', '.xml', '.csv', '.yaml'],
    },
    data: {
      input: ['.json', '.xml', '.csv', '.yaml', '.yml'],
      output: ['.json', '.xml', '.csv', '.yaml', '.txt'],
    },
  };

  // Add detailed format information
  const formatDetails = {
    document: {
      name: 'Documents',
      description: 'Convert between various document formats including PDF, Word, and text files',
      icon: '📄',
    },
    image: {
      name: 'Images',
      description: 'Convert between various image formats and resize or compress images',
      icon: '🖼️',
    },
    text: {
      name: 'Text',
      description: 'Convert between various text-based formats including code files',
      icon: '📝',
    },
    data: {
      name: 'Data',
      description: 'Convert between various data interchange formats',
      icon: '📊',
    },
  };

  // Add details to formats
  Object.keys(formats).forEach((key) => {
    formats[key] = {
      ...formats[key],
      ...(formatDetails[key] || {}),
    };
  });

  res.json({
    success: true,
    data: formats,
    lastUpdated: new Date().toISOString(),
  });
});

// Start the server
app.listen(PORT, () => {
  const endpoints = [
    'GET  /api/health - Health check',
    'POST /api/convert - Convert file',
    'GET  /api/formats - List supported formats',
  ];

  const serverInfo = {
    message: 'Server started',
    port: PORT,
    environment: NODE_ENV,
    processId: process.pid,
    nodeVersion: process.version,
    platform: `${process.platform} ${process.arch}`,
    endpoints,
  };

  logger.info('Server started', JSON.stringify(serverInfo, null, 2));

  // Log to console in development
  if (NODE_ENV === 'development') {
    const messages = [
      '\nUniversal File Converter API',
      `Running on http://localhost:${PORT}`,
      '\nAvailable endpoints:',
      ...endpoints.map((endpoint) => `  ${endpoint}`),
      '',
    ];
    process.stdout.write(`${messages.join('\n')}\n`);
  }
});

export default app;
