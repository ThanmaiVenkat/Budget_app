package com.aistudio.tallybudget.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.aistudio.tallybudget.data.model.*
import com.aistudio.tallybudget.data.repository.TallyRepository
import kotlinx.coroutines.flow.*
import java.time.LocalDate
import java.time.YearMonth
import java.time.format.DateTimeFormatter

data class HomeSummary(
    val totalExpense: Double = 0.0,
    val totalIncome: Double = 0.0,
    val totalBudget: Double = 0.0,
    val remainingBudget: Double = 0.0,
    val budgetUtilizationPct: Int = 0,
    val dailyAverage: Double = 0.0,
    val prevMonthExpense: Double = 0.0,
    val deltaPct: Int? = null,
    val upcomingBills: List<Bill> = emptyList(),
    val recentTransactions: List<Transaction> = emptyList()
)

class TallyViewModel(
    private val repository: TallyRepository = TallyRepository()
) : ViewModel() {

    private val now = LocalDate.now()
    private val currentMonthKey = now.format(DateTimeFormatter.ofPattern("yyyy-MM"))

    val household = repository.household
    val categories = repository.categories
    val members = repository.members
    val transactions = repository.transactions
    val bills = repository.bills
    val personalState = repository.personalState

    private val _activeTab = MutableStateFlow(NavigationTab.HOME)
    val activeTab: StateFlow<NavigationTab> = _activeTab.asStateFlow()

    private val _activeMemberId = MutableStateFlow("all")
    val activeMemberId: StateFlow<String> = _activeMemberId.asStateFlow()

    private val _selectedMonth = MutableStateFlow(currentMonthKey)
    val selectedMonth: StateFlow<String> = _selectedMonth.asStateFlow()

    // Dialog & UI Visibility states
    val showAddExpenseDialog = MutableStateFlow(false)
    val editingTransaction = MutableStateFlow<Transaction?>(null)
    val showAddBillDialog = MutableStateFlow(false)
    val showAddMemberDialog = MutableStateFlow(false)
    val showAddCategoryDialog = MutableStateFlow(false)
    val showAddGoalDialog = MutableStateFlow(false)
    val showDepositDialog = MutableStateFlow<SavingsGoal?>(null)

    fun setActiveTab(tab: NavigationTab) {
        _activeTab.value = tab
    }

    fun setActiveMemberId(memberId: String) {
        _activeMemberId.value = memberId
    }

    fun setSelectedMonth(monthKey: String) {
        _selectedMonth.value = monthKey
    }

    // Derived filtered transactions based on member & month
    val filteredTransactions: StateFlow<List<Transaction>> = combine(
        transactions,
        activeMemberId,
        selectedMonth
    ) { txs, memberId, month ->
        txs.filter { tx ->
            val matchMember = memberId == "all" || tx.memberId == memberId
            val matchMonth = month == "all" || tx.date.startsWith(month)
            matchMember && matchMonth
        }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Derived Home Summary
    val homeSummary: StateFlow<HomeSummary> = combine(
        transactions,
        categories,
        bills,
        activeMemberId,
        selectedMonth
    ) { txs, cats, allBills, memberId, month ->
        val filtered = txs.filter { tx ->
            val matchMember = memberId == "all" || tx.memberId == memberId
            val matchMonth = month == "all" || tx.date.startsWith(month)
            matchMember && matchMonth
        }

        val totalExpense = filtered.filter { it.type == "expense" }.sumOf { it.amount }
        val totalIncome = filtered.filter { it.type == "income" }.sumOf { it.amount }

        val totalBudget = cats.sumOf { it.limitForMonth(month) }
        val remaining = (totalBudget - totalExpense).coerceAtLeast(0.0)
        val utilization = if (totalBudget > 0) ((totalExpense / totalBudget) * 100).toInt().coerceIn(0, 100) else 0

        // Calculate days elapsed for burn rate
        val daysElapsed = if (month != "all") {
            try {
                val ym = YearMonth.parse(month)
                if (ym == YearMonth.now()) now.dayOfMonth else ym.lengthOfMonth()
            } catch (e: Exception) {
                1
            }
        } else {
            30
        }
        val dailyAvg = if (daysElapsed > 0) totalExpense / daysElapsed else 0.0

        // Previous month comparison
        val prevMonthKey = try {
            YearMonth.parse(month).minusMonths(1).format(DateTimeFormatter.ofPattern("yyyy-MM"))
        } catch (e: Exception) {
            null
        }
        val prevExpense = if (prevMonthKey != null) {
            txs.filter { tx ->
                val matchMember = memberId == "all" || tx.memberId == memberId
                tx.type == "expense" && tx.date.startsWith(prevMonthKey)
            }.sumOf { it.amount }
        } else 0.0

        val deltaPct = if (prevExpense > 0) {
            (((totalExpense - prevExpense) / prevExpense) * 100).toInt()
        } else null

        val upcoming = allBills.filter { !it.paid }.sortedBy { it.dueDate }.take(3)
        val recent = filtered.sortedByDescending { it.date }.take(4)

        HomeSummary(
            totalExpense = totalExpense,
            totalIncome = totalIncome,
            totalBudget = totalBudget,
            remainingBudget = remaining,
            budgetUtilizationPct = utilization,
            dailyAverage = dailyAvg,
            prevMonthExpense = prevExpense,
            deltaPct = deltaPct,
            upcomingBills = upcoming,
            recentTransactions = recent
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), HomeSummary())

    // Actions forwarding to repository
    fun addTransaction(tx: Transaction) = repository.addTransaction(tx)
    fun updateTransaction(tx: Transaction) = repository.updateTransaction(tx)
    fun deleteTransaction(id: String) = repository.deleteTransaction(id)

    fun addCategory(cat: Category) = repository.addCategory(cat)
    fun updateCategoryLimit(catId: String, limit: Double) = repository.updateCategoryLimit(catId, _selectedMonth.value, limit)
    fun deleteCategory(id: String) = repository.deleteCategory(id)

    fun addMember(member: FamilyMember) = repository.addMember(member)
    fun updateMember(member: FamilyMember) = repository.updateMember(member)
    fun deleteMember(id: String) = repository.deleteMember(id)

    fun toggleBillPaid(id: String) = repository.toggleBillPaid(id)
    fun addBill(bill: Bill) = repository.addBill(bill)
    fun updateBill(bill: Bill) = repository.updateBill(bill)
    fun deleteBill(id: String) = repository.deleteBill(id)

    fun updateSalary(salary: Double) = repository.updateSalary(salary)
    fun addGoal(goal: SavingsGoal) = repository.addGoal(goal)
    fun depositToGoal(goalId: String, amount: Double) = repository.depositToGoal(goalId, amount)
    fun deleteGoal(goalId: String) = repository.deleteGoal(goalId)
    fun setEnableRollover(enabled: Boolean) = repository.setEnableRollover(enabled)
}
