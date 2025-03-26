
import { useState, useRef, useEffect } from 'react';
import { Camera, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MealCameraPreviewProps {
  onCapture: (file: File) => void;
  onCancel: () => void;
}

const MealCameraPreview = ({ onCapture, onCancel }: MealCameraPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 } 
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setStreamActive(true);
        }
      } catch (err: any) {
        console.error('Camera access error:', err);
        setError(err.message || 'Failed to access camera');
      }
    };
    
    startCamera();
    
    // Cleanup function to stop the camera when component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  const handleCapture = () => {
    if (!canvasRef.current || !videoRef.current) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current video frame to canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to file
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `meal-capture-${Date.now()}.jpeg`, { type: 'image/jpeg' });
        onCapture(file);
      }
    }, 'image/jpeg', 0.9);
  };
  
  return (
    <div className="relative w-full overflow-hidden rounded-xl bg-black animate-fade-in">
      {error ? (
        <div className="flex flex-col items-center justify-center p-8 bg-red-50 text-red-800 rounded-xl h-64">
          <p className="mb-4 text-center">{error}</p>
          <Button variant="outline" onClick={onCancel}>Go Back</Button>
        </div>
      ) : (
        <>
          <video 
            ref={videoRef}
            autoPlay 
            playsInline 
            muted
            className="w-full h-auto"
          />
          
          <canvas ref={canvasRef} className="hidden" />
          
          <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
              onClick={onCancel}
            >
              <X className="h-5 w-5" />
            </Button>
            
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white"
              onClick={handleCapture}
              disabled={!streamActive}
            >
              <Camera className="h-6 w-6" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default MealCameraPreview;
