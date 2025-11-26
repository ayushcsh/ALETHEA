"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";

// ================================
// COUNTER HOOK
// ================================
function useCounter(from, to, duration = 2000) {
  const [value, setValue] = useState(from);

  useEffect(() => {
    let startTimestamp = null;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);

      setValue(Math.floor(progress * (to - from) + from));

      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, []);

  return value;
}

export default function AboutPage() {
  return (
    <div className="w-full min-h-screen bg-black text-white">

      {/* HERO SECTION */}
      <section id="about" className="w-full max-w-7xl mx-auto px-6 pt-10 flex flex-col md:flex-row items-center gap-10">

        {/* Left Text */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 text-center md:text-left"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4">
            About{" "}
            <span className="bg-gradient-to-t from-black via-[#d03902] to-[#d03902] bg-clip-text text-transparent">
              ALETHEA
            </span>
          </h1>

          <p className="text-gray-300 text-base md:text-lg leading-relaxed font-[Arial]">
            ALETHEA is an AI-powered study companion built to make learning
            faster, simpler, and more meaningful. We transform long PDFs into
            clean summaries, smart notes, and instant Q&A — all in seconds.
          </p>
        </motion.div>

        {/* Image */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 flex justify-center"
        >
          <div className="rounded-2xl overflow-hidden shadow-lg w-full max-w-[500px] h-[200px] md:h-[280px]">
            <video
              src="/images/video.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>
      </section>

      {/* STATS SECTION */}
      <section className="w-full max-w-6xl mx-auto px-6 mt-20 mb-20 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 text-center">
        {[
          [50000, "+", "Documents Processed"],
          [90, "% Faster", "Content Understanding"],
          [98, "% Accuracy", "AI Answers"],
          [2, "×", "Study Productivity"],
        ].map(([end, suffix, label], i) => {
          const counter = useCounter(0, end, 2000);

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-[#12121280] backdrop-blur-md border border-[#2a2a2a] p-4 md:p-6 rounded-xl"
            >
              <h2 className="text-2xl md:text-4xl font-bold bg-[#d03902] bg-clip-text text-transparent">
                {counter}
                {suffix}
              </h2>
              <p className="text-gray-400 mt-2 font-[Arial] text-sm md:text-base">
                {label}
              </p>
            </motion.div>
          );
        })}
      </section>

      {/* WHY CHOOSE US */}
      <section className="w-full max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center md:text-left">
          Why Anyone choose{" "}
          <span className="bg-gradient-to-t from-black via-[#d03902] to-[#d03902] bg-clip-text text-transparent">
            ALETHEA
          </span>
        </h2>

        <div className="grid md:grid-cols-3 gap-8 md:gap-10">
          {[
            ["Seamless Experience", "Upload your PDF and start learning instantly with no setup."],
            ["Smart Summaries", "Get clean, accurate summaries of long study material."],
            ["Interactive Learning", "Ask questions directly from the PDF — get instant answers."],
          ].map(([title, desc], i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-[#12121280] backdrop-blur-md p-6 md:p-8 rounded-xl border border-[#2a2a2a]"
            >
              <h3 className="text-lg md:text-xl font-semibold mb-3">
                {title}
              </h3>
              <p className="text-gray-400 text-sm md:text-base font-[Arial]">
                {desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FOUNDER SECTION */}
      <section className="w-full max-w-6xl mx-auto px-6 py-20 md:py-24">
        <div className="bg-[#12121280] p-6 md:p-10 rounded-2xl border border-[#2a2a2a] flex flex-col md:flex-row gap-8 md:gap-10 items-center backdrop-blur-md">
          <Image
            src="/images/ayush.jpg"
            width={250}
            height={250}
            alt="Ayush Kumar"
            className="rounded-2xl object-cover"
          />

          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet the Founder</h2>

            <h3 className="text-xl md:text-2xl font-semibold mb-2 bg-gradient-to-t from-black via-[#d03902] to-[#d03902] bg-clip-text text-transparent">
              Ayush Kumar
            </h3>

            <p className="text-gray-300 leading-relaxed text-base md:text-lg font-[Arial]">
              I’m Ayush, a computer science student passionate about building meaningful tech.
              Like many students, I struggled with long PDFs, heavy theory chapters,
              and last-night exam stress. <br /><br />
              So I created ALETHEA — a tool that helps students study smarter,
              remember better, and learn faster using AI.
            </p>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section id="contact" className="w-full max-w-4xl mx-auto px-6 mb-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Stay Updated</h2>

        <p className="text-gray-400 mb-6 font-[Arial] text-sm md:text-base">
          Get updates, new features, and AI study tips directly in your inbox.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="px-6 py-3 rounded-full bg-[#1a1a1a] border border-[#333] text-white w-full sm:w-80 font-[Arial]"
          />

          <button className="px-6 py-3 rounded-full bg-[#d03902] text-white hover:opacity-85 transition-all font-semibold font-[Arial] w-full sm:w-auto">
            Subscribe
          </button>
        </div>
      </section>

    </div>
  );
}
