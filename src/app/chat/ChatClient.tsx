'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { chatApi } from '@/lib/api';
import type { ApiChatRoom } from '@/lib/api/types';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isRoomUuid(id: string): boolean {
  return UUID_REGEX.test(id);
}

const ROOM_TYPE_META: Record<string, { icon: string; color: string }> = {
  general: { icon: 'MegaphoneIcon', color: 'bg-purple-50 text-purple-600' },
  'shop-owners': { icon: 'BuildingStorefrontIcon', color: 'bg-rose-50 text-rose-600' },
  staff: { icon: 'UserGroupIcon', color: 'bg-blue-50 text-blue-600' },
  support: { icon: 'LifebuoyIcon', color: 'bg-green-50 text-green-600' },
};

function normalizeRoleForRoom(userRole: string | null | undefined): string {
  if (!userRole) return '';
  if (userRole === 'buyer') return 'customer';
  return userRole;
}

function mapApiRoom(r: ApiChatRoom): ChatRoom {
  const roomType = r.roomType || r.type || '';
  const meta = ROOM_TYPE_META[roomType] ?? {
    icon: 'ChatBubbleLeftRightIcon',
    color: 'bg-rose-50 text-rose-600',
  };
  const roles = (r.allowedRoles || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return {
    id: r.id,
    name: r.name || 'Room',
    description: roomType ? roomType.replace(/-/g, ' ') : '',
    icon: meta.icon,
    color: meta.color,
    roles: roles.length ? roles : ['admin', 'owner', 'staff', 'customer', 'buyer'],
  };
}

function roomVisibleToUser(room: ChatRoom, userRole: string | null | undefined): boolean {
  const normalized = normalizeRoleForRoom(userRole);
  if (!normalized) return false;
  return room.roles.some((r) => r === normalized || r === userRole);
}

interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  sender_avatar: string;
  message: string;
  message_type: string;
  shop_id: string | null;
  is_read: boolean;
  created_at: string;
}

interface ChatRoom {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  roles: string[];
}

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  owner: 'bg-rose-100 text-rose-700',
  staff: 'bg-blue-100 text-blue-700',
  buyer: 'bg-green-100 text-green-700',
};

const ROLE_LABELS: Record<string, string> = {
  admin: 'Super Admin',
  owner: 'Shop Owner',
  staff: 'Staff',
  buyer: 'Customer',
};

export default function ChatClient() {
  const { user, role } = useMockAuth();
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [apiRooms, setApiRooms] = useState<ChatRoom[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [onlineCount] = useState(Math.floor(Math.random() * 8) + 3);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = useCallback(async (roomId: string) => {
    if (!isRoomUuid(roomId)) return;
    setLoading(true);
    try {
      const page = await chatApi.listMessages(roomId);
      setMessages(
        (page.content || []).map((m) => ({
          id: m.id,
          room_id: roomId,
          sender_id: m.senderId || '',
          sender_name: m.senderName || 'User',
          sender_role: 'buyer',
          sender_avatar: '',
          message: m.content,
          message_type: 'text',
          shop_id: null,
          is_read: true,
          created_at: m.createdAt || new Date().toISOString(),
        }))
      );
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setRoomsLoading(true);
    chatApi
      .listRooms()
      .then((rooms) => {
        if (cancelled) return;
        const mapped = (rooms || []).map(mapApiRoom).filter((r) => isRoomUuid(r.id));
        setApiRooms(mapped);
        const visible = mapped.filter((r) => roomVisibleToUser(r, role));
        setActiveRoom((current) => {
          if (current && visible.some((r) => r.id === current.id)) return current;
          return visible[0] ?? null;
        });
      })
      .catch(() => {
        if (!cancelled) setApiRooms([]);
      })
      .finally(() => {
        if (!cancelled) setRoomsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [role]);

  useEffect(() => {
    if (!activeRoom?.id || !isRoomUuid(activeRoom.id)) return;
    fetchMessages(activeRoom.id);
    const interval = setInterval(() => fetchMessages(activeRoom.id), 5000);
    return () => clearInterval(interval);
  }, [activeRoom?.id, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending || !user || !activeRoom?.id || !isRoomUuid(activeRoom.id)) return;
    setSending(true);
    const text = input.trim();
    setInput('');

    try {
      await chatApi.sendMessage(activeRoom.id, text);
      await fetchMessages(activeRoom.id);
    } catch { /* ignore */ }
    setSending(false);
    inputRef.current?.focus();
  };

  const visibleRooms = apiRooms.filter((r) => roomVisibleToUser(r, role));

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Group messages by date
  const groupedMessages: { date: string; messages: ChatMessage[] }[] = [];
  messages.forEach(msg => {
    const date = formatDate(msg.created_at);
    const last = groupedMessages[groupedMessages.length - 1];
    if (last && last.date === date) {
      last.messages.push(msg);
    } else {
      groupedMessages.push({ date, messages: [msg] });
    }
  });

  return (
      <div className="flex gap-4 h-[calc(100vh-200px)] min-h-[500px]">
        {/* Rooms Sidebar */}
        <div className="w-64 shrink-0 bg-card border border-border rounded-2xl flex flex-col overflow-hidden">
          <div className="px-4 py-4 border-b border-border">
            <h3 className="font-bold text-foreground text-sm">Chat Rooms</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-muted-foreground">{onlineCount} online</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {roomsLoading ? (
              <p className="px-3 py-4 text-xs text-muted-foreground">Loading rooms…</p>
            ) : visibleRooms.length === 0 ? (
              <p className="px-3 py-4 text-xs text-muted-foreground">No chat rooms available.</p>
            ) : (
            visibleRooms.map(room => (
              <button
                key={room.id}
                onClick={() => setActiveRoom(room)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${
                  activeRoom?.id === room.id ? 'bg-primary/15 text-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${room.color}`}>
                  <Icon name={room.icon as Parameters<typeof Icon>[0]['name']} size={15} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold truncate">{room.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{room.description}</p>
                </div>
              </button>
            )))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-card border border-border rounded-2xl flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="px-5 py-4 border-b border-border flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${activeRoom?.color ?? 'bg-secondary'}`}>
              <Icon name={(activeRoom?.icon ?? 'ChatBubbleLeftRightIcon') as Parameters<typeof Icon>[0]['name']} size={17} />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm">{activeRoom?.name ?? 'Select a room'}</h3>
              <p className="text-xs text-muted-foreground">{activeRoom?.description ?? ''}</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-muted-foreground">Live</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Icon name="ChatBubbleLeftRightIcon" size={40} className="opacity-20 mb-3" />
                <p className="text-sm font-medium">No messages yet</p>
                <p className="text-xs mt-1">Be the first to say something!</p>
              </div>
            ) : (
              groupedMessages.map(group => (
                <div key={group.date}>
                  <div className="flex items-center gap-3 my-4">
                    <div className="flex-1 h-px bg-border" />
                    <span className="text-[10px] font-semibold text-muted-foreground px-2">{group.date}</span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  <div className="space-y-3">
                    {group.messages.map((msg, idx) => {
                      const isOwn = msg.sender_id === user?.id;
                      const prevMsg = group.messages[idx - 1];
                      const showAvatar = !prevMsg || prevMsg.sender_id !== msg.sender_id;

                      return (
                        <div key={msg.id} className={`flex items-end gap-2.5 ${isOwn ? 'flex-row-reverse' : ''}`}>
                          {/* Avatar */}
                          <div className={`w-7 h-7 rounded-full overflow-hidden shrink-0 ${showAvatar ? '' : 'invisible'}`}>
                            {msg.sender_avatar ? (
                              <AppImage src={msg.sender_avatar} alt={msg.sender_name} width={28} height={28} className="object-cover w-full h-full" />
                            ) : (
                              <div className="w-full h-full bg-primary/20 flex items-center justify-center">
                                <Icon name="UserIcon" size={12} className="text-rose-deep" />
                              </div>
                            )}
                          </div>

                          <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                            {showAvatar && (
                              <div className={`flex items-center gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
                                <span className="text-xs font-bold text-foreground">{isOwn ? 'You' : msg.sender_name}</span>
                                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md ${ROLE_COLORS[msg.sender_role] || 'bg-gray-100 text-gray-600'}`}>
                                  {ROLE_LABELS[msg.sender_role] || msg.sender_role}
                                </span>
                              </div>
                            )}
                            <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                              isOwn
                                ? 'bg-primary text-foreground rounded-br-sm'
                                : 'bg-secondary text-foreground rounded-bl-sm'
                            }`}>
                              {msg.message}
                            </div>
                            <span className="text-[10px] text-muted-foreground">{formatTime(msg.created_at)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-5 py-4 border-t border-border">
            <form onSubmit={sendMessage} className="flex items-center gap-3">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={activeRoom ? `Message #${activeRoom.name.toLowerCase()}...` : 'Select a chat room…'}
                  disabled={!activeRoom}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all pr-12"
                  maxLength={500}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">
                  {input.length}/500
                </span>
              </div>
              <button
                type="submit"
                disabled={!activeRoom || !input.trim() || sending}
                className="w-11 h-11 bg-primary text-foreground rounded-xl flex items-center justify-center hover:bg-rose-deep hover:text-white transition-all shadow-rose disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                aria-label="Send message"
              >
                {sending ? (
                  <div className="w-4 h-4 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
                ) : (
                  <Icon name="PaperAirplaneIcon" size={16} />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
  );
}
