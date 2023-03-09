import { useState, useEffect } from "react";
import socket from "./socket";
import toast, { Toaster } from "react-hot-toast";
import ScrollToBottom from "react-scroll-to-bottom";
import { css } from "@emotion/css";

const ROOT_CSS = css({
  height: 650,
  width: window.innerWidth / 2,
});

function App() {
  // state
  const [username, setUsername] = useState("");
  const [connected, setConnected] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typing, setTyping] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  // private message
  const [privateMessage, setPrivateMessage] = useState("");

  useEffect(() => {
    socket.on("user joined", (msg) => {
      console.log("user joined message", msg);
    });

    socket.on("message", (data) => {
      // console.log("message", message);
      // setMessages((previousMessages) => [...previousMessages, message]);
      setMessages((previousMessages) => [
        ...previousMessages,
        {
          id: data.id,
          name: data.name,
          message: data.message,
        },
      ]);
    });

    return () => {
      socket.off("user joined");
      socket.off("message");
    };
  }, []);

  useEffect(() => {
    socket.on("user connected", (user) => {
      user.connected = true;
      user.messages = [];
      user.hasNewMessages = false;
      setUsers((prevUsers) => [...prevUsers, user]);
      toast.success(`${user.username} joined`);
    });

    socket.on("users", (users) => {
      // setUsers(users);
      users.forEach((user) => {
        user.self = user.userID === socket.id;
        user.connected = true;
        user.messages = [];
        user.hasNewMessages = false;
      });
      // put the current user first, and sort by username
      const sorted = users.sort((a, b) => {
        if (a.self) return -1;
        if (b.self) return 1;
        if (a.username < b.username) return -1;
        return a.username > b.username ? 1 : 0;
      });

      setUsers(sorted);
    });

    socket.on("username taken", () => {
      toast.error("Username taken");
    });

    return () => {
      socket.off("users");
      socket.off("user connected");
      socket.off("username taken");
    };
  }, [socket]);

  useEffect(() => {
    socket.on("user disconnected", (id) => {
      let allUsers = users;

      let index = allUsers.findIndex((el) => el.userID === id);
      let foundUser = allUsers[index];
      foundUser.connected = false;

      allUsers[index] = foundUser;
      setUsers([...allUsers]);
      // disconnected alert
      toast.error(`${foundUser.username} left`);
    });

    return () => {
      socket.off("user disconnected");
    };
  }, [users, socket]);

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
    socket.emit("message", {
      id: Date.now(),
      name: username,
      message,
    });
    setMessage("");
  };

  if (message) {
    socket.emit("typing", username);
  }

  useEffect(() => {
    socket.on("typing", (data) => {
      setTyping(data);
      setTimeout(() => {
        setTyping("");
      }, 1000);
    });

    return () => {
      socket.off("typing");
    };
  }, []);

  const handleUsernameClick = (user) => {
    if (user.self || !user.connected) return;
    setSelectedUser({ ...user, hasNewMessages: false });

    let allUsers = users;
    let index = allUsers.findIndex((u) => u.userID === user.userID);
    let foundUser = allUsers[index];
    foundUser.hasNewMessages = false;

    allUsers[index] = foundUser;
    setUsers([...allUsers]);
  };

  const handlePrivateMessage = (e) => {
    e.preventDefault();
    if (selectedUser) {
      socket.emit("private message", {
        message: privateMessage,
        to: selectedUser.userID,
      });

      let updated = selectedUser;
      updated.messages.push({
        message: privateMessage,
        fromSelf: true,
        hasNewMessages: false,
      });
      setSelectedUser(updated);
      setPrivateMessage("");
    }
  };

  return (
    <div className="container text-center">
      <Toaster />
      <div className="row">
        <div className="d-flex justify-content-evenly pt-2 pb-1">
          {connected &&
            users.map((user) => (
              <div key={user.userID} onClick={() => handleUsernameClick(user)}>
                {user.username.charAt(0).toUpperCase() + user.username.slice(1)}{" "}
                {user.self && "(yourself)"}
                {user.connected ? (
                  <span className="online-dot"></span>
                ) : (
                  <span className="offline-dot"></span>
                )}
              </div>
            ))}
        </div>
      </div>

      {!connected && (
        <div className="row">
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
        </div>
      )}

      <div className="row">
        {connected && (
          <div className="col-md-6">
            <form onSubmit={handleMessage} className="text-center pt-3">
              <div className="row g-3">
                <div className="col-10">
                  <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    type="text"
                    placeholder="Type your message"
                    className="form-control"
                  />
                </div>

                <div className="col-2">
                  <button className="btn btn-secondary" type="submit">
                    Send
                  </button>
                </div>
              </div>
            </form>

            <br />

            <div className="col">
              <ScrollToBottom className={ROOT_CSS}>
                {messages.map((m) => (
                  <div className="alert alert-secondary" key={m.id}>
                    {m.name.charAt(0).toUpperCase() + m.name.slice(1)} -{" "}
                    {m.message}
                  </div>
                ))}
              </ScrollToBottom>
              <br />
              {typing && typing}
            </div>
          </div>
        )}

        <br />

        {selectedUser && (
          <div className="col-md-6">
            <form onSubmit={handlePrivateMessage} className="text-center pt-3">
              <div className="row g-3">
                <div className="col-10">
                  <input
                    value={privateMessage}
                    onChange={(e) => setPrivateMessage(e.target.value)}
                    type="text"
                    placeholder="Type your private message"
                    className="form-control"
                  />
                </div>

                <div className="col-2">
                  <button className="btn btn-secondary" type="submit">
                    Send
                  </button>
                </div>
              </div>
            </form>

            <br />

            <div className="col">
              <ScrollToBottom className={ROOT_CSS}>
                {JSON.stringify(selectedUser, null, 4)}
              </ScrollToBottom>
              <br />
              {typing && typing}
            </div>
          </div>
        )}

        <br />
      </div>

      <div className="row">
        {/* <pre>{JSON.stringify(user, null, 4)}</pre> */}
      </div>
    </div>
  );
}

export default App;
