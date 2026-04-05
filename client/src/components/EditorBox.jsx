const EditorBox =() => {
    return (
        <div className="editor-main">
      <div className="editor-box">
        <input
          className="doc-title"
          placeholder="Untitled Document"
        />
        <div id="editor"></div>
      </div>
    </div>
    );
};

export default EditorBox;