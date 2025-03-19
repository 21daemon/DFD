
import React, { useState, useRef } from 'react';
import { Upload, X, FileVideo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface VideoUploaderProps {
  onVideoSelect: (file: File) => void;
}

const VideoUploader: React.FC<VideoUploaderProps> = ({ onVideoSelect }) => {
  const [dragActive, setDragActive] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('video/')) {
      toast.error('Please upload a video file');
      return;
    }
    
    if (file.size > 100 * 1024 * 1024) { // 100MB
      toast.error('Video file is too large. Please upload a file smaller than 100MB');
      return;
    }
    
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    onVideoSelect(file);
    toast.success('Video uploaded successfully');
  };

  const clearVideo = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideoFile(null);
    setVideoPreview(null);
    
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {!videoFile ? (
        <div
          className={cn(
            "flex flex-col items-center justify-center w-full h-64 p-6 border-2 border-dashed rounded-xl transition-all animate-in",
            dragActive 
              ? "border-primary bg-primary/5" 
              : "border-border bg-muted/50 hover:bg-muted"
          )}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center text-center">
            <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
            <p className="mb-2 text-lg font-medium">Drag and drop your video</p>
            <p className="mb-4 text-sm text-muted-foreground">
              or click to browse (MP4, WebM, Ogg up to 100MB)
            </p>
            <Button 
              onClick={() => inputRef.current?.click()}
              className="button-hover"
            >
              <FileVideo className="w-4 h-4 mr-2" />
              Select Video
            </Button>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileChange(e.target.files[0]);
              }
            }}
          />
        </div>
      ) : (
        <Card className="overflow-hidden animate-scale-in">
          <div className="relative">
            <video 
              src={videoPreview!} 
              controls 
              className="w-full h-auto rounded-t-lg"
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2 opacity-80 hover:opacity-100 transition-opacity"
              onClick={clearVideo}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="p-4">
            <p className="font-medium mb-1 truncate">{videoFile.name}</p>
            <p className="text-sm text-muted-foreground">
              {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default VideoUploader;
