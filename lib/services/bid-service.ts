import { Prisma } from "@/src/generated/prisma";
import { BidWithBidder } from "@/types";
import { BaseService } from "./base-service";

export class BidService extends BaseService {
  async createBid(data: Prisma.BidCreateInput) {
    return this.prisma.bid.create({
      data,
    });
  }

  /**
   * Get bids for a specific auction
   * @param auctionId Auction ID
   * @returns Array of bids with bidder information
   */
  async getBidsByAuction(auctionId: string): Promise<BidWithBidder[]> {
    return this.prisma.bid.findMany({
      where: {
        auctionId,
      },
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
    });
  }

  /**
   * Get bids placed by a specific user
   * @param userId User ID
   */
  async getBidsByUser(userId: string) {
    return this.prisma.bid.findMany({
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
  }

  /**
   * Check if a user has already bid on an auction
   * @param auctionId Auction ID
   * @param userId User ID
   */
  async hasUserBidOnAuction(
    auctionId: string,
    userId: string
  ): Promise<boolean> {
    const count = await this.prisma.bid.count({
      where: {
        auctionId,
        bidderId: userId,
      },
    });

    return count > 0;
  }
}
