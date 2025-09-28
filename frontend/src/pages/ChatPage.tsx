import React, { useState, useRef, useEffect } from 'react';
import { ArrowRight, ChevronLeft, ChevronDown, MessageCircle, Paperclip, Smile, Edit3, Trash2, Shield, Star } from 'lucide-react';

interface Message {
  id: string;
  senderId: string;
  senderType: 'buyer' | 'seller';
  content: string;
  timestamp: Date;
  attachments?: string[];
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

interface Product {
  id: string;
  title: string;
  image: string;
  price: number;
  orderId: string;
}

interface Seller {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  verified: boolean;
}

interface EmojiPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onEmojiSelect: (emoji: string) => void;
  position: { x: number; y: number };
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ isOpen, onClose, onEmojiSelect, position }) => {
  if (!isOpen) return null;
  
  const emojis = [
    '😊', '😂', '❤️', '👍', '👎', '🎉', '🔥', '💯',
    '😍', '🤔', '😢', '😡', '🙏', '💪', '🎈', '🌟',
    '⭐', '✨', '💫', '🌈', '🎊', '🎁', '🍰', '🎂'
  ];
  
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Emoji Picker */}
      <div 
        className="absolute bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50 w-64"
        style={{ 
          left: Math.max(10, position.x - 128), 
          bottom: 80,
          maxHeight: '200px',
          overflowY: 'auto'
        }}
      >
        <div className="grid grid-cols-8 gap-1">
          {emojis.map(emoji => (
            <button
              key={emoji}
              onClick={() => {
                onEmojiSelect(emoji);
                onClose();
              }}
              className="p-2 hover:bg-gray-100 rounded text-lg transition-colors"
              title={emoji}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </>
  );
};

interface MessageStatusProps {
  status: string;
  timestamp: Date;
}

const MessageStatus: React.FC<MessageStatusProps> = ({ status, timestamp }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return <div className="w-3 h-3 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />;
      case 'sent':
        return <div className="w-3 h-3 text-gray-400">✓</div>;
      case 'delivered':
        return <div className="w-3 h-3 text-gray-400">✓✓</div>;
      case 'read':
        return <div className="w-3 h-3 text-blue-500">✓✓</div>;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center space-x-1">
      <span className="text-xs text-gray-500">
        {timestamp.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })}
      </span>
      {getStatusIcon()}
    </div>
  );
};

interface ChatStatsProps {
  messageCount: number;
  lastMessageTime?: Date;
}

const ChatStats: React.FC<ChatStatsProps> = ({ messageCount, lastMessageTime }) => (
  <div className="text-xs text-gray-500 flex items-center space-x-2">
    <span>{messageCount} messages</span>
    {lastMessageTime && (
      <>
        <span>•</span>
        <span>Last: {lastMessageTime.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })}</span>
      </>
    )}
  </div>
);

const ChatPage: React.FC = () => {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [emojiPickerPosition, setEmojiPickerPosition] = useState({ x: 0, y: 0 });
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages from localStorage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('chat-messages');
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(parsedMessages);
      } catch (error) {
        console.error('Error loading messages from localStorage:', error);
      }
    }
  }, []);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    localStorage.setItem('chat-messages', JSON.stringify(messages));
  }, [messages]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mock data
  const product: Product = {
    id: 'prod_789',
    title: 'Sony WH-1000XM4 Wireless Noise Canceling Headphones',
    image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&h=300&fit=crop',
    price: 279.99,
    orderId: 'ORD-2024-001234',
  };

  const seller: Seller = {
    id: 'seller_456',
    name: 'TechGear Pro',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    rating: 4.8,
    verified: true,
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        senderId: 'buyer_123',
        senderType: 'buyer',
        content: newMessage.trim(),
        timestamp: new Date(),
        status: 'sending',
      };
      setMessages((prev) => [...prev, message]);
      setNewMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = '40px';
      }

      // Simulate message sending and status updates
      setTimeout(() => {
        setMessages((prev) => 
          prev.map((msg) => 
            msg.id === message.id ? { ...msg, status: 'sent' } : msg
          )
        );
      }, 1000);

      setTimeout(() => {
        setMessages((prev) => 
          prev.map((msg) => 
            msg.id === message.id ? { ...msg, status: 'delivered' } : msg
          )
        );
      }, 2000);

      setTimeout(() => {
        setMessages((prev) => 
          prev.map((msg) => 
            msg.id === message.id ? { ...msg, status: 'read' } : msg
          )
        );
      }, 3000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAttachmentClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      console.log('Files selected:', Array.from(files).map(f => f.name));
      // Here you would typically upload files and add them to the message
    }
  };

  const handleEmojiClick = () => {
    if (emojiButtonRef.current) {
      const rect = emojiButtonRef.current.getBoundingClientRect();
      setEmojiPickerPosition({
        x: rect.left + rect.width / 2,
        y: rect.top,
      });
    }
    setIsEmojiPickerOpen(!isEmojiPickerOpen);
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleEditMessage = (messageId: string) => {
    const message = messages.find(msg => msg.id === messageId);
    if (message) {
      setEditingMessageId(messageId);
      setEditingText(message.content);
    }
  };

  const handleSaveEdit = () => {
    if (editingMessageId && editingText.trim()) {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === editingMessageId 
            ? { ...msg, content: editingText.trim() }
            : msg
        )
      );
      setEditingMessageId(null);
      setEditingText('');
    }
  };

  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingText('');
  };

  const handleDeleteMessage = (messageId: string) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    setIsTyping(true);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = '40px';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
    
    // Clear typing indicator after 2 seconds
    setTimeout(() => setIsTyping(false), 2000);
  };

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear all messages?')) {
      setMessages([]);
      localStorage.removeItem('chat-messages');
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      
      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <button className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>

            <img
              src={product.image}
              alt={product.title}
              className="w-12 h-12 rounded-lg object-cover bg-gray-100"
            />

            <div className="flex-1 min-w-0">
              <h1 className="text-sm font-medium text-gray-900 truncate">{product.title}</h1>
              <p className="text-sm text-gray-500">Order #{product.orderId}</p>
            </div>

            <div className="flex items-center space-x-2 text-sm">
              <img src={seller.avatar} alt={seller.name} className="w-8 h-8 rounded-full" />
              <div className="hidden sm:block">
                <div className="flex items-center space-x-1">
                  <span className="font-medium text-gray-900">{seller.name}</span>
                  {seller.verified && <Shield className="w-4 h-4 text-blue-500" />}
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span className="text-gray-600">{seller.rating}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleClearChat}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-100 rounded-full transition-colors"
              title="Clear chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat Stats */}
        <div className="mt-2">
          <ChatStats 
            messageCount={messages.length}
            lastMessageTime={messages.length > 0 ? messages[messages.length - 1].timestamp : undefined}
          />
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 ? (
          // Empty State
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <MessageCircle className="w-8 h-8 text-gray-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-gray-900">Start the conversation</h3>
                <p className="text-sm text-gray-500 max-w-sm mx-auto">
                  Send a message to {seller.name} about your order or ask any questions you have.
                </p>
              </div>
            </div>
          </div>
        ) : (
          // Messages
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderType === 'buyer' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex max-w-xs lg:max-w-md ${
                    message.senderType === 'buyer' ? 'flex-row-reverse space-x-reverse space-x-2' : 'flex-row space-x-2'
                  }`}
                >
                  {message.senderType === 'seller' && (
                    <img
                      src={seller.avatar}
                      alt={seller.name}
                      className="w-8 h-8 rounded-full flex-shrink-0"
                    />
                  )}

                  <div className="flex flex-col">
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        message.senderType === 'buyer'
                          ? 'bg-green-500 text-white rounded-br-md'
                          : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
                      }`}
                    >
                      {editingMessageId === message.id ? (
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="flex-1 px-2 py-1 text-sm bg-transparent border border-gray-300 rounded text-gray-900"
                            autoFocus
                          />
                          <button
                            onClick={handleSaveEdit}
                            className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="group relative">
                          <p className="text-sm leading-relaxed">{message.content}</p>
                          {message.senderType === 'buyer' && (
                            <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="flex space-x-1 bg-white rounded-md shadow-md p-1">
                                <button
                                  onClick={() => handleEditMessage(message.id)}
                                  className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded"
                                  title="Edit message"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => handleDeleteMessage(message.id)}
                                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded"
                                  title="Delete message"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div
                      className={`mt-1 ${
                        message.senderType === 'buyer' ? 'text-right' : 'text-left'
                      }`}
                    >
                      {message.senderType === 'buyer' && message.status ? (
                        <MessageStatus status={message.status} timestamp={message.timestamp} />
                      ) : (
                        <span className="text-xs text-gray-500">
                          {message.timestamp.toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true,
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex max-w-xs lg:max-w-md flex-row space-x-2">
                  <img
                    src={seller.avatar}
                    alt={seller.name}
                    className="w-8 h-8 rounded-full flex-shrink-0"
                  />
                  <div className="flex flex-col">
                    <div className="px-4 py-2 bg-white text-gray-900 border border-gray-200 rounded-2xl rounded-bl-md">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-4 relative">
        <div className="flex items-end space-x-2">
          <button
            onClick={handleAttachmentClick}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
            title="Attach file"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <button
            ref={emojiButtonRef}
            onClick={handleEmojiClick}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
            title="Add emoji"
          >
            <Smile className="w-5 h-5" />
          </button>

          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={handleTyping}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full px-4 py-2 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={1}
              style={{ minHeight: '40px', maxHeight: '120px', overflowY: 'auto' }}
            />
          </div>

          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className={`p-2 rounded-full transition-colors flex-shrink-0 ${
              newMessage.trim()
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            title="Send message"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          accept="image/*,application/pdf,.doc,.docx"
          onChange={handleFileSelect}
        />
      </div>

      {/* Emoji Picker */}
      <EmojiPicker
        isOpen={isEmojiPickerOpen}
        onClose={() => setIsEmojiPickerOpen(false)}
        onEmojiSelect={handleEmojiSelect}
        position={emojiPickerPosition}
      />
    </div>
  );
};

export default ChatPage;