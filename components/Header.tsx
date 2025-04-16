"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useAccount, useDisconnect } from "wagmi";

interface EthereumWindow extends Window {
  ethereum?: {
    request: (args: {
      method: string;
      params?: Array<string | string[] | number | object>;
    }) => Promise<unknown>;
  };
}

export function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [loading, setLoading] = useState(false);

  const isActive = (path: string) => pathname === path;

  const handleWeb3Login = useCallback(async () => {
    try {
      setLoading(true);

      if (!isConnected) {
        try {
          const { ethereum } = window as EthereumWindow;
          if (ethereum) {
            await ethereum.request({ method: "eth_requestAccounts" });
            setTimeout(() => {
              if (!isConnected) {
              }
            }, 1000);
          } else {
            alert("Please install a Web3 wallet like MetaMask");
          }
        } catch (error) {
          alert("Failed to connect to your wallet. Please try again.");
        }
        return;
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
        });

        if (result?.error) {
          alert(`Authentication failed: ${result.error}`);
        }
      } catch (error) {
        alert("Failed to sign the message or authenticate. Please try again.");
      }
    } catch (error) {
      alert("Web3 login failed.");
    } finally {
      setLoading(false);
    }
  }, [isConnected, address]);

  useEffect(() => {
    if (isConnected && address && !session) {
      handleWeb3Login();
    }
  }, [isConnected, address, session, handleWeb3Login]);

  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              SealedBid
            </Link>

            <nav className="hidden md:ml-8 md:flex md:space-x-6">
              <Link
                href="/"
                className={`px-3 py-2 text-sm font-medium ${
                  isActive("/")
                    ? "text-blue-600"
                    : "text-gray-700 hover:text-blue-600"
                }`}
              >
                Home
              </Link>
              <Link
                href="/auctions"
                className={`px-3 py-2 text-sm font-medium ${
                  isActive("/auctions") || pathname.startsWith("/auctions/")
                    ? "text-blue-600"
                    : "text-gray-700 hover:text-blue-600"
                }`}
              >
                Auctions
              </Link>
              {session?.user && (
                <Link
                  href="/dashboard"
                  className={`px-3 py-2 text-sm font-medium ${
                    isActive("/dashboard")
                      ? "text-blue-600"
                      : "text-gray-700 hover:text-blue-600"
                  }`}
                >
                  Dashboard
                </Link>
              )}
            </nav>
          </div>

          <div className="hidden md:flex items-center">
            {status === "loading" || loading ? (
              <div className="h-8 w-24 bg-gray-200 animate-pulse rounded-md"></div>
            ) : session?.user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700">
                  {session.user.walletAddress
                    ? `${session.user.walletAddress.substring(
                        0,
                        6
                      )}...${session.user.walletAddress.substring(38)}`
                    : session.user.name || session.user.email}
                </span>
                <button
                  onClick={() => {
                    if (session.user.walletAddress) {
                      disconnect();
                    }
                    signOut();
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={() => signIn("credentials")}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Email Sign In
                </button>
                <button
                  onClick={handleWeb3Login}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 flex items-center"
                  disabled={loading}
                >
                  {loading ? "Connecting..." : "Web3 Sign In"}
                </button>
              </div>
            )}
          </div>

          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className={`${isMenuOpen ? "hidden" : "block"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <svg
                className={`${isMenuOpen ? "block" : "hidden"} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div
        className={`${isMenuOpen ? "block" : "hidden"} md:hidden`}
        id="mobile-menu"
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            href="/"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive("/")
                ? "text-blue-600 bg-blue-50"
                : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>

          <Link
            href="/auctions"
            className={`block px-3 py-2 rounded-md text-base font-medium ${
              isActive("/auctions") || pathname.startsWith("/auctions/")
                ? "text-blue-600 bg-blue-50"
                : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
            }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Auctions
          </Link>

          {session?.user && (
            <Link
              href="/dashboard"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive("/dashboard")
                  ? "text-blue-600 bg-blue-50"
                  : "text-gray-700 hover:text-blue-600 hover:bg-blue-50"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
          )}

          {status === "authenticated" ? (
            <>
              <div className="px-3 py-2 text-base font-medium text-gray-700">
                {session.user.walletAddress
                  ? `${session.user.walletAddress.substring(
                      0,
                      6
                    )}...${session.user.walletAddress.substring(38)}`
                  : session.user.name || session.user.email}
              </div>
              <button
                onClick={() => {
                  if (session.user.walletAddress) {
                    disconnect();
                  }
                  signOut();
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50"
              >
                Sign Out
              </button>
            </>
          ) : status === "unauthenticated" ? (
            <>
              <button
                onClick={() => signIn("credentials")}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50"
              >
                Email Sign In
              </button>
              <button
                onClick={handleWeb3Login}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                disabled={loading}
              >
                {loading ? "Connecting..." : "Web3 Sign In"}
              </button>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
