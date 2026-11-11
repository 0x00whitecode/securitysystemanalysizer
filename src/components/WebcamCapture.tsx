import { Camera, Upload, Video, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface WebcamCaptureProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (photo: string, video?: string) => void;
}

export function WebcamCapture({ isOpen, onClose, onCapture }: WebcamCaptureProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const [status, setStatus] = useState('Ready');
  const [photo, setPhoto] = useState<string | null>(null);
  const [recording, setRecording] = useState(false);
  const [fallbackMode, setFallbackMode] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const enableCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setStatus('Camera active');
      } catch {
        setStatus('Camera unavailable');
        setFallbackMode(true);
      }
    };

    enableCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [isOpen]);

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setPhoto(dataUrl);
    setStatus('Photo captured');
    onCapture(dataUrl);
    onClose();
  };

  const startRecording = () => {
    if (!streamRef.current) return;

    const recorder = new MediaRecorder(streamRef.current, { mimeType: 'video/webm' });
    chunksRef.current = [];
    mediaRecorderRef.current = recorder;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        onCapture(photo ?? '', dataUrl);
        onClose();
      };
      reader.readAsDataURL(blob);
    };

    recorder.start();
    setRecording(true);
    setStatus('Recording...');

    setTimeout(() => {
      recorder.stop();
      setRecording(false);
      setStatus('Video captured');
    }, 5000);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPhoto(result);
      onCapture(result);
      setStatus('Uploaded fallback image');
      onClose();
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-700 bg-slate-900 p-5 text-white shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-blue-300">Capture Media</p>
            <h3 className="mt-1 text-xl font-semibold">Visitor verification</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-700 p-2 text-slate-300 hover:bg-slate-800"
            aria-label="Close capture panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-950">
          <video ref={videoRef} autoPlay muted playsInline className="h-[320px] w-full object-cover" />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={capturePhoto}
            className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500"
          >
            <Camera className="h-4 w-4" />
            Capture photo
          </button>
          <button
            type="button"
            onClick={startRecording}
            disabled={recording}
            className="inline-flex items-center gap-2 rounded-full border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Video className="h-4 w-4" />
            {recording ? 'Recording...' : 'Record 5s clip'}
          </button>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-100 hover:bg-slate-800">
            <Upload className="h-4 w-4" />
            Upload photo
            <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
          </label>
        </div>

        <div className="mt-4 flex items-center justify-between rounded-2xl bg-slate-800 px-3 py-2 text-sm">
          <span className="text-slate-300">Status: {status}</span>
          {fallbackMode && (
            <span className="rounded-full bg-amber-500/20 px-2 py-1 text-xs font-semibold text-amber-300">
              Fallback mode
            </span>
          )}
        </div>

        {photo && (
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-700 bg-slate-800 p-2">
            <img src={photo} alt="Captured visitor" className="h-28 w-full rounded-xl object-cover" />
          </div>
        )}
      </div>
    </div>
  );
}
