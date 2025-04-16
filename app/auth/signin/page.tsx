"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAccount } from "wagmi";

interface EthereumWindow extends Window {
  ethereum?: {
    request: (args: {
      method: string;
      params?: Array<string | string[] | number | object>;
    }) => Promise<unknown>;
  };
}

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const error = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWeb3Loading, setIsWeb3Loading] = useState(false);

  const { address, isConnected } = useAccount();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const result = await signIn("credentials", {
        email,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      router.push(callbackUrl);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWeb3Login = async () => {
    try {
      setIsWeb3Loading(true);

      if (!isConnected) {
        try {
          const { ethereum } = window as EthereumWindow;
          if (ethereum) {
            await ethereum.request({ method: "eth_requestAccounts" });
            setTimeout(() => {}, 1000);
          } else {
            alert("Please install a Web3 wallet like MetaMask");
            return;
          }
        } catch {
          alert("Failed to connect to your wallet. Please try again.");
          return;
        }
      }

      if (!address) {
        alert(
          "No Ethereum address found. Please make sure your wallet is connected properly."
        );
        return;
      }

      const nonce = Math.floor(Math.random() * 1000000).toString();
      const currentDate = new Date().toISOString();

      const messageToSign = `${window.location.host} wants you to sign in with your Ethereum account:
${address}

Sign in with Ethereum to the Sealed Bid Auction App

URI: ${window.location.origin}
Version: 1
Chain ID: 1
Nonce: ${nonce}
Issued At: ${currentDate}`;

      try {
        const { ethereum } = window as EthereumWindow;

        if (!ethereum) {
          throw new Error("MetaMask not found");
        }

        const signature = (await ethereum.request({
          method: "personal_sign",
          params: [messageToSign, address],
        })) as string;

        const result = await signIn("web3", {
          address,
          message: messageToSign,
          signature,
          redirect: false,
          callbackUrl,
        });

        if (result?.error) {
          alert(`Authentication failed: ${result.error}`);
        } else {
          router.push(callbackUrl);
        }
      } catch {
        alert("Failed to sign the message or authenticate. Please try again.");
      }
    } catch {
      alert("Web3 login failed.");
    } finally {
      setIsWeb3Loading(false);
    }
  };

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white p-8 rounded-lg border shadow-sm">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Sign in to SealedBid
          </h1>

          {error && (
            <div className="bg-red-100 p-3 rounded-md text-red-700 text-sm mb-6">
              {error === "CredentialsSignin"
                ? "Invalid email"
                : "An error occurred while signing in"}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded-md"
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Signing in..." : "Sign in / Sign up with Email"}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleWeb3Login}
                className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                disabled={isWeb3Loading}
              >
                {isWeb3Loading ? "Connecting..." : "Sign in with Ethereum"}
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
