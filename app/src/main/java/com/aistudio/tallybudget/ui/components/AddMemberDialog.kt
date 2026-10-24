package com.aistudio.tallybudget.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
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
import com.aistudio.tallybudget.data.model.FamilyMember
import com.aistudio.tallybudget.data.model.FormattingUtils
import com.aistudio.tallybudget.ui.theme.AccentOrange

@Composable
fun AddMemberDialog(
    editingMember: FamilyMember? = null,
    onDismiss: () -> Unit,
    onSave: (FamilyMember) -> Unit
) {
    var name by remember { mutableStateOf(editingMember?.name ?: "") }
    var selectedAvatar by remember { mutableStateOf(editingMember?.avatar ?: "👦") }
    var role by remember { mutableStateOf(editingMember?.role ?: "Family Member") }
    var allowanceText by remember { mutableStateOf(editingMember?.allowance?.let { if (it > 0) it.toString() else "" } ?: "") }
    var isEarner by remember { mutableStateOf(editingMember?.isEarner ?: false) }
    var errorMsg by remember { mutableStateOf<String?>(null) }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            elevation = CardDefaults.cardElevation(defaultElevation = 8.dp),
            modifier = Modifier.fillMaxWidth().padding(8.dp).testTag("add_member_dialog")
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Text(
                    text = if (editingMember != null) "Edit Member Profile" else "Add Family Member",
                    style = MaterialTheme.typography.titleLarge
                )

                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Member Name") },
                    placeholder = { Text("e.g. Grandma, Rohan") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth().testTag("member_name_input")
                )

                // Avatar picker
                Text("Select Avatar", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    FormattingUtils.MEMBER_AVATARS.take(6).forEach { (avatar, _) ->
                        val isSelected = selectedAvatar == avatar
                        Box(
                            contentAlignment = Alignment.Center,
                            modifier = Modifier
                                .size(40.dp)
                                .clip(RoundedCornerShape(10.dp))
                                .background(if (isSelected) AccentOrange.copy(alpha = 0.2f) else MaterialTheme.colorScheme.surfaceVariant)
                                .clickable { selectedAvatar = avatar }
                        ) {
                            Text(text = avatar, fontSize = 20.sp)
                        }
                    }
                }

                OutlinedTextField(
                    value = role,
                    onValueChange = { role = it },
                    label = { Text("Household Role") },
                    placeholder = { Text("e.g. Mother, Son, Grandparent") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = allowanceText,
                    onValueChange = { allowanceText = it },
                    label = { Text("Monthly Allowance (₹, optional)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.clickable { isEarner = !isEarner }
                ) {
                    Checkbox(
                        checked = isEarner,
                        onCheckedChange = { isEarner = it }
                    )
                    Text("Primary Income Earner", fontSize = 13.sp)
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
                            if (name.isBlank()) {
                                errorMsg = "Please enter a name"
                                return@Button
                            }
                            val member = FamilyMember(
                                id = editingMember?.id ?: name.lowercase().replace(" ", "-"),
                                name = name.trim(),
                                avatar = selectedAvatar,
                                colorHex = editingMember?.colorHex ?: FormattingUtils.CATEGORY_COLORS.random(),
                                role = role.trim(),
                                allowance = allowanceText.toDoubleOrNull() ?: 0.0,
                                isEarner = isEarner
                            )
                            onSave(member)
                            onDismiss()
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = AccentOrange),
                        modifier = Modifier.testTag("save_member_button")
                    ) {
                        Text(if (editingMember != null) "Update" else "Save Member")
                    }
                }
            }
        }
    }
}
