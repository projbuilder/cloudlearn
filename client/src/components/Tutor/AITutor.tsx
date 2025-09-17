import React from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Bot, User, Send, Lightbulb } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TutorMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  sources?: Array<{ name: string; url: string }>;
  relatedTopics?: string[];
  timestamp: Date;
}

interface AITutorProps {
  userId?: string;
}

export default function AITutor({ userId }: AITutorProps) {
  const [messages, setMessages] = React.useState<TutorMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm your AI tutor. I can help you with:\n\n• Explaining difficult concepts from your courses\n• Working through practice problems step-by-step\n• Suggesting additional resources and study strategies\n• Clarifying mistakes from your recent quizzes\n\nWhat would you like to learn about today?",
      relatedTopics: ['quadratic functions', 'linear equations', 'python basics'],
      timestamp: new Date()
    }
  ]);
  
  const [inputMessage, setInputMessage] = React.useState('');
  const { toast } = useToast();

  const sendMessageMutation = useMutation({
    mutationFn: async ({ message, context }: { message: string; context?: any }) => {
      const response = await apiRequest('POST', '/api/tutor/chat', { message, context });
      return response.json();
    },
    onSuccess: (data) => {
      const assistantMessage: TutorMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: data.message,
        sources: data.sources,
        relatedTopics: data.relatedTopics,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to get response from AI tutor. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const userMessage: TutorMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    
    sendMessageMutation.mutate({ 
      message: inputMessage,
      context: { userId, recentMessages: messages.slice(-5) }
    });
    
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
  };

  const quickQuestions = [
    "Explain the quadratic formula",
    "What is a linear equation?",
    "How do Python loops work?",
    "Help me with my recent quiz mistakes"
  ];

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      {/* Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">AI Tutor Assistant</h2>
          </div>
          <p className="text-gray-600">
            Ask me anything about your coursework. I have access to OpenStax, MIT OCW, Wikipedia, Khan Academy, and arXiv resources.
          </p>
        </CardContent>
      </Card>

      {/* Quick Questions */}
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Quick questions to get started:</p>
        <div className="flex flex-wrap gap-2">
          {quickQuestions.map((question, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={() => handleQuickQuestion(question)}
              className="text-xs"
            >
              {question}
            </Button>
          ))}
        </div>
      </div>

      {/* Chat Messages */}
      <Card className="flex-1 flex flex-col">
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex items-start space-x-3">
              {message.type === 'assistant' ? (
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              ) : (
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
              
              <div className="flex-1">
                <div className={`rounded-lg p-4 ${
                  message.type === 'assistant' ? 'bg-purple-50' : 'bg-blue-50'
                }`}>
                  <div className="prose prose-sm max-w-none">
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  
                  {/* Sources */}
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-purple-200">
                      <p className="text-xs text-purple-700 font-medium mb-2">Sources:</p>
                      <div className="flex flex-wrap gap-1">
                        {message.sources.map((source, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {source.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Related Topics */}
                  {message.relatedTopics && message.relatedTopics.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-purple-700 font-medium mb-2 flex items-center space-x-1">
                        <Lightbulb className="w-3 h-3" />
                        <span>Related topics:</span>
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {message.relatedTopics.map((topic, index) => (
                          <Button
                            key={index}
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs text-purple-700 hover:bg-purple-100"
                            onClick={() => handleQuickQuestion(`Tell me about ${topic}`)}
                          >
                            {topic}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <p className="text-xs text-gray-500 mt-2">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          
          {/* Loading indicator */}
          {sendMessageMutation.isPending && (
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 flex-1">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center space-x-3">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about your coursework..."
              className="flex-1"
              disabled={sendMessageMutation.isPending}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || sendMessageMutation.isPending}
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
