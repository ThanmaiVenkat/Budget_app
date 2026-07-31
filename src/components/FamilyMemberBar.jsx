import React from 'react';
import { Users } from 'lucide-react';

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
              {/* 'all' has no single face to show — a real icon renders
                  crisply everywhere; a group emoji depends on font support
                  the browser may not have and can fall back to a tiny glyph. */}
              {member.id === 'all'
                ? <Users size={20} color={member.color} />
                : <span>{member.avatar}</span>}
            </div>
            <span className="member-name">{member.name}</span>
          </button>
        );
      })}
    </div>
  );
}
