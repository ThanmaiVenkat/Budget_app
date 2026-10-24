package com.aistudio.tallybudget.ui.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.aistudio.tallybudget.data.model.SavingsGoal
import com.aistudio.tallybudget.ui.theme.AccentOrange
import java.util.UUID

@Composable
fun AddGoalDialog(
    onDismiss: () -> Unit,
    onSave: (SavingsGoal) -> Unit
) {
    var title by remember { mutableStateOf("") }
    var targetText by remember { mutableStateOf("") }
    var currentText by remember { mutableStateOf("") }
    var category by remember { mutableStateOf("Savings") }
    var sipEnabled by remember { mutableStateOf(false) }
    var sipAmountText by remember { mutableStateOf("") }
    var errorMsg by remember { mutableStateOf<String?>(null) }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            elevation = CardDefaults.cardElevation(defaultElevation = 8.dp),
            modifier = Modifier.fillMaxWidth().padding(8.dp).testTag("add_goal_dialog")
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Text(text = "New Savings Goal", style = MaterialTheme.typography.titleLarge)

                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("Goal Title") },
                    placeholder = { Text("e.g. Vacation, New Laptop") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth().testTag("goal_title_input")
                )

                OutlinedTextField(
                    value = targetText,
                    onValueChange = { targetText = it },
                    label = { Text("Target Amount (₹)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth().testTag("goal_target_input")
                )

                OutlinedTextField(
                    value = currentText,
                    onValueChange = { currentText = it },
                    label = { Text("Initial Saved Amount (₹)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.clickable { sipEnabled = !sipEnabled }
                ) {
                    Checkbox(checked = sipEnabled, onCheckedChange = { sipEnabled = it })
                    Text("Enable Monthly Recurring Deposit (SIP)", fontSize = 12.sp)
                }

                if (sipEnabled) {
                    OutlinedTextField(
                        value = sipAmountText,
                        onValueChange = { sipAmountText = it },
                        label = { Text("Monthly SIP Amount (₹)") },
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
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
                            val target = targetText.toDoubleOrNull()
                            if (target == null || target <= 0) {
                                errorMsg = "Please enter a valid target amount"
                                return@Button
                            }
                            if (title.isBlank()) {
                                errorMsg = "Please enter a title"
                                return@Button
                            }

                            val goal = SavingsGoal(
                                id = "goal-${UUID.randomUUID()}",
                                title = title.trim(),
                                target = target,
                                current = currentText.toDoubleOrNull() ?: 0.0,
                                category = category,
                                sipEnabled = sipEnabled,
                                sipAmount = sipAmountText.toDoubleOrNull() ?: 0.0
                            )
                            onSave(goal)
                            onDismiss()
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = AccentOrange),
                        modifier = Modifier.testTag("save_goal_button")
                    ) {
                        Text("Create Goal")
                    }
                }
            }
        }
    }
}
