/**
 * API service for file conversion
 */
import { FormatsResponse, ConversionResponse } from '../types/api';

// Base URL for API requests
const API_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Convert a file to the specified format
 * @param file The file to convert
 * @param outputFormat The desired output format
 * @returns Promise with the converted file blob
 */
export async function convertFile(file: File, outputFormat: string): Promise<Blob> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('outputFormat', outputFormat);

  try {
    const response = await fetch(`${API_URL}/convert`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
      headers: {
        'Accept': 'application/octet-stream,application/json'
      }
    });

    if (!response.ok) {
      // Clone the response before reading it
      const responseClone = response.clone();
      let errorMessage = `Conversion failed with status: ${response.status}`;
      
      try {
        // First try to parse as JSON
        const errorData = await responseClone.json().catch(() => ({}));
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {
        try {
          // If JSON parsing fails, try to get as text
          const errorText = await responseClone.text();
          if (errorText) {
            errorMessage = errorText;
          }
        } catch (textError) {
          console.error('Failed to read error response:', textError);
        }
      }
      
      // Create a new error with the extracted message
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      throw error;
    }

    // If we get here, the response should be the file
    return await response.blob();
  } catch (error: unknown) {
    console.error('Conversion error:', error);
    if (error instanceof Error) {
      throw new Error(`Conversion failed: ${error.message}`);
    } else if (typeof error === 'string') {
      throw new Error(`Conversion failed: ${error}`);
    } else {
      throw new Error('Failed to convert file. An unknown error occurred.');
    }
  }
}

/**
 * Get supported formats from the API
 * @returns Promise with the supported formats
 */
export async function getSupportedFormats(): Promise<FormatsResponse> {
  try {
    const response = await fetch(`${API_URL}/formats`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      credentials: 'include', // Include cookies if needed
      mode: 'cors' // Enable CORS mode
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to fetch formats with status: ${response.status}`);
    }
    
    return await response.json() as FormatsResponse;
  } catch (error) {
    console.error('Error in getSupportedFormats:', error);
    throw error; // Re-throw to be caught by the component
  }
}
