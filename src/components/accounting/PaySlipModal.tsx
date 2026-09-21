import React from 'react';
import { X, Printer, CheckCircle2, User, Building, Calendar, DollarSign, ShieldAlert } from 'lucide-react';
import { PayrollEmployee, PayrollCalculationResult } from '../../types';
import { calculateEmployeePayroll, formatVND } from '../../utils/accountingCalculations';

interface PaySlipModalProps {
  employee: PayrollEmployee;
  onClose: () => void;
  periodMonth?: string;
}

export const PaySlipModal: React.FC<PaySlipModalProps> = ({
  employee,
  onClose,
  periodMonth = 'Tháng 09/2026',
}) => {
  const calc: PayrollCalculationResult = calculateEmployeePayroll(employee);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 print:hidden">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
              <DollarSign className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Phiếu Lương Cá Nhân (Pay Slip)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Kỳ thanh toán: {periodMonth}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              In phiếu lương
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 print:p-0">
          {/* Company & Employee Identity */}
          <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-5">
            <div>
              <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                TASKFLOW ENTERPRISE
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Mã số thuế: 0108926715 • Hà Nội, Việt Nam
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                ĐÃ DUYỆT CHI LƯƠNG
              </span>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Kỳ: {periodMonth}</p>
            </div>
          </div>

          {/* Employee Info Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Họ và tên:</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">{employee.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Chức vụ:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">{employee.position}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Phòng ban:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">{employee.department}</span>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Người phụ thuộc:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">{employee.dependentsCount} người</span>
            </div>
          </div>

          {/* Detailed Earnings & Deductions Tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* 1. Các khoản thu nhập */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-white dark:bg-slate-900">
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-2xs mb-3 text-blue-600 dark:text-blue-400 flex items-center justify-between">
                <span>I. Các khoản thu nhập (Gross)</span>
                <span>{formatVND(calc.totalIncome)}</span>
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Lương cơ bản (Gross)</span>
                  <span className="font-semibold">{formatVND(employee.grossSalary)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Phụ cấp ăn trưa</span>
                  <span className="font-semibold">{formatVND(employee.lunchAllowance)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Phụ cấp điện thoại & xăng xe</span>
                  <span className="font-semibold">{formatVND(employee.phoneAllowance + employee.transportAllowance)}</span>
                </div>
                {employee.otherAllowances > 0 && (
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400">Phụ cấp khác</span>
                    <span className="font-semibold">{formatVND(employee.otherAllowances)}</span>
                  </div>
                )}
                {(employee.overtimeHours > 0 || employee.overtimeWeekendHours > 0) && (
                  <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-600 dark:text-slate-400">
                      Làm thêm giờ OT ({employee.overtimeHours + employee.overtimeWeekendHours}h)
                    </span>
                    <span className="font-semibold">
                      {formatVND(calc.totalIncome - employee.grossSalary - employee.lunchAllowance - employee.phoneAllowance - employee.transportAllowance - employee.bonus)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-1">
                  <span className="text-slate-600 dark:text-slate-400">Thưởng hiệu suất / KPI</span>
                  <span className="font-semibold text-emerald-600">{formatVND(employee.bonus)}</span>
                </div>
              </div>
            </div>

            {/* 2. Các khoản giảm trừ */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-white dark:bg-slate-900">
              <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-2xs mb-3 text-rose-600 dark:text-rose-400 flex items-center justify-between">
                <span>II. Các khoản giảm trừ</span>
                <span>{formatVND(calc.totalEmployeeInsurance + calc.pitTax + (employee.deductions || 0))}</span>
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">BHXH người lao động (8%)</span>
                  <span className="font-semibold text-rose-600">-{formatVND(calc.bhxhEmployee)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">BHYT người lao động (1.5%)</span>
                  <span className="font-semibold text-rose-600">-{formatVND(calc.bhytEmployee)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">BHTN người lao động (1%)</span>
                  <span className="font-semibold text-rose-600">-{formatVND(calc.bhtnEmployee)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-400">Thuế thu nhập cá nhân (TNCN)</span>
                  <span className="font-semibold text-rose-600">-{formatVND(calc.pitTax)}</span>
                </div>
                {employee.deductions > 0 && (
                  <div className="flex justify-between py-1">
                    <span className="text-slate-600 dark:text-slate-400">Các khoản khấu trừ khác</span>
                    <span className="font-semibold text-rose-600">-{formatVND(employee.deductions)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* NET SALARY HIGHLIGHT BOX */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
                THỰC LĨNH CHUYỂN KHOẢN (NET SALARY)
              </span>
              <span className="text-2xs text-emerald-600 dark:text-emerald-400">
                (Tổng thu nhập trừ Bảo hiểm, Thuế TNCN & Khấu trừ)
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-300">
              {formatVND(calc.netSalary)}
            </div>
          </div>

          {/* Employer Cost Footnote (for HR/Accountants) */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-2xs text-slate-500 dark:text-slate-400 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Chi phí doanh nghiệp đóng thay (23.5% BH + 2% Công đoàn):{' '}
              </span>
              {formatVND(calc.totalEmployerInsurance)}. Tổng chi phí thực tế công ty phải trả cho vị trí này là{' '}
              <strong className="text-blue-600 dark:text-blue-400">{formatVND(calc.totalEmployerCost)}</strong>.
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-3 pt-6 text-center text-xs">
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">Người lập biểu</p>
              <p className="text-slate-400 text-2xs">(Ký, họ tên)</p>
              <div className="h-14" />
              <p className="font-medium text-slate-600 dark:text-slate-400">Trần Thị Bích Ngọc</p>
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">Kế toán trưởng</p>
              <p className="text-slate-400 text-2xs">(Ký, họ tên)</p>
              <div className="h-14" />
              <p className="font-medium text-slate-600 dark:text-slate-400">Trần Thị Bích Ngọc</p>
            </div>
            <div>
              <p className="font-bold text-slate-800 dark:text-slate-200">Người nhận tiền</p>
              <p className="text-slate-400 text-2xs">(Ký, xác nhận)</p>
              <div className="h-14" />
              <p className="font-medium text-slate-600 dark:text-slate-400">{employee.name}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
