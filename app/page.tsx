import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="max-w-5xl w-full">
        <h1 className="text-4xl font-bold text-center mb-8">
          Sealed Bid Auction System
        </h1>

        <p className="text-lg text-center mb-12">
          Create and participate in auctions with sealed bids. No one sees the
          bids until the auction concludes.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="border rounded-lg p-6 shadow-md">
            <h2 className="text-2xl font-bold mb-4">Create an Auction</h2>
            <p className="mb-4">
              Start your own auction by setting a title, minimum bid, and end
              time.
            </p>
            <Link
              href="/auctions/create"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Create Auction
            </Link>
          </div>

          <div className="border rounded-lg p-6 shadow-md">
            <h2 className="text-2xl font-bold mb-4">Browse Auctions</h2>
            <p className="mb-4">
              Find active auctions to place your bids. Winners are revealed when
              auctions end.
            </p>
            <Link
              href="/auctions"
              className="inline-block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
            >
              View Auctions
            </Link>
          </div>
        </div>

        <div className="border rounded-lg p-6 shadow-md">
          <h2 className="text-2xl font-bold mb-4">How It Works</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Create an account or sign in</li>
            <li>Browse active auctions or create your own</li>
            <li>Place a sealed bid that remains hidden from other users</li>
            <li>
              Wait for the auction to conclude to see all bids and winners
            </li>
          </ol>
        </div>
      </div>
    </main>
  );
}
