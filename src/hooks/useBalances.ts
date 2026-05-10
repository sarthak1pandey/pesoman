"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useBalances(tripId: string) {
  return useQuery({
    queryKey: ["trips", tripId, "balances"],
    queryFn: async () => {
      const res = await fetch(`/api/trips/${tripId}/balances`);
      if (!res.ok) throw new Error("Failed to fetch balances");
      return res.json();
    },
  });
}

export function useCreateSettlement(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`/api/trips/${tripId}/settlements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to record settlement");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trips", tripId] });
      queryClient.invalidateQueries({ queryKey: ["trips", tripId, "balances"] });
      queryClient.invalidateQueries({ queryKey: ["trips", tripId, "settlements"] });
    },
  });
}
