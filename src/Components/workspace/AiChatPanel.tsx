import { SendHorizontal } from "lucide-react";
import { useState } from "react";

/**
 * cette fonction permet de creer le panel chat avec IA 
 * @returns 
 */
export default function AIChatPanel() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;

    setMessages([...messages, input]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-blue-950">

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, index) => (
          <div
            key={index}
            className="bg-base-200 p-3 rounded-lg"
          >
            {msg}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your diagram..."
          className="input input-bordered flex-1"
        />
        <button
          onClick={handleSend}
          className="btn btn-primary"
        >
           <SendHorizontal />
        </button>
      </div>
    </div>
  );
}

