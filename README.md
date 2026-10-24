# Tally Budget - Android Application

Tally Budget is a native Android application built with **Kotlin** and **Jetpack Compose**, designed for tracking household spending, budgets, bill reminders, and personal savings for families.

## Features

- **Home Overview**:
  - Monthly spending summary with currency formatting in Indian Rupees (₹)
  - Visual Radial Gauge for budget utilization
  - Daily average burn rate tracking
  - Month-over-month comparison (% difference vs previous month)
  - Upcoming bill reminders with quick-pay actions
  - Recent transactions stream

- **Expenses Ledger**:
  - Search transactions and notes in real-time
  - Filter by transaction type (All, Expense, Income)
  - Filter by category and family member
  - Add, edit, and delete transactions
  - Categorization and payment method badges

- **Monthly Budgets**:
  - Dynamic monthly category budget limits with per-month overrides
  - Unused budget rollover toggle
  - Visual progress indicators showing percentage consumed and remaining balance
  - Category management (add custom categories with custom icons and colors)

- **Family Members & Bill Reminders**:
  - Household join & sync code sharing
  - Family member profiles with avatars, roles, allowances, and earner tags
  - Recurring bill reminders (monthly, weekly, yearly) with due dates, assignees, and auto-expense recording on payment

- **Analytics & Cashflow**:
  - Category breakdown distribution and percentages
  - Per-member spending comparison
  - Monthly income vs expense net cashflow summary

- **Personal Savings Tracker**:
  - Personal salary configuration
  - Targeted savings goals (Emergency Fund, Festival Gifts, etc.)
  - Progress tracking with recurring SIP deposit settings
  - Direct deposit and allocation to goals

## Architecture & Technology Stack

- **Platform**: Android (minSdk 26, targetSdk 35)
- **Language**: Kotlin 2.1.0
- **UI Framework**: Jetpack Compose (Material 3)
- **Architecture**: MVVM (Model-View-ViewModel) + Clean Architecture
- **State Management**: Kotlin Coroutines & `StateFlow`
- **Build System**: Gradle Kotlin DSL (`build.gradle.kts`, `settings.gradle.kts`, `libs.versions.toml`)
- **Theme**: Custom Warm Paper Material Design 3 theme with dynamic light/dark mode support
