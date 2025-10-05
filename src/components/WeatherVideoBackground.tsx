import { useEffect, useRef } from 'react';

interface WeatherVideoBackgroundProps {
  condition: string;
  className?: string;
}

export default function WeatherVideoBackground({ condition, className = '' }: WeatherVideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const getVideoSource = (weatherCondition: string): string => {
    switch (weatherCondition) {
      case 'sunny':
        return '/videos/sun.mp4';
      case 'rainy':
      case 'stormy':
        return '/videos/rain.mp4';
      case 'cloudy':
      case 'partly-cloudy':
        return '/videos/clouds.mp4';
      case 'snowy':
        return '/videos/rain.mp4';
      default:
        return '/videos/sun.mp4';
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.controls = false;
      
      video.play().catch(() => {
        // Silently handle autoplay failures
      });
    }
  }, [condition]);

  return (
    <div 
      className={`absolute inset-0 ${className}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1,
        backgroundColor: condition === 'sunny' ? '#fef3c7' : condition === 'rainy' ? '#dbeafe' : '#f3f4f6'
      }}
    >
      <video
        ref={videoRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 0.6,
          zIndex: 1
        }}
        muted
        loop
        playsInline
        autoPlay
        preload="auto"
      >
        <source src={getVideoSource(condition)} type="video/mp4" />
      </video>
      
    </div>
  );
}