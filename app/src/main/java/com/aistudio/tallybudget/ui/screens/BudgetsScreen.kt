package com.aistudio.tallybudget.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aistudio.tallybudget.data.model.Category
import com.aistudio.tallybudget.data.model.FormattingUtils
import com.aistudio.tallybudget.data.model.Transaction
import com.aistudio.tallybudget.ui.theme.*

@Composable
fun BudgetsScreen(
    categories: List<Category>,
    transactions: List<Transaction>,
    selectedMonth: String,
    enableRollover: Boolean,
    onSetEnableRollover: (Boolean) -> Unit,
    onOpenAddCategory: () -> Unit,
    onUpdateCategoryLimit: (String, Double) -> Unit,
    onDeleteCategory: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    var editingCategoryId by remember { mutableStateOf<String?>(null) }
    var editLimitText by remember { mutableStateOf("") }

    val monthExpenses = remember(transactions, selectedMonth) {
        transactions.filter { it.type == "expense" && (selectedMonth == "all" || it.date.startsWith(selectedMonth)) }
    }

    val totalBudget = categories.sumOf { it.limitForMonth(selectedMonth) }
    val totalSpent = monthExpenses.sumOf { it.amount }
    val remaining = (totalBudget - totalSpent).coerceAtLeast(0.0)
    val overallPct = if (totalBudget > 0) ((totalSpent / totalBudget) * 100).toInt() else 0

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
        contentPadding = PaddingValues(bottom = 80.dp, top = 8.dp)
    ) {
        // Overall Budget Card
        item {
            Card(
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
                modifier = Modifier.fillMaxWidth().testTag("overall_budget_card")
            ) {
                Column(
                    modifier = Modifier.padding(18.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "TOTAL MONTHLY BUDGET",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            Text(
                                text = FormattingUtils.formatRupees(totalBudget),
                                style = MaterialTheme.typography.headlineMedium,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }

                        Text(
                            text = "$overallPct% Spent",
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            color = when {
                                overallPct >= 90 -> DangerRed
                                overallPct >= 75 -> AccentOrange
                                else -> PositiveGreen
                            }
                        )
                    }

                    // Progress bar
                    LinearProgressIndicator(
                        progress = { (totalSpent / totalBudget.coerceAtLeast(1.0)).toFloat().coerceIn(0f, 1f) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(8.dp)
                            .clip(RoundedCornerShape(4.dp)),
                        color = when {
                            overallPct >= 90 -> DangerRed
                            overallPct >= 75 -> AccentOrange
                            else -> PositiveGreen
                        },
                        trackColor = TrackLight,
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "Spent: ${FormattingUtils.formatRupees(totalSpent)}",
                            fontSize = 12.sp,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Text(
                            text = "Remaining: ${FormattingUtils.formatRupees(remaining)}",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = if (remaining > 0) PositiveGreen else DangerRed
                        )
                    }

                    HorizontalDivider(color = TrackLight, thickness = 1.dp)

                    // Rollover Switch
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("Unused Budget Rollover", fontWeight = FontWeight.SemiBold, fontSize = 13.sp)
                            Text("Carry unspent allowance to next month", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        }
                        Switch(
                            checked = enableRollover,
                            onCheckedChange = onSetEnableRollover,
                            colors = SwitchDefaults.colors(checkedThumbColor = AccentOrange)
                        )
                    }
                }
            }
        }

        // Section Title & Add Category Button
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Category Budgets",
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.onSurface
                )
                TextButton(
                    onClick = onOpenAddCategory,
                    colors = ButtonDefaults.textButtonColors(contentColor = AccentOrange),
                    modifier = Modifier.testTag("add_category_button")
                ) {
                    Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Add Category", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                }
            }
        }

        // Categories List
        items(categories, key = { it.id }) { cat ->
            val limit = cat.limitForMonth(selectedMonth)
            val spent = monthExpenses.filter { it.category == cat.id }.sumOf { it.amount }
            val pct = if (limit > 0) ((spent / limit) * 100).toInt() else 0
            val isEditing = editingCategoryId == cat.id

            Card(
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
                modifier = Modifier.fillMaxWidth().testTag("budget_card_${cat.id}")
            ) {
                Column(
                    modifier = Modifier.padding(14.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Text(text = cat.icon, fontSize = 20.sp)
                            Text(
                                text = cat.name,
                                fontWeight = FontWeight.SemiBold,
                                fontSize = 14.sp,
                                color = MaterialTheme.colorScheme.onSurface
                            )
                        }

                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            if (isEditing) {
                                OutlinedTextField(
                                    value = editLimitText,
                                    onValueChange = { editLimitText = it },
                                    singleLine = true,
                                    modifier = Modifier.width(100.dp).height(48.dp)
                                )
                                IconButton(
                                    onClick = {
                                        val newLimit = editLimitText.toDoubleOrNull() ?: limit
                                        onUpdateCategoryLimit(cat.id, newLimit)
                                        editingCategoryId = null
                                    }
                                ) {
                                    Icon(Icons.Default.Check, contentDescription = "Save", tint = PositiveGreen)
                                }
                            } else {
                                Text(
                                    text = "${FormattingUtils.formatRupees(spent)} / ${FormattingUtils.formatRupees(limit)}",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                IconButton(
                                    onClick = {
                                        editingCategoryId = cat.id
                                        editLimitText = limit.toString()
                                    },
                                    modifier = Modifier.size(24.dp)
                                ) {
                                    Icon(Icons.Default.Edit, contentDescription = "Edit limit", modifier = Modifier.size(14.dp))
                                }
                                IconButton(
                                    onClick = { onDeleteCategory(cat.id) },
                                    modifier = Modifier.size(24.dp)
                                ) {
                                    Icon(Icons.Default.Delete, contentDescription = "Delete category", tint = DangerRed, modifier = Modifier.size(14.dp))
                                }
                            }
                        }
                    }

                    // Category Progress Bar
                    if (limit > 0) {
                        LinearProgressIndicator(
                            progress = { (spent / limit).toFloat().coerceIn(0f, 1f) },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(6.dp)
                                .clip(RoundedCornerShape(3.dp)),
                            color = when {
                                pct >= 100 -> DangerRed
                                pct >= 80 -> AccentOrange
                                else -> PositiveGreen
                            },
                            trackColor = TrackLight
                        )

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = "$pct% consumed",
                                fontSize = 10.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            val remainingCat = limit - spent
                            Text(
                                text = if (remainingCat >= 0) "${FormattingUtils.formatRupees(remainingCat)} left" else "Over by ${FormattingUtils.formatRupees(-remainingCat)}",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (remainingCat >= 0) PositiveGreen else DangerRed
                            )
                        }
                    }
                }
            }
        }
    }
}
