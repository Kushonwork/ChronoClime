import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, Satellite, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import { esp8266CSVService, ESP8266CSVConnectionState } from '../services/esp8266CSVService';

interface ESP8266StatusProps {
  className?: string;
  showDetails?: boolean;
}

export default function ESP8266Status({ className = '', showDetails = false }: ESP8266StatusProps) {
  const [connectionState, setConnectionState] = useState<ESP8266CSVConnectionState>({
    isConnecting: false,
    isConnected: false,
    hasLocation: false
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [manualIP, setManualIP] = useState('');
  const [showManualConfig, setShowManualConfig] = useState(false);

  useEffect(() => {
    // Add listener for connection state changes
    const handleStateChange = (state: ESP8266CSVConnectionState) => {
      setConnectionState(state);
    };

    esp8266CSVService.addStateListener(handleStateChange);
    
    // Get initial state
    setConnectionState(esp8266CSVService.getConnectionState());

    return () => {
      esp8266CSVService.removeStateListener(handleStateChange);
    };
  }, []);

  const getStatusIcon = () => {
    if (connectionState.isConnecting) {
      return <Satellite className="w-4 h-4 text-blue-500 animate-pulse" />;
    } else if (connectionState.isConnected && connectionState.hasLocation) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else if (connectionState.isConnected) {
      return <Wifi className="w-4 h-4 text-blue-500" />;
    } else if (connectionState.error) {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    } else {
      return <WifiOff className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = () => {
    if (connectionState.isConnecting) {
      return 'Connecting...';
    } else if (connectionState.isConnected && connectionState.hasLocation) {
      return 'ESP8266 Ready';
    } else if (connectionState.isConnected) {
      return 'ESP8266 Connected';
    } else {
      return 'ESP8266 Offline';
    }
  };

  const getStatusColor = () => {
    if (connectionState.isConnecting) {
      return 'text-blue-500';
    } else if (connectionState.isConnected && connectionState.hasLocation) {
      return 'text-green-500';
    } else if (connectionState.isConnected) {
      return 'text-blue-500';
    } else {
      return 'text-gray-400';
    }
  };

  const getBackgroundColor = () => {
    if (connectionState.isConnecting) {
      return 'bg-blue-50 border-blue-200';
    } else if (connectionState.isConnected && connectionState.hasLocation) {
      return 'bg-green-50 border-green-200';
    } else if (connectionState.isConnected) {
      return 'bg-blue-50 border-blue-200';
    } else {
      return 'bg-gray-50 border-gray-200';
    }
  };

  const handleConnect = async () => {
    try {
      // Use simulation for Faridabad, Delhi
      const locationData = await esp8266CSVService.simulateSatelliteConnection();
      
      // Manually trigger weather loading for Faridabad, Delhi
      if (locationData && locationData.location) {
        console.log('🛰️ ESP8266 connected, loading weather for:', locationData.location);
        // Trigger weather loading by calling the parent's location handler
        // This will be handled by the parent component
        window.dispatchEvent(new CustomEvent('esp8266LocationReceived', { 
          detail: { location: locationData.location } 
        }));
      }
    } catch (error) {
      console.error('Failed to connect to ESP8266:', error);
    }
  };

  const handleManualIPSubmit = () => {
    if (manualIP.trim()) {
      esp8266Service.setESP8266IP(manualIP.trim());
      setShowManualConfig(false);
      setManualIP('');
      // Try to connect after setting IP
      handleConnect();
    }
  };

  const handleResetDiscovery = () => {
    esp8266Service.resetDiscovery();
    handleConnect();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main Status Button */}
      <motion.button
        className={`
          flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-200
          ${getBackgroundColor()}
          hover:shadow-md
        `}
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {getStatusIcon()}
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
        {connectionState.hasLocation && (
          <MapPin className="w-3 h-3 text-green-500" />
        )}
      </motion.button>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-gray-800">ESP8266 Gateway</h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            {/* Status Details */}
            <div className="space-y-3">
              {/* Connection Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Connection:</span>
                <div className="flex items-center space-x-2">
                  {getStatusIcon()}
                  <span className={`text-sm font-medium ${getStatusColor()}`}>
                    {getStatusText()}
                  </span>
                </div>
              </div>

              {/* Location Status */}
              {connectionState.hasLocation && connectionState.location && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Location:</span>
                  <span className="text-sm font-medium text-green-600">
                    {connectionState.location}
                  </span>
                </div>
              )}


              {/* Action Buttons */}
              <div className="flex space-x-2 pt-2">
                {!connectionState.isConnected && (
                  <button
                    onClick={handleConnect}
                    disabled={connectionState.isConnecting}
                    className={`
                      flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${connectionState.isConnecting 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                      }
                    `}
                  >
                    {connectionState.isConnecting ? 'Connecting...' : 'Connect'}
                  </button>
                )}

                {connectionState.isConnected && !connectionState.hasLocation && (
                  <button
                    onClick={handleConnect}
                    className="flex-1 px-3 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-colors"
                  >
                    Get Location
                  </button>
                )}

                {connectionState.isConnected && connectionState.hasLocation && (
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    Close
                  </button>
                )}
              </div>

              {/* Manual IP Configuration */}
              {!connectionState.isConnected && (
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setShowManualConfig(!showManualConfig)}
                      className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                    >
                      {showManualConfig ? 'Hide' : 'Manual IP'}
                    </button>
                    <button
                      onClick={handleResetDiscovery}
                      className="flex-1 px-3 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors"
                    >
                      Reset Discovery
                    </button>
                  </div>

                  {showManualConfig && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-yellow-800 mb-2">Manual IP Configuration:</h4>
                      <div className="space-y-2">
                        <input
                          type="text"
                          placeholder="192.168.1.XXX"
                          value={manualIP}
                          onChange={(e) => setManualIP(e.target.value)}
                          className="w-full px-3 py-2 border border-yellow-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                        />
                        <button
                          onClick={handleManualIPSubmit}
                          disabled={!manualIP.trim()}
                          className="w-full px-3 py-2 bg-yellow-500 text-white rounded-lg text-sm font-medium hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                        >
                          Set IP & Connect
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">Setup Instructions:</h4>
                    <ol className="text-xs text-blue-700 space-y-1">
                      <li>1. Power on your ESP8266 device</li>
                      <li>2. Check Serial Monitor for IP address</li>
                      <li>3. Use "Manual IP" to set ESP8266 IP</li>
                      <li>4. Or let auto-discovery find it</li>
                    </ol>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
