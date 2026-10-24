package com.aistudio.tallybudget.ui.components

import androidx.compose.foundation.background
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
import com.aistudio.tallybudget.data.model.Bill
import com.aistudio.tallybudget.data.model.Category
import com.aistudio.tallybudget.data.model.FamilyMember
import com.aistudio.tallybudget.ui.theme.AccentOrange
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.UUID

@Composable
fun AddBillDialog(
    members: List<FamilyMember>,
    categories: List<Category>,
    editingBill: Bill? = null,
    onDismiss: () -> Unit,
    onSave: (Bill) -> Unit
) {
    val realMembers = members.filter { it.id != "all" }
    var title by remember { mutableStateOf(editingBill?.title ?: "") }
    var amountText by remember { mutableStateOf(editingBill?.amount?.let { if (it > 0) it.toString() else "" } ?: "") }
    var dueDate by remember {
        mutableStateOf(editingBill?.dueDate ?: LocalDate.now().plusDays(5).format(DateTimeFormatter.ofPattern("yyyy-MM-dd")))
    }
    var selectedPayerId by remember {
        mutableStateOf(editingBill?.payerId ?: realMembers.firstOrNull()?.id ?: "dad")
    }
    var frequency by remember { mutableStateOf(editingBill?.frequency ?: "monthly") }
    var categoryId by remember {
        mutableStateOf(editingBill?.category ?: categories.firstOrNull()?.id ?: "utilities")
    }
    var autoRecordExpense by remember { mutableStateOf(editingBill?.autoRecordExpense ?: true) }
    var errorMsg by remember { mutableStateOf<String?>(null) }

    val frequencies = listOf("monthly" to "Monthly", "weekly" to "Weekly", "yearly" to "Yearly")

    Dialog(onDismissRequest = onDismiss) {
        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            elevation = CardDefaults.cardElevation(defaultElevation = 8.dp),
            modifier = Modifier.fillMaxWidth().padding(8.dp).testTag("add_bill_dialog")
        ) {
            Column(
                modifier = Modifier.padding(20.dp).verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Text(
                    text = if (editingBill != null) "Edit Bill Reminder" else "Add Bill Reminder",
                    style = MaterialTheme.typography.titleLarge
                )

                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("Bill Title") },
                    placeholder = { Text("e.g. Broadband, Rent, Netflix") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth().testTag("bill_title_input")
                )

                OutlinedTextField(
                    value = amountText,
                    onValueChange = { amountText = it },
                    label = { Text("Amount (₹)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth().testTag("bill_amount_input")
                )

                OutlinedTextField(
                    value = dueDate,
                    onValueChange = { dueDate = it },
                    label = { Text("Due Date (YYYY-MM-DD)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                // Frequency options
                Text("Recurrence Frequency", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    frequencies.forEach { (key, label) ->
                        val isSelected = frequency == key
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (isSelected) AccentOrange.copy(alpha = 0.2f) else MaterialTheme.colorScheme.surfaceVariant)
                                .clickable { frequency = key }
                                .padding(horizontal = 10.dp, vertical = 6.dp)
                        ) {
                            Text(
                                text = label,
                                fontSize = 11.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal
                            )
                        }
                    }
                }

                // Payer selection
                Text("Assigned Payer", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    realMembers.forEach { member ->
                        val isSelected = selectedPayerId == member.id
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (isSelected) AccentOrange.copy(alpha = 0.2f) else MaterialTheme.colorScheme.surfaceVariant)
                                .clickable { selectedPayerId = member.id }
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

                // Auto-record checkbox
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.clickable { autoRecordExpense = !autoRecordExpense }
                ) {
                    Checkbox(
                        checked = autoRecordExpense,
                        onCheckedChange = { autoRecordExpense = it }
                    )
                    Text(
                        text = "Auto-record as expense when marked paid",
                        fontSize = 12.sp
                    )
                }

                if (errorMsg != null) {
                    Text(errorMsg ?: "", color = MaterialTheme.colorScheme.error, fontSize = 12.sp)
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.End
                ) {
                    TextButton(onClick = onDismiss) { Text("Cancel") }
                    Spacer(modifier = Modifier.width(8.dp))
                    Button(
                        onClick = {
                            val amount = amountText.toDoubleOrNull()
                            if (amount == null || amount <= 0) {
                                errorMsg = "Please enter a valid amount"
                                return@Button
                            }
                            if (title.isBlank()) {
                                errorMsg = "Please enter a title"
                                return@Button
                            }

                            val bill = Bill(
                                id = editingBill?.id ?: "bill-${UUID.randomUUID()}",
                                title = title.trim(),
                                amount = amount,
                                dueDate = dueDate.trim(),
                                paid = editingBill?.paid ?: false,
                                payerId = selectedPayerId,
                                frequency = frequency,
                                category = categoryId,
                                autoRecordExpense = autoRecordExpense
                            )
                            onSave(bill)
                            onDismiss()
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = AccentOrange),
                        modifier = Modifier.testTag("save_bill_button")
                    ) {
                        Text(if (editingBill != null) "Update" else "Save Bill")
                    }
                }
            }
        }
    }
}
