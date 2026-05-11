"use client";

import { useSession } from "next-auth/react";
import TopBar from "@/components/layout/TopBar";

import TripCard from "@/components/trip/TripCard";
import { useTrips } from "@/hooks/useTrips";
import { Plus, Compass } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { status } = useSession();
  const sessionReady = status === "authenticated";
  const { data: trips, isPending, isError, error, refetch } = useTrips(sessionReady);

  const list = Array.isArray(trips) ? trips : [];
  const activeCount = list.filter((t) => t.status === "ACTIVE").length;
  const showTripSkeleton = status === "loading" || (sessionReady && isPending);

  return (
    <div className="min-h-screen bg-background pb-8">
      <TopBar />

      <main className="px-container-padding py-lg max-w-3xl mx-auto min-h-[50vh]">
        <div className="flex justify-between items-end mb-md">
          <h1 className="font-display text-h1 text-on-surface">Your Trips</h1>
          <span className="font-label-md text-label-md text-on-surface-variant bg-surface-container px-sm py-xs rounded-full">
            {activeCount} Active
          </span>
        </div>

        {showTripSkeleton ? (
          <div className="space-y-md">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-surface-container-low rounded-xl h-48 animate-pulse border border-outline-variant/40" />
            ))}
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-2xl text-center rounded-xl border border-error-container bg-error-container/10 px-md">
            <p className="font-body-md text-body-md text-on-surface mb-sm">
              Couldn&apos;t load trips.
            </p>
            <p className="font-caption text-caption text-on-surface-variant mb-lg">
              {error instanceof Error ? error.message : "Something went wrong"}
            </p>
            <button
              type="button"
              onClick={() => refetch()}
              className="bg-primary text-on-primary font-label-md text-label-md px-lg py-md rounded-lg hover:opacity-90"
            >
              Try again
            </button>
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-2xl text-center">
            <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mb-md">
              <Compass className="w-10 h-10 text-outline" />
            </div>
            <h2 className="font-display text-h2 text-on-surface mb-sm">No trips yet</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-lg max-w-sm">
              Create your first trip to start tracking expenses with friends.
            </p>
            <Link
              href="/trip/new"
              className="bg-gradient-to-r from-primary to-secondary text-on-primary font-label-md text-label-md px-lg py-md rounded-lg shadow-md hover:opacity-90 active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Trip
            </Link>
          </div>
        ) : (
          <div className="space-y-md">
            {list.map((trip) => {
              // Calculate user's net balance for this trip
              const currentUserId = sessionReady ? (useSession().data?.user as any)?.id : null;
              let userNetBalance = 0;

              if (currentUserId && trip.expenses) {
                trip.expenses.forEach((expense: any) => {
                  const isPayer = expense.paidById === currentUserId;
                  const userSplit = expense.splits.find((s: any) => s.userId === currentUserId);
                  const userSplitAmount = userSplit ? userSplit.amount : 0;

                  if (isPayer) {
                    // If user paid, they are owed (Total Amount - Their share)
                    userNetBalance += (expense.amount - userSplitAmount);
                  } else if (userSplit) {
                    // If user didn't pay but is in split, they owe their share
                    userNetBalance -= userSplitAmount;
                  }
                });
              }

              return <TripCard key={trip.id} trip={trip} userNetBalance={userNetBalance} />;
            })}
          </div>
        )}
      </main>

      {list.length > 0 && (
        <Link
          href="/trip/new"
          className="fixed bottom-8 right-container-padding z-40 w-14 h-14 bg-gradient-to-br from-primary to-secondary-container rounded-full shadow-[0px_8px_20px_rgba(59,130,246,0.3)] flex items-center justify-center text-on-primary hover:scale-105 active:scale-95 transition-transform"
          aria-label="Create trip"
        >
          <Plus className="w-7 h-7" />
        </Link>
      )}

    </div>
  );
}
