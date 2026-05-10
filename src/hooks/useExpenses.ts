"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useExpenses(tripId: string) {
  return useQuery({
    queryKey: ["trips", tripId, "expenses"],
    queryFn: async () => {
      const res = await fetch(`/api/trips/${tripId}/expenses`);
      if (!res.ok) throw new Error("Failed to fetch expenses");
      return res.json();
    },
  });
}

export function useCreateExpense(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/trips/${tripId}/expenses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create expense");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips", tripId] });
      queryClient.invalidateQueries({ queryKey: ["trips", tripId, "expenses"] });
      queryClient.invalidateQueries({ queryKey: ["trips", tripId, "balances"] });
    },
  });
}
