export interface SelectOption {
  key: string;
  label: string;
}

export const sortArr: SelectOption[] = [
  { key: "addTimeNew", label: "依新增時間（最新優先）" },
  { key: "addTimeOld", label: "依新增時間（最舊優先）" },
  { key: "timeEarly", label: "依日期時間（最早優先）" },
  { key: "timeLatest", label: "依日期時間（最晚優先）" },
];

export const categoryArr: SelectOption[] = [
  { key: "個人", label: "個人" },
  { key: "工作", label: "工作" },
  { key: "購物", label: "購物" },
  { key: "其他", label: "其他" },
];

export const priorityArr: SelectOption[] = [
  { key: "所有優先順序", label: "所有優先順序" },
  { key: "低", label: "低" },
  { key: "中", label: "中" },
  { key: "高", label: "高" },
];

export const statusArr: SelectOption[] = [
  { key: "所有狀態", label: "所有狀態" },
  { key: "進行中", label: "進行中" },
  { key: "已完成", label: "已完成" },
];
