'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import {
  getRegistrations,
  addRegistration,
  updateRegistration,
  toggleDeliveryStatus,
  updatePendingMoney,
  deleteRegistration,
  getWorkHistoryLogs,
  deleteWorkHistory,
  deleteMultipleWorkHistory,
  clearAllWorkHistory,
  recordVisitor,
  getVisitorStats,
} from '@/app/actions';
import { RegistrationRecord, WorkHistoryLog, DashboardStats, VisitorStats } from '@/lib/types';
import {
  FileText,
  UserPlus,
  Search,
  CircleDollarSign,
  History,
  CheckCircle2,
  Clock,
  PlusCircle,
  Edit,
  Trash2,
  Calendar,
  X,
  Plus,
  Coins,
  Check,
  CheckSquare,
  AlertTriangle,
  Loader2,
  Eye,
  Users,
} from 'lucide-react';

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<
    'all-records' | 'add-record' | 'search' | 'pending-money' | 'history'
  >('all-records');

  const [records, setRecords] = useState<RegistrationRecord[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalRegistrations: 0,
    totalPendingMoney: 0,
    totalDelivered: 0,
    totalPendingDelivery: 0,
  });
  const [historyLogs, setHistoryLogs] = useState<WorkHistoryLog[]>([]);

  // Visitor Tracking State
  const [visitorStats, setVisitorStats] = useState<VisitorStats | null>(null);

  // History Management & Batch Delete States
  const [selectedHistoryIds, setSelectedHistoryIds] = useState<string[]>([]);
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [historyFilterType, setHistoryFilterType] = useState<string>('ALL');
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    isOpen: boolean;
    type: 'single' | 'multiple' | 'all';
    targetId?: string;
    targetTitle?: string;
    count?: number;
  } | null>(null);
  const [isDeletingHistory, setIsDeletingHistory] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RegistrationRecord[]>([]);

  // Form State for Add Registration
  const [formData, setFormData] = useState({
    serialNo: '',
    birthRegistrationNo: '',
    applicantName: '',
    dateOfBirth: '',
    fatherName: '',
    motherName: '',
    pendingMoney: '0',
    isDelivered: false,
  });

  // Edit Modal State
  const [editingRecord, setEditingRecord] = useState<RegistrationRecord | null>(null);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);


  // Compute next auto-generated serial number
  const getNextSerialNo = (currentRecords: RegistrationRecord[]) => {
    if (!currentRecords || currentRecords.length === 0) return 'H-০০১';
    const numericSerials = currentRecords
      .map((r) => {
        // Extract only digits (English or Bengali)
        const digits = r.serialNo.replace(/[^\d০-৯]/g, '');
        // Convert Bengali digits to English digits for parsing
        const englishDigits = digits.replace(/[০-৯]/g, (d) => '০১২৩৪৫৬৭৮৯'.indexOf(d).toString());
        return parseInt(englishDigits, 10);
      })
      .filter((num) => !isNaN(num));

    let nextNum = 1;
    if (numericSerials.length > 0) {
      nextNum = Math.max(...numericSerials) + 1;
    }
    
    const padded = nextNum.toString().padStart(3, '0');
    const banglaPadded = padded.split('').map(d => ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'][parseInt(d)]).join('');
    
    return `H-${banglaPadded}`;
  };

  const refreshData = async () => {
    const regsRes = await getRegistrations();
    const historyRes = await getWorkHistoryLogs();

    if (regsRes.success && regsRes.data) {
      const allRegs = regsRes.data;
      setRecords(allRegs as any);

      const totalRegistrations = allRegs.length;
      const totalPendingMoney = allRegs.reduce((acc, curr) => acc + (curr.pendingMoney || 0), 0);
      const totalDelivered = allRegs.filter((r) => r.isDelivered).length;
      const totalPendingDelivery = totalRegistrations - totalDelivered;
      setStats({ totalRegistrations, totalPendingMoney, totalDelivered, totalPendingDelivery });

      const autoSerial = getNextSerialNo(allRegs as any);
      setFormData((prev) => ({
        ...prev,
        serialNo: prev.serialNo || autoSerial,
      }));

      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        setSearchResults(
          allRegs.filter((r) =>
            r.serialNo.toLowerCase().includes(query) ||
            r.birthRegistrationNo.toLowerCase().includes(query) ||
            r.applicantName.toLowerCase().includes(query) ||
            r.fatherName.toLowerCase().includes(query) ||
            r.motherName.toLowerCase().includes(query) ||
            r.dateOfBirth.toLowerCase().includes(query) ||
            r.pendingMoney.toString().includes(query)
          ) as any
        );
      } else {
        setSearchResults([]);
      }
    }

    if (historyRes.success && historyRes.data) {
      setHistoryLogs(historyRes.data as any);
    }
  };

  useEffect(() => {
    refreshData();

    // Visitor Tracking
    const trackVisitorActivity = async () => {
      try {
        let visitorId = localStorage.getItem('munsur_visitor_id');
        if (!visitorId) {
          visitorId = 'vis_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
          localStorage.setItem('munsur_visitor_id', visitorId);
        }
        const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
        const res = await recordVisitor(visitorId, userAgent);
        if (res.success && res.data) {
          setVisitorStats(res.data);
        }
      } catch (err) {
        console.error('Failed to track visitor:', err);
      }
    };

    trackVisitorActivity();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // History Helper Handlers
  const toggleSelectHistory = (id: string) => {
    setSelectedHistoryIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllVisibleHistory = () => {
    if (selectedHistoryIds.length === filteredHistoryLogs.length && filteredHistoryLogs.length > 0) {
      setSelectedHistoryIds([]);
    } else {
      setSelectedHistoryIds(filteredHistoryLogs.map((l) => l.id));
    }
  };

  const handleOpenSingleDelete = (id: string, title: string) => {
    setDeleteConfirmModal({
      isOpen: true,
      type: 'single',
      targetId: id,
      targetTitle: title,
    });
  };

  const handleOpenMultipleDelete = () => {
    if (selectedHistoryIds.length === 0) return;
    setDeleteConfirmModal({
      isOpen: true,
      type: 'multiple',
      count: selectedHistoryIds.length,
    });
  };

  const handleOpenClearAll = () => {
    if (historyLogs.length === 0) return;
    setDeleteConfirmModal({
      isOpen: true,
      type: 'all',
      count: historyLogs.length,
    });
  };

  const handleExecuteDeleteHistory = async () => {
    if (!deleteConfirmModal) return;
    setIsDeletingHistory(true);
    try {
      if (deleteConfirmModal.type === 'single' && deleteConfirmModal.targetId) {
        const res = await deleteWorkHistory(deleteConfirmModal.targetId);
        if (res.success) {
          setHistoryLogs((prev) => prev.filter((l) => l.id !== deleteConfirmModal.targetId));
          setSelectedHistoryIds((prev) => prev.filter((id) => id !== deleteConfirmModal.targetId));
          showToast('হিস্ট্রি রেকর্ড সফলভাবে মুছে ফেলা হয়েছে! 🗑️');
        } else {
          showToast(res.error || 'হিস্ট্রি মুছতে ব্যর্থ হয়েছে');
        }
      } else if (deleteConfirmModal.type === 'multiple') {
        const res = await deleteMultipleWorkHistory(selectedHistoryIds);
        if (res.success) {
          const deletedSet = new Set(selectedHistoryIds);
          setHistoryLogs((prev) => prev.filter((l) => !deletedSet.has(l.id)));
          setSelectedHistoryIds([]);
          showToast(`${deleteConfirmModal.count}টি হিস্ট্রি রেকর্ড মুছে ফেলা হয়েছে! 🗑️`);
        } else {
          showToast(res.error || 'হিস্ট্রি মুছতে ব্যর্থ হয়েছে');
        }
      } else if (deleteConfirmModal.type === 'all') {
        const res = await clearAllWorkHistory();
        if (res.success) {
          setHistoryLogs([]);
          setSelectedHistoryIds([]);
          showToast('সমস্ত কাজের হিস্ট্রি সফলভাবে মুছে ফেলা হয়েছে! 🧹');
        } else {
          showToast(res.error || 'হিস্ট্রি মুছতে ব্যর্থ হয়েছে');
        }
      }
    } catch (err) {
      console.error('Delete history error:', err);
      showToast('অপ্রত্যাশিত সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsDeletingHistory(false);
      setDeleteConfirmModal(null);
    }
  };


  const handleOpenAddForm = () => {
    const autoSerial = getNextSerialNo(records);
    setFormData({
      serialNo: autoSerial,
      birthRegistrationNo: '',
      applicantName: '',
      dateOfBirth: '',
      fatherName: '',
      motherName: '',
      pendingMoney: '0',
      isDelivered: false,
    });
    setActiveTab('add-record');
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.birthRegistrationNo || !formData.applicantName) {
      showToast('❌ জন্মনিবন্ধন নাম্বার ও নিবন্ধন কারীর নাম পূরণ করুন!');
      return;
    }

    const autoSerial = formData.serialNo || getNextSerialNo(records);

    const res = await addRegistration({
      serialNo: autoSerial,
      birthRegistrationNo: formData.birthRegistrationNo.trim(),
      applicantName: formData.applicantName.trim(),
      dateOfBirth: formData.dateOfBirth || new Date().toISOString().split('T')[0],
      fatherName: formData.fatherName.trim(),
      motherName: formData.motherName.trim(),
      pendingMoney: parseFloat(formData.pendingMoney) || 0,
      isDelivered: formData.isDelivered,
    });

    if (res.success) {
      setFormData({
        serialNo: getNextSerialNo([...records, res.data as any]),
        birthRegistrationNo: '',
        applicantName: '',
        dateOfBirth: '',
        fatherName: '',
        motherName: '',
        pendingMoney: '0',
        isDelivered: false,
      });

      refreshData();
      showToast('✅ নতুন নিবন্ধন সফলভাবে যোগ করা হয়েছে!');
      setActiveTab('all-records');
    } else {
      showToast('❌ তথ্য যোগ করতে সমস্যা হয়েছে!');
    }
  };

  const handleToggleDelivery = async (id: string, name: string) => {
    const res = await toggleDeliveryStatus(id);
    if (res.success && res.data) {
      refreshData();
      showToast(
        res.data.isDelivered
          ? `✅ ${name} - স্ট্যাটাস: ডেলিভারি ডান!`
          : `⏳ ${name} - স্ট্যাটাস: পেন্ডিং করা হয়েছে!`
      );
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`আপনি কি নিশ্চিত যে ${name} এর নিবন্ধন তথ্যটি মুছে ফেলতে চান?`)) {
      const res = await deleteRegistration(id);
      if (res.success) {
        refreshData();
        showToast('🗑️ তথ্য মুছে ফেলা হয়েছে!');
      }
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const cleanQuery = query.trim().toLowerCase();
      setSearchResults(
        records.filter((r) =>
          r.serialNo.toLowerCase().includes(cleanQuery) ||
          r.birthRegistrationNo.toLowerCase().includes(cleanQuery) ||
          r.applicantName.toLowerCase().includes(cleanQuery) ||
          r.fatherName.toLowerCase().includes(cleanQuery) ||
          r.motherName.toLowerCase().includes(cleanQuery) ||
          r.dateOfBirth.toLowerCase().includes(cleanQuery) ||
          r.pendingMoney.toString().includes(cleanQuery)
        )
      );
    } else {
      setSearchResults([]);
    }
  };

  const handleClearMoney = async (id: string, name: string) => {
    const res = await updatePendingMoney(id, 0);
    if (res.success) {
      refreshData();
      showToast(`💰 ${name} এর বকেয়া পরিশোধ সম্পন্ন হয়েছে!`);
    }
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    const res = await updateRegistration(editingRecord.id as string, {
      serialNo: editingRecord.serialNo,
      birthRegistrationNo: editingRecord.birthRegistrationNo,
      applicantName: editingRecord.applicantName,
      dateOfBirth: editingRecord.dateOfBirth,
      fatherName: editingRecord.fatherName,
      motherName: editingRecord.motherName,
      pendingMoney: editingRecord.pendingMoney,
      isDelivered: editingRecord.isDelivered,
    });

    if (res.success) {
      setEditingRecord(null);
      refreshData();
      showToast('✅ তথ্য সফলভাবে আপডেট করা হয়েছে!');
    } else {
      showToast('❌ আপডেট করতে সমস্যা হয়েছে!');
    }
  };

  // Reusable exact 2nd Image Card Component Design for Records
  const RecordCard = ({ item }: { item: RegistrationRecord }) => (
    <div className="bg-white rounded-2xl p-5 md:p-6 border border-emerald-400 shadow-sm hover:shadow-md transition-all space-y-4">
      {/* Top Row: Serial & Delivery Status Badge */}
      <div className="flex items-center justify-between">
        <span className="bg-slate-100 text-slate-800 font-mono font-bold text-xs px-3.5 py-1 rounded-md border border-slate-200">
          সিরিয়াল: #{item.serialNo}
        </span>

        {item.isDelivered ? (
          <span className="bg-emerald-600 text-white text-xs font-bold px-3.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
            <CheckCircle2 className="w-4 h-4" />
            ✅  ডেলিভারি ডান
          </span>
        ) : (
          <span className="bg-amber-500 text-slate-950 text-xs font-bold px-3.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
            <Clock className="w-4 h-4" />
            ⏳  পেন্ডিং
          </span>
        )}
      </div>

      {/* Applicant Name & Birth Reg No */}
      <div>
        <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">{item.applicantName}</h3>
        <p className="text-emerald-700 font-bold text-sm font-mono mt-0.5">
          জন্মনিবন্ধন নং: <span className="tracking-wider">{item.birthRegistrationNo}</span>
        </p>
      </div>

      {/* Inner 2-column info box */}
      <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs md:text-sm">
        <div className="space-y-1.5">
          <p className="text-slate-800 font-bold">
            জন্ম তারিখ: <span className="font-mono font-normal text-slate-700">{item.dateOfBirth}</span>
          </p>
          <p className="text-slate-800 font-bold">
            পিতার নাম: <span className="font-normal text-slate-700">{item.fatherName}</span>
          </p>
        </div>
        <div className="space-y-1.5">
          <p className="text-slate-800 font-bold">
            পেন্ডিং টাকা: <span className="font-mono font-bold text-amber-900">৳{item.pendingMoney}</span>
          </p>
          <p className="text-slate-800 font-bold">
            মাতার নাম: <span className="font-normal text-slate-700">{item.motherName}</span>
          </p>
        </div>
      </div>

      {/* Bottom Action Row */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={() => handleToggleDelivery(item.id, item.applicantName)}
          className={`px-4 py-1.5 rounded-full font-bold text-xs transition shadow-sm ${
            item.isDelivered
              ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
              : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }`}
        >
          {item.isDelivered ? 'পেন্ডিং করুন' : '✅  ডেলিভারি ডান করুন'}
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setEditingRecord(item)}
            className="text-xs font-bold text-slate-700 hover:text-slate-950 underline"
          >
            তথ্য এডিট করুন
          </button>
          <button
            onClick={() => handleDelete(item.id, item.applicantName)}
            className="text-rose-600 hover:text-rose-800 p-1"
            title="মুছে ফেলুন"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  // Filtered history logs based on search and actionType filter
  const filteredHistoryLogs = historyLogs.filter((log) => {
    if (historyFilterType !== 'ALL' && log.actionType !== historyFilterType) {
      return false;
    }
    if (historySearchQuery.trim()) {
      const q = historySearchQuery.trim().toLowerCase();
      const titleMatch = log.title?.toLowerCase().includes(q);
      const descMatch = log.description?.toLowerCase().includes(q);
      const serialMatch = log.serialNo?.toLowerCase().includes(q);
      const nameMatch = log.applicantName?.toLowerCase().includes(q);
      const regMatch = log.birthRegistrationNo?.toLowerCase().includes(q);
      return Boolean(titleMatch || descMatch || serialMatch || nameMatch || regMatch);
    }
    return true;
  });

  // Work History Card Component with Single & Batch Delete Support
  const HistoryCard = ({ log }: { log: WorkHistoryLog }) => {
    const isSelected = selectedHistoryIds.includes(log.id);

    return (
      <div
        className={`rounded-2xl p-5 md:p-6 transition-all duration-200 space-y-4 border relative ${
          isSelected
            ? 'bg-emerald-50/80 border-emerald-500 shadow-md ring-2 ring-emerald-400/50'
            : 'bg-white border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-300'
        }`}
      >
        {/* Top Row: Checkbox, Serial/ID & Action Type Badge & Single Delete Button */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            {/* Checkbox for batch select */}
            <button
              type="button"
              onClick={() => toggleSelectHistory(log.id)}
              className={`w-5 h-5 rounded-md flex items-center justify-center transition border ${
                isSelected
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                  : 'border-slate-300 bg-white hover:border-emerald-500'
              }`}
              title={isSelected ? 'আনসিলেক্ট করুন' : 'সিলেক্ট করুন'}
            >
              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </button>

            <span className="bg-slate-100 text-slate-800 font-mono font-bold text-xs px-3 py-1 rounded-md border border-slate-200">
              সিরিয়াল: #{log.serialNo || 'লগ'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {log.actionType === 'DELIVERY' ? (
              <span className="bg-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                <CheckCircle2 className="w-3.5 h-3.5" />
                ডেলিভারি ডান
              </span>
            ) : log.actionType === 'ADD' ? (
              <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                <Plus className="w-3.5 h-3.5" />
                নিবন্ধন যোগ
              </span>
            ) : log.actionType === 'PAYMENT' ? (
              <span className="bg-amber-500 text-slate-950 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                <Coins className="w-3.5 h-3.5" />
                টাকা আপডেট
              </span>
            ) : log.actionType === 'DELETE' ? (
              <span className="bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                <Trash2 className="w-3.5 h-3.5" />
                মুছে ফেলা
              </span>
            ) : (
              <span className="bg-slate-700 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                <Clock className="w-3.5 h-3.5" />
                আপডেট
              </span>
            )}

            {/* Single Delete Button */}
            <button
              onClick={() => handleOpenSingleDelete(log.id, log.title)}
              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition border border-transparent hover:border-rose-200"
              title="এই হিস্ট্রি মুছে ফেলুন"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Title & Citizen Info */}
        <div>
          <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">{log.title}</h3>
          {log.birthRegistrationNo && (
            <p className="text-emerald-700 font-bold text-sm font-mono mt-0.5">
              জন্মনিবন্ধন নং: <span className="tracking-wider">{log.birthRegistrationNo}</span>
            </p>
          )}
        </div>

        {/* Inner Description & Timestamp Box */}
        <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-4 my-3 text-xs md:text-sm space-y-2">
          <p className="text-slate-800 font-medium leading-relaxed">
            <strong className="text-slate-900">বিবরণ:</strong> {log.description}
          </p>
          <p className="text-slate-600 font-mono text-xs flex items-center gap-1.5 pt-1 border-t border-slate-200/60">
            <Calendar className="w-3.5 h-3.5 text-emerald-700" />
            <strong className="text-slate-800">সম্পন্ন হওয়ার সময়:</strong>{' '}
            {new Date(log.timestamp).toLocaleString('bn-BD')}
          </p>
        </div>

        {/* Bottom Row */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <span className="text-slate-500 font-bold">
            স্ট্যাটাস: <span className="text-emerald-700">সফলভাবে রেকর্ড করা হয়েছে</span>
          </span>
          {log.applicantName && (
            <span className="font-bold text-slate-800">
              আবেদনকারী: <span className="text-emerald-800">{log.applicantName}</span>
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Official Header */}
      <Header visitorStats={visitorStats || undefined} />


      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-emerald-500/50 flex items-center gap-2 animate-bounce text-sm font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Tabs Bar */}
      <div className="bg-emerald-950 text-white border-b border-emerald-900 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap gap-2 py-2.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('all-records')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs md:text-sm transition ${
              activeTab === 'all-records'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-emerald-200 hover:bg-emerald-900/60'
            }`}
          >
            <FileText className="w-4 h-4" />
            মোট নিবন্ধন তথ্য ({stats.totalRegistrations})
          </button>

          <button
            onClick={handleOpenAddForm}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs md:text-sm transition ${
              activeTab === 'add-record'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-emerald-200 hover:bg-emerald-900/60'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            নিবন্ধন যোগ
          </button>

          <button
            onClick={() => setActiveTab('search')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs md:text-sm transition ${
              activeTab === 'search'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-emerald-200 hover:bg-emerald-900/60'
            }`}
          >
            <Search className="w-4 h-4" />
            নিবন্ধন অনুসন্ধান
          </button>

          <button
            onClick={() => setActiveTab('pending-money')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs md:text-sm transition ${
              activeTab === 'pending-money'
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-amber-300 hover:bg-emerald-900/60'
            }`}
          >
            <CircleDollarSign className="w-4 h-4" />
            মোট পেন্ডিং টাকা (৳{stats.totalPendingMoney})
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs md:text-sm transition ${
              activeTab === 'history'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-emerald-200 hover:bg-emerald-900/60'
            }`}
          >
            <History className="w-4 h-4" />
            কাজের হিস্ট্রি ({historyLogs.length})
          </button>
        </div>
      </div>

      {/* Main Single Panel Body */}
      <main className="max-w-7xl mx-auto px-4 py-8 flex-1 w-full space-y-6">

        {/* TAB 1: ALL REGISTRATION RECORDS */}
        {activeTab === 'all-records' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">মোট নিবন্ধন তথ্য</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  মোট নিবন্ধন: {stats.totalRegistrations} টি | ডেলিভারি ডান: {stats.totalDelivered} টি | পেন্ডিং: {stats.totalPendingDelivery} টি
                </p>
              </div>

              <button
                onClick={handleOpenAddForm}
                className="bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-xl font-bold text-xs shadow flex items-center gap-1.5"
              >
                <PlusCircle className="w-4 h-4" />
                + নিবন্ধন যোগ করুন
              </button>
            </div>

            {/* List of Cards styled as 2nd image */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {records.map((item) => (
                <RecordCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: ADD REGISTRATION */}
        {activeTab === 'add-record' && (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-lg p-6 md:p-8 space-y-6">
            <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-900">নতুন নিবন্ধন যোগ করুন</h2>
                <p className="text-xs text-slate-500">সিরিয়াল নাম্বারটি সংক্রিয়ভাবে জেনারেট হয়েছে</p>
              </div>
              <span className="bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full text-xs font-mono font-bold">
                সিরিয়াল: #{formData.serialNo}
              </span>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs md:text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ১. সিরিয়াল নাম্বার (অটোমেটিক)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.serialNo}
                    onChange={(e) => setFormData({ ...formData, serialNo: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50 font-mono font-bold text-emerald-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ২. জন্মনিবন্ধন নাম্বার <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="১৭ ডিজিটের জন্মনিবন্ধন নম্বর"
                    value={formData.birthRegistrationNo}
                    onChange={(e) =>
                      setFormData({ ...formData, birthRegistrationNo: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono font-bold text-emerald-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    ৩. নিবন্ধন কারীর নাম <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="আবেদনকারীর পুরো নাম"
                    value={formData.applicantName}
                    onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">৪. জন্ম তারিখ</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">৫. বাবার নাম</label>
                  <input
                    type="text"
                    placeholder="পিতার নাম"
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">৬. মাতার নাম</label>
                  <input
                    type="text"
                    placeholder="মাতার নাম"
                    value={formData.motherName}
                    onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">৭. পেন্ডিং টাকা (৳)</label>
                  <input
                    type="number"
                    placeholder="যেমন: ২৫০"
                    value={formData.pendingMoney}
                    onChange={(e) => setFormData({ ...formData, pendingMoney: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold font-mono text-amber-900"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isDelivered"
                    checked={formData.isDelivered}
                    onChange={(e) => setFormData({ ...formData, isDelivered: e.target.checked })}
                    className="w-5 h-5 accent-emerald-600 cursor-pointer"
                  />
                  <label htmlFor="isDelivered" className="font-bold text-slate-800 cursor-pointer">
                    ৮. ডেলিভারি সম্পন্ন (✅  ডেলিভারি ডান)
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('all-records')}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: UNIVERSAL SEARCH */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h2 className="text-xl font-bold text-slate-900">নিবন্ধন অনুসন্ধান</h2>
              <p className="text-xs text-slate-500">
                জন্মনিবন্ধন নাম্বার, নাম, বাবার নাম, মাতার নাম বা সিরিয়াল নাম্বার টাইপ করুন
              </p>

              <div className="flex flex-col md:flex-row gap-3 max-w-2xl">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="যে কোনো তথ্য টাইপ করে সার্চ করুন..."
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm font-medium"
                  />
                </div>
                <button
                  onClick={() => handleSearchChange(searchQuery)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow flex items-center justify-center gap-2 transition"
                >
                  <Search className="w-4 h-4" />
                  অনুসন্ধান করুন
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {searchQuery.trim() === '' ? (
                <div className="bg-white p-8 rounded-2xl text-center text-slate-500 font-bold text-sm border border-slate-200">
                  👆 উপরে আপনার প্রয়োজনীয় তথ্য টাইপ করে অনুসন্ধান করুন
                </div>
              ) : (
                <>
                  <p className="text-xs font-bold text-slate-600">
                    অনুসন্ধানের ফলাফল: {searchResults.length} টি পাওয়া গেছে
                  </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {searchResults.map((item) => (
                  <RecordCard key={item.id} item={item} />
                ))}
                {searchResults.length === 0 && (
                  <div className="col-span-1 md:col-span-2 text-center text-rose-500 font-bold py-8 border border-rose-200 bg-rose-50 rounded-2xl">
                    কোনো ফলাফল পাওয়া যায়নি!
                  </div>
                )}
              </div>
              </>
            )}
            </div>
          </div>
        )}


        {/* TAB 4: PENDING MONEY */}
        {activeTab === 'pending-money' && (
          <div className="space-y-6">
            <div className="bg-amber-500 text-slate-950 p-6 rounded-2xl shadow flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black">মোট পেন্ডিং টাকা (৳)</h2>
                <p className="text-xs font-medium text-slate-900">
                  যেসব নিবন্ধনের বকেয়া টাকা এখনো বাকি রয়েছে
                </p>
              </div>
              <div className="bg-slate-950 text-amber-400 font-mono font-black text-2xl px-5 py-2.5 rounded-xl">
                ৳{stats.totalPendingMoney}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {records
                .filter((r) => r.pendingMoney > 0)
                .map((item) => (
                  <div key={item.id} className="space-y-2">
                    <RecordCard item={item} />
                    <button
                      onClick={() => handleClearMoney(item.id, item.applicantName)}
                      className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow"
                    >
                      ৳ পরিশোধ সম্পন্ন করুন (০ ৳ করুন)
                    </button>
                  </div>
                ))}

              {records.filter((r) => r.pendingMoney > 0).length === 0 && (
                <div className="col-span-2 bg-white p-8 rounded-2xl text-center text-emerald-800 font-bold text-sm border border-slate-200">
                  🎉 কোনো বকেয়া বা পেন্ডিং টাকা অবশিষ্ট নেই!
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: WORK HISTORY LOG - WITH SINGLE, MULTIPLE & CLEAR ALL DELETE */}
        {activeTab === 'history' && (
          <div className="space-y-5">
            {/* Control Header Box */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl font-extrabold text-slate-900">কাজের হিস্ট্রি (Work History Log)</h2>
                    <span className="bg-blue-100 text-blue-900 px-3 py-0.5 rounded-full text-xs font-bold font-mono">
                      মোট: {historyLogs.length} টি
                    </span>
                    {filteredHistoryLogs.length !== historyLogs.length && (
                      <span className="bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full text-[11px] font-bold">
                        ফলাফল: {filteredHistoryLogs.length} টি
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    সিস্টেমের কার্যক্রমের বিবরণ, সিঙ্গেল ও একাধিক হিস্ট্রি ডিলিট সুবিধা
                  </p>
                </div>

                {/* Global Action Toolbar */}
                <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
                  {/* Select All Toggle */}
                  {filteredHistoryLogs.length > 0 && (
                    <button
                      type="button"
                      onClick={handleSelectAllVisibleHistory}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition shadow-sm"
                    >
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
                      {selectedHistoryIds.length === filteredHistoryLogs.length && filteredHistoryLogs.length > 0
                        ? 'সব আনসিলেক্ট করুন'
                        : 'সব সিলেক্ট করুন'}
                    </button>
                  )}

                  {/* Batch Delete Selected */}
                  {selectedHistoryIds.length > 0 && (
                    <button
                      type="button"
                      onClick={handleOpenMultipleDelete}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 shadow transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      নির্বাচিত ({selectedHistoryIds.length}) মুছুন
                    </button>
                  )}

                  {/* Delete All History Button */}
                  {historyLogs.length > 0 && (
                    <button
                      type="button"
                      onClick={handleOpenClearAll}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold border border-rose-300 bg-rose-50/60 hover:bg-rose-100 text-rose-700 flex items-center gap-1.5 transition ml-auto md:ml-0"
                      title="সমস্ত কাজের হিস্ট্রি স্থায়ীভাবে মুছে ফেলুন"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      সব মুছুন (Clear All)
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Chips & Search Bar */}
              <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row gap-3 justify-between items-center">
                {/* Search input for history */}
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="হিস্ট্রি খুঁজুন (নাম, সিরিয়াল, বিবরণ)..."
                    value={historySearchQuery}
                    onChange={(e) => setHistorySearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  {historySearchQuery && (
                    <button
                      type="button"
                      onClick={() => setHistorySearchQuery('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Action Type Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 text-xs">
                  <span className="text-slate-500 text-[11px] font-bold whitespace-nowrap hidden sm:inline">ফিল্টার:</span>
                  {[
                    { id: 'ALL', label: 'সব' },
                    { id: 'DELIVERY', label: '✅ ডেলিভারি ডান' },
                    { id: 'ADD', label: '➕ নতুন যোগ' },
                    { id: 'PAYMENT', label: '💰 টাকা আপডেট' },
                    { id: 'UPDATE', label: '✏️ তথ্য আপডেট' },
                    { id: 'DELETE', label: '🗑️ মুছে ফেলা' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setHistoryFilterType(tab.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                        historyFilterType === tab.id
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sticky Floating Bar when items are selected */}
            {selectedHistoryIds.length > 0 && (
              <div className="bg-emerald-950 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center justify-between gap-4 border border-emerald-700/60 sticky top-16 z-20">
                <div className="flex items-center gap-3">
                  <span className="bg-emerald-600 text-white font-mono font-bold text-xs px-2.5 py-1 rounded-lg">
                    {selectedHistoryIds.length}
                  </span>
                  <span className="text-xs md:text-sm font-semibold text-emerald-100">
                    টি হিস্ট্রি রেকর্ড নির্বাচন করা হয়েছে
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedHistoryIds([])}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-emerald-200 hover:text-white hover:bg-emerald-900/60 transition"
                  >
                    নির্বাচন বাতিল
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenMultipleDelete}
                    className="px-4 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white flex items-center gap-1.5 shadow transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    নির্বাচিতগুলো মুছুন
                  </button>
                </div>
              </div>
            )}

            {/* History Cards Grid or Empty State */}
            {filteredHistoryLogs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredHistoryLogs.map((log) => (
                  <HistoryCard key={log.id} log={log} />
                ))}
              </div>
            ) : (
              <div className="bg-white p-12 rounded-2xl text-center border border-slate-200 space-y-3">
                <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                  <History className="w-6 h-6" />
                </div>
                <p className="text-slate-800 font-bold text-base">কোনো কাজের হিস্ট্রি পাওয়া যায়নি!</p>
                <p className="text-slate-500 text-xs">
                  {historySearchQuery || historyFilterType !== 'ALL'
                    ? 'আপনার অনুসন্ধান বা ফিল্টারের সাথে মিলে এমন কোনো হিস্ট্রি পাওয়া যায়নি।'
                    : 'সিস্টেমে কোনো নতুন কাজ সম্পন্ন হলে তা স্বয়ংক্রিয়ভাবে এখানে যুক্ত হবে।'}
                </p>
                {(historySearchQuery || historyFilterType !== 'ALL') && (
                  <button
                    type="button"
                    onClick={() => {
                      setHistorySearchQuery('');
                      setHistoryFilterType('ALL');
                    }}
                    className="px-4 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-xl hover:bg-emerald-100 border border-emerald-200"
                  >
                    সব ফিল্টার রিসেট করুন
                  </button>
                )}
              </div>
            )}
          </div>
        )}


      </main>

      {/* Edit Record Modal */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold text-slate-900">নিবন্ধন তথ্য এডিট করুন</h3>
              <button
                onClick={() => setEditingRecord(null)}
                className="p-1 text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSave} className="space-y-4 text-xs md:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">সিরিয়াল</label>
                  <input
                    type="text"
                    value={editingRecord.serialNo}
                    onChange={(e) =>
                      setEditingRecord({ ...editingRecord, serialNo: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">জন্মনিবন্ধন নং</label>
                  <input
                    type="text"
                    value={editingRecord.birthRegistrationNo}
                    onChange={(e) =>
                      setEditingRecord({ ...editingRecord, birthRegistrationNo: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-emerald-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">নিবন্ধন কারীর নাম</label>
                  <input
                    type="text"
                    value={editingRecord.applicantName}
                    onChange={(e) =>
                      setEditingRecord({ ...editingRecord, applicantName: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">জন্ম তারিখ</label>
                  <input
                    type="date"
                    value={editingRecord.dateOfBirth}
                    onChange={(e) =>
                      setEditingRecord({ ...editingRecord, dateOfBirth: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">পিতার নাম</label>
                  <input
                    type="text"
                    value={editingRecord.fatherName}
                    onChange={(e) =>
                      setEditingRecord({ ...editingRecord, fatherName: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">মাতার নাম</label>
                  <input
                    type="text"
                    value={editingRecord.motherName}
                    onChange={(e) =>
                      setEditingRecord({ ...editingRecord, motherName: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">পেন্ডিং টাকা (৳)</label>
                  <input
                    type="number"
                    value={editingRecord.pendingMoney}
                    onChange={(e) =>
                      setEditingRecord({
                        ...editingRecord,
                        pendingMoney: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold font-mono text-amber-900"
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="modalDelivered"
                    checked={editingRecord.isDelivered}
                    onChange={(e) =>
                      setEditingRecord({ ...editingRecord, isDelivered: e.target.checked })
                    }
                    className="w-4 h-4 accent-emerald-600"
                  />
                  <label htmlFor="modalDelivered" className="font-bold text-slate-800 cursor-pointer">
                    ✅  ডেলিভারি ডান
                  </label>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-4 py-1.5 rounded-xl border text-slate-600 font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 rounded-xl bg-emerald-700 text-white font-bold shadow"
                >
                  আপডেট করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Work History Delete Confirmation Modal */}
      {deleteConfirmModal && deleteConfirmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0 shadow-inner">
                <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {deleteConfirmModal.type === 'single'
                    ? 'হিস্ট্রি রেকর্ড মুছে ফেলা'
                    : deleteConfirmModal.type === 'multiple'
                    ? `নির্বাচিত (${deleteConfirmModal.count}) হিস্ট্রি মুছবেন?`
                    : 'সমস্ত কাজের হিস্ট্রি মুছবেন?'}
                </h3>
                <p className="text-xs text-slate-500">
                  {deleteConfirmModal.type === 'all'
                    ? 'চূড়ান্ত সতর্কতা! এটি অপরিবর্তনযোগ্য'
                    : 'মুছে ফেলার পর তথ্যটি ডেটাবেজ থেকে মুছে যাবে'}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-4 text-xs md:text-sm text-slate-700 leading-relaxed border border-slate-100">
              {deleteConfirmModal.type === 'single' && (
                <p>
                  আপনি কি নিশ্চিত যে <strong className="text-slate-900 font-bold">"{deleteConfirmModal.targetTitle}"</strong> এর হিস্ট্রি রেকর্ডটি স্থায়ীভাবে মুছে ফেলতে চান?
                </p>
              )}
              {deleteConfirmModal.type === 'multiple' && (
                <p>
                  আপনি কি নিশ্চিত যে আপনি নির্বাচিত <strong className="text-rose-600 font-bold">{deleteConfirmModal.count}টি</strong> কাজের হিস্ট্রি রেকর্ড স্থায়ীভাবে মুছে ফেলতে চান?
                </p>
              )}
              {deleteConfirmModal.type === 'all' && (
                <div className="space-y-1.5 text-rose-700">
                  <p className="font-bold flex items-center gap-1.5 text-rose-800">
                    <Trash2 className="w-4 h-4" /> সতর্কবাণী:
                  </p>
                  <p>
                    সিস্টেমের মোট <strong className="font-black text-rose-900">{deleteConfirmModal.count}টি</strong> সকল হিস্ট্রি রেকর্ড পুরোপুরি মুছে দেওয়া হবে। আপনি কি নিশ্চিতভাবে এটি সম্পন্ন করতে চান?
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end gap-2.5">
              <button
                type="button"
                disabled={isDeletingHistory}
                onClick={() => setDeleteConfirmModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition"
              >
                বাতিল করুন
              </button>
              <button
                type="button"
                disabled={isDeletingHistory}
                onClick={handleExecuteDeleteHistory}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md flex items-center gap-2 transition disabled:opacity-50"
              >
                {isDeletingHistory ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    মুছে ফেলা হচ্ছে...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    হ্যাঁ, মুছে ফেলুন
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-4 border-t border-slate-800 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div>
            <strong>Munsur Union Service</strong> — রাতইল ইউনিয়ন পরিষদ, কাশিয়ানী উপজেলা, গোপালগঞ্জ জেলা।
          </div>
          <div>
            পরিচালনায়: <strong className="text-white">মোঃ মনসুর হোসেন</strong> | মোবাইল:{' '}
            <a href="tel:+8801571214406" className="text-amber-400 font-bold underline">
              +880 1571-214406
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
