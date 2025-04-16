"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../ui/Button";
import { usePlaceBid } from "@/lib/hooks";

interface BidFormProps {
  auctionId: string;
  minimumBid: number;
  isEnded: boolean;
}

const formSchema = z.object({
  amount: z.coerce.number().positive("Bid amount must be positive"),
});

type FormValues = z.infer<typeof formSchema>;

export function BidForm({ auctionId, minimumBid, isEnded }: BidFormProps) {
  const { placeBid, isSubmitting, error } = usePlaceBid();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(
      formSchema.refine((data) => data.amount >= minimumBid, {
        message: `Bid must be at least $${minimumBid.toFixed(2)}`,
        path: ["amount"],
      })
    ),
    defaultValues: {
      amount: minimumBid,
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (isEnded) {
      return;
    }

    const result = await placeBid({
      auctionId,
      amount: data.amount,
    });

    if (result) {
      reset();
    }
  };

  if (isEnded) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg text-center">
        <p className="text-lg font-semibold mb-2">This auction has ended</p>
        <p className="text-gray-600">Bids are no longer accepted</p>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Place Your Bid</h3>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="bidAmount" className="block text-sm font-medium mb-1">
            Your Bid Amount ($)
          </label>
          <input
            id="bidAmount"
            type="number"
            step="0.01"
            min={minimumBid}
            className="w-full p-2 border rounded-md"
            {...register("amount")}
            disabled={isSubmitting}
          />
          {errors.amount && (
            <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
          )}
        </div>

        {error && (
          <div className="p-2 bg-red-100 border border-red-300 rounded-md text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col space-y-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Placing Bid..." : "Place Bid"}
          </Button>

          <p className="text-xs text-gray-500 mt-2">
            Note: Bids are sealed and not visible to other users until the
            auction ends. Once placed, bids cannot be modified or cancelled.
          </p>
        </div>
      </form>
    </div>
  );
}
