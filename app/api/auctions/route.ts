import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { z } from "zod";
import {
  createErrorResponse,
  createSuccessResponse,
  ErrorCodes,
} from "../../../lib/api-utils";
import { AuctionService } from "../../../lib/services";

// Schema for auction creation
const createAuctionSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  minimumBid: z.number().positive("Minimum bid must be positive"),
  endTime: z.string().datetime("End time must be a valid ISO datetime"),
});

// GET /api/auctions - List all auctions
export async function GET() {
  try {
    const auctionService = new AuctionService();
    const auctions = await auctionService.getAllAuctions();

    return createSuccessResponse(auctions);
  } catch (error) {
    return createErrorResponse(
      "Error fetching auctions",
      500,
      ErrorCodes.INTERNAL_ERROR,
      error
    );
  }
}

// POST /api/auctions - Create a new auction
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return createErrorResponse(
        "You must be logged in to create an auction",
        401,
        ErrorCodes.UNAUTHORIZED
      );
    }

    const body = await request.json();

    // Validate request body
    const validation = createAuctionSchema.safeParse(body);
    if (!validation.success) {
      return createErrorResponse(
        "Invalid auction data",
        400,
        ErrorCodes.VALIDATION_ERROR,
        validation.error.errors
      );
    }

    const { title, description, minimumBid, endTime } = validation.data;

    // Ensure end time is in the future
    if (new Date(endTime) <= new Date()) {
      return createErrorResponse(
        "End time must be in the future",
        400,
        ErrorCodes.VALIDATION_ERROR
      );
    }

    // Create auction
    const auctionService = new AuctionService();
    const auction = await auctionService.createAuction({
      title,
      description,
      minimumBid,
      endTime: new Date(endTime),
      creator: {
        connect: { id: session.user.id },
      },
    });

    return createSuccessResponse(auction, 201);
  } catch (error) {
    return createErrorResponse(
      "Error creating auction",
      500,
      ErrorCodes.INTERNAL_ERROR,
      error
    );
  }
}
