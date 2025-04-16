import Link from "next/link";
import { AuctionCard } from "../../components/auctions/AuctionCard";
import { prisma } from "../../lib/prisma";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Auctions | Sealed Bid Auction System",
  description: "Browse and participate in active sealed bid auctions",
};

export default async function AuctionsPage() {
  const auctions = await prisma.auction.findMany({
    include: {
      creator: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          bids: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Auctions</h1>
          <p className="text-gray-600">Browse active sealed bid auctions</p>
        </div>
        <Link
          href="/auctions/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          Create Auction
        </Link>
      </div>

      {auctions.length === 0 ? (
        <div className="text-center p-12 border rounded-lg">
          <h2 className="text-2xl font-semibold mb-2">No Auctions Yet</h2>
          <p className="text-gray-600 mb-6">
            Be the first to create an auction!
          </p>
          <Link
            href="/auctions/create"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Create Auction
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {auctions.map((auction) => (
            <AuctionCard
              key={auction.id}
              id={auction.id}
              title={auction.title}
              description={auction.description}
              minimumBid={auction.minimumBid}
              endTime={auction.endTime}
              creatorName={auction.creator.name}
            />
          ))}
        </div>
      )}
    </div>
  );
}
