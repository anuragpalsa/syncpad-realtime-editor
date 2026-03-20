const Header = ({user}) => {
    return (
        <div className="editor-header">
            <span>📝 SyncPad</span>
            <span>👥user:{user}</span>
        </div>
    );
};
export default Header;