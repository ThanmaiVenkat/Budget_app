package com.aistudio.tallybudget.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aistudio.tallybudget.data.model.Category
import com.aistudio.tallybudget.data.model.FamilyMember
import com.aistudio.tallybudget.data.model.FormattingUtils
import com.aistudio.tallybudget.data.model.Transaction
import com.aistudio.tallybudget.ui.theme.*

@Composable
fun AnalyticsScreen(
    transactions: List<Transaction>,
    categories: List<Category>,
    members: List<FamilyMember>,
    selectedMonth: String,
    modifier: Modifier = Modifier
) {
    val monthTxs = remember(transactions, selectedMonth) {
        transactions.filter { selectedMonth == "all" || it.date.startsWith(selectedMonth) }
    }

    val totalExpense = monthTxs.filter { it.type == "expense" }.sumOf { it.amount }
    val totalIncome = monthTxs.filter { it.type == "income" }.sumOf { it.amount }
    val netSavings = totalIncome - totalExpense

    val categoryBreakdown = remember(monthTxs, categories, totalExpense) {
        categories.map { cat ->
            val spent = monthTxs.filter { it.category == cat.id && it.type == "expense" }.sumOf { it.amount }
            val pct = if (totalExpense > 0) ((spent / totalExpense) * 100).toInt() else 0
            Triple(cat, spent, pct)
        }.filter { it.second > 0 }.sortedByDescending { it.second }
    }

    val realMembers = members.filter { it.id != "all" }
    val memberBreakdown = remember(monthTxs, realMembers) {
        realMembers.map { mem ->
            val spent = monthTxs.filter { it.memberId == mem.id && it.type == "expense" }.sumOf { it.amount }
            mem to spent
        }.sortedByDescending { it.second }
    }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(bottom = 80.dp, top = 8.dp)
    ) {
        // High level overview card
        item {
            Card(
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
                modifier = Modifier.fillMaxWidth().testTag("analytics_overview_card")
            ) {
                Column(
                    modifier = Modifier.padding(18.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text("Cashflow & Net Savings", style = MaterialTheme.typography.titleMedium)

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text("Total Income", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            Text(
                                FormattingUtils.formatRupees(totalIncome),
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp,
                                color = PositiveGreen
                            )
                        }

                        Column {
                            Text("Total Expenses", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            Text(
                                FormattingUtils.formatRupees(totalExpense),
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp,
                                color = DangerRed
                            )
                        }

                        Column(horizontalAlignment = Alignment.End) {
                            Text("Net Cashflow", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            Text(
                                FormattingUtils.formatRupees(netSavings),
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp,
                                color = if (netSavings >= 0) PositiveGreen else DangerRed
                            )
                        }
                    }
                }
            }
        }

        // Category Expense Distribution
        item {
            Text("Category Breakdown", style = MaterialTheme.typography.titleMedium)
        }

        if (categoryBreakdown.isEmpty()) {
            item {
                Box(modifier = Modifier.fillMaxWidth().padding(16.dp), contentAlignment = Alignment.Center) {
                    Text("No expenses logged for this period", color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        } else {
            items(categoryBreakdown, key = { it.first.id }) { (cat, spent, pct) ->
                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
                    modifier = Modifier.fillMaxWidth().testTag("cat_stat_${cat.id}")
                ) {
                    Column(
                        modifier = Modifier.padding(14.dp),
                        verticalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                Text(text = cat.icon, fontSize = 18.sp)
                                Text(text = cat.name, fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                            }

                            Text(
                                text = "${FormattingUtils.formatRupees(spent)} ($pct%)",
                                fontWeight = FontWeight.Bold,
                                fontSize = 13.sp,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }

                        LinearProgressIndicator(
                            progress = { pct / 100f },
                            modifier = Modifier.fillMaxWidth().height(6.dp).clip(RoundedCornerShape(3.dp)),
                            color = AccentOrange,
                            trackColor = TrackLight
                        )
                    }
                }
            }
        }

        // Member Spending Comparison
        item {
            Text("Member Spending Comparison", style = MaterialTheme.typography.titleMedium)
        }

        items(memberBreakdown, key = { it.first.id }) { (mem, spent) ->
            val pct = if (totalExpense > 0) ((spent / totalExpense) * 100).toInt() else 0
            Card(
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
                modifier = Modifier.fillMaxWidth().testTag("member_stat_${mem.id}")
            ) {
                Row(
                    modifier = Modifier.padding(14.dp).fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        Box(
                            contentAlignment = Alignment.Center,
                            modifier = Modifier.size(36.dp).clip(CircleShape).background(MaterialTheme.colorScheme.surfaceVariant)
                        ) {
                            Text(mem.avatar, fontSize = 18.sp)
                        }
                        Column {
                            Text(mem.name, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                            Text("${pct}% of household spend", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                    }

                    Text(
                        FormattingUtils.formatRupees(spent),
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                }
            }
        }
    }
}
