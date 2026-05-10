"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";

export default function JoinPage() {
  const { token } = useParams() as { token: string };
  const { data: session } = useSession();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "joining" | "joined" | "error">("loading");
  const [tripName, setTripName] = useState("");

  useEffect(() => {
    if (!session) {
      setStatus("loading");
      return;
    }

    // User is logged in, try to join the trip
    setStatus("joining");
    fetch(`/api/trips/verify-invite?token=${token}`)
      .then((res) => {
        if (!res.ok) throw new Error("Invalid invite");
        return res.json();
      })
      .then((trip) => {
        setTripName(trip.name);
        return fetch(`/api/trips/${trip.id}/members`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: session.user?.email }),
        }).then(() => trip.id as string);
      })
      .then((tripId) => {
        setStatus("joined");
        setTimeout(() => router.push(`/trip/${tripId}`), 1500);
      })
      .catch(() => {
        setStatus("error");
      });
  }, [session, token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-container-low px-container-padding">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-lg border border-outline-variant p-8 text-center">
        {status === "loading" && !session && (
          <>
            <h1 className="font-display text-display text-primary mb-4">Join Trip</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">
              Sign in to join this trip on Pesoman.
            </p>
            <button
              onClick={() => signIn("credentials", { email: "demo@pesoman.app", callbackUrl: `/join/${token}` })}
              className="w-full bg-gradient-to-r from-primary to-secondary text-on-primary font-label-md text-label-md py-3 rounded-lg shadow-md hover:opacity-90 transition-opacity"
            >
              Sign In to Join
            </button>
          </>
        )}

        {status === "joining" && (
          <div className="py-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-body-md text-body-md text-on-surface">Joining trip...</p>
          </div>
        )}

        {status === "joined" && (
          <>
            <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎉</span>
            </div>
            <h1 className="font-h1 text-h1 text-on-surface mb-2">Joined!</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mb-4">
              You&apos;ve joined {tripName || "the trip"}.
            </p>
            <Link
              href="/dashboard"
              className="text-primary font-label-md text-label-md hover:underline"
            >
              Go to Dashboard
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <h1 className="font-h1 text-h1 text-error mb-2">Oops!</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mb-4">
              This invite link is invalid or has expired.
            </p>
            <Link
              href="/dashboard"
              className="text-primary font-label-md text-label-md hover:underline"
            >
              Back to Dashboard
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
