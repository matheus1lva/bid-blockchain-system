# Sealed Bid Auction System

A web application for creating and participating in sealed bid auctions. Bids remain hidden from other users until the auction concludes.

## Documentation

- **Solidity Blockchain Integration**: [docs/BLOCKCHAIN_INTEGRATION.md](docs/BLOCKCHAIN_INTEGRATION.md)
- **Enhanced Privacy with zero-knowledge proofs and homomorphic encryption**: [docs/ENHANCED_PRIVACY.md](docs/ENHANCED_PRIVACY.md)

## Features

- **Auction Creation**: Create auctions with title, description, minimum bid, and end time
- **Sealed Bidding**: Place bids that remain hidden from other users until the auction ends
- **Auction Results**: View all bids and winners after auction conclusion
- **User Dashboard**: Manage your auctions and track your bids

## Tech Stack

- **Frontend**: Next.js 15.2 with React 19, TailwindCSS
- **Backend**: Next.js API routes (serverless)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Containerization**: Docker and Docker Compose for easy setup

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm/yarn
- Docker and Docker Compose (recommended) OR PostgreSQL database

### Getting started

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/sealed-bid-auction.git
   cd sealed-bid-auction
   ```

2. Install dependencies:

   ```bash
   yarn install
   ```

3. Create a `.env` file in the root directory with the following variables:

   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/sealedauction?schema=public"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   ```

4. Set up the database:

   ```bash
   npx prisma migrate dev --name init
   ```

5. Start the development server:

   ```bash
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## System Architecture

The application follows a modern full-stack architecture:

- **Next.js App Router**: Server and client components with routing
- **React Server Components**: For efficient data fetching
- **API Routes**: Next.js API routes for backend functionality
- **Service Layer**: Encapsulates business logic and database operations
- **Custom Hooks**: Reusable React hooks for data fetching and mutations
- **Database Schema**:
  - Users: Store user information and authentication data
  - Auctions: Store auction details (title, description, minimum bid, end time)
  - Bids: Store bid information with relationships to users and auctions
- **Authentication**: NextAuth.js for secure user authentication
- **Data Flow**:
  - Server components fetch data directly from the database
  - Client components use custom hooks for data fetching and mutations
  - Service layer provides a clean API for database operations
  - Prisma ORM provides type-safe database access

## Technical Decisions and Trade-offs

- **Next.js Framework**: Chosen for its server-side rendering capabilities, API routes, and React Server Components, eliminating the need for a separate backend service. More precisely for this POC, giving much more speed! In a real world example the api and ui logic would be split into another microservice, which is more reliable to have scalability!
- **Prisma ORM**: Used for type-safe database queries and schema migrations, providing better developer experience at the cost of a small performance overhead.
- **PostgreSQL**: Selected for relational data modeling needs and ACID compliance, essential for handling financial transactions like bids.
- **Sealed Bid Implementation**: Bids are stored in the database but only revealed after auction end time is reached. This approach balances simplicity with the security requirements.
- **Server-side Bid Validation**: All bid validation happens on the server to prevent client-side tampering.

## Future Improvements

- Add real-time updates with WebSockets or Server-Sent Events
- Implement image uploads for auction items
- Add email notifications for auction events (creation, bidding, conclusion)
- Add comprehensive test suite with Jest and React Testing Library
- Implement caching for improved performance
