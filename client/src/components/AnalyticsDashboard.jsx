import React from 'react';
import { TrendingUp, TrendingDown, PieChart, BarChart3, Calendar, DollarSign } from 'lucide-react';

const AnalyticsDashboard = ({ transactions, stats }) => {
    if (!stats || !transactions) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    const { totalIncome, totalExpense, balance, categoryBreakdown, monthlyBreakdown } = stats;

    // Calculate monthly data for the last 6 months
    const last6Months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        last6Months.push({
                month: monthKey,
            income: monthlyBreakdown[monthKey]?.income || 0,
            expense: monthlyBreakdown[monthKey]?.expense || 0,
            balance: monthlyBreakdown[monthKey]?.balance || 0
        });
    }

    // Get top expense categories
    const topExpenseCategories = Object.entries(categoryBreakdown || {})
        .filter(([category, data]) => data.expense > 0)
        .sort(([, a], [, b]) => b.expense - a.expense)
        .slice(0, 5);

    // Get top income categories
    const topIncomeCategories = Object.entries(categoryBreakdown || {})
        .filter(([category, data]) => data.income > 0)
        .sort(([, a], [, b]) => b.income - a.income)
        .slice(0, 5);

    // Calculate average monthly values
    const avgMonthlyIncome = last6Months.reduce((sum, month) => sum + month.income, 0) / 6;
    const avgMonthlyExpense = last6Months.reduce((sum, month) => sum + month.expense, 0) / 6;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
                    <p className="text-gray-600 mt-1">Detailed insights into your farm financial patterns</p>
                </div>
                <div className="text-right">
                    <p className="text-sm text-gray-500">Last updated</p>
                    <p className="text-sm font-medium text-gray-900">{new Date().toLocaleDateString()}</p>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Average Monthly Income</p>
                            <p className="text-2xl font-bold text-green-600">₹{avgMonthlyIncome.toLocaleString()}</p>
                        </div>
                        <div className="p-2 bg-green-100 rounded-lg">
                            <TrendingUp className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Average Monthly Expense</p>
                            <p className="text-2xl font-bold text-red-600">₹{avgMonthlyExpense.toLocaleString()}</p>
                        </div>
                        <div className="p-2 bg-red-100 rounded-lg">
                            <TrendingDown className="h-6 w-6 text-red-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Savings Rate</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0}%
                            </p>
                        </div>
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <PieChart className="h-6 w-6 text-blue-600" />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                            <p className="text-2xl font-bold text-purple-600">{stats.totalTransactions || 0}</p>
                        </div>
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <BarChart3 className="h-6 w-6 text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Trend */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trend (Last 6 Months)</h3>
                    <div className="space-y-4">
                        {last6Months.map((month, index) => (
                            <div key={index} className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-700">{month.month}</span>
                                    <span className="text-sm text-gray-500">
                                        Balance: ₹{month.balance.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex space-x-2">
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-green-500 h-2 rounded-full" 
                                            style={{ width: `${totalIncome > 0 ? (month.income / Math.max(...last6Months.map(m => m.income))) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                                        <div 
                                            className="bg-red-500 h-2 rounded-full" 
                                            style={{ width: `${totalExpense > 0 ? (month.expense / Math.max(...last6Months.map(m => m.expense))) * 100 : 0}%` }}
                                        ></div>
                                    </div>
                                </div>
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>Income: ₹{month.income.toLocaleString()}</span>
                                    <span>Expense: ₹{month.expense.toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Category Breakdown */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Expense Categories</h3>
                    <div className="space-y-4">
                        {topExpenseCategories.length > 0 ? (
                            topExpenseCategories.map(([category, data], index) => {
                                const percentage = (data.expense / totalExpense) * 100;
                                return (
                                    <div key={category} className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-700">{category}</span>
                                            <span className="text-sm font-semibold text-gray-900">₹{data.expense.toLocaleString()}</span>
                                        </div>
                                        <div className="bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="bg-red-500 h-2 rounded-full" 
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {percentage.toFixed(1)}% of total expenses
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-gray-500 text-center py-4">No expense data available</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Income vs Expense Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Income Categories */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Income Sources</h3>
                    <div className="space-y-3">
                        {topIncomeCategories.length > 0 ? (
                            topIncomeCategories.map(([category, data], index) => {
                                const percentage = (data.income / totalIncome) * 100;
                                return (
                                    <div key={category} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                                <span className="text-sm font-medium text-green-600">{index + 1}</span>
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{category}</p>
                                                <p className="text-xs text-gray-500">{percentage.toFixed(1)}% of income</p>
                                            </div>
                                        </div>
                                        <p className="text-sm font-semibold text-green-600">₹{data.income.toLocaleString()}</p>
                                    </div>
                                );
                            })
                        ) : (
                            <p className="text-gray-500 text-center py-4">No income data available</p>
                        )}
                    </div>
                </div>

                {/* Financial Health */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Farm Financial Health</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <DollarSign className="h-6 w-6 text-green-600" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Current Balance</p>
                                    <p className={`text-lg font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        ₹{balance.toLocaleString()}
                        </p>
                    </div>
                            </div>
                    </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <Calendar className="h-6 w-6 text-blue-600" />
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Monthly Average</p>
                                    <p className="text-lg font-bold text-blue-600">
                                        ₹{(avgMonthlyIncome - avgMonthlyExpense).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-blue-800 mb-2">💡 Insights</h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                                <li>• {balance >= 0 ? 'You are saving money!' : 'Consider reducing expenses'}</li>
                                <li>• {avgMonthlyIncome > avgMonthlyExpense ? 'Monthly income exceeds expenses' : 'Monthly expenses exceed income'}</li>
                                <li>• {totalIncome > 0 ? `Savings rate: ${((balance / totalIncome) * 100).toFixed(1)}%` : 'No income data available'}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;