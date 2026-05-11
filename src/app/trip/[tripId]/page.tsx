"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTrip } from "@/hooks/useTrips";
import { useExpenses } from "@/hooks/useExpenses";
import { useBalances } from "@/hooks/useBalances";
import TopBar from "@/components/layout/TopBar";

import ExpenseCard from "@/components/trip/ExpenseCard";
import AddExpenseModal from "@/components/trip/AddExpenseModal";
import ExpenseDetailModal from "@/components/trip/ExpenseDetailModal";
import TripBannerImage from "@/components/trip/TripBannerImage";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Plus, ArrowLeft, Wallet, Users, Receipt, Link as LinkIcon, Check } from "lucide-react";
import Link from "next/link";

type Tab = "expenses" | "balances" | "members";

export default function TripDetailPage() {
  const { tripId } = useParams() as { tripId: string };
  const { data: session } = useSession();
  const { data: trip, isLoading: tripLoading } = useTrip(tripId);
  const { data: expenses } = useExpenses(tripId);
  const { data: balanceData } = useBalances(tripId);
  const [activeTab, setActiveTab] = useState<Tab>("expenses");
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const copyInviteLink = () => {
    if (!trip?.inviteToken) return;
    const link = `${window.location.origin}/join/${trip.inviteToken}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalExpense = expenses?.reduce((sum: number, e: any) => sum + e.amount, 0) || 0;
  const currentUserId = session?.user?.id;

  const groupExpensesByDate = () => {
    if (!expenses) return [];
    const groups: Record<string, any[]> = {};
    for (const expense of expenses) {
      const date = new Date(expense.date).toDateString();
      if (!groups[date]) groups[date] = [];
      groups[date].push(expense);
    }
    return Object.entries(groups).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());
  };

  if (tripLoading) {
    return (
      <div className="min-h-screen bg-background">
        <TopBar />
        <div className="h-64 bg-surface-container animate-pulse" />
        <div className="px-container-padding py-lg space-y-md">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface-container-lowest rounded-xl h-20 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-h1 text-h1 text-on-surface mb-2">Trip not found</h2>
          <Link href="/dashboard" className="text-primary font-label-md text-label-md">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isAdmin = trip.members.find((m: any) => m.user.id === currentUserId)?.role === "ADMIN";

  return (
    <div className="min-h-screen bg-background pb-8">
      <TopBar />

      {/* Hero Header */}
      <section className="relative h-[250px] md:h-[300px] w-full bg-surface-container-low overflow-hidden rounded-b-3xl shadow-sm mb-4">
        <TripBannerImage
          emoji={trip.emoji}
          coverImage={trip.coverImage}
          alt={`${trip.name} cover`}
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
        <div className="absolute bottom-0 left-0 w-full p-container-padding pb-xl z-20 flex flex-col justify-end">
          <Link href="/dashboard" className="text-white/90 font-label-md text-label-md flex items-center gap-1 mb-2 hover:text-white transition-colors w-fit bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-sm">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <h1 className="font-display text-[40px] leading-tight text-white mb-1 drop-shadow-md">{trip.emoji} {trip.name}</h1>
          {trip.startDate && (
            <p className="font-body-md text-white/90 flex items-center gap-1 font-medium drop-shadow-md">
              {formatDate(trip.startDate)}
              {trip.endDate && ` - ${formatDate(trip.endDate)}`}
            </p>
          )}
        </div>
      </section>

      {/* Summary & Tabs */}
      <section className="px-container-padding py-lg bg-surface">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-md mb-lg">
          <div>
            <p className="font-caption text-caption text-on-surface-variant uppercase tracking-wider mb-1">Total Trip Expenses</p>
            <h2 className="font-display text-display text-on-surface">{formatCurrency(totalExpense, trip.currency)}</h2>
          </div>
          <div className="flex -space-x-2">
            {trip.members.slice(0, 5).map((m: any, i: number) => (
              <div
                key={m.user.id}
                className="w-10 h-10 rounded-full bg-surface-container-high border-2 border-surface flex items-center justify-center text-xs text-on-surface-variant font-medium relative"
                style={{ zIndex: 5 - i }}
              >
                {m.user.name[0]}
              </div>
            ))}
            {trip.members.length > 5 && (
              <div className="w-10 h-10 rounded-full bg-surface-container-high border-2 border-surface flex items-center justify-center text-xs text-on-surface-variant font-medium">
                +{trip.members.length - 5}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-outline-variant w-full">
          {(["expenses", "balances", "members"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 pb-3 text-center font-label-md text-label-md relative transition-colors ${
                activeTab === tab ? "text-primary" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {tab === "expenses" && <Receipt className="w-4 h-4 inline mr-1" />}
              {tab === "balances" && <Wallet className="w-4 h-4 inline mr-1" />}
              {tab === "members" && <Users className="w-4 h-4 inline mr-1" />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Content */}
      <section className="px-container-padding py-md space-y-md max-w-3xl mx-auto">
        {activeTab === "expenses" && (
          <>
            {groupExpensesByDate().map(([date, items]: [string, any[]]) => (
              <div key={date}>
                <h3 className="font-label-md text-label-md text-on-surface-variant mb-sm">
                  {new Date(date).toDateString() === new Date().toDateString() ? "Today" : formatDate(date)}
                </h3>
                <div className="space-y-sm">
                  {items.map((expense: any) => (
                    <ExpenseCard
                      key={expense.id}
                      expense={expense}
                      currency={trip.currency}
                      currentUserId={currentUserId || ""}
                      onClick={() => setSelectedExpense(expense)}
                    />
                  ))}
                </div>
              </div>
            ))}
            {(!expenses || expenses.length === 0) && (
              <div className="text-center py-2xl">
                <Receipt className="w-12 h-12 text-outline mx-auto mb-md" />
                <h3 className="font-h2 text-h2 text-on-surface mb-sm">No expenses yet</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Add your first expense to get started.
                </p>
              </div>
            )}
          </>
        )}

        {activeTab === "balances" && balanceData && (
          <div className="space-y-lg">
            {/* Net Balance Summary */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-lg border border-surface-variant">
              <h2 className="font-h2 text-h2 text-on-surface mb-xs">Net Balance</h2>
              <div className="flex items-center gap-sm flex-wrap">
                {Object.entries(balanceData.netBalances || {}).map(([userId, balance]: [string, any]) => {
                  const member = trip.members.find((m: any) => m.user.id === userId);
                  if (!member) return null;
                  return (
                    <div key={userId} className={`px-3 py-2 rounded-lg font-label-md text-label-md ${
                      balance > 0.01
                        ? "bg-primary-container/20 text-primary"
                        : balance < -0.01
                        ? "bg-error-container/30 text-error"
                        : "bg-surface-container text-on-surface-variant"
                    }`}>
                      {member.user.name}: {balance > 0 ? "+" : ""}{formatCurrency(balance, trip.currency)}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Simplified Transactions */}
            {balanceData.simplifiedTransactions?.length > 0 && (
              <div className="space-y-md">
                <h3 className="font-h2 text-h2 text-on-surface px-sm">Who owes whom</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  {balanceData.simplifiedTransactions.map((t: any, i: number) => (
                    <div key={i} className="bg-surface-container-lowest rounded-xl p-md shadow-sm border border-surface-variant flex flex-col justify-between h-full">
                      <div className="flex items-start justify-between mb-lg">
                        <div className="flex items-center gap-md">
                          <div className="w-12 h-12 rounded-full bg-surface-container-highest flex items-center justify-center text-on-surface-variant font-h2 text-h2">
                            {t.from?.name?.[0] || "?"}
                          </div>
                          <div>
                            <h4 className="font-h2 text-h2 text-on-surface">{t.from?.name || "Unknown"}</h4>
                            <p className="font-caption text-caption text-on-surface-variant">owes {t.to?.name || "Unknown"}</p>
                          </div>
                        </div>
                        <div className="flex items-center text-error font-h2 text-h2 bg-error/10 px-sm py-xs rounded-md">
                          {formatCurrency(t.amount, trip.currency)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "members" && (
          <div className="space-y-sm">
            {isAdmin && (
              <button
                onClick={copyInviteLink}
                className="w-full mb-4 bg-primary-container text-on-primary-container font-label-md text-label-md py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all border border-primary/20 shadow-sm"
              >
                {copied ? <Check className="w-5 h-5 text-primary" /> : <LinkIcon className="w-5 h-5" />}
                {copied ? "Invite Link Copied!" : "Copy Invite Link"}
              </button>
            )}
            
            {trip.members.map((m: any) => (
              <div key={m.user.id} className="bg-surface-container-lowest rounded-xl p-md flex items-center gap-md shadow-sm border border-surface-container-low">
                <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-h2 text-h2">
                  {m.user.name[0]}
                </div>
                <div className="flex-1">
                  <h4 className="font-h2 text-h2 text-on-surface">{m.user.name}</h4>
                  <p className="font-caption text-caption text-on-surface-variant">{m.user.email}</p>
                </div>
                <span className={`px-sm py-xs rounded font-label-md text-label-md ${
                  m.role === "ADMIN" ? "bg-primary-container/20 text-primary" : "bg-surface-container text-on-surface-variant"
                }`}>
                  {m.role}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FAB */}
      {activeTab === "expenses" && (
        <button
          onClick={() => setShowAddExpense(true)}
          className="fixed bottom-8 right-4 z-40 md:bottom-8 md:right-8 bg-gradient-to-br from-primary to-secondary text-white rounded-xl shadow-[0px_8px_20px_rgba(59,130,246,0.3)] flex items-center justify-center gap-2 px-6 py-4 hover:shadow-lg active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span className="font-label-md text-label-md">Add Expense</span>
        </button>
      )}

      {showAddExpense && (
        <AddExpenseModal
          tripId={tripId}
          members={trip.members}
          currency={trip.currency}
          currentUserId={currentUserId || ""}
          onClose={() => setShowAddExpense(false)}
        />
      )}

      {selectedExpense && (
        <ExpenseDetailModal
          tripId={tripId}
          expense={selectedExpense}
          currency={trip.currency}
          currentUserId={currentUserId || ""}
          isAdmin={isAdmin}
          onClose={() => setSelectedExpense(null)}
        />
      )}

    </div>
  );
}
