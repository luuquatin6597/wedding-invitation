import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, X, MessageSquare } from 'lucide-react';
import { Button } from './button';
import { Message, ApiGeneralResponse } from '../../interfaces/chatbot';
import { API_ENDPOINTS } from '@/app/config/api';

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [initialGreetingSent, setInitialGreetingSent] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && !initialGreetingSent) {
      const greetingMessage: Message = {
        id: 'greeting-' + Date.now(),
        content: "Xin chào! Tôi là Wedding AI. Tôi có thể giúp bạn tìm những câu nói hay cho thiệp cưới. Bạn cần tìm gì hôm nay?",
        type: 'bot',
        timestamp: new Date(),
        suggestions: [
          "câu ngạn ngữ về hôn nhân",
          "câu nói về tình yêu",
          "bài thơ cho ngày cưới"
        ]
      };
      setMessages([greetingMessage]);
      setInitialGreetingSent(true);
    }
  }, [isOpen, initialGreetingSent]);

  const sendQuery = async (query: string) => {
    if (!query.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: query,
      type: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post<ApiGeneralResponse>(
        `${API_ENDPOINTS.recommendWeddingSaying}`,
        { prompt: query }
      );

      const botMessageId = (Date.now() + 1).toString();
      const responseData = response.data;

      let quotesToShow: string[] | undefined = undefined;
      if (responseData.type === 'ai_content_response' && responseData.structured_quotes) {
        quotesToShow = responseData.structured_quotes;
      }

      const botResponseMessage: Message = {
        id: botMessageId,
        content: responseData.message,
        type: 'bot',
        timestamp: new Date(),
        suggestions: responseData.suggestions,
        structured_quotes: quotesToShow,
      };

      setMessages(prev => [...prev, botResponseMessage]);

    } catch (error: any) {
      console.error('Error getting AI response (catch block):', error);
      let errorMessageContent = 'Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này. Vui lòng thử lại sau.';
      const defaultErrorSuggestions = [
        "câu ngạn ngữ về hôn nhân",
        "câu nói về hôn nhân",
        "bài thơ về hôn nhân"
      ];
      let suggestionsForError: string[] = defaultErrorSuggestions;

      if (error.response && error.response.data) {
        const errorData = error.response.data as ApiGeneralResponse;
        errorMessageContent = errorData.message || errorMessageContent;
        if (errorData.suggestions && Array.isArray(errorData.suggestions) && errorData.suggestions.length > 0) {
          suggestionsForError = errorData.suggestions;
        }
      }

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: errorMessageContent,
        type: 'bot',
        timestamp: new Date(),
        suggestions: suggestionsForError,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendQuery(input);
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendQuery(suggestion);
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-pink-600 text-white p-4 rounded-full shadow-lg hover:bg-pink-700 transition-colors z-50"
        aria-label="Mở chatbot"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 max-w-[calc(100vw-3rem)] h-[600px] max-h-[calc(100vh-7rem)] bg-white dark:bg-gray-900 rounded-lg shadow-xl flex flex-col z-50 border border-pink-500/20">
          {/* Header */}
          <div className="p-4 border-b border-pink-500/20 flex justify-between items-center">
            <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">Wedding AI Assistant</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Đóng chatbot"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-lg p-3 shadow-sm ${message.type === 'user'
                    ? 'bg-pink-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    }`}
                >
                  {message.content && message.content.trim() !== "" && (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  )}

                  {message.structured_quotes && message.structured_quotes.length > 0 && (
                    <div className={`space-y-2 ${(!message.content || message.content.trim() === "") ? 'mt-0' : 'mt-3'}`}>
                      {!(message.content && message.content.trim() === "Dưới đây là một vài gợi ý cho bạn:") &&
                        (!message.content || message.content.trim() === "") &&
                        (
                          <p className="text-xs text-gray-700 dark:text-gray-300 mb-1">Dưới đây là một vài gợi ý cho bạn:</p>
                        )
                      }
                      {message.structured_quotes.map((quote, index) => (
                        <div
                          key={index}
                          className="p-2.5 bg-white dark:bg-gray-700 rounded-lg border border-pink-200 dark:border-pink-700 shadow-sm"
                        >
                          <p className="text-sm italic text-gray-800 dark:text-gray-200">
                            "{quote}"
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 pt-2 space-y-1 border-t border-gray-200 dark:border-gray-700">
                      <p className="text-xs text-gray-700 dark:text-gray-300 mb-1">Hoặc bạn có thể thử các chủ đề sau:</p>
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="block w-full text-left px-3 py-1.5 text-sm bg-pink-100 dark:bg-pink-800/50 hover:bg-pink-200 dark:hover:bg-pink-700/50 rounded-md text-pink-700 dark:text-pink-300 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                  <span className="text-xs opacity-70 mt-1.5 block text-right">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 max-w-[85%]">
                  <div className="flex space-x-1.5">
                    <div className="w-2 h-2 bg-pink-600 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                    <div className="w-2 h-2 bg-pink-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-pink-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 border-t border-pink-500/20">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 dark:bg-gray-800 dark:text-white"
                disabled={isLoading}
              />
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-pink-600 hover:bg-pink-700 text-white disabled:bg-pink-300 dark:disabled:bg-pink-800"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}