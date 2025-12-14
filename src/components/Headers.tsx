import { ConnectButton } from "@rainbow-me/rainbowkit";
import { FaGithub } from "react-icons/fa";
import Image from "next/image";

export default function Header() {
  return (
    <header className="w-full border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side - GitHub link and Title */}
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/Dhananjay-alt/Tsender-TS-Nextjs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="GitHub Repository"
            >
              <FaGithub className="w-6 h-6 text-gray-700" />
            </a>
            
            <h1 className="text-2xl font-bold text-gray-900">
              Tsender
            </h1>
          </div>

          {/* Right side - Connect Button */}
          <div className="flex items-center">
            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
}