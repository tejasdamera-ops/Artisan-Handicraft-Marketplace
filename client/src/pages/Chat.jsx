import { Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import api from "../api/client.js";
import { getSocket } from "../api/socket.js";

const Chat = () => {
  const [searchParams] = useSearchParams();
  const initialUser = searchParams.get("user");
  const { accessToken, user } = useSelector((state) => state.auth);
  const [conversations, setConversations] = useState([]);
  const [activeUserId, setActiveUserId] = useState(initialUser || "");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const socket = useMemo(() => getSocket(accessToken), [accessToken]);

  useEffect(() => {
    api.get("/chat/conversations").then(({ data }) => setConversations(data));
  }, []);

  useEffect(() => {
    if (!activeUserId) return;
    api.get(`/chat/${activeUserId}`).then(({ data }) => setMessages(data));
  }, [activeUserId]);

  useEffect(() => {
    if (!socket) return;
    const handler = (message) => {
      const belongs = [message.senderId?._id, message.receiverId?._id].includes(activeUserId);
      if (belongs) setMessages((current) => [...current, message]);
    };
    socket.on("message:new", handler);
    return () => socket.off("message:new", handler);
  }, [activeUserId, socket]);

  const send = async (event) => {
    event.preventDefault();
    if (!activeUserId || !text.trim()) return;

    try {
      socket?.emit("message:send", { receiverId: activeUserId, text });
      if (!socket?.connected) {
        const { data } = await api.post("/chat", { receiverId: activeUserId, text });
        setMessages((current) => [...current, data]);
      }
      setText("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Message failed");
    }
  };

  return (
    <section className="section">
      <h1 className="mb-6 text-3xl font-black">Messages</h1>
      <div className="grid min-h-[620px] overflow-hidden rounded-lg border border-stone-200 bg-white lg:grid-cols-[320px_1fr]">
        <aside className="border-b border-stone-200 p-4 lg:border-b-0 lg:border-r">
          <input className="input mb-4" placeholder="Paste artisan or buyer user ID" value={activeUserId} onChange={(event) => setActiveUserId(event.target.value)} />
          <div className="grid gap-2">
            {conversations.map((conversation) => {
              const participants = conversation._id.split(":");
              const otherId = participants.find((id) => id !== user?._id);
              return (
                <button key={conversation._id} className={`rounded-md p-3 text-left text-sm ${activeUserId === otherId ? "bg-leaf text-white" : "bg-stone-50 hover:bg-stone-100"}`} onClick={() => setActiveUserId(otherId)}>
                  <strong>{otherId}</strong>
                  <span className="block truncate opacity-80">{conversation.lastMessage.text}</span>
                </button>
              );
            })}
          </div>
        </aside>
        <div className="flex min-h-[520px] flex-col">
          <div className="flex-1 space-y-3 overflow-auto p-4">
            {messages.map((message) => {
              const mine = message.senderId?._id === user?._id || message.senderId === user?._id;
              return (
                <div key={message._id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[78%] rounded-lg px-4 py-2 text-sm ${mine ? "bg-leaf text-white" : "bg-stone-100 text-ink"}`}>
                    {message.text}
                  </div>
                </div>
              );
            })}
            {!activeUserId && <p className="text-sm text-stone-500">Choose a conversation or paste a user ID to start messaging.</p>}
          </div>
          <form className="flex gap-3 border-t border-stone-200 p-4" onSubmit={send}>
            <input className="input" placeholder="Write a message" value={text} onChange={(event) => setText(event.target.value)} />
            <button className="icon-btn icon-btn-primary" title="Send message">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Chat;
