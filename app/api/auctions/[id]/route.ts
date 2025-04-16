import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  createErrorResponse,
  createSuccessResponse,
  ErrorCodes,
} from "@/lib/api-utils";
import { AuctionService } from "@/lib/services";

// GET /api/auctions/[id] - Get auction details
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id;

    const auctionService = new AuctionService();
    const auction = await auctionService.getAuctionById(id, currentUserId);

    if (!auction) {
      return createErrorResponse(
        "Auction not found",
        404,
        ErrorCodes.NOT_FOUND
      );
    }

    // Return auction with filtered bids
    return createSuccessResponse(auction);
  } catch (error) {
    return createErrorResponse(
      "Error getting auction",
      500,
      ErrorCodes.INTERNAL_ERROR,
      error
    );
  }
}
