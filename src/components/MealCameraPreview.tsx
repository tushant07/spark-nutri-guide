
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
        // Try to get the highest quality camera feed available
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            facingMode: 'environment',
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            aspectRatio: { ideal: 1.7778 },
            frameRate: { ideal: 30 }
          } 
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setStreamActive(true);
        }
      } catch (err: any) {
        console.error('Camera access error:', err);
        setError(err.message || 'Failed to access camera');
        
        // Try fallback to any available camera if the high-quality one failed
        if (err.name === 'OverconstrainedError' || err.name === 'NotFoundError') {
          try {
            stream = await navigator.mediaDevices.getUserMedia({ 
              video: true
            });
            
            if (videoRef.current) {
              videoRef.current.srcObject = stream;
              setStreamActive(true);
            }
          } catch (fallbackErr: any) {
            console.error('Fallback camera access error:', fallbackErr);
            setError(fallbackErr.message || 'Failed to access any camera');
          }
        }
      }
    };
    
    startCamera();
    
    // Cleanup function to stop the camera when component unmounts
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => {
          track.stop();
        });
      }
    };
  }, []);
  
  const handleCapture = () => {
    if (!canvasRef.current || !videoRef.current) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    // Set canvas dimensions to match video with high quality
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw current video frame to canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Draw with a minor sharpening filter to improve food recognition
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.filter = 'contrast(1.1) saturate(1.2)';
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to file with higher quality
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `meal-capture-${Date.now()}.jpeg`, { 
          type: 'image/jpeg' 
        });
        onCapture(file);
      } else {
        setError('Failed to capture image. Please try again.');
      }
    }, 'image/jpeg', 0.95); // High quality for better analysis
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
          
          <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-between bg-gradient-to-t from-black/70 to-transparent">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white text-black"
              onClick={onCancel}
            >
              <X className="h-5 w-5" />
            </Button>
            
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full bg-white/80 backdrop-blur-sm hover:bg-white text-black"
              onClick={handleCapture}
              disabled={!streamActive}
            >
              <Camera className="h-6 w-6" />
            </Button>
          </div>
          
          <div className="absolute top-0 left-0 right-0 p-4 text-center">
            <div className="inline-block px-3 py-1 bg-black/50 text-white text-sm rounded-full backdrop-blur-sm">
              Position food in the center
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MealCameraPreview;
