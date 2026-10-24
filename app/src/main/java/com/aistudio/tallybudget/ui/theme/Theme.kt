package com.aistudio.tallybudget.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val LightColorScheme = lightColorScheme(
    primary = AccentOrange,
    onPrimary = BgCardLight,
    primaryContainer = AccentOrangeTint,
    onPrimaryContainer = AccentOrangeStrong,
    secondary = InfoBlue,
    onSecondary = BgCardLight,
    background = BgPageLight,
    onBackground = TextMainLight,
    surface = BgCardLight,
    onSurface = TextMainLight,
    surfaceVariant = BgPageLight,
    onSurfaceVariant = TextMutedLight,
    outline = BgCardBorderLight
)

private val DarkColorScheme = darkColorScheme(
    primary = AccentOrangeDark,
    onPrimary = BgPageDark,
    primaryContainer = AccentOrangeTintDark,
    onPrimaryContainer = AccentOrangeDark,
    secondary = InfoBlue,
    onSecondary = BgPageDark,
    background = BgPageDark,
    onBackground = TextMainDark,
    surface = BgCardDark,
    onSurface = TextMainDark,
    surfaceVariant = BgCardDark,
    onSurfaceVariant = TextMutedDark,
    outline = BgCardBorderDark
)

@Composable
fun TallyBudgetTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme
    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.background.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = !darkTheme
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
