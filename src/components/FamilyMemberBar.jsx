import React from 'react';

export default function FamilyMemberBar({ members, activeMemberId, setActiveMemberId }) {
  return (
    <div className="member-story-scroll">
      {members.map((member) => {
        const isActive = activeMemberId === member.id;
        return (
          <button
            key={member.id}
            className={`member-chip ${isActive ? 'active' : ''}`}
            onClick={() => setActiveMemberId(member.id)}
            style={{ '--chip-color': member.color }}
          >
            <div className="member-avatar-wrapper">
              <span>{member.avatar}</span>
            </div>
            <span className="member-name">{member.name}</span>
          </button>
        );
      })}
    </div>
  );
}
