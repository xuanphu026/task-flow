import React, { useState } from 'react';
import { Search, BookMarked, Filter, Layers, CheckCircle2, Info, ArrowRight } from 'lucide-react';
import { CHART_OF_ACCOUNTS, AccountingAccountInfo } from '../../data/initialAccountingData';

export const ChartOfAccountsTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');

  const classes = [
    { id: 'all', label: 'Tất cả tài khoản' },
    { id: '1', label: 'Đầu 1: Tài sản ngắn hạn' },
    { id: '2', label: 'Đầu 2: Tài sản dài hạn' },
    { id: '3', label: 'Đầu 3: Nợ phải trả' },
    { id: '4', label: 'Đầu 4: Vốn chủ sở hữu' },
    { id: '5', label: 'Đầu 5: Doanh thu' },
    { id: '6', label: 'Đầu 6: Chi phí SXKD' },
    { id: '7-8', label: 'Đầu 7-8: TN & CP khác' },
    { id: '9', label: 'Đầu 9: Xác định KQKD' },
  ];

  const filteredAccounts = CHART_OF_ACCOUNTS.filter((acc) => {
    // Check class filter
    if (selectedClass !== 'all') {
      if (selectedClass === '7-8') {
        if (!acc.code.startsWith('7') && !acc.code.startsWith('8')) return false;
      } else if (!acc.code.startsWith(selectedClass)) {
        return false;
      }
    }

    // Check search term
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        acc.code.toLowerCase().includes(q) ||
        acc.name.toLowerCase().includes(q) ||
        acc.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getNatureBadge = (nature: AccountingAccountInfo['nature']) => {
    switch (nature) {
      case 'Debit':
        return (
          <span className="px-2 py-0.5 rounded-full text-2xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
            Số dư NỢ
          </span>
        );
      case 'Credit':
        return (
          <span className="px-2 py-0.5 rounded-full text-2xs font-bold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
            Số dư CÓ
          </span>
        );
      case 'Both':
        return (
          <span className="px-2 py-0.5 rounded-full text-2xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300">
            Lưỡng tính (Nợ/Có)
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter bar */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <BookMarked className="w-5 h-5 text-blue-600" />
              Hệ Thống Tài Khoản Kế Toán Doanh Nghiệp (TT 200/2014 & TT 133/2016)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tra cứu nhanh số hiệu, tên tài khoản, tính chất số dư và chức năng hạch toán định khoản
            </p>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo số hiệu TK (111, 334...) hoặc tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Head Class Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {classes.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedClass(c.id)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap font-medium transition-all ${
                selectedClass === c.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Accounts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAccounts.map((acc) => (
          <div
            key={acc.code}
            className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-blue-400 dark:hover:border-blue-500 transition-colors flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-mono text-base font-black px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                  TK {acc.code}
                </span>
                {getNatureBadge(acc.nature)}
              </div>

              <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1.5">
                {acc.name}
              </h4>

              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {acc.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-2xs text-slate-400">
              <span className="capitalize">Phân loại: {acc.type}</span>
              <span className="font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
                TT 200/2014 <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
