"use client";

import { formatCurrency, formatRelativeDate, getCategoryIcon, getCategoryColor } from "@/lib/utils";
import { Utensils, Car, Hotel, Film, ShoppingBag, Fuel, PartyPopper, Receipt } from "lucide-react";

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

interface ExpenseCardProps {
  expense: {
    id: string;
    title: string;
    amount: number;
    category: string;
    date: string;
    paidBy: { id: string; name: string; image?: string };
    splits: Array<{ user: { id: string; name: string }; amount: number }>;
  };
  currency: string;
  currentUserId?: string;
  onClick?: () => void;
}

export default function ExpenseCard({ expense, currency, currentUserId, onClick }: ExpenseCardProps) {
  const CategoryIcon = categoryIcons[expense.category] || Receipt;
  const categoryColorClass = getCategoryColor(expense.category);
  const [bgClass, textClass] = categoryColorClass.split(" ");

  const currentUserSplit = expense.splits.find((s) => s.user.id === currentUserId);
  const isPayer = expense.paidBy.id === currentUserId;
  const lent = isPayer ? expense.amount - (currentUserSplit?.amount || 0) : 0;
  const owe = !isPayer ? (currentUserSplit?.amount || 0) : 0;

  return (
    <div
      onClick={onClick}
      className="bg-surface-container-lowest rounded-xl p-md flex items-center gap-md shadow-sm border border-surface-container-low hover:bg-surface-container-low transition-colors cursor-pointer"
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${bgClass}`}>
        <CategoryIcon className={`w-5 h-5 ${textClass.replace("bg-", "").replace("/30", "").replace("/20", "")}`} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-h2 text-h2 text-on-surface truncate">{expense.title}</h4>
        <p className="font-caption text-caption text-on-surface-variant truncate">
          Paid by <span className="font-medium text-on-surface">{expense.paidBy.name}</span>
          {" "}· {formatRelativeDate(expense.date)}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="font-h2 text-h2 text-on-surface">
          {formatCurrency(expense.amount, currency)}
        </p>
        {isPayer && lent > 0 ? (
          <p className="font-caption text-caption text-primary">
            You lent {formatCurrency(lent, currency)}
          </p>
        ) : !isPayer && owe > 0 ? (
          <p className="font-caption text-caption text-error">
            You owe {formatCurrency(owe, currency)}
          </p>
        ) : (
          <p className="font-caption text-caption text-on-surface-variant">
            {expense.splits.length} people
          </p>
        )}
      </div>
    </div>
  );
}
