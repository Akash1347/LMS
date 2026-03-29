import React, { useState } from "react";
import { chatWithCourseAIApi } from "@/Api/course.api";
import { Send, X, Sparkles } from "lucide-react";
import { useLocation } from "react-router-dom";

const CourseAIChat = () => {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [lastMessage, setLastMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");

  const detectCourseIdFromPath = () => {
    const path = location.pathname || "";
    const coursePageMatch = path.match(/^\/course-page\/([^/]+)/);
    if (coursePageMatch?.[1]) return coursePageMatch[1];

    const courseMatch = path.match(/^\/course\/([^/]+)/);
    if (courseMatch?.[1]) return courseMatch[1];

    return null;
  };

  const handleSend = async () => {
    const trimmed = message.trim();
    if (!trimmed) return;

    setLastMessage(trimmed);
    setMessage("");
    setLoading(true);
    setError("");
    try {
      const courseId = detectCourseIdFromPath();
      const res = await chatWithCourseAIApi(trimmed, courseId);
      const aiReply = res?.data?.reply || "No response from AI";
      setReply(aiReply);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to get AI response");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] font-sans">
      {open && (
        <div className="mb-4 flex h-[620px] w-[380px] flex-col overflow-hidden rounded-[2rem] border border-zinc-200 bg-zinc-100 shadow-2xl transition-all animate-in fade-in zoom-in duration-200">
          {/* Header */}
          <div className="flex items-center justify-between p-4 pb-2">
            <div className="flex items-center gap-2 px-2">
              <div className="h-2 w-1 bg-blue-500 rounded-full" />
              <span className="text-lg font-medium text-zinc-700">EduSmart</span>
            </div>
            <button 
              onClick={() => setOpen(false)}
              className="rounded-full p-2 hover:bg-zinc-100 text-zinc-500"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {!reply && !loading && !error ? (
              <div className="flex h-full" />
            ) : (
              <div className="space-y-4">
                {/* User Message Placeholder (Optional) */}
                <div className="flex justify-end">
                  <p className="max-w-[80%] rounded-2xl bg-zinc-100 px-4 py-2 text-sm text-zinc-800">
                    {lastMessage}
                  </p>
                </div>

                {/* AI Response */}
                {loading ? (
                  <div className="flex items-center gap-2 text-zinc-400">
                    <span className="text-sm italic">Thinking...</span>
                  </div>
                ) : (
                  reply && (
                    <div className="animate-in slide-in-from-bottom-2">
                       <p className="text-[15px] leading-relaxed text-zinc-700">{reply}</p>
                    </div>
                  )
                )}
                
                {error && (
                  <p className="text-xs text-red-500 bg-red-50 p-2 rounded-lg">{error}</p>
                )}
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 pt-0">
            <div className="relative flex flex-col gap-2 rounded-[28px] bg-zinc-50 p-4 ring-1 ring-inset ring-zinc-200 focus-within:ring-2 focus-within:ring-blue-400">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask EduSmart"
                className="max-h-32 min-h-[40px] w-full resize-none bg-transparent text-[15px] outline-none placeholder:text-zinc-500"
                rows={1}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                    }
                }}
              />
              
              <div className="flex items-center justify-between">
                 
                
                <button
                  onClick={handleSend}
                  disabled={loading || !message.trim()}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-300 disabled:opacity-30"
                >
                  <Send size={18} fill="currentColor" />
                </button>
              </div>
            </div>
            <p className="mt-3 text-center text-[10px] text-zinc-400">
              EduSmart in Workspace can make mistakes. <span className="underline cursor-pointer">Learn more</span>
            </p>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="group relative flex h-14 w-14 items-center justify-center rounded-2xl bg-black text-white shadow-xl ring-1 ring-zinc-800 transition-all hover:scale-110 active:scale-95"
      >
        <span className="text-sm font-bold text-white">AI</span>
      </button>
    </div>
  );
};

export default CourseAIChat;