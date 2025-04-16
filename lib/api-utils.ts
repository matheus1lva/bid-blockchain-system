import { NextResponse } from "next/server";

export type ApiError = {
  message: string;
  code?: string;
  details?: any;
};

export function createErrorResponse(
  message: string,
  status: number,
  code?: string,
  details?: any
) {
  const error: ApiError = {
    message,
    ...(code && { code }),
    ...(details && { details }),
  };

  return NextResponse.json(error, { status });
}

export function createSuccessResponse(data: any, status: number = 200) {
  return NextResponse.json(data, { status });
}

export const ErrorCodes = {
  UNAUTHORIZED: "UNAUTHORIZED",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  FORBIDDEN: "FORBIDDEN",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  AUCTION_ENDED: "AUCTION_ENDED",
  INVALID_BID: "INVALID_BID",
};
