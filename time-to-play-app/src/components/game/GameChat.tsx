'use client';

import { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, MessageCircle, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessage {
  userId: string;
  displayName: string;
  message: string;
  timestamp: number;
  reaction?: string;
}

interface GameChatProps {
  gameId: string;
  userId: string;
  className?: string;
}

const EMOJI_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🎉', '🔥', '👏'];

export function GameChat({ gameId, userId, className }: GameChatProps) {
  const { socket, isConnected, sendChatMessage } = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!socket || !isConnected) return;

    // Listen for new chat messages
    socket.on('chat:message', (data: ChatMessage) => {
      setMessages((prev) => [...prev, data]);
    });

    // Listen for chat history on reconnect
    socket.on('chat:history', (history: ChatMessage[]) => {
      setMessages(history);
    });

    return () => {
      socket.off('chat:message');
      socket.off('chat:history');
    };
  }, [socket, isConnected]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !isConnected) return;

    sendChatMessage(gameId, inputValue.trim());
    setInputValue('');
    inputRef.current?.focus();
  };

  const handleEmojiClick = (emoji: string) => {
    setInputValue((prev) => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <Card className={cn('flex flex-col h-full', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageCircle className="w-5 h-5 text-primary-600" />
          Game Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-4 pt-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-3 min-h-0">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              <p>No messages yet. Say hello!</p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isOwnMessage = msg.userId === userId;
              return (
                <div
                  key={index}
                  className={cn(
                    'flex flex-col',
                    isOwnMessage ? 'items-end' : 'items-start'
                  )}
                >
                  <div className="text-xs text-gray-500 mb-1 px-1">
                    {msg.displayName} • {formatTime(msg.timestamp)}
                  </div>
                  <div
                    className={cn(
                      'rounded-lg px-3 py-2 max-w-[80%] break-words',
                      isOwnMessage
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    )}
                  >
                    <p className="text-sm">{msg.message}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message..."
              disabled={!isConnected}
              className="pr-10"
              maxLength={200}
            />
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <Smile className="w-5 h-5" />
            </button>

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="absolute bottom-full mb-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10">
                <div className="grid grid-cols-4 gap-1">
                  {EMOJI_REACTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleEmojiClick(emoji)}
                      className="w-10 h-10 hover:bg-gray-100 rounded flex items-center justify-center text-xl transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Button
            type="submit"
            disabled={!inputValue.trim() || !isConnected}
            size="icon"
            className="shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>

        {!isConnected && (
          <p className="text-xs text-red-600 mt-2">
            Disconnected. Reconnecting...
          </p>
        )}
      </CardContent>
    </Card>
  );
}
