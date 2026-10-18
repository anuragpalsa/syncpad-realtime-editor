
export default function CollaboratorAvatars({ collaborators = [] }) {
  const visibleUsers = collaborators.slice(0, 4);
  const remaining = Math.max(0, collaborators.length - visibleUsers.length);

  return (
    <div className="collaborator-avatars" title="People in this document">
      {visibleUsers.map((person) => {
        const initials = (person.name || "Guest")
          .trim()
          .split(/\s+/)
          .slice(0, 2)
          .map((part) => part[0])
          .join("")
          .toUpperCase();

        return (
          <div
            key={person.socketId}
            className="collaborator-avatar"
            style={{ backgroundColor: person.color || "#64748b" }}
            title={person.name || "Guest"}
          >
            {initials}
          </div>
        );
      })}

      {remaining > 0 && (
        <div className="collaborator-avatar collaborator-more">
          +{remaining}
        </div>
      )}
    </div>
  );
}
