"use client";

import { useCallback, useState } from "react";
import type { UploadState } from "@/lib/types";
import {
  MAX_FILE_SIZE,
  MAX_FILE_SIZE_LABEL,
  SUPPORTED_FILE_TYPES,
} from "@/lib/constants";

const INITIAL_STATE: UploadState = {
  file: null,
  progress: 0,
  status: "idle",
  error: null,
};

/**
 * Manages file upload state — selection, validation, progress, and reset.
 *
 * @example
 * const { file, progress, status, error, selectFile, reset } = useUpload();
 */
export function useUpload() {
  const [state, setState] = useState<UploadState>(INITIAL_STATE);

  /**
   * Validate and select a file for upload.
   * Sets an error if the file exceeds size limits or has an unsupported type.
   */
  const selectFile = useCallback((file: File | null) => {
    if (!file) {
      setState(INITIAL_STATE);
      return;
    }

    // Size check
    if (file.size > MAX_FILE_SIZE) {
      setState({
        file: null,
        progress: 0,
        status: "error",
        error: `File exceeds the ${MAX_FILE_SIZE_LABEL} size limit.`,
      });
      return;
    }

    // Type check
    const isSupported = (SUPPORTED_FILE_TYPES as readonly string[]).includes(
      file.type
    );
    if (!isSupported) {
      setState({
        file: null,
        progress: 0,
        status: "error",
        error: `Unsupported file type: ${file.type || "unknown"}. Please upload a PDF, text, Word, or image file.`,
      });
      return;
    }

    setState({
      file,
      progress: 0,
      status: "idle",
      error: null,
    });
  }, []);

  /**
   * Update the upload progress (0–100).
   */
  const setProgress = useCallback((progress: number) => {
    setState((prev) => ({
      ...prev,
      progress: Math.min(100, Math.max(0, progress)),
      status: progress >= 100 ? "processing" : "uploading",
    }));
  }, []);

  /**
   * Mark the upload as complete.
   */
  const setComplete = useCallback(() => {
    setState((prev) => ({
      ...prev,
      progress: 100,
      status: "complete",
      error: null,
    }));
  }, []);

  /**
   * Set an error state with a message.
   */
  const setError = useCallback((error: string) => {
    setState((prev) => ({
      ...prev,
      status: "error",
      error,
    }));
  }, []);

  /**
   * Reset all upload state back to initial.
   */
  const reset = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  return {
    /** The currently selected file */
    file: state.file,
    /** Upload progress (0–100) */
    progress: state.progress,
    /** Current upload status */
    status: state.status,
    /** Error message, if any */
    error: state.error,
    /** Select / validate a file */
    selectFile,
    /** Update progress percentage */
    setProgress,
    /** Mark upload complete */
    setComplete,
    /** Set error message */
    setError,
    /** Reset to initial state */
    reset,
  };
}
