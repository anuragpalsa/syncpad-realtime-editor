const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
// const connectiondb = require("./config/db");
const {getOrCreateDocument} = require("./controllers/documentControllers");
const Document = require("./models/document");
const multer = require("multer");

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

    // Join a document
    socket.on("get-document", async (documentId, collaborator = {}) => {
        try {
            // Clean up an earlier document room if this socket switches documents
            const previousDocumentId = socket.data.documentId;

            if (previousDocumentId && previousDocumentId !== documentId) {
                socket.leave(previousDocumentId);

                activeUsers[previousDocumentId] =
                    (activeUsers[previousDocumentId] || []).filter(
                        (user) => user.socketId !== socket.id
                    );

                io.to(previousDocumentId).emit(
                    "collaborators-update",
                    activeUsers[previousDocumentId]
                );

                io.to(previousDocumentId).emit(
                    "user-count",
                    activeUsers[previousDocumentId].length
                );
            }

            socket.data.documentId = documentId;

            // Create a fallback identity until the frontend sends a profile
            const name =
                typeof collaborator.name === "string" &&
                collaborator.name.trim()
                    ? collaborator.name.trim().slice(0, 24)
                    : `Guest ${socket.id.slice(0, 4)}`;

            const color =
                typeof collaborator.color === "string" &&
                /^#[0-9a-fA-F]{6}$/.test(collaborator.color)
                    ? collaborator.color
                    : "#64748b";

            socket.data.collaborator = { name, color };

            socket.join(documentId);

            if (!activeUsers[documentId]) {
                activeUsers[documentId] = [];
            }

            // Avoid duplicate entries for the same socket
            const existingUser = activeUsers[documentId].find(
                (user) => user.socketId === socket.id
            );

            if (existingUser) {
                existingUser.name = name;
                existingUser.color = color;
            } else {
                activeUsers[documentId].push({
                    socketId: socket.id,
                    name,
                    color
                });
            }

            // Send the current collaborator list and user count
            io.to(documentId).emit(
                "collaborators-update",
                activeUsers[documentId]
            );

            io.to(documentId).emit(
                "user-count",
                activeUsers[documentId].length
            );

            // Load the saved document
            const document = await getOrCreateDocument(documentId);

            socket.emit(
                "load-document",
                document?.content
                    ? JSON.parse(document.content)
                    : ""
            );
        } catch (error) {
            console.error("Error loading document:", error);
        }
    });

    // Broadcast text changes to other collaborators
    socket.on("send-changes", (delta) => {
        const documentId = socket.data.documentId;

        if (!documentId) return;

        socket.broadcast
            .to(documentId)
            .emit("receive-changes", delta);
    });

    // Save document content to MongoDB
    socket.on("save-document", async (data) => {
        const documentId = socket.data.documentId;

        if (!documentId) return;

        try {
            await Document.findOneAndUpdate(
                { documentId },
                { content: JSON.stringify(data) }
            );
        } catch (error) {
            console.error("Save error:", error);
        }
    });

    // Broadcast cursor position and selection
    socket.on("cursor-update", (data) => {
        const documentId = socket.data.documentId;

        if (!documentId) return;

        socket.broadcast
            .to(documentId)
            .emit("cursor-update", {
                socketId: socket.id,
                collaborator: socket.data.collaborator,
                range: data?.range ?? null
            });
    });

    // Remove a disconnected collaborator
    socket.on("disconnect", () => {
        const documentId = socket.data.documentId;

        if (!documentId || !activeUsers[documentId]) return;

        activeUsers[documentId] = activeUsers[documentId].filter(
            (user) => user.socketId !== socket.id
        );

        io.to(documentId).emit(
            "collaborators-update",
            activeUsers[documentId]
        );

        io.to(documentId).emit(
            "user-count",
            activeUsers[documentId].length
        );

        if (activeUsers[documentId].length === 0) {
            delete activeUsers[documentId];
        }
    });
});


    //image backend code 
  const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

app.post("/upload", upload.single("image"), (req, res) => {
  const imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
  res.json({ url: imageUrl });
});

app.use("/uploads", express.static("uploads"));


app.get("/", (req, res) => {
  res.send("SyncPad API Running");
});

const PORT = process.env.PORT || 5000;

servers.listen(PORT , ()=>{
    console.log(`server is running on port ${PORT}`);
});


