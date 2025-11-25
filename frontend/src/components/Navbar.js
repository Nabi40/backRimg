'use client';

import Image from "next/image";
import { useState } from "react";


const chevron =
  "M6 9L12 15L18 9";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="font-[Poppins]">
      <nav className="mx-auto flex w-full max-w-7.5xl items-center justify-between bg-white px-4 py-4 text-[#222] md:px-6 lg:px-4">
        <div className="flex items-center gap-3">
          <button
            className="flex flex-col justify-between border-0 bg-transparent p-0 text-black lg:hidden"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
          >
            <span className="block h-0.5 w-7 rounded-full bg-black" />
            <span className="mt-1 block h-0.5 w-5 rounded-full bg-black" />
            <span className="mt-1 block h-0.5 w-6 rounded-full bg-black" />
          </button>
        <Image
          src="/images/logo.png"
          alt="Manzoor Logo"
          width={300}
          height={32}
          className="h-auto w-auto object-contain object-center"
          sizes="(max-width: 480px) 120px, (max-width: 767px) 144px, (max-width: 1279px) 160px, 300px"
        />
        </div>


      </nav>

      {/* Mobile drawer */}
      <div
        className={`lg:hidden ${isMenuOpen ? "max-h-screen" : "max-h-0"} overflow-hidden bg-white transition-[max-height] duration-300`}
      >
       
      </div>
    </header>
  );
}

