import { useEffect, useState , useRef, useMemo} from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { io } from "socket.io-client";
import {useParams } from "react-router-dom";
import Header from "./header";
import EditorBox from "./EditorBox";
// import Toolbar from "./toolbar";
import "./Editor.css";
import useCollaborators from "../hooks/useCollaborators";
import CollaboratorAvatars from "./CollaboratorAvatars";
import LiveCursors from "../components/LiveCursors";


const SERVER_URL = "http://localhost:5000";
const Delta = Quill.import("delta");

const BaseImage = Quill.import("formats/image");

class SyncPadImage extends BaseImage {
  static formats(node) {
    const formats = super.formats(node) || {};

    const width = node.style.width || node.getAttribute("width");
    const height = node.style.height || node.getAttribute("height");

    if (width) formats.width = width;
    if (height) formats.height = height;

    formats.imageAlign =
      node.getAttribute("data-image-align") || "left";

    formats.imageMode =
      node.getAttribute("data-image-mode") || "inline";

    const left = node.getAttribute("data-image-left");
    const top = node.getAttribute("data-image-top");

    if (left !== null) formats.imageLeft = left;
    if (top !== null) formats.imageTop = top;

    return formats;
  }

  format(name, value) {
    const node = this.domNode;

    if (name === "width" || name === "height") {
      if (value) {
        node.style[name] =
          typeof value === "number" ? `${value}px` : value;

        node.setAttribute(name, parseInt(value, 10));
      } else {
        node.style[name] = "";
        node.removeAttribute(name);
      }
      return;
    }

    if (name === "imageAlign") {
      node.setAttribute("data-image-align", value);

      if (node.getAttribute("data-image-mode") !== "free") {
        node.style.display = "block";
        node.style.margin =
          value === "center"
            ? "10px auto"
            : value === "right"
              ? "10px 0 10px auto"
              : "10px auto 10px 0";
      }
      return;
    }

    if (name === "imageMode") {
      node.setAttribute("data-image-mode", value);

      if (value === "free") {
        node.style.position = "absolute";
        node.style.margin = "0";
      } else {
        node.style.position = "";
        node.style.left = "";
        node.style.top = "";
        node.style.margin = "";
      }
      return;
    }

    if (name === "imageLeft" || name === "imageTop") {
      const property = name === "imageLeft" ? "left" : "top";
      const attribute =
        name === "imageLeft" ? "data-image-left" : "data-image-top";

      if (value !== null && value !== undefined) {
        node.setAttribute(attribute, value);
        node.style[property] = `${value}px`;
      } else {
        node.removeAttribute(attribute);
        node.style[property] = "";
      }
      return;
    }

    super.format(name, value);
  }
}

Quill.register(SyncPadImage, true);



const Editor = () => {
  const [socket, setSocket] = useState(null);
  const [quill, setQuill] = useState(null);
  const [user ,setUser] = useState(0);

  const { id: documentId } = useParams();
  
const profile = useMemo(() => {
  const colors = [
    "#2563eb",
    "#9333ea",
    "#059669",
    "#ea580c",
    "#db2777",
  ];

  return {
    name: `Guest ${Math.floor(Math.random() * 900 + 100)}`,
    color: colors[Math.floor(Math.random() * colors.length)],
  };
}, []);

const { collaborators, cursors , transformCursors} = useCollaborators(
  socket,
  quill,
  documentId,
  profile
);

  

  // 🔌 socket connect
  useEffect(() => {
    const s = io(SERVER_URL);
    setSocket(s);

    return () => s.disconnect();
  }, []);
  //image resize 
 

  //image handler function
  function imageHandler() {
  const input = document.createElement('input');
  input.setAttribute('type', 'file');
  input.setAttribute('accept', 'image/*');
  input.click();

  input.onchange = async () => {
    const file = input.files[0];

    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    // 🔥 Backend upload
    const res = await fetch('http://localhost:5000/upload', {
      method: 'POST',
      body: formData
    });
   
    const data = await res.json();
   
   const quill = quillRef.current;
   if (!quillRef.current) return;

   quill.focus(); // 🔥 IMPORTANT

//    const range = quill.getSelection();

//    if (range) {
//     quill.insertEmbed(range.index, 'image', data.url);
//     } else {
//     quill.insertEmbed(0, 'image', data.url);
// }

let range = quill.getSelection();

if (!range) {
  range = { index: quill.getLength() }; // end me daal
}

quill.insertEmbed(range.index, 'image', data.url, 'user');
quill.setSelection(range.index + 1); // cursor move karo
  };
}

  // 📝 create editor
  const quillRef = useRef(null);
  useEffect(() => {
    const editorDiv = document.getElementById("editor");

    // const q = new Quill(editorDiv, {
    //   theme: "snow",
    // });
    if (quillRef.current) return;

     const q = new Quill('#editor', {
      theme: 'snow',
      modules: {
         toolbar: {
         container: [
        ['bold', 'italic', 'underline'],
        [{ header: 1 }, { header: 2 }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['code-block'],
        ['image']
      ],
      handlers: {
        image: imageHandler   // 👈 custom function
      }
    },

   
  }
});
    quillRef.current = q; 
    q.disable();
   
    setQuill(q);
//image resize function
   
    // Image selection, resize, double-click drag and toolbar
    q.root.style.position = "relative";

    let suppressNextImageClick = false;

    function updateResizeBox(box, img) {
      if (!box.isConnected || !img.isConnected) return;

      const rect = img.getBoundingClientRect();

      box.style.left = `${rect.left + window.scrollX}px`;
      box.style.top = `${rect.top + window.scrollY}px`;
      box.style.width = `${rect.width}px`;
      box.style.height = `${rect.height}px`;
    }

    function persistImage(img) {
      const currentQuill = quillRef.current;
      if (!currentQuill || !img.isConnected) return;

      const blot = Quill.find(img);
      if (!blot) return;

      const index = currentQuill.getIndex(blot);
      const mode = img.getAttribute("data-image-mode") || "inline";
      const align = img.getAttribute("data-image-align") || "left";

      currentQuill.formatText(
        index,
        1,
        {
          width: `${Math.round(img.getBoundingClientRect().width)}px`,
          height: `${Math.round(img.getBoundingClientRect().height)}px`,
          imageMode: mode,
          imageAlign: align,
          imageLeft:
            mode === "free"
              ? Math.round(parseFloat(img.style.left) || 0)
              : null,
          imageTop:
            mode === "free"
              ? Math.round(parseFloat(img.style.top) || 0)
              : null,
        },
        "user"
      );
    }

    function showResizeBox(img) {
      document.getElementById("resize-box")?.remove();

      const box = document.createElement("div");
      box.id = "resize-box";

      Object.assign(box.style, {
        position: "absolute",
        border: "2px solid #2563eb",
        boxSizing: "border-box",
        zIndex: "10000",
        pointerEvents: "none",
      });

      document.body.appendChild(box);
      updateResizeBox(box, img);

      addHandles(box, img);
      box.appendChild(showImageToolbar(img, box));
    }

    // Eight independent resize handles
    function addHandles(box, img) {
      const positions = [
        "top-left",
        "top",
        "top-right",
        "left",
        "right",
        "bottom-left",
        "bottom",
        "bottom-right",
      ];

      positions.forEach((pos) => {
        const handle = document.createElement("div");

        Object.assign(handle.style, {
          position: "absolute",
          width: "10px",
          height: "10px",
          background: "#2563eb",
          border: "1px solid white",
          borderRadius: "2px",
          boxSizing: "border-box",
          pointerEvents: "auto",
          zIndex: "10001",
        });

        setHandlePosition(handle, pos);
        addResizeLogic(handle, box, img, pos);
        box.appendChild(handle);
      });
    }

    function setHandlePosition(handle, pos) {
      const offset = "-5px";

      if (pos.includes("left")) handle.style.left = offset;
      if (pos.includes("right")) handle.style.right = offset;
      if (pos.includes("top")) handle.style.top = offset;
      if (pos.includes("bottom")) handle.style.bottom = offset;

      if (pos === "top" || pos === "bottom") {
        handle.style.left = "50%";
        handle.style.transform = "translateX(-50%)";
      }

      if (pos === "left" || pos === "right") {
        handle.style.top = "50%";
        handle.style.transform = "translateY(-50%)";
      }

      const cursors = {
        "top-left": "nwse-resize",
        "bottom-right": "nwse-resize",
        "top-right": "nesw-resize",
        "bottom-left": "nesw-resize",
        top: "ns-resize",
        bottom: "ns-resize",
        left: "ew-resize",
        right: "ew-resize",
      };

      handle.style.cursor = cursors[pos];
    }

    function addResizeLogic(handle, box, img, pos) {
      handle.onmousedown = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const startX = e.clientX;
        const startY = e.clientY;
        const startRect = img.getBoundingClientRect();

        const startWidth = startRect.width;
        const startHeight = startRect.height;
        const startLeft = startRect.left;
        const startTop = startRect.top;

        const startInlineLeft = parseFloat(img.style.left) || 0;
        const startInlineTop = parseFloat(img.style.top) || 0;

        const onMove = (moveEvent) => {
          const dx = moveEvent.clientX - startX;
          const dy = moveEvent.clientY - startY;

          let width = startWidth;
          let height = startHeight;

          if (pos.includes("right")) width = startWidth + dx;
          if (pos.includes("left")) width = startWidth - dx;
          if (pos.includes("bottom")) height = startHeight + dy;
          if (pos.includes("top")) height = startHeight - dy;

          width = Math.max(50, width);
          height = Math.max(50, height);

          img.style.width = `${width}px`;
          img.style.height = `${height}px`;

          // Free-position images keep the opposite edge anchored.
          const mode = img.getAttribute("data-image-mode") || "inline";

          if (mode === "free") {
            const editorRect = q.root.getBoundingClientRect();

            let left = startLeft - editorRect.left + q.root.scrollLeft;
            let top = startTop - editorRect.top + q.root.scrollTop;

            if (pos.includes("left")) left += startWidth - width;
            if (pos.includes("top")) top += startHeight - height;

            img.style.left = `${left}px`;
            img.style.top = `${top}px`;
          } else if (pos.includes("left") || pos.includes("top")) {
            // Keep the opposite edge stable during inline resizing.
            img.style.position = "relative";
            img.style.left = pos.includes("left")
              ? `${startInlineLeft + startWidth - width}px`
              : `${startInlineLeft}px`;
            img.style.top = pos.includes("top")
              ? `${startInlineTop + startHeight - height}px`
              : `${startInlineTop}px`;
          }

          updateResizeBox(box, img);
        };

        const onUp = () => {
          document.removeEventListener("mousemove", onMove);
          document.removeEventListener("mouseup", onUp);

          persistImage(img);
          box.remove();
        };

        document.addEventListener("mousemove", onMove);
        document.addEventListener("mouseup", onUp);
      };
    }

    function showImageToolbar(img, box) {
      const toolbar = document.createElement("div");

      Object.assign(toolbar.style, {
        position: "absolute",
        bottom: "calc(100% + 8px)",
        left: "0",
        background: "#111827",
        padding: "6px",
        borderRadius: "6px",
        display: "flex",
        gap: "5px",
        whiteSpace: "nowrap",
        pointerEvents: "auto",
        zIndex: "10002",
      });

      function makeButton(label, title, onClick) {
        const button = document.createElement("button");

        button.type = "button";
        button.innerText = label;
        button.title = title;

        Object.assign(button.style, {
          padding: "5px 8px",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          color: "white",
          background: "#374151",
        });

        button.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          onClick();
        };

        return button;
      }

      function alignImage(align) {
        img.setAttribute("data-image-align", align);
        img.setAttribute("data-image-mode", "inline");

        img.style.position = "";
        img.style.left = "";
        img.style.top = "";
        img.style.display = "block";

        img.style.margin =
          align === "center"
            ? "10px auto"
            : align === "right"
              ? "10px 0 10px auto"
              : "10px auto 10px 0";

        persistImage(img);
        box.remove();
      }

      // Delete the image through Quill so the change is broadcast.
      function deleteImage() {
        const currentQuill = quillRef.current;
        const blot = Quill.find(img);

        if (currentQuill && blot) {
          currentQuill.deleteText(
            currentQuill.getIndex(blot),
            1,
            "user"
          );
        }

        box.remove();
      }

      toolbar.append(
        makeButton("L", "Align left", () => alignImage("left")),
        makeButton("C", "Align center", () => alignImage("center")),
        makeButton("R", "Align right", () => alignImage("right")),
        makeButton("Delete", "Remove image", deleteImage)
      );

      return toolbar;
    }

    // Single click selects. Double-click + drag moves the image.
    q.root.addEventListener("click", (e) => {
      if (suppressNextImageClick) {
        suppressNextImageClick = false;
        e.preventDefault();
        return;
      }

      if (e.target?.tagName === "IMG") {
        e.preventDefault();
        e.stopPropagation();
        showResizeBox(e.target);
      }
    });

    // A second mouse press starts the move gesture.
    q.root.addEventListener("mousedown", (e) => {
      const img = e.target;

      if (img?.tagName !== "IMG" || e.button !== 0 || e.detail < 2) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      document.getElementById("resize-box")?.remove();

      const startX = e.clientX;
      const startY = e.clientY;
      const imageRect = img.getBoundingClientRect();
      const editorRect = q.root.getBoundingClientRect();

      const startLeft =
        imageRect.left - editorRect.left + q.root.scrollLeft;
      const startTop =
        imageRect.top - editorRect.top + q.root.scrollTop;

      let dragging = false;

      const onMove = (moveEvent) => {
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;

        if (!dragging && Math.hypot(dx, dy) < 3) return;

        if (!dragging) {
          dragging = true;

          img.setAttribute("data-image-mode", "free");
          img.style.position = "absolute";
          img.style.display = "block";
          img.style.margin = "0";
          img.style.left = `${startLeft}px`;
          img.style.top = `${startTop}px`;
        }

        img.style.left = `${startLeft + dx}px`;
        img.style.top = `${startTop + dy}px`;
      };

      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);

        if (dragging) {
          suppressNextImageClick = true;
          persistImage(img);
        }

       // Hide selection handles after moving.
     if (dragging) {
     const box = document.querySelector(".image-resize-box");
     if (box) {
     box.remove();
  }
}
      };

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    });

  }, []);

  // 📄 load document
 useEffect(() => {
  if (!socket || !quill) return;

  const handleLoad = (data) => {
    const content =
      data && Array.isArray(data.ops)
        ? new Delta(data)
        : new Delta().insert("\n");

    quill.setContents(content, "api");
    quill.enable();
  };

  socket.on("load-document", handleLoad);
  //socket.emit("get-document", documentId);

  return () => {
    socket.off("load-document", handleLoad);
  };
}, [socket, quill, documentId]);

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

// 📥 Receive remote changes
useEffect(() => {
  if (!socket || !quill) return;

  const handleReceiveChanges = (delta) => {
    if (!delta || !Array.isArray(delta.ops)) return;

    const change = new Delta(delta);

    // Existing remote cursor positions ko adjust karo
    transformCursors(change);

    // Existing document sync logic
    quill.updateContents(change, "api");
  };

  socket.on("receive-changes", handleReceiveChanges);

  return () => {
    socket.off("receive-changes", handleReceiveChanges);
  };
}, [socket, quill, transformCursors]);
  // 💾 auto save
// Debounced autosave
useEffect(() => {
  if (!socket || !quill) return;

  let saveTimer;

  const handleTextChange = () => {
    clearTimeout(saveTimer);

    saveTimer = setTimeout(() => {
      socket.emit("save-document", quill.getContents());
    }, 500);
  };

  quill.on("text-change", handleTextChange);

  return () => {
    clearTimeout(saveTimer);
    quill.off("text-change", handleTextChange);
  };
}, [socket, quill]);

  //user-count
  useEffect(() => {
    if (!socket ) return ;

    socket.on ("user-count" , (count) => {
      setUser(count);
    });

    return () => socket.off("user-count" );
},[socket]);

  return (
    <div className="editor-container">
    <Header user={user} collaborators={collaborators} />

    <EditorBox />

    <LiveCursors quill={quill} cursors={cursors} />
  </div>
  );
};

export default Editor;