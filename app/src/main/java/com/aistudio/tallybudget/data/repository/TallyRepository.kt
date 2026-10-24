package com.aistudio.tallybudget.data.repository

import com.aistudio.tallybudget.data.model.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.UUID

class TallyRepository {
    private val today = LocalDate.now()
    private val dateFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd")
    private val todayStr = today.format(dateFormatter)

    private val initialCategories = listOf(
        Category("groceries", "Groceries & Provisions", "🛒", 15000.0, "#4F7A5C"),
        Category("housing", "Rent & Maintenance", "🏠", 25000.0, "#4A6B8A"),
        Category("utilities", "Electricity & Bills", "⚡", 6000.0, "#B07C2A"),
        Category("dining", "Dining Out & Swiggy", "🍽️", 5000.0, "#A8496B"),
        Category("entertainment", "Movies & Outings", "🎮", 3000.0, "#7B5EA7"),
        Category("health", "Health & Pharmacy", "🏥", 3000.0, "#3F7C82"),
        Category("education", "School & Tuition", "📚", 3000.0, "#6B6A9E"),
        Category("transport", "Fuel & Cab Fare", "🚗", 4000.0, "#3F7C82"),
        Category("shopping", "Shopping & Clothes", "🛍️", 8000.0, "#A8412A")
    )

    private val initialMembers = listOf(
        FormattingUtils.ALL_MEMBER,
        FamilyMember("dad", "Dad (Rajesh)", "👨‍💻", "#4A6B8A", "Father", 0.0, isEarner = true),
        FamilyMember("mom", "Mom (Pooja)", "👩‍💼", "#4F7A5C", "Mother", 10000.0, isEarner = false),
        FamilyMember("son", "Aarav", "👦", "#B07C2A", "Son", 2500.0, isEarner = false)
    )

    private val initialTransactions = listOf(
        Transaction(
            id = "tx-1",
            date = todayStr,
            type = "income",
            title = "Monthly Salary",
            amount = 85000.0,
            category = "Salary",
            memberId = "dad",
            paymentMethod = "Transfer",
            notes = "Direct deposit"
        ),
        Transaction(
            id = "tx-2",
            date = todayStr,
            type = "expense",
            title = "Nature Basket Organic Groceries",
            amount = 3450.0,
            category = "groceries",
            memberId = "mom",
            paymentMethod = "UPI",
            notes = "Monthly staples & veggies"
        ),
        Transaction(
            id = "tx-3",
            date = today.minusDays(2).format(dateFormatter),
            type = "expense",
            title = "Swiggy Weekend Dinner",
            amount = 1120.0,
            category = "dining",
            memberId = "dad",
            paymentMethod = "UPI",
            notes = "Family pizza night"
        ),
        Transaction(
            id = "tx-4",
            date = today.minusDays(4).format(dateFormatter),
            type = "expense",
            title = "Fuel & Highway Toll",
            amount = 2200.0,
            category = "transport",
            memberId = "dad",
            paymentMethod = "Card",
            notes = "Weekend trip"
        )
    )

    private val initialBills = listOf(
        Bill(
            id = "b-1",
            title = "Airtel Fiber Broadband",
            amount = 1199.0,
            dueDate = today.plusDays(4).format(dateFormatter),
            paid = false,
            payerId = "dad",
            frequency = "monthly",
            category = "utilities"
        ),
        Bill(
            id = "b-2",
            title = "Electricity & Maintenance",
            amount = 3450.0,
            dueDate = today.plusDays(2).format(dateFormatter),
            paid = false,
            payerId = "mom",
            frequency = "monthly",
            category = "utilities"
        ),
        Bill(
            id = "b-3",
            title = "Netflix Premium Subscription",
            amount = 649.0,
            dueDate = today.plusDays(8).format(dateFormatter),
            paid = false,
            payerId = "dad",
            frequency = "monthly",
            category = "entertainment"
        )
    )

    private val initialGoals = listOf(
        SavingsGoal("g-1", "Emergency Fund", 100000.0, 45000.0, "Savings", sipEnabled = true, sipAmount = 5000.0, sipDay = 5),
        SavingsGoal("g-2", "Diwali Gold & Gifts", 50000.0, 28000.0, "Festival", sipEnabled = false)
    )

    private val _household = MutableStateFlow(Household())
    val household: StateFlow<Household> = _household.asStateFlow()

    private val _categories = MutableStateFlow(initialCategories)
    val categories: StateFlow<List<Category>> = _categories.asStateFlow()

    private val _members = MutableStateFlow(initialMembers)
    val members: StateFlow<List<FamilyMember>> = _members.asStateFlow()

    private val _transactions = MutableStateFlow(initialTransactions)
    val transactions: StateFlow<List<Transaction>> = _transactions.asStateFlow()

    private val _bills = MutableStateFlow(initialBills)
    val bills: StateFlow<List<Bill>> = _bills.asStateFlow()

    private val _personalState = MutableStateFlow(
        PersonalState(salary = 85000.0, goals = initialGoals)
    )
    val personalState: StateFlow<PersonalState> = _personalState.asStateFlow()

    // Transactions CRUD
    fun addTransaction(tx: Transaction) {
        _transactions.value = listOf(tx) + _transactions.value
    }

    fun updateTransaction(tx: Transaction) {
        _transactions.value = _transactions.value.map { if (it.id == tx.id) tx else it }
    }

    fun deleteTransaction(id: String) {
        _transactions.value = _transactions.value.filter { it.id != id }
    }

    // Categories CRUD
    fun addCategory(cat: Category) {
        _categories.value = _categories.value + cat
    }

    fun updateCategoryLimit(catId: String, monthKey: String, limit: Double) {
        _categories.value = _categories.value.map {
            if (it.id == catId) {
                val updatedLimits = it.limits.toMutableMap()
                if (monthKey != "all") {
                    updatedLimits[monthKey] = limit
                }
                it.copy(limit = if (monthKey == "all") limit else it.limit, limits = updatedLimits)
            } else it
        }
    }

    fun deleteCategory(id: String) {
        _categories.value = _categories.value.filter { it.id != id }
    }

    // Members CRUD
    fun addMember(member: FamilyMember) {
        _members.value = _members.value + member
    }

    fun updateMember(member: FamilyMember) {
        _members.value = _members.value.map { if (it.id == member.id) member else it }
    }

    fun deleteMember(id: String) {
        if (id == "all") return
        _members.value = _members.value.filter { it.id != id }
    }

    // Bills CRUD
    fun toggleBillPaid(billId: String) {
        val bill = _bills.value.find { it.id == billId } ?: return
        val newPaid = !bill.paid
        _bills.value = _bills.value.map { if (it.id == billId) it.copy(paid = newPaid) else it }

        // If marked paid and auto-record is enabled, record transaction
        if (newPaid && bill.autoRecordExpense) {
            val newTx = Transaction(
                id = "tx-bill-${UUID.randomUUID()}",
                date = todayStr,
                type = "expense",
                title = "Paid: ${bill.title}",
                amount = bill.amount,
                category = bill.category,
                memberId = bill.payerId,
                paymentMethod = "Auto-Debit",
                notes = "Auto-recorded bill payment"
            )
            addTransaction(newTx)
        }
    }

    fun addBill(bill: Bill) {
        _bills.value = _bills.value + bill
    }

    fun updateBill(bill: Bill) {
        _bills.value = _bills.value.map { if (it.id == bill.id) bill else it }
    }

    fun deleteBill(id: String) {
        _bills.value = _bills.value.filter { it.id != id }
    }

    // Personal State CRUD
    fun updateSalary(newSalary: Double) {
        _personalState.value = _personalState.value.copy(salary = newSalary)
    }

    fun addGoal(goal: SavingsGoal) {
        val currentGoals = _personalState.value.goals
        _personalState.value = _personalState.value.copy(goals = currentGoals + goal)
    }

    fun depositToGoal(goalId: String, amount: Double) {
        val updatedGoals = _personalState.value.goals.map {
            if (it.id == goalId) it.copy(current = it.current + amount) else it
        }
        _personalState.value = _personalState.value.copy(goals = updatedGoals)
    }

    fun deleteGoal(goalId: String) {
        val updatedGoals = _personalState.value.goals.filter { it.id != goalId }
        _personalState.value = _personalState.value.copy(goals = updatedGoals)
    }

    fun setEnableRollover(enabled: Boolean) {
        _household.value = _household.value.copy(enableRollover = enabled)
    }
}
