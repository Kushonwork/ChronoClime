import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, Snowflake, Wind } from 'lucide-react';

interface WeatherHoverBackgroundProps {
  condition: string;
  isActive: boolean;
  className?: string;
}

export default function WeatherHoverBackground({ 
  condition, 
  isActive, 
  className = '' 
}: WeatherHoverBackgroundProps) {
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (isActive) {
      setAnimationKey(prev => prev + 1);
    }
  }, [isActive]);

  const getWeatherConfig = () => {
    switch (condition) {
      case 'sunny':
        return {
          background: 'from-yellow-200 via-orange-200 to-yellow-300',
          elements: (
            <div className="absolute inset-0 overflow-hidden">
              {/* Sun rays */}
              <motion.div
                key={`sun-rays-${animationKey}`}
                className="absolute top-4 right-4"
                initial={{ scale: 0, rotate: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sun size={40} className="text-yellow-500" />
              </motion.div>
              
              {/* Sun rays animation */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={`ray-${i}-${animationKey}`}
                  className="absolute w-1 h-8 bg-yellow-400 rounded-full"
                  style={{
                    top: '20px',
                    right: '20px',
                    transformOrigin: 'bottom center',
                    transform: `rotate(${i * 45}deg) translateY(-20px)`
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    delay: i * 0.1, 
                    duration: 0.5,
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
              ))}
            </div>
          )
        };

      case 'cloudy':
      case 'partly-cloudy':
        return {
          background: 'from-gray-200 via-gray-300 to-gray-400',
          elements: (
            <div className="absolute inset-0 overflow-hidden">
              {/* Floating clouds */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={`cloud-${i}-${animationKey}`}
                  className="absolute"
                  style={{
                    top: `${20 + i * 25}%`,
                    left: `${-20 + i * 40}%`,
                  }}
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 120, opacity: 1 }}
                  transition={{
                    duration: 8 + i * 2,
                    repeat: Infinity,
                    delay: i * 2,
                    ease: "linear"
                  }}
                >
                  <Cloud size={30 + i * 10} className="text-gray-500" />
                </motion.div>
              ))}
            </div>
          )
        };

      case 'rainy':
        return {
          background: 'from-blue-200 via-blue-300 to-blue-400',
          elements: (
            <div className="absolute inset-0 overflow-hidden">
              {/* Rain drops */}
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={`rain-${i}-${animationKey}`}
                  className="absolute w-0.5 h-4 bg-blue-400 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: '-20px'
                  }}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 120, opacity: 1 }}
                  transition={{
                    duration: 0.8 + Math.random() * 0.4,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                    ease: "linear"
                  }}
                />
              ))}
              
              {/* Rain cloud */}
              <motion.div
                key={`rain-cloud-${animationKey}`}
                className="absolute top-2 right-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <CloudRain size={35} className="text-blue-600" />
              </motion.div>
            </div>
          )
        };

      case 'stormy':
        return {
          background: 'from-gray-300 via-gray-400 to-gray-600',
          elements: (
            <div className="absolute inset-0 overflow-hidden">
              {/* Lightning effect */}
              <motion.div
                key={`lightning-${animationKey}`}
                className="absolute top-2 right-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{
                  duration: 0.2,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
              >
                <CloudRain size={35} className="text-gray-700" />
              </motion.div>
              
              {/* Heavy rain */}
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={`storm-rain-${i}-${animationKey}`}
                  className="absolute w-0.5 h-6 bg-gray-500 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: '-20px'
                  }}
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 120, opacity: 1 }}
                  transition={{
                    duration: 0.5 + Math.random() * 0.3,
                    repeat: Infinity,
                    delay: Math.random() * 1,
                    ease: "linear"
                  }}
                />
              ))}
            </div>
          )
        };

      case 'snowy':
        return {
          background: 'from-blue-100 via-blue-200 to-white',
          elements: (
            <div className="absolute inset-0 overflow-hidden">
              {/* Snowflakes */}
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={`snow-${i}-${animationKey}`}
                  className="absolute"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: '-20px'
                  }}
                  initial={{ y: -20, opacity: 0, rotate: 0 }}
                  animate={{ 
                    y: 120, 
                    opacity: 1, 
                    rotate: 360 
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 3,
                    ease: "linear"
                  }}
                >
                  <Snowflake size={12 + Math.random() * 8} className="text-blue-300" />
                </motion.div>
              ))}
            </div>
          )
        };

      default:
        return {
          background: 'from-gray-100 via-gray-200 to-gray-300',
          elements: (
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                key={`default-${animationKey}`}
                className="absolute top-4 right-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Wind size={30} className="text-gray-500" />
              </motion.div>
            </div>
          )
        };
    }
  };

  const config = getWeatherConfig();

  if (!isActive) return null;

  return (
    <motion.div
      className={`absolute inset-0 rounded-lg overflow-hidden pointer-events-none ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Background gradient */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${config.background}`}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5 }}
      />
      
      {/* Weather elements */}
      {config.elements}
    </motion.div>
  );
}
