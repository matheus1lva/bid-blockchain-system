"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "../ui/Button";
import { useCreateAuction } from "@/lib/hooks";

// Define the form schema with zod
const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  minimumBid: z.coerce.number().positive("Minimum bid must be positive"),
  endDate: z.string().refine((date) => {
    const selectedDate = new Date(date);
    const now = new Date();
    return selectedDate > now;
  }, "End date must be in the future"),
  endTime: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export function AuctionForm() {
  const { createAuction, isSubmitting, error } = useCreateAuction();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      minimumBid: 1,
      endDate: "",
      endTime: "23:59",
    },
  });

  const onSubmit = async (data: FormValues) => {
    // Combine date and time
    const endDateTime = new Date(`${data.endDate}T${data.endTime}:00`);

    await createAuction({
      title: data.title,
      description: data.description,
      minimumBid: data.minimumBid,
      endTime: endDateTime.toISOString(),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium mb-1">
          Title *
        </label>
        <input
          id="title"
          type="text"
          className="w-full p-2 border rounded-md"
          {...register("title")}
          disabled={isSubmitting}
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium mb-1">
          Description (optional)
        </label>
        <textarea
          id="description"
          rows={4}
          className="w-full p-2 border rounded-md"
          {...register("description")}
          disabled={isSubmitting}
        />
      </div>

      <div>
        <label htmlFor="minimumBid" className="block text-sm font-medium mb-1">
          Minimum Bid ($) *
        </label>
        <input
          id="minimumBid"
          type="number"
          step="0.01"
          min="0.01"
          className="w-full p-2 border rounded-md"
          {...register("minimumBid")}
          disabled={isSubmitting}
        />
        {errors.minimumBid && (
          <p className="text-red-500 text-sm mt-1">
            {errors.minimumBid.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium mb-1">
            End Date *
          </label>
          <input
            id="endDate"
            type="date"
            className="w-full p-2 border rounded-md"
            {...register("endDate")}
            disabled={isSubmitting}
          />
          {errors.endDate && (
            <p className="text-red-500 text-sm mt-1">
              {errors.endDate.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="endTime" className="block text-sm font-medium mb-1">
            End Time *
          </label>
          <input
            id="endTime"
            type="time"
            className="w-full p-2 border rounded-md"
            {...register("endTime")}
            disabled={isSubmitting}
          />
          {errors.endTime && (
            <p className="text-red-500 text-sm mt-1">
              {errors.endTime.message}
            </p>
          )}
        </div>
      </div>

      {error && (
        <div className="p-2 bg-red-100 border border-red-300 rounded-md text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create Auction"}
        </Button>
      </div>
    </form>
  );
}
