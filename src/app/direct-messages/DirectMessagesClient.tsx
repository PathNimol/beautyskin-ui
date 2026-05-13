'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import { useMockAuth } from '@/contexts/MockAuthContext';
import { createClient } from '@/lib/supabase/client';
import { MOCK_USERS } from '@/lib/mock/data';
import { emailService } from '@/lib/emailService';

interface DirectMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: string;
  sender_avatar: string;
  recipient_id: string;
  recipient_name: string;
  recipient_role: string;
  message: string;
  message_type: string;
  is_read: boolean;
  created_at: string;
}

interface Conversation {
  userId: string;
  userName: string;
  userRole: string;
  userAvatar: string;
  lastMessage: string;
  lastTime: string;
  unreadCount: number;
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

function getConversationId(userId1: string, userId2: string): string {
  return [userId1, userId2].sort().join('_');
}

export default function DirectMessagesClient() {
  const { user, role } = useMockAuth();
  const supabase = createClient();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get available users to message (role-gated)
  const availableUsers = MOCK_USERS.filter(u => {
    if (!u || u.id === user?.id) return false;
    if (role === 'buyer') return u.role === 'staff' || u.role === 'owner' || u.role === 'admin';
    if (role === 'staff') return true;
    if (role === 'owner') return true;
    if (role === 'admin') return true;
    return false;
  });

  const filteredUsers = availableUsers.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const fetchConversations = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await supabase
        .from('direct_messages')
        .select('*')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (data) {
        const convMap = new Map<string, Conversation>();
        (data as DirectMessage[]).forEach(msg => {
          const otherId = msg.sender_id === user.id ? msg.recipient_id : msg.sender_id;
          const otherName = msg.sender_id === user.id ? msg.recipient_name : msg.sender_name;
          const otherRole = msg.sender_id === user.id ? msg.recipient_role : msg.sender_role;
          const otherAvatar = msg.sender_id === user.id ? '' : msg.sender_avatar;
          const convId = msg.conversation_id;

          if (!convMap.has(convId)) {
            convMap.set(convId, {
              userId: otherId,
              userName: otherName,
              userRole: otherRole,
              userAvatar: otherAvatar,
              lastMessage: msg.message,
              lastTime: msg.created_at,
              unreadCount: (!msg.is_read && msg.recipient_id === user.id) ? 1 : 0,
            });
          } else {
            const existing = convMap.get(convId)!;
            if (!msg.is_read && msg.recipient_id === user.id) {
              existing.unreadCount += 1;
            }
          }
        });
        setConversations(Array.from(convMap.values()));
      }
    } catch { /* ignore */ }
    setLoading(false);
  }, [supabase, user]);

  const fetchMessages = useCallback(async (conversationId: string) => {
    try {
      const { data } = await supabase
        .from('direct_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      if (data) setMessages(data as DirectMessage[]);

      // Mark as read
      if (user) {
        await supabase
          .from('direct_messages')
          .update({ is_read: true })
          .eq('conversation_id', conversationId)
          .eq('recipient_id', user.id);
      }
    } catch { /* ignore */ }
  }, [supabase, user]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (!activeConversation || !user) return;
    const convId = getConversationId(user.id, activeConversation.userId);
    fetchMessages(convId);

    const channel = supabase
      .channel(`dm_${convId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'direct_messages',
        filter: `conversation_id=eq.${convId}`,
      }, (payload) => {
        setMessages(prev => {
          const exists = prev.find(m => m.id === payload.new.id);
          if (exists) return prev;
          return [...prev, payload.new as DirectMessage];
        });
        fetchConversations();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeConversation, user, supabase, fetchMessages, fetchConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startConversation = (targetUser: typeof MOCK_USERS[0]) => {
    setActiveConversation({
      userId: targetUser.id,
      userName: targetUser.name,
      userRole: targetUser.role,
      userAvatar: targetUser.avatar || '',
      lastMessage: '',
      lastTime: '',
      unreadCount: 0,
    });
    setSearchQuery('');
    if (user) {
      const convId = getConversationId(user.id, targetUser.id);
      fetchMessages(convId);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending || !user || !activeConversation) return;
    setSending(true);
    const text = input.trim();
    setInput('');

    try {
      const convId = getConversationId(user.id, activeConversation.userId);
      await supabase.from('direct_messages').insert({
        conversation_id: convId,
        sender_id: user.id,
        sender_name: user.name,
        sender_role: role || 'buyer',
        sender_avatar: user.avatar || '',
        recipient_id: activeConversation.userId,
        recipient_name: activeConversation.userName,
        recipient_role: activeConversation.userRole,
        message: text,
        message_type: 'text',
        is_read: false,
      });

      // Send email notification
      const recipientUser = MOCK_USERS.find(u => u.id === activeConversation.userId);
      if (recipientUser?.email) {
        emailService.sendChatNotification(recipientUser.email, {
          senderName: user.name,
          senderRole: ROLE_LABELS[role || 'buyer'] || role || 'User',
          recipientName: activeConversation.userName,
          message: text,
        });
      }

      fetchConversations();
    } catch { /* ignore */ }
    setSending(false);
    inputRef.current?.focus();
  };

  const formatTime = (iso: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDate = (iso: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <DashboardLayout title="Direct Messages" subtitle="Private one-to-one messaging">
      <div className="flex gap-4 h-[calc(100vh-200px)] min-h-[500px]">
        {/* Left Panel: Conversations + User Search */}
        <div className="w-72 shrink-0 bg-card border border-border rounded-2xl flex flex-col overflow-hidden">
          <div className="px-4 py-4 border-b border-border">
            <h3 className="font-bold text-foreground text-sm mb-3">Messages</h3>
            <div className="relative">
              <Icon name="MagnifyingGlassIcon" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-secondary border border-border rounded-xl text-xs focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Search results */}
            {searchQuery && (
              <div className="p-2 border-b border-border">
                <p className="text-[10px] font-semibold text-muted-foreground px-2 mb-1">START NEW CHAT</p>
                {filteredUsers.length === 0 ? (
                  <p className="text-xs text-muted-foreground px-2 py-2">No users found</p>
                ) : (
                  filteredUsers.slice(0, 5).map(u => (
                    <button
                      key={u.id}
                      onClick={() => startConversation(u)}
                      className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-secondary transition-all text-left"
                    >
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-primary/20 shrink-0">
                        {u.avatar ? (
                          <AppImage src={u.avatar} alt={u.name} width={32} height={32} className="object-cover w-full h-full" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Icon name="UserIcon" size={14} className="text-rose-deep" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{u.name}</p>
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md ${ROLE_COLORS[u.role]}`}>
                          {ROLE_LABELS[u.role]}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* Existing conversations */}
            {!searchQuery && (
              <div className="p-2 space-y-1">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <Icon name="ChatBubbleLeftRightIcon" size={32} className="opacity-20 mb-2" />
                    <p className="text-xs">No conversations yet</p>
                    <p className="text-[10px] mt-1">Search for a user to start</p>
                  </div>
                ) : (
                  conversations.map(conv => (
                    <button
                      key={conv.userId}
                      onClick={() => setActiveConversation(conv)}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all ${
                        activeConversation?.userId === conv.userId ? 'bg-primary/15' : 'hover:bg-secondary'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-primary/20">
                          {conv.userAvatar ? (
                            <AppImage src={conv.userAvatar} alt={conv.userName} width={36} height={36} className="object-cover w-full h-full" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Icon name="UserIcon" size={16} className="text-rose-deep" />
                            </div>
                          )}
                        </div>
                        {conv.unreadCount > 0 && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-foreground truncate">{conv.userName}</p>
                          <span className="text-[9px] text-muted-foreground shrink-0 ml-1">{formatTime(conv.lastTime)}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate mt-0.5">{conv.lastMessage || 'No messages yet'}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-card border border-border rounded-2xl flex flex-col overflow-hidden">
          {!activeConversation ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Icon name="ChatBubbleLeftRightIcon" size={48} className="opacity-20 mb-4" />
              <p className="text-sm font-medium">Select a conversation</p>
              <p className="text-xs mt-1">Or search for a user to start chatting</p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="px-5 py-4 border-b border-border flex items-center gap-3">
                <div className="w-9 h-9 rounded-full overflow-hidden bg-primary/20 shrink-0">
                  {activeConversation.userAvatar ? (
                    <AppImage src={activeConversation.userAvatar} alt={activeConversation.userName} width={36} height={36} className="object-cover w-full h-full" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon name="UserIcon" size={16} className="text-rose-deep" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm">{activeConversation.userName}</h3>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${ROLE_COLORS[activeConversation.userRole] || 'bg-gray-100 text-gray-600'}`}>
                    {ROLE_LABELS[activeConversation.userRole] || activeConversation.userRole}
                  </span>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-muted-foreground">Online</span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Icon name="ChatBubbleLeftEllipsisIcon" size={36} className="opacity-20 mb-3" />
                    <p className="text-sm font-medium">Start the conversation</p>
                    <p className="text-xs mt-1">Send a message to {activeConversation.userName}</p>
                  </div>
                ) : (
                  (() => {
                    const groups: { date: string; msgs: DirectMessage[] }[] = [];
                    messages.forEach(msg => {
                      const date = formatDate(msg.created_at);
                      const last = groups[groups.length - 1];
                      if (last && last.date === date) last.msgs.push(msg);
                      else groups.push({ date, msgs: [msg] });
                    });
                    return groups.map(group => (
                      <div key={group.date}>
                        <div className="flex items-center gap-3 my-4">
                          <div className="flex-1 h-px bg-border" />
                          <span className="text-[10px] font-semibold text-muted-foreground px-2">{group.date}</span>
                          <div className="flex-1 h-px bg-border" />
                        </div>
                        <div className="space-y-2">
                          {group.msgs.map(msg => {
                            const isOwn = msg.sender_id === user?.id;
                            return (
                              <div key={msg.id} className={`flex items-end gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
                                <div className="w-6 h-6 rounded-full overflow-hidden bg-primary/20 shrink-0">
                                  {msg.sender_avatar ? (
                                    <AppImage src={msg.sender_avatar} alt={msg.sender_name} width={24} height={24} className="object-cover w-full h-full" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Icon name="UserIcon" size={10} className="text-rose-deep" />
                                    </div>
                                  )}
                                </div>
                                <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
                                  <div className={`px-4 py-2.5 rounded-2xl text-sm ${
                                    isOwn
                                      ? 'bg-primary text-foreground rounded-br-sm'
                                      : 'bg-secondary text-foreground rounded-bl-sm'
                                  }`}>
                                    {msg.message}
                                  </div>
                                  <span className="text-[9px] text-muted-foreground mt-1 px-1">{formatTime(msg.created_at)}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ));
                  })()
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={sendMessage} className="px-5 py-4 border-t border-border flex items-center gap-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={`Message ${activeConversation.userName}...`}
                  className="flex-1 px-4 py-3 bg-secondary border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-all"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || sending}
                  className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center hover:bg-rose-deep hover:text-white transition-all disabled:opacity-50 shrink-0"
                >
                  {sending ? (
                    <div className="w-4 h-4 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Icon name="PaperAirplaneIcon" size={16} />
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
