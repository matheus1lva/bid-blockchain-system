"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface PlaceBidParams {
  auctionId: string;
  amount: number;
}

/**
 * Custom hook for placing bids
 */
export function usePlaceBid() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const placeBid = async ({ auctionId, amount }: PlaceBidParams) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch(`/api/auctions/${auctionId}/bids`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to place bid");
      }

      const data = await response.json();
      router.refresh();
      return data;
    } catch (err) {
      console.error("Error placing bid:", err);
      setError(err instanceof Error ? err.message : "Failed to place bid");
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    placeBid,
    isSubmitting,
    error,
  };
}
