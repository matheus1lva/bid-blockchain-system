"use client";

import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Button } from "../ui/Button";

type AuctionCardProps = {
  id: string;
  title: string;
  description?: string | null;
  minimumBid: number;
  endTime: Date;
  creatorName: string;
};

export function AuctionCard({
  id,
  title,
  description,
  minimumBid,
  endTime,
  creatorName,
}: AuctionCardProps) {
  const isEnded = new Date() > new Date(endTime);

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2 truncate">
          <Link
            href={`/auctions/${id}`}
            className="hover:text-blue-600 transition"
          >
            {title}
          </Link>
        </h3>

        {description && (
          <p className="text-gray-600 mb-4 line-clamp-2">{description}</p>
        )}

        <div className="flex justify-between mb-4">
          <div>
            <p className="text-sm text-gray-500">Min. Bid</p>
            <p className="font-semibold">${minimumBid.toFixed(2)}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              {isEnded ? "Ended" : "Ends"}
            </p>
            <p
              className={`font-semibold ${
                isEnded ? "text-red-600" : "text-green-600"
              }`}
            >
              {isEnded
                ? "Auction ended"
                : formatDistanceToNow(new Date(endTime), { addSuffix: true })}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">by {creatorName}</span>

          <Button variant={isEnded ? "secondary" : "default"} size="sm" asChild>
            <Link href={`/auctions/${id}`}>
              {isEnded ? "View Results" : "Place Bid"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
