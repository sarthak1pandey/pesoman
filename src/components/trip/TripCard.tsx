"use client";

import Link from "next/link";
import TripBannerImage from "@/components/trip/TripBannerImage";
import { formatCurrency } from "@/lib/utils";

interface TripCardProps {
  trip: {
    id: string;
    name: string;
    emoji: string;
    description?: string;
    currency: string;
    status: string;
    startDate?: string;
    endDate?: string;
    coverImage?: string;
    members: Array<{
      user: { id: string; name: string; image?: string };
    }>;
    expenses: Array<{ amount: number }>;
  };
  userNetBalance?: number;
}

export default function TripCard({ trip, userNetBalance = 0 }: TripCardProps) {
  const totalExpense = trip.expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <Link href={`/trip/${trip.id}`}>
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant overflow-hidden flex flex-col md:flex-row relative hover:shadow-md transition-shadow">
        <div className="h-32 md:h-auto md:w-48 bg-surface-container relative shrink-0 overflow-hidden">
          <TripBannerImage
            emoji={trip.emoji}
            coverImage={trip.coverImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
        <div className="p-md flex-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-xs">
              <h2 className="font-h2 text-h2 text-on-surface">{trip.name}</h2>
              <span className="font-label-md text-label-md text-primary bg-primary-container/20 px-xs py-[2px] rounded">
                {trip.status}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {trip.members.slice(0, 5).map((m, i) => (
                  <div
                    key={m.user.id}
                    className="w-6 h-6 rounded-full bg-surface-container-high border-2 border-surface flex items-center justify-center text-[10px] text-on-surface-variant relative"
                    style={{ zIndex: 5 - i }}
                  >
                    {m.user.name[0]}
                  </div>
                ))}
                {trip.members.length > 5 && (
                  <div className="w-6 h-6 rounded-full bg-surface-container-high border-2 border-surface flex items-center justify-center text-[10px] text-on-surface-variant">
                    +{trip.members.length - 5}
                  </div>
                )}
              </div>
              <p className="font-caption text-caption text-on-surface-variant">
                {trip.members.length} friends
              </p>
            </div>
          </div>
          <div className="flex justify-between items-end mt-md pt-sm border-t border-surface-container">
            <div>
              <p className="font-caption text-caption text-on-surface-variant mb-[2px]">Total Expense</p>
              <p className="font-body-lg text-body-lg text-on-surface font-medium">
                {formatCurrency(totalExpense, trip.currency)}
              </p>
            </div>
            <div className="text-right">
              <p className="font-caption text-caption text-on-surface-variant mb-[2px]">Your Balance</p>
              <p
                className={`font-body-lg text-body-lg font-semibold ${
                  userNetBalance >= 0 ? "text-primary" : "text-error"
                }`}
              >
                {userNetBalance >= 0 ? "+" : ""}
                {formatCurrency(userNetBalance, trip.currency)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
