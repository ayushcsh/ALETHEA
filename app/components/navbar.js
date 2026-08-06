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
                           h-[40px] w-[40px] p-0 flex items-center justify-center text-white
                           rounded-full overflow-hidden shrink-0"
                title={session.user.name}
              >
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User avatar"}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="flex items-center justify-center w-full h-full bg-orange-600 text-white rounded-full font-bold">
                    {getInitials(session.user.name)}
                  </span>
                )}
              </NavbarButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="bg-black border border-white/10 rounded-lg p-1 min-w-[130px]"
            >
              <DropdownMenuItem
                onClick={() => signOut()}
                className="text-gray-200 cursor-pointer rounded-md px-3 py-2 text-sm font-[Arial] focus:bg-white/10 focus:text-white hover:bg-white/10 transition-colors"
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
