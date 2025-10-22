import React from "react";

export default function UserList({ users, typingUsers }) {
  return (
    <aside className="users">
      <div className="users-head">Users</div>
      <div className="users-body">
        {users.map(u => (
          <div key={u} className="user-row">
            <span className="dot" /> {u}
            {typingUsers.includes(u) && <em className="typing">typing…</em>}
          </div>
        ))}
      </div>
    </aside>
  );
}
