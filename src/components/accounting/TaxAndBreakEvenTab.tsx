import React, { useState } from 'react';
import {
  Calculator,
  Percent,
  TrendingUp,
  Target,
  FileCheck2,
  AlertCircle,
  HelpCircle,
  CheckCircle,
  ShieldCheck,
  Building,
  BarChart2,
} from 'lucide-react';
import { formatVND } from '../../utils/accountingCalculations';

export const TaxAndBreakEvenTab: React.FC = () => {
  // VAT Simulation State
  const [vatCarriedForward, setVatCarriedForward] = useState<number>(5500000); // Chỉ tiêu 22
  const [purchasesTaxable10, setPurchasesTaxable10] = useState<number>(75000000); // Mua vào 10%
  const [purchasesTaxable8, setPurchasesTaxable8] = useState<number>(30000000); // Mua vào 8%
  const [salesTaxable10, setSalesTaxable10] = useState<number>(145000000); // Bán ra 10%
  const [salesTaxable8, setSalesTaxable8] = useState<number>(88000000); // Bán ra 8%
  const [salesTaxable0, setSalesTaxable0] = useState<number>(0);

  // VAT Calculations
  const inputVat10 = Math.round(purchasesTaxable10 * 0.1);
  const inputVat8 = Math.round(purchasesTaxable8 * 0.08);
  const totalInputVat = inputVat10 + inputVat8; // Tổng thuế GTGT đầu vào (Chỉ tiêu 25)

  const outputVat10 = Math.round(salesTaxable10 * 0.1);
  const outputVat8 = Math.round(salesTaxable8 * 0.08);
  const totalOutputVat = outputVat10 + outputVat8; // Tổng thuế GTGT đầu ra (Chỉ tiêu 35)

  // Net VAT: Output - Input - CarriedForward
  const vatBalance = totalOutputVat - totalInputVat - vatCarriedForward;
  const vatPayable = Math.max(0, vatBalance); // Chỉ tiêu 40: Thuế GTGT phải nộp
  const vatCarryToNext = Math.max(0, -vatBalance); // Chỉ tiêu 43: Thuế GTGT còn được khấu trừ chuyển kỳ sau

  // Break-Even / CVP Management Accounting State
  const [fixedCosts, setFixedCosts] = useState<number>(65000000); // Định phí hàng tháng (Mặt bằng, lương cơ bản, khấu hao)
  const [unitSellingPrice, setUnitSellingPrice] = useState<number>(15000000); // Giá bán 1 dự án/sản phẩm
  const [unitVariableCost, setUnitVariableCost] = useState<number>(6000000); // Biến phí 1 đơn vị (Hosting, CTV trực tiếp, hoa hồng)
  const [actualTargetUnits, setActualTargetUnits] = useState<number>(12); // Sản lượng kỳ vọng bán được

  // CVP Calculations
  const unitContributionMargin = unitSellingPrice - unitVariableCost; // Số dư đảm phí 1 đơn vị (CM = P - V)
  const cmRatio = unitSellingPrice > 0 ? (unitContributionMargin / unitSellingPrice) * 100 : 0; // Tỷ lệ số dư đảm phí
  
  // Break-even Units: FC / (P - V)
  const breakEvenUnits = unitContributionMargin > 0 ? Math.ceil(fixedCosts / unitContributionMargin) : 0;
  
  // Break-even Revenue: FC / (CM Ratio)
  const breakEvenRevenue = cmRatio > 0 ? (fixedCosts / (cmRatio / 100)) : 0;

  // Actual Performance at Target Units
  const projectedRevenue = actualTargetUnits * unitSellingPrice;
  const projectedTotalCost = fixedCosts + (actualTargetUnits * unitVariableCost);
  const projectedOperatingProfit = projectedRevenue - projectedTotalCost;
  
  // Margin of Safety (Biên độ an toàn)
  const marginOfSafetyRevenue = Math.max(0, projectedRevenue - breakEvenRevenue);
  const marginOfSafetyRatio = projectedRevenue > 0 ? (marginOfSafetyRevenue / projectedRevenue) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* 1. SECTION: KÊ KHAI THUẾ GTGT TẠM TÍNH (MẪU 01/GTGT) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Tờ Khai Thuế GTGT Tạm Tính (Khấu Trừ Theo Mẫu 01/GTGT)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tự động đối trừ thuế GTGT đầu vào được khấu trừ (TK 133) và thuế GTGT đầu ra phải nộp (TK 3331)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                vatPayable > 0
                  ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                  : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
              }`}
            >
              {vatPayable > 0
                ? `Số thuế GTGT phải nộp [40]: ${formatVND(vatPayable)}`
                : `Còn được khấu trừ chuyển kỳ sau [43]: ${formatVND(vatCarryToNext)}`}
            </span>
          </div>
        </div>

        {/* Inputs & Calculation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Hàng hóa, dịch vụ mua vào (Đầu vào) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-3.5">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider flex items-center justify-between">
              <span>I. Thuế GTGT Đầu Vào Được Khấu Trừ (TK 133)</span>
              <span className="text-blue-600 font-bold">{formatVND(totalInputVat)}</span>
            </h4>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">
                Thuế GTGT chưa khấu trừ kỳ trước chuyển sang [Chỉ tiêu 22]
              </label>
              <input
                type="number"
                step="500000"
                value={vatCarriedForward}
                onChange={(e) => setVatCarriedForward(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
              />
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">
                Doanh số mua vào chịu thuế suất 10%
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="1000000"
                  value={purchasesTaxable10}
                  onChange={(e) => setPurchasesTaxable10(Number(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
                <span className="w-28 text-right font-medium text-slate-700 dark:text-slate-300">
                  Thuế: {formatVND(inputVat10)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">
                Doanh số mua vào chịu thuế suất 8% (Chính sách giảm thuế)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="1000000"
                  value={purchasesTaxable8}
                  onChange={(e) => setPurchasesTaxable8(Number(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
                <span className="w-28 text-right font-medium text-slate-700 dark:text-slate-300">
                  Thuế: {formatVND(inputVat8)}
                </span>
              </div>
            </div>
          </div>

          {/* Hàng hóa, dịch vụ bán ra (Đầu ra) */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-3.5">
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider flex items-center justify-between">
              <span>II. Thuế GTGT Đầu Ra Phát Sinh (TK 3331)</span>
              <span className="text-rose-600 font-bold">{formatVND(totalOutputVat)}</span>
            </h4>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">
                Doanh số bán ra chịu thuế 10% [Chỉ tiêu 32]
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="1000000"
                  value={salesTaxable10}
                  onChange={(e) => setSalesTaxable10(Number(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
                />
                <span className="w-28 text-right font-bold text-rose-600">
                  Thuế: {formatVND(outputVat10)}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-slate-600 dark:text-slate-400 mb-1">
                Doanh số bán ra chịu thuế 8% (Dịch vụ CNTT/Chuyển giao)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="1000000"
                  value={salesTaxable8}
                  onChange={(e) => setSalesTaxable8(Number(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
                />
                <span className="w-28 text-right font-bold text-rose-600">
                  Thuế: {formatVND(outputVat8)}
                </span>
              </div>
            </div>

            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Tổng thuế GTGT đầu ra [35]:</span>
              <span className="font-black text-rose-600 text-sm">{formatVND(totalOutputVat)}</span>
            </div>
          </div>
        </div>

        {/* VAT Result Summary Alert */}
        <div className="mt-5 p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-700 dark:text-slate-300">
            <span className="font-bold text-slate-900 dark:text-white">Công thức quyết toán thuế GTGT: </span>
            Thuế GTGT = Đầu ra ({formatVND(totalOutputVat)}) - Đầu vào ({formatVND(totalInputVat)}) - Khấu trừ kỳ trước ({formatVND(vatCarriedForward)}).{' '}
            {vatPayable > 0 ? (
              <span className="text-rose-600 font-bold">
                Doanh nghiệp cần nộp số tiền {formatVND(vatPayable)} vào Kho bạc Nhà nước trước ngày 20 tháng tiếp theo.
              </span>
            ) : (
              <span className="text-emerald-600 font-bold">
                Doanh nghiệp chưa phải nộp thuế GTGT, được chuyển số dư {formatVND(vatCarryToNext)} để bù trừ cho kỳ khai thuế sau.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. SECTION: PHÂN TÍCH ĐIỂM HÒA VỐN & CHI PHÍ QUẢN TRỊ (BREAK-EVEN ANALYSIS & CVP) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6">
        <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Phân Tích Điểm Hòa Vốn Quản Trị (CVP - Cost-Volume-Profit Analysis)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Xác định sản lượng và mức doanh thu tối thiểu để công ty không bị lỗ và tối ưu hóa lợi nhuận
            </p>
          </div>
        </div>

        {/* Input Parameters for Break-even */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Tổng định phí tháng (Fixed Costs)
            </label>
            <input
              type="number"
              step="1000000"
              value={fixedCosts}
              onChange={(e) => setFixedCosts(Number(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold"
            />
            <span className="text-2xs text-slate-400 mt-1 block">Tiền thuê VP, lương cứng, khấu hao</span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Đơn giá bán 1 gói/SP (Price)
            </label>
            <input
              type="number"
              step="500000"
              value={unitSellingPrice}
              onChange={(e) => setUnitSellingPrice(Number(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-blue-600"
            />
            <span className="text-2xs text-slate-400 mt-1 block">Giá bán bình quân 1 đơn vị</span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Biến phí 1 đơn vị (Variable Cost)
            </label>
            <input
              type="number"
              step="500000"
              value={unitVariableCost}
              onChange={(e) => setUnitVariableCost(Number(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-rose-600"
            />
            <span className="text-2xs text-slate-400 mt-1 block">Giá vốn trực tiếp, hoa hồng sales</span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Sản lượng dự kiến bán (Units)
            </label>
            <input
              type="number"
              min="1"
              value={actualTargetUnits}
              onChange={(e) => setActualTargetUnits(Number(e.target.value) || 1)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-purple-600"
            />
            <span className="text-2xs text-slate-400 mt-1 block">Mục tiêu kinh doanh trong tháng</span>
          </div>
        </div>

        {/* Break-even Results Dashboard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
            <span className="text-2xs text-slate-400 uppercase tracking-wider block mb-1">
              Số Dư Đảm Phí / Đơn Vị (CM)
            </span>
            <div className="text-xl font-black text-slate-900 dark:text-white">
              {formatVND(unitContributionMargin)}
            </div>
            <p className="text-2xs text-blue-600 mt-1 font-semibold">Tỷ lệ CM: {cmRatio.toFixed(1)}%</p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60">
            <span className="text-2xs text-amber-700 dark:text-amber-400 uppercase tracking-wider block mb-1 font-bold">
              Sản Lượng Hòa Vốn (BEP Units)
            </span>
            <div className="text-2xl font-black text-amber-700 dark:text-amber-300">
              {breakEvenUnits} đơn vị
            </div>
            <p className="text-2xs text-amber-600 mt-1">Cần bán tối thiểu để bù đắp định phí</p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60">
            <span className="text-2xs text-amber-700 dark:text-amber-400 uppercase tracking-wider block mb-1 font-bold">
              Doanh Thu Hòa Vốn (BEP Revenue)
            </span>
            <div className="text-xl font-black text-amber-700 dark:text-amber-300">
              {formatVND(breakEvenRevenue)}
            </div>
            <p className="text-2xs text-amber-600 mt-1">Mức doanh thu điểm 0 lãi/lỗ</p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60">
            <span className="text-2xs text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block mb-1 font-bold">
              Lợi Nhuận Dự Kiến (Tại {actualTargetUnits} SP)
            </span>
            <div
              className={`text-xl font-black ${
                projectedOperatingProfit >= 0 ? 'text-emerald-600 dark:text-emerald-300' : 'text-rose-600'
              }`}
            >
              {formatVND(projectedOperatingProfit)}
            </div>
            <p className="text-2xs text-emerald-600 mt-1">
              Biên độ an toàn: {marginOfSafetyRatio.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
