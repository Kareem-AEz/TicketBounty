export type ProcessFilesProps = {
  existingFiles?: ProcessedFile[];
  newFiles: File[];
  config: {
    maxFiles: number;
    maxSize: number;
    acceptedTypes: string[];
  };
};

export type ProcessedFile = {
  file: File;
  uint8Array: Uint8Array;
  hash: string;
  mimeType: string;
};

export type ProcessedFileWithPreview = ProcessedFile & {
  objectUrl: string;
};
