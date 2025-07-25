import { type DragEvent, useState } from "react";

type FileDropzoneProps = {
  onFileSelect: (file: File) => void;
};

export const FileDropzone = ({ onFileSelect }: FileDropzoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 허용된 MIME 타입 목록
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ];

  // 허용된 파일 확장자 (file.name 검사용)
  const allowedExtensions = [
    ".pdf",
    ".doc",
    ".docx",
    ".ppt",
    ".pptx",
    ".xls",
    ".xlsx",
  ];

  // 최대 파일 크기: 20MB
  const MAX_FILE_SIZE_MB = 20;
  const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

  // 파일 유효성 검사 함수
  const validateFile = (file: File): string | null => {
    const typeValid = allowedTypes.includes(file.type);
    const extValid = allowedExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext),
    );
    const sizeValid = file.size <= MAX_FILE_SIZE;

    if (!typeValid && !extValid) {
      return "지원하지 않는 파일 형식입니다. (PDF, Word, Excel, PowerPoint만 허용)";
    }

    if (!sizeValid) {
      return `파일 크기가 너무 큽니다. 최대 ${MAX_FILE_SIZE_MB}MB까지만 업로드 가능합니다.`;
    }

    return null;
  };

  // 드래그 앤 드롭 처리
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const errorMessage = validateFile(file);
    if (errorMessage) {
      setError(errorMessage);
      return;
    }

    setError(null);
    onFileSelect(file);
  };

  // 클릭 업로드 처리
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const errorMessage = validateFile(file);
    if (errorMessage) {
      setError(errorMessage);
      return;
    }

    setError(null);
    onFileSelect(file);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`mt-3 flex h-30 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center transition ${
        isDragging ? "border-blue-500 bg-blue-50" : "max-w-xl border-gray-300"
      } `}
    >
      <p className="text-base text-gray-700">
        Drag and drop a document file here
      </p>
      <p className="mt-1 text-sm text-gray-500">
        or click to browse (Max {MAX_FILE_SIZE_MB}MB)
      </p>

      <label className="mt-2 inline-block cursor-pointer text-sm text-blue-600 underline">
        Select a file
        <input
          type="file"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
};
