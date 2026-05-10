"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateTrip } from "@/hooks/useTrips";
import TopBar from "@/components/layout/TopBar";

import { ArrowLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { TRIP_EMOJIS } from "@/lib/trip-emoji-banners";
const CURRENCIES = [
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
];

export default function NewTripPage() {
  const router = useRouter();
  const createTrip = useCreateTrip();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    description: "",
    emoji: "✈️",
    currency: "INR",
    startDate: "",
    endDate: "",
  });
  const [inviteEmail, setInviteEmail] = useState("");
  const [invitedEmails, setInvitedEmails] = useState<string[]>([]);

  const handleCreate = async () => {
    try {
      const trip = await createTrip.mutateAsync({
        name: form.name,
        description: form.description || undefined,
        emoji: form.emoji,
        currency: form.currency,
        startDate: form.startDate || undefined,
        endDate: form.endDate || undefined,
      });

      // Add invited members
      for (const email of invitedEmails) {
        await fetch(`/api/trips/${trip.id}/members`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
      }

      router.push(`/trip/${trip.id}`);
    } catch (err: any) {
      alert(err.message || "Failed to create trip");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-8">
      <TopBar />

      <main className="px-container-padding py-lg max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-lg">
          <Link href="/dashboard" className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-h1 text-h1 text-on-surface">Create Trip</h1>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-xl">
          <div className={`h-2 flex-1 rounded-full ${step >= 1 ? "bg-primary" : "bg-surface-container-high"}`} />
          <div className={`h-2 flex-1 rounded-full ${step >= 2 ? "bg-primary" : "bg-surface-container-high"}`} />
        </div>

        {step === 1 ? (
          <div className="space-y-lg">
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-1">Trip Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors"
                placeholder="e.g., Road Trip to Iceland"
              />
            </div>

            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors min-h-[80px] resize-none"
                placeholder="Optional description..."
              />
            </div>

            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-2">Emoji</label>
              <div className="flex gap-2 flex-wrap">
                {TRIP_EMOJIS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setForm({ ...form, emoji })}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all ${
                      form.emoji === emoji
                        ? "bg-primary text-on-primary shadow-md"
                        : "bg-surface-container-low hover:bg-surface-container-high"
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-2">Currency</label>
              <div className="grid grid-cols-2 gap-2">
                {CURRENCIES.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => setForm({ ...form, currency: c.code })}
                    className={`px-4 py-3 rounded-lg border text-left transition-all ${
                      form.currency === c.code
                        ? "border-primary bg-primary-container/20 text-primary"
                        : "border-outline-variant bg-surface-container-low text-on-surface"
                    }`}
                  >
                    <span className="font-label-md text-label-md">{c.code}</span>
                    <span className="font-caption text-caption text-on-surface-variant ml-2">{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-md">
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1">Start Date</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1">End Date</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!form.name}
              className="w-full bg-gradient-to-r from-primary to-secondary text-on-primary font-label-md text-label-md py-md rounded-lg shadow-md hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              Next Step
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="space-y-lg">
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-1">Invite Members</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && inviteEmail) {
                      setInvitedEmails([...invitedEmails, inviteEmail]);
                      setInviteEmail("");
                    }
                  }}
                  className="flex-1 bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-colors"
                  placeholder="friend@email.com"
                />
                <button
                  onClick={() => {
                    if (inviteEmail) {
                      setInvitedEmails([...invitedEmails, inviteEmail]);
                      setInviteEmail("");
                    }
                  }}
                  className="bg-primary text-on-primary px-4 rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity"
                >
                  Add
                </button>
              </div>
            </div>

            {invitedEmails.length > 0 && (
              <div className="space-y-2">
                {invitedEmails.map((email, i) => (
                  <div key={i} className="flex items-center justify-between bg-surface-container-low rounded-lg px-4 py-2">
                    <span className="font-body-md text-body-md text-on-surface">{email}</span>
                    <button
                      onClick={() => setInvitedEmails(invitedEmails.filter((_, idx) => idx !== i))}
                      className="text-error font-caption text-caption hover:opacity-70"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 border-t border-outline-variant">
              <p className="font-caption text-caption text-on-surface-variant mb-2">Shareable invite link will be generated after creating the trip.</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-surface-container text-on-surface font-label-md text-label-md py-md rounded-lg hover:bg-surface-container-high transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleCreate}
                disabled={createTrip.isPending}
                className="flex-1 bg-gradient-to-r from-primary to-secondary text-on-primary font-label-md text-label-md py-md rounded-lg shadow-md hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {createTrip.isPending ? "Creating..." : "Create Trip"}
              </button>
            </div>
          </div>
        )}
      </main>

    </div>
  );
}
