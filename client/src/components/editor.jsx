import { useEffect, useState , useRef} from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { io } from "socket.io-client";
import {useParams } from "react-router-dom";
import Header from "./header";
import EditorBox from "./EditorBox";
// import Toolbar from "./toolbar";
import "./Editor.css";


const SERVER_URL = "http://localhost:5000";


const Editor = () => {
  const [socket, setSocket] = useState(null);
  const [quill, setQuill] = useState(null);
  const [user ,setUser] = useState(0);

  const { id: documentId } = useParams();
  
  

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

quill.insertEmbed(range.index, 'image', data.url);
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
   q.root.addEventListener("click", (e) => {
  if (e.target && e.target.tagName === "IMG") {
    e.preventDefault();
    e.stopPropagation();

    showResizeBox(e.target);
  }
});
//resize box
function showResizeBox(img) {
  const old = document.getElementById("resize-box");
  if (old) old.remove();

  const rect = img.getBoundingClientRect();

  const box = document.createElement("div");
  box.id = "resize-box";

  box.style.position = "absolute";
  box.style.top = rect.top + window.scrollY + "px";
  box.style.left = rect.left + window.scrollX + "px";
  box.style.width = rect.width + "px";
  box.style.height = rect.height + "px";
  box.style.border = "2px solid blue";
  box.style.zIndex = "1000";

  document.body.appendChild(box);

  addHandles(box, img);
  const toolbar = showImageToolbar(img);
  box.appendChild(toolbar);
}

  // 👇 resize handles
function addHandles(box, img) {
  const positions = [
    "top-left", "top", "top-right",
    "left",               "right",
    "bottom-left", "bottom", "bottom-right"
  ];

  positions.forEach((pos) => {
    const handle = document.createElement("div");

    handle.style.position = "absolute";
    handle.style.width = "10px";
    handle.style.height = "10px";
    handle.style.background = "blue";

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

  handle.style.cursor = "nwse-resize";
}


// add resize logic
function addResizeLogic(handle, box, img, pos) {
  handle.onmousedown = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;

    const startWidth = img.offsetWidth;
    const startHeight = img.offsetHeight;

    document.onmousemove = (e) => {
      let dx = e.clientX - startX;
      let dy = e.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;

      if (pos.includes("right")) newWidth = startWidth + dx;
      if (pos.includes("left")) newWidth = startWidth - dx;

      if (pos.includes("bottom")) newHeight = startHeight + dy;
      if (pos.includes("top")) newHeight = startHeight - dy;

      if (newWidth > 50) img.style.width = newWidth + "px";
      if (newHeight > 50) img.style.height = newHeight + "px";

      // 🔥 BOX SYNC
      const rect = img.getBoundingClientRect();
      box.style.width = rect.width + "px";
      box.style.height = rect.height + "px";
      box.style.left = rect.left + window.scrollX + "px";
      box.style.top = rect.top + window.scrollY + "px";
    };

    document.onmouseup = () => {
      document.onmousemove = null;
      document.onmouseup = null;

      const boxEl = document.getElementById("resize-box");
      if (boxEl) boxEl.remove();
    };
  };
}

function showImageToolbar(img) {
  const toolbar = document.createElement("div");

  toolbar.style.position = "absolute";
  toolbar.style.top = "-40px";
  toolbar.style.left = "0";
  toolbar.style.background = "black";
  toolbar.style.padding = "5px";
  toolbar.style.borderRadius = "5px";
  toolbar.style.display = "flex";
  toolbar.style.gap = "5px";

  const left = document.createElement("button");
  left.innerText = "L";
  left.onclick = () => {
    img.style.display = "block";
    img.style.margin = "10px 0";
  };

  const center = document.createElement("button");
  center.innerText = "C";
  center.onclick = () => {
    img.style.display = "block";
    img.style.margin = "10px auto";
  };

  const right = document.createElement("button");
  right.innerText = "R";
  right.onclick = () => {
    img.style.display = "block";
    img.style.margin = "10px 0 10px auto";
  };

  toolbar.append(left, center, right);

  return toolbar;
}
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
      <Header user={user} />
      
     {/* <Toolbar /> */}
      <EditorBox  />
     
    </div>
  );
};

export default Editor;