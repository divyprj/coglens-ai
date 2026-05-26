/**
 * CogLens — PDF Validation
 */

import { MAX_FILE_SIZE, MAX_FILE_SIZE_LABEL } from '@/lib/constants';

interface ValidationInput {
  type: string;
  size: number;
  name: string;
}

interface ValidationResult {
  valid: boolean;
  error: string | null;
}

export function validatePdfFile(file: ValidationInput): ValidationResult {
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    return { valid: false, error: 'Only PDF files are accepted.' };
  }

  if (file.type !== 'application/pdf') {
    return { valid: false, error: 'Invalid file type. Please upload a PDF.' };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File is too large. Maximum size is ${MAX_FILE_SIZE_LABEL}.`,
    };
  }

  if (file.size === 0) {
    return { valid: false, error: 'File is empty.' };
  }

  return { valid: true, error: null };
}
