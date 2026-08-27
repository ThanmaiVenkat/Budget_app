import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Smartphone, Monitor } from 'lucide-react';
import HeaderBar from './components/HeaderBar';
import FamilyMemberBar from './components/FamilyMemberBar';
import BottomNav from './components/BottomNav';
import HomeTab from './components/HomeTab';
import ExpensesTab from './components/ExpensesTab';
import GraphsTab from './components/GraphsTab';
import BudgetsTab from './components/BudgetsTab';
import MembersTab from './components/MembersTab';
import BillRemindersTab from './components/BillRemindersTab';
import PersonalSavingsTracker from './components/PersonalSavingsTracker';
import AddExpenseSheet from './components/AddExpenseSheet';
import ExcelImportModal from './components/ExcelImportModal';
import { loadState, saveState, resetToDefaultState } from './utils/storage';

export default function App() {
  const [initialData] = useState(() => loadState());
  const [transactions, setTransactions] = useState(initialData.transactions);
  const [members, setMembers] = useState(initialData.members);
  const [categories, setCategories] = useState(initialData.categories);
  const [bills, setBills] = useState(initialData.bills);
  const [enableRollover, setEnableRollover] = useState(initialData.enableRollover);
  const [personalState, setPersonalState] = useState(initialData.personalState);

  const [activeTab, setActiveTab] = useState('home');
  const [activeMemberId, setActiveMemberId] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('2026-07');
  const [activeDirection, setActiveDirection] = useState('2b'); // Default to 2b (Bold Hero), 2a removed
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [isFrameMode, setIsFrameMode] = useState(true);

  // Persist state to localStorage
  useEffect(() => {
    saveState('TRANSACTIONS', transactions);
  }, [transactions]);

  useEffect(() => {
    saveState('MEMBERS', members);
  }, [members]);

  useEffect(() => {
    saveState('CATEGORIES', categories);
  }, [categories]);

  useEffect(() => {
    saveState('BILLS', bills);
  }, [bills]);

  useEffect(() => {
    saveState('ROLLOVER', enableRollover);
  }, [enableRollover]);

  useEffect(() => {
    saveState('PERSONAL_SAVINGS', personalState);
  }, [personalState]);

  // Add Single Transaction
  const handleAddTransaction = (newTx) => {
    setTransactions((prev) => [newTx, ...prev]);

    if (newTx.type === 'income') {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.8 }
      });
    }
  };

  // Handle Excel Auto Import
  const handleExcelImportSuccess = (result) => {
    if (result.newCategories.length > 0) {
      setCategories((prev) => [...prev, ...result.newCategories]);
    }

    if (result.newMembers.length > 0) {
      setMembers((prev) => [...prev, ...result.newMembers]);
    }

    setTransactions((prev) => [...result.transactions, ...prev]);
  };

  // Delete Transaction
  const handleDeleteTransaction = (txId) => {
    setTransactions((prev) => prev.filter((t) => t.id !== txId));
  };

  // Update Category Limit
  const handleUpdateCategoryLimit = (catId, newLimit) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === catId ? { ...c, limit: newLimit } : c))
    );
  };

  // Toggle Bill Paid
  const handleToggleBillPaid = (billId) => {
    setBills((prev) =>
      prev.map((b) => (b.id === billId ? { ...b, paid: !b.paid } : b))
    );
  };

  // Add Bill
  const handleAddBill = (newBill) => {
    setBills((prev) => [...prev, newBill]);
  };

  // Add Family Member
  const handleAddMember = (newMember) => {
    setMembers((prev) => [...prev, newMember]);
  };

  // Reset to default sample state
  const handleResetData = () => {
    if (window.confirm('Reset all family budget data to sample dataset (Rupees ₹)?')) {
      resetToDefaultState();
      window.location.reload();
    }
  };

  // Deep Link helper to Graphs tab pre-filtered to selected month
  const handleNavigateToGraphs = (targetMonth) => {
    if (targetMonth) setSelectedMonth(targetMonth);
    setActiveTab('graphs');
  };

  // Deep link to Bill Reminders (lives inside the "You" tab alongside Members)
  const handleNavigateToBills = () => {
    setActiveTab('members');
  };

  return (
    <div className="app-container">
      
      {/* Viewport Frame Toggle Button */}
      <button className="frame-toggle-btn" onClick={() => setIsFrameMode(!isFrameMode)}>
        {isFrameMode ? <Monitor size={14} /> : <Smartphone size={14} />}
        <span>{isFrameMode ? 'Full Screen' : 'Mobile Frame'}</span>
      </button>

      {/* Main Mobile App Frame */}
      <div className={isFrameMode ? 'mobile-frame-wrapper' : 'mobile-full-wrapper'}>
        
        {/* Top Phone Notch */}
        {isFrameMode && (
          <div className="mobile-notch" />
        )}

        {/* Header Bar */}
        <HeaderBar
          transactions={transactions}
          members={members}
          categories={categories}
          onReset={handleResetData}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          onOpenExcelModal={() => setShowExcelModal(true)}
          onOpenPersonal={() => setActiveTab('personal')}
          isPersonalActive={activeTab === 'personal'}
          activeDirection={activeDirection}
          setActiveDirection={setActiveDirection}
        />

        {/* Status bar */}
        <div className="sbar">
          <span>9:41</span>
          <div style={{ display: 'flex', gap: '4px' }}>
            <span style={{ width: '16px', height: '10px', border: '1.5px solid #f3ece0', borderRadius: '3px', display: 'inline-block' }} />
          </div>
        </div>

        {/* Family Member Quick Filter Bar (Visible in family modes) */}
        {activeTab !== 'personal' && (
          <div style={{ padding: '0 20px 4px 20px', background: '#17140f' }}>
            <FamilyMemberBar
              members={members}
              activeMemberId={activeMemberId}
              setActiveMemberId={setActiveMemberId}
            />
          </div>
        )}

        {/* Scrollable View Content */}
        <main className="app-content">
          {activeTab === 'home' && (
            <HomeTab
              transactions={transactions}
              categories={categories}
              members={members}
              bills={bills}
              activeMemberId={activeMemberId}
              selectedMonth={selectedMonth}
              activeDirection={activeDirection}
              onNavigateToExpenses={() => setActiveTab('expenses')}
              onNavigateToGraphs={handleNavigateToGraphs}
              onNavigateToBudgets={() => setActiveTab('budgets')}
              onNavigateToBills={handleNavigateToBills}
              onOpenAddModal={() => setShowAddModal(true)}
              onToggleBillPaid={handleToggleBillPaid}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpensesTab
              transactions={transactions}
              categories={categories}
              members={members}
              activeMemberId={activeMemberId}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              onDeleteTx={handleDeleteTransaction}
              onOpenAddModal={() => setShowAddModal(true)}
            />
          )}

          {activeTab === 'graphs' && (
            <GraphsTab
              transactions={transactions}
              categories={categories}
              members={members}
              activeMemberId={activeMemberId}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
            />
          )}

          {activeTab === 'personal' && (
            <PersonalSavingsTracker
              personalState={personalState}
              setPersonalState={setPersonalState}
              onBack={() => setActiveTab('home')}
            />
          )}

          {activeTab === 'budgets' && (
            <BudgetsTab
              categories={categories}
              transactions={transactions}
              activeMemberId={activeMemberId}
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              enableRollover={enableRollover}
              setEnableRollover={setEnableRollover}
              onUpdateCategoryLimit={handleUpdateCategoryLimit}
            />
          )}

          {activeTab === 'members' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <MembersTab
                members={members}
                transactions={transactions}
                onAddMember={handleAddMember}
              />
              <BillRemindersTab
                bills={bills}
                members={members}
                onToggleBillPaid={handleToggleBillPaid}
                onAddBill={handleAddBill}
              />
            </div>
          )}
        </main>

        {/* Bottom Mobile Navigation Bar matching Home Budget App.dc.html with icons */}
        <BottomNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAddModal={() => setShowAddModal(true)}
        />

        {/* 3-Fields Quick Add Bottom Sheet Modal */}
        {showAddModal && (
          <AddExpenseSheet
            categories={categories}
            members={members}
            onClose={() => setShowAddModal(false)}
            onSave={handleAddTransaction}
          />
        )}

        {/* Auto Excel / CSV Importer Modal */}
        {showExcelModal && (
          <ExcelImportModal
            categories={categories}
            members={members}
            onClose={() => setShowExcelModal(false)}
            onImportSuccess={handleExcelImportSuccess}
          />
        )}

      </div>
    </div>
  );
}
