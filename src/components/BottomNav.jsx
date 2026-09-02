import React from 'react';
import { Home, BarChart3, Receipt, User, Plus, TrendingUp } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab, onOpenAddModal }) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'graphs', label: 'Insights', icon: TrendingUp },
    { id: 'add', label: 'Add', isFab: true },
    { id: 'budgets', label: 'Budgets', icon: Receipt },
    { id: 'members', label: 'You', icon: User }
  ];

  return (
    <div className="tab">
      {tabs.map((tab) => {
        if (tab.isFab) {
          return (
            <button key={tab.id} className="fab" onClick={onOpenAddModal} title="Add Expense" aria-label="Add expense">
              <span>+</span>
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
            style={{ color: isActive ? '#f3ece0' : '#6b6152' }}
          >
            <div className="ic" style={{ background: isActive ? '#f26a1b' : '#3a3328' }}>
              <Icon size={14} color="#fff" />
            </div>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
