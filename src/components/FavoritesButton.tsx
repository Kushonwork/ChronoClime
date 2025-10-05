import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

interface FavoritesButtonProps {
  onClick: () => void;
}

export default function FavoritesButton({ onClick }: FavoritesButtonProps) {
  return (
    <motion.button
      className="relative p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-200"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Heart size={24} className="text-marigold" />
      
      {/* Subtle pulse animation */}
      <motion.div
        className="absolute inset-0 rounded-full bg-marigold opacity-10"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </motion.button>
  );
}

