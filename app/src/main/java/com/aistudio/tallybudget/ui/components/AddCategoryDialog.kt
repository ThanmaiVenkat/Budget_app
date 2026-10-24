package com.aistudio.tallybudget.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.aistudio.tallybudget.data.model.Category
import com.aistudio.tallybudget.data.model.FormattingUtils
import com.aistudio.tallybudget.ui.theme.AccentOrange
import java.util.UUID

@Composable
fun AddCategoryDialog(
    onDismiss: () -> Unit,
    onSave: (Category) -> Unit
) {
    var name by remember { mutableStateOf("") }
    var icon by remember { mutableStateOf("🏷️") }
    var limitText by remember { mutableStateOf("") }
    var selectedColor by remember { mutableStateOf(FormattingUtils.CATEGORY_COLORS.first()) }
    var errorMsg by remember { mutableStateOf<String?>(null) }

    val iconOptions = listOf("🛒", "🏠", "⚡", "🍽️", "🎮", "🏥", "📚", "🚗", "🛍️", "✈️", "☕", "👶")

    Dialog(onDismissRequest = onDismiss) {
        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            elevation = CardDefaults.cardElevation(defaultElevation = 8.dp),
            modifier = Modifier.fillMaxWidth().padding(8.dp).testTag("add_category_dialog")
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Text(text = "New Budget Category", style = MaterialTheme.typography.titleLarge)

                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Category Name") },
                    placeholder = { Text("e.g. Travel, Coffee, Pets") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth().testTag("category_name_input")
                )

                OutlinedTextField(
                    value = limitText,
                    onValueChange = { limitText = it },
                    label = { Text("Monthly Budget Limit (₹)") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth().testTag("category_limit_input")
                )

                Text("Pick Icon", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    iconOptions.take(6).forEach { emoji ->
                        val isSelected = icon == emoji
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (isSelected) AccentOrange.copy(alpha = 0.2f) else MaterialTheme.colorScheme.surfaceVariant)
                                .clickable { icon = emoji }
                                .padding(8.dp)
                        ) {
                            Text(text = emoji, fontSize = 18.sp)
                        }
                    }
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
                                errorMsg = "Please enter a category name"
                                return@Button
                            }
                            val limit = limitText.toDoubleOrNull() ?: 0.0
                            val cat = Category(
                                id = "cat-${UUID.randomUUID()}",
                                name = name.trim(),
                                icon = icon,
                                limit = limit,
                                colorHex = selectedColor
                            )
                            onSave(cat)
                            onDismiss()
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = AccentOrange),
                        modifier = Modifier.testTag("save_category_button")
                    ) {
                        Text("Add Category")
                    }
                }
            }
        }
    }
}
