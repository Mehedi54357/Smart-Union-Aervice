'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getRegistrations() {
  try {
    const records = await prisma.registration.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: records };
  } catch (error) {
    console.error('Failed to get registrations:', error);
    return { success: false, data: [] };
  }
}

export async function addRegistration(data: {
  serialNo: string;
  birthRegistrationNo: string;
  applicantName: string;
  dateOfBirth: string;
  fatherName: string;
  motherName: string;
  pendingMoney: number;
  isDelivered: boolean;
}) {
  try {
    const record = await prisma.registration.create({
      data: {
        ...data,
      },
    });

    await prisma.workHistory.create({
      data: {
        actionType: 'ADD',
        title: 'নতুন জন্মনিবন্ধন তথ্য যোগ করা হয়েছে',
        description: `নাম: ${data.applicantName}, জন্মনিবন্ধন নং: ${data.birthRegistrationNo}, সিরিয়াল: #${data.serialNo}, পেন্ডিং টাকা: ${data.pendingMoney}৳`,
        serialNo: data.serialNo,
        applicantName: data.applicantName,
        birthRegistrationNo: data.birthRegistrationNo,
      },
    });

    revalidatePath('/');
    return { success: true, data: record };
  } catch (error) {
    console.error('Failed to add registration:', error);
    return { success: false, error: 'Failed to add registration' };
  }
}

export async function updateRegistration(
  id: string,
  data: {
    serialNo: string;
    birthRegistrationNo: string;
    applicantName: string;
    dateOfBirth: string;
    fatherName: string;
    motherName: string;
    pendingMoney: number;
    isDelivered: boolean;
  }
) {
  try {
    const updated = await prisma.registration.update({
      where: { id },
      data,
    });

    await prisma.workHistory.create({
      data: {
        actionType: 'UPDATE',
        title: 'নিবন্ধন তথ্য আপডেট করা হয়েছে',
        description: `${updated.applicantName} (সিরিয়াল: #${updated.serialNo}) এর তথ্য আপডেট করা হয়েছে।`,
        serialNo: updated.serialNo,
        applicantName: updated.applicantName,
        birthRegistrationNo: updated.birthRegistrationNo,
      },
    });

    revalidatePath('/');
    return { success: true, data: updated };
  } catch (error) {
    console.error('Failed to update registration:', error);
    return { success: false, error: 'Failed to update registration' };
  }
}

export async function toggleDeliveryStatus(id: string) {
  try {
    const record = await prisma.registration.findUnique({ where: { id } });
    if (!record) return { success: false, error: 'Record not found' };

    const newStatus = !record.isDelivered;
    const updated = await prisma.registration.update({
      where: { id },
      data: { isDelivered: newStatus },
    });

    await prisma.workHistory.create({
      data: {
        actionType: 'DELIVERY',
        title: newStatus ? 'ডেলিভারি সম্পন্ন (✅  ডেলিভারি ডান)' : 'ডেলিভারি স্ট্যাটাস পেন্ডিং করা হয়েছে (⏳)',
        description: `${record.applicantName} (সিরিয়াল: #${record.serialNo}) এর স্ট্যাটাস: ${newStatus ? 'ডেলিভারি ডান ✅' : 'পেন্ডিং ⏳'}`,
        serialNo: record.serialNo,
        applicantName: record.applicantName,
        birthRegistrationNo: record.birthRegistrationNo,
      },
    });

    revalidatePath('/');
    return { success: true, data: updated };
  } catch (error) {
    console.error('Failed to toggle delivery:', error);
    return { success: false, error: 'Failed to toggle delivery' };
  }
}

export async function updatePendingMoney(id: string, newPendingMoney: number) {
  try {
    const record = await prisma.registration.findUnique({ where: { id } });
    if (!record) return { success: false, error: 'Record not found' };

    const oldMoney = record.pendingMoney;
    const updated = await prisma.registration.update({
      where: { id },
      data: { pendingMoney: newPendingMoney },
    });

    await prisma.workHistory.create({
      data: {
        actionType: 'PAYMENT',
        title: 'পেন্ডিং টাকার হিসাব আপডেট',
        description: `${record.applicantName} (সিরিয়াল: #${record.serialNo}) এর পূর্বের বকেয়া ${oldMoney}৳ থেকে পরিবর্তিত হয়ে ${newPendingMoney}৳ করা হয়েছে।`,
        serialNo: record.serialNo,
        applicantName: record.applicantName,
        birthRegistrationNo: record.birthRegistrationNo,
      },
    });

    revalidatePath('/');
    return { success: true, data: updated };
  } catch (error) {
    console.error('Failed to update pending money:', error);
    return { success: false, error: 'Failed to update pending money' };
  }
}

export async function deleteRegistration(id: string) {
  try {
    const deleted = await prisma.registration.delete({
      where: { id },
    });

    await prisma.workHistory.create({
      data: {
        actionType: 'DELETE',
        title: 'নিবন্ধন তথ্য মুছে ফেলা হয়েছে',
        description: `সিরিয়াল #${deleted.serialNo} (${deleted.applicantName}) এর তথ্য মুছে ফেলা হয়েছে।`,
        serialNo: deleted.serialNo,
        applicantName: deleted.applicantName,
        birthRegistrationNo: deleted.birthRegistrationNo,
      },
    });

    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete registration:', error);
    return { success: false, error: 'Failed to delete' };
  }
}

export async function getWorkHistoryLogs() {
  try {
    const logs = await prisma.workHistory.findMany({
      orderBy: { timestamp: 'desc' },
    });
    return { success: true, data: logs };
  } catch (error) {
    console.error('Failed to get history logs:', error);
    return { success: false, data: [] };
  }
}

export async function deleteWorkHistory(id: string) {
  try {
    await prisma.workHistory.delete({
      where: { id },
    });
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete work history item:', error);
    return { success: false, error: 'হিস্ট্রি রেকর্ড মুছতে ব্যর্থ হয়েছে।' };
  }
}

export async function deleteMultipleWorkHistory(ids: string[]) {
  try {
    if (!ids || ids.length === 0) return { success: false, error: 'কোনো হিস্ট্রি নির্বাচন করা হয়নি।' };
    await prisma.workHistory.deleteMany({
      where: {
        id: { in: ids },
      },
    });
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete multiple work history:', error);
    return { success: false, error: 'নির্বাচিত হিস্ট্রি রেকর্ডগুলো মুছতে ব্যর্থ হয়েছে।' };
  }
}

export async function clearAllWorkHistory() {
  try {
    await prisma.workHistory.deleteMany({});
    revalidatePath('/');
    return { success: true };
  } catch (error) {
    console.error('Failed to clear work history:', error);
    return { success: false, error: 'সমস্ত হিস্ট্রি মুছতে ব্যর্থ হয়েছে।' };
  }
}

export async function recordVisitor(visitorId: string, userAgent?: string) {
  try {
    if (visitorId) {
      await prisma.visitorLog.create({
        data: {
          visitorId,
          userAgent: userAgent || '',
          path: '/',
        },
      });
    }

    return await getVisitorStats();
  } catch (error) {
    console.error('Failed to record visitor:', error);
    return { success: false, data: { totalVisits: 0, uniqueVisitors: 0, todayVisits: 0 } };
  }
}

export async function getVisitorStats() {
  try {
    const totalVisits = await prisma.visitorLog.count();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayVisits = await prisma.visitorLog.count({
      where: {
        timestamp: {
          gte: startOfToday,
        },
      },
    });

    const uniqueVisitorRecords = await prisma.visitorLog.findMany({
      select: { visitorId: true },
      distinct: ['visitorId'],
    });

    return {
      success: true,
      data: {
        totalVisits,
        uniqueVisitors: uniqueVisitorRecords.length,
        todayVisits,
      },
    };
  } catch (error) {
    console.error('Failed to get visitor stats:', error);
    return {
      success: false,
      data: {
        totalVisits: 0,
        uniqueVisitors: 0,
        todayVisits: 0,
      },
    };
  }
}

