import React, { useState } from 'react';
import {
  Package,
  Plus,
  Trash2,
  Calendar,
  Layers,
  Clock,
  TrendingDown,
  Building,
  DollarSign,
  HelpCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { FixedAsset } from '../../types';
import { formatVND } from '../../utils/accountingCalculations';

interface FixedAssetsTabProps {
  assets: FixedAsset[];
  onAddAsset: (asset: FixedAsset) => void;
  onDeleteAsset: (id: string) => void;
}

export const FixedAssetsTab: React.FC<FixedAssetsTabProps> = ({
  assets,
  onAddAsset,
  onDeleteAsset,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Form State
  const [formCode, setFormCode] = useState(`TS-${String(assets.length + 1).padStart(3, '0')}`);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<FixedAsset['category']>('machinery');
  const [formPurchaseDate, setFormPurchaseDate] = useState('2025-06-01');
  const [formOriginalPrice, setFormOriginalPrice] = useState<number>(50000000);
  const [formUsefulLifeMonths, setFormUsefulLifeMonths] = useState<number>(36);
  const [formMethod, setFormMethod] = useState<'straight_line' | 'declining_balance'>('straight_line');

  const handleOpenAdd = () => {
    setFormCode(`TS-${String(assets.length + 1).padStart(3, '0')}`);
    setFormName('');
    setFormCategory('machinery');
    setFormPurchaseDate('2025-06-01');
    setFormOriginalPrice(50000000);
    setFormUsefulLifeMonths(36);
    setFormMethod('straight_line');
    setIsAddModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || formOriginalPrice <= 0) return;

    const newAsset: FixedAsset = {
      id: `fa-${Date.now()}`,
      code: formCode.trim() || `TS-${Date.now().toString().slice(-4)}`,
      name: formName.trim(),
      category: formCategory,
      purchaseDate: formPurchaseDate,
      originalPrice: Number(formOriginalPrice),
      usefulLifeMonths: Number(formUsefulLifeMonths) || 12,
      method: formMethod,
    };

    onAddAsset(newAsset);
    setIsAddModalOpen(false);
  };

  // Calculate depreciation statistics for an asset relative to current date (Sept 2026)
  const computeAssetMetrics = (asset: FixedAsset) => {
    const purchase = new Date(asset.purchaseDate);
    const currentDate = new Date('2026-09-15'); // Current system period

    // Monthly depreciation rate
    const monthlyDepreciation = asset.originalPrice / asset.usefulLifeMonths;
    const yearlyDepreciation = monthlyDepreciation * 12;

    // Months passed since purchase
    const monthsPassed = Math.max(
      0,
      (currentDate.getFullYear() - purchase.getFullYear()) * 12 +
        (currentDate.getMonth() - purchase.getMonth())
    );

    const activeDepreciationMonths = Math.min(monthsPassed, asset.usefulLifeMonths);
    const accumulatedDepreciation = Math.min(asset.originalPrice, activeDepreciationMonths * monthlyDepreciation);
    const remainingValue = Math.max(0, asset.originalPrice - accumulatedDepreciation);
    const remainingMonths = Math.max(0, asset.usefulLifeMonths - activeDepreciationMonths);
    const progressPct = (accumulatedDepreciation / asset.originalPrice) * 100;

    return {
      monthlyDepreciation,
      yearlyDepreciation,
      monthsPassed: activeDepreciationMonths,
      accumulatedDepreciation,
      remainingValue,
      remainingMonths,
      progressPct,
    };
  };

  const assetListWithMetrics = assets.map((a) => ({
    asset: a,
    metrics: computeAssetMetrics(a),
  }));

  const filteredAssets = assetListWithMetrics.filter(({ asset }) => {
    if (selectedCategory === 'all') return true;
    return asset.category === selectedCategory;
  });

  // Global Totals
  const totalOriginalCost = assetListWithMetrics.reduce((sum, item) => sum + item.asset.originalPrice, 0);
  const totalAccumulatedDepreciation = assetListWithMetrics.reduce(
    (sum, item) => sum + item.metrics.accumulatedDepreciation,
    0
  );
  const totalBookValue = totalOriginalCost - totalAccumulatedDepreciation;
  const totalMonthlyDepreciationExpense = assetListWithMetrics.reduce(
    (sum, item) => sum + (item.metrics.remainingMonths > 0 ? item.metrics.monthlyDepreciation : 0),
    0
  );

  const getCategoryLabel = (cat: FixedAsset['category']) => {
    switch (cat) {
      case 'machinery':
        return 'Máy móc & Thiết bị';
      case 'vehicle':
        return 'Phương tiện vận tải';
      case 'office_equipment':
        return 'Thiết bị văn phòng';
      case 'building':
        return 'Nhà cửa & Vật kiến trúc';
      case 'intangible':
        return 'Tài sản vô hình & Bản quyền';
      default:
        return 'Khác';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Asset Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Tổng Nguyên Giá TSCĐ (TK 211)
          </span>
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            {formatVND(totalOriginalCost)}
          </div>
          <p className="text-2xs text-slate-400 mt-1">{assets.length} tài sản đang quản lý</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Hao Mòn Lũy Kế (TK 214)
          </span>
          <div className="text-xl font-bold text-rose-600 dark:text-rose-400">
            -{formatVND(totalAccumulatedDepreciation)}
          </div>
          <p className="text-2xs text-slate-400 mt-1">Đã khấu hao vào chi phí SXKD</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Giá Trị Còn Lại (Book Value)
          </span>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {formatVND(totalBookValue)}
          </div>
          <p className="text-2xs text-slate-400 mt-1">Giá trị sổ sách thuần hiện có</p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-2xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
            Trích Khấu Hao Hàng Tháng
          </span>
          <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
            {formatVND(totalMonthlyDepreciationExpense)}
          </div>
          <p className="text-2xs text-slate-400 mt-1">Phân bổ chi phí hàng kỳ (TK 6424)</p>
        </div>
      </div>

      {/* Main Asset Management Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Header & Filter */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Sổ Theo Dõi Tài Sản Cố Định & Bảng Trích Khấu Hao (TT 45/2013/TT-BTC)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tự động tính mức khấu hao đường thẳng, số tháng đã trích, hao mòn lũy kế và giá trị còn lại
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
            >
              <option value="all">Tất cả danh mục</option>
              <option value="machinery">Máy móc & Thiết bị</option>
              <option value="vehicle">Phương tiện vận tải</option>
              <option value="office_equipment">Thiết bị văn phòng</option>
              <option value="intangible">Tài sản vô hình</option>
            </select>

            <button
              onClick={handleOpenAdd}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Thêm TSCĐ Mới
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-2xs border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Mã / Tên Tài Sản Cố Định</th>
                <th className="py-3 px-3">Danh mục</th>
                <th className="py-3 px-3">Ngày đưa vào SD</th>
                <th className="py-3 px-3 text-right">Nguyên giá (TK 211)</th>
                <th className="py-3 px-3 text-right">Khấu hao / Tháng</th>
                <th className="py-3 px-3 text-right">Hao mòn lũy kế (TK 214)</th>
                <th className="py-3 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                  Giá trị còn lại
                </th>
                <th className="py-3 px-3 text-center">Tiến độ KH</th>
                <th className="py-3 px-3 text-center">Xóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredAssets.map(({ asset, metrics }) => (
                <tr
                  key={asset.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-850/50 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 dark:text-white">{asset.name}</div>
                    <div className="text-2xs font-mono text-blue-600 dark:text-blue-400">{asset.code}</div>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-2xs font-medium">
                      {getCategoryLabel(asset.category)}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                    <div>{asset.purchaseDate}</div>
                    <div className="text-2xs text-slate-400">TG trích: {asset.usefulLifeMonths} tháng</div>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap">
                    {formatVND(asset.originalPrice)}
                  </td>
                  <td className="py-3 px-3 text-right font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap">
                    {formatVND(metrics.monthlyDepreciation)}
                  </td>
                  <td className="py-3 px-3 text-right font-medium text-rose-600 whitespace-nowrap">
                    -{formatVND(metrics.accumulatedDepreciation)}
                    <div className="text-2xs text-slate-400">({metrics.monthsPassed} tháng)</div>
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                    {formatVND(metrics.remainingValue)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <div className="w-20 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, metrics.progressPct)}%` }}
                      />
                    </div>
                    <span className="text-2xs text-slate-500 font-medium mt-0.5 block">
                      {metrics.progressPct.toFixed(0)}%
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => onDeleteAsset(asset.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="Xóa tài sản"
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

      {/* Add Asset Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Khai Báo Tài Sản Cố Định Mới
            </h3>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mã tài sản (TSCĐ) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Loại tài sản
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as FixedAsset['category'])}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  >
                    <option value="machinery">Máy móc & Thiết bị</option>
                    <option value="vehicle">Phương tiện vận tải</option>
                    <option value="office_equipment">Thiết bị văn phòng</option>
                    <option value="building">Nhà cửa & Vật kiến trúc</option>
                    <option value="intangible">Tài sản vô hình</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tên tài sản cố định <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Máy in đa năng Laser công nghiệp HP"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nguyên giá tài sản (VNĐ) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="1000000"
                    required
                    value={formOriginalPrice}
                    onChange={(e) => setFormOriginalPrice(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Thời gian trích (Tháng)
                  </label>
                  <input
                    type="number"
                    min="6"
                    max="600"
                    required
                    value={formUsefulLifeMonths}
                    onChange={(e) => setFormUsefulLifeMonths(Number(e.target.value) || 12)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ngày bắt đầu sử dụng
                  </label>
                  <input
                    type="date"
                    required
                    value={formPurchaseDate}
                    onChange={(e) => setFormPurchaseDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phương pháp khấu hao
                  </label>
                  <select
                    value={formMethod}
                    onChange={(e) => setFormMethod(e.target.value as 'straight_line' | 'declining_balance')}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium"
                  >
                    <option value="straight_line">Đường thẳng (Cố định theo tháng)</option>
                    <option value="declining_balance">Số dư giảm dần có điều chỉnh</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-900/60 text-2xs text-blue-700 dark:text-blue-300">
                <strong>Định khoản kế toán dự kiến:</strong>
                <br />• Ghi tăng TSCĐ: Nợ TK 211 / Có TK 112: {formatVND(formOriginalPrice)}
                <br />• Trích KH hàng tháng: Nợ TK 6424 / Có TK 214:{' '}
                {formatVND(formOriginalPrice / (formUsefulLifeMonths || 1))} / tháng
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs"
                >
                  Lưu tài sản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
