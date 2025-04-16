import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { AuctionCard } from "@/components/auctions/AuctionCard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | Sealed Bid Auction System",
  description: "Manage your auctions and bids",
};

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/dashboard");
  }

  const userId = session.user.id;

  // Get user's auctions
  const myAuctions = await prisma.auction.findMany({
    where: {
      creatorId: userId,
    },
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

  // Get auctions user has bid on
  const myBids = await prisma.bid.findMany({
    where: {
      bidderId: userId,
    },
    include: {
      auction: {
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
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Get unique auctions from bids
  const auctionIdsWithBids = new Set();
  const auctionsWithMyBids = myBids
    .filter((bid) => {
      if (!auctionIdsWithBids.has(bid.auction.id)) {
        auctionIdsWithBids.add(bid.auction.id);
        return true;
      }
      return false;
    })
    .map((bid) => bid.auction);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="space-y-12">
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">My Auctions</h2>
            <Link
              href="/auctions/create"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Create Auction
            </Link>
          </div>

          {myAuctions.length === 0 ? (
            <div className="text-center p-12 border rounded-lg">
              <h3 className="text-xl font-semibold mb-2">
                No Auctions Created
              </h3>
              <p className="text-gray-600 mb-6">
                You haven't created any auctions yet.
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
              {myAuctions.map((auction) => (
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
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6">My Bids</h2>

          {auctionsWithMyBids.length === 0 ? (
            <div className="text-center p-12 border rounded-lg">
              <h3 className="text-xl font-semibold mb-2">No Bids Placed</h3>
              <p className="text-gray-600 mb-6">
                You haven't placed any bids yet.
              </p>
              <Link
                href="/auctions"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
              >
                Browse Auctions
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {auctionsWithMyBids.map((auction) => (
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
        </section>
      </div>
    </div>
  );
}
