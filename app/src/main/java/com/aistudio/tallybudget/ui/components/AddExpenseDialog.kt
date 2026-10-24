package com.aistudio.tallybudget.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.aistudio.tallybudget.data.model.Category
import com.aistudio.tallybudget.data.model.FamilyMember
import com.aistudio.tallybudget.data.model.Transaction
import com.aistudio.tallybudget.ui.theme.AccentOrange
import com.aistudio.tallybudget.ui.theme.PositiveGreen
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.UUID

@Composable
fun AddExpenseDialog(
    categories: List<Category>,
    members: List<FamilyMember>,
    editingTx: Transaction? = null,
    onDismiss: () -> Unit,
    onSave: (Transaction) -> Unit
) {
    val realMembers = members.filter { it.id != "all" }
    var title by remember { mutableStateOf(editingTx?.title ?: "") }
    var amountText by remember { mutableStateOf(editingTx?.amount?.let { if (it > 0) it.toString() else "" } ?: "") }
    var txType by remember { mutableStateOf(editingTx?.type ?: "expense") }
    var selectedCategoryId by remember {
        mutableStateOf(editingTx?.category ?: categories.firstOrNull()?.id ?: "groceries")
    }
    var selectedMemberId by remember {
        mutableStateOf(editingTx?.memberId ?: realMembers.firstOrNull()?.id ?: "")
    }
    var paymentMethod by remember { mutableStateOf(editingTx?.paymentMethod ?: "UPI") }
    var notes by remember { mutableStateOf(editingTx?.notes ?: "") }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    val paymentOptions = listOf("UPI", "Card", "Cash", "Transfer")

    Dialog(onDismissRequest = onDismiss) {
        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            elevation = CardDefaults.cardElevation(defaultElevation = 8.dp),
            modifier = Modifier
                .fillMaxWidth()
                .padding(8.dp)
                .testTag("add_expense_dialog")
        ) {
            Column(
                modifier = Modifier
                    .padding(20.dp)
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Text(
                    text = if (editingTx != null) "Edit Transaction" else "Add Transaction",
                    style = MaterialTheme.typography.titleLarge,
                    color = MaterialTheme.colorScheme.onSurface
                )

                // Type Toggle: Expense / Income
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(12.dp))
                        .background(MaterialTheme.colorScheme.surfaceVariant)
                        .padding(4.dp)
                ) {
                    Box(
                        contentAlignment = Alignment.Center,
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(8.dp))
                            .background(if (txType == "expense") AccentOrange else MaterialTheme.colorScheme.surfaceVariant)
                            .clickable { txType = "expense" }
                            .padding(vertical = 8.dp)
                            .testTag("toggle_expense")
                    ) {
                        Text(
                            text = "Expense",
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp,
                            color = if (txType == "expense") MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface
                        )
                    }

                    Box(
                        contentAlignment = Alignment.Center,
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(8.dp))
                            .background(if (txType == "income") PositiveGreen else MaterialTheme.colorScheme.surfaceVariant)
                            .clickable { txType = "income" }
                            .padding(vertical = 8.dp)
                            .testTag("toggle_income")
                    ) {
                        Text(
                            text = "Income",
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp,
                            color = if (txType == "income") MaterialTheme.colorScheme.onPrimary else MaterialTheme.colorScheme.onSurface
                        )
                    }
                }

                // Amount
                OutlinedTextField(
                    value = amountText,
                    onValueChange = { amountText = it },
                    label = { Text("Amount (₹)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth().testTag("amount_input")
                )

                // Title
                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("Title / Description") },
                    placeholder = { Text("e.g. Swiggy, Groceries") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth().testTag("title_input")
                )

                // Category selection
                if (txType == "expense") {
                    Text(
                        text = "Category",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 2.dp),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        categories.take(4).forEach { cat ->
                            val isSelected = selectedCategoryId == cat.id
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(if (isSelected) AccentOrange.copy(alpha = 0.2f) else MaterialTheme.colorScheme.surfaceVariant)
                                    .border(
                                        width = if (isSelected) 1.5.dp else 0.dp,
                                        color = if (isSelected) AccentOrange else androidx.compose.ui.graphics.Color.Transparent,
                                        shape = RoundedCornerShape(10.dp)
                                    )
                                    .clickable { selectedCategoryId = cat.id }
                                    .padding(horizontal = 8.dp, vertical = 6.dp)
                            ) {
                                Text(
                                    text = "${cat.icon} ${cat.name.split(" ")[0]}",
                                    fontSize = 11.sp,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                                )
                            }
                        }
                    }
                }

                // Member selection
                Text(
                    text = "Family Member",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    realMembers.forEach { member ->
                        val isSelected = selectedMemberId == member.id
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(10.dp))
                                .background(if (isSelected) AccentOrange.copy(alpha = 0.2f) else MaterialTheme.colorScheme.surfaceVariant)
                                .border(
                                    width = if (isSelected) 1.5.dp else 0.dp,
                                    color = if (isSelected) AccentOrange else androidx.compose.ui.graphics.Color.Transparent,
                                    shape = RoundedCornerShape(10.dp)
                                )
                                .clickable { selectedMemberId = member.id }
                                .padding(horizontal = 8.dp, vertical = 6.dp)
                        ) {
                            Text(
                                text = "${member.avatar} ${member.name.split(" ")[0]}",
                                fontSize = 11.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                            )
                        }
                    }
                }

                // Payment Method
                Text(
                    text = "Payment Method",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    paymentOptions.forEach { method ->
                        val isSelected = paymentMethod == method
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (isSelected) AccentOrange.copy(alpha = 0.2f) else MaterialTheme.colorScheme.surfaceVariant)
                                .clickable { paymentMethod = method }
                                .padding(horizontal = 10.dp, vertical = 5.dp)
                        ) {
                            Text(
                                text = method,
                                fontSize = 11.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                            )
                        }
                    }
                }

                // Notes
                OutlinedTextField(
                    value = notes,
                    onValueChange = { notes = it },
                    label = { Text("Notes (optional)") },
                    maxLines = 2,
                    modifier = Modifier.fillMaxWidth()
                )

                if (errorMessage != null) {
                    Text(
                        text = errorMessage ?: "",
                        color = MaterialTheme.colorScheme.error,
                        fontSize = 12.sp
                    )
                }

                // Action buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    TextButton(onClick = onDismiss) {
                        Text("Cancel")
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Button(
                        onClick = {
                            val amount = amountText.toDoubleOrNull()
                            if (amount == null || amount <= 0) {
                                errorMessage = "Please enter a valid amount"
                                return@Button
                            }
                            if (title.isBlank()) {
                                errorMessage = "Please enter a title"
                                return@Button
                            }

                            val tx = Transaction(
                                id = editingTx?.id ?: "tx-${UUID.randomUUID()}",
                                date = editingTx?.date ?: LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd")),
                                type = txType,
                                title = title.trim(),
                                amount = amount,
                                category = if (txType == "income") "Salary" else selectedCategoryId,
                                memberId = selectedMemberId.ifEmpty { "dad" },
                                paymentMethod = paymentMethod,
                                notes = notes.trim()
                            )
                            onSave(tx)
                            onDismiss()
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = AccentOrange),
                        modifier = Modifier.testTag("save_transaction_button")
                    ) {
                        Text(if (editingTx != null) "Update" else "Save")
                    }
                }
            }
        }
    }
}
