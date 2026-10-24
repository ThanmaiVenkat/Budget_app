package com.aistudio.tallybudget.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
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
import com.aistudio.tallybudget.data.model.FormattingUtils
import com.aistudio.tallybudget.data.model.PersonalState
import com.aistudio.tallybudget.data.model.SavingsGoal
import com.aistudio.tallybudget.ui.theme.*

@Composable
fun PersonalSavingsScreen(
    personalState: PersonalState,
    onUpdateSalary: (Double) -> Unit,
    onOpenAddGoal: () -> Unit,
    onDepositToGoal: (String, Double) -> Unit,
    onDeleteGoal: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    var showSalaryDialog by remember { mutableStateOf(false) }
    var salaryInput by remember { mutableStateOf(personalState.salary.toString()) }
    var depositGoalId by remember { mutableStateOf<String?>(null) }
    var depositInput by remember { mutableStateOf("") }

    val totalSaved = personalState.goals.sumOf { it.current }
    val totalTarget = personalState.goals.sumOf { it.target }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(bottom = 80.dp, top = 8.dp)
    ) {
        // Salary card
        item {
            Card(
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
                modifier = Modifier.fillMaxWidth().testTag("salary_card")
            ) {
                Row(
                    modifier = Modifier.padding(16.dp).fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("MONTHLY SALARY / EARNINGS", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.onSurfaceVariant)
                        Text(
                            FormattingUtils.formatRupees(personalState.salary),
                            style = MaterialTheme.typography.headlineMedium,
                            color = MaterialTheme.colorScheme.onSurface
                        )
                    }

                    IconButton(
                        onClick = {
                            salaryInput = personalState.salary.toString()
                            showSalaryDialog = true
                        }
                    ) {
                        Icon(Icons.Default.Edit, contentDescription = "Edit Salary", tint = AccentOrange)
                    }
                }
            }
        }

        // Goals Header
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text("Personal Savings Goals", style = MaterialTheme.typography.titleMedium)
                    Text(
                        "Total Saved: ${FormattingUtils.formatRupees(totalSaved)} of ${FormattingUtils.formatRupees(totalTarget)}",
                        fontSize = 11.sp,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                Button(
                    onClick = onOpenAddGoal,
                    colors = ButtonDefaults.buttonColors(containerColor = AccentOrange),
                    shape = RoundedCornerShape(10.dp),
                    contentPadding = PaddingValues(horizontal = 10.dp, vertical = 6.dp),
                    modifier = Modifier.testTag("add_goal_button")
                ) {
                    Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("New Goal", fontSize = 12.sp)
                }
            }
        }

        if (personalState.goals.isEmpty()) {
            item {
                Box(modifier = Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) {
                    Text("No savings goals yet. Add one to start building wealth!", color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        } else {
            items(personalState.goals, key = { it.id }) { goal ->
                val pct = if (goal.target > 0) ((goal.current / goal.target) * 100).toInt().coerceIn(0, 100) else 0

                Card(
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
                    modifier = Modifier.fillMaxWidth().testTag("goal_card_${goal.id}")
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
                            Column {
                                Text(goal.title, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                                Text("${goal.category}${if (goal.sipEnabled) " • SIP ₹${goal.sipAmount.toInt()}/mo" else ""}", fontSize = 11.sp, color = MaterialTheme.colorScheme.onSurfaceVariant)
                            }

                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                Button(
                                    onClick = {
                                        depositGoalId = goal.id
                                        depositInput = ""
                                    },
                                    colors = ButtonDefaults.buttonColors(containerColor = PositiveGreen),
                                    shape = RoundedCornerShape(8.dp),
                                    contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                                    modifier = Modifier.height(28.dp)
                                ) {
                                    Text("+ Deposit", fontSize = 11.sp)
                                }

                                IconButton(
                                    onClick = { onDeleteGoal(goal.id) },
                                    modifier = Modifier.size(24.dp)
                                ) {
                                    Icon(Icons.Default.Delete, contentDescription = "Delete", tint = DangerRed, modifier = Modifier.size(16.dp))
                                }
                            }
                        }

                        LinearProgressIndicator(
                            progress = { (goal.current / goal.target.coerceAtLeast(1.0)).toFloat().coerceIn(0f, 1f) },
                            modifier = Modifier.fillMaxWidth().height(8.dp).clip(RoundedCornerShape(4.dp)),
                            color = PositiveGreen,
                            trackColor = TrackLight
                        )

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = "${FormattingUtils.formatRupees(goal.current)} / ${FormattingUtils.formatRupees(goal.target)}",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "$pct% achieved",
                                fontSize = 11.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            }
        }
    }

    // Edit Salary Dialog
    if (showSalaryDialog) {
        Dialog(onDismissRequest = { showSalaryDialog = false }) {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                modifier = Modifier.padding(16.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("Update Monthly Salary", style = MaterialTheme.typography.titleMedium)
                    OutlinedTextField(
                        value = salaryInput,
                        onValueChange = { salaryInput = it },
                        label = { Text("Amount (₹)") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                        TextButton(onClick = { showSalaryDialog = false }) { Text("Cancel") }
                        Button(
                            onClick = {
                                val salary = salaryInput.toDoubleOrNull() ?: personalState.salary
                                onUpdateSalary(salary)
                                showSalaryDialog = false
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = AccentOrange)
                        ) {
                            Text("Save")
                        }
                    }
                }
            }
        }
    }

    // Deposit to Goal Dialog
    if (depositGoalId != null) {
        Dialog(onDismissRequest = { depositGoalId = null }) {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                modifier = Modifier.padding(16.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                    Text("Deposit into Goal", style = MaterialTheme.typography.titleMedium)
                    OutlinedTextField(
                        value = depositInput,
                        onValueChange = { depositInput = it },
                        label = { Text("Deposit Amount (₹)") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End) {
                        TextButton(onClick = { depositGoalId = null }) { Text("Cancel") }
                        Button(
                            onClick = {
                                val amount = depositInput.toDoubleOrNull()
                                if (amount != null && amount > 0) {
                                    onDepositToGoal(depositGoalId!!, amount)
                                }
                                depositGoalId = null
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = PositiveGreen)
                        ) {
                            Text("Deposit")
                        }
                    }
                }
            }
        }
    }
}
