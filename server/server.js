const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const connectiondb = require("./config/db");
const {getOrCreateDocument} = require("./controllers/documentControllers");

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
    socket.on("get-document" , async(documentId) => {
        const document = await getOrCreateDocument(documentId);

        socket.join(documentId);

        socket.emit("load-document", document.content);

        socket.on("send-changes",(delta)=>{
            socket.broadcast.to(documentId).emit("receive-changes", delta);
        });

        socket.on("save-document",async(data) => {
            await Document.findOneAndUpdate(
                {documentId},
                {content :data}
            );
        });
    });
    
    });


app.get("/", (req, res) => {
  res.send("SyncPad API Running");
});

const PORT = process.env.PORT || 5000;

servers.listen(PORT , ()=>{
    console.log(`server is running on port ${PORT}`);
});
