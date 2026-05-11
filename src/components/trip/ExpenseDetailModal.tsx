"use client";

import { useDeleteExpense } from "@/hooks/useExpenses";
import { useCreateSettlement } from "@/hooks/useSettlements";
import { formatCurrency, formatDate, getCategoryColor } from "@/lib/utils";
import { X, Trash2, Calendar, User, Receipt, Info, MapPin, Utensils, Car, Hotel, Film, ShoppingBag, Fuel, PartyPopper, CheckCircle } from "lucide-react";
import { useState } from "react";

const categoryIcons: Record<string, any> = {
  FOOD: Utensils,
  TRANSPORT: Car,
  ACCOMMODATION: Hotel,
  ENTERTAINMENT: Film,
  SHOPPING: ShoppingBag,
  FUEL: Fuel,
  ACTIVITIES: PartyPopper,
  OTHER: Receipt,
};

interface ExpenseDetailModalProps {
  tripId: string;
  expense: {
    id: string;
    title: string;
    amount: number;
    category: string;
    notes?: string | null;
    date: string;
    paidBy: { id: string; name: string; image?: string };
    splits: Array<{ user: { id: string; name: string }; amount: number; percentage?: number | null }>;
    location?: string | null;
  };
  currency: string;
  currentUserId: string;
  isAdmin: boolean;
  onClose: () => void;
}

export default function ExpenseDetailModal({
  tripId,
  expense,
  currency,
  currentUserId,
  isAdmin,
  onClose,
}: ExpenseDetailModalProps) {
  const deleteExpense = useDeleteExpense(tripId);
  const createSettlement = useCreateSettlement(tripId);
  const [isDeleting, setIsDeleting] = useState(false);
  const [settlingSplitId, setSettlingSplitId] = useState<string | null>(null);

  const isCreator = expense.paidBy.id === currentUserId;
  const canDelete = isAdmin || isCreator;

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    
    setIsDeleting(true);
    try {
      await deleteExpense.mutateAsync(expense.id);
      onClose();
    } catch (err: any) {
      alert(err.message || "Failed to delete expense");
      setIsDeleting(false);
    }
  };

  const handleSettleSplit = async (split: any) => {
    if (!confirm(`Mark ${split.user.name}'s share of ${formatCurrency(split.amount, currency)} as cleared?`)) return;
    
    setSettlingSplitId(split.user.id);
    try {
      await createSettlement.mutateAsync({
        amount: split.amount,
        payerId: split.user.id,
        receiverId: expense.paidBy.id,
        method: "MANUAL",
        note: `Cleared for: ${expense.title}`,
      });
    } catch (err: any) {
      alert(err.message || "Failed to clear expense for member");
    } finally {
      setSettlingSplitId(null);
    }
  };

  const CategoryIcon = categoryIcons[expense.category] || Receipt;
  const categoryColorClass = getCategoryColor(expense.category);
  const [bgClass, textClass] = categoryColorClass.split(" ");

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-t-2xl md:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto hide-scrollbar">
        {/* Header */}
        <div className="sticky top-0 bg-surface-container-lowest z-10 px-container-padding py-md border-b border-outline-variant flex items-center justify-between">
          <h2 className="font-display text-h1 text-on-surface">Expense Details</h2>
          <div className="flex items-center gap-2">
            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="p-2 text-error hover:bg-error/10 rounded-full transition-colors disabled:opacity-50"
                title="Delete expense"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
            <button onClick={onClose} className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="px-container-padding py-lg space-y-xl">
          {/* Main Info */}
          <div className="text-center space-y-md">
            <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${bgClass}`}>
              <CategoryIcon className={`w-8 h-8 ${textClass.replace("bg-", "").replace("/30", "").replace("/20", "")}`} />
            </div>
            <div>
              <h3 className="font-display text-display text-on-surface">{expense.title}</h3>
              <p className="font-h1 text-primary mt-1">
                {formatCurrency(expense.amount, currency)}
              </p>
            </div>
          </div>

          {/* Details List */}
          <div className="space-y-lg bg-surface-container-low rounded-2xl p-lg border border-outline-variant/60">
            <div className="flex items-start gap-md">
              <Calendar className="w-5 h-5 text-on-surface-variant shrink-0 mt-0.5" />
              <div>
                <p className="font-caption text-caption text-on-surface-variant uppercase tracking-wider">Date</p>
                <p className="font-body-md text-on-surface font-medium">{formatDate(expense.date)}</p>
              </div>
            </div>

            <div className="flex items-start gap-md">
              <User className="w-5 h-5 text-on-surface-variant shrink-0 mt-0.5" />
              <div>
                <p className="font-caption text-caption text-on-surface-variant uppercase tracking-wider">Paid by</p>
                <p className="font-body-md text-on-surface font-medium">{expense.paidBy.name}</p>
              </div>
            </div>

            {expense.location && (
              <div className="flex items-start gap-md">
                <MapPin className="w-5 h-5 text-on-surface-variant shrink-0 mt-0.5" />
                <div>
                  <p className="font-caption text-caption text-on-surface-variant uppercase tracking-wider">Location</p>
                  <p className="font-body-md text-on-surface font-medium">{expense.location}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-md">
              <Receipt className="w-5 h-5 text-on-surface-variant shrink-0 mt-0.5" />
              <div>
                <p className="font-caption text-caption text-on-surface-variant uppercase tracking-wider mb-sm">Split Breakdown</p>
                <div className="space-y-sm">
                  {expense.splits.map((split) => {
                    const isSplitPayer = split.user.id === expense.paidBy.id;
                    const canSettle = !isSplitPayer && (isAdmin || isCreator || split.user.id === currentUserId);
                    
                    return (
                      <div key={split.user.id} className="flex justify-between items-center gap-lg">
                        <div className="flex items-center gap-2">
                          <span className="font-body-md text-on-surface">{split.user.name}</span>
                          {isSplitPayer && <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Payer</span>}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="font-body-md text-on-surface font-medium tabular-nums">
                              {formatCurrency(split.amount, currency)}
                            </span>
                            {split.percentage && (
                              <span className="font-caption text-caption text-on-surface-variant ml-2">
                                ({split.percentage}%)
                              </span>
                            )}
                          </div>
                          {canSettle && (
                            <button
                              onClick={() => handleSettleSplit(split)}
                              disabled={settlingSplitId === split.user.id}
                              className="text-primary hover:bg-primary/10 p-1.5 rounded-full transition-colors disabled:opacity-50"
                              title="Mark as cleared"
                            >
                              {settlingSplitId === split.user.id ? (
                                <div className="w-4 h-4 border-2 border-primary border-t-transparent animate-spin rounded-full" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {expense.notes && (
              <div className="flex items-start gap-md pt-2 border-t border-outline-variant/50">
                <Info className="w-5 h-5 text-on-surface-variant shrink-0 mt-0.5" />
                <div>
                  <p className="font-caption text-caption text-on-surface-variant uppercase tracking-wider">Notes</p>
                  <p className="font-body-md text-on-surface italic mt-1">&quot;{expense.notes}&quot;</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-container-padding pb-safe" />
      </div>
    </div>
  );
}
