package com.aistudio.tallybudget.ui.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.*
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aistudio.tallybudget.ui.theme.AccentOrange
import com.aistudio.tallybudget.ui.theme.DangerRed
import com.aistudio.tallybudget.ui.theme.PositiveGreen
import com.aistudio.tallybudget.ui.theme.TrackLight

@Composable
fun RadialGauge(
    percentage: Int,
    size: Dp = 100.dp,
    strokeWidth: Dp = 10.dp,
    modifier: Modifier = Modifier
) {
    val progress = (percentage / 100f).coerceIn(0f, 1f)
    val animatedProgress by animateFloatAsState(
        targetValue = progress,
        animationSpec = tween(durationMillis = 800),
        label = "radial_gauge_anim"
    )

    val gaugeColor = when {
        percentage >= 90 -> DangerRed
        percentage >= 75 -> AccentOrange
        else -> PositiveGreen
    }

    Box(
        contentAlignment = Alignment.Center,
        modifier = modifier.size(size)
    ) {
        Canvas(modifier = Modifier.fillMaxSize().padding(strokeWidth / 2)) {
            val stroke = Stroke(width = strokeWidth.toPx(), cap = StrokeCap.Round)
            // Background track circle
            drawArc(
                color = TrackLight,
                startAngle = 140f,
                sweepAngle = 260f,
                useCenter = false,
                style = stroke
            )
            // Progress arc
            drawArc(
                color = gaugeColor,
                startAngle = 140f,
                sweepAngle = 260f * animatedProgress,
                useCenter = false,
                style = stroke
            )
        }

        Column(
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "$percentage%",
                fontWeight = FontWeight.Bold,
                fontSize = 16.sp,
                color = MaterialTheme.colorScheme.onSurface
            )
            Text(
                text = "Used",
                fontSize = 10.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}
