import React, { useState } from 'react';
import {
  Users,
  Calculator,
  Plus,
  Trash2,
  Edit2,
  FileText,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  ChevronRight,
  ArrowRightLeft,
  Info,
  Building,
  Check,
} from 'lucide-react';
import { PayrollEmployee, PayrollCalculationResult } from '../../types';
import {
  calculateEmployeePayroll,
  calculateProgressivePIT,
  convertNetToTaxableIncome,
  formatVND,
  STATUTORY_CONSTANTS,
} from '../../utils/accountingCalculations';
import { PaySlipModal } from './PaySlipModal';

interface PayrollTabProps {
  employees: PayrollEmployee[];
  onAddEmployee: (emp: PayrollEmployee) => void;
  onUpdateEmployee: (emp: PayrollEmployee) => void;
  onDeleteEmployee: (id: string) => void;
}

export const PayrollTab: React.FC<PayrollTabProps> = ({
  employees,
  onAddEmployee,
  onUpdateEmployee,
  onDeleteEmployee,
}) => {
  // Modal states
  const [selectedPaySlipEmp, setSelectedPaySlipEmp] = useState<PayrollEmployee | null>(null);
  const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
  const [editingEmpId, setEditingEmpId] = useState<string | null>(null);

  // Quick Simulation Tool State
  const [simSalary, setSimSalary] = useState<number>(20000000);
  const [simDependents, setSimDependents] = useState<number>(0);
  const [simDirection, setSimDirection] = useState<'gross_to_net' | 'net_to_gross'>('gross_to_net');
  const [simInsuranceCap, setSimInsuranceCap] = useState<boolean>(true);

  // Form state for Add/Edit Employee
  const [formName, setFormName] = useState('');
  const [formPosition, setFormPosition] = useState('');
  const [formDepartment, setFormDepartment] = useState('Công nghệ thông tin');
  const [formGross, setFormGross] = useState<number>(15000000);
  const [formInsuranceBase, setFormInsuranceBase] = useState<number>(15000000);
  const [formDependents, setFormDependents] = useState<number>(0);
  const [formLunch, setFormLunch] = useState<number>(730000);
  const [formPhone, setFormPhone] = useState<number>(300000);
  const [formTransport, setFormTransport] = useState<number>(500000);
  const [formOther, setFormOther] = useState<number>(0);
  const [formOTHours, setFormOTHours] = useState<number>(0);
  const [formOTWeekend, setFormOTWeekend] = useState<number>(0);
  const [formBonus, setFormBonus] = useState<number>(0);
  const [formDeductions, setFormDeductions] = useState<number>(0);

  // Open modal for new employee
  const handleOpenNewEmployee = () => {
    setEditingEmpId(null);
    setFormName('');
    setFormPosition('');
    setFormDepartment('Công nghệ thông tin');
    setFormGross(15000000);
    setFormInsuranceBase(15000000);
    setFormDependents(0);
    setFormLunch(730000);
    setFormPhone(300000);
    setFormTransport(500000);
    setFormOther(0);
    setFormOTHours(0);
    setFormOTWeekend(0);
    setFormBonus(0);
    setFormDeductions(0);
    setIsEmpModalOpen(true);
  };

  // Open modal for editing employee
  const handleOpenEditEmployee = (emp: PayrollEmployee) => {
    setEditingEmpId(emp.id);
    setFormName(emp.name);
    setFormPosition(emp.position);
    setFormDepartment(emp.department);
    setFormGross(emp.grossSalary);
    setFormInsuranceBase(emp.insuranceSalary || emp.grossSalary);
    setFormDependents(emp.dependentsCount);
    setFormLunch(emp.lunchAllowance);
    setFormPhone(emp.phoneAllowance);
    setFormTransport(emp.transportAllowance);
    setFormOther(emp.otherAllowances);
    setFormOTHours(emp.overtimeHours);
    setFormOTWeekend(emp.overtimeWeekendHours);
    setFormBonus(emp.bonus);
    setFormDeductions(emp.deductions);
    setIsEmpModalOpen(true);
  };

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const empData: PayrollEmployee = {
      id: editingEmpId || `emp-${Date.now()}`,
      name: formName.trim(),
      position: formPosition.trim() || 'Nhân viên',
      department: formDepartment,
      grossSalary: Number(formGross) || 0,
      insuranceSalary: Number(formInsuranceBase) || Number(formGross) || 0,
      dependentsCount: Number(formDependents) || 0,
      lunchAllowance: Number(formLunch) || 0,
      phoneAllowance: Number(formPhone) || 0,
      transportAllowance: Number(formTransport) || 0,
      otherAllowances: Number(formOther) || 0,
      overtimeHours: Number(formOTHours) || 0,
      overtimeWeekendHours: Number(formOTWeekend) || 0,
      bonus: Number(formBonus) || 0,
      deductions: Number(formDeductions) || 0,
    };

    if (editingEmpId) {
      onUpdateEmployee(empData);
    } else {
      onAddEmployee(empData);
    }
    setIsEmpModalOpen(false);
  };

  // Aggregated totals across all company employees
  const payrollResults = employees.map((emp) => ({
    emp,
    calc: calculateEmployeePayroll(emp),
  }));

  const totalGrossFund = payrollResults.reduce((sum, r) => sum + r.calc.grossSalary, 0);
  const totalNetDisbursed = payrollResults.reduce((sum, r) => sum + r.calc.netSalary, 0);
  const totalEmployeeInsurance = payrollResults.reduce((sum, r) => sum + r.calc.totalEmployeeInsurance, 0);
  const totalEmployerInsurance = payrollResults.reduce((sum, r) => sum + r.calc.totalEmployerInsurance, 0);
  const totalPITFund = payrollResults.reduce((sum, r) => sum + r.calc.pitTax, 0);
  const totalEmployerExpenditure = payrollResults.reduce((sum, r) => sum + r.calc.totalEmployerCost, 0);

  // Quick simulator calculation
  const quickSimResult = React.useMemo(() => {
    if (simDirection === 'gross_to_net') {
      const dummyEmp: PayrollEmployee = {
        id: 'sim',
        name: 'Mô phỏng',
        position: 'Nhân viên',
        department: 'Mô phỏng',
        grossSalary: simSalary,
        insuranceSalary: simSalary,
        dependentsCount: simDependents,
        lunchAllowance: 730000,
        phoneAllowance: 0,
        transportAllowance: 0,
        otherAllowances: 0,
        overtimeHours: 0,
        overtimeWeekendHours: 0,
        bonus: 0,
        deductions: 0,
      };
      return calculateEmployeePayroll(dummyEmp);
    } else {
      // Net to Gross inversion:
      // Net = TotalIncome - EmployeeInsurance - PIT
      // Net = Gross + Lunch(730k) - 10.5% Gross - PIT
      // Taxable = Net - Lunch - Personal - Dependents ...
      // Invert net assessable income:
      const personal = STATUTORY_CONSTANTS.PERSONAL_DEDUCTION;
      const dep = simDependents * STATUTORY_CONSTANTS.DEPENDENT_DEDUCTION;
      const netAfterLunch = Math.max(0, simSalary);
      const netTaxable = Math.max(0, netAfterLunch - personal - dep);
      const grossTaxable = convertNetToTaxableIncome(netTaxable);
      const pitTax = calculateProgressivePIT(grossTaxable);
      
      // Estimated Gross
      // Gross - 10.5% * Gross - pitTax = simSalary
      // Gross * 0.895 = simSalary + pitTax
      const estimatedGross = Math.round((simSalary + pitTax) / 0.895);
      
      const dummyEmp: PayrollEmployee = {
        id: 'sim',
        name: 'Mô phỏng Net -> Gross',
        position: 'Nhân viên',
        department: 'Mô phỏng',
        grossSalary: estimatedGross,
        insuranceSalary: estimatedGross,
        dependentsCount: simDependents,
        lunchAllowance: 0,
        phoneAllowance: 0,
        transportAllowance: 0,
        otherAllowances: 0,
        overtimeHours: 0,
        overtimeWeekendHours: 0,
        bonus: 0,
        deductions: 0,
      };
      return calculateEmployeePayroll(dummyEmp);
    }
  }, [simSalary, simDependents, simDirection]);

  return (
    <div className="space-y-8">
      {/* 1. TOP STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5 text-xs">
            <span>Tổng quỹ lương Gross</span>
            <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {formatVND(totalGrossFund)}
          </div>
          <p className="text-2xs text-slate-400 mt-1">Cho {employees.length} nhân sự công ty</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5 text-xs">
            <span>Thực chi lương Net</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatVND(totalNetDisbursed)}
          </div>
          <p className="text-2xs text-slate-400 mt-1">Chuyển khoản đến tài khoản nhân viên</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5 text-xs">
            <span>Tổng thuế TNCN khấu trừ</span>
            <span className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-bold text-rose-600 dark:text-rose-400">
            {formatVND(totalPITFund)}
          </div>
          <p className="text-2xs text-slate-400 mt-1">Khấu trừ nộp NSNN (TK 3335)</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5 text-xs">
            <span>Tổng chi phí Doanh nghiệp</span>
            <span className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
              <Building className="w-4 h-4" />
            </span>
          </div>
          <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
            {formatVND(totalEmployerExpenditure)}
          </div>
          <p className="text-2xs text-slate-400 mt-1">Gồm Gross + 23.5% BH + 2% CĐ</p>
        </div>
      </div>

      {/* 2. LIVE SALARY SIMULATOR: GROSS <-> NET INTERACTIVE TOOL */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-850 border border-indigo-100 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Công Cụ Tính Lương GROSS ⇄ NET Chuẩn Luật 2026
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Áp dụng quy định giảm trừ bản thân 11tr, phụ thuộc 4.4tr, BHXH trần 46.8tr, biểu thuế 7 bậc
              </p>
            </div>
          </div>

          {/* Toggle Gross <-> Net */}
          <div className="flex items-center p-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs">
            <button
              onClick={() => setSimDirection('gross_to_net')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                simDirection === 'gross_to_net'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              GROSS ➔ NET
            </button>
            <button
              onClick={() => setSimDirection('net_to_gross')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                simDirection === 'net_to_gross'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              NET ➔ GROSS
            </button>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {simDirection === 'gross_to_net' ? 'Mức lương GROSS (VNĐ)' : 'Mức lương NET mong muốn (VNĐ)'}
            </label>
            <div className="relative">
              <input
                type="number"
                step="500000"
                value={simSalary}
                onChange={(e) => setSimSalary(Number(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
                VNĐ
              </span>
            </div>
            <div className="flex gap-2 mt-1.5 flex-wrap">
              {[10000000, 15000000, 20000000, 30000000, 50000000].map((quick) => (
                <button
                  key={quick}
                  onClick={() => setSimSalary(quick)}
                  className="text-2xs px-2 py-0.5 rounded-lg bg-white/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-indigo-400"
                >
                  {(quick / 1000000).toFixed(0)} tr
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Số người phụ thuộc
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSimDependents(Math.max(0, simDependents - 1))}
                className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100"
              >
                -
              </button>
              <div className="flex-1 text-center py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold">
                {simDependents} người (Giảm: {formatVND(simDependents * 4400000)})
              </div>
              <button
                type="button"
                onClick={() => setSimDependents(simDependents + 1)}
                className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100"
              >
                +
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Quy chế đóng bảo hiểm
            </label>
            <div className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <div className="flex justify-between">
                <span>NLĐ đóng (10.5%):</span>
                <span className="font-semibold text-rose-600">-{formatVND(quickSimResult.totalEmployeeInsurance)}</span>
              </div>
              <div className="flex justify-between">
                <span>DN đóng (23.5% + 2%):</span>
                <span className="font-semibold text-purple-600">+{formatVND(quickSimResult.totalEmployerInsurance)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Simulator Results Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-indigo-100/70 dark:border-slate-800">
          <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700">
            <span className="text-2xs text-slate-400 uppercase tracking-wider block mb-1">Lương GROSS</span>
            <div className="text-xl font-black text-slate-900 dark:text-white">
              {formatVND(quickSimResult.grossSalary)}
            </div>
            <div className="text-2xs text-slate-500 mt-1">Mức ghi trên HĐLĐ</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/70">
            <span className="text-2xs text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block mb-1 font-bold">
              Lương THỰC NHẬN (NET)
            </span>
            <div className="text-xl font-black text-emerald-700 dark:text-emerald-300">
              {formatVND(quickSimResult.netSalary)}
            </div>
            <div className="text-2xs text-emerald-600 dark:text-emerald-400 mt-1">
              Thuế TNCN nộp: {formatVND(quickSimResult.pitTax)}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/70">
            <span className="text-2xs text-purple-700 dark:text-purple-400 uppercase tracking-wider block mb-1 font-bold">
              CHI PHÍ THỰC TẾ DOANH NGHIỆP
            </span>
            <div className="text-xl font-black text-purple-700 dark:text-purple-300">
              {formatVND(quickSimResult.totalEmployerCost)}
            </div>
            <div className="text-2xs text-purple-600 dark:text-purple-400 mt-1">
              (Gross + {formatVND(quickSimResult.totalEmployerInsurance)} bảo hiểm DN)
            </div>
          </div>
        </div>
      </div>

      {/* 3. COMPANY EMPLOYEE PAYROLL TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Bảng Thanh Toán Lương Cán Bộ Nhân Viên (Tháng 09/2026)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tự động tính chi tiết Bảo hiểm NLĐ đóng (10.5%), Bảo hiểm Doanh nghiệp (23.5% + 2% CĐ) và Thuế TNCN
            </p>
          </div>

          <button
            onClick={handleOpenNewEmployee}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
            id="add-employee-btn"
          >
            <Plus className="w-4 h-4" />
            Thêm nhân sự mới
          </button>
        </div>

        {/* The Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-2xs border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Nhân sự / Chức vụ</th>
                <th className="py-3 px-3">Lương Gross</th>
                <th className="py-3 px-3">Phụ cấp & Thưởng</th>
                <th className="py-3 px-3 text-rose-600 dark:text-rose-400">BHXH NLĐ (10.5%)</th>
                <th className="py-3 px-3 text-rose-600 dark:text-rose-400">Thuế TNCN</th>
                <th className="py-3 px-3 text-emerald-600 dark:text-emerald-400 font-bold">Thực lĩnh (Net)</th>
                <th className="py-3 px-3 text-purple-600 dark:text-purple-400">Chi phí DN</th>
                <th className="py-3 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {payrollResults.map(({ emp, calc }) => (
                <tr
                  key={emp.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 dark:text-white text-xs">{emp.name}</div>
                    <div className="text-2xs text-slate-500 dark:text-slate-400">
                      {emp.position} • <span className="text-slate-400">{emp.department}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800 dark:text-slate-200">
                    {formatVND(emp.grossSalary)}
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                    <div>+{formatVND(emp.lunchAllowance + emp.phoneAllowance + emp.transportAllowance + emp.bonus)}</div>
                    {emp.bonus > 0 && (
                      <span className="text-2xs text-emerald-600">Thưởng: {formatVND(emp.bonus)}</span>
                    )}
                  </td>
                  <td className="py-3 px-3 font-medium text-rose-600 dark:text-rose-400">
                    -{formatVND(calc.totalEmployeeInsurance)}
                  </td>
                  <td className="py-3 px-3 font-medium text-rose-600 dark:text-rose-400">
                    {calc.pitTax > 0 ? `-${formatVND(calc.pitTax)}` : '0 ₫'}
                  </td>
                  <td className="py-3 px-3 font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    {formatVND(calc.netSalary)}
                  </td>
                  <td className="py-3 px-3 font-semibold text-purple-600 dark:text-purple-400">
                    {formatVND(calc.totalEmployerCost)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => setSelectedPaySlipEmp(emp)}
                        className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition-colors"
                        title="Xem và In Phiếu Lương (Pay Slip)"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEditEmployee(emp)}
                        className="p-1.5 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Chỉnh sửa thông số lương"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteEmployee(emp.id)}
                        className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title="Xóa nhân viên"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Table Summary Footer */}
            <tfoot className="bg-slate-50/90 dark:bg-slate-800/80 font-bold text-slate-900 dark:text-white border-t-2 border-slate-200 dark:border-slate-700">
              <tr>
                <td className="py-3.5 px-4">TỔNG CỘNG ({employees.length} NV)</td>
                <td className="py-3.5 px-3">{formatVND(totalGrossFund)}</td>
                <td className="py-3.5 px-3 text-slate-500">—</td>
                <td className="py-3.5 px-3 text-rose-600">-{formatVND(totalEmployeeInsurance)}</td>
                <td className="py-3.5 px-3 text-rose-600">-{formatVND(totalPITFund)}</td>
                <td className="py-3.5 px-3 text-emerald-600 text-sm">{formatVND(totalNetDisbursed)}</td>
                <td className="py-3.5 px-3 text-purple-600 text-sm">{formatVND(totalEmployerExpenditure)}</td>
                <td className="py-3.5 px-4"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Pay Slip Modal */}
      {selectedPaySlipEmp && (
        <PaySlipModal
          employee={selectedPaySlipEmp}
          onClose={() => setSelectedPaySlipEmp(null)}
          periodMonth="Tháng 09/2026"
        />
      )}

      {/* Add / Edit Employee Modal */}
      {isEmpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 overflow-y-auto max-h-[90vh]">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              {editingEmpId ? 'Cập Nhật Thông Tin Lương Nhân Viên' : 'Thêm Nhân Viên Mới Vào Bảng Lương'}
            </h3>

            <form onSubmit={handleSaveEmployee} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Họ và tên nhân sự <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ví dụ: Hoàng Anh Tuấn"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Chức danh / Vị trí
                  </label>
                  <input
                    type="text"
                    value={formPosition}
                    onChange={(e) => setFormPosition(e.target.value)}
                    placeholder="Kỹ sư phần mềm"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phòng ban
                  </label>
                  <select
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Công nghệ thông tin">Công nghệ thông tin</option>
                    <option value="Tài chính - Kế toán">Tài chính - Kế toán</option>
                    <option value="Kinh doanh">Kinh doanh</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Hành chính">Hành chính</option>
                    <option value="Sản xuất">Sản xuất</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Số người phụ thuộc (4.4tr/người)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={formDependents}
                    onChange={(e) => setFormDependents(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Lương cơ bản Gross (VNĐ) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="500000"
                    required
                    value={formGross}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0;
                      setFormGross(val);
                      setFormInsuranceBase(val);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mức đóng BHXH (Trần 46.8tr)
                  </label>
                  <input
                    type="number"
                    step="500000"
                    value={formInsuranceBase}
                    onChange={(e) => setFormInsuranceBase(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Allowances section */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-3">
                <span className="font-bold text-slate-800 dark:text-slate-200 block text-2xs uppercase tracking-wider">
                  Phụ cấp & Thưởng trong tháng
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-2xs text-slate-500 mb-0.5">Ăn trưa (Max 730k)</label>
                    <input
                      type="number"
                      value={formLunch}
                      onChange={(e) => setFormLunch(Number(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-2xs text-slate-500 mb-0.5">Điện thoại (VNĐ)</label>
                    <input
                      type="number"
                      value={formPhone}
                      onChange={(e) => setFormPhone(Number(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-2xs text-slate-500 mb-0.5">Xăng xe (VNĐ)</label>
                    <input
                      type="number"
                      value={formTransport}
                      onChange={(e) => setFormTransport(Number(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-2xs text-slate-500 mb-0.5">Thưởng KPI / Hiệu suất</label>
                    <input
                      type="number"
                      value={formBonus}
                      onChange={(e) => setFormBonus(Number(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-2xs text-slate-500 mb-0.5">Khấu trừ khác / Tạm ứng</label>
                    <input
                      type="number"
                      value={formDeductions}
                      onChange={(e) => setFormDeductions(Number(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-rose-600"
                    />
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEmpModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs"
                >
                  Lưu nhân viên
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
