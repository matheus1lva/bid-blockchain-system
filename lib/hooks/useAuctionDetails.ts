"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuctionDetails } from "@/types";

interface UseAuctionDetailsOptions {
  refreshInterval?: number;
}

/**
 * Custom hook for fetching auction details
 */
export function useAuctionDetails(
  auctionId: string,
  options: UseAuctionDetailsOptions = {}
) {
  const [auction, setAuction] = useState<AuctionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const { refreshInterval = 0 } = options;

  const fetchAuctionDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/auctions/${auctionId}`);

      if (!response.ok) {
        if (response.status === 404) {
          router.push("/auctions");
          return;
        }

        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch auction details");
      }

      const data = await response.json();
      setAuction(data);
    } catch (err) {
      console.error("Error fetching auction details:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch auction details"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctionDetails();

    // Set up polling if refreshInterval is provided
    if (refreshInterval > 0) {
      const intervalId = setInterval(fetchAuctionDetails, refreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [auctionId, refreshInterval, router]);

  const refreshAuction = () => {
    fetchAuctionDetails();
    router.refresh();
  };

  return {
    auction,
    isLoading,
    error,
    refreshAuction,
  };
}
