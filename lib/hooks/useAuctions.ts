"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuctionSummary } from "@/types";

interface UseAuctionsOptions {
  refreshInterval?: number;
}

export function useAuctions(options: UseAuctionsOptions = {}) {
  const [auctions, setAuctions] = useState<AuctionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { refreshInterval = 0 } = options;

  const fetchAuctions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/auctions");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch auctions");
      }

      const data = await response.json();
      setAuctions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch auctions");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();

    if (refreshInterval > 0) {
      const intervalId = setInterval(fetchAuctions, refreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [refreshInterval]);

  const refreshAuctions = () => {
    fetchAuctions();
    router.refresh();
  };

  return {
    auctions,
    isLoading,
    error,
    refreshAuctions,
  };
}
