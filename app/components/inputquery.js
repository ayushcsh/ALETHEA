"use client";

import React, { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { BiCopy } from "react-icons/bi";
import Image from "next/image";
import { FaRegShareFromSquare, FaCheck } from "react-icons/fa6";
import { MdOutlineFileDownload } from "react-icons/md";
import { Streamdown } from "streamdown";
import { FaTwitter, FaLinkedinIn, FaRedditAlien } from "react-icons/fa";
import { FiLink } from "react-icons/fi";
import ReactMarkdown from "react-markdown";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../../components/ui/carousel";
import { useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { PlaceholdersAndVanishInput } from "../../components/ui/placeholders-and-vanish-input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { jsPDF } from "jspdf";
import { BackgroundGradient } from "../../components/ui/background-gradient";
const InputQuery = ({ chatId, showNotepad, showPDF }) => {
  const shareRefs = useRef({});
  const [input, setInput] = useState("");
  const [chat, setChat] = useState([]);
  const scrollRef = useRef(null);
  const [shareOpen, setShareOpen] = useState(null);
  const [copied, setCopied] = useState(null);

  const inputAns = useAction(api.sendMessage.sendMessageToAi);
  const userId = localStorage.getItem("userId");
  const pdfId = localStorage.getItem("pdfId");

  const prevmessage = useQuery(api.chatid.getMessagesByChatId, { chatId });

  // ✅ Function to download Q&A as PDF
  const handledownload = (query, answer, index) => {
    const doc = new jsPDF();

    // Find previous user query if missing
    let finalQuery = query;
    if (!finalQuery && index > 0) {
      for (let i = index - 1; i >= 0; i--) {
        if (chat[i].query) {
          finalQuery = chat[i].query;
          break;
        }
      }
    }

    const textToDownload = `Question:\n${finalQuery || "N/A"}\n\nAnswer:\n${
      answer || "N/A"
    }`;

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(18);
    doc.text("Chat Message", 10, 15);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(12);
    const lines = doc.splitTextToSize(textToDownload, 180);
    doc.text(lines, 10, 30);

    const filename = `Chat_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(filename);
  };

  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (shareOpen !== null) {
        const currentPopup = shareRefs.current[shareOpen];
        if (currentPopup && !currentPopup.contains(event.target)) {
          setShareOpen(null);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [shareOpen]);

  // Format previous messages
  useEffect(() => {
    if (!prevmessage) return;
    const formatted = prevmessage.map((msg) => {
      const role = msg.role?.toLowerCase();
      const content = msg.content?.trim() || "";
      if (
        role === "assistant" &&
        content.includes('"question"') &&
        content.includes('"answer"')
      ) {
        try {
          const cleaned = content
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();
          const parsed = JSON.parse(cleaned);
          if (Array.isArray(parsed) && parsed[0].question && parsed[0].answer) {
            return {
              query: "",
              answer: parsed,
              isLoading: false,
              type: "flashcards",
            };
          }
        } catch {
          return { query: "", answer: content, isLoading: false, type: "text" };
        }
      }

      return {
        query: role === "user" ? content : "",
        answer: ["assistant", "ai", "bot"].includes(role) ? content : "",
        isLoading: false,
        type: "text",
      };
    });
    setChat(formatted);
  }, [prevmessage]);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chat]);

  const handlesend = async () => {
    if (!input) return;
    const userquery = input;
    setInput("");
    const newMessage = { query: userquery, answer: "loading", isLoading: true };
    setChat((prev) => [...prev, newMessage]);

    try {
      const response = await inputAns({
        chatId,
        userId,
        message: userquery,
        pdfId,
      });
      setChat((prev) =>
        prev.map((msg, idx) =>
          idx === prev.length - 1
            ? { ...msg, answer: response, isLoading: false }
            : msg
        )
      );
    } catch {
      setChat((prev) => [
        ...prev,
        {
          query: userquery,
          answer: "Error fetching AI response. Try again.",
          isLoading: false,
        },
      ]);
    }
  };

  const handleCopy = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handlesend();
    }
  };

  return (
    <div className="flex flex-col items-center justify-between h-[95.5vh] w-[99%]">
      {/* Messages */}
      <div
        ref={scrollRef}
        className="h-[87vh] w-[140%] translate-x-[-10px] md:translate-x-0 md:w-[99%] ml-[10px] custom-scrollbar overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-white"
      >
        {chat.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="md:text-[24px] text-[18px] text-center bg-gradient-to-r from-amber-300 via-orange-500 to-red-600 bg-clip-text text-transparent">
              No messages yet… but I’d like to read yours ✨❤️.
            </p>
          </div>
        )}

        <AnimatePresence>
          {chat.map((item, index) => (
            <div key={index} className="flex flex-col mt-[20px]">
              {item.query && (
                <div className="self-end bg-white max-w-[40%] rounded-[10px] right-7 p-2 font-[Arial] shadow">
                  <p className="text-black text-[16px]">{item.query}</p>
                </div>
              )}
              {(item.answer || item.isLoading) && (
                <div className="relative max-w-[98%] w-fit rounded-[15px] p-2 font-[Arial]">
                  {item.isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin text-white bg-[#262626] rounded-2xl" />
                      <span className="text-gray-400">Thinking...</span>
                    </div>
                  ) : item.type === "flashcards" ? (
                    <div className="w-full max-w-2xl mx-auto mt-[10px]">
                      <Carousel
                        className="w-[53vw]"
                        opts={{ align: "start", loop: true }}
                      >
                        <CarouselContent className="-ml-1">
                          {item.answer?.map((card, i) => (
                            <CarouselItem
                              key={i}
                              className="pl-4 md:basis-1/2 lg:basis-1/3"
                            >
                              <div className="group relative h-64 [transform-style:preserve-3d] transition-transform duration-500 hover:rotate-y-180">
                                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-primary p-6 shadow-md backface-hidden [backface-visibility:hidden] group-hover:opacity-0 transition-opacity duration-300">
                                  <div className="text-center">
                                    <p className="text-primary-foreground">
                                      Question {i + 1}
                                    </p>
                                    <p className="mt-2 text-[14px] md:text-[17px] font-[Arial] text-white">
                                      {card.question}
                                    </p>
                                  </div>
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white p-6 shadow-md backface-hidden [transform:rotateY(180deg)] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  <div className="text-center">
                                    <p className="text-sm font-medium text-gray-500">
                                      Answer
                                    </p>
                                    <p className="mt-2 text-[14px] md:text-[17px] font-[Arial] text-gray-900">
                                      {card.answer}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        <div className="mt-4 flex justify-center gap-2">
                          <CarouselPrevious />
                          <CarouselNext />
                        </div>
                      </Carousel>
                    </div>
                  ) : (
                    <div className="relative">
                      <Image
                        src="/images/cat.png"
                        alt="cat"
                        width={200}
                        height={200}
                        className="absolute translate-y-[-40px] ml-[-70px]"
                      />
                      <p className="text-white relative text-[16px] md:max-w-[65vw] sm:w-[100vw] bg-[#262626] rounded-[15px] p-2 font-[Arial]">
                        <ReactMarkdown>{item.answer}</ReactMarkdown>
                      </p>

                      {/* Copy / Share / Download Buttons */}
                      <div className="flex mb-2 mt-1 ml-2 relative">
                        {/* Copy */}
                        <button
                          onClick={() => handleCopy(item.answer, index)}
                          className="text-white hover:bg-[#262626] rounded-[15px] p-2 flex items-center gap-1"
                        >
                          {copied === index ? (
                            <FaCheck className="text-green-400 md:h-4 md:w-4 h-4 w-4" />
                          ) : (
                            <BiCopy className="md:h-4 md:w-4 h-3 w-3" />
                          )}
                        </button>

                        {/* Share */}
                        <button
                          onClick={() =>
                            setShareOpen(shareOpen === index ? null : index)
                          }
                          title="Share Response"
                          className="text-white hover:bg-[#262626] rounded-[15px] p-2 flex items-center gap-1"
                        >
                          <FaRegShareFromSquare className="md:h-4 md:w-4 h-3 w-3" />
                        </button>

                        {/* ✅ Download Button */}
                        <button
                          onClick={() =>
                            handledownload(item.query, item.answer, index)
                          }
                          title="Download Response"
                          className="text-white hover:bg-[#262626] rounded-[15px] p-2 flex items-center gap-1"
                        >
                          <MdOutlineFileDownload className="md:h-4.5 md:w-4.5 h-3 w-3" />
                        </button>

                        {/* Share Popup */}
                        {/* Share Popup (Full Styled Like Main Share Chat Modal) */}
                        {/* Share Popup (Centered + Full Share Modal Style) */}
                        <AnimatePresence>
                          {shareOpen === index && (
                            <motion.div
                              ref={(el) => (shareRefs.current[index] = el)}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.25 }}
                              className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-[200]"
                              onClick={() => setShareOpen(null)} // close when clicking outside
                            >
                              <div
                                onClick={(e) => e.stopPropagation()} // prevent closing on inside click
                                className="pointer-events-auto"
                              >
                                <BackgroundGradient
                                  animate={true}
                                  containerClassName="rounded-2xl p-[2px] w-[560px] max-w-[90%] shadow-2xl"
                                  className="bg-[#1c1c1c] rounded-[24px] h-[80vh] w-full p-6 border border-[#1f1f1f] text-white"
                                >
                                  <div>
                                    <div className="flex justify-between">
                                      <p>
                                        {(
                                          item.query ||
                                          // find the most recent previous user query before this AI answer
                                          chat
                                            .slice(0, index)
                                            .reverse()
                                            .find((msg) => msg.query)?.query ||
                                          ""
                                        )
                                          .split(" ")
                                          .slice(0, 3)
                                          .join(" ") || "Untitled Chat"}
                                        ...
                                      </p>
                                      <button
                                        onClick={() => setShareOpen(null)}
                                      >
                                        X
                                      </button>
                                    </div>
                                    <div className="w-[450px] h-[1px] mt-[20px] bg-white "></div>

                                    {/* Image Section */}
                                    <div className="w-[450px] h-[550px] mt-[20px] flex flex-col items-center">
                                      <Image
                                        src="/images/sharchat.png"
                                        alt="Share Preview"
                                        width={500}
                                        height={200}
                                        className="object-cover max-h-[60%] object-top rounded-lg mb-6"
                                      />

                                      {/* Buttons Section */}
                                      <div className=" text-center">
                                        <p className="text-gray-400 text-sm mb-3">
                                          Share on
                                        </p>

                                        <div className="flex justify-center items-center gap-8">
                                          {/* Copy Link */}
                                          <button
                                            className="p-3 rounded-full bg-[#FFA500]/10 border border-[#FFA500]/40 hover:bg-[#FFA500]/20 text-[#FFA500] transition-all duration-300 hover:scale-105"
                                            onClick={() => {
                                              const messageLink = `${window.location.origin}/chat/${chatId}?message=${index}`;
                                              navigator.clipboard.writeText(
                                                messageLink
                                              );
                                              setShareOpen(null);
                                            }}
                                          >
                                            <FiLink className="w-5 h-5" />
                                          </button>

                                          {/* Twitter */}
                                          <button
                                            className="p-3 rounded-full bg-[#1DA1F2]/10 border border-[#1DA1F2]/40 hover:bg-[#1DA1F2]/20 text-[#1DA1F2] transition-all duration-300 hover:scale-105"
                                            onClick={() => {
                                              window.open(
                                                `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                                                  item.answer
                                                )}`,
                                                "_blank"
                                              );
                                              setShareOpen(null);
                                            }}
                                          >
                                            <FaTwitter className="w-5 h-5" />
                                          </button>

                                          {/* LinkedIn */}
                                          <button
                                            className="p-3 rounded-full bg-[#0077b5]/10 border border-[#0077b5]/40 hover:bg-[#0077b5]/20 text-[#0077b5] transition-all duration-300 hover:scale-105"
                                            onClick={() => {
                                              window.open(
                                                `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                                                  window.location.href
                                                )}&summary=${encodeURIComponent(item.answer)}`,
                                                "_blank"
                                              );
                                              setShareOpen(null);
                                            }}
                                          >
                                            <FaLinkedinIn className="w-5 h-5" />
                                          </button>

                                          {/* Reddit */}
                                          <button
                                            className="p-3 rounded-full bg-[#FF4500]/10 border border-[#FF4500]/40 hover:bg-[#FF4500]/20 text-[#FF4500] transition-all duration-300 hover:scale-105"
                                            onClick={() => {
                                              window.open(
                                                `https://reddit.com/submit?url=${encodeURIComponent(
                                                  window.location.href
                                                )}&title=${encodeURIComponent(item.answer)}`,
                                                "_blank"
                                              );
                                              setShareOpen(null);
                                            }}
                                          >
                                            <FaRedditAlien className="w-5 h-5" />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </BackgroundGradient>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input area */}
      <div className="flex justify-center items-center w-full bottom-10 fixed">
        <div className="flex">
          

          <PlaceholdersAndVanishInput
            placeholders={[
              "Type here and press Enter",
              "Ask me anything",
              "Start typing...",
            ]}
            className={`transition-all duration-500 ml-2 border-[#131313] font-[Arial] bg-[#131313] rounded-[30px] h-[50px] mr-1 
              ${chat.length === 0 ? " translate-y-[-320px] md:translate-y-[-240px]" : "translate-y-0"}
              ${
                showNotepad && showPDF
                  ? "w-[36.5vw]" // both open → smaller
                  : showNotepad && !showPDF
                    ? "w-[55vw]" // only notepad open → wider
                    : !showNotepad && showPDF
                      ? "w-[59vw]" // only pdf open → medium
                      : "w-[88vw] md:w-[70vw]" // default (none open)
              }`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onSubmit={() => handlesend()}
            chatlength = {chat.length}
          />
        </div>
      </div>
    </div>
  );
};

export default InputQuery;
