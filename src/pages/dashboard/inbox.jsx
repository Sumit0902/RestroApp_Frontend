import React, { useState, useEffect, useRef } from 'react';
import useAuthAxios from '@/lib/authAxios';
import { useSelector } from 'react-redux';
import { Card, Spinner } from '@material-tailwind/react';
import { differenceInHours, differenceInMinutes, format, isToday, isYesterday } from 'date-fns';
import EmojiPicker from 'emoji-picker-react';

export function Inbox() {
    const [conversations, setConversations] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const messagesEndRef = useRef(null);
    const authAxios = useAuthAxios();
    const userData = useSelector((state) => state.auth.user);

    // Fetch conversations
    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const response = await authAxios.get(`/conversations`);
                setConversations(response.data.data);
            } catch (error) {
                console.error('Error fetching conversations:', error);
            }
        };

        fetchConversations();
    }, []);

    // Fetch messages for the active chat
    useEffect(() => {
        const fetchMessages = async () => {
            if (activeChat) {
                try {
                    const response = await authAxios.get(`/messages/${activeChat.id}`);
                    setMessages(response.data);
                } catch (error) {
                    console.error('Error fetching messages:', error);
                }
            }
        };

        fetchMessages();
    }, [activeChat]);

    // Poll for new messages every 4 seconds
    useEffect(() => {
        const interval = setInterval(async () => {
            if (activeChat) {
                try {
                    const response = await authAxios.get(`/messages/${activeChat.id}/new`);
                    const newMessages = response.data.data;

                    if (newMessages.length > 0) {
                        setMessages((prev) => {
                            const existingMessageIds = new Set(prev.map((msg) => msg.id));
                            const filteredMessages = newMessages.filter(
                                (msg) => !existingMessageIds.has(msg.id)
                            );

                            return [...prev, ...filteredMessages];
                        });
                        scrollToBottom(true);
                        // Mark unread messages as read
                        const messageIdsToMarkAsRead = newMessages
                            .filter((msg) => msg.sender_id === activeChat.id && msg.is_read === 0)
                            .map((msg) => msg.id);

                        if (messageIdsToMarkAsRead.length > 0) {
                            try {
                                await authAxios.post(`/messages/mark-as-read`, {
                                    message_ids: messageIdsToMarkAsRead,
                                });
                            } catch (error) {
                                console.error('Error marking messages as read:', error);
                            }
                        }
                    }
                } catch (error) {
                    console.error('Error fetching new messages:', error);
                }
            }
        }, 8000);

        return () => clearInterval(interval);
    }, [activeChat]);

    const scrollToBottom = (onlyIfNearBottom = false) => {
        const chatContainer = messagesEndRef.current?.parentNode;
        if (chatContainer) {
            const isNearBottom =
                chatContainer.scrollHeight - chatContainer.scrollTop <= chatContainer.clientHeight + 100;

            if (!onlyIfNearBottom || isNearBottom) {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    function formatMessageTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();

        const diffInHours = differenceInHours(now, date);
        const diffInMinutes = differenceInMinutes(now, date);

        if (diffInHours < 3) {
            // Less than 3 hours ago
            if (diffInHours > 0) {
                const hours = Math.floor(diffInMinutes / 60);
                const minutes = diffInMinutes % 60;
                return `${hours} hour${hours > 1 ? 's' : ''} ${minutes} minute${minutes > 1 ? 's' : ''} ago`;
            } else {
                return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
            }
        } else if (isToday(date)) {
            // Less than 24 hours ago (today)
            return format(date, 'hh:mm a'); // e.g., "12:34 AM" or "03:50 PM"
        } else if (isYesterday(date)) {
            // Yesterday
            return `Yesterday ${format(date, 'hh:mm a')}`; // e.g., "Yesterday 12:30 AM"
        } else {
            // More than 48 hours ago
            return format(date, 'd/M/yy hh:mm a'); // e.g., "15/2/25 10:15 AM"
        }
    }

    const sendMessage = async (e) => {
        if (e.key === 'Enter' && newMessage.trim()) {
            const tempMessage = {
                id: `temp-${Date.now()}`,
                sender_id: userData.id,
                content: newMessage,
                created_at: null,
                is_sending: true,
            };

            setMessages((prev) => [...prev, tempMessage]);
            setNewMessage('');

            try {
                const response = await authAxios.post(`/messages`, {
                    receiver_id: activeChat.id,
                    content: newMessage,
                });

                setMessages((prev) =>
                    prev.map((msg) =>
                        msg.id === tempMessage.id
                            ? { ...response.data, is_sending: false }
                            : msg
                    )
                );
            } catch (error) {
                console.error('Error sending message:', error);
                setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
            }
        }
    };

    const onEmojiClick = (emojiObject, event) => {
        console.log(emojiObject, event)
        setShowEmojiPicker(false);
        setNewMessage((prev) => prev + emojiObject.emoji);
    };

    return (
        <Card className='mt-8 rounded-lg'>
            <div className="flex max-h-screen h-[calc(100vh_-_12rem)] overflow-hidden">
                {/* Sidebar */}
                <div className="w-1/4 bg-white border-r border-b rounded-l-xl overflow-hidden">
                    <h2 className="p-4 text-lg font-bold bg-black text-white">Chats</h2>
                    {conversations.map((conv) => (
                        <div
                            key={conv.id}
                            className={`p-4 cursor-pointer hover:bg-gray-200 ${
                                activeChat?.id === conv.id ? 'bg-gray-200' : ''
                            }`}
                            onClick={() => setActiveChat(conv)}
                        >
                            <div className="font-semibold">{conv.name}</div>
                            <div className="text-sm text-gray-600 truncate">{conv.last_message}</div>
                        </div>
                    ))}
                </div>

                {/* Chat Area */}
                <div className="flex-1 flex flex-col">
                    {activeChat ? (
                        <>
                            <div className="p-4 border-b">
                                <h2 className="text-lg font-bold">{activeChat.name}</h2>
                            </div>
                            <div id="chat-container" className="flex-1 p-4 overflow-y-auto">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`mb-4 ${
                                            msg.sender_id === userData.id ? 'text-right' : 'text-left'
                                        }`}
                                    >
                                        <div
                                            className={`inline-block p-2 rounded-lg ${
                                                msg.sender_id === userData.id
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-gray-200'
                                            }`}
                                        >
                                            {msg.content}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {msg.is_sending ? (
                                                <div className="flex items-center">
                                                    <Spinner className="h-4 w-4 text-gray-500" />
                                                    <span className="ml-2">Sending...</span>
                                                </div>
                                            ) : (
                                                formatMessageTime(msg.created_at)
                                            )}
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>
                            <div className="p-4 border-t relative">
                                {/* Emoji Picker */}
                                {showEmojiPicker && (
                                    <div className="absolute bottom-16 left-4 z-10">
                                        <EmojiPicker onEmojiClick={onEmojiClick} />
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowEmojiPicker((prev) => !prev)}
                                        className="p-2 border rounded-lg bg-gray-100 hover:bg-gray-200"
                                    >
                                        😊
                                    </button>
                                    <textarea
                                        id="message-textarea"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                sendMessage(e);
                                            }
                                        }}
                                        className="w-full p-2 border rounded-lg resize-none"
                                        rows={3}
                                        placeholder="Type a message and press Enter..."
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <p>Select a conversation to start chatting</p>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );
}
