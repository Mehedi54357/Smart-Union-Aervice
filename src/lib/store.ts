import { RegistrationRecord, WorkHistoryLog, DashboardStats } from './types';

const INITIAL_REGISTRATIONS: RegistrationRecord[] = [
  {
    id: 'reg-001',
    serialNo: '1001',
    birthRegistrationNo: '20053514325012345',
    applicantName: 'মো: তানজিম আহমেদ',
    dateOfBirth: '2005-04-12',
    fatherName: 'মো: রফিকুল ইসলাম',
    motherName: 'মোসা: রোকেয়া বেগম',
    pendingMoney: 0,
    isDelivered: true,
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-01T14:30:00Z',
  },
  {
    id: 'reg-002',
    serialNo: '1002',
    birthRegistrationNo: '20103514325088912',
    applicantName: 'সাদিয়া সুলতানা',
    dateOfBirth: '2010-09-25',
    fatherName: 'আব্দুল কুদ্দুস',
    motherName: 'জাহানারা আক্তার',
    pendingMoney: 250,
    isDelivered: false,
    createdAt: '2026-08-03T11:15:00Z',
    updatedAt: '2026-08-03T11:15:00Z',
  },
  {
    id: 'reg-003',
    serialNo: '1003',
    birthRegistrationNo: '19983514325055431',
    applicantName: 'মো: আল-আমিন হোসেন',
    dateOfBirth: '1998-11-05',
    fatherName: 'মো: কাবিল হোসেন',
    motherName: 'মোসা: সুফিয়া খাতুন',
    pendingMoney: 500,
    isDelivered: false,
    createdAt: '2026-08-05T09:30:00Z',
    updatedAt: '2026-08-05T09:30:00Z',
  },
  {
    id: 'reg-004',
    serialNo: '1004',
    birthRegistrationNo: '20153514325099881',
    applicantName: 'ফারজানা আক্তার মিম',
    dateOfBirth: '2015-02-18',
    fatherName: 'মো: আনোয়ার হোসেন',
    motherName: 'নাজমুন নাহার',
    pendingMoney: 0,
    isDelivered: true,
    createdAt: '2026-08-07T15:20:00Z',
    updatedAt: '2026-08-08T10:00:00Z',
  },
  {
    id: 'reg-005',
    serialNo: '1005',
    birthRegistrationNo: '20013514325033221',
    applicantName: 'মো: জাহিদ হাসান',
    dateOfBirth: '2001-07-30',
    fatherName: 'মো: বেলায়েত শেখ',
    motherName: 'বিলকিস পারভীন',
    pendingMoney: 150,
    isDelivered: false,
    createdAt: '2026-08-09T08:45:00Z',
    updatedAt: '2026-08-09T08:45:00Z',
  },
];

const INITIAL_HISTORY: WorkHistoryLog[] = [
  {
    id: 'hist-001',
    actionType: 'ADD',
    title: 'নতুন জন্মনিবন্ধন যোগ করা হয়েছে',
    description: 'আবেদনকারী: মো: তানজিম আহমেদ (সিরিয়াল: #1001, জন্মনিবন্ধন নং: 20053514325012345)',
    serialNo: '1001',
    applicantName: 'মো: তানজিম আহমেদ',
    birthRegistrationNo: '20053514325012345',
    timestamp: '2026-08-01T10:00:00Z',
  },
  {
    id: 'hist-002',
    actionType: 'DELIVERY',
    title: 'ডেলিভারি সম্পন্ন (✅  ডেলিভারি ডান)',
    description: 'মো: তানজিম আহমেদ এর জন্মনিবন্ধন সনদ সফলভাবে ডেলিভারি দেওয়া হয়েছে।',
    serialNo: '1001',
    applicantName: 'মো: তানজিম আহমেদ',
    birthRegistrationNo: '20053514325012345',
    timestamp: '2026-08-01T14:30:00Z',
  },
  {
    id: 'hist-003',
    actionType: 'ADD',
    title: 'নতুন জন্মনিবন্ধন যোগ করা হয়েছে',
    description: 'আবেদনকারী: সাদিয়া সুলতানা (সিরিয়াল: #1002, পেন্ডিং টাকা: ২৫০ ৳)',
    serialNo: '1002',
    applicantName: 'সাদিয়া সুলতানা',
    birthRegistrationNo: '20103514325088912',
    timestamp: '2026-08-03T11:15:00Z',
  },
  {
    id: 'hist-004',
    actionType: 'ADD',
    title: 'নতুন জন্মনিবন্ধন যোগ করা হয়েছে',
    description: 'আবেদনকারী: ফারজানা আক্তার মিম (সিরিয়াল: #1004)',
    serialNo: '1004',
    applicantName: 'ফারজানা আক্তার মিম',
    birthRegistrationNo: '20153514325099881',
    timestamp: '2026-08-07T15:20:00Z',
  },
  {
    id: 'hist-005',
    actionType: 'DELIVERY',
    title: 'ডেলিভারি সম্পন্ন (✅  ডেলিভারি ডান)',
    description: 'ফারজানা আক্তার মিম এর জন্মনিবন্ধন ডেলিভারি দেওয়া হয়েছে।',
    serialNo: '1004',
    applicantName: 'ফারজানা আক্তার মিম',
    birthRegistrationNo: '20153514325099881',
    timestamp: '2026-08-08T10:00:00Z',
  },
];

class StoreManager {
  private static instance: StoreManager;
  private registrations: RegistrationRecord[] = [...INITIAL_REGISTRATIONS];
  private historyLogs: WorkHistoryLog[] = [...INITIAL_HISTORY];

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): StoreManager {
    if (!StoreManager.instance) {
      StoreManager.instance = new StoreManager();
    }
    return StoreManager.instance;
  }

  private loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        const storedRegs = localStorage.getItem('munsur_registrations');
        const storedLogs = localStorage.getItem('munsur_history');
        if (storedRegs) {
          const parsed = JSON.parse(storedRegs);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.registrations = parsed;
          }
        }
        if (storedLogs) {
          const parsedLogs = JSON.parse(storedLogs);
          if (Array.isArray(parsedLogs) && parsedLogs.length > 0) {
            this.historyLogs = parsedLogs;
          }
        }
      } catch (err) {
        console.error('Failed to load storage:', err);
      }
    }
  }

  private saveToStorage(): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('munsur_registrations', JSON.stringify(this.registrations));
        localStorage.setItem('munsur_history', JSON.stringify(this.historyLogs));
      } catch (err) {
        console.error('Failed to save to storage:', err);
      }
    }
  }

  public getRegistrations(): RegistrationRecord[] {
    return [...this.registrations];
  }

  public addRegistration(data: Omit<RegistrationRecord, 'id' | 'createdAt' | 'updatedAt'>): RegistrationRecord {
    const now = new Date().toISOString();
    const newRecord: RegistrationRecord = {
      ...data,
      id: `reg-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };

    this.registrations.unshift(newRecord);

    this.addHistoryLog({
      actionType: 'ADD',
      title: 'নতুন জন্মনিবন্ধন তথ্য যোগ করা হয়েছে',
      description: `নাম: ${data.applicantName}, জন্মনিবন্ধন নং: ${data.birthRegistrationNo}, সিরিয়াল: #${data.serialNo}, পেন্ডিং টাকা: ${data.pendingMoney}৳`,
      serialNo: data.serialNo,
      applicantName: data.applicantName,
      birthRegistrationNo: data.birthRegistrationNo,
    });

    this.saveToStorage();
    return newRecord;
  }

  public updateRegistration(id: string, updates: Partial<Omit<RegistrationRecord, 'id' | 'createdAt'>>): RegistrationRecord | undefined {
    const index = this.registrations.findIndex((r) => r.id === id);
    if (index === -1) return undefined;

    const oldRecord = this.registrations[index];
    const updatedRecord: RegistrationRecord = {
      ...oldRecord,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.registrations[index] = updatedRecord;

    this.addHistoryLog({
      actionType: 'UPDATE',
      title: 'নিবন্ধন তথ্য আপডেট করা হয়েছে',
      description: `${updatedRecord.applicantName} (সিরিয়াল: #${updatedRecord.serialNo}) এর তথ্য আপডেট করা হয়েছে।`,
      serialNo: updatedRecord.serialNo,
      applicantName: updatedRecord.applicantName,
      birthRegistrationNo: updatedRecord.birthRegistrationNo,
    });

    this.saveToStorage();
    return updatedRecord;
  }

  public toggleDeliveryStatus(id: string): RegistrationRecord | undefined {
    const record = this.registrations.find((r) => r.id === id);
    if (!record) return undefined;

    const newDeliveryStatus = !record.isDelivered;
    record.isDelivered = newDeliveryStatus;
    record.updatedAt = new Date().toISOString();

    this.addHistoryLog({
      actionType: 'DELIVERY',
      title: newDeliveryStatus ? 'ডেলিভারি সম্পন্ন (✅  ডেলিভারি ডান)' : 'ডেলিভারি স্ট্যাটাস পেন্ডিং করা হয়েছে (⏳)',
      description: `${record.applicantName} (সিরিয়াল: #${record.serialNo}) এর স্ট্যাটাস: ${newDeliveryStatus ? 'ডেলিভারি ডান ✅' : 'পেন্ডিং ⏳'}`,
      serialNo: record.serialNo,
      applicantName: record.applicantName,
      birthRegistrationNo: record.birthRegistrationNo,
    });

    this.saveToStorage();
    return record;
  }

  public updatePendingMoney(id: string, newPendingMoney: number): RegistrationRecord | undefined {
    const record = this.registrations.find((r) => r.id === id);
    if (!record) return undefined;

    const oldMoney = record.pendingMoney;
    record.pendingMoney = newPendingMoney;
    record.updatedAt = new Date().toISOString();

    this.addHistoryLog({
      actionType: 'PAYMENT',
      title: 'পেন্ডিং টাকার হিসাব আপডেট',
      description: `${record.applicantName} (সিরিয়াল: #${record.serialNo}) এর পূর্বের বকেয়া ${oldMoney}৳ থেকে পরিবর্তিত হয়ে ${newPendingMoney}৳ করা হয়েছে।`,
      serialNo: record.serialNo,
      applicantName: record.applicantName,
      birthRegistrationNo: record.birthRegistrationNo,
    });

    this.saveToStorage();
    return record;
  }

  public deleteRegistration(id: string): boolean {
    const index = this.registrations.findIndex((r) => r.id === id);
    if (index === -1) return false;

    const deleted = this.registrations[index];
    this.registrations.splice(index, 1);

    this.addHistoryLog({
      actionType: 'DELETE',
      title: 'নিবন্ধন তথ্য মুছে ফেলা হয়েছে',
      description: `সিরিয়াল #${deleted.serialNo} (${deleted.applicantName}) এর তথ্য মুছে ফেলা হয়েছে।`,
      serialNo: deleted.serialNo,
      applicantName: deleted.applicantName,
      birthRegistrationNo: deleted.birthRegistrationNo,
    });

    this.saveToStorage();
    return true;
  }

  public searchRegistrations(query: string): RegistrationRecord[] {
    const cleanQuery = query.trim().toLowerCase();
    if (!cleanQuery) return this.getRegistrations();

    return this.registrations.filter((r) => {
      return (
        r.serialNo.toLowerCase().includes(cleanQuery) ||
        r.birthRegistrationNo.toLowerCase().includes(cleanQuery) ||
        r.applicantName.toLowerCase().includes(cleanQuery) ||
        r.fatherName.toLowerCase().includes(cleanQuery) ||
        r.motherName.toLowerCase().includes(cleanQuery) ||
        r.dateOfBirth.toLowerCase().includes(cleanQuery) ||
        r.pendingMoney.toString().includes(cleanQuery)
      );
    });
  }

  public getDashboardStats(): DashboardStats {
    const totalRegistrations = this.registrations.length;
    const totalPendingMoney = this.registrations.reduce((acc, curr) => acc + (curr.pendingMoney || 0), 0);
    const totalDelivered = this.registrations.filter((r) => r.isDelivered).length;
    const totalPendingDelivery = totalRegistrations - totalDelivered;

    return {
      totalRegistrations,
      totalPendingMoney,
      totalDelivered,
      totalPendingDelivery,
    };
  }

  public getWorkHistory(): WorkHistoryLog[] {
    return [...this.historyLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  private addHistoryLog(logData: Omit<WorkHistoryLog, 'id' | 'timestamp'>): void {
    const newLog: WorkHistoryLog = {
      ...logData,
      id: `hist-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    this.historyLogs.unshift(newLog);
  }
}

export const store = StoreManager.getInstance();
