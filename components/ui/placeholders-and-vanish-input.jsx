"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "../../lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import Link from "next/link";

export function PlaceholdersAndVanishInput({
  placeholders,
  onChange,
  onSubmit,
  className,
  chatlength
}) {
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);

  const intervalRef = useRef(null);
  const startAnimation = () => {
    intervalRef.current = setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
    }, 10000);
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState !== "visible" && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    } else if (document.visibilityState === "visible") {
      startAnimation();
    }
  };

  useEffect(() => {
    startAnimation();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [placeholders]);

  const canvasRef = useRef(null);
  const newDataRef = useRef([]);
  const inputRef = useRef(null);
  const [value, setValue] = useState("");
  const [animating, setAnimating] = useState(false);
  const [handleplusclick, setHandlePlusClick] = useState(false);

  const draw = useCallback(() => {
    if (!inputRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 800;
    ctx.clearRect(0, 0, 800, 800);
    const computedStyles = getComputedStyle(inputRef.current);

    const fontSize = parseFloat(computedStyles.getPropertyValue("font-size"));
    ctx.font = `${fontSize * 2}px ${computedStyles.fontFamily}`;
    ctx.fillStyle = "#FFFFFF"; // white text
    ctx.fillText(value, 16, 40);

    const imageData = ctx.getImageData(0, 0, 800, 800);
    const pixelData = imageData.data;
    const newData = [];

    for (let t = 0; t < 800; t++) {
      let i = 4 * t * 800;
      for (let n = 0; n < 800; n++) {
        let e = i + 4 * n;
        if (
          pixelData[e] !== 0 &&
          pixelData[e + 1] !== 0 &&
          pixelData[e + 2] !== 0
        ) {
          newData.push({
            x: n,
            y: t,
            color: [
              pixelData[e],
              pixelData[e + 1],
              pixelData[e + 2],
              pixelData[e + 3],
            ],
          });
        }
      }
    }

    newDataRef.current = newData.map(({ x, y, color }) => ({
      x,
      y,
      r: 1,
      color: `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`,
    }));
  }, [value]);

  useEffect(() => {
    draw();
  }, [value, draw]);

  const animate = (start) => {
    const animateFrame = (pos = 0) => {
      requestAnimationFrame(() => {
        const newArr = [];
        for (let i = 0; i < newDataRef.current.length; i++) {
          const current = newDataRef.current[i];
          if (current.x < pos) {
            newArr.push(current);
          } else {
            if (current.r <= 0) {
              current.r = 0;
              continue;
            }
            current.x += Math.random() > 0.5 ? 1 : -1;
            current.y += Math.random() > 0.5 ? 1 : -1;
            current.r -= 0.05 * Math.random();
            newArr.push(current);
          }
        }
        newDataRef.current = newArr;
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) {
          ctx.clearRect(pos, 0, 800, 800);
          newDataRef.current.forEach((t) => {
            const { x: n, y: i, r: s, color: color } = t;
            if (n > pos) {
              ctx.beginPath();
              ctx.rect(n, i, s, s);
              ctx.fillStyle = color;
              ctx.strokeStyle = color;
              ctx.stroke();
            }
          });
        }
        if (newDataRef.current.length > 0) {
          animateFrame(pos - 8);
        } else {
          setValue("");
          setAnimating(false);
        }
      });
    };
    animateFrame(start);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !animating) {
      e.preventDefault();
      vanishAndSubmit();
      if (onSubmit) onSubmit(value);
    }
  };

  const vanishAndSubmit = () => {
    setAnimating(true);
    draw();

    const value = inputRef.current?.value || "";
    if (value && inputRef.current) {
      const maxX = newDataRef.current.reduce(
        (prev, current) => (current.x > prev ? current.x : prev),
        0
      );
      animate(maxX);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    vanishAndSubmit();
    if (onSubmit) onSubmit(value);
  };

  const handlePlusClick = () => {
    setHandlePlusClick(true);
    if (onSubmit) onSubmit(value);
  };

  return (
    <div className="relative w-full">

      {/* + BUTTON — ONLY THING ADDED */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className={`absolute left-4.5 top-1/2 -translate-y-1/2 transition-all duration-500 z-50
  ${chatlength === 0 ? " -translate-y-[330px] md:-translate-y-[250px]" : ""}
`}
          >
            <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14" />
              <path d="M5 12h14" />
            </motion.svg>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
              align="start"
              side="top"
              className="w-40 mb-1 bg-[#1a1a1a] border-[#121212] text-white shadow-md"
            >
              <DropdownMenuLabel className="text-sm text-gray-400">
                Actions
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#121212]" />
              <Link href="/start" passHref>
                <DropdownMenuItem className="cursor-pointer font-[Arial] hover:bg-[#2a2a2a]">
                  Upload New PDF
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem className="cursor-pointer font-[Arial] hover:bg-[#2a2a2a]">
                <button>Summarize PDF</button>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer font-[Arial] hover:bg-[#2a2a2a]">
                <button>Generate Flashcards</button>
              </DropdownMenuItem>
            </DropdownMenuContent>
      </DropdownMenu>

      {/* Input Form */}
      <form
        className={cn(
          "w-full relative mx-auto h-12 rounded-full overflow-hidden transition duration-200",
          "bg-[#131313] text-white shadow-[0px_2px_3px_-1px_rgba(255,255,255,0.1),_0px_1px_0px_0px_rgba(255,255,255,0.02),_0px_0px_0px_1px_rgba(255,255,255,0.08)]",
          className
        )}
        onSubmit={handleSubmit}
      >
        <canvas
          className={cn(
            "absolute pointer-events-none text-base transform scale-50 top-[20%] left-2 sm:left-8 origin-top-left filter invert-0 pr-20",
            !animating ? "opacity-0" : "opacity-100"
          )}
          ref={canvasRef}
        />

        <input
          onChange={(e) => {
            if (!animating) {
              setValue(e.target.value);
              onChange && onChange(e);
            }
          }}
          onKeyDown={handleKeyDown}
          ref={inputRef}
          value={value}
          type="text"
          className={cn(
            "w-full relative text-sm sm:text-base z-30 border-none bg-transparent font-[Arial] text-white h-full rounded-full focus:outline-none focus:ring-0 sm:pl-8 pl-10 pr-1",
            animating && "text-transparent"
          )}
        />

        <button
          disabled={!value}
          type="submit"
          className="absolute right-2 top-1/2 z-40 -translate-y-1/2 h-8 w-8 rounded-full disabled:bg-[#2a2a2a] bg-white transition duration-200 flex items-center justify-center"
        >
          <motion.svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="black"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M5 12h14" />
            <path d="M13 18l6 -6" />
            <path d="M13 6l6 6" />
          </motion.svg>
        </button>

        <div className="absolute inset-0 flex items-center rounded-full">
          <AnimatePresence mode="wait">
            {!value && (
              <motion.p
                initial={{ y: 5, opacity: 0 }}
                key={`current-placeholder-${currentPlaceholder}`}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -15, opacity: 0 }}
                transition={{ duration: 0.3, ease: "linear" }}
                className="text-white/60 font-bebas text-sm sm:text-base font-normal pl-10 text-left w-[calc(100%-2rem)] truncate"
              >
                {placeholders[currentPlaceholder]}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </form>
    </div>
  );
}
