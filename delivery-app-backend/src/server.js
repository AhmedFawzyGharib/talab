require("dotenv").config();
const http = require("http");
const app = require("./app");
const connectDB = require("./config/db");
const { Server } = require("socket.io");

connectDB();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

/* ===============================
   Online Users Storage
================================= */
let onlineDrivers = {};
let onlineCustomers = {};

/* ===============================
   Socket Connection
================================= */
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  /* ===============================
     Register Driver (By Phone)
  ================================= */
  socket.on("registerDriver", (phone) => {
    if (!phone) return;

    console.log("Driver registered:", phone);
    onlineDrivers[phone] = socket.id;
  });

  /* ===============================
     Register Customer
  ================================= */
  socket.on("registerCustomer", (customerId) => {
    if (!customerId) return;

    onlineCustomers[customerId] = socket.id;
  });

  /* ===============================
     Join Order Room
  ================================= */
  socket.on("joinOrderRoom", (orderId) => {
    socket.join(orderId);
  });

  /* ===============================
     Live Location Update
  ================================= */
  socket.on(
    "driverLocationUpdate",
    ({ orderId, lat, lng }) => {
      io.to(orderId).emit("liveLocation", {
        lat,
        lng,
      });
    }
  );

  /* ===============================
     Order Accepted Notify Customer
  ================================= */
  socket.on(
    "orderAccepted",
    ({ orderId, customerId }) => {
      if (onlineCustomers[customerId]) {
        io.to(
          onlineCustomers[customerId]
        ).emit("orderAccepted", {
          orderId,
        });
      }
    }
  );

  /* ===============================
     Disconnect Cleanup
  ================================= */
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);

    for (const phone in onlineDrivers) {
      if (
        onlineDrivers[phone] === socket.id
      ) {
        delete onlineDrivers[phone];
      }
    }

    for (const id in onlineCustomers) {
      if (
        onlineCustomers[id] === socket.id
      ) {
        delete onlineCustomers[id];
      }
    }
  });
});

/* ===============================
   Make io Available Everywhere
================================= */
app.set("io", io);
app.set("onlineDrivers", onlineDrivers);
app.set("onlineCustomers", onlineCustomers);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(
    `🚀 Server running on port ${PORT}`
  );
});