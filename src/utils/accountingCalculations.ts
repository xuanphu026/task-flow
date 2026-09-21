// Vietnamese Tax & Labor Law Constants (Applicable 2024-2026)
export const STATUTORY_CONSTANTS = {
  BASE_SALARY: 2340000, // Lương cơ sở
  MAX_INSURANCE_BASE_BHXH_BHYT: 2340000 * 20, // 46,800,000 đ (20 lần lương cơ sở)
  REGION_1_MIN_SALARY: 4960000, // Lương tối thiểu Vùng I
  MAX_INSURANCE_BASE_BHTN: 4960000 * 20, // 99,200,000 đ (20 lần lương tối thiểu vùng)

  // Employee contribution rates (10.5%)
  EMPLOYEE_BHXH: 0.08, // 8%
  EMPLOYEE_BHYT: 0.015, // 1.5%
  EMPLOYEE_BHTN: 0.01, // 1%

  // Employer contribution rates (23.5% insurance + 2% union = 25.5% or 24%)
  EMPLOYER_BHXH: 0.175, // 17.5%
  EMPLOYER_BHYT: 0.03, // 3%
  EMPLOYER_BHTN: 0.01, // 1%
  EMPLOYER_BHTNLD: 0.005, // 0.5% (TNLD - BNN)
  EMPLOYER_TRADE_UNION: 0.02, // 2% Kinh phí công đoàn

  // Personal Income Tax Deductions (VNĐ/month)
  PERSONAL_DEDUCTION: 11000000, // 11 triệu đồng
  DEPENDENT_DEDUCTION: 4400000, // 4.4 triệu đồng/người
  MAX_TAX_EXEMPT_LUNCH: 730000, // 730,000 đ/tháng (TT 26/2015)

  // Corporate Income Tax
  STANDARD_CIT_RATE: 0.20, // 20%
};

import { PayrollCalculationResult, PayrollEmployee } from '../types';

/**
 * Calculate progressive PIT from taxable income (Biểu thuế lũy tiến từng phần 7 bậc)
 */
export function calculateProgressivePIT(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;

  if (taxableIncome <= 5000000) {
    return taxableIncome * 0.05;
  } else if (taxableIncome <= 10000000) {
    return taxableIncome * 0.10 - 250000;
  } else if (taxableIncome <= 18000000) {
    return taxableIncome * 0.15 - 750000;
  } else if (taxableIncome <= 32000000) {
    return taxableIncome * 0.20 - 1650000;
  } else if (taxableIncome <= 52000000) {
    return taxableIncome * 0.25 - 3250000;
  } else if (taxableIncome <= 80000000) {
    return taxableIncome * 0.30 - 5850000;
  } else {
    return taxableIncome * 0.35 - 9850000;
  }
}

/**
 * Convert Net taxable income to Gross taxable income (Quy đổi thu nhập Net sang Gross theo TT 111/2013)
 */
export function convertNetToTaxableIncome(netIncome: number): number {
  if (netIncome <= 0) return 0;
  if (netIncome <= 4750000) {
    return netIncome / 0.95;
  } else if (netIncome <= 9250000) {
    return (netIncome - 250000) / 0.9;
  } else if (netIncome <= 16050000) {
    return (netIncome - 750000) / 0.85;
  } else if (netIncome <= 27250000) {
    return (netIncome - 1650000) / 0.8;
  } else if (netIncome <= 42250000) {
    return (netIncome - 3250000) / 0.75;
  } else if (netIncome <= 61850000) {
    return (netIncome - 5850000) / 0.7;
  } else {
    return (netIncome - 9850000) / 0.65;
  }
}

/**
 * Comprehensive Vietnamese Payroll calculation for an employee
 */
export function calculateEmployeePayroll(emp: PayrollEmployee): PayrollCalculationResult {
  // If is net contract, estimate gross or compute standard
  const grossSalary = emp.grossSalary;

  // Insurance salary base
  const insuranceTarget = emp.insuranceSalary !== undefined && emp.insuranceSalary > 0 
    ? emp.insuranceSalary 
    : grossSalary;

  const baseForBHXH_BHYT = Math.min(insuranceTarget, STATUTORY_CONSTANTS.MAX_INSURANCE_BASE_BHXH_BHYT);
  const baseForBHTN = Math.min(insuranceTarget, STATUTORY_CONSTANTS.MAX_INSURANCE_BASE_BHTN);

  // Employee insurance deductions
  const bhxhEmployee = Math.round(baseForBHXH_BHYT * STATUTORY_CONSTANTS.EMPLOYEE_BHXH);
  const bhytEmployee = Math.round(baseForBHXH_BHYT * STATUTORY_CONSTANTS.EMPLOYEE_BHYT);
  const bhtnEmployee = Math.round(baseForBHTN * STATUTORY_CONSTANTS.EMPLOYEE_BHTN);
  const totalEmployeeInsurance = bhxhEmployee + bhytEmployee + bhtnEmployee;

  // Overtime calculations (assuming standard 26 workdays, 8h/day = 208 hours)
  const hourlyRate = grossSalary / 208;
  const regularOTPay = Math.round((emp.overtimeHours || 0) * hourlyRate * 1.5);
  const weekendOTPay = Math.round((emp.overtimeWeekendHours || 0) * hourlyRate * 2.0);
  const totalOTPay = regularOTPay + weekendOTPay;

  // Overtime tax exempt portion: 0.5x for regular, 1.0x for weekend
  const otExemptPortion = Math.round(
    (emp.overtimeHours || 0) * hourlyRate * 0.5 + (emp.overtimeWeekendHours || 0) * hourlyRate * 1.0
  );

  // Lunch allowance tax exempt (max 730k)
  const lunchExempt = Math.min(emp.lunchAllowance || 0, STATUTORY_CONSTANTS.MAX_TAX_EXEMPT_LUNCH);
  
  // Total tax exempt income
  const taxExemptIncome = lunchExempt + otExemptPortion;

  // Total earnings / Total income
  const totalIncome =
    grossSalary +
    (emp.lunchAllowance || 0) +
    (emp.phoneAllowance || 0) +
    (emp.transportAllowance || 0) +
    (emp.otherAllowances || 0) +
    (emp.bonus || 0) +
    totalOTPay;

  // Assessable income (Thu nhập chịu thuế = Tổng thu nhập - Các khoản miễn thuế)
  const assessableIncome = Math.max(0, totalIncome - taxExemptIncome);

  // Family deductions
  const personalDeduction = STATUTORY_CONSTANTS.PERSONAL_DEDUCTION;
  const dependentDeduction = (emp.dependentsCount || 0) * STATUTORY_CONSTANTS.DEPENDENT_DEDUCTION;
  const totalDeductions = personalDeduction + dependentDeduction + totalEmployeeInsurance + (emp.deductions || 0);

  // Taxable income (Thu nhập tính thuế = Thu nhập chịu thuế - Các khoản giảm trừ)
  const taxableIncome = Math.max(0, assessableIncome - totalDeductions);

  // PIT Tax
  const pitTax = Math.round(calculateProgressivePIT(taxableIncome));

  // Net salary (Lương thực nhận = Tổng thu nhập - Bảo hiểm NLĐ - Thuế TNCN - Khấu trừ khác)
  const netSalary = Math.round(totalIncome - totalEmployeeInsurance - pitTax - (emp.deductions || 0));

  // Employer costs
  const bhxhEmployer = Math.round(baseForBHXH_BHYT * STATUTORY_CONSTANTS.EMPLOYER_BHXH);
  const bhytEmployer = Math.round(baseForBHXH_BHYT * STATUTORY_CONSTANTS.EMPLOYER_BHYT);
  const bhtnEmployer = Math.round(baseForBHTN * STATUTORY_CONSTANTS.EMPLOYER_BHTN);
  const bhtnldEmployer = Math.round(baseForBHXH_BHYT * STATUTORY_CONSTANTS.EMPLOYER_BHTNLD);
  const tradeUnionFee = Math.round(baseForBHXH_BHYT * STATUTORY_CONSTANTS.EMPLOYER_TRADE_UNION);
  
  const totalEmployerInsurance = bhxhEmployer + bhytEmployer + bhtnEmployer + bhtnldEmployer + tradeUnionFee;
  const totalEmployerCost = totalIncome + totalEmployerInsurance;

  return {
    grossSalary,
    totalIncome,
    insuranceBase: baseForBHXH_BHYT,
    bhxhEmployee,
    bhytEmployee,
    bhtnEmployee,
    totalEmployeeInsurance,
    taxExemptIncome,
    assessableIncome,
    personalDeduction,
    dependentDeduction,
    taxableIncome,
    pitTax,
    netSalary,
    bhxhEmployer,
    bhytEmployer,
    bhtnEmployer,
    bhtnldEmployer,
    tradeUnionFee,
    totalEmployerInsurance,
    totalEmployerCost,
  };
}

/**
 * Format currency to Vietnamese Dong string (e.g. "15.000.000 ₫")
 */
export function formatVND(amount: number): string {
  if (isNaN(amount)) return '0 ₫';
  return new Intl.NumberFormat('vi-VN').format(Math.round(amount)) + ' ₫';
}

/**
 * Format compact number (e.g. "15 tr", "2.5 tỷ")
 */
export function formatCompactVND(amount: number): string {
  if (Math.abs(amount) >= 1000000000) {
    return (amount / 1000000000).toFixed(1) + ' tỷ';
  }
  if (Math.abs(amount) >= 1000000) {
    return (amount / 1000000).toFixed(1) + ' tr';
  }
  if (Math.abs(amount) >= 1000) {
    return (amount / 1000).toFixed(0) + ' k';
  }
  return amount.toString();
}
