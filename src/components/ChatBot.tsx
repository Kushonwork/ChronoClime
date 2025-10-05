import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, X, Loader2, TestTube } from 'lucide-react';
import { Message, ChatContext } from '../utils/chatbot';
import { aiService, AIResponse } from '../services/aiService';

interface ChatBotProps {
  context: ChatContext;
}

export default function ChatBot({ context }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm ChronoAI, your intelligent weather assistant powered by Google AI. Ask me about weather conditions, activity planning, climate insights, or anything weather-related!",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call the real AI service
      const aiResponse: AIResponse = await aiService.sendMessage(input, context);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse.response,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI Service Error:', error);
      
      // Fallback response
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I'm experiencing some technical difficulties. Please try again in a moment or use the weather forecast features on the main page.",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestAI = async () => {
    setIsTesting(true);
    try {
      console.log('🧪 Testing AI Service...');
      const testResult = await aiService.simpleTest();
      console.log('🧪 Test result:', testResult);
      
      const testMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: testResult 
          ? "✅ AI Service test successful! The AI is working properly." 
          : "❌ AI Service test failed. Check console for details.",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, testMessage]);
    } catch (error) {
      console.error('🧪 Test error:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTesting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <motion.div
        className="peacock-fab"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.95 }}
      >
        <MessageCircle size={32} color="white" />
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="chat-window"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="chat-header flex justify-between items-center">
              <span>ChronoAI Assistant</span>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:opacity-70 transition-opacity"
              >
                <X size={20} />
              </button>
            </div>

            <div className="chat-messages">
              {messages.map(message => (
                <motion.div
                  key={message.id}
                  className={`chat-bubble ${message.role}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {message.content}
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="chat-input-container">
              <input
                type="text"
                className="chat-input"
                placeholder="Ask me anything..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleTestAI}
                  className="liquid-button px-3"
                  disabled={isTesting}
                  style={{ opacity: isTesting ? 0.5 : 1 }}
                  title="Test AI Connection"
                >
                  {isTesting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <TestTube size={16} />
                  )}
                </button>
                <button
                  onClick={handleSend}
                  className="liquid-button px-4"
                  disabled={!input.trim() || isLoading}
                  style={{ opacity: (input.trim() && !isLoading) ? 1 : 0.5 }}
                >
                  {isLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Send size={20} />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
