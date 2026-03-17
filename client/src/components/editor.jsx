import { useEffect, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { io } from "socket.io-client";

const SERVER_URL = "http://localhost:5000";

const Editor = () => {
  const [socket, setSocket] = useState(null);
  const [quill, setQuill] = useState(null);

  const documentId = "123";

  // 🔌 socket connect
  useEffect(() => {
    const s = io(SERVER_URL);
    setSocket(s);

    return () => s.disconnect();
  }, []);

  // 📝 create editor
  useEffect(() => {
    const editorDiv = document.getElementById("editor");

    const q = new Quill(editorDiv, {
      theme: "snow",
    });

    q.disable();
    setQuill(q);
  }, []);

  // 📄 load document
  useEffect(() => {
    if (!socket || !quill) return;

    socket.once("load-document", (data) => {
      quill.setContents(data);
      quill.enable();
    });

    socket.emit("get-document", documentId);
  }, [socket, quill]);

  // 🔁 send changes
  useEffect(() => {
    if (!socket || !quill) return;

    const handler = (delta, oldDelta, source) => {
      if (source !== "user") return;
      socket.emit("send-changes", delta);
    };

    quill.on("text-change", handler);

    return () => quill.off("text-change", handler);
  }, [socket, quill]);

  // 📥 receive changes
  useEffect(() => {
    if (!socket || !quill) return;

    const handler = (delta) => {
      quill.updateContents(delta);
    };

    socket.on("receive-changes", handler);

    return () => socket.off("receive-changes", handler);
  }, [socket, quill]);

  // 💾 auto save
  useEffect(() => {
    if (!socket || !quill) return;

    const interval = setInterval(() => {
      socket.emit("save-document", quill.getContents());
    }, 2000);

    return () => clearInterval(interval);
  }, [socket, quill]);

  return <div id="editor" style={{ height: "100vh" }}></div>;
};

export default Editor;