'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import { store } from '@/lib/store';
import { RegistrationRecord, WorkHistoryLog, DashboardStats } from '@/lib/types';
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
  Coins
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

  const refreshData = () => {
    const allRegs = store.getRegistrations();
    setRecords(allRegs);
    setStats(store.getDashboardStats());
    setHistoryLogs(store.getWorkHistory());
    if (searchQuery.trim()) {
      setSearchResults(store.searchRegistrations(searchQuery));
    } else {
      setSearchResults(allRegs);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.birthRegistrationNo || !formData.applicantName) {
      showToast('❌ জন্মনিবন্ধন নাম্বার ও নিবন্ধন কারীর নাম পূরণ করুন!');
      return;
    }

    store.addRegistration({
      serialNo: formData.serialNo || `${1000 + records.length + 1}`,
      birthRegistrationNo: formData.birthRegistrationNo.trim(),
      applicantName: formData.applicantName.trim(),
      dateOfBirth: formData.dateOfBirth || new Date().toISOString().split('T')[0],
      fatherName: formData.fatherName.trim(),
      motherName: formData.motherName.trim(),
      pendingMoney: parseFloat(formData.pendingMoney) || 0,
      isDelivered: formData.isDelivered,
    });

    setFormData({
      serialNo: '',
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
  };

  const handleToggleDelivery = (id: string, name: string) => {
    const updated = store.toggleDeliveryStatus(id);
    refreshData();
    if (updated) {
      showToast(
        updated.isDelivered
          ? `✅ ${name} - স্ট্যাটাস: ডেলিভারি ডান!`
          : `⏳ ${name} - স্ট্যাটাস: পেন্ডিং করা হয়েছে!`
      );
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`আপনি কি নিশ্চিত যে ${name} এর নিবন্ধন তথ্যটি মুছে ফেলতে চান?`)) {
      store.deleteRegistration(id);
      refreshData();
      showToast('🗑️ তথ্য মুছে ফেলা হয়েছে!');
    }
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setSearchResults(store.searchRegistrations(query));
    } else {
      setSearchResults(records);
    }
  };

  const handleClearMoney = (id: string, name: string) => {
    store.updatePendingMoney(id, 0);
    refreshData();
    showToast(`💰 ${name} এর বকেয়া পরিশোধ সম্পন্ন হয়েছে!`);
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    store.updateRegistration(editingRecord.id, {
      serialNo: editingRecord.serialNo,
      birthRegistrationNo: editingRecord.birthRegistrationNo,
      applicantName: editingRecord.applicantName,
      dateOfBirth: editingRecord.dateOfBirth,
      fatherName: editingRecord.fatherName,
      motherName: editingRecord.motherName,
      pendingMoney: editingRecord.pendingMoney,
      isDelivered: editingRecord.isDelivered,
    });

    setEditingRecord(null);
    refreshData();
    showToast('✅ তথ্য সফলভাবে আপডেট করা হয়েছে!');
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

  // Work History Card Component matching 2nd image design format
  const HistoryCard = ({ log }: { log: WorkHistoryLog }) => (
    <div className="bg-white rounded-2xl p-5 md:p-6 border border-emerald-400 shadow-sm hover:shadow-md transition-all space-y-4">
      {/* Top Row: Serial/ID & Action Type Badge */}
      <div className="flex items-center justify-between">
        <span className="bg-slate-100 text-slate-800 font-mono font-bold text-xs px-3.5 py-1 rounded-md border border-slate-200">
          সিরিয়াল: #{log.serialNo || 'লগ'}
        </span>

        {log.actionType === 'DELIVERY' ? (
          <span className="bg-emerald-600 text-white text-xs font-bold px-3.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
            <CheckCircle2 className="w-4 h-4" />
            ✅  ডেলিভারি ডান
          </span>
        ) : log.actionType === 'ADD' ? (
          <span className="bg-blue-600 text-white text-xs font-bold px-3.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
            <Plus className="w-4 h-4" />
            ➕  নিবন্ধন যোগ
          </span>
        ) : log.actionType === 'PAYMENT' ? (
          <span className="bg-amber-500 text-slate-950 text-xs font-bold px-3.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
            <Coins className="w-4 h-4" />
            💰  টাকা আপডেট
          </span>
        ) : (
          <span className="bg-slate-700 text-white text-xs font-bold px-3.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
            <Clock className="w-4 h-4" />
            আপডেট
          </span>
        )}
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

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Official Header */}
      <Header />

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
            onClick={() => setActiveTab('add-record')}
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
                onClick={() => setActiveTab('add-record')}
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
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-xl font-bold text-slate-900">নতুন নিবন্ধন যোগ করুন</h2>
              <p className="text-xs text-slate-500">ফরমের সকল তথ্য ইনপুট করে সংরক্ষণ করুন</p>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs md:text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">১. সিরিয়াল নাম্বার</label>
                  <input
                    type="text"
                    placeholder="যেমন: 1006"
                    value={formData.serialNo}
                    onChange={(e) => setFormData({ ...formData, serialNo: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
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

              <div className="relative max-w-xl">
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
            </div>

            <div className="space-y-4">
              <p className="text-xs font-bold text-slate-600">
                অনুসন্ধানের ফলাফল: {searchResults.length} টি পাওয়া গেছে
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {searchResults.map((item) => (
                  <RecordCard key={item.id} item={item} />
                ))}
              </div>
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

        {/* TAB 5: WORK HISTORY LOG - STYLED IN SAME 2nd IMAGE CARD DESIGN */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">কাজের হিস্ট্রি (Work History Log)</h2>
                <p className="text-xs text-slate-500">সম্পন্ন করা সকল কাজের ক্রমানুসারে তালিকা</p>
              </div>
              <span className="bg-blue-100 text-blue-900 px-3.5 py-1 rounded-full text-xs font-bold">
                মোট অ্যাক্টিভিটি: {historyLogs.length} টি
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {historyLogs.map((log) => (
                <HistoryCard key={log.id} log={log} />
              ))}
            </div>
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
