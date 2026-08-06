'use client';

import React, { useState } from "react";
import Link from "next/link";
import PdfDropzone from "../components/dropzone";
import { FloatingDock } from "../../components/ui/floating-dock";
import {
  FaSearch,
  FaRegEdit,
  FaTwitter,
  FaLinkedinIn,
  FaRedditAlien,
} from "react-icons/fa";
import { RiChatNewLine } from "react-icons/ri";
import { BsThreeDots } from "react-icons/bs";
import { FiLink } from "react-icons/fi";
import { MdDeleteOutline } from "react-icons/md";
import { TiTick } from "react-icons/ti";
import { FaRegShareFromSquare } from "react-icons/fa6";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { BackgroundGradient } from "../../components/ui/background-gradient";
import FoldText from "../../components/ui/FoldText";

const Start = () => {
  const [searchpdf, setSearchpdf] = useState(false);
  const [rename, setRename] = useState(false);
  const [renameChatId, setRenameChatId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [share, setShare] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [searchterm , setSearchterm] = useState("");  
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const chatidfn = useMutation(api.chatid.chatid);
  const handleRenameChat = useMutation(api.chatid.renamechat);
  const handleDeleteChat = useMutation(api.chatid.deletechat);

  // ✅ safe query
  const chats = useQuery(
    api.chatid.getChatsByUser,
    userId ? { userId } : "skip"
  );

  const handleNewChat = async () => {
    if (!userId) return;
    try {
      const newchat = await chatidfn({ userId });
      if (newchat) {
        const pdfUrl = "";
        const encodedPdfUrl = encodeURIComponent(pdfUrl);
        router.push(
          `/chat?pdfurl=${encodedPdfUrl}&chatId=${newchat}&userid=${userId}`
        );
      }
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  };

  const items = [
    {
      title: "New chat",
      icon: (
        <RiChatNewLine className="w-5 h-5 text-white dark:text-neutral-300" />
      ),
      onClick: handleNewChat,
    },
    {
      title: "Search chats",
      icon: <FaSearch className="w-5 h-5 text-white dark:text-neutral-300" />,
      onClick: () => setSearchpdf((prev) => !prev),
    },
  ];

  const handleselectchat = (chat) => {
    const encodedPdfUrl = encodeURIComponent(chat.pdfUrl || "");
    router.push(
      `/chat?pdfurl=${encodedPdfUrl}&chatId=${chat.id}&userid=${userId}`
    );
  };

  const handleOpenRename = (chat) => {
    setRename(true);
    setRenameChatId(chat.id);
    setRenameValue(chat.title);
  };

  const handleRenameSubmit = async (chatId) => {
    if (!renameValue.trim()) return;
    try {
      await handleRenameChat({ chatId, title: renameValue });
      setRename(false);
      setRenameChatId(null);
      setRenameValue("");
    } catch (error) {
      console.error("Error renaming chat:", error);
    }
  };

  const handleShare = (e) => {
    e.stopPropagation();
    setShare(true);
  };
  const filteredChats = chats?.filter(
  (chat) =>
    chat.title.toLowerCase().includes(searchterm) ||
    chat.lastMessage?.toLowerCase().includes(searchterm)
);

  return (
    <div className="h-screen overflow-hidden flex flex-col relative bg-black">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#ff6600]/[0.06] rounded-full blur-[160px]" />
      </div>

      <div className="w-full pl-3 pt-4 shrink-0 relative z-10">
        <Link href="/" className="inline-flex items-center">
          <div className="relative w-[40px] h-[40px]">
            <Image
              src="/images/logo orange.png"
              alt="Lethea"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>
      </div>
      <div className="relative z-50">
        <FloatingDock
          items={items}
          desktopClassName="mb-10 fixed -translate-y-1/2"
          mobileClassName="fixed bottom-6 left-1/2 -translate-x-1/2"
        />
      </div>

      <div className="flex-1 min-h-0 flex items-center justify-center pl-10 md:pl-24 pr-6 md:pr-12 overflow-hidden relative z-10">
        <div className="relative z-10 h-full w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center py-6">
          <div className="flex h-full w-full flex-col items-center text-center">
            <div className="shrink-0">
              <FoldText
                text="Why just read,"
                splitBy="char"
                hinge="top"
                trigger="mount"
                duration={0.65}
                stagger={0.035}
                ease="power3.out"
                perspective={700}
                creaseShading={0.55}
                fontSize="clamp(2.1rem, 4.6vw, 3.25rem)"
                fontWeight={800}
                color="#ffffff"
                className="font-bebas"
              />
            </div>

            <div className="mt-1 flex flex-wrap items-baseline justify-center gap-x-3">
              <FoldText
                text="when you can"
                splitBy="char"
                hinge="top"
                trigger="mount"
                duration={0.65}
                stagger={0.035}
                ease="power3.out"
                perspective={700}
                creaseShading={0.55}
                fontSize="clamp(2.1rem, 4.6vw, 3.25rem)"
                fontWeight={800}
                color="#ffffff"
                className="font-bebas"
              />
              <FoldText
                text="chat?"
                splitBy="char"
                hinge="top"
                trigger="mount"
                duration={0.65}
                stagger={0.035}
                ease="power3.out"
                perspective={700}
                creaseShading={0.55}
                fontSize="clamp(2.1rem, 4.6vw, 3.25rem)"
                fontWeight={800}
                color="#ff6600"
                className="font-bebas drop-shadow-[0_0_18px_rgba(255,102,0,0.45)]"
              />
            </div>

            {/* Big illustration, below the headline, centered — trimmed a touch off its left edge */}
            <div className="mt-4 flex w-full min-h-0 flex-1 items-center justify-center overflow-hidden select-none">
              <video
                src="/images/in_the_end_remove_that_done_pa.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="h-full max-h-full w-full max-w-full -translate-x-6 object-contain md:-translate-x-10"
              />
            </div>
          </div>

          <div className="flex justify-center md:justify-start">
            <PdfDropzone />
          </div>
        </div>
      </div>

      {/* Search Chats Dialog */}
      {searchpdf && (
        <Dialog open={searchpdf} onOpenChange={setSearchpdf}>
          <DialogContent className="sm:max-w-[950px] bg-[#111111] border border-[#1f1f1f] text-white">
            <DialogHeader>
              <DialogTitle className="font-[Arial] text-[15px] mb-2">
                Search Chats
              </DialogTitle>

              <DialogDescription>
                <input
                  type="text"
                  placeholder="Search..."
                  value = {searchterm}
                  onChange={(e) => setSearchterm(e.target.value.toLocaleLowerCase())}
                  className="w-full border border-[#262626] bg-[#171717] text-white font-[Arial] rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </DialogDescription>

              <DialogTitle className="text-[12px] text-gray-400 font-[Arial] mt-5 ">
                Recent Chats
              </DialogTitle>
            </DialogHeader>
            
            <div className="custom-scrollbar h-[50vh] overflow-y-auto space-y-2 mt-1">
              {filteredChats?.length > 0 ? (
                
                filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    className="group flex justify-between items-center p-2 rounded-md hover:bg-[#1c1c1c] cursor-pointer transition-all"
                    onClick={() => handleselectchat(chat)}
                  >
                    {rename && renameChatId === chat.id ? (
                      <div className="flex w-[99%]">
                        <div className="w-[99%]">
                          <input
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            placeholder="Enter new chat name"
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                e.stopPropagation();
                                handleRenameSubmit(chat.id);
                              }
                            }}
                            className="w-[97%] border border-[#262626] bg-[#171717] text-white font-[Arial] rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
                          />
                        </div>
                        <div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRenameSubmit(chat.id);
                            }}
                            className="text-[10px] font-[Arial] text-white bg-[#171717] border hover:bg-[#1e1e1e] hover:border-orange-500 border-[#262626] rounded-md p-2"
                          >
                            <TiTick size={25} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[14px] font-[Arial] text-white">
                        {chat.title}
                      </p>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="cursor-pointer opacity-0 group-hover:opacity-100 z-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <BsThreeDots className="ml-3" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-30" align="start">
                        <DropdownMenuGroup>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleShare(e);
                            }}
                            className="w-full"
                          >
                            <DropdownMenuItem>
                              <FaRegShareFromSquare />
                              <span>Share</span>
                            </DropdownMenuItem>
                          </button>
                          <button
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenRename(chat);
                            }}
                          >
                            <DropdownMenuItem>
                              <FaRegEdit />
                              <span>Rename</span>
                            </DropdownMenuItem>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDelete(chat);
                            }}
                            className="w-full"
                          >
                            <DropdownMenuItem className="text-red-500">
                              <MdDeleteOutline className="text-red-500" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </button>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm text-center mt-4">
                  No chats found.
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Modal */}
      {/* Delete Confirmation Modal */}
{confirmDelete && (
  <div
    className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[9999] pointer-events-auto" // ✅ higher z-index
    onClick={(e) => {
      e.stopPropagation(); // prevent bubbling to other layers
      setConfirmDelete(null);
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()} // ✅ block clicks inside modal
      className="bg-[#1c1c1c] text-white rounded-xl p-6 w-[90vw] max-w-[400px] shadow-lg border border-[#2b2b2b] relative "
    >
      <h2 className="text-lg font-[Arial] mb-3">Delete Chat?</h2>
      <p className="text-gray-400 font-[Arial] text-sm mb-6">
        Are you sure you want to delete{" "}
        <span className="text-orange-400">{confirmDelete.title}</span>?
        This action cannot be undone.
      </p>
      <div className="flex justify-end gap-4">
        <button
          onClick={(e) => {
            e.stopPropagation(); 
            setConfirmDelete(null);
          }}
          className="px-4 py-2 rounded-md font-[Arial] bg-gray-700 hover:bg-gray-600 transition-all"
        >
          Cancel
        </button>
        <button
          onClick={async (e) => {
            e.stopPropagation(); // ✅ prevent propagation to backdrop
            await handleDeleteChat({ chatId: confirmDelete.id });
            setConfirmDelete(null);
            await handleNewChat();
          }}
          className="px-4 py-2 rounded-md bg-red-600 font-[Arial] hover:bg-red-500 transition-all"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}

      {/* Share Modal */}
      {share && (
        <div
          className="absolute inset-0 flex items-center justify-center  bg-black/40 backdrop-blur-sm rounded-[8px] z-[100]"
          onClick={() => setShare(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="pointer-events-auto"
          >
            <BackgroundGradient
              animate={true}
              containerClassName="rounded-2xl p-[2px] w-[560px] max-w-[90%] shadow-2xl"
              className="bg-[#1c1c1c] rounded-[24px] h-[91vh] w-full p-6 border border-[#1f1f1f] text-white"
            >
              <div>
                <div className="flex justify-between">
                  <p>Share Chat</p>
                  <button onClick={() => setShare(false)}>X</button>
                </div>
                <div className="w-full h-[1px] mt-[20px] bg-white "></div>
                <div className="mt-[20px]">
                  <Image
                    src="/images/sharchat.png"
                    alt="Share Chat"
                    width={500}
                    height={200}
                    className="object-cover max-h-[60%] rounded-lg mb-6"
                  />
                  <div className="mt-6">
                    <p className="text-gray-400 text-sm mb-3">Share on</p>
                    <div className="flex justify-center items-center gap-8">
                      <button
                        className="p-3 rounded-full bg-[#FFA500]/10 border border-[#FFA500]/40 hover:bg-[#FFA500]/20 text-[#FFA500] transition-all duration-300 hover:scale-105"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            `https://flashify.vercel.app/chat/${renameChatId}`
                          );
                        }}
                      >
                        <FiLink className="w-5 h-5" />
                      </button>
                      <button className="p-3 rounded-full bg-[#1DA1F2]/10 border border-[#1DA1F2]/40 hover:bg-[#1DA1F2]/20 text-[#1DA1F2] transition-all duration-300 hover:scale-105">
                        <FaTwitter className="w-5 h-5" />
                      </button>
                      <button className="p-3 rounded-full bg-[#0077b5]/10 border border-[#0077b5]/40 hover:bg-[#0077b5]/20 text-[#0077b5] transition-all duration-300 hover:scale-105">
                        <FaLinkedinIn className="w-5 h-5" />
                      </button>
                      <button className="p-3 rounded-full bg-[#FF4500]/10 border border-[#FF4500]/40 hover:bg-[#FF4500]/20 text-[#FF4500] transition-all duration-300 hover:scale-105">
                        <FaRedditAlien className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </BackgroundGradient>
          </div>
        </div>
      )}
    </div>
  );
};
export default Start;