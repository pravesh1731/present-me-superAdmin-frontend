import React, { useEffect, useRef, useState } from "react";

function Chat() {
  const [selectedChat, setSelectedChat] = useState(1);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [attachments, setAttachments] = useState([]); // {name, size, file}
  const [showEmoji, setShowEmoji] = useState(false);
  const fileInputRef = useRef(null);
  const emojiContainerRef = useRef(null);

  const conversations = [
    {
      id: 1,
      name: "MIT",
      fullName: "Massachusetts Institute of Technology",
      avatar: "M",
      lastMessage: "Thank you for the approval!",
      time: "2m ago",
      unread: 2,
      online: true,
      type: "institute",
      status: "verified",
    },
    {
      id: 2,
      name: "Stanford University",
      fullName: "Stanford University",
      avatar: "S",
      lastMessage: "When can we start onboarding?",
      time: "1h ago",
      unread: 0,
      online: true,
      type: "institute",
      status: "verified",
    },
    {
      id: 3,
      name: "Dr. John Smith",
      fullName: "Dr. John Smith - Harvard",
      avatar: "JS",
      lastMessage: "Need help with verification process",
      time: "3h ago",
      unread: 1,
      online: false,
      type: "teacher",
      status: "pending",
    },
    {
      id: 4,
      name: "Yale University",
      fullName: "Yale University",
      avatar: "Y",
      lastMessage: "Documents submitted for review",
      time: "5h ago",
      unread: 0,
      online: false,
      type: "institute",
      status: "verified",
    },
    {
      id: 5,
      name: "Princeton",
      fullName: "Princeton University",
      avatar: "P",
      lastMessage: "Thank you!",
      time: "1d ago",
      unread: 0,
      online: false,
      type: "institute",
      status: "verified",
    },
  ];

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "MIT",
      text: "Hello, we have submitted all required documents for verification.",
      time: "10:30 AM",
      isOwn: false,
    },
    {
      id: 2,
      sender: "You",
      text: "Thank you for submitting the documents. Our team is reviewing them.",
      time: "10:32 AM",
      isOwn: true,
    },
    {
      id: 3,
      sender: "MIT",
      text: "How long will the verification process take?",
      time: "10:35 AM",
      isOwn: false,
    },
    {
      id: 4,
      sender: "You",
      text: "The verification process typically takes 2-3 business days. We will notify you once completed.",
      time: "10:37 AM",
      isOwn: true,
    },
    {
      id: 5,
      sender: "MIT",
      text: "Thank you for the approval!",
      time: "2:45 PM",
      isOwn: false,
    },
  ]);

  // Filter to show only verified institutes (exclude pending institutes and teachers)
  const filteredConversations = conversations
    .filter((conv) => conv.type === "institute" && conv.status === "verified")
    .filter(
      (conv) =>
        conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.fullName.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const activeChat = conversations.find((c) => c.id === selectedChat);

  const handleSendMessage = () => {
    const hasText = message.trim().length > 0;
    const hasFiles = attachments.length > 0;
    if (!hasText && !hasFiles) return;

    // Prepare attachments for message payload (lightweight preview data)
    const finalAttachments = attachments.map((att) => {
      const file = att.file;
      const isImage = !!file && file.type && file.type.startsWith("image/");
      const url = file ? URL.createObjectURL(file) : null;
      return {
        name: att.name,
        size: att.size,
        type: file?.type || "",
        isImage,
        url,
      };
    });

    const now = new Date();
    const time = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });

    setMessages((prev) => [
      ...prev,
      {
        id: now.getTime(),
        sender: "You",
        text: message.trim(),
        time,
        isOwn: true,
        attachments: finalAttachments,
      },
    ]);

    setMessage("");
    setAttachments([]);
    setShowEmoji(false);
  };

  // Close emoji picker on outside click
  useEffect(() => {
    function onDocClick(e) {
      if (!showEmoji) return;
      if (
        emojiContainerRef.current &&
        !emojiContainerRef.current.contains(e.target)
      ) {
        setShowEmoji(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [showEmoji]);

  const handleChooseFiles = () => {
    fileInputRef.current?.click();
  };

  const handleFilesSelected = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length) {
      const mapped = files.map((f) => ({ name: f.name, size: f.size, file: f }));
      setAttachments((prev) => [...prev, ...mapped]);
      // reset input so selecting same file again triggers change
      e.target.value = "";
    }
  };

  const removeAttachment = (idx) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  };

  const commonEmojis = [
    "😀",
    "😄",
    "😍",
    "😂",
    "🙌",
    "👍",
    "🎉",
    "🚀",
    "❤️",
    "🔥",
  ];

  const addEmoji = (e) => {
    setMessage((prev) => prev + e);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex h-full">
        {/* Conversations List */}
        <div
          className={`w-full md:w-80 lg:w-96 border-r border-gray-200 flex flex-col ${
            selectedChat ? "hidden md:flex" : "flex"
          }`}
        >
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedChat(conv.id)}
                className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                  selectedChat === conv.id ? "bg-indigo-50" : ""
                }`}
              >
                <div className="relative shrink-0">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold ${
                      conv.type === "institute"
                        ? "bg-indigo-500"
                        : "bg-purple-500"
                    }`}
                  >
                    {conv.avatar}
                  </div>
                  {conv.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-gray-800 truncate">
                      {conv.name}
                    </h3>
                    <span className="text-xs text-gray-500 ml-2">
                      {conv.time}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {conv.lastMessage}
                  </p>
                </div>
                {conv.unread > 0 && (
                  <div className="shrink-0 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center text-xs text-white font-semibold">
                    {conv.unread}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div
          className={`flex-1 flex flex-col ${
            selectedChat ? "flex" : "hidden md:flex"
          }`}
        >
          {activeChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                <button
                  onClick={() => setSelectedChat(null)}
                  className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="19" y1="12" x2="5" y2="12" />
                    <polyline points="12 19 5 12 12 5" />
                  </svg>
                </button>
                <div className="relative">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${
                      activeChat.type === "institute"
                        ? "bg-indigo-500"
                        : "bg-purple-500"
                    }`}
                  >
                    {activeChat.avatar}
                  </div>
                  {activeChat.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1">
                  <h2 className="text-base font-semibold text-gray-800">
                    {activeChat.name}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {activeChat.online ? "Active now" : "Offline"}
                  </p>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5 text-gray-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="12" cy="5" r="1" />
                    <circle cx="12" cy="19" r="1" />
                  </svg>
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${
                      msg.isOwn ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md ${
                        msg.isOwn ? "order-2" : "order-1"
                      }`}
                    >
                      <div
                        className={`px-4 py-2 rounded-2xl ${
                          msg.isOwn
                            ? "bg-indigo-600 text-white rounded-br-sm"
                            : "bg-white text-gray-800 rounded-bl-sm border border-gray-200"
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="mt-2 space-y-2">
                            {msg.attachments.map((att, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs">
                                {att.isImage && att.url ? (
                                  <img
                                    src={att.url}
                                    alt={att.name}
                                    className="w-12 h-12 rounded object-cover border border-white/20"
                                  />
                                ) : (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="w-4 h-4 opacity-80"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                                  </svg>
                                )}
                                <span className="truncate max-w-40">{att.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div
                        className={`mt-1 text-xs text-gray-500 ${
                          msg.isOwn ? "text-right" : "text-left"
                        }`}
                      >
                        {msg.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                {/* Attached files preview */}
                {attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {attachments.map((att, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-2 px-2.5 py-1.5 bg-gray-100 text-gray-700 rounded-full text-xs border border-gray-200"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-4 h-4 text-gray-500"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                        </svg>
                        <span className="max-w-40 truncate">{att.name}</span>
                        <button
                          onClick={() => removeAttachment(idx)}
                          className="ml-1 w-5 h-5 inline-flex items-center justify-center rounded-full hover:bg-gray-200"
                          aria-label="Remove attachment"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-3.5 h-3.5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                <div className="relative flex gap-2 items-center">
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFilesSelected}
                  />

                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <div ref={emojiContainerRef} className="relative shrink-0">
                    <button
                      onClick={() => setShowEmoji((s) => !s)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                      aria-label="Insert emoji"
                      type="button"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-5 h-5 text-gray-600"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                        <line x1="9" y1="9" x2="9.01" y2="9" />
                        <line x1="15" y1="9" x2="15.01" y2="9" />
                      </svg>
                    </button>
                    {/* Emoji popover */}
                    {showEmoji && (
                      <div
                        className="absolute bottom-12 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-2 grid grid-cols-5 gap-1 z-40"
                      >
                        {commonEmojis.map((em) => (
                          <button
                            key={em}
                            onClick={() => addEmoji(em)}
                            className="w-8 h-8 rounded hover:bg-gray-100 text-lg"
                            type="button"
                          >
                            {em}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleChooseFiles}
                    className="p-2 hover:bg-gray-100 rounded-lg shrink-0"
                    aria-label="Attach files"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5 text-gray-600"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                    </svg>
                  </button>
                  <button
                    onClick={handleSendMessage}
                    aria-label="Send message"
                    className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shrink-0"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-10 h-10 text-indigo-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  No conversation selected
                </h3>
                <p className="text-sm text-gray-500">
                  Choose a conversation from the list to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Chat;
