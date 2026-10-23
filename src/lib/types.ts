export interface RegistrationRecord {
  id: string;
  serialNo: string; // সিরিয়াল নাম্বার
  birthRegistrationNo: string; // জন্মনিবন্ধন নাম্বার
  applicantName: string; // নিবন্ধন কারীর নাম
  dateOfBirth: string; // জন্ম তারিখ
  fatherName: string; // বাবার নাম
  motherName: string; // মাতার নাম
  pendingMoney: number; // পেন্ডিং টাকা
  isDelivered: boolean; // ডেলিভারি স্ট্যাটাস (true = ডেলিভারি ডান ✅, false = পেন্ডিং ⏳)
  createdAt: string;
  updatedAt: string;
}

export type ActionType = 'ADD' | 'UPDATE' | 'DELIVERY' | 'PAYMENT' | 'DELETE';

export interface WorkHistoryLog {
  id: string;
  actionType: ActionType;
  title: string;
  description: string;
  serialNo?: string;
  applicantName?: string;
  birthRegistrationNo?: string;
  timestamp: string;
}

export interface DashboardStats {
  totalRegistrations: number;
  totalPendingMoney: number;
  totalDelivered: number;
  totalPendingDelivery: number;
}

export interface VisitorStats {
  totalVisits: number;
  uniqueVisitors: number;
  todayVisits: number;
}

export interface VisitorLogItem {
  id: string;
  visitorId: string;
  device?: string | null;
  browser?: string | null;
  visitType?: string | null;
  path?: string | null;
  timestamp: string;
}


