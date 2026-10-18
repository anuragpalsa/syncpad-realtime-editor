
import { useEffect, useState } from "react";
import "./LiveCursors.css";

export default function LiveCursors({ quill, cursors }) {
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    if (!quill) return;

    const refresh = () => setRevision((value) => value + 1);

    window.addEventListener("scroll", refresh, true);
    window.addEventListener("resize", refresh);
    quill.on("editor-change", refresh);

    return () => {
      window.removeEventListener("scroll", refresh, true);
      window.removeEventListener("resize", refresh);
      quill.off("editor-change", refresh);
    };
  }, [quill]);

  if (!quill) return null;

 const rootRect = quill.container.getBoundingClientRect();

  return (
    <div className="live-cursors-layer">
      {Object.values(cursors).map((cursor) => {
        const range = cursor.range;
        if (!range || !Number.isInteger(range.index)) return null;

        let bounds;

        try {
          const maxIndex = Math.max(0, quill.getLength() - 1);
          const index = Math.min(range.index, maxIndex);
          const length = Math.min(
            Math.max(0, range.length || 0),
            Math.max(0, quill.getLength() - index - 1)
          );

          bounds = quill.getBounds(index, length);
        } catch {
          return null;
        }

        if (!bounds) return null;

        const person = cursor.collaborator || {};
        const color = person.color || "#64748b";
        const name = person.name || "Guest";

        const left = rootRect.left + bounds.left;
        const top = rootRect.top + bounds.top;

        return (
          <div key={cursor.socketId}>
            {range.length > 0 && (
              <div
                className="remote-selection"
                style={{
                  left,
                  top,
                  width: Math.max(bounds.width, 2),
                  height: Math.max(bounds.height, 18),
                  backgroundColor: color,
                }}
              />
            )}

            <div
              className="remote-cursor"
              style={{
                left,
                top,
                height: Math.max(bounds.height, 18),
                borderColor: color,
              }}
            >
              <span
                className="remote-cursor-label"
                style={{ backgroundColor: color }}
              >
                {name}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
