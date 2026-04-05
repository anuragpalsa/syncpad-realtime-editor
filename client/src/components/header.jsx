const Header = ({user}) => {
    return (
        <div className="editor-header">
            <div className="logo">📝 SyncPad</div>

            <div style={{ display: "flex", gap: "20px", alignItems: "center", color:"black" }}>
            <span>👥user:{user}</span>
            <button className="share-btn" onClick={shareDoc}>Share</button>
            </div>
        </div>
    );
};
const shareDoc = () => {
  navigator.clipboard.writeText(window.location.href);
  alert("Link copied!");
};
export default Header;