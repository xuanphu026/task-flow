export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type CategoryId = 'work' | 'personal' | 'study' | 'health' | 'finance' | 'other';

export interface Category {
  id: CategoryId;
  label: string;
  color: string; // Tailwind color class or hex code
  bgColor: string;
  textColor: string;
  borderColor: string;
  iconName: string;
}

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: Priority;
  category: CategoryId;
  dueDate: string; // YYYY-MM-DD
  createdAt: string; // ISO string
  completedAt?: string; // ISO string
  subtasks: SubTask[];
  tags: string[];
  isStarred?: boolean;
  estimatedMinutes?: number;
}

export type ViewMode = 'list' | 'kanban' | 'calendar' | 'analytics' | 'accounting';

export type FilterStatus = 'all' | 'today' | 'upcoming' | 'starred' | 'completed' | 'active' | 'overdue';

export type SortOption = 'dueDate' | 'priority' | 'createdAt' | 'title';

export interface TaskFilterState {
  status: FilterStatus;
  category: CategoryId | 'all';
  priority: Priority | 'all';
  searchQuery: string;
  tag: string | 'all';
  sortBy: SortOption;
  sortOrder: 'asc' | 'desc';
}

export interface ProductivityStats {
  totalTasks: number;
  completedTasks: number;
  activeTasks: number;
  overdueTasks: number;
  completionRate: number;
  starredTasks: number;
  streakDays: number;
}

export interface UserAccount {
  id: string;
  username: string;
  password?: string;
  fullName: string;
  email?: string;
  role?: 'admin' | 'member';
  avatar?: string;
  createdAt?: string;
}

// Accounting & Payroll Types
export interface PayrollEmployee {
  id: string;
  name: string;
  position: string;
  department: string;
  grossSalary: number; // Lương cơ bản/Gross
  insuranceSalary?: number; // Mức lương đóng BHXH (nếu khác Gross)
  dependentsCount: number; // Số người phụ thuộc
  lunchAllowance: number; // Ăn trưa (miễn thuế tối đa 730k)
  phoneAllowance: number; // Điện thoại (theo quy chế khoán)
  transportAllowance: number; // Xăng xe, đi lại
  otherAllowances: number; // Phụ cấp khác chịu thuế
  overtimeHours: number; // Số giờ OT ngày thường (150%)
  overtimeWeekendHours: number; // Số giờ OT cuối tuần (200%)
  bonus: number; // Thưởng hiệu suất / KPI
  deductions: number; // Các khoản giảm trừ khác (phạt, tạm ứng...)
  isNetSalaryContract?: boolean; // Hợp đồng tính theo lương NET
}

export interface PayrollCalculationResult {
  grossSalary: number;
  totalIncome: number;
  insuranceBase: number;
  // Employee deductions
  bhxhEmployee: number; // 8%
  bhytEmployee: number; // 1.5%
  bhtnEmployee: number; // 1%
  totalEmployeeInsurance: number; // 10.5%
  taxExemptIncome: number; // Thu nhập miễn thuế (ăn trưa, phần chênh OT...)
  assessableIncome: number; // Thu nhập chịu thuế
  personalDeduction: number; // Giảm trừ bản thân (11tr)
  dependentDeduction: number; // Giảm trừ người phụ thuộc (4.4tr/người)
  taxableIncome: number; // Thu nhập tính thuế TNCN
  pitTax: number; // Thuế TNCN phải nộp
  netSalary: number; // Lương thực nhận (Take home)
  // Employer costs
  bhxhEmployer: number; // 17.5%
  bhytEmployer: number; // 3%
  bhtnEmployer: number; // 1%
  bhtnldEmployer: number; // 0.5%
  tradeUnionFee: number; // 2% Kinh phí công đoàn
  totalEmployerInsurance: number; // 24%
  totalEmployerCost: number; // Tổng chi phí thực tế DN phải chi trả
}

export type TransactionType = 'income' | 'expense';
export type TransactionCategory =
  | 'sales_revenue' // Doanh thu bán hàng & cung cấp dịch vụ (TK 511)
  | 'financial_income' // Doanh thu hoạt động tài chính (TK 515)
  | 'other_income' // Thu nhập khác (TK 711)
  | 'cogs' // Giá vốn hàng bán (TK 632)
  | 'selling_expense' // Chi phí bán hàng (TK 641)
  | 'admin_expense' // Chi phí quản lý doanh nghiệp (TK 642)
  | 'payroll_expense' // Chi phí lương & BHXH (TK 6421 / 622)
  | 'financial_expense' // Chi phí tài chính, lãi vay (TK 635)
  | 'other_expense'; // Chi phí khác (TK 811)

export interface AccountingTransaction {
  id: string;
  voucherCode: string; // Số chứng từ: PT-001 (Thu), PC-001 (Chi)
  date: string; // YYYY-MM-DD
  type: TransactionType;
  category: TransactionCategory;
  amount: number;
  description: string;
  payerOrReceiver: string; // Đối tượng nộp / nhận
  paymentMethod: 'cash' | 'bank'; // Tiền mặt (111) hoặc Chuyển khoản (112)
  taxVatRate?: number; // 0, 5, 8, 10%
  vatAmount?: number;
  accountDebit?: string; // TK Nợ
  accountCredit?: string; // TK Có
  notes?: string;
}

export interface FixedAsset {
  id: string;
  code: string; // Mã TSCĐ: TS-001
  name: string;
  category: 'machinery' | 'vehicle' | 'office_equipment' | 'building' | 'intangible';
  purchaseDate: string; // YYYY-MM-DD
  originalPrice: number; // Nguyên giá
  salvageValue?: number; // Giá trị thanh lý ước tính
  usefulLifeMonths: number; // Thời gian khấu hao (tháng)
  method: 'straight_line' | 'declining_balance';
  depreciationRate?: number; // Tỷ lệ khấu hao
}

export interface VatDeclarationData {
  periodMonth: number;
  periodYear: number;
  salesOutNoTax: number;
  salesOut5: number;
  salesOut8: number;
  salesOut10: number;
  purchasesInNoTax: number;
  purchasesIn5: number;
  purchasesIn8: number;
  purchasesIn10: number;
  prevPeriodVatCarryOver: number; // Thuế GTGT còn được khấu trừ kỳ trước chuyển sang (Chỉ tiêu [22])
}
