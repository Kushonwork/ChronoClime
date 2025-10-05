import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface WeatherBackgroundProps {
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'partly-cloudy';
}

export default function WeatherBackground({ condition }: WeatherBackgroundProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; delay: number }>>([]);

  useEffect(() => {
    if (condition === 'rainy' || condition === 'snowy' || condition === 'stormy') {
      const particleCount = condition === 'stormy' ? 40 : 30;
      const newParticles = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 2,
      }));
      setParticles(newParticles);
    } else {
      setParticles([]);
    }
  }, [condition]);

  const getSunGlow = () => {
    if (condition === 'sunny') {
      return (
        <motion.div
          className="absolute top-20 right-20 w-64 h-64 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(255,195,0,0.3) 0%, rgba(255,195,0,0) 70%)',
          }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      );
    }
    return null;
  };

  const getClouds = () => {
    if (condition === 'cloudy' || condition === 'partly-cloudy') {
      return (
        <>
          {[0, 1, 2].map(i => (
            <motion.div
              key={`cloud-${i}`}
              className="absolute w-32 h-16 rounded-full bg-gray-200"
              style={{
                top: `${20 + i * 15}%`,
                left: `${10 + i * 30}%`,
                opacity: 0.15,
              }}
              animate={{
                x: [0, 100, 0],
              }}
              transition={{
                duration: 20 + i * 5,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          ))}
        </>
      );
    }
    return null;
  };

  const getParticles = () => {
    if (particles.length === 0) return null;

    const particleColor = condition === 'snowy' ? '#e0e0e0' : '#5a9fd4';
    const particleWidth = condition === 'snowy' ? 4 : 2;

    return (
      <>
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            className="absolute"
            style={{
              left: `${particle.x}%`,
              top: -20,
              width: particleWidth,
              height: condition === 'snowy' ? 4 : 20,
              background: particleColor,
              borderRadius: condition === 'snowy' ? '50%' : '0',
            }}
            animate={{
              y: ['0vh', '110vh'],
              x: condition === 'stormy' ? [0, -20, 20, 0] : 0,
            }}
            transition={{
              duration: condition === 'stormy' ? 1.5 : 2,
              delay: particle.delay,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
      </>
    );
  };

  return (
    <div className="weather-animation-bg">
      {getSunGlow()}
      {getClouds()}
      {getParticles()}
    </div>
  );
}
