package com.aistudio.tallybudget.ui.screens

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aistudio.tallybudget.data.model.Bill
import com.aistudio.tallybudget.data.model.Category
import com.aistudio.tallybudget.data.model.FamilyMember
import com.aistudio.tallybudget.data.model.FormattingUtils
import com.aistudio.tallybudget.data.model.Household
import com.aistudio.tallybudget.ui.theme.*

@Composable
fun MembersAndBillsScreen(
    household: Household,
    members: List<FamilyMember>,
    bills: List<Bill>,
    categories: List<Category>,
    onOpenAddMember: () -> Unit,
    onEditMember: (FamilyMember) -> Unit,
    onDeleteMember: (String) -> Unit,
    onOpenAddBill: () -> Unit,
    onToggleBillPaid: (String) -> Unit,
    onDeleteBill: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val realMembers = members.filter { it.id != "all" }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
        contentPadding = PaddingValues(bottom = 80.dp, top = 8.dp)
    ) {
        // Household Share Code Banner
        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = AccentOrangeTint),
                border = androidx.compose.foundation.BorderStroke(1.dp, AccentOrange.copy(alpha = 0.4f)),
                modifier = Modifier.fillMaxWidth().testTag("household_code_card")
            ) {
                Row(
                    modifier = Modifier.padding(16.dp).fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "HOUSEHOLD SYNC CODE",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = AccentOrangeStrong,
                            letterSpacing = 0.5.sp
                        )
                        Text(
                            text = household.joinCode,
                            fontSize = 22.sp,
                            fontWeight = FontWeight.Bold,
                            color = AccentOrangeStrong
                        )
                        Text(
                            text = "Share this code to join household",
                            fontSize = 11.sp,
                            color = TextMutedLight
                        )
                    }

                    Button(
                        onClick = {
                            val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                            val clip = ClipData.newPlainText("Household Code", household.joinCode)
                            clipboard.setPrimaryClip(clip)
                            Toast.makeText(context, "Code copied: ${household.joinCode}", Toast.LENGTH_SHORT).show()
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.surface),
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Icon(Icons.Default.ContentCopy, contentDescription = "Copy", tint = AccentOrangeStrong, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Copy", color = AccentOrangeStrong, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                    }
                }
            }
        }

        // Family Members Section
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Family Profiles (${realMembers.size})", style = MaterialTheme.typography.titleMedium)
                TextButton(
                    onClick = onOpenAddMember,
                    colors = ButtonDefaults.textButtonColors(contentColor = AccentOrange),
                    modifier = Modifier.testTag("add_member_button")
                ) {
                    Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Add Member", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                }
            }
        }

        items(realMembers, key = { it.id }) { member ->
            Card(
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
                modifier = Modifier.fillMaxWidth().testTag("member_card_${member.id}")
            ) {
                Row(
                    modifier = Modifier.padding(14.dp).fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Box(
                            contentAlignment = Alignment.Center,
                            modifier = Modifier
                                .size(44.dp)
                                .clip(CircleShape)
                                .background(MaterialTheme.colorScheme.surfaceVariant)
                        ) {
                            Text(text = member.avatar, fontSize = 22.sp)
                        }

                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                Text(
                                    text = member.name,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 14.sp
                                )
                                if (member.isEarner) {
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(6.dp))
                                            .background(PositiveGreenTint)
                                            .padding(horizontal = 6.dp, vertical = 2.dp)
                                    ) {
                                        Text("Earner", fontSize = 10.sp, color = PositiveGreen, fontWeight = FontWeight.Bold)
                                    }
                                }
                            }
                            Text(
                                text = "${member.role}${if (member.allowance > 0) " • Allowance: ${FormattingUtils.formatRupees(member.allowance)}" else ""}",
                                fontSize = 12.sp,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }

                    Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        IconButton(onClick = { onEditMember(member) }, modifier = Modifier.size(28.dp)) {
                            Icon(Icons.Default.Edit, contentDescription = "Edit Member", modifier = Modifier.size(16.dp))
                        }
                        IconButton(onClick = { onDeleteMember(member.id) }, modifier = Modifier.size(28.dp)) {
                            Icon(Icons.Default.Delete, contentDescription = "Delete Member", tint = DangerRed, modifier = Modifier.size(16.dp))
                        }
                    }
                }
            }
        }

        // Bill Reminders Section
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("Bill Reminders & Subscriptions", style = MaterialTheme.typography.titleMedium)
                TextButton(
                    onClick = onOpenAddBill,
                    colors = ButtonDefaults.textButtonColors(contentColor = AccentOrange),
                    modifier = Modifier.testTag("add_bill_button")
                ) {
                    Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Add Bill", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                }
            }
        }

        if (bills.isEmpty()) {
            item {
                Box(
                    modifier = Modifier.fillMaxWidth().padding(16.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text("No recurring bills recorded", color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        } else {
            items(bills, key = { it.id }) { bill ->
                val payer = members.find { it.id == bill.payerId }

                Card(
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    border = androidx.compose.foundation.BorderStroke(1.dp, MaterialTheme.colorScheme.outline),
                    modifier = Modifier.fillMaxWidth().testTag("bill_card_${bill.id}")
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp).fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Checkbox(
                                checked = bill.paid,
                                onCheckedChange = { onToggleBillPaid(bill.id) },
                                colors = CheckboxDefaults.colors(checkedColor = PositiveGreen)
                            )

                            Column {
                                Text(
                                    text = bill.title,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 14.sp,
                                    color = MaterialTheme.colorScheme.onSurface
                                )
                                Text(
                                    text = "Due: ${bill.dueDate} • Payer: ${payer?.name?.split(" ")?.get(0) ?: "Family"}",
                                    fontSize = 11.sp,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Text(
                                    text = "${bill.frequency.replaceFirstChar { it.uppercase() }}",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = AccentOrangeStrong
                                )
                            }
                        }

                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Text(
                                text = FormattingUtils.formatRupees(bill.amount),
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                color = if (bill.paid) PositiveGreen else DangerRed
                            )

                            IconButton(
                                onClick = { onDeleteBill(bill.id) },
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
