// src/components/tasks/ImageUploader.tsx
import React, { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Image, Upload } from "lucide-react";

interface ImageUploaderProps {
  onUpload: (imageData: string) => void;
  isLoading?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUpload,
  isLoading,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Проверка типа файла
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Проверка размера файла (5MB максимум)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size should not exceed 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        onUpload(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);

    // Сбрасываем input, чтобы можно было загрузить тот же файл снова
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <Button variant="outline" onClick={handleClick} disabled={isLoading}>
        <Upload className="h-4 w-4 mr-2" />
        Upload Image
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: "none" }}
      />
    </>
  );
};

export default ImageUploader;
