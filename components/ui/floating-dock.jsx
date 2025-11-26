"use client";

import { cn } from "../../lib/utils";
import { IconLayoutNavbarCollapse } from "@tabler/icons-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

export const FloatingDock = ({ items, desktopClassName, mobileClassName }) => {
  return (
    <>
      <FloatingDockDesktop items={items} className={desktopClassName} />
      <FloatingDockMobile items={items} className={mobileClassName} />
    </>
  );
};

// 🌐 MOBILE VERSION
// 🌐 MOBILE VERSION - UPDATED FOR CIRCULAR ANIMATION
const FloatingDockMobile = ({ items, className }) => {
  const [open, setOpen] = useState(false);
  const totalItems = items.length;
  // Define the radius and angle step for the circular fan
  const radius = 8; // Distance from the center
  const initialAngle = -70; // Start angle (e.g., -180 degrees for left fan)
  const angleStep = -120; // Angle between each icon

  return (
    <div className={cn("relative block md:hidden", className)}>
      {/* Container for the circularly fanned items */}
      <AnimatePresence>
        {open && (
          <div className="absolute right-full bottom-0 mr-2 translate-x-4.5 translate-y-2.5">
            {items.map((item, index) => {
  let x, y;

  if (index === 0) {
    // 🔥 You want this EXACT transform
    x = 27.1303;
    y = -49.0954;
  } else {
    // ❗ Otherwise fallback to your circular math
    const angle = initialAngle + index * angleStep;
    const radian = (angle * Math.PI) / 180;
    x = radius * Math.cos(radian);
    y = radius * Math.sin(radian);
  }

  return (
    <motion.a
      key={item.title}
      href={item.href}
      initial={{ opacity: 0, x: 0, y: 0 }}
      animate={{ opacity: 1, x, y }}
      exit={{ opacity: 0, x: 0, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 30,
        delay: index * 0.05,
      }}
      className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-[#131313] dark:bg-neutral-900 shadow-lg"
    >
      <div className="h-6 w-6 text-white">{item.icon}</div>
    </motion.a>
  );
})}

          </div>
        )}
      </AnimatePresence>
      {/* The main dock button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-[#252525] dark:bg-neutral-800"
      >
        <IconLayoutNavbarCollapse className="h-5 w-5 text-neutral-500 dark:text-neutral-400 " />
      </button>
    </div>
  );
};
// 💻 DESKTOP VERSION (vertical dock)
const FloatingDockDesktop = ({ items, className }) => {
  return (
    <div
      className={cn(
        "fixed left-3 top-1/2 -translate-y-1/2 hidden md:flex flex-col items-center gap-6 rounded-2xl bg-[#131313] py-6 px-3 dark:bg-neutral-900 shadow-lg",
        className
      )}
    >
      <div className="flex flex-col items-center gap-5 relative">
        {items.map((item) => (
          <IconContainer key={item.title} {...item} />
        ))}
      </div>
    </div>
  );
};

// 🧭 ICON CONTAINER (slightly larger + tooltip outside)
// 🧭 ICON CONTAINER
function IconContainer({ title, icon, href, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      className="relative flex items-center focus:outline-none"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: 15 }}
            exit={{ opacity: 0, x: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute left-[150%] whitespace-nowrap bg-[#2a2a2a] text-white text-sm px-3 py-1.5 rounded-md shadow-md border border-[#333]"
          >
            {title}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        whileHover={{ scale: 1.15 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        className="text-white hover:text-[#ff7b00] transition-colors duration-150 text-[26px]"
      >
        {icon}
      </motion.div>
    </button>
  );
}
