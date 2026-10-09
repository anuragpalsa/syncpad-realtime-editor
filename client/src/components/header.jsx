import { FileText,Users } from "lucide-react";

const Header = ({user}) => {
    return (
        <div className="editor-header">
           <div className="flex items-center gap-2">
        <FileText className="text-blue-500" />
        <h1 className="text-3xl font-semiBold text-black">SyncPad</h1>
      </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center", color:"black" }}>
            <Users size={18} className="text-black" />
            <span>user:{user}</span>
             
            <button  className="share-btn" onClick={shareDoc}>Share</button>
            </div>
        </div>
    );
};
const shareDoc = () => {
  navigator.clipboard.writeText(window.location.href);
  alert("Link copied!");
};
export default Header;