const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const connectiondb = require("./config/db");

const connectDB = require("./config/db");

dotenv.config();

const app = express();

connectiondb();
//middleware
app.use(cors());
app.use(express.json());

const servers = http.createServer(app);

const io = new Server(servers , {
    cors:{
        origin : "*"
    }
});

io.on("connection", (socket) => {
    console.log("user connected", socket.id);

    socket.on("disconnect", () => {
        console.log("user dissconnected");
    });
});

app.get("/", (req, res) => {
  res.send("SyncPad API Running");
});

const PORT = process.env.PORT || 5000;

servers.listen(PORT , ()=>{
    console.log(`server is running on port ${PORT}`);
});
