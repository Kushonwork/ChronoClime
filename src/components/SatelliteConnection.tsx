import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SatelliteConnectionProps {
  isConnecting: boolean;
  isConnected: boolean;
  hasLocation: boolean;
  location?: string;
  error?: string;
  onComplete?: () => void;
  className?: string;
}

export default function SatelliteConnection({
  isConnecting,
  isConnected,
  hasLocation,
  location,
  error,
  onComplete,
  className = ''
}: SatelliteConnectionProps) {
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    if (isConnecting) {
      setShowAnimation(true);
      setAnimationStep(0);
    } else if (isConnected && hasLocation) {
      setAnimationStep(3); // Success state
      setTimeout(() => {
        setShowAnimation(false);
        onComplete?.();
      }, 2000);
    } else if (error) {
      setAnimationStep(4); // Error state
      setTimeout(() => {
        setShowAnimation(false);
      }, 3000);
    }
  }, [isConnecting, isConnected, hasLocation, error, onComplete]);

  const getAnimationText = () => {
    switch (animationStep) {
      case 0: return '🛰️ Connecting to satellite...';
      case 1: return '📡 Establishing secure link...';
      case 2: return '📍 Acquiring location data...';
      case 3: return `✅ Connected! Location: ${location || 'Unknown'}`;
      case 4: return `❌ Connection failed: ${error || 'Unknown error'}`;
      default: return '🛰️ Connecting...';
    }
  };

  const getAnimationColor = () => {
    if (error) return 'text-red-500';
    if (isConnected && hasLocation) return 'text-green-500';
    return 'text-blue-500';
  };

  return (
    <AnimatePresence>
      {showAnimation && (
        <motion.div
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 ${className}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="bg-white rounded-2xl p-8 max-w-md mx-4 text-center shadow-2xl"
            initial={{ scale: 0.8, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: 50 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {/* Satellite Animation */}
            <div className="relative mb-6">
              <motion.div
                className="w-16 h-16 mx-auto mb-4"
                animate={{
                  rotate: isConnecting ? 360 : 0,
                  scale: isConnecting ? [1, 1.1, 1] : 1
                }}
                transition={{
                  rotate: { duration: 2, repeat: isConnecting ? Infinity : 0 },
                  scale: { duration: 1, repeat: isConnecting ? Infinity : 0 }
                }}
              >
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {/* Satellite dish */}
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="35"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="3"
                    animate={{
                      strokeDasharray: isConnecting ? ["0 220", "110 110", "220 0"] : "0 220"
                    }}
                    transition={{
                      duration: 2,
                      repeat: isConnecting ? Infinity : 0
                    }}
                  />
                  
                  {/* Signal waves */}
                  {isConnecting && (
                    <>
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#3B82F6"
                        strokeWidth="1"
                        opacity="0.6"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.6, 0, 0.6]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity
                        }}
                      />
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="55"
                        fill="none"
                        stroke="#3B82F6"
                        strokeWidth="1"
                        opacity="0.4"
                        animate={{
                          scale: [1, 1.3, 1],
                          opacity: [0.4, 0, 0.4]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: 0.5
                        }}
                      />
                    </>
                  )}
                  
                  {/* Center dot */}
                  <circle cx="50" cy="50" r="8" fill="#3B82F6" />
                  
                  {/* Connection lines */}
                  {isConnecting && (
                    <motion.line
                      x1="50"
                      y1="50"
                      x2="85"
                      y2="15"
                      stroke="#3B82F6"
                      strokeWidth="2"
                      animate={{
                        opacity: [0, 1, 0]
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity
                      }}
                    />
                  )}
                </svg>
              </motion.div>
              
              {/* Progress dots */}
              <div className="flex justify-center space-x-2">
                {[0, 1, 2].map((index) => (
                  <motion.div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      animationStep > index ? 'bg-green-500' : 
                      animationStep === index ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                    animate={{
                      scale: animationStep === index ? [1, 1.2, 1] : 1
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: animationStep === index ? Infinity : 0
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Status Text */}
            <motion.div
              className={`text-lg font-semibold ${getAnimationColor()}`}
              key={animationStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {getAnimationText()}
            </motion.div>

            {/* Progress Bar */}
            {isConnecting && (
              <div className="mt-6">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-blue-500 h-2 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3, ease: "easeInOut" }}
                  />
                </div>
              </div>
            )}

            {/* Success Animation */}
            {isConnected && hasLocation && (
              <motion.div
                className="mt-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
              >
                <div className="text-green-500 text-4xl">🎉</div>
                <div className="text-sm text-gray-600 mt-2">
                  Weather data synchronized!
                </div>
              </motion.div>
            )}

            {/* Error Animation */}
            {error && (
              <motion.div
                className="mt-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
              >
                <div className="text-red-500 text-4xl">⚠️</div>
                <div className="text-sm text-gray-600 mt-2">
                  Please check your connection
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
