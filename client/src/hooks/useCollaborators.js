
import { useEffect, useState, useCallback } from "react";

export default function useCollaborators(socket, quill, documentId, profile) {
  const [collaborators, setCollaborators] = useState([]);
  const [cursors, setCursors] = useState({});

  useEffect(() => {
    if (!socket || !documentId) return;

    const handleCollaborators = (users) => {
      const list = Array.isArray(users) ? users : [];
      setCollaborators(list);

      const activeIds = new Set(list.map((user) => user.socketId));

      setCursors((previous) =>
        Object.fromEntries(
          Object.entries(previous).filter(([id]) => activeIds.has(id))
        )
      );
    };

    const handleCursor = (data) => {
      if (!data?.socketId) return;

      setCursors((previous) => {
        if (!data.range) {
          const next = { ...previous };
          delete next[data.socketId];
          return next;
        }

        return {
          ...previous,
          [data.socketId]: {
            socketId: data.socketId,
            collaborator: data.collaborator,
            range: data.range,
          },
        };
      });
    };

    socket.on("collaborators-update", handleCollaborators);
    socket.on("cursor-update", handleCursor);

    return () => {
      socket.off("collaborators-update", handleCollaborators);
      socket.off("cursor-update", handleCursor);
    };
  }, [socket, documentId]);

  // Join the document with this user's display identity.
  useEffect(() => {
    if (!socket || !quill || !documentId) return;

    socket.emit("get-document", documentId, profile);
  }, [socket, quill, documentId, profile]);

  // Send this user's cursor and text selection to other collaborators.
  useEffect(() => {
    if (!socket || !quill) return;

  const handleSelection = (range, oldRange, source) => {
  // Sirf user ke actual cursor/selection changes bhejo
  if (source !== "user") return;

  socket.emit("cursor-update", {
    range: range
      ? {
          index: range.index,
          length: range.length,
        }
      : null,
  });
};

    quill.on("selection-change", handleSelection);

    return () => {
      quill.off("selection-change", handleSelection);
    };
  }, [socket, quill]);
 
const transformCursors = useCallback((change) => {
  if (typeof change?.transformPosition !== "function") return;

  setCursors((previous) => {
    const updated = {};

    for (const [socketId, cursor] of Object.entries(previous)) {
      const range = cursor.range;

      if (!range || !Number.isInteger(range.index)) {
        updated[socketId] = cursor;
        continue;
      }

      const start = range.index;
      const end = start + (range.length || 0);

      const newStart = change.transformPosition(start, true);
      const newEnd = change.transformPosition(end, true);

      updated[socketId] = {
        ...cursor,
        range: {
          ...range,
          index: newStart,
          length: Math.max(0, newEnd - newStart),
        },
      };
    }

    return updated;
  });
}, []);
  return { collaborators, cursors , transformCursors };
}
