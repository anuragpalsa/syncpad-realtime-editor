const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
// const connectiondb = require("./config/db");
const {getOrCreateDocument} = require("./controllers/documentControllers");
const Document = require("./models/document");

const connectDB = require("./config/db");

dotenv.config();

const app = express();

connectDB();
//middleware
app.use(cors());
app.use(express.json());

const activeUsers ={};

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
        //track usercount 
        if(!activeUsers[documentId]) {
          activeUsers[documentId] =[];
        }

        activeUsers[documentId].push(socket.id);
//send user count 
  io.to(documentId).emit("user-count" ,activeUsers[documentId].length);

       socket.emit("load-document",  document?.content ? JSON.parse(document.content) : "");

        socket.on("send-changes",(delta)=>{
            socket.broadcast.to(documentId).emit("receive-changes", delta);
        });

        //save ddocument
        socket.on("save-document", async (data) => {
    try {
        await Document.findOneAndUpdate(
            { documentId },
            { content: JSON.stringify(data) }
        );
    } catch (err) {
        console.log("Save error:", err);
    }
});

socket.on("disconnect" , ()=>{
 activeUsers[documentId] = activeUsers[documentId].filter(
    (id) => id !== socket.id
 );

  io.to(documentId).emit("user-count", activeUsers[documentId].length);
})
    });
    
    });


app.get("/", (req, res) => {
  res.send("SyncPad API Running");
});

const PORT = process.env.PORT || 5000;

servers.listen(PORT , ()=>{
    console.log(`server is running on port ${PORT}`);
});


