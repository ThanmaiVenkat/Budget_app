import React, { useState, useRef, Suspense, lazy } from 'react';
import confetti from 'canvas-confetti';
import { Smartphone, Monitor, LogOut } from 'lucide-react';
import HeaderBar from './components/HeaderBar';
import FamilyMemberBar from './components/FamilyMemberBar';
import BottomNav from './components/BottomNav';
import HomeTab from './components/HomeTab';
import ExpensesTab from './components/ExpensesTab';
import BudgetsTab from './components/BudgetsTab';
import MembersTab from './components/MembersTab';
import BillRemindersTab from './components/BillRemindersTab';
import AddExpenseSheet from './components/AddExpenseSheet';
import OnboardingScreen from './components/OnboardingScreen';
import AuthScreen from './components/AuthScreen';
import HouseholdSetup from './components/HouseholdSetup';
import HouseholdCreatedScreen from './components/HouseholdCreatedScreen';
import DataAccessError from './components/DataAccessError';
import FirebaseNotConfigured from './components/FirebaseNotConfigured';
import { firebaseConfigured } from './firebase';
import { useAppData } from './hooks/useAppData';

// Lazy-loaded: pulls in recharts / xlsx, only needed once the user opens these views.
const GraphsTab = lazy(() => import('./components/GraphsTab'));
const PersonalSavingsTracker = lazy(() => import('./components/PersonalSavingsTracker'));
const ExcelImportModal = lazy(() => import('./components/ExcelImportModal'));

const TabLoadingFallback = () => (
  <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
    Loading…
  </div>
);

const FullScreenLoading = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-dim)', fontSize: '0.9rem' }}>
    Loading…
  </div>
);

const ALL_MEMBER = { id: 'all', name: 'All Family', avatar: '👨‍👩‍👧‍👦', color: '#C2661F', role: 'Household Pool' };
const EMPTY_PERSONAL = { salary: 0, goals: [], transactions: [] };

export default function App() {
  const app = useAppData();
  // Held here, not derived from Firestore: the household document (and this
  // user's householdId) exist the instant createHousehold's writes land,
  // which would otherwise swap the confirmation screen out before the code
  // was ever readable.
  const [justCreatedCode, setJustCreatedCode] = useState(null);

  const [activeTab, setActiveTab] = useState('home');
  const [activeMemberId, setActiveMemberId] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [activeDirection, setActiveDirection] = useState('2b');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [isFrameMode, setIsFrameMode] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return true;
    return window.matchMedia('(min-width: 700px)').matches;
  });

  const isStandalone =
    typeof window !== 'undefined' &&
    ((window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
      window.navigator.standalone === true);

  // Live household data, straight off the Firestore snapshot. Every device in
  // the household sees the same values, and a local write echoes back through
  // here near-instantly via the offline cache.
  const data = app.data;
  const transactions = data?.transactions || [];
  const members = data?.members || [];
  const categories = data?.categories || [];
  const bills = data?.bills || [];
  const enableRollover = data?.enableRollover ?? true;
  const personalState = app.personalState || EMPTY_PERSONAL;

  const personalRef = useRef(personalState);
  personalRef.current = personalState;

  // Every shared mutation computes the next value from the current snapshot
  // (the same reducer logic as before) and writes it; the snapshot listener
  // then repaints the UI. Handlers are redefined each render, so they always
  // close over the latest data.
  const handleAddTransaction = (newTx) => {
    app.updateData({ transactions: [newTx, ...transactions] });
    if (newTx.type === 'income') {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.8 } });
    }
  };

  const handleExcelImportSuccess = (result) => {
    app.updateData({
      categories: result.newCategories.length ? [...categories, ...result.newCategories] : categories,
      members: result.newMembers.length ? [...members, ...result.newMembers] : members,
      transactions: [...result.transactions, ...transactions]
    });
  };

  const handleDeleteTransaction = (txId) => {
    app.updateData({ transactions: transactions.filter((t) => t.id !== txId) });
  };

  const handleUpdateCategoryLimit = (catId, newLimit) => {
    app.updateData({ categories: categories.map((c) => (c.id === catId ? { ...c, limit: newLimit } : c)) });
  };

  const handleToggleBillPaid = (billId) => {
    app.updateData({ bills: bills.map((b) => (b.id === billId ? { ...b, paid: !b.paid } : b)) });
  };

  const handleAddBill = (newBill) => {
    app.updateData({ bills: [...bills, newBill] });
  };

  const handleUpdateBill = (billId, updates) => {
    app.updateData({ bills: bills.map((b) => (b.id === billId ? { ...b, ...updates } : b)) });
  };

  const handleDeleteBill = (billId) => {
    app.updateData({ bills: bills.filter((b) => b.id !== billId) });
  };

  const handleAddMember = (newMember) => {
    app.updateData({ members: [...members, newMember] });
  };

  // First real member also seeds the 'all' pseudo-member every filter assumes.
  const handleCompleteOnboarding = (member) => {
    app.updateData({ members: [ALL_MEMBER, member] });
  };

  const handleDeleteMember = (memberId) => {
    if (memberId === 'all') return;
    app.updateData({ members: members.filter((m) => m.id !== memberId) });
    if (activeMemberId === memberId) setActiveMemberId('all');
  };

  const setEnableRollover = (val) => app.updateData({ enableRollover: val });

  // Personal savings is per-user, not shared. Supports the functional-updater
  // form its child uses; the ref keeps the base current across rapid calls.
  const setPersonalState = (updater) => {
    const base = personalRef.current || EMPTY_PERSONAL;
    const next = typeof updater === 'function' ? updater(base) : updater;
    app.updatePersonal(next);
  };

  const handleNavigateToBills = () => setActiveTab('members');

  const hasRealMembers = members.some((m) => m.id !== 'all');

  // Decide which screen the frame holds: config error, loading, sign-in,
  // household setup, first-run onboarding, or the app itself.
  const renderInner = () => {
    if (!firebaseConfigured) return <FirebaseNotConfigured />;
    if (!app.authReady) return <FullScreenLoading />;
    if (!app.authUser) return <AuthScreen onLogin={app.login} onSignup={app.signup} />;
    if (app.dataError) {
      return <DataAccessError message={app.dataError} onRetry={app.retry} onLogout={app.logout} />;
    }
    if (!app.userDoc) return <FullScreenLoading />;
    if (justCreatedCode) {
      return <HouseholdCreatedScreen code={justCreatedCode} onContinue={() => setJustCreatedCode(null)} />;
    }
    if (!app.userDoc.householdId) {
      return (
        <HouseholdSetup
          onCreate={async (name) => {
            const result = await app.createHousehold(name);
            setJustCreatedCode(result.joinCode);
            return result;
          }}
          onJoin={app.joinHousehold}
          onLogout={app.logout}
        />
      );
    }
    if (!app.household) return <FullScreenLoading />;
    if (!hasRealMembers) return <OnboardingScreen onComplete={handleCompleteOnboarding} />;

    return (
      <>
        <HeaderBar
          transactions={transactions}
          members={members}
          categories={categories}
          selectedMonth={selectedMonth}
          setSelectedMonth={setSelectedMonth}
          onOpenExcelModal={() => setShowExcelModal(true)}
          onOpenPersonal={() => setActiveTab('personal')}
          isPersonalActive={activeTab === 'personal'}
          activeDirection={activeDirection}
          setActiveDirection={setActiveDirection}
        />

        <div className="sbar">
          <span>9:41</span>
          <div style={{ display: 'flex', gap: '4px' }}>
            <span style={{ width: '16px', height: '10px', border: '1.5px solid var(--text-main)', borderRadius: '3px', display: 'inline-block' }} />
          </div>
        </div>

        {activeTab !== 'personal' && (
          <div style={{ padding: '0 20px 4px 20px', background: 'var(--bg-page)' }}>
            <FamilyMemberBar members={members} activeMemberId={activeMemberId} setActiveMemberId={setActiveMemberId} />
          </div>
        )}

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
              onNavigateToBudgets={() => setActiveTab('budgets')}
              onNavigateToBills={handleNavigateToBills}
              onOpenAddModal={() => setShowAddModal(true)}
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
            <Suspense fallback={<TabLoadingFallback />}>
              <GraphsTab
                transactions={transactions}
                categories={categories}
                members={members}
                activeMemberId={activeMemberId}
                selectedMonth={selectedMonth}
                setSelectedMonth={setSelectedMonth}
              />
            </Suspense>
          )}

          {activeTab === 'personal' && (
            <Suspense fallback={<TabLoadingFallback />}>
              <PersonalSavingsTracker
                personalState={personalState}
                setPersonalState={setPersonalState}
                onBack={() => setActiveTab('home')}
              />
            </Suspense>
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
                onDeleteMember={handleDeleteMember}
              />
              <BillRemindersTab
                bills={bills}
                members={members}
                onToggleBillPaid={handleToggleBillPaid}
                onAddBill={handleAddBill}
                onUpdateBill={handleUpdateBill}
                onDeleteBill={handleDeleteBill}
              />

              {/* Account + household: where to find the code to add another
                  device, and how to sign out. Replaces the old per-device
                  "erase data" action, which no longer makes sense now that the
                  data lives in the cloud, not this browser. */}
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: '700' }}>Account & Sync</h3>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Signed in as {app.authUser.email}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--accent-tint)', border: '1px solid var(--accent-border)', borderRadius: '12px', padding: '10px 14px' }}>
                  <div>
                    <div style={{ fontSize: '0.66rem', letterSpacing: '.1em', color: 'var(--text-dim)', fontWeight: '600' }}>HOUSEHOLD CODE</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', letterSpacing: '.08em', color: 'var(--accent-strong)' }}>{app.joinCode}</div>
                  </div>
                  <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)', maxWidth: '130px', textAlign: 'right' }}>
                    Share to add family on their own devices
                  </span>
                </div>
                <button
                  onClick={app.logout}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', background: 'none', border: 'none', color: 'var(--text-dim)', font: '600 12px Manrope', cursor: 'pointer', padding: '4px', alignSelf: 'center' }}
                >
                  <LogOut size={13} /> Sign out
                </button>
              </div>
            </div>
          )}
        </main>

        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} onOpenAddModal={() => setShowAddModal(true)} />

        {showAddModal && (
          <AddExpenseSheet
            categories={categories}
            members={members}
            onClose={() => setShowAddModal(false)}
            onSave={handleAddTransaction}
          />
        )}

        {showExcelModal && (
          <Suspense fallback={null}>
            <ExcelImportModal
              categories={categories}
              members={members}
              onClose={() => setShowExcelModal(false)}
              onImportSuccess={handleExcelImportSuccess}
            />
          </Suspense>
        )}
      </>
    );
  };

  return (
    <div className="app-container">
      {!isStandalone && (
        <button className="frame-toggle-btn" onClick={() => setIsFrameMode(!isFrameMode)}>
          {isFrameMode ? <Monitor size={14} /> : <Smartphone size={14} />}
          <span>{isFrameMode ? 'Full Screen' : 'Mobile Frame'}</span>
        </button>
      )}

      <div className={isFrameMode ? 'mobile-frame-wrapper' : 'mobile-full-wrapper'}>
        {isFrameMode && <div className="mobile-notch" />}
        {renderInner()}
      </div>
    </div>
  );
}
