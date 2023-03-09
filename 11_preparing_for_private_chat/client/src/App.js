import { useState, useEffect } from "react";
import socket from "./socket";

function App() {
  // state
  const [username, setUsername] = useState("");
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    socket.on("user joined", (msg) => {
      console.log("user joined message", msg);
    });

    socket.on("message", (message) => {
      // console.log("message", message);
      setMessages((previousMessages) => [...previousMessages, message]);
    });

    return () => {
      socket.off("user joined");
      socket.off("message");
    };
  }, []);

  useEffect(() => {
    socket.on("users", (users) => {
      setUsers(users);
    });

    return () => {
      socket.off("users");
    };
  }, [socket]);

  const handleUsername = (e) => {
    e.preventDefault();
    // console.log(username);
    // socket.emit("username", username);
    // setConnected(true);
    socket.auth = { username };
    socket.connect();
    console.log(socket);

    setTimeout(() => {
      if (socket.connected) {
        console.log("socket.connected", socket);
        setConnected(true);
      }
    }, 300);
  };

  const handleMessage = (e) => {
    e.preventDefault();
    socket.emit("message", `${username} - ${message}`);
    setMessage("");
  };

  return (
    <div className="container text-center">
      <div className="row">
        {connected ? (
          <form onSubmit={handleMessage} className="text-center pt-3">
            <div className="row g-3">
              <div className="col-md-8">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  type="text"
                  placeholder="Type your message"
                  className="form-control"
                />
              </div>

              <div className="col-md-4">
                <button className="btn btn-secondary" type="submit">
                  Send
                </button>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleUsername} className="text-center pt-3">
            <div className="row g-3">
              <div className="col-md-8">
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  type="text"
                  placeholder="Enter your name"
                  className="form-control"
                />
              </div>

              <div className="col-md-4">
                <button className="btn btn-secondary" type="submit">
                  Join
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      <div className="row pt-3">
        <div className="col-md-8">
          <pre>
            {messages.map((m, index) => (
              <div className="alert alert-secondary" key={index}>
                {m}
              </div>
            ))}
          </pre>
        </div>
        <div className="col-md-4">
          <pre>
            {users.map((u, index) => (
              <div className="alert alert-primary" key={index}>
                {u}
              </div>
            ))}
          </pre>
        </div>
      </div>
    </div>
  );
}

export default App;
