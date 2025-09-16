import React, { useState, useRef } from 'react';
import { ArrowRightIcon, ChevronLeftIcon, ChevronDownIcon, ChatIcon } from '../icons';

interface Message {
  id: string;
  senderId: string;
  senderType: 'buyer' | 'seller';
  content: string;
  timestamp: Date;
  attachments?: string[];
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

const ChatPage: React.FC = () => {
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
      };
      setMessages((prev) => [...prev, message]);
      setNewMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = '40px';
      }
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

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = '40px';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Main Header */}
      <div className="px-6 py-3" style={{ backgroundColor: '#434343' }}>
        <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
          {/* Left Section - Logo */}
          <div className="flex items-center space-x-4">
            <img
              src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=120&h=40&fit=crop"
              alt="Amazon"
              className="h-8 w-auto"
            />
          </div>

          {/* Center Section - Search */}
          <div className="flex-1 max-w-2xl mx-4">
            <div className="flex">
              <div className="flex items-center bg-gray-500 px-3 py-2 rounded-l-md border border-gray-400">
                <span className="text-white text-sm">All</span>
                <ChevronDownIcon className="w-4 h-4 text-white ml-1" />
              </div>
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Search Nexora"
                  className="w-full px-3 py-2 border-t border-b border-gray-400 focus:outline-none"
                />
              </div>
              <button className="bg-gray-500 px-3 py-2 rounded-r-md border border-gray-400 hover:bg-gray-400 transition-colors">
                <svg className="w-5 h-5 text-gray-800" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
              </button>
            </div>
          </div>

          {/* Right Section - Navigation */}
          <div className="flex items-center space-x-6">
            {/* Language Selector */}
            <div className="flex items-center space-x-1 text-white hover:bg-gray-500 px-2 py-1 rounded cursor-pointer">
              <span className="text-sm">EN</span>
              <ChevronDownIcon className="w-3 h-3" />
            </div>

            {/* Returns & Orders */}
            <div className="text-white hover:bg-gray-500 px-2 py-1 rounded cursor-pointer">
              <div className="text-xs">Returns</div>
              <div className="text-sm font-medium">& Orders</div>
            </div>

            {/* Account */}
            <div className="flex items-center text-white hover:bg-gray-500 px-2 py-1 rounded cursor-pointer">
              <div>
                <div className="text-xs">Hello, sign in</div>
                <div className="flex items-center">
                  <span className="text-sm font-medium">Account & Lists</span>
                  <ChevronDownIcon className="w-3 h-3 ml-1" />
                </div>
              </div>
            </div>

            {/* Cart */}
            <div className="flex items-center text-white hover:bg-gray-500 px-2 py-1 rounded cursor-pointer">
              <div className="relative">
                <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="m1 1 4 4 1.68 8.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <span className="absolute -top-2 -right-2 bg-orange-400 text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                  0
                </span>
              </div>
              <span className="ml-1 text-sm font-medium">Cart</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
        <div className="flex items-center space-x-4">
          <button className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeftIcon className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-4 flex-1">
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
                  {seller.verified && <svg className="w-4 h-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    <path d="M9 12l2 2 4-4"></path>
                  </svg>}
                </div>
                <div className="flex items-center space-x-1">
                  <svg className="w-3 h-3 text-yellow-400 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118L10 13.347l-2.987 2.134c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L3.38 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-gray-600">{seller.rating}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {messages.length === 0 ? (
          // Empty State
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                <ChatIcon className="w-8 h-8 text-gray-400" />
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
          // Messages will be displayed here once they exist
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
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>

                    <div
                      className={`mt-1 text-xs text-gray-500 ${
                        message.senderType === 'buyer' ? 'text-right' : 'text-left'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true,
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="flex items-end space-x-2">
          <button
            onClick={handleAttachmentClick}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
          >
            <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66L9.64 16.2a2 2 0 0 1-2.83-2.83l8.49-8.49"></path>
            </svg>
          </button>

          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={newMessage}
              onChange={handleTextareaChange}
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
                ? 'bg-[#42A275] text-white hover:bg-[#388A63]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <ArrowRightIcon className="w-5 h-5" />
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          accept="image/*,application/pdf,.doc,.docx"
          onChange={(e) => {
            console.log('Files selected:', e.target.files);
          }}
        />
      </div>
    </div>
  );
};

export default ChatPage;
