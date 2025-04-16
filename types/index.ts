/**
 * Auction with basic information
 */
export interface AuctionSummary {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  minimumBid: number;
  endTime: Date;
  createdAt: Date;
  updatedAt: Date;
  creator: {
    id: string;
    name: string;
  };
  _count: {
    bids: number;
  };
}

/**
 * Bid with bidder information
 */
export interface BidWithBidder {
  id: string;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
  bidder: {
    id: string;
    name: string;
  };
}

/**
 * Auction with detailed information including bids
 */
export interface AuctionDetails extends AuctionSummary {
  bids: BidWithBidder[];
  isEnded: boolean;
  isCreator: boolean;
  hasBid: boolean;
}

/**
 * User profile information
 */
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  walletAddress?: string | null;
}

/**
 * API error response
 */
export interface ApiError {
  message: string;
  code?: string;
  details?: any;
}
