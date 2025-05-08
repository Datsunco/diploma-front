import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PhotoGalleryProps {
  photos: string[];
  onRemove: (index: number) => void;
}

const PhotoGallery: React.FC<PhotoGalleryProps> = ({ photos, onRemove }) => {
  if (photos.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
      {photos.map((photo, index) => (
        <Card key={index} className="relative overflow-hidden group">
          <CardContent className="p-0">
            <img
              src={photo}
              alt={`Photo ${index + 1}`}
              className="w-full aspect-square object-cover"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onRemove(index)}
            >
              <X className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PhotoGallery;
