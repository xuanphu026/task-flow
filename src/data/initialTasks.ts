import { Task } from '../types';

const getTodayDateStr = (offsetDays = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Hoàn thành báo cáo tổng kết dự án TaskFlow',
    description: 'Tổng hợp phản hồi người dùng, đo lường hiệu suất và viết tài liệu hướng dẫn bàn giao.',
    completed: false,
    priority: 'urgent',
    category: 'work',
    dueDate: getTodayDateStr(0),
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    isStarred: true,
    estimatedMinutes: 60,
    tags: ['Dự Án', 'Báo Cáo'],
    subtasks: [
      { id: 'sub-1', title: 'Thu thập số liệu người dùng', completed: true },
      { id: 'sub-2', title: 'Viết phần kết luận & đề xuất', completed: false },
      { id: 'sub-3', title: 'Xuất file PDF gửi ban giám đốc', completed: false },
    ],
  },
  {
    id: 'task-2',
    title: 'Tập thể dục & chạy bộ 30 phút',
    description: 'Chạy bộ nhẹ quanh công viên buổi sáng để nâng cao sức đề kháng.',
    completed: true,
    priority: 'medium',
    category: 'health',
    dueDate: getTodayDateStr(0),
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    completedAt: new Date().toISOString(),
    isStarred: false,
    estimatedMinutes: 30,
    tags: ['Thể Thao', 'Sức Khỏe'],
    subtasks: [
      { id: 'sub-21', title: 'Khởi động cơ thể 5 phút', completed: true },
      { id: 'sub-22', title: 'Chạy bộ 25 phút', completed: true },
    ],
  },
  {
    id: 'task-3',
    title: 'Thanh toán hóa đơn điện và Internet tháng này',
    description: 'Thanh toán qua ứng dụng Ngân hàng trực tuyến trước ngày 10.',
    completed: false,
    priority: 'high',
    category: 'finance',
    dueDate: getTodayDateStr(1),
    createdAt: new Date().toISOString(),
    isStarred: true,
    estimatedMinutes: 15,
    tags: ['Hóa Đơn', 'Tài Chính'],
    subtasks: [],
  },
  {
    id: 'task-4',
    title: 'Học 20 từ vựng Tiếng Anh chuyên ngành IT',
    description: 'Sử dụng phương pháp Flashcard ôn tập các từ vựng về Software Architecture.',
    completed: false,
    priority: 'medium',
    category: 'study',
    dueDate: getTodayDateStr(2),
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    isStarred: false,
    estimatedMinutes: 45,
    tags: ['Học Tập', 'Tiếng Anh'],
    subtasks: [
      { id: 'sub-41', title: 'Luyện phát âm qua từ điển Oxford', completed: true },
      { id: 'sub-42', title: 'Đặt 5 câu ví dụ minh họa', completed: false },
    ],
  },
  {
    id: 'task-5',
    title: 'Đặt lịch hẹn kiểm tra sức khỏe định kỳ',
    description: 'Gọi điện cho phòng khám đa khoa để chốt giờ hẹn vào cuối tuần.',
    completed: false,
    priority: 'low',
    category: 'health',
    dueDate: getTodayDateStr(-1), // overdue
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    isStarred: false,
    estimatedMinutes: 10,
    tags: ['Khám Bệnh'],
    subtasks: [],
  },
  {
    id: 'task-6',
    title: 'Mua sinh nhật quà tặng em gái',
    description: 'Tìm mua cuốn sách tiểu thuyết hoặc bộ tai nghe không dây.',
    completed: false,
    priority: 'high',
    category: 'personal',
    dueDate: getTodayDateStr(3),
    createdAt: new Date().toISOString(),
    isStarred: true,
    estimatedMinutes: 60,
    tags: ['Gia Đình', 'Quà Tặng'],
    subtasks: [
      { id: 'sub-61', title: 'Tham khảo danh sách yêu thích', completed: false },
      { id: 'sub-62', title: 'Gói quà cẩn thận', completed: false },
    ],
  },
];
