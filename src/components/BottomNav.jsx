import React from 'react';
import { Home, Receipt, Settings, TrendingUp } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab, onOpenAddModal }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'graphs', label: 'Insights', icon: TrendingUp },
    { id: 'add', label: 'Add', isFab: true },
    { id: 'budgets', label: 'Budgets', icon: Receipt },
    { id: 'members', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="tab">
      {tabs.map((tab) => {
        if (tab.isFab) {
          return (
            <button key={tab.id} className="fab" onClick={onOpenAddModal} title="Add Expense" aria-label="Add expense">
              <span>+</span>
              {/* Shown only once the nav becomes a desktop sidebar, where a
                  bare circular glyph would read as an orphan. */}
              <span className="fab-label">Add expense</span>
            </button>
          );
        }

        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            className={`tbtn ${isActive ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            style={{ color: isActive ? 'var(--text-main)' : 'var(--text-dim)' }}
          >
            {/* The glyph inherits the button's colour. Pinning it to
                --text-on-accent-strong left it near-white on the inactive
                tile, so four of the five icons were invisible. */}
            <div className="ic">
              <Icon size={16} />
            </div>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
