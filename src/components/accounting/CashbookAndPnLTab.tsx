import React, { useState } from 'react';
import {
  BookOpen,
  TrendingUp,
  TrendingDown,
  Plus,
  Trash2,
  FileCheck,
  CreditCard,
  Building,
  DollarSign,
  PieChart,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Layers,
  Filter,
} from 'lucide-react';
import { AccountingTransaction, TransactionCategory, TransactionType } from '../../types';
import { formatVND, STATUTORY_CONSTANTS } from '../../utils/accountingCalculations';

interface CashbookAndPnLTabProps {
  transactions: AccountingTransaction[];
  onAddTransaction: (tx: AccountingTransaction) => void;
  onDeleteTransaction: (id: string) => void;
}

export const CashbookAndPnLTab: React.FC<CashbookAndPnLTabProps> = ({
  transactions,
  onAddTransaction,
  onDeleteTransaction,
}) => {
  const [activeSubView, setActiveSubView] = useState<'cashbook' | 'pnl'>('cashbook');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [isNewTxModalOpen, setIsNewTxModalOpen] = useState(false);

  // New Transaction Form state
  const [formVoucherCode, setFormVoucherCode] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formType, setFormType] = useState<TransactionType>('income');
  const [formCategory, setFormCategory] = useState<TransactionCategory>('sales_revenue');
  const [formAmount, setFormAmount] = useState<number>(10000000);
  const [formDescription, setFormDescription] = useState('');
  const [formPayerOrReceiver, setFormPayerOrReceiver] = useState('');
  const [formPaymentMethod, setFormPaymentMethod] = useState<'cash' | 'bank'>('bank');
  const [formVatRate, setFormVatRate] = useState<number>(10);
  const [formAccountDebit, setFormAccountDebit] = useState('1121');
  const [formAccountCredit, setFormAccountCredit] = useState('5113');
  const [formNotes, setFormNotes] = useState('');

  const handleOpenAddModal = (type: TransactionType) => {
    setFormType(type);
    setFormVoucherCode(type === 'income' ? `PT-${new Date().getFullYear()}-${String(transactions.length + 1).padStart(3, '0')}` : `PC-${new Date().getFullYear()}-${String(transactions.length + 1).padStart(3, '0')}`);
    setFormCategory(type === 'income' ? 'sales_revenue' : 'admin_expense');
    setFormAmount(10000000);
    setFormDescription('');
    setFormPayerOrReceiver('');
    setFormPaymentMethod('bank');
    setFormVatRate(10);
    setFormAccountDebit(type === 'income' ? '1121' : '642');
    setFormAccountCredit(type === 'income' ? '511' : '1121');
    setFormNotes('');
    setIsNewTxModalOpen(true);
  };

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formAmount || formAmount <= 0) return;

    const vatAmount = formVatRate > 0 ? Math.round((formAmount * formVatRate) / 100) : 0;

    const newTx: AccountingTransaction = {
      id: `tx-${Date.now()}`,
      voucherCode: formVoucherCode.trim() || `CT-${Date.now().toString().slice(-4)}`,
      date: formDate,
      type: formType,
      category: formCategory,
      amount: Number(formAmount),
      description: formDescription.trim() || 'Giao dịch phát sinh',
      payerOrReceiver: formPayerOrReceiver.trim() || 'Đối tác / Khách hàng',
      paymentMethod: formPaymentMethod,
      taxVatRate: formVatRate,
      vatAmount,
      accountDebit: formAccountDebit,
      accountCredit: formAccountCredit,
      notes: formNotes,
    };

    onAddTransaction(newTx);
    setIsNewTxModalOpen(false);
  };

  // Filtered transactions for the cashbook
  const filteredTransactions = transactions.filter((t) => {
    if (typeFilter === 'all') return true;
    return t.type === typeFilter;
  });

  // Calculate Cashbook Running Balances
  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netCashFlow = totalIncome - totalExpense;

  const totalBankBalance = transactions.reduce((sum, t) => {
    if (t.paymentMethod === 'bank') {
      return t.type === 'income' ? sum + t.amount : sum - t.amount;
    }
    return sum;
  }, 150000000); // Giả định số dư đầu kỳ ngân hàng là 150tr

  const totalCashFundBalance = transactions.reduce((sum, t) => {
    if (t.paymentMethod === 'cash') {
      return t.type === 'income' ? sum + t.amount : sum - t.amount;
    }
    return sum;
  }, 25000000); // Giả định số dư đầu kỳ quỹ tiền mặt là 25tr

  // Calculate P&L (Báo cáo Kết quả Kinh doanh Chuẩn Thông tư 200)
  const pnlSalesRevenue = transactions
    .filter((t) => t.category === 'sales_revenue')
    .reduce((sum, t) => sum + t.amount, 0);

  const pnlFinancialIncome = transactions
    .filter((t) => t.category === 'financial_income')
    .reduce((sum, t) => sum + t.amount, 0);

  const pnlOtherIncome = transactions
    .filter((t) => t.category === 'other_income')
    .reduce((sum, t) => sum + t.amount, 0);

  const pnlCogs = transactions
    .filter((t) => t.category === 'cogs')
    .reduce((sum, t) => sum + t.amount, 0);

  const pnlSellingExpense = transactions
    .filter((t) => t.category === 'selling_expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const pnlAdminExpense = transactions
    .filter((t) => t.category === 'admin_expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const pnlPayrollExpense = transactions
    .filter((t) => t.category === 'payroll_expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const pnlFinancialExpense = transactions
    .filter((t) => t.category === 'financial_expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const pnlOtherExpense = transactions
    .filter((t) => t.category === 'other_expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Derived P&L Line Items:
  const grossProfit = pnlSalesRevenue - pnlCogs;
  const grossMarginPct = pnlSalesRevenue > 0 ? (grossProfit / pnlSalesRevenue) * 100 : 0;
  
  const operatingProfitEBIT =
    grossProfit + pnlFinancialIncome - pnlFinancialExpense - pnlSellingExpense - pnlAdminExpense - pnlPayrollExpense;
  
  const otherProfit = pnlOtherIncome - pnlOtherExpense;
  const earningsBeforeTaxEBT = operatingProfitEBIT + otherProfit;
  
  const corporateIncomeTax = earningsBeforeTaxEBT > 0 ? Math.round(earningsBeforeTaxEBT * STATUTORY_CONSTANTS.STANDARD_CIT_RATE) : 0;
  const netProfitAfterTaxNPAT = earningsBeforeTaxEBT - corporateIncomeTax;
  const netProfitMarginPct = pnlSalesRevenue > 0 ? (netProfitAfterTaxNPAT / pnlSalesRevenue) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* View Switcher Sub-header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 bg-slate-100 dark:bg-slate-800/70 rounded-2xl border border-slate-200/80 dark:border-slate-700">
        <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 rounded-xl shadow-xs">
          <button
            onClick={() => setActiveSubView('cashbook')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeSubView === 'cashbook'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Sổ Quỹ Tiền Mặt & Ngân Hàng
          </button>
          <button
            onClick={() => setActiveSubView('pnl')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeSubView === 'pnl'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <PieChart className="w-4 h-4" />
            Báo Cáo Kết Quả Kinh Doanh (P&L)
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 px-2">
          <button
            onClick={() => handleOpenAddModal('income')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Tạo Phiếu Thu
          </button>
          <button
            onClick={() => handleOpenAddModal('expense')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Tạo Phiếu Chi
          </button>
        </div>
      </div>

      {/* SUB-VIEW 1: CASHBOOK */}
      {activeSubView === 'cashbook' && (
        <div className="space-y-6">
          {/* Quick Balance Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Số dư Quỹ Tiền Mặt (TK 111)
              </span>
              <div className="text-xl font-black text-slate-900 dark:text-white">
                {formatVND(totalCashFundBalance)}
              </div>
              <p className="text-2xs text-slate-400 mt-1">Tiền mặt tại quỹ văn phòng</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Số dư Tiền Gửi Ngân Hàng (TK 112)
              </span>
              <div className="text-xl font-black text-blue-600 dark:text-blue-400">
                {formatVND(totalBankBalance)}
              </div>
              <p className="text-2xs text-slate-400 mt-1">Tài khoản Vietcombank & Techcombank</p>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Dòng Tiền Thuần (Net Cash Flow)
              </span>
              <div
                className={`text-xl font-black ${
                  netCashFlow >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {netCashFlow >= 0 ? `+${formatVND(netCashFlow)}` : formatVND(netCashFlow)}
              </div>
              <p className="text-2xs text-slate-400 mt-1">
                Thu: {formatVND(totalIncome)} • Chi: {formatVND(totalExpense)}
              </p>
            </div>
          </div>

          {/* Cashbook Transaction Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                Nhật Ký Chứng Từ Thu - Chi Phát Sinh ({filteredTransactions.length})
              </h4>

              {/* Filter by income/expense */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
                <button
                  onClick={() => setTypeFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    typeFilter === 'all'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  Tất cả
                </button>
                <button
                  onClick={() => setTypeFilter('income')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    typeFilter === 'income'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  Phiếu Thu (+)
                </button>
                <button
                  onClick={() => setTypeFilter('expense')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                    typeFilter === 'expense'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  Phiếu Chi (-)
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-2xs border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-3">Ngày / Số CT</th>
                    <th className="py-3 px-3">Diễn giải nội dung</th>
                    <th className="py-3 px-3">Đối tượng nộp / nhận</th>
                    <th className="py-3 px-3">Hình thức</th>
                    <th className="py-3 px-3 text-right">Số tiền thu</th>
                    <th className="py-3 px-3 text-right">Số tiền chi</th>
                    <th className="py-3 px-3 text-center">Định khoản</th>
                    <th className="py-3 px-3 text-center">Xóa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {filteredTransactions.map((t) => (
                    <tr
                      key={t.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition-colors"
                    >
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{t.voucherCode}</div>
                        <div className="text-2xs text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {t.date}
                        </div>
                      </td>
                      <td className="py-3 px-3 max-w-xs">
                        <div className="font-semibold text-slate-900 dark:text-white line-clamp-1">{t.description}</div>
                        {t.notes && <div className="text-2xs text-slate-400 italic">{t.notes}</div>}
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                        {t.payerOrReceiver}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-2xs font-semibold ${
                            t.paymentMethod === 'bank'
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                              : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                          }`}
                        >
                          {t.paymentMethod === 'bank' ? 'Ngân hàng (112)' : 'Tiền mặt (111)'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        {t.type === 'income' ? `+${formatVND(t.amount)}` : '—'}
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                        {t.type === 'expense' ? `-${formatVND(t.amount)}` : '—'}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className="text-2xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          N{t.accountDebit || '112'} / C{t.accountCredit || '511'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => onDeleteTransaction(t.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Xóa chứng từ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: PROFIT & LOSS STATEMENT (P&L - BÁO CÁO KẾT QUẢ HOẠT ĐỘNG KINH DOANH) */}
      {activeSubView === 'pnl' && (
        <div className="space-y-6">
          {/* P&L Performance Summary Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-900 to-indigo-900 text-white shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider block mb-1">
                  BÁO CÁO KẾT QUẢ KINH DOANH TỔNG HỢP (P&L STATEMENT)
                </span>
                <h3 className="text-2xl font-black">
                  Lợi nhuận sau thuế: {formatVND(netProfitAfterTaxNPAT)}
                </h3>
                <p className="text-xs text-blue-200/80 mt-1">
                  Tỷ suất sinh lời ròng (Net Profit Margin):{' '}
                  <span className="font-bold text-emerald-300">{netProfitMarginPct.toFixed(1)}%</span> • Thuế TNDN tạm nộp: {formatVND(corporateIncomeTax)}
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xs">
                  <span className="text-blue-200 text-2xs block">Biên lợi nhuận gộp</span>
                  <span className="text-lg font-bold text-white">{grossMarginPct.toFixed(1)}%</span>
                </div>
                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-xs">
                  <span className="text-blue-200 text-2xs block">Lợi nhuận gộp (Gross)</span>
                  <span className="text-lg font-bold text-emerald-300">{formatVND(grossProfit)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Standard Vietnamese Financial P&L Statement Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                Bảng Báo Cáo Kết Quả Hoạt Động Kinh Doanh (Chuẩn Mẫu B02-DN)
              </h4>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-2xs border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Chỉ tiêu tài chính</th>
                    <th className="py-3 px-3 text-center">Mã số</th>
                    <th className="py-3 px-3 text-center">Thuyết minh</th>
                    <th className="py-3 px-4 text-right">Số tiền phát sinh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {/* 1. Doanh thu bán hàng */}
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                      1. Doanh thu bán hàng và cung cấp dịch vụ
                    </td>
                    <td className="py-3 px-3 text-center text-slate-400 font-mono">01</td>
                    <td className="py-3 px-3 text-center text-slate-400">TK 511</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                      {formatVND(pnlSalesRevenue)}
                    </td>
                  </tr>

                  {/* 2. Giảm trừ doanh thu */}
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400 pl-8">
                      2. Các khoản giảm trừ doanh thu (chiết khấu, giảm giá)
                    </td>
                    <td className="py-3 px-3 text-center text-slate-400 font-mono">02</td>
                    <td className="py-3 px-3 text-center text-slate-400">TK 521</td>
                    <td className="py-3 px-4 text-right text-slate-500">0 ₫</td>
                  </tr>

                  {/* 3. Doanh thu thuần */}
                  <tr className="bg-slate-50/50 dark:bg-slate-800/30 font-semibold">
                    <td className="py-3 px-4 text-slate-900 dark:text-white">
                      3. Doanh thu thuần về bán hàng và cung cấp dịch vụ (10 = 01 - 02)
                    </td>
                    <td className="py-3 px-3 text-center text-slate-500 font-mono">10</td>
                    <td className="py-3 px-3 text-center text-slate-400">—</td>
                    <td className="py-3 px-4 text-right font-bold text-blue-600 dark:text-blue-400">
                      {formatVND(pnlSalesRevenue)}
                    </td>
                  </tr>

                  {/* 4. Giá vốn hàng bán */}
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 pl-8">
                      4. Giá vốn hàng bán (COGS)
                    </td>
                    <td className="py-3 px-3 text-center text-slate-400 font-mono">11</td>
                    <td className="py-3 px-3 text-center text-slate-400">TK 632</td>
                    <td className="py-3 px-4 text-right text-rose-600">
                      -{formatVND(pnlCogs)}
                    </td>
                  </tr>

                  {/* 5. Lợi nhuận gộp */}
                  <tr className="bg-emerald-50/40 dark:bg-emerald-950/20 font-bold border-y border-emerald-200/50 dark:border-emerald-800/50">
                    <td className="py-3 px-4 text-emerald-800 dark:text-emerald-300">
                      5. Lợi nhuận gộp về bán hàng và cung cấp dịch vụ (20 = 10 - 11)
                    </td>
                    <td className="py-3 px-3 text-center text-slate-500 font-mono">20</td>
                    <td className="py-3 px-3 text-center text-slate-400">—</td>
                    <td className="py-3 px-4 text-right font-black text-emerald-600 dark:text-emerald-400 text-sm">
                      {formatVND(grossProfit)}
                    </td>
                  </tr>

                  {/* 6. Doanh thu tài chính */}
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 pl-8">
                      6. Doanh thu hoạt động tài chính (Lãi tiền gửi, cổ tức)
                    </td>
                    <td className="py-3 px-3 text-center text-slate-400 font-mono">21</td>
                    <td className="py-3 px-3 text-center text-slate-400">TK 515</td>
                    <td className="py-3 px-4 text-right text-emerald-600">
                      +{formatVND(pnlFinancialIncome)}
                    </td>
                  </tr>

                  {/* 7. Chi phí tài chính */}
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 pl-8">
                      7. Chi phí tài chính (Lãi vay ngân hàng)
                    </td>
                    <td className="py-3 px-3 text-center text-slate-400 font-mono">22</td>
                    <td className="py-3 px-3 text-center text-slate-400">TK 635</td>
                    <td className="py-3 px-4 text-right text-rose-600">
                      -{formatVND(pnlFinancialExpense)}
                    </td>
                  </tr>

                  {/* 8. Chi phí bán hàng */}
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 pl-8">
                      8. Chi phí bán hàng (Quảng cáo, tiếp thị, hoa hồng)
                    </td>
                    <td className="py-3 px-3 text-center text-slate-400 font-mono">25</td>
                    <td className="py-3 px-3 text-center text-slate-400">TK 641</td>
                    <td className="py-3 px-4 text-right text-rose-600">
                      -{formatVND(pnlSellingExpense)}
                    </td>
                  </tr>

                  {/* 9. Chi phí quản lý DN */}
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 pl-8">
                      9. Chi phí quản lý doanh nghiệp (Văn phòng, khấu hao, lương)
                    </td>
                    <td className="py-3 px-3 text-center text-slate-400 font-mono">26</td>
                    <td className="py-3 px-3 text-center text-slate-400">TK 642</td>
                    <td className="py-3 px-4 text-right text-rose-600">
                      -{formatVND(pnlAdminExpense + pnlPayrollExpense)}
                    </td>
                  </tr>

                  {/* 10. Lợi nhuận thuần EBIT */}
                  <tr className="bg-slate-100/70 dark:bg-slate-800/60 font-bold">
                    <td className="py-3 px-4 text-slate-900 dark:text-white">
                      10. Lợi nhuận thuần từ hoạt động kinh doanh (30 = 20 + (21-22) - (25+26))
                    </td>
                    <td className="py-3 px-3 text-center text-slate-500 font-mono">30</td>
                    <td className="py-3 px-3 text-center text-slate-400">EBIT</td>
                    <td className="py-3 px-4 text-right text-slate-900 dark:text-white">
                      {formatVND(operatingProfitEBIT)}
                    </td>
                  </tr>

                  {/* 11. Thu nhập khác & Chi phí khác */}
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 pl-8">
                      11. Lợi nhuận khác (Thu nhập khác 711 - Chi phí khác 811)
                    </td>
                    <td className="py-3 px-3 text-center text-slate-400 font-mono">40</td>
                    <td className="py-3 px-3 text-center text-slate-400">711/811</td>
                    <td className="py-3 px-4 text-right text-slate-600">
                      {formatVND(otherProfit)}
                    </td>
                  </tr>

                  {/* 12. Tổng LNTT */}
                  <tr className="bg-blue-50/50 dark:bg-blue-950/30 font-bold">
                    <td className="py-3.5 px-4 text-blue-900 dark:text-blue-300">
                      12. Tổng lợi nhuận kế toán trước thuế (50 = 30 + 40)
                    </td>
                    <td className="py-3.5 px-3 text-center text-slate-500 font-mono">50</td>
                    <td className="py-3.5 px-3 text-center text-slate-400">EBT</td>
                    <td className="py-3.5 px-4 text-right text-blue-700 dark:text-blue-300 font-black text-sm">
                      {formatVND(earningsBeforeTaxEBT)}
                    </td>
                  </tr>

                  {/* 13. Thuế TNDN */}
                  <tr className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-300 pl-8">
                      13. Chi phí thuế thu nhập doanh nghiệp hiện hành (20%)
                    </td>
                    <td className="py-3 px-3 text-center text-slate-400 font-mono">51</td>
                    <td className="py-3 px-3 text-center text-slate-400">TK 8211</td>
                    <td className="py-3 px-4 text-right text-rose-600 font-semibold">
                      -{formatVND(corporateIncomeTax)}
                    </td>
                  </tr>

                  {/* 14. Lợi nhuận sau thuế NPAT */}
                  <tr className="bg-gradient-to-r from-emerald-100/60 to-teal-100/60 dark:from-emerald-950/50 dark:to-teal-950/40 font-black text-sm border-t-2 border-emerald-300 dark:border-emerald-700">
                    <td className="py-4 px-4 text-emerald-900 dark:text-emerald-200">
                      14. LỢI NHUẬN SAU THUẾ THU NHẬP DOANH NGHIỆP (60 = 50 - 51)
                    </td>
                    <td className="py-4 px-3 text-center text-slate-600 font-mono">60</td>
                    <td className="py-4 px-3 text-center text-slate-400">TK 421</td>
                    <td className="py-4 px-4 text-right text-emerald-700 dark:text-emerald-300 text-base">
                      {formatVND(netProfitAfterTaxNPAT)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CREATE TRANSACTION / VOUCHER MODAL */}
      {isNewTxModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-y-auto max-h-[90vh]">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-blue-600" />
              {formType === 'income' ? 'Lập Phiếu Thu Tiền Mới' : 'Lập Phiếu Chi Tiền Mới'}
            </h3>

            <form onSubmit={handleSaveTransaction} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Số chứng từ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formVoucherCode}
                    onChange={(e) => setFormVoucherCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ngày chứng từ
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nội dung diễn giải <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Thu tiền hợp đồng thiết kế website đợt 2"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Đối tượng nộp / nhận tiền
                  </label>
                  <input
                    type="text"
                    placeholder="Công ty ABC hoặc Ông/Bà..."
                    value={formPayerOrReceiver}
                    onChange={(e) => setFormPayerOrReceiver(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phân loại hạch toán
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as TransactionCategory)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  >
                    {formType === 'income' ? (
                      <>
                        <option value="sales_revenue">Doanh thu bán hàng (511)</option>
                        <option value="financial_income">Doanh thu tài chính (515)</option>
                        <option value="other_income">Thu nhập khác (711)</option>
                      </>
                    ) : (
                      <>
                        <option value="admin_expense">Chi phí quản lý DN (642)</option>
                        <option value="selling_expense">Chi phí bán hàng (641)</option>
                        <option value="cogs">Giá vốn hàng bán (632)</option>
                        <option value="payroll_expense">Chi phí tiền lương (334/642)</option>
                        <option value="financial_expense">Chi phí tài chính (635)</option>
                        <option value="other_expense">Chi phí khác (811)</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Số tiền (VNĐ) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="100000"
                    required
                    value={formAmount}
                    onChange={(e) => setFormAmount(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Hình thức thanh toán
                  </label>
                  <select
                    value={formPaymentMethod}
                    onChange={(e) => {
                      const val = e.target.value as 'cash' | 'bank';
                      setFormPaymentMethod(val);
                      if (formType === 'income') {
                        setFormAccountDebit(val === 'bank' ? '1121' : '1111');
                      } else {
                        setFormAccountCredit(val === 'bank' ? '1121' : '1111');
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  >
                    <option value="bank">Chuyển khoản Ngân hàng (TK 112)</option>
                    <option value="cash">Tiền mặt tại quỹ (TK 111)</option>
                  </select>
                </div>
              </div>

              {/* Account debit/credit pairing */}
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-2xs text-slate-500 mb-1 font-semibold">Tài khoản Nợ</label>
                  <input
                    type="text"
                    value={formAccountDebit}
                    onChange={(e) => setFormAccountDebit(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold text-center"
                  />
                </div>
                <div>
                  <label className="block text-2xs text-slate-500 mb-1 font-semibold">Tài khoản Có</label>
                  <input
                    type="text"
                    value={formAccountCredit}
                    onChange={(e) => setFormAccountCredit(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-bold text-center"
                  />
                </div>
                <div>
                  <label className="block text-2xs text-slate-500 mb-1 font-semibold">Thuế suất GTGT</label>
                  <select
                    value={formVatRate}
                    onChange={(e) => setFormVatRate(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-center"
                  >
                    <option value="0">0%</option>
                    <option value="5">5%</option>
                    <option value="8">8%</option>
                    <option value="10">10%</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Ghi chú chứng từ kèm theo
                </label>
                <input
                  type="text"
                  placeholder="Kèm hóa đơn GTGT số..., hợp đồng số..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewTxModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 font-semibold text-white rounded-xl shadow-xs ${
                    formType === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  Lưu chứng từ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
