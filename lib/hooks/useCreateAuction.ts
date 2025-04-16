"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface CreateAuctionParams {
  title: string;
  description?: string;
  minimumBid: number;
  endTime: string; // ISO date string
}

/**
 * Custom hook for creating auctions
 */
export function useCreateAuction() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const createAuction = async (data: CreateAuctionParams) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch("/api/auctions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create auction");
      }

      const auction = await response.json();
      router.push(`/auctions/${auction.id}`);
      return auction;
    } catch (err) {
      console.error("Error creating auction:", err);
      setError(err instanceof Error ? err.message : "Failed to create auction");
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    createAuction,
    isSubmitting,
    error,
  };
}
