"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ModeToggle } from "./theme";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import RotatingText from "../../components/ui/RotatingText";
import Image from "next/image";
import { SparklesCore } from "../../components/ui/sparkles";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  MobileNavHeader,
  MobileNavMenu,
  MobileNavToggle,
  NavbarLogo,
  NavbarButton,
} from "../../components/ui/resizable-navbar";

function MyNavbar() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const items = [
    { name: "Home", link: "/#home" },
    { name: "About", link: "/#about" },
    { name: "Features", link: "/#features" },
    { name: "Contact", link: "/#contact" },
  ];

  // Function to get initials like "AK" from full name
  const getInitials = (name) => {
    if (!name) return "";
    const parts = name.split(" ");
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
  };

  return (
    <Navbar className= "mb-[50px] ">
      {/* Desktop Navbar */}
      <NavBody>
        <NavbarLogo />
        <NavItems items={items} />

        {session ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {/* Button that adapts to screen width */}
              <NavbarButton
                variant="gradient"
                className="bg-orange-600 font-bold transition-all duration-300
                           h-[40px] flex items-center justify-center text-white
                           px-4 rounded-3xl w-auto sm:w-auto truncate
                           sm:min-w-[120px] sm:max-w-[180px]"
                title={session.user.name}
              >
                {/* Full name for large screens */}
                <span className="hidden sm:inline p-2">
                  Welcome {session.user.name}
                </span>

                {/* Circle with initials for small screens */}
                <span className="sm:hidden flex items-center justify-center bg-orange-600 text-white rounded-full w-[40px] h-[40px] font-bold">
                  {getInitials(session.user.name)}
                </span>
              </NavbarButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="bg-black border border-[#ff6600]">
              <DropdownMenuItem
                onClick={() => signOut()}
                className="text-white cursor-pointer"
              >
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <NavbarButton
            href="/login"
            variant="gradient"
            className="bg-orange-600"
          >
            Sign In
          </NavbarButton>
        )}
      </NavBody>

      {/* Mobile Navbar */}
      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo />
          <MobileNavToggle isOpen={isOpen} onClick={() => setIsOpen(!isOpen)} />
        </MobileNavHeader>

        <MobileNavMenu isOpen={isOpen} onClose={() => setIsOpen(false)}>
          {items.map((item, idx) => (
            <a key={idx} href={item.link} className="text-lg font-medium">
              {item.name}
            </a>
          ))}
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  );
}

export default MyNavbar;
