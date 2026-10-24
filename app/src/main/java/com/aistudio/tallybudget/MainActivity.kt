package com.aistudio.tallybudget

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.aistudio.tallybudget.data.model.NavigationTab
import com.aistudio.tallybudget.ui.components.*
import com.aistudio.tallybudget.ui.screens.*
import com.aistudio.tallybudget.ui.theme.*
import com.aistudio.tallybudget.ui.viewmodel.TallyViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            TallyBudgetTheme {
                TallyBudgetApp()
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TallyBudgetApp(viewModel: TallyViewModel = viewModel()) {
    val activeTab by viewModel.activeTab.collectAsState()
    val activeMemberId by viewModel.activeMemberId.collectAsState()
    val selectedMonth by viewModel.selectedMonth.collectAsState()
    val household by viewModel.household.collectAsState()
    val categories by viewModel.categories.collectAsState()
    val members by viewModel.members.collectAsState()
    val transactions by viewModel.transactions.collectAsState()
    val filteredTransactions by viewModel.filteredTransactions.collectAsState()
    val bills by viewModel.bills.collectAsState()
    val personalState by viewModel.personalState.collectAsState()
    val homeSummary by viewModel.homeSummary.collectAsState()

    val showAddExpenseDialog by viewModel.showAddExpenseDialog.collectAsState()
    val editingTx by viewModel.editingTransaction.collectAsState()
    val showAddBillDialog by viewModel.showAddBillDialog.collectAsState()
    val showAddMemberDialog by viewModel.showAddMemberDialog.collectAsState()
    val showAddCategoryDialog by viewModel.showAddCategoryDialog.collectAsState()
    val showAddGoalDialog by viewModel.showAddGoalDialog.collectAsState()

    // Handle back button to return to HOME screen if in other tabs
    BackHandler(enabled = activeTab != NavigationTab.HOME) {
        viewModel.setActiveTab(NavigationTab.HOME)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = "Tally",
                            fontWeight = FontWeight.ExtraBold,
                            fontSize = 20.sp,
                            color = AccentOrangeStrong
                        )
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(6.dp))
                                .background(AccentOrangeTint)
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = household.name,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = AccentOrangeStrong
                            )
                        }
                    }
                },
                actions = {
                    // Personal savings tracker shortcut button
                    IconButton(
                        onClick = {
                            if (activeTab == NavigationTab.PERSONAL_SAVINGS) {
                                viewModel.setActiveTab(NavigationTab.HOME)
                            } else {
                                viewModel.setActiveTab(NavigationTab.PERSONAL_SAVINGS)
                            }
                        },
                        modifier = Modifier.testTag("top_bar_personal_btn")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Savings,
                            contentDescription = "Personal Savings",
                            tint = if (activeTab == NavigationTab.PERSONAL_SAVINGS) AccentOrange else MaterialTheme.colorScheme.onSurface
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.background
                )
            )
        },
        bottomBar = {
            NavigationBar(
                containerColor = MaterialTheme.colorScheme.surface,
                tonalElevation = 8.dp,
                modifier = Modifier.testTag("bottom_nav_bar")
            ) {
                NavigationBarItem(
                    selected = activeTab == NavigationTab.HOME,
                    onClick = { viewModel.setActiveTab(NavigationTab.HOME) },
                    icon = { Icon(Icons.Default.Home, contentDescription = "Home") },
                    label = { Text("Home", fontSize = 10.sp) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = AccentOrange,
                        selectedTextColor = AccentOrange,
                        indicatorColor = AccentOrangeTint
                    ),
                    modifier = Modifier.testTag("nav_item_home")
                )
                NavigationBarItem(
                    selected = activeTab == NavigationTab.EXPENSES,
                    onClick = { viewModel.setActiveTab(NavigationTab.EXPENSES) },
                    icon = { Icon(Icons.Default.Receipt, contentDescription = "Expenses") },
                    label = { Text("Expenses", fontSize = 10.sp) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = AccentOrange,
                        selectedTextColor = AccentOrange,
                        indicatorColor = AccentOrangeTint
                    ),
                    modifier = Modifier.testTag("nav_item_expenses")
                )
                NavigationBarItem(
                    selected = activeTab == NavigationTab.BUDGETS,
                    onClick = { viewModel.setActiveTab(NavigationTab.BUDGETS) },
                    icon = { Icon(Icons.Default.PieChart, contentDescription = "Budgets") },
                    label = { Text("Budgets", fontSize = 10.sp) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = AccentOrange,
                        selectedTextColor = AccentOrange,
                        indicatorColor = AccentOrangeTint
                    ),
                    modifier = Modifier.testTag("nav_item_budgets")
                )
                NavigationBarItem(
                    selected = activeTab == NavigationTab.ANALYTICS,
                    onClick = { viewModel.setActiveTab(NavigationTab.ANALYTICS) },
                    icon = { Icon(Icons.Default.BarChart, contentDescription = "Analytics") },
                    label = { Text("Analytics", fontSize = 10.sp) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = AccentOrange,
                        selectedTextColor = AccentOrange,
                        indicatorColor = AccentOrangeTint
                    ),
                    modifier = Modifier.testTag("nav_item_analytics")
                )
                NavigationBarItem(
                    selected = activeTab == NavigationTab.MEMBERS_AND_BILLS,
                    onClick = { viewModel.setActiveTab(NavigationTab.MEMBERS_AND_BILLS) },
                    icon = { Icon(Icons.Default.Group, contentDescription = "Family & Bills") },
                    label = { Text("Family & Bills", fontSize = 10.sp) },
                    colors = NavigationBarItemDefaults.colors(
                        selectedIconColor = AccentOrange,
                        selectedTextColor = AccentOrange,
                        indicatorColor = AccentOrangeTint
                    ),
                    modifier = Modifier.testTag("nav_item_members")
                )
            }
        },
        containerColor = MaterialTheme.colorScheme.background
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            // Family member filter bar visible in Home, Expenses, Budgets
            if (activeTab != NavigationTab.PERSONAL_SAVINGS && activeTab != NavigationTab.MEMBERS_AND_BILLS) {
                FamilyMemberBar(
                    members = members,
                    activeMemberId = activeMemberId,
                    onSelectMember = { viewModel.setActiveMemberId(it) }
                )
            }

            // Tab Views
            when (activeTab) {
                NavigationTab.HOME -> {
                    HomeScreen(
                        summary = homeSummary,
                        categories = categories,
                        members = members,
                        activeMemberId = activeMemberId,
                        selectedMonth = selectedMonth,
                        onNavigateToExpenses = { viewModel.setActiveTab(NavigationTab.EXPENSES) },
                        onNavigateToBills = { viewModel.setActiveTab(NavigationTab.MEMBERS_AND_BILLS) },
                        onOpenAddExpense = { viewModel.showAddExpenseDialog.value = true },
                        onToggleBillPaid = { viewModel.toggleBillPaid(it) }
                    )
                }
                NavigationTab.EXPENSES -> {
                    ExpensesScreen(
                        transactions = filteredTransactions,
                        categories = categories,
                        members = members,
                        activeMemberId = activeMemberId,
                        selectedMonth = selectedMonth,
                        onOpenAddTx = { viewModel.showAddExpenseDialog.value = true },
                        onEditTx = {
                            viewModel.editingTransaction.value = it
                            viewModel.showAddExpenseDialog.value = true
                        },
                        onDeleteTx = { viewModel.deleteTransaction(it) }
                    )
                }
                NavigationTab.BUDGETS -> {
                    BudgetsScreen(
                        categories = categories,
                        transactions = transactions,
                        selectedMonth = selectedMonth,
                        enableRollover = household.enableRollover,
                        onSetEnableRollover = { viewModel.setEnableRollover(it) },
                        onOpenAddCategory = { viewModel.showAddCategoryDialog.value = true },
                        onUpdateCategoryLimit = { catId, limit -> viewModel.updateCategoryLimit(catId, limit) },
                        onDeleteCategory = { viewModel.deleteCategory(it) }
                    )
                }
                NavigationTab.ANALYTICS -> {
                    AnalyticsScreen(
                        transactions = transactions,
                        categories = categories,
                        members = members,
                        selectedMonth = selectedMonth
                    )
                }
                NavigationTab.MEMBERS_AND_BILLS -> {
                    MembersAndBillsScreen(
                        household = household,
                        members = members,
                        bills = bills,
                        categories = categories,
                        onOpenAddMember = { viewModel.showAddMemberDialog.value = true },
                        onEditMember = { /* Edit member */ },
                        onDeleteMember = { viewModel.deleteMember(it) },
                        onOpenAddBill = { viewModel.showAddBillDialog.value = true },
                        onToggleBillPaid = { viewModel.toggleBillPaid(it) },
                        onDeleteBill = { viewModel.deleteBill(it) }
                    )
                }
                NavigationTab.PERSONAL_SAVINGS -> {
                    PersonalSavingsScreen(
                        personalState = personalState,
                        onUpdateSalary = { viewModel.updateSalary(it) },
                        onOpenAddGoal = { viewModel.showAddGoalDialog.value = true },
                        onDepositToGoal = { id, amount -> viewModel.depositToGoal(id, amount) },
                        onDeleteGoal = { viewModel.deleteGoal(it) }
                    )
                }
            }
        }
    }

    // Modal Dialogs
    if (showAddExpenseDialog || editingTx != null) {
        AddExpenseDialog(
            categories = categories,
            members = members,
            editingTx = editingTx,
            onDismiss = {
                viewModel.showAddExpenseDialog.value = false
                viewModel.editingTransaction.value = null
            },
            onSave = {
                if (editingTx != null) {
                    viewModel.updateTransaction(it)
                } else {
                    viewModel.addTransaction(it)
                }
                viewModel.showAddExpenseDialog.value = false
                viewModel.editingTransaction.value = null
            }
        )
    }

    if (showAddBillDialog) {
        AddBillDialog(
            members = members,
            categories = categories,
            onDismiss = { viewModel.showAddBillDialog.value = false },
            onSave = {
                viewModel.addBill(it)
                viewModel.showAddBillDialog.value = false
            }
        )
    }

    if (showAddMemberDialog) {
        AddMemberDialog(
            onDismiss = { viewModel.showAddMemberDialog.value = false },
            onSave = {
                viewModel.addMember(it)
                viewModel.showAddMemberDialog.value = false
            }
        )
    }

    if (showAddCategoryDialog) {
        AddCategoryDialog(
            onDismiss = { viewModel.showAddCategoryDialog.value = false },
            onSave = {
                viewModel.addCategory(it)
                viewModel.showAddCategoryDialog.value = false
            }
        )
    }

    if (showAddGoalDialog) {
        AddGoalDialog(
            onDismiss = { viewModel.showAddGoalDialog.value = false },
            onSave = {
                viewModel.addGoal(it)
                viewModel.showAddGoalDialog.value = false
            }
        )
    }
}
