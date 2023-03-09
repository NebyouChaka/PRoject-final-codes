import { useState, useEffect } from "react";
import socket from "./socket";

function App() {
  // state
  const [username, setUsername] = useState("");

  const handleUsername = (e) => {
    e.preventDefault();
    console.log(username);
    socket.emit("username", username);
  };

  return (
    <div className="container text-center">
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
    </div>
  );
}

export default App;
