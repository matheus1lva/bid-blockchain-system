import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "./prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      id: "web3",
      name: "Web3",
      credentials: {
        address: { label: "Address", type: "text" },
        signature: { label: "Signature", type: "text" },
        message: { label: "Message", type: "text" },
      },
      async authorize(credentials) {
        if (
          !credentials?.address ||
          !credentials?.signature ||
          !credentials?.message
        ) {
          return null;
        }

        try {
          // Verify the signature matches the address that signed the message
          const { ethers } = await import("ethers");
          const address = credentials.address;
          const message = credentials.message;
          const signature = credentials.signature;

          try {
            // Directly verify the signature with ethers
            const recoveredAddress = ethers.utils.verifyMessage(
              message,
              signature
            );

            // Check if the recovered address matches the claimed address
            if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
              console.error("Address mismatch", {
                recoveredAddress: recoveredAddress.toLowerCase(),
                providedAddress: address.toLowerCase(),
              });
              return null;
            }
          } catch (err) {
            console.error("Error verifying signature:", err);
            return null;
          }

          // Get or create user in the database
          let user = await prisma.user.findUnique({
            where: { walletAddress: address.toLowerCase() },
          });

          if (!user) {
            user = await prisma.user.create({
              data: {
                walletAddress: address.toLowerCase(),
                name: `${address.substring(0, 6)}...${address.substring(38)}`,
                email: `${address.toLowerCase()}@wallet.user`, // Create a placeholder email
              },
            });
          }

          return user;
        } catch (error) {
          console.error("Web3 authentication error:", error);
          return null;
        }
      },
    }),
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // This is a simplified example - in a real app, you would:
        // 1. Hash passwords before storing
        // 2. Compare hashed passwords
        // 3. Implement proper auth logic

        // For demo purposes, just check if the email exists
        if (!credentials?.email) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        // If no user was found, create one (demo only)
        if (!user) {
          const newUser = await prisma.user.create({
            data: {
              email: credentials.email,
              name: credentials.email.split("@")[0],
            },
          });
          return newUser;
        }

        return user;
      },
    }),
  ],
  session: {
    strategy: "jwt" as const,
  },
  pages: {
    signIn: "/auth/signin",
  },
  callbacks: {
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub as string;
        // Add wallet address to session if available
        const user = await prisma.user.findUnique({
          where: { id: token.sub as string },
          select: { walletAddress: true },
        });
        if (user?.walletAddress) {
          session.user.walletAddress = user.walletAddress;
        }
      }
      return session;
    },
  },
};
