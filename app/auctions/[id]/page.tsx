import { notFound } from "next/navigation";
import { formatDistance } from "date-fns";
import { prisma } from "../../../lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { BidForm } from "../../../components/bids/BidForm";
import { BidList } from "../../../components/bids/BidList";
import Link from "next/link";
import { Metadata } from "next";

interface AuctionPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: AuctionPageProps): Promise<Metadata> {
  const auction = await prisma.auction.findUnique({
    where: { id: params.id },
    select: {
      title: true,
      description: true,
    },
  });

  if (!auction) {
    return {
      title: "Auction Not Found",
    };
  }

  return {
    title: `${auction.title} | Sealed Bid Auction`,
    description:
      auction.description || "Participate in this sealed bid auction",
  };
}

export default async function AuctionPage({ params }: AuctionPageProps) {
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;

  const auction = await prisma.auction.findUnique({
    where: { id: params.id },
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      bids: {
        include: {
          bidder: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          amount: "desc",
        },
      },
      _count: {
        select: {
          bids: true,
        },
      },
    },
  });

  if (!auction) {
    notFound();
  }

  const isEnded = new Date() > new Date(auction.endTime);
  const isCreator = auction.creator.id === currentUserId;

  // Filter bids if auction hasn't ended
  const visibleBids = isEnded
    ? auction.bids
    : auction.bids.filter((bid) => bid.bidderId === currentUserId);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link
          href="/auctions"
          className="text-blue-600 hover:text-blue-800 transition flex items-center gap-1"
        >
          ← Back to Auctions
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg border shadow-sm mb-6">
            <div className="flex justify-between items-start">
              <h1 className="text-3xl font-bold mb-4">{auction.title}</h1>

              <div className="text-right">
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isEnded
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {isEnded ? "Ended" : "Active"}
                </div>
              </div>
            </div>

            {auction.description && (
              <div className="mb-6">
                <p className="text-gray-700 whitespace-pre-line">
                  {auction.description}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p className="text-sm text-gray-500">Minimum Bid</p>
                <p className="text-xl font-semibold">
                  ${auction.minimumBid.toFixed(2)}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">
                  {isEnded ? "Ended" : "Ends"}
                </p>
                <p className="text-xl font-semibold">
                  {formatDistance(new Date(auction.endTime), new Date(), {
                    addSuffix: true,
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>Created by {auction.creator.name}</span>
              <span>•</span>
              <span>Total Bids: {auction._count.bids}</span>
            </div>
          </div>

          <BidList
            bids={visibleBids}
            auctionEnded={isEnded}
            currentUserId={currentUserId}
          />
        </div>

        <div>
          {!isCreator && session?.user ? (
            <BidForm
              auctionId={auction.id}
              minimumBid={auction.minimumBid}
              isEnded={isEnded}
            />
          ) : isCreator ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="font-medium mb-2">This is your auction</p>
              <p className="text-sm text-gray-600">
                You cannot bid on your own auctions.
              </p>
            </div>
          ) : (
            <div className="p-4 bg-gray-50 border rounded-lg">
              <p className="font-medium mb-2">Sign in to place a bid</p>
              <p className="text-sm text-gray-600 mb-4">
                You need to sign in before you can place bids on auctions.
              </p>
              <Link
                href="/api/auth/signin"
                className="block w-full text-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
