package com.aistudio.tallybudget.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aistudio.tallybudget.data.model.FamilyMember
import com.aistudio.tallybudget.ui.theme.AccentOrange
import com.aistudio.tallybudget.ui.theme.AccentOrangeTint

@Composable
fun FamilyMemberBar(
    members: List<FamilyMember>,
    activeMemberId: String,
    onSelectMember: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    LazyRow(
        modifier = modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        contentPadding = PaddingValues(horizontal = 16.dp)
    ) {
        items(members, key = { it.id }) { member ->
            val isSelected = member.id == activeMemberId
            val memberColor = try {
                Color(android.graphics.Color.parseColor(member.colorHex))
            } catch (e: Exception) {
                AccentOrange
            }

            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(20.dp))
                    .background(if (isSelected) AccentOrangeTint else MaterialTheme.colorScheme.surface)
                    .border(
                        width = if (isSelected) 1.5.dp else 1.dp,
                        color = if (isSelected) AccentOrange else MaterialTheme.colorScheme.outline,
                        shape = RoundedCornerShape(20.dp)
                    )
                    .clickable { onSelectMember(member.id) }
                    .padding(horizontal = 12.dp, vertical = 6.dp)
                    .testTag("member_chip_${member.id}")
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Text(
                        text = member.avatar,
                        fontSize = 15.sp
                    )
                    Text(
                        text = member.name.split(" ")[0],
                        fontSize = 13.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                        color = if (isSelected) AccentOrange else MaterialTheme.colorScheme.onSurface
                    )
                }
            }
        }
    }
}
