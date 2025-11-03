# In-Game Chat System

## Overview

A simple, clean chat system that allows players to communicate during games. Chat is only available within active games (no lobby or global chat in MVP).

## Features

- Real-time messaging during games
- Message history (stored for game duration)
- Quick emoji reactions
- Chat moderation (profanity filter)
- Mute option for players who prefer quiet games
- Auto-scroll to latest messages
- Typing indicators
- Message timestamps

## Database Schema

```prisma
// Add to existing schema
model ChatMessage {
  id          String   @id @default(cuid())
  gameId      String
  game        Game     @relation(fields: [gameId], references: [id], onDelete: Cascade)

  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  message     String   @db.Text
  type        MessageType @default(TEXT)

  // For moderation
  isFiltered  Boolean  @default(false)

  createdAt   DateTime @default(now())

  @@index([gameId, createdAt])
  @@index([userId])
}

enum MessageType {
  TEXT          // Regular message
  EMOJI         // Emoji reaction
  SYSTEM        // System message (e.g., "Player joined")
}

// Add to Game model
model Game {
  // ... existing fields ...
  chatMessages ChatMessage[]
}

// Add to User model
model User {
  // ... existing fields ...
  chatMessages ChatMessage[]
}
```

## Redis Storage

For active games, store recent messages in Redis for fast access:

```typescript
// Key: game:{gameId}:chat
// Type: List (capped at 100 messages)
// Structure:
interface ChatMessageCache {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  message: string;
  type: 'TEXT' | 'EMOJI' | 'SYSTEM';
  timestamp: string; // ISO
  isFiltered: boolean;
}

// Add message to chat
await redis.lpush(
  `game:${gameId}:chat`,
  JSON.stringify(message)
);

// Keep only last 100 messages
await redis.ltrim(`game:${gameId}:chat`, 0, 99);

// Set expiration to match game state
await redis.expire(`game:${gameId}:chat`, 1800);

// Get all messages (newest first)
const messages = await redis.lrange(`game:${gameId}:chat`, 0, -1);
```

## Socket Events

### Client → Server

```typescript
// Send chat message
socket.emit('chat:message', {
  gameId: string,
  message: string
});

// Send emoji reaction
socket.emit('chat:emoji', {
  gameId: string,
  emoji: string  // e.g., '👍', '😂', '🎉'
});

// Start typing
socket.emit('chat:typing', {
  gameId: string,
  isTyping: boolean
});
```

### Server → Client

```typescript
// New message received
socket.on('chat:message', (data: {
  id: string,
  userId: string,
  displayName: string,
  avatarUrl?: string,
  message: string,
  type: 'TEXT' | 'EMOJI' | 'SYSTEM',
  timestamp: string,
  isFiltered: boolean
}) => {});

// Player typing indicator
socket.on('chat:typing', (data: {
  userId: string,
  displayName: string,
  isTyping: boolean
}) => {});

// System message
socket.on('chat:system', (data: {
  message: string,
  timestamp: string
}) => {});
```

## Server Implementation

### Chat Handler

```typescript
// server/handlers/chat.handler.ts
import Filter from 'bad-words';

const profanityFilter = new Filter();

export function setupChatHandlers(io: Server) {

  io.on('connection', (socket) => {

    // Send chat message
    socket.on('chat:message', async (data) => {
      const { gameId, message } = data;
      const userId = socket.data.userId;
      const displayName = socket.data.displayName;

      try {
        // Validate player is in game
        const gamePlayer = await prisma.gamePlayer.findFirst({
          where: { gameId, userId }
        });

        if (!gamePlayer) {
          socket.emit('error', { message: 'Not part of this game' });
          return;
        }

        // Rate limiting (max 5 messages per 10 seconds)
        const rateLimitKey = `chat:ratelimit:${userId}:${gameId}`;
        const messageCount = await redis.incr(rateLimitKey);

        if (messageCount === 1) {
          await redis.expire(rateLimitKey, 10);
        }

        if (messageCount > 5) {
          socket.emit('error', {
            code: 'RATE_LIMIT',
            message: 'Slow down! Too many messages.'
          });
          return;
        }

        // Validate message
        if (!message || message.trim().length === 0) {
          return;
        }

        if (message.length > 500) {
          socket.emit('error', { message: 'Message too long (max 500 characters)' });
          return;
        }

        // Filter profanity
        let filteredMessage = message;
        let isFiltered = false;

        if (profanityFilter.isProfane(message)) {
          filteredMessage = profanityFilter.clean(message);
          isFiltered = true;
        }

        // Create message object
        const chatMessage = {
          id: generateId(),
          userId,
          displayName,
          avatarUrl: socket.data.avatarUrl,
          message: filteredMessage,
          type: 'TEXT' as const,
          timestamp: new Date().toISOString(),
          isFiltered
        };

        // Store in Redis (for active games)
        await redis.lpush(
          `game:${gameId}:chat`,
          JSON.stringify(chatMessage)
        );
        await redis.ltrim(`game:${gameId}:chat`, 0, 99); // Keep last 100
        await redis.expire(`game:${gameId}:chat`, 1800);

        // Store in PostgreSQL (permanent record)
        prisma.chatMessage.create({
          data: {
            gameId,
            userId,
            message: filteredMessage,
            type: 'TEXT',
            isFiltered
          }
        }).catch(err => console.error('Failed to save chat message:', err));

        // Broadcast to all players in game
        io.to(`game:${gameId}`).emit('chat:message', chatMessage);

      } catch (error) {
        console.error('Chat error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Send emoji reaction
    socket.on('chat:emoji', async (data) => {
      const { gameId, emoji } = data;
      const userId = socket.data.userId;
      const displayName = socket.data.displayName;

      // Validate emoji (only allow specific set)
      const allowedEmojis = ['👍', '👎', '😂', '😮', '😢', '🎉', '❤️', '🔥'];
      if (!allowedEmojis.includes(emoji)) {
        return;
      }

      const emojiMessage = {
        id: generateId(),
        userId,
        displayName,
        avatarUrl: socket.data.avatarUrl,
        message: emoji,
        type: 'EMOJI' as const,
        timestamp: new Date().toISOString(),
        isFiltered: false
      };

      // Store and broadcast
      await redis.lpush(`game:${gameId}:chat`, JSON.stringify(emojiMessage));
      await redis.ltrim(`game:${gameId}:chat`, 0, 99);

      io.to(`game:${gameId}`).emit('chat:message', emojiMessage);
    });

    // Typing indicator
    socket.on('chat:typing', async (data) => {
      const { gameId, isTyping } = data;
      const userId = socket.data.userId;
      const displayName = socket.data.displayName;

      // Broadcast to other players (not to self)
      socket.to(`game:${gameId}`).emit('chat:typing', {
        userId,
        displayName,
        isTyping
      });
    });
  });
}
```

### System Messages

```typescript
// server/utils/chat.ts

export async function sendSystemMessage(
  io: Server,
  gameId: string,
  message: string
) {
  const systemMessage = {
    id: generateId(),
    userId: 'system',
    displayName: 'System',
    message,
    type: 'SYSTEM' as const,
    timestamp: new Date().toISOString(),
    isFiltered: false
  };

  await redis.lpush(`game:${gameId}:chat`, JSON.stringify(systemMessage));
  await redis.ltrim(`game:${gameId}:chat`, 0, 99);

  io.to(`game:${gameId}`).emit('chat:message', systemMessage);
}

// Usage examples:
await sendSystemMessage(io, gameId, 'Alice joined the game');
await sendSystemMessage(io, gameId, 'Bob reconnected');
await sendSystemMessage(io, gameId, 'Game started!');
await sendSystemMessage(io, gameId, 'Alice won the game!');
```

## Client Implementation

### Chat Component

```typescript
// components/game/GameChat.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';
import { Send, Smile, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { motion, AnimatePresence } from 'framer-motion';
import EmojiPicker from 'emoji-picker-react';

interface GameChatProps {
  gameId: string;
  initialMessages?: ChatMessage[];
}

export function GameChat({ gameId, initialMessages = [] }: GameChatProps) {
  const socket = useSocket();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [isMuted, setIsMuted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Listen for new messages
    socket.on('chat:message', (message: ChatMessage) => {
      if (!isMuted || message.userId === user?.id || message.type === 'SYSTEM') {
        setMessages(prev => [...prev, message]);
      }
    });

    // Listen for typing indicators
    socket.on('chat:typing', (data) => {
      if (data.isTyping) {
        setTypingUsers(prev => new Set(prev).add(data.displayName));
      } else {
        setTypingUsers(prev => {
          const updated = new Set(prev);
          updated.delete(data.displayName);
          return updated;
        });
      }
    });

    return () => {
      socket.off('chat:message');
      socket.off('chat:typing');
    };
  }, [socket, isMuted, user]);

  // Auto-scroll to bottom when new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    socket.emit('chat:message', {
      gameId,
      message: inputValue.trim()
    });

    setInputValue('');
    handleStopTyping();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    handleTyping();
  };

  const handleTyping = () => {
    socket.emit('chat:typing', { gameId, isTyping: true });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 2000);
  };

  const handleStopTyping = () => {
    socket.emit('chat:typing', { gameId, isTyping: false });
  };

  const handleEmojiSelect = (emoji: string) => {
    socket.emit('chat:emoji', { gameId, emoji });
    setShowEmojiPicker(false);
  };

  const quickEmojis = ['👍', '👎', '😂', '😮', '😢', '🎉', '❤️', '🔥'];

  return (
    <div className="flex flex-col h-full bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-semibold text-sm">Chat</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMuted(!isMuted)}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-3" ref={scrollRef}>
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChatMessageItem message={message} isOwn={message.userId === user?.id} />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {typingUsers.size > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-gray-500 italic"
            >
              {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Quick emoji reactions */}
      <div className="flex gap-1 px-3 py-2 border-t bg-gray-50">
        {quickEmojis.map(emoji => (
          <Button
            key={emoji}
            variant="ghost"
            size="sm"
            className="text-lg p-1 h-8 w-8"
            onClick={() => handleEmojiSelect(emoji)}
          >
            {emoji}
          </Button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2 p-3 border-t">
        <Input
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          maxLength={500}
          disabled={isMuted}
        />
        <Button
          onClick={handleSendMessage}
          disabled={!inputValue.trim() || isMuted}
          size="icon"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>

      {isMuted && (
        <div className="px-3 py-2 bg-yellow-50 border-t border-yellow-200 text-sm text-yellow-700">
          Chat is muted. Click the volume icon to unmute.
        </div>
      )}
    </div>
  );
}
```

### Chat Message Item

```typescript
// components/game/ChatMessageItem.tsx

interface ChatMessageItemProps {
  message: ChatMessage;
  isOwn: boolean;
}

export function ChatMessageItem({ message, isOwn }: ChatMessageItemProps) {
  const isSystem = message.type === 'SYSTEM';
  const isEmoji = message.type === 'EMOJI';

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {message.message}
        </div>
      </div>
    );
  }

  if (isEmoji) {
    return (
      <div className={cn(
        'flex items-center gap-2',
        isOwn ? 'justify-end' : 'justify-start'
      )}>
        {!isOwn && (
          <Avatar className="w-6 h-6">
            <AvatarImage src={message.avatarUrl} />
            <AvatarFallback>{message.displayName[0]}</AvatarFallback>
          </Avatar>
        )}
        <div className="text-3xl">{message.message}</div>
        {isOwn && (
          <Avatar className="w-6 h-6">
            <AvatarImage src={message.avatarUrl} />
            <AvatarFallback>{message.displayName[0]}</AvatarFallback>
          </Avatar>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      'flex gap-2',
      isOwn ? 'justify-end' : 'justify-start'
    )}>
      {!isOwn && (
        <Avatar className="w-8 h-8">
          <AvatarImage src={message.avatarUrl} />
          <AvatarFallback>{message.displayName[0]}</AvatarFallback>
        </Avatar>
      )}

      <div className={cn(
        'max-w-[70%] space-y-1',
        isOwn && 'items-end'
      )}>
        {!isOwn && (
          <div className="text-xs font-medium text-gray-700">
            {message.displayName}
          </div>
        )}

        <div className={cn(
          'px-3 py-2 rounded-lg',
          isOwn
            ? 'bg-primary-500 text-white rounded-br-none'
            : 'bg-gray-100 text-gray-900 rounded-bl-none'
        )}>
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.message}
          </p>
        </div>

        <div className="text-xs text-gray-400">
          {formatTime(message.timestamp)}
        </div>
      </div>

      {isOwn && (
        <Avatar className="w-8 h-8">
          <AvatarImage src={message.avatarUrl} />
          <AvatarFallback>{message.displayName[0]}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}

function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}
```

## Chat Integration in Game Layout

```typescript
// components/game/GameLayout.tsx

export function GameLayout({ gameId, children }: GameLayoutProps) {
  const [showChat, setShowChat] = useState(true);

  return (
    <div className="flex h-screen">
      {/* Game board (main area) */}
      <div className="flex-1">
        {children}
      </div>

      {/* Chat sidebar (collapsible) */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-l bg-white"
          >
            <GameChat gameId={gameId} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button (mobile & desktop) */}
      <Button
        className="fixed right-4 top-20 z-50 md:hidden"
        size="icon"
        onClick={() => setShowChat(!showChat)}
      >
        <MessageSquare className="w-5 h-5" />
      </Button>
    </div>
  );
}
```

## Mobile Responsive Design

On mobile, chat overlays the game board instead of being a sidebar:

```typescript
// Mobile chat overlay
<div className="md:hidden">
  {showChat && (
    <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowChat(false)}>
      <div
        className="absolute bottom-0 left-0 right-0 h-[60vh] bg-white rounded-t-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <GameChat gameId={gameId} />
      </div>
    </div>
  )}
</div>
```

## Moderation Features

### Profanity Filter

Using `bad-words` npm package:

```bash
npm install bad-words
```

```typescript
import Filter from 'bad-words';

const filter = new Filter();

// Customize filter
filter.addWords('customBadWord');
filter.removeWords('damn'); // If you want to allow some words

// Use in handler
if (filter.isProfane(message)) {
  const cleaned = filter.clean(message);
  // Store as filtered
}
```

### Report System (Future Enhancement)

```typescript
// Add to schema
model ChatReport {
  id          String   @id @default(cuid())
  messageId   String
  message     ChatMessage @relation(fields: [messageId], references: [id])
  reportedBy  String
  reporter    User     @relation(fields: [reportedBy], references: [id])
  reason      String
  createdAt   DateTime @default(now())
}
```

## Chat History Retrieval

When a player joins/reconnects, send recent chat history:

```typescript
// On game join
socket.on('game:join', async ({ gameId }) => {
  // ... existing join logic ...

  // Load chat history
  const chatHistory = await redis.lrange(`game:${gameId}:chat`, 0, 49); // Last 50 messages
  const messages = chatHistory.reverse().map(msg => JSON.parse(msg));

  socket.emit('chat:history', { messages });
});
```

## Performance Considerations

- Limit messages to 100 in Redis (oldest pruned)
- Rate limit: 5 messages per 10 seconds per user
- Message length limit: 500 characters
- Only persist messages in PostgreSQL for completed games
- Clean up chat data when game is deleted

## Testing

```typescript
// Test chat functionality
describe('Chat System', () => {
  test('should send and receive message', async () => {
    // Send message
    // Verify broadcast to all players
  });

  test('should filter profanity', async () => {
    // Send message with profanity
    // Verify it's filtered
  });

  test('should rate limit messages', async () => {
    // Send 6 messages quickly
    // Verify 6th is rejected
  });

  test('should show typing indicator', async () => {
    // Start typing
    // Verify other player sees indicator
  });
});
```

---

This chat system provides a complete communication solution for players while maintaining a clean, focused gaming experience.
