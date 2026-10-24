package com.aistudio.tallybudget.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
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
fun ExpensesScreen(
    transactions: List<Transaction>,
    categories: List<Category>,
    members: List<FamilyMember>,
    activeMemberId: String,
    selectedMonth: String,
    onOpenAddTx: () -> Unit,
    onEditTx: (Transaction) -> Unit,
    onDeleteTx: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    var searchQuery by remember { mutableStateOf("") }
    var selectedTypeFilter by remember { mutableStateOf("all") }
    var selectedCategoryFilter by remember { mutableStateOf("all") }

    val filtered = remember(transactions, searchQuery, selectedTypeFilter, selectedCategoryFilter) {
        transactions.filter { tx ->
            val matchQuery = searchQuery.isBlank() ||
                tx.title.contains(searchQuery, ignoreCase = true) ||
                tx.notes.contains(searchQuery, ignoreCase = true)
            val matchType = selectedTypeFilter == "all" || tx.type == selectedTypeFilter
            val matchCategory = selectedCategoryFilter == "all" || tx.category == selectedCategoryFilter
            matchQuery && matchType && matchCategory
        }.sortedByDescending { it.date }
    }

    val totalExpense = filtered.filter { it.type == "expense" }.sumOf { it.amount }
    val totalIncome = filtered.filter { it.type == "income" }.sumOf { it.amount }

    Scaffold(
        floatingActionButton = {
            FloatingActionButton(
                onClick = onOpenAddTx,
                containerColor = AccentOrange,
                contentColor = MaterialTheme.colorScheme.onPrimary,
                modifier = Modifier.padding(bottom = 56.dp).testTag("fab_add_expense")
            ) {
                Icon(Icons.Default.Add, contentDescription = "Add Transaction")
            }
        },
        containerColor = MaterialTheme.colorScheme.background,
        modifier = modifier
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            // Search field
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = TextMutedLight) },
                placeholder = { Text("Search transactions, notes...") },
                singleLine = true,
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedContainerColor = MaterialTheme.colorScheme.surface,
                    unfocusedContainerColor = MaterialTheme.colorScheme.surface
                ),
                modifier = Modifier.fillMaxWidth().testTag("tx_search_input")
            )

            // Filter chips: All, Expense, Income
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                item {
                    FilterChip(
                        selected = selectedTypeFilter == "all",
                        onClick = { selectedTypeFilter = "all" },
                        label = { Text("All") }
                    )
                }
                item {
                    FilterChip(
                        selected = selectedTypeFilter == "expense",
                        onClick = { selectedTypeFilter = "expense" },
                        label = { Text("Expenses") }
                    )
                }
                item {
                    FilterChip(
                        selected = selectedTypeFilter == "income",
                        onClick = { selectedTypeFilter = "income" },
                        label = { Text("Income") }
                    )
                }
                items(categories) { cat ->
                    FilterChip(
                        selected = selectedCategoryFilter == cat.id,
                        onClick = {
                            selectedCategoryFilter = if (selectedCategoryFilter == cat.id) "all" else cat.id
                        },
                        label = { Text("${cat.icon} ${cat.name.split(" ")[0]}") }
                    )
                }
            }

            // Summary banner
            Card(
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(12.dp).fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("Filtered Expenses", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        Text(
                            text = FormattingUtils.formatRupees(totalExpense),
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp,
                            color = DangerRed
                        )
                    }
                    Column(horizontalAlignment = Alignment.End) {
                        Text("Filtered Income", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        Text(
                            text = FormattingUtils.formatRupees(totalIncome),
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp,
                            color = PositiveGreen
                        )
                    }
                }
            }

            // Transactions list
            if (filtered.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxSize().padding(32.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "No matching transactions found",
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            } else {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                    contentPadding = PaddingValues(bottom = 90.dp)
                ) {
                    items(filtered, key = { it.id }) { tx ->
                        val cat = categories.find { it.id == tx.category }
                        val member = members.find { it.id == tx.memberId }

                        Card(
                            shape = RoundedCornerShape(14.dp),
                            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                            border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
                            modifier = Modifier.fillMaxWidth().testTag("tx_card_${tx.id}")
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
                                            .size(40.dp)
                                            .clip(CircleShape)
                                            .background(if (tx.type == "income") PositiveGreenTint else AccentOrangeTint)
                                    ) {
                                        Text(
                                            text = cat?.icon ?: if (tx.type == "income") "💰" else "🏷️",
                                            fontSize = 18.sp
                                        )
                                    }

                                    Column {
                                        Text(
                                            text = tx.title,
                                            fontWeight = FontWeight.SemiBold,
                                            fontSize = 14.sp,
                                            color = MaterialTheme.colorScheme.onSurface
                                        )
                                        Text(
                                            text = "${tx.date} • ${member?.name?.split(" ")?.get(0) ?: "Family"} • ${tx.paymentMethod}",
                                            fontSize = 11.sp,
                                            color = MaterialTheme.colorScheme.onSurfaceVariant
                                        )
                                        if (tx.notes.isNotBlank()) {
                                            Text(
                                                text = tx.notes,
                                                fontSize = 11.sp,
                                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                                                maxLines = 1
                                            )
                                        }
                                    }
                                }

                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                                ) {
                                    Text(
                                        text = (if (tx.type == "income") "+" else "-") + FormattingUtils.formatRupees(tx.amount),
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 14.sp,
                                        color = if (tx.type == "income") PositiveGreen else MaterialTheme.colorScheme.onSurface
                                    )

                                    IconButton(
                                        onClick = { onEditTx(tx) },
                                        modifier = Modifier.size(28.dp)
                                    ) {
                                        Icon(Icons.Default.Edit, contentDescription = "Edit", modifier = Modifier.size(16.dp))
                                    }

                                    IconButton(
                                        onClick = { onDeleteTx(tx.id) },
                                        modifier = Modifier.size(28.dp)
                                    ) {
                                        Icon(Icons.Default.Delete, contentDescription = "Delete", tint = DangerRed, modifier = Modifier.size(16.dp))
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
