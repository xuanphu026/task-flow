import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Users,
  BookOpen,
  Package,
  Target,
  BookMarked,
  DollarSign,
  TrendingUp,
  Building,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { PayrollTab } from './accounting/PayrollTab';
import { CashbookAndPnLTab } from './accounting/CashbookAndPnLTab';
import { FixedAssetsTab } from './accounting/FixedAssetsTab';
import { TaxAndBreakEvenTab } from './accounting/TaxAndBreakEvenTab';
import { ChartOfAccountsTab } from './accounting/ChartOfAccountsTab';
import {
  INITIAL_EMPLOYEES,
  INITIAL_TRANSACTIONS,
  INITIAL_FIXED_ASSETS,
} from '../data/initialAccountingData';
import { PayrollEmployee, AccountingTransaction, FixedAsset } from '../types';

type AccountingSubTab = 'payroll' | 'cashbook' | 'fixed_assets' | 'tax_breakeven' | 'chart_of_accounts';

export const AccountingView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AccountingSubTab>('payroll');

  // Persistence with localStorage
  const [employees, setEmployees] = useState<PayrollEmployee[]>(() => {
    const saved = localStorage.getItem('taskflow_payroll_employees');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_EMPLOYEES;
  });

  const [transactions, setTransactions] = useState<AccountingTransaction[]>(() => {
    const saved = localStorage.getItem('taskflow_accounting_transactions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_TRANSACTIONS;
  });

  const [assets, setAssets] = useState<FixedAsset[]>(() => {
    const saved = localStorage.getItem('taskflow_accounting_fixed_assets');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_FIXED_ASSETS;
  });

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('taskflow_payroll_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('taskflow_accounting_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('taskflow_accounting_fixed_assets', JSON.stringify(assets));
  }, [assets]);

  // Employee handlers
  const handleAddEmployee = (newEmp: PayrollEmployee) => {
    setEmployees((prev) => [newEmp, ...prev]);
  };

  const handleUpdateEmployee = (updatedEmp: PayrollEmployee) => {
    setEmployees((prev) => prev.map((e) => (e.id === updatedEmp.id ? updatedEmp : e)));
  };

  const handleDeleteEmployee = (id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
  };

  // Transaction handlers
  const handleAddTransaction = (newTx: AccountingTransaction) => {
    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  // Fixed Asset handlers
  const handleAddAsset = (newAsset: FixedAsset) => {
    setAssets((prev) => [newAsset, ...prev]);
  };

  const handleDeleteAsset = (id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
  };

  const tabsConfig = [
    {
      id: 'payroll' as AccountingSubTab,
      label: 'Tính Lương & Thuế TNCN',
      icon: Users,
      badge: `${employees.length} NV`,
    },
    {
      id: 'cashbook' as AccountingSubTab,
      label: 'Sổ Quỹ & Báo Cáo P&L',
      icon: BookOpen,
      badge: `${transactions.length} CT`,
    },
    {
      id: 'fixed_assets' as AccountingSubTab,
      label: 'Khấu Hao TSCĐ (TT 45)',
      icon: Package,
      badge: `${assets.length} TS`,
    },
    {
      id: 'tax_breakeven' as AccountingSubTab,
      label: 'Thuế GTGT & Điểm Hòa Vốn',
      icon: Target,
      badge: 'Nâng cao',
    },
    {
      id: 'chart_of_accounts' as AccountingSubTab,
      label: 'Hệ Thống TK (TT 200)',
      icon: BookMarked,
      badge: 'Tra cứu',
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Kế Toán & Tính Lương Doanh Nghiệp
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-2xs font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Phân hệ quản trị tài chính, tính lương Gross/Net, hạch toán sổ quỹ, khấu hao TSCĐ và kê khai thuế
            </p>
          </div>
        </div>

        {/* Sub-tab switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 self-start md:self-auto">
          {tabsConfig.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                <span
                  className={`text-2xs px-1.5 py-0.2 rounded-full font-medium ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-300'
                      : 'bg-slate-200/80 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="transition-all duration-300">
        {activeTab === 'payroll' && (
          <PayrollTab
            employees={employees}
            onAddEmployee={handleAddEmployee}
            onUpdateEmployee={handleUpdateEmployee}
            onDeleteEmployee={handleDeleteEmployee}
          />
        )}

        {activeTab === 'cashbook' && (
          <CashbookAndPnLTab
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {activeTab === 'fixed_assets' && (
          <FixedAssetsTab
            assets={assets}
            onAddAsset={handleAddAsset}
            onDeleteAsset={handleDeleteAsset}
          />
        )}

        {activeTab === 'tax_breakeven' && <TaxAndBreakEvenTab />}

        {activeTab === 'chart_of_accounts' && <ChartOfAccountsTab />}
      </div>
    </div>
  );
};
