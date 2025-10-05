/**
 * AI Service for Chrono AI Assistant
 * Integrates with Google AI Studio API
 */

const GOOGLE_AI_API_KEY = 'AIzaSyCof67eQobfCzwod-dUW_gto5lAt-9wItc';
const GOOGLE_AI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';

export interface AIResponse {
  response: string;
  success: boolean;
  error?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

class AIService {
  private conversationHistory: ChatMessage[] = [];

  /**
   * Send a message to the AI assistant
   */
  async sendMessage(userMessage: string, weatherContext?: any): Promise<AIResponse> {
    try {
      // Add user message to conversation history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      });

      // Prepare the prompt with weather context
      const systemPrompt = this.buildSystemPrompt(weatherContext);
      const fullPrompt = `${systemPrompt}\n\nUser: ${userMessage}`;

      // Call Google AI Studio API with simplified configuration
      // Try direct API first, then CORS proxy if needed
      let response;
      try {
        response = await fetch(`${GOOGLE_AI_API_URL}?key=${GOOGLE_AI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: fullPrompt
              }]
            }]
          })
        });
      } catch (corsError) {
        console.log('🔄 Direct API failed, trying CORS proxy...');
        response = await fetch(`${CORS_PROXY}${GOOGLE_AI_API_URL}?key=${GOOGLE_AI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: fullPrompt
              }]
            }]
          })
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI API Error Response:', errorText);
        throw new Error(`AI API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('AI API Response:', data);
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const aiResponse = data.candidates[0].content.parts[0].text;
        
        // Add AI response to conversation history
        this.conversationHistory.push({
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date()
        });

        return {
          response: aiResponse,
          success: true
        };
      } else {
        console.error('Invalid AI API response format:', data);
        throw new Error('Invalid response format from AI API');
      }

    } catch (error) {
      console.error('AI Service Error:', error);
      
      // Fallback to basic responses
      const fallbackResponse = this.getFallbackResponse(userMessage);
      
      this.conversationHistory.push({
        role: 'assistant',
        content: fallbackResponse,
        timestamp: new Date()
      });

      return {
        response: fallbackResponse,
        success: false,
        error: error instanceof Error ? error.message : 'AI service unavailable'
      };
    }
  }

  /**
   * Build system prompt with weather context
   */
  private buildSystemPrompt(weatherContext?: any): string {
    let prompt = `You are Chrono, an intelligent weather and climate assistant. You help users with weather-related questions, activity planning, and climate insights.

Your capabilities:
- Weather analysis and forecasting
- Activity recommendations based on weather
- Climate data interpretation
- Health and safety advice related to weather
- Travel planning with weather considerations

Guidelines:
- Be helpful, accurate, and friendly
- Provide practical advice
- Use weather data when available
- Suggest activities based on current conditions
- Give safety warnings when appropriate
- Keep responses concise but informative`;

    if (weatherContext) {
      prompt += `\n\nCurrent Weather Context:
- Location: ${weatherContext.currentLocation || 'Not specified'}
- Temperature: ${weatherContext.currentWeather?.temp || 'N/A'}°C
- Condition: ${weatherContext.currentWeather?.condition || 'N/A'}
- Humidity: ${weatherContext.currentWeather?.humidity || 'N/A'}%
- Wind Speed: ${weatherContext.currentWeather?.windSpeed || 'N/A'} km/h
- Air Quality: ${weatherContext.currentWeather?.aqi || 'N/A'}`;
    }

    return prompt;
  }

  /**
   * Get fallback response when AI service is unavailable
   */
  private getFallbackResponse(userMessage: string): string {
    const message = userMessage.toLowerCase();
    
    if (message.includes('weather') || message.includes('temperature')) {
      return "I'd be happy to help with weather information! However, I'm currently experiencing technical difficulties with the AI service. Please try asking about the current weather conditions or check the weather forecast on the main page.";
    }
    
    if (message.includes('activity') || message.includes('plan')) {
      return "I can help you plan activities based on weather conditions! While I'm having some technical issues with the AI service, you can use the Activity Planner feature to get personalized recommendations for your outdoor activities.";
    }
    
    if (message.includes('rain') || message.includes('storm')) {
      return "For weather safety advice, I recommend checking the current conditions and forecasts. Stay safe during severe weather conditions!";
    }
    
    if (message.includes('hello') || message.includes('hi')) {
      return "Hello! I'm Chrono, your weather assistant. I'm currently experiencing some technical difficulties with the AI service, but I'm here to help with weather-related questions. Please try the weather forecast features on the main page.";
    }
    
    return "I'm Chrono, your weather assistant! I'm currently experiencing some technical difficulties with the AI service, but I'm here to help with weather-related questions. Please try again in a moment or use the weather forecast features on the main page.";
  }

  /**
   * Get conversation history
   */
  getConversationHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * Test AI service connection
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🧪 Testing AI Service connection...');
      const response = await this.sendMessage("Hello, are you working?");
      console.log('🧪 AI Service test result:', response);
      return response.success;
    } catch (error) {
      console.error('🧪 AI Service test failed:', error);
      return false;
    }
  }

  /**
   * Simple test without conversation history
   */
  async simpleTest(): Promise<boolean> {
    try {
      console.log('🧪 Testing simple AI connection with new API key...');
      console.log('🧪 API Key:', GOOGLE_AI_API_KEY.substring(0, 10) + '...');
      console.log('🧪 API URL:', GOOGLE_AI_API_URL);
      
      // Try a very simple request first
      const simpleRequest = {
        contents: [{
          parts: [{
            text: "Say hello"
          }]
        }]
      };
      
      console.log('🧪 Request payload:', JSON.stringify(simpleRequest, null, 2));
      
      const response = await fetch(`${GOOGLE_AI_API_URL}?key=${GOOGLE_AI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(simpleRequest)
      });

      console.log('🧪 Response status:', response.status);
      console.log('🧪 Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🧪 Simple test failed:', response.status, errorText);
        
        // Try to parse error as JSON
        try {
          const errorJson = JSON.parse(errorText);
          console.error('🧪 Error details:', errorJson);
        } catch (e) {
          console.error('🧪 Raw error text:', errorText);
        }
        
        return false;
      }

      const data = await response.json();
      console.log('🧪 Simple test response:', data);
      
      // Check if we got a valid response
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const responseText = data.candidates[0].content.parts[0].text;
        console.log('🧪 AI Response text:', responseText);
        return true;
      } else {
        console.error('🧪 Invalid response format:', data);
        return false;
      }
    } catch (error) {
      console.error('🧪 Simple test error:', error);
      console.error('🧪 Error type:', typeof error);
      console.error('🧪 Error message:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  }
}

// Create singleton instance
export const aiService = new AIService();
