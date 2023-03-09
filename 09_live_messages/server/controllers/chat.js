const chat = (io) => {
  //   console.log("live chat ---> ", io.opts);
  io.on("connection", (socket) => {
    // console.log("socket id", socket.id);
    socket.on("username", (username) => {
      console.log("username", username);
      // io.emit("user joined", `${username} joined`);
      socket.broadcast.emit("user joined", `${username} joined`);
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
