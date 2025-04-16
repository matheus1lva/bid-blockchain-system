"use client";

import { formatDistance } from "date-fns";
import { BidWithBidder } from "@/types";

interface BidListProps {
  bids: BidWithBidder[];
  auctionEnded: boolean;
  currentUserId?: string;
}

export function BidList({ bids, auctionEnded, currentUserId }: BidListProps) {
  // Sort bids by amount (highest first)
  const sortedBids = [...bids].sort((a, b) => b.amount - a.amount);
  const winningBid = sortedBids.length > 0 ? sortedBids[0] : null;

  if (!auctionEnded) {
    return (
      <div className="p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Bids</h3>
        <p className="text-gray-600">
          Bids are sealed until the auction concludes.
          {bids.filter((bid) => bid.bidder.id === currentUserId).length > 0 &&
            " You have placed a bid on this auction."}
        </p>
      </div>
    );
  }

  if (bids.length === 0) {
    return (
      <div className="p-4 border rounded-lg">
        <h3 className="text-lg font-semibold mb-2">No Bids</h3>
        <p className="text-gray-600">No bids were placed on this auction.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <h3 className="text-lg font-semibold p-4 bg-gray-50 border-b">
        All Bids ({bids.length})
      </h3>

      {winningBid && (
        <div className="p-4 bg-green-50 border-b">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-semibold">
                Winning Bid: ${winningBid.amount.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">
                by {winningBid.bidder.name} •{" "}
                {formatDistance(new Date(winningBid.createdAt), new Date(), {
                  addSuffix: true,
                })}
              </p>
            </div>
            {winningBid.bidder.id === currentUserId && (
              <span className="bg-green-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                You Won!
              </span>
            )}
          </div>
        </div>
      )}

      <ul className="divide-y">
        {sortedBids.map((bid) => (
          <li
            key={bid.id}
            className={`p-4 flex justify-between items-center ${
              bid.bidder.id === currentUserId ? "bg-blue-50" : ""
            }`}
          >
            <div>
              <p className="font-medium">${bid.amount.toFixed(2)}</p>
              <p className="text-sm text-gray-600">
                by {bid.bidder.name} •{" "}
                {formatDistance(new Date(bid.createdAt), new Date(), {
                  addSuffix: true,
                })}
              </p>
            </div>
            {bid.bidder.id === currentUserId && (
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                Your Bid
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
