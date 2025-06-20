# Universal File Converter

A powerful web-based file conversion tool that supports a wide range of document, image, and data formats. Built with Node.js, Express, and modern web technologies.

## Features

- **Document Conversion**: Convert between PDF, DOCX, DOC, TXT, HTML, and more
- **Image Conversion**: Convert between JPG, PNG, GIF, BMP, WebP, and other image formats
- **Text Processing**: Convert between various text-based formats including Markdown and HTML
- **Data Conversion**: Convert between JSON, XML, CSV, YAML, and other data formats
- **Modern Web Interface**: Responsive design that works on desktop and mobile devices
- **Secure**: Built-in security features and file type validation
- **Fast**: Optimized conversion pipelines for quick processing

## Supported Formats

### Document Formats
- **Input**: PDF, DOCX, DOC, RTF, ODT, TXT, HTML, MD
- **Output**: PDF, DOCX, TXT, HTML, MD

### Image Formats
- **Input**: JPG, JPEG, PNG, GIF, BMP, TIFF, WebP, SVG
- **Output**: JPG, PNG, GIF, BMP, WebP, PDF

### Text Formats
- **Input**: TXT, MD, HTML, CSS, JS, JSON, XML, CSV, YAML, YML
- **Output**: TXT, MD, HTML, PDF, JSON, XML, CSV, YAML

## Getting Started

### Prerequisites

- Node.js 16.x or later
- npm or yarn
- Git (for development)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/universal-file-converter.git
   cd universal-file-converter
   ```

2. Install dependencies:
   ```bash
   cd server
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## API Endpoints

### Convert File

```
POST /api/convert
```

**Request Body:**
- `file`: The file to convert (multipart/form-data)
- `outputFormat`: The desired output format (e.g., 'pdf', 'docx', 'jpg')

**Example:**
```bash
curl -X POST -F "file=@document.docx" -F "outputFormat=pdf" http://localhost:3000/api/convert
```

### Get Supported Formats

```
GET /api/formats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "document": {
      "input": [".pdf", ".docx", ".doc", ".rtf", ".odt", ".xlsx", ".xls", ".ods", ".csv", ".pptx", ".ppt", ".odp", ".txt", ".md", ".html", ".json", ".xml", ".yaml", ".yml"],
      "output": [".pdf", ".docx", ".txt", ".html", ".md"],
      "name": "Documents",
      "description": "Convert between various document formats including PDF, Word, and text files",
      "icon": "📄"
    },
    "image": {
      "input": [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".tiff", ".webp", ".svg"],
      "output": [".jpg", ".jpeg", ".png", ".gif", ".bmp", ".webp", ".pdf"],
      "name": "Images",
      "description": "Convert between various image formats and resize or compress images",
      "icon": "🖼️"
    },
    "text": {
      "input": [".txt", ".md", ".html", ".css", ".js", ".json", ".xml", ".csv", ".yaml", ".yml"],
      "output": [".txt", ".md", ".html", ".pdf", ".json", ".xml", ".csv", ".yaml"],
      "name": "Text",
      "description": "Convert between various text-based formats including code files",
      "icon": "📝"
    },
    "data": {
      "input": [".json", ".xml", ".csv", ".yaml", ".yml"],
      "output": [".json", ".xml", ".csv", ".yaml", ".txt"],
      "name": "Data",
      "description": "Convert between various data interchange formats",
      "icon": "📊"
    }
  },
  "lastUpdated": "2023-11-01T12:00:00.000Z"
}
```

## Running Tests

To run the test suite, use the following command:

```bash
npm test
```

For end-to-end testing of the document converter:

```bash
node test-converter.js
```

## Deployment

### Production Deployment

1. Set up environment variables in a `.env` file:
   ```
   NODE_ENV=production
   PORT=3000
   CORS_ORIGIN=https://yourdomain.com
   ```

2. Build the frontend (if applicable):
   ```bash
   cd client
   npm run build
   ```

3. Start the production server:
   ```bash
   npm start
   ```

### Docker

A `Dockerfile` is provided for containerized deployment:

```bash
docker build -t universal-file-converter .
docker run -p 3000:3000 universal-file-converter
```

## Built With

- [Node.js](https://nodejs.org/) - JavaScript runtime
- [Express](https://expressjs.com/) - Web framework
- [pdf-lib](https://github.com/Hopding/pdf-lib) - PDF generation and manipulation
- [Mammoth.js](https://github.com/mwilliamson/mammoth.js) - DOCX to HTML conversion
- [docx](https://github.com/dolanmiu/docx) - DOCX generation
- [Textract](https://github.com/dbashford/textract) - Text extraction from various file formats
- [Sharp](https://sharp.pixelplumbing.com/) - Image processing

## Contributing

Contributions are welcome! Please read our [contributing guidelines](CONTRIBUTING.md) to get started.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to all the open-source projects that made this possible
- Special thanks to our contributors

---

© 2023 Universal File Converter | [Report an Issue](https://github.com/yourusername/universal-file-converter/issues)
