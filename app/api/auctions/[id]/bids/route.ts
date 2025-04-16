import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import {
  createErrorResponse,
  createSuccessResponse,
  ErrorCodes,
} from "@/lib/api-utils";
import { AuctionService, BidService } from "@/lib/services";

// Schema for bid validation
const createBidSchema = z.object({
  amount: z.number().positive("Bid amount must be positive"),
});

// POST /api/auctions/[id]/bids - Place a bid on an auction
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return createErrorResponse(
        "You must be logged in to place a bid",
        401,
        ErrorCodes.UNAUTHORIZED
      );
    }

    const auctionId = params.id;
    const userId = session.user.id;

    // Get the auction
    const auctionService = new AuctionService();
    const auction = await auctionService.getAuctionById(auctionId);

    if (!auction) {
      return createErrorResponse(
        "Auction not found",
        404,
        ErrorCodes.NOT_FOUND
      );
    }

    // Check if auction has ended
    if (new Date() > new Date(auction.endTime)) {
      return createErrorResponse(
        "This auction has ended",
        400,
        ErrorCodes.AUCTION_ENDED
      );
    }

    // Check if user is the creator of the auction
    if (auction.creatorId === userId) {
      return createErrorResponse(
        "You cannot bid on your own auction",
        400,
        ErrorCodes.FORBIDDEN
      );
    }

    // Parse and validate the request body
    const body = await request.json();
    const validation = createBidSchema.safeParse(body);

    if (!validation.success) {
      return createErrorResponse(
        "Invalid bid data",
        400,
        ErrorCodes.VALIDATION_ERROR,
        validation.error.errors
      );
    }

    const { amount } = validation.data;

    // Check if bid amount meets minimum bid
    if (amount < auction.minimumBid) {
      return createErrorResponse(
        `Bid must be at least $${auction.minimumBid}`,
        400,
        ErrorCodes.INVALID_BID
      );
    }

    // Create the bid
    const bidService = new BidService();
    const bid = await bidService.createBid({
      amount,
      auction: {
        connect: { id: auctionId },
      },
      bidder: {
        connect: { id: userId },
      },
    });

    return createSuccessResponse(bid, 201);
  } catch (error) {
    return createErrorResponse(
      "Error placing bid",
      500,
      ErrorCodes.INTERNAL_ERROR,
      error
    );
  }
}
