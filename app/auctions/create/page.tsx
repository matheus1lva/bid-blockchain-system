import { AuctionForm } from "@/components/auctions/AuctionForm";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../../lib/auth";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Auction | Sealed Bid Auction System",
  description: "Create a new sealed bid auction",
};

export default async function CreateAuctionPage() {
  const session = await getServerSession(authOptions);

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create a New Auction</h1>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <AuctionForm />
        </div>
      </div>
    </div>
  );
}
