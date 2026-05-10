"use client";

import { useState } from "react";
import { useCreateExpense } from "@/hooks/useExpenses";
import { formatCurrency } from "@/lib/utils";
import { X, Utensils, Car, Hotel, Film, ShoppingBag, Fuel, PartyPopper, Receipt } from "lucide-react";

const CATEGORIES = [
  { key: "FOOD", label: "Food", icon: Utensils },
  { key: "TRANSPORT", label: "Transport", icon: Car },
  { key: "ACCOMMODATION", label: "Stay", icon: Hotel },
  { key: "ENTERTAINMENT", label: "Fun", icon: Film },
  { key: "SHOPPING", label: "Shop", icon: ShoppingBag },
  { key: "FUEL", label: "Fuel", icon: Fuel },
  { key: "ACTIVITIES", label: "Activity", icon: PartyPopper },
  { key: "OTHER", label: "Other", icon: Receipt },
];

type SplitType = "EQUAL" | "UNEQUAL" | "PERCENTAGE";

interface AddExpenseModalProps {
  tripId: string;
  members: Array<{ user: { id: string; name: string; image?: string } }>;
  currency: string;
  currentUserId: string;
  onClose: () => void;
}

export default function AddExpenseModal({ tripId, members, currency, currentUserId, onClose }: AddExpenseModalProps) {
  const createExpense = useCreateExpense(tripId);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("FOOD");
  const [paidById, setPaidById] = useState(currentUserId);
  const [splitType, setSplitType] = useState<SplitType>("EQUAL");
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set(members.map((m) => m.user.id)));
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
  const [customPercents, setCustomPercents] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");

  const numAmount = parseFloat(amount) || 0;

  const toggleMember = (id: string) => {
    const next = new Set(selectedMembers);
    if (next.has(id)) {
      if (next.size > 1) next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedMembers(next);
  };

  const selectedList = members.filter((m) => selectedMembers.has(m.user.id));

  const getSplitPreview = () => {
    if (numAmount <= 0) return [];
    const selected = selectedList;

    if (splitType === "EQUAL") {
      const each = Math.round((numAmount / selected.length) * 100) / 100;
      const diff = numAmount - each * selected.length;
      return selected.map((m, i) => ({
        userId: m.user.id,
        name: m.user.name,
        amount: i === selected.length - 1 ? Math.round((each + diff) * 100) / 100 : each,
      }));
    }

    if (splitType === "UNEQUAL") {
      return selected.map((m) => ({
        userId: m.user.id,
        name: m.user.name,
        amount: parseFloat(customAmounts[m.user.id] || "0") || 0,
      }));
    }

    if (splitType === "PERCENTAGE") {
      return selected.map((m) => {
        const pct = parseFloat(customPercents[m.user.id] || "0") || 0;
        return {
          userId: m.user.id,
          name: m.user.name,
          amount: Math.round(((numAmount * pct) / 100) * 100) / 100,
          percentage: pct,
        };
      });
    }

    return [];
  };

  const splitPreview = getSplitPreview();
  const splitSum = splitPreview.reduce((s, x) => s + x.amount, 0);

  const assignedRaw = selectedList.reduce((sum, m) => sum + (parseFloat(customAmounts[m.user.id] || "0") || 0), 0);
  const assignedRounded = Math.round(assignedRaw * 100) / 100;
  const remainingAmount = Math.round((numAmount - assignedRounded) * 100) / 100;

  const pctTotalRaw = selectedList.reduce((sum, m) => sum + (parseFloat(customPercents[m.user.id] || "0") || 0), 0);
  const pctTotalRounded = Math.round(pctTotalRaw * 100) / 100;
  const remainingPct = Math.round((100 - pctTotalRounded) * 100) / 100;

  const pctValid = Math.abs(pctTotalRounded - 100) < 0.01;
  const amountSplitValid = Math.abs(splitSum - numAmount) < 0.01;

  const isValid =
    Boolean(title) &&
    numAmount > 0 &&
    selectedMembers.size >= 1 &&
    (splitType === "EQUAL" ||
      (splitType === "UNEQUAL" && amountSplitValid) ||
      (splitType === "PERCENTAGE" && pctValid));

  const handleSubmit = async () => {
    if (!isValid) return;

    const splitAmong = splitPreview.map((s) => ({
      userId: s.userId,
      amount: s.amount,
      percentage: "percentage" in s ? s.percentage : undefined,
    }));

    try {
      await createExpense.mutateAsync({
        title,
        amount: numAmount,
        category,
        notes: notes || undefined,
        paidById,
        splitType,
        splitAmong,
      });
      onClose();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to save expense");
    }
  };

  const splitTabs: { id: SplitType; label: string; hint: string }[] = [
    { id: "EQUAL", label: "Equal", hint: "Same share for everyone selected" },
    { id: "UNEQUAL", label: "Amounts", hint: "Enter amounts that add up to the total" },
    { id: "PERCENTAGE", label: "Percent", hint: "Percents for each person must total 100%" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-t-2xl md:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto hide-scrollbar">
        <div className="sticky top-0 bg-surface-container-lowest z-10 px-container-padding py-md border-b border-outline-variant flex items-center justify-between">
          <h2 className="font-display text-h1 text-on-surface">Add Expense</h2>
          <button onClick={onClose} className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="px-container-padding py-lg space-y-xl">
          <div className="bg-surface-container-low rounded-2xl p-xl text-center border border-outline-variant/60">
            <p className="font-label-md text-label-md text-outline uppercase tracking-widest mb-sm">Expense total</p>
            <div className="flex items-center justify-center">
              <span className="font-display text-display text-on-surface mr-2 opacity-50">{currency === "INR" ? "₹" : "$"}</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-transparent border-none outline-none font-display text-display text-on-surface w-[200px] text-center p-0 placeholder:text-surface-dim focus:ring-0 appearance-none"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>
            {splitType === "UNEQUAL" && numAmount > 0 && (
              <div className="mt-md pt-md border-t border-outline-variant/50 text-left space-y-1 font-body-md text-body-md">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Assigned so far</span>
                  <span className="text-on-surface font-medium tabular-nums">{formatCurrency(assignedRounded, currency)}</span>
                </div>
                <div className="flex justify-between">
                  <span className={remainingAmount < -0.01 || remainingAmount > numAmount + 0.01 ? "text-error" : "text-primary"}>
                    Remaining to assign
                  </span>
                  <span
                    className={`font-semibold tabular-nums ${
                      Math.abs(remainingAmount) < 0.01 ? "text-primary" : "text-error"
                    }`}
                  >
                    {formatCurrency(remainingAmount, currency)}
                  </span>
                </div>
                <p className="font-caption text-caption text-on-surface-variant pt-1">
                  Enter each person&apos;s share; remaining should reach {formatCurrency(0, currency)} before saving.
                </p>
              </div>
            )}
            {splitType === "PERCENTAGE" && (
              <div className="mt-md pt-md border-t border-outline-variant/50 text-left space-y-1 font-body-md text-body-md">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Percent assigned</span>
                  <span className="text-on-surface font-medium tabular-nums">{pctTotalRounded.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className={pctValid ? "text-primary" : "text-error"}>Remaining</span>
                  <span className={`font-semibold tabular-nums ${pctValid ? "text-primary" : "text-error"}`}>
                    {remainingPct.toFixed(1)}%
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-transparent border-0 border-b-2 border-surface-container-high px-0 py-sm font-body-lg text-body-lg text-on-surface placeholder:text-outline-variant focus:ring-0 focus:border-primary transition-colors outline-none"
              placeholder="Description (e.g., Dinner at Joe's)"
            />
          </div>

          <div className="space-y-sm">
            <h3 className="font-label-md text-label-md text-on-surface-variant">Category</h3>
            <div className="grid grid-cols-4 gap-md">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = category === cat.key;
                return (
                  <button
                    key={cat.key}
                    type="button"
                    onClick={() => setCategory(cat.key)}
                    className="flex flex-col items-center gap-xs cursor-pointer group"
                  >
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-95 ${
                        isActive
                          ? "bg-primary text-on-primary shadow-md"
                          : "bg-surface-container text-outline group-hover:bg-surface-container-high"
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`font-caption text-caption ${isActive ? "text-primary font-semibold" : "text-on-surface-variant"}`}>
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-sm">
            <h3 className="font-label-md text-label-md text-on-surface-variant">Paid by</h3>
            <select
              value={paidById}
              onChange={(e) => setPaidById(e.target.value)}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-md text-on-surface focus:outline-none focus:border-primary"
            >
              {members.map((m) => (
                <option key={m.user.id} value={m.user.id}>
                  {m.user.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-sm">
            <h3 className="font-label-md text-label-md text-on-surface-variant">Split type</h3>
            <div className="bg-surface-container-low rounded-xl p-xs flex shadow-inner border border-surface-container-highest gap-px">
              {splitTabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSplitType(tab.id)}
                  className={`flex-1 py-sm rounded-lg font-label-md text-label-md transition-all text-center ${
                    splitType === tab.id ? "bg-surface shadow-sm text-primary" : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <p className="font-caption text-caption text-on-surface-variant">{splitTabs.find((t) => t.id === splitType)?.hint}</p>
          </div>

          <div className="space-y-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-label-md text-label-md text-on-surface-variant">Split between</h3>
              <button
                type="button"
                onClick={() => setSelectedMembers(new Set(members.map((m) => m.user.id)))}
                className="font-label-md text-label-md text-primary hover:text-primary-fixed-dim transition-colors"
              >
                Select all
              </button>
            </div>
            <div className="flex items-center gap-sm overflow-x-auto hide-scrollbar pb-xs">
              {members.map((m) => {
                const isSelected = selectedMembers.has(m.user.id);
                return (
                  <button
                    key={m.user.id}
                    type="button"
                    onClick={() => toggleMember(m.user.id)}
                    className="relative cursor-pointer group flex-shrink-0"
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all active:scale-95 font-label-md text-label-md ${
                        isSelected
                          ? "bg-primary-container text-on-primary-container border-primary shadow-sm"
                          : "bg-surface-container-high text-outline border-transparent opacity-60"
                      }`}
                    >
                      {m.user.name[0]}
                    </div>
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-surface flex items-center justify-center">
                        <span className="text-on-primary text-[10px] font-bold">✓</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {(splitType === "UNEQUAL" || splitType === "PERCENTAGE") && (
            <div className="space-y-3">
              <h3 className="font-label-md text-label-md text-on-surface-variant">
                {splitType === "UNEQUAL" ? "Amount per person" : "Percent per person"}
              </h3>
              {selectedList.map((m) => (
                <div key={m.user.id} className="flex items-center gap-2">
                  <span className="font-body-md text-body-md text-on-surface w-24 truncate shrink-0">{m.user.name}</span>
                  <input
                    type="number"
                    value={splitType === "UNEQUAL" ? customAmounts[m.user.id] ?? "" : customPercents[m.user.id] ?? ""}
                    onChange={(e) => {
                      if (splitType === "UNEQUAL") {
                        setCustomAmounts({ ...customAmounts, [m.user.id]: e.target.value });
                      } else {
                        setCustomPercents({ ...customPercents, [m.user.id]: e.target.value });
                      }
                    }}
                    className="flex-1 bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-on-surface focus:outline-none focus:border-primary tabular-nums"
                    placeholder={splitType === "UNEQUAL" ? "0.00" : "0"}
                    step={splitType === "UNEQUAL" ? "0.01" : "0.1"}
                    min="0"
                  />
                  {splitType === "PERCENTAGE" ? (
                    <span className="font-body-md text-on-surface-variant w-8 shrink-0">%</span>
                  ) : (
                    <span className="font-caption text-caption text-on-surface-variant w-10 shrink-0 text-right tabular-nums">
                      {currency === "INR" ? "₹" : ""}
                    </span>
                  )}
                </div>
              ))}
              {splitType === "UNEQUAL" && numAmount > 0 && (
                <p className={`font-caption text-caption ${amountSplitValid ? "text-primary" : "text-error"}`}>
                  Split sum {formatCurrency(splitSum, currency)} must equal total {formatCurrency(numAmount, currency)}
                </p>
              )}
            </div>
          )}

          <div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors min-h-[80px] resize-none"
              placeholder="Notes (optional)"
            />
          </div>
        </div>

        <div className="sticky bottom-0 w-full p-container-padding bg-surface/80 backdrop-blur-lg border-t border-surface-container-highest z-10 pb-safe">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid || createExpense.isPending}
            className="w-full py-md rounded-full bg-gradient-to-r from-primary to-secondary text-on-primary font-label-md text-label-md shadow-[0px_8px_20px_rgba(0,107,95,0.25)] flex items-center justify-center gap-xs active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            {createExpense.isPending ? "Saving..." : "Save expense"}
          </button>
        </div>
      </div>
    </div>
  );
}
