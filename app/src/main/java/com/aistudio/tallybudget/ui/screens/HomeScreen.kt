package com.aistudio.tallybudget.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowDownward
import androidx.compose.material.icons.filled.ArrowUpward
import androidx.compose.material.icons.filled.ReceiptLong
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
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
import com.aistudio.tallybudget.ui.components.RadialGauge
import com.aistudio.tallybudget.ui.theme.*
import com.aistudio.tallybudget.ui.viewmodel.HomeSummary
import java.time.LocalTime

@Composable
fun HomeScreen(
    summary: HomeSummary,
    categories: List<Category>,
    members: List<FamilyMember>,
    activeMemberId: String,
    selectedMonth: String,
    onNavigateToExpenses: () -> Unit,
    onNavigateToBills: () -> Unit,
    onOpenAddExpense: () -> Unit,
    onToggleBillPaid: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val activeMember = members.find { it.id == activeMemberId } ?: FormattingUtils.ALL_MEMBER
    val hour = LocalTime.now().hour
    val greeting = when {
        hour < 12 -> "Good morning"
        hour < 17 -> "Good afternoon"
        else -> "Good evening"
    }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(bottom = 80.dp, top = 8.dp)
    ) {
        // Greeting & Month header
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "$greeting, ${activeMember.name.split(" ")[0]}",
                        style = MaterialTheme.typography.titleLarge,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = "Month: $selectedMonth",
                        fontSize = 12.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                Button(
                    onClick = onOpenAddExpense,
                    colors = ButtonDefaults.buttonColors(containerColor = AccentOrange),
                    shape = RoundedCornerShape(12.dp),
                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                    modifier = Modifier.testTag("home_add_tx_button")
                ) {
                    Icon(Icons.Default.Add, contentDescription = "Add", modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Add", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
            }
        }

        // Hero Budget Card
        item {
            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
                modifier = Modifier.fillMaxWidth().testTag("hero_budget_card")
            ) {
                Column(
                    modifier = Modifier.padding(18.dp),
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "TOTAL SPENT THIS MONTH",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                letterSpacing = 0.5.sp
                            )
                            Text(
                                text = FormattingUtils.formatRupees(summary.totalExpense),
                                style = MaterialTheme.typography.headlineLarge,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            if (summary.deltaPct != null) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(2.dp)
                                ) {
                                    val isMore = summary.deltaPct > 0
                                    Icon(
                                        imageVector = if (isMore) Icons.Default.ArrowUpward else Icons.Default.ArrowDownward,
                                        contentDescription = null,
                                        tint = if (isMore) DangerRed else PositiveGreen,
                                        modifier = Modifier.size(12.dp)
                                    )
                                    Text(
                                        text = "${Math.abs(summary.deltaPct)}% vs last month",
                                        fontSize = 11.sp,
                                        color = if (isMore) DangerRed else PositiveGreen,
                                        fontWeight = FontWeight.SemiBold
                                    )
                                }
                            }
                        }

                        RadialGauge(
                            percentage = summary.budgetUtilizationPct,
                            size = 90.dp
                        )
                    }

                    HorizontalDivider(color = TrackLight, thickness = 1.dp)

                    // Sub stats: Remaining budget & Daily burn rate
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text(
                                text = "Remaining Budget",
                                fontSize = 11.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            Text(
                                text = FormattingUtils.formatRupees(summary.remainingBudget),
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (summary.remainingBudget > 0) PositiveGreen else DangerRed
                            )
                        }

                        Column(horizontalAlignment = Alignment.End) {
                            Text(
                                text = "Daily Burn Rate",
                                fontSize = 11.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            Text(
                                text = "${FormattingUtils.formatRupees(summary.dailyAverage)} / day",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }
                    }
                }
            }
        }

        // Upcoming Bills Section
        if (summary.upcomingBills.isNotEmpty()) {
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Upcoming Bills",
                        style = MaterialTheme.typography.titleMedium,
                        color = MaterialTheme.colorScheme.onSurface
                    )
                    Text(
                        text = "View all",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = AccentOrange,
                        modifier = Modifier.clickable { onNavigateToBills() }
                    )
                }
            }

            items(summary.upcomingBills, key = { it.id }) { bill ->
                Card(
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
                    modifier = Modifier.fillMaxWidth().testTag("upcoming_bill_${bill.id}")
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp).fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = bill.title,
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                            Text(
                                text = "Due: ${bill.dueDate} • ${bill.frequency}",
                                fontSize = 11.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }

                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Text(
                                text = FormattingUtils.formatRupees(bill.amount),
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                color = AccentOrangeStrong
                            )
                            Button(
                                onClick = { onToggleBillPaid(bill.id) },
                                colors = ButtonDefaults.buttonColors(containerColor = PositiveGreen),
                                shape = RoundedCornerShape(8.dp),
                                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                                modifier = Modifier.height(28.dp)
                            ) {
                                Text("Pay", fontSize = 11.sp)
                            }
                        }
                    }
                }
            }
        }

        // Recent Transactions Section
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Recent Transactions",
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Text(
                    text = "See all",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = AccentOrange,
                    modifier = Modifier.clickable { onNavigateToExpenses() }
                )
            }
        }

        if (summary.recentTransactions.isEmpty()) {
            item {
                Box(
                    modifier = Modifier.fillMaxWidth().padding(vertical = 24.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "No transactions logged yet",
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        fontSize = 13.sp
                    )
                }
            }
        } else {
            items(summary.recentTransactions, key = { it.id }) { tx ->
                val category = categories.find { it.id == tx.category }
                val member = members.find { it.id == tx.memberId }

                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
                    modifier = Modifier.fillMaxWidth().testTag("recent_tx_${tx.id}")
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp).fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Box(
                                contentAlignment = Alignment.Center,
                                modifier = Modifier
                                    .size(36.dp)
                                    .clip(CircleShape)
                                    .background(AccentOrangeTint)
                            ) {
                                Text(
                                    text = category?.icon ?: if (tx.type == "income") "💰" else "🏷️",
                                    fontSize = 16.sp
                                )
                            }

                            Column {
                                Text(
                                    text = tx.title,
                                    fontWeight = FontWeight.SemiBold,
                                    fontSize = 13.sp,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Text(
                                    text = "${tx.date} • ${member?.name?.split(" ")?.get(0) ?: "Family"}",
                                    fontSize = 11.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                            }
                        }

                        Text(
                            text = (if (tx.type == "income") "+" else "-") + FormattingUtils.formatRupees(tx.amount),
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            color = if (tx.type == "income") PositiveGreen else MaterialTheme.colorScheme.onSurface
                        )
                    }
                }
            }
        }
    }
}
