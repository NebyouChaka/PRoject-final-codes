const users = [];

const addUser = (username) => {
  const name = username.trim().toLowerCase();
  const existingUser = users.find((u) => u === name);
  if (!username.trim()) return { error: "Name is required" };
  if (existingUser) {
    return {
      error: "Name is taken",
    };
  } else {
    users.push(name);
    return username;
  }
};

const chat = (io) => {
  //   console.log("live chat ---> ", io.opts);
  io.on("connection", (socket) => {
    // console.log("socket id", socket.id);
    socket.on("username", (username, next) => {
      // console.log("username", username);
      // io.emit("user joined", `${username} joined`);
      let result = addUser(username);
      if (result.error) {
        return next(result.error);
      } else {
        io.emit("users", users);
        socket.broadcast.emit("user joined", `${username} joined`);
      }
    });

    socket.on("message", (message) => {
      io.emit("message", message);
    });

    // disconnect
    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });
};

export default chat;
