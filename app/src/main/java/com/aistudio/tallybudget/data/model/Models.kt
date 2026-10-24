package com.aistudio.tallybudget.data.model

import java.text.NumberFormat
import java.util.Locale

data class Transaction(
    val id: String,
    val date: String, // YYYY-MM-DD
    val type: String, // "expense" or "income"
    val title: String,
    val amount: Double,
    val category: String,
    val memberId: String,
    val paymentMethod: String = "UPI",
    val notes: String = "",
    val receiptUrl: String? = null,
    val createdByUid: String? = null
)

data class Category(
    val id: String,
    val name: String,
    val icon: String,
    val limit: Double = 0.0,
    val colorHex: String = "#4A6B8A",
    val limits: Map<String, Double> = emptyMap()
) {
    fun limitForMonth(monthKey: String): Double {
        if (monthKey == "all" || monthKey.isEmpty()) return limit
        return limits[monthKey] ?: limit
    }
}

data class FamilyMember(
    val id: String,
    val name: String,
    val avatar: String,
    val colorHex: String,
    val role: String,
    val allowance: Double = 0.0,
    val isEarner: Boolean = false,
    val ownerUid: String? = null
)

data class Bill(
    val id: String,
    val title: String,
    val amount: Double,
    val dueDate: String, // YYYY-MM-DD
    val paid: Boolean = false,
    val payerId: String,
    val frequency: String = "monthly", // "monthly", "weekly", "yearly"
    val category: String = "utilities",
    val autoRecordExpense: Boolean = true
)

data class SavingsGoal(
    val id: String,
    val title: String,
    val target: Double,
    val current: Double,
    val category: String = "Savings",
    val sipEnabled: Boolean = false,
    val sipAmount: Double = 0.0,
    val sipDay: Int = 5
)

data class PersonalState(
    val salary: Double = 85000.0,
    val goals: List<SavingsGoal> = emptyList(),
    val transactions: List<Transaction> = emptyList()
)

data class Household(
    val id: String = "DEMO77",
    val name: String = "Our Family Household",
    val joinCode: String = "DEMO77",
    val enableRollover: Boolean = true
)

enum class NavigationTab(val title: String) {
    HOME("Home"),
    EXPENSES("Expenses"),
    BUDGETS("Budgets"),
    ANALYTICS("Analytics"),
    MEMBERS_AND_BILLS("Family & Bills"),
    PERSONAL_SAVINGS("Personal")
}

object FormattingUtils {
    fun formatRupees(amount: Double): String {
        val format = NumberFormat.getCurrencyInstance(Locale("en", "IN"))
        format.maximumFractionDigits = 0
        return format.format(amount).replace("INR", "₹")
    }

    val ALL_MEMBER = FamilyMember(
        id = "all",
        name = "All Family",
        avatar = "👨‍👩‍👧‍👦",
        colorHex = "#C2661F",
        role = "Household Pool"
    )

    val MEMBER_AVATARS = listOf(
        "👩‍💼" to "Mom",
        "👨‍💻" to "Dad",
        "👦" to "Son",
        "👧" to "Daughter",
        "👵" to "Grandma",
        "👴" to "Grandpa",
        "🧒" to "Kid",
        "🐶" to "Pet"
    )

    val CATEGORY_COLORS = listOf(
        "#4F7A5C", "#4A6B8A", "#B07C2A", "#A8496B", "#7B5EA7",
        "#3F7C82", "#6B6A9E", "#A8412A", "#C2661F"
    )
}
