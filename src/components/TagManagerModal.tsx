import React, { useState } from 'react';
import { Tag, Trash2, X, Search, AlertCircle, Edit3, Check } from 'lucide-react';
import { Task } from '../types';
import { ConfirmModal } from './ConfirmModal';

interface TagManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  allTags: string[];
  tasks: Task[];
  onDeleteTagGlobally: (tag: string) => Promise<void>;
  onRenameTagGlobally?: (oldTag: string, newTag: string) => Promise<void>;
}

const normalizeStr = (str: string) => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .trim();
};

export const TagManagerModal: React.FC<TagManagerModalProps> = ({
  isOpen,
  onClose,
  allTags,
  tasks,
  onDeleteTagGlobally,
  onRenameTagGlobally,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const [confirmDeletingTag, setConfirmDeletingTag] = useState<string | null>(null);

  if (!isOpen) return null;

  const getTagUsageCount = (tagName: string) => {
    return tasks.filter((t) => t.tags?.includes(tagName)).length;
  };

  const cleanQuery = searchQuery.trim().replace(/^#/, '');
  const normalizedQuery = normalizeStr(cleanQuery);

  const filteredTags = allTags.filter((t) => {
    if (!cleanQuery) return true;
    const rawTagLower = t.toLowerCase();
    const normalizedTag = normalizeStr(t);
    return (
      rawTagLower.includes(cleanQuery.toLowerCase()) ||
      normalizedTag.includes(normalizedQuery)
    );
  });

  const handleConfirmDelete = async (tag: string) => {
    setIsProcessing(true);
    try {
      await onDeleteTagGlobally(tag);
    } finally {
      setIsProcessing(false);
      setConfirmDeletingTag(null);
    }
  };

  const handleStartRename = (tag: string) => {
    setEditingTag(tag);
    setNewTagName(tag);
  };

  const handleSaveRename = async (oldTag: string) => {
    if (!newTagName.trim() || newTagName.trim() === oldTag) {
      setEditingTag(null);
      return;
    }

    if (onRenameTagGlobally) {
      setIsProcessing(true);
      try {
        await onRenameTagGlobally(oldTag, newTagName.trim());
      } finally {
        setIsProcessing(false);
        setEditingTag(null);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">
                Quản Lý Thẻ Nhãn ({allTags.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Xóa hoặc đổi tên thẻ để giữ danh sách gọn gàng
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 pb-2 border-b border-slate-100 dark:border-slate-800/60">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm thẻ (ví dụ: #DựÁn, khambenh...)"
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-md"
                title="Xóa tìm kiếm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Tags List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {filteredTags.length === 0 ? (
            <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              {allTags.length === 0 ? 'Chưa có thẻ nhãn nào' : 'Không tìm thấy thẻ phù hợp'}
            </div>
          ) : (
            filteredTags.map((tag) => {
              const count = getTagUsageCount(tag);
              const isEditing = editingTag === tag;

              return (
                <div
                  key={tag}
                  className="flex items-center justify-between p-2.5 px-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 hover:border-slate-300 dark:hover:border-slate-600 transition-all"
                >
                  {isEditing ? (
                    <div className="flex items-center gap-2 flex-1 mr-2">
                      <span className="text-blue-500 font-bold text-xs">#</span>
                      <input
                        type="text"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveRename(tag);
                          if (e.key === 'Escape') setEditingTag(null);
                        }}
                        autoFocus
                        className="flex-1 px-2 py-1 text-xs bg-white dark:bg-slate-900 border border-blue-500 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none"
                      />
                      <button
                        onClick={() => handleSaveRename(tag)}
                        disabled={isProcessing}
                        className="p-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        title="Lưu"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingTag(null)}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        title="Hủy"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 flex-1 min-w-0 mr-2">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium text-xs border border-blue-200/80 dark:border-blue-800/80 truncate">
                        #{tag}
                      </span>
                      <span className="text-2xs font-medium text-slate-400 dark:text-slate-500 shrink-0">
                        {count} công việc
                      </span>
                    </div>
                  )}

                  {!isEditing && (
                    <div className="flex items-center gap-1 shrink-0">
                      {onRenameTagGlobally && (
                        <button
                          onClick={() => handleStartRename(tag)}
                          disabled={isProcessing}
                          className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          title="Đổi tên thẻ"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => setConfirmDeletingTag(tag)}
                        disabled={isProcessing}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                        title="Xóa thẻ khỏi tất cả công việc"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!confirmDeletingTag}
        onClose={() => setConfirmDeletingTag(null)}
        onConfirm={() => {
          if (confirmDeletingTag) {
            return handleConfirmDelete(confirmDeletingTag);
          }
        }}
        title="Xác nhận xóa thẻ"
        message={
          confirmDeletingTag
            ? `Bạn có chắc chắn muốn xóa thẻ "#${confirmDeletingTag}" khỏi ${getTagUsageCount(confirmDeletingTag)} công việc không?`
            : ''
        }
        confirmText="Xóa thẻ"
        cancelText="Hủy"
        isDanger={true}
        isLoading={isProcessing}
      />
    </div>
  );
};
