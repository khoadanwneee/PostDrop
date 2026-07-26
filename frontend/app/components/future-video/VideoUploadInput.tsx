import { useRef, type ChangeEvent, type ReactElement } from 'react';

interface VideoUploadInputProps {
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export function VideoUploadInput({
  onFileSelected,
  disabled = false,
}: VideoUploadInputProps): ReactElement {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (evt: ChangeEvent<HTMLInputElement>) => {
    const file = evt.target.files?.[0];
    if (file) {
      onFileSelected(file);
      // Reset input value so re-selecting same file triggers onChange
      evt.target.value = '';
    }
  };

  return (
    <input
      ref={fileInputRef}
      type="file"
      className="hidden-video-file-input"
      accept="video/mp4,video/webm,video/quicktime"
      style={{ display: 'none' }}
      onChange={handleFileChange}
      disabled={disabled}
    />
  );
}
