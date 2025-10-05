import { motion } from 'framer-motion';
import { Share2, Download, Calendar, MapPin, Star, Clock, CheckCircle } from 'lucide-react';
import ShareButton from './ShareButton';
import { generateActivityShareContent, ActivityShareData } from '../services/sharingService';

interface ActivityShareProps {
  activity: string;
  location: string;
  startDate: string;
  endDate: string;
  optimalConditions: string;
  acisScore: number;
  className?: string;
}

export default function ActivityShare({ 
  activity, 
  location, 
  startDate, 
  endDate, 
  optimalConditions,
  acisScore,
  className = '' 
}: ActivityShareProps) {
  const shareData: ActivityShareData = {
    activity,
    location,
    startDate,
    endDate,
    optimalConditions,
    acisScore
  };

  const shareContent = generateActivityShareContent(shareData);

  const downloadActivityPlan = () => {
    const plan = generateActivityPlan(shareData);
    const blob = new Blob([plan], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activity-plan-${activity.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatDateRange = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start.toDateString() === end.toDateString()) {
      return start.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    }
    
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600 bg-green-100';
    if (score >= 6) return 'text-yellow-600 bg-yellow-100';
    if (score >= 4) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 8) return '🌟';
    if (score >= 6) return '👍';
    if (score >= 4) return '⚠️';
    return '❌';
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Activity Plan Card */}
      <motion.div
        className="flex-1 bg-gradient-to-r from-peacock/10 to-marigold/10 rounded-lg p-4 border border-peacock/20"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">
              {getActivityEmoji(activity)}
            </div>
            <div>
              <h3 className="font-semibold text-charcoal">
                {activity} in {location}
              </h3>
              <p className="text-sm text-gray-600">
                {formatDateRange()}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={downloadActivityPlan}
              className="p-2 text-gray-600 hover:text-peacock hover:bg-peacock/10 rounded-lg transition-colors"
              title="Download Activity Plan"
            >
              <Download size={18} />
            </button>
            
            <ShareButton 
              content={shareContent}
              size="md"
              variant="secondary"
            />
          </div>
        </div>

        {/* Activity Details */}
        <div className="mt-3 grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Star size={16} className="text-marigold" />
            <span className="text-sm text-gray-600">
              ACIS Score: 
              <span className={`ml-1 px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(acisScore)}`}>
                {getScoreEmoji(acisScore)} {acisScore}/10
              </span>
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <CheckCircle size={16} className="text-green-500" />
            <span className="text-sm text-gray-600">
              Optimal conditions
            </span>
          </div>
        </div>

        {/* Optimal Conditions */}
        <div className="mt-3 p-2 bg-peacock/20 rounded-lg">
          <p className="text-sm text-charcoal">
            <Clock size={14} className="inline mr-1" />
            <strong>Best time:</strong> {optimalConditions}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// Helper functions
function getActivityEmoji(activity: string): string {
  const emojiMap: Record<string, string> = {
    'trekking': '🥾',
    'photography': '📸',
    'picnic': '🧺',
    'cycling': '🚴',
    'beach day': '🏖️',
    'camping': '⛺',
    'outdoor sports': '⚽',
    'bird watching': '🐦',
    'stargazing': '⭐',
    'gardening': '🌱',
    'hiking': '🥾',
    'swimming': '🏊',
    'running': '🏃',
    'yoga': '🧘',
    'fishing': '🎣'
  };
  
  const normalized = activity.toLowerCase();
  return emojiMap[normalized] || '🎯';
}

function generateActivityPlan(data: ActivityShareData): string {
  const { activity, location, startDate, endDate, optimalConditions, acisScore } = data;
  const date = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  let plan = `🎯 ACTIVITY PLAN - ${activity.toUpperCase()}\n`;
  plan += `📅 Generated on ${date}\n\n`;
  
  plan += `📍 LOCATION: ${location}\n`;
  plan += `📅 DATE: ${new Date(startDate).toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  })}\n`;
  
  if (startDate !== endDate) {
    plan += `📅 END DATE: ${new Date(endDate).toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    })}\n`;
  }
  
  plan += `\n⭐ ACTIVITY CLIMATE INDEX SCORE: ${acisScore}/10\n`;
  
  const scoreDescription = getScoreDescription(acisScore);
  plan += `📊 RATING: ${scoreDescription}\n\n`;
  
  plan += `⏰ OPTIMAL CONDITIONS\n`;
  plan += `${optimalConditions}\n\n`;
  
  plan += `📋 PREPARATION CHECKLIST\n`;
  plan += `□ Check weather forecast\n`;
  plan += `□ Pack appropriate clothing\n`;
  plan += `□ Bring necessary equipment\n`;
  plan += `□ Plan transportation\n`;
  plan += `□ Inform others of your plans\n`;
  plan += `□ Check safety conditions\n\n`;
  
  plan += `📱 Generated by ChronoClime Weather App\n`;
  plan += `🔗 ${window.location.href}`;
  
  return plan;
}

function getScoreDescription(score: number): string {
  if (score >= 8) return 'Excellent conditions - Perfect for this activity!';
  if (score >= 6) return 'Good conditions - Great time for this activity';
  if (score >= 4) return 'Fair conditions - Consider alternatives or timing';
  return 'Poor conditions - Not recommended for this activity';
}
