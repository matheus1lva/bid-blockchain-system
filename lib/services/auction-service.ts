import { Prisma } from "@/src/generated/prisma";
import { AuctionDetails, AuctionSummary } from "@/types";
import { BaseService } from "./base-service";

export class AuctionService extends BaseService {
  async getAllAuctions(): Promise<AuctionSummary[]> {
    return this.prisma.auction.findMany({
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
  }

  async getAuctionById(
    id: string,
    currentUserId?: string
  ): Promise<AuctionDetails | null> {
    const auction = await this.prisma.auction.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
        bids: {
          where: {
            OR: [
              { auctionId: id, auction: { endTime: { lte: new Date() } } },
              { bidderId: currentUserId || "" },
            ],
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
        },
        _count: {
          select: {
            bids: true,
          },
        },
      },
    });

    if (!auction) {
      return null;
    }

    const isEnded = new Date() > new Date(auction.endTime);

    const bids = isEnded
      ? auction.bids
      : auction.bids.filter((bid) => bid.bidderId === currentUserId);

    return {
      ...auction,
      bids,
      isEnded,
      isCreator: auction.creatorId === currentUserId,
      hasBid: auction.bids.some((bid) => bid.bidderId === currentUserId),
    };
  }

  async createAuction(data: Prisma.AuctionCreateInput) {
    return this.prisma.auction.create({
      data,
    });
  }

  async getAuctionsByCreator(userId: string) {
    return this.prisma.auction.findMany({
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
  }
}
