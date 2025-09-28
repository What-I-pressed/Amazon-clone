import React from 'react';

interface ChatStatsProps {
  messageCount: number;
  unreadCount?: number;
  lastMessageTime?: Date;
}

const ChatStats: React.FC<ChatStatsProps> = ({ 
  messageCount, 
  unreadCount = 0, 
  lastMessageTime 
}) => {
  return (
    <div className="flex items-center space-x-4 text-sm text-gray-500">
      <div className="flex items-center space-x-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span>{messageCount} messages</span>
      </div>
      
      {unreadCount > 0 && (
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          <span>{unreadCount} unread</span>
        </div>
      )}
      
      {lastMessageTime && (
        <div className="flex items-center space-x-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Last: {lastMessageTime.toLocaleTimeString()}</span>
        </div>
      )}
    </div>
  );
};

export default ChatStats;
