import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Twitter, Facebook, Linkedin, MessageCircle, Mail, Copy, Check, X } from 'lucide-react';
import { ShareableContent, shareToTwitter, shareToFacebook, shareToLinkedIn, shareToWhatsApp, shareViaEmail, copyToClipboard, nativeShare, isSharingSupported } from '../services/sharingService';

interface ShareButtonProps {
  content: ShareableContent;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'ghost';
}

export default function ShareButton({ 
  content, 
  className = '', 
  size = 'md',
  variant = 'primary' 
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24
  };

  const handleNativeShare = async () => {
    setIsSharing(true);
    try {
      const success = await nativeShare(content);
      if (success) {
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Native sharing failed:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopy = async () => {
    setIsSharing(true);
    try {
      const success = await copyToClipboard(content);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        setIsOpen(false);
      }
    } catch (error) {
      console.error('Copy failed:', error);
    } finally {
      setIsSharing(false);
    }
  };

  const shareOptions = [
    {
      name: 'Twitter',
      icon: Twitter,
      action: () => shareToTwitter(content),
      color: 'text-blue-500 hover:bg-blue-50'
    },
    {
      name: 'Facebook',
      icon: Facebook,
      action: () => shareToFacebook(content),
      color: 'text-blue-600 hover:bg-blue-50'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      action: () => shareToLinkedIn(content),
      color: 'text-blue-700 hover:bg-blue-50'
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      action: () => shareToWhatsApp(content),
      color: 'text-green-500 hover:bg-green-50'
    },
    {
      name: 'Email',
      icon: Mail,
      action: () => shareViaEmail(content),
      color: 'text-gray-600 hover:bg-gray-50'
    },
    {
      name: copied ? 'Copied!' : 'Copy Link',
      icon: copied ? Check : Copy,
      action: handleCopy,
      color: copied ? 'text-green-600 hover:bg-green-50' : 'text-gray-600 hover:bg-gray-50'
    }
  ];

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSharing}
        className={`
          ${sizeClasses[size]}
          flex items-center justify-center rounded-full transition-all duration-200
          ${variant === 'primary' ? 'bg-marigold text-white hover:bg-marigold/90' : ''}
          ${variant === 'secondary' ? 'bg-peacock text-white hover:bg-peacock/90' : ''}
          ${variant === 'ghost' ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : ''}
          disabled:opacity-50 disabled:cursor-not-allowed
          shadow-sm hover:shadow-md
        `}
      >
        {isSharing ? (
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <Share2 size={iconSizes[size]} />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            
            {/* Share Menu */}
            <motion.div
              className="absolute right-0 top-12 z-50 bg-white rounded-xl shadow-lg border border-gray-200 py-2 min-w-48"
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              {/* Native Share Option */}
              {isSharingSupported() && (
                <button
                  onClick={handleNativeShare}
                  disabled={isSharing}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 text-sm font-medium"
                >
                  <Share2 size={16} className="text-marigold" />
                  <span>Share via Device</span>
                </button>
              )}
              
              {/* Divider */}
              {isSharingSupported() && <div className="border-t border-gray-100 my-1" />}
              
              {/* Social Media Options */}
              {shareOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => {
                    option.action();
                    setIsOpen(false);
                  }}
                  disabled={isSharing}
                  className={`
                    w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 text-sm font-medium
                    ${option.color}
                    disabled:opacity-50 disabled:cursor-not-allowed
                  `}
                >
                  <option.icon size={16} />
                  <span>{option.name}</span>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
