import React from "react";
import { useEffect } from "react";
import ReactDOM from "react-dom/client";

//Private
// A set of colors to assign to users based on their name hash
const USER_COLORS = [
  "#dc2626",
  "#ea580c",
  "#ca8a04",
  "#16a34a",
  "#0891b2",
  "#2563eb",
  "#7c3aed",
  "#db2777",
];

function getUserColor(userName) {
  let hash = 0;

  for (let index = 0; index < userName.length; index += 1) {
    hash = userName.charCodeAt(index) + ((hash << 5) - hash);
  }

  return USER_COLORS[Math.abs(hash) % USER_COLORS.length];
}

function getWebSocketUrl() {
  const configuredUrl = import.meta.env.VITE_WS_URL?.trim();

  if (configuredUrl) {
    return configuredUrl;
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/ws`;
}

function App() {
  const [messages, setMessages] = React.useState([]);
  const [text, setText] = React.useState("");
  const [user, setUser] = React.useState("User");
  const [isConnected, setIsConnected] = React.useState(false);
  const socketRef = React.useRef(null);

  useEffect(() => {
    const socket = new WebSocket(getWebSocketUrl());
    socketRef.current = socket;

    socket.addEventListener("open", () => {
      setIsConnected(true);
    });

    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      setMessages((currentMessages) => [...currentMessages, message]);
    });

    socket.addEventListener("close", () => {
      setIsConnected(false);
    });

    return () => {
      socket.close();
    };
  }, []);

  function handleSendMessage() {
    const trimmedText = text.trim();
    const trimmedUser = user.trim() || "User";

    if (
      !trimmedText ||
      !socketRef.current ||
      socketRef.current.readyState !== WebSocket.OPEN
    ) {
      return;
    }

    const message = {
      id: crypto.randomUUID(),
      text: trimmedText,
      user: trimmedUser,
      timestamp: Date.now(),
    };

    socketRef.current.send(JSON.stringify(message));
    setText("");
  }

  function handleComposerKeyDown(event) {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  }

  return (
    <main style={styles.page}>
      <section style={styles.chatCard}>
        <h1 style={styles.title}>Realtime Chat</h1>
        <p style={styles.status}>
          {isConnected ? "Connected to server" : "Connecting..."}
        </p>

        <div style={styles.userRow}>
          <label htmlFor="user" style={styles.label}>
            Name
          </label>
          <input
            id="user"
            value={user}
            onChange={(event) => setUser(event.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.messages}>
          {messages.length === 0 ? (
            <p style={styles.emptyState}>No messages yet.</p>
          ) : (
            messages.map((message) => {
              const userColor = getUserColor(message.user);

              return (
                <article
                  key={message.id}
                  style={{
                    ...styles.messageItem,
                    borderLeft: `4px solid ${userColor}`,
                  }}
                >
                  <div style={styles.messageMeta}>
                    <strong style={{ color: userColor }}>{message.user}</strong>
                    <span>{new Date(message.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p style={styles.messageText}>{message.text}</p>
                </article>
              );
            })
          )}
        </div>

        <div style={styles.composer}>
          <input
            value={text}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={handleComposerKeyDown}
            placeholder="Type a message"
            style={styles.input}
          />
          <button
            type="button"
            onClick={handleSendMessage}
            style={styles.button}
            disabled={!isConnected}
          >
            Send
          </button>
        </div>
      </section>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    margin: 0,
    display: "grid",
    placeItems: "center",
    background: "#f4f7fb",
    fontFamily: "system-ui, sans-serif",
    padding: "24px",
  },
  chatCard: {
    width: "100%",
    maxWidth: "640px",
    background: "#ffffff",
    border: "1px solid #d6deeb",
    borderRadius: "16px",
    padding: "20px",
    boxSizing: "border-box",
  },
  title: {
    marginTop: 0,
    marginBottom: "8px",
  },
  status: {
    marginTop: 0,
    marginBottom: "16px",
    color: "#475467",
    fontSize: "14px",
  },
  userRow: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontSize: "14px",
    fontWeight: 600,
  },
  messages: {
    minHeight: "280px",
    maxHeight: "280px",
    overflowY: "auto",
    border: "1px solid #d6deeb",
    borderRadius: "12px",
    padding: "12px",
    background: "#f9fbff",
    marginBottom: "16px",
  },
  emptyState: {
    margin: 0,
    color: "#667085",
  },
  messageItem: {
    padding: "10px 12px",
    borderRadius: "10px",
    background: "#ffffff",
    border: "1px solid #e4e7ec",
    marginBottom: "10px",
  },
  messageMeta: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    fontSize: "12px",
    color: "#475467",
    marginBottom: "6px",
  },
  messageText: {
    margin: 0,
    color: "#101828",
  },
  composer: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: "12px",
  },
  input: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    boxSizing: "border-box",
  },
  button: {
    padding: "12px 18px",
    border: "none",
    borderRadius: "10px",
    background: "#111827",
    color: "#ffffff",
    cursor: "pointer",
  },
};

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
