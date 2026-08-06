"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Inputquery from "../components/inputquery";
import Notepad from "../components/notepad";
import PdfDropzone from "../components/dropzone";
import { FileText, X } from "lucide-react";

// pdfjs-dist needs browser-only APIs (DOMMatrix, etc.) that don't exist
// during Next.js's server render, so this must never be rendered on the server.
const PdfViewer = dynamic(() => import("../components/pdfviewer"), {
  ssr: false,
});
import { FloatingDock } from "../../components/ui/floating-dock";
import { BackgroundGradient } from "../../components/ui/background-gradient";
import { TiTick } from "react-icons/ti";
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

// ✅ Icons
import {
  FaSearch,
  FaEye,
  FaEyeSlash,
  FaTwitter,
  FaLinkedinIn,
  FaRedditAlien,
  FaRegEdit,
} from "react-icons/fa";
import { FaNoteSticky, FaRegShareFromSquare } from "react-icons/fa6";
import { FiLink } from "react-icons/fi";
import { RiChatNewLine } from "react-icons/ri";
import { BsThreeDots } from "react-icons/bs";
import { MdDeleteOutline } from "react-icons/md";

function ChatContent() {
  const router = useRouter();
  const [showPDF, setShowPDF] = useState(false);
  const [share, setShare] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmDeleteDoc, setConfirmDeleteDoc] = useState(null);
  const [showNotepad, setShowNotepad] = useState(false);
  const [searchpdf, setSearchpdf] = useState(false);
  const [rename, setRename] = useState(false);
  const [renameChatId, setRenameChatId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [searchterm, setSearchterm] = useState("");
  const searchParams = useSearchParams();
  const pdfUrl = searchParams.get("pdfurl");
  const chatId = searchParams.get("chatId");
  const userId = searchParams.get("userid");

  const pdfId =
    typeof window !== "undefined" ? localStorage.getItem("pdfId") : null;

  const chats = useQuery(api.chatid.getChatsByUser, { userId });
  const documents = useQuery(
    api.chatid.getDocumentsByChat,
    chatId ? { chatId } : "skip"
  );
  const [activeDocIndex, setActiveDocIndex] = useState(0);
  // Jump to the newest document whenever one gets added
  useEffect(() => {
    if (documents && documents.length > 0) {
      setActiveDocIndex(documents.length - 1);
    }
  }, [documents?.length]);
  const activePdfUrl = documents?.[activeDocIndex]?.pdfUrl || pdfUrl;
  const removeDocument = useMutation(api.chatid.removeDocument);
  const handleRemoveDocument = (e, doc) => {
    e.stopPropagation();
    setConfirmDeleteDoc(doc);
  };
  const handleDeleteChat = useMutation(api.chatid.deletechat);
  const chatidfn = useMutation(api.chatid.chatid);
  const handleRenameChat = useMutation(api.chatid.renamechat);

  // ✅ Create new chat
  const handleNewChat = async () => {
    try {
      const newchat = await chatidfn({
        userId,
        pdfUrl,
        title: "New Chat",
        pdfId,
      });
      if (newchat) {
        const encodedPdfUrl = encodeURIComponent(pdfUrl || "");
        router.push(
          `/chat?pdfurl=${encodedPdfUrl}&chatId=${newchat}&userid=${userId}`
        );
      }
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  };

  // ✅ Select chat
  const filteredChats = chats?.filter(
    (chat) =>
      chat.title.toLowerCase().includes(searchterm) ||
      chat.lastMessage?.toLowerCase().includes(searchterm)
  );
  const handleselectchat = (chat) => {
    const encodedPdfUrl = encodeURIComponent(chat.pdfUrl || pdfUrl || "");
    router.push(
      `/chat?pdfurl=${encodedPdfUrl}&chatId=${chat.id}&userid=${userId}`
    );
  };

  // ✅ Rename logic
  const handleOpenRename = (chat) => {
    setRename(true);
    setRenameChatId(chat.id);
    setRenameValue(chat.title);
  };

  const handleRenameSubmit = async (chatId) => {
    if (!renameValue.trim()) return;
    try {
      await handleRenameChat({
        chatId: chatId,
        title: renameValue,
      });
      setRename(false);
      setRenameChatId(null);
      setRenameValue("");
    } catch (error) {
      console.error("Error renaming chat:", error);
    }
  };

  // ✅ Floating menu items
  const items = [
    {
      title: "New chat",
      icon: <RiChatNewLine className="w-5 h-5 text-white" />,
      onClick: handleNewChat,
    },
    {
      title: "Search chats",
      icon: <FaSearch className="w-5 h-5 text-white" />,
      onClick: () => setSearchpdf((prev) => !prev),
    },
    {
      title: showPDF ? "Hide PDF" : "Show PDF",
      icon: showPDF ? (
        <FaEyeSlash className="w-5 h-5 text-white" />
      ) : (
        <FaEye className="w-5 h-5 text-white" />
      ),
      onClick: () => setShowPDF((prev) => !prev),
    },
    {
      title: showNotepad ? "Hide Notepad" : "Show Notepad",
      icon: <FaNoteSticky className="w-5 h-5 text-white" />,
      onClick: () => setShowNotepad((prev) => !prev),
    },
  ];

  const handleShare = (e) => {
    e.stopPropagation();
    setShare(true);
  };

  return (
    <div className="flex flex-col md:flex-row h-auto md:h-screen w-full p-2 gap-2 transition-all duration-500 overflow-x-hidden md:overflow-hidden">
      {/* Sidebar */}
      <div className="w-full md:w-auto md:max-w-[3vw] h-auto md:h-full md:min-h-0 shrink-0">
        <div>
          <Link href="/">
            <div className="relative w-[40px] md:translate-x-[-40px]  h-[40px] md:w-[120px] md:h-[40px] ml-1 mt-2">
              <Image
                src="/images/logo orange.png"
                alt="Logo"
                fill
                className="object-contain"
              />
            </div>
          </Link>
          <FloatingDock
            items={items}
            desktopClassName="mb-10 fixed -translate-y-1/2"
            mobileClassName="fixed bottom-4 left-1/2 -translate-x-1/2 "
          />
        </div>
      </div>

      {/* Search Chats Dialog */}
      {searchpdf && (
        <Dialog
          open={searchpdf}
          onOpenChange={(open) => {
            if (!share) setSearchpdf(open);
          }}
        >
          <DialogContent className="sm:max-w-[950px] h-[70vh] bg-[#111111] border border-[#1f1f1f] text-white">
            <DialogHeader>
              <DialogTitle className="font-[Arial] text-[15px] mb-2">
                Search Chats
              </DialogTitle>
              <DialogDescription>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchterm}
                  onChange={(e) =>
                    setSearchterm(e.target.value.toLocaleLowerCase())
                  }
                  className="w-full border border-[#262626] bg-[#171717] text-white font-[Arial] rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </DialogDescription>
              <DialogTitle className="text-[12px] text-gray-400 font-[Arial] mt-5 ">
                Recent Chats
              </DialogTitle>
            </DialogHeader>

            <div className="custom-scrollbar h-[47vh] overflow-y-auto space-y-2 mt-1">
              {filteredChats?.length > 0 ? (
                filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    className=" group flex justify-between items-center p-2 rounded-md hover:bg-[#1c1c1c] cursor-pointer transition-all"
                    onClick={() => handleselectchat(chat)}
                  >
                    {rename && renameChatId === chat.id ? (
                      <div className="flex w-[99%]">
                        <div className="w-[99%]">
                          <input
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            placeholder="Enter new chat name"
                            onKeyDown={(e) => {
                              if (e.key == "Enter") {
                                e.preventDefault();
                                handleRenameSubmit(chat.id);
                              }
                            }}
                            className="w-[97%] border border-[#262626] bg-[#171717] text-white font-[Arial] rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-orange-500"
                          />
                        </div>
                        <div>
                          <button
                            onClick={() => handleRenameSubmit(chat.id)}
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
                        <button className="cursor-pointer opacity-0 group-hover:opacity-100">
                          <BsThreeDots className="ml-3" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-30" align="start">
                        <DropdownMenuGroup>
                          <button onClick={handleShare} className="w-full">
                            <DropdownMenuItem>
                              <FaRegShareFromSquare />
                              <span>Share</span>
                            </DropdownMenuItem>
                          </button>
                          <button
                            className="w-full"
                            onClick={() => handleOpenRename(chat)}
                          >
                            <DropdownMenuItem>
                              <FaRegEdit />
                              <span>Rename</span>
                            </DropdownMenuItem>
                          </button>
                          <button
                            onClick={() => setConfirmDelete(chat)}
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

      {/* PDF Section */}
      {showPDF && (
        <div className="h-[50vh] md:h-full md:min-h-0 w-full md:w-[40%] md:min-w-[30%] ml-0 md:ml-[10px] bg-[#141414] rounded-[10px] flex flex-col transition-all duration-500 overflow-hidden">
          {documents && documents.length > 0 && (
            <div className="flex items-end bg-black/25 shrink-0">
              <div className="flex items-end min-w-0 overflow-x-auto hide-scrollbar px-2 pt-2">
                {documents.map((doc, idx) => {
                  const showDivider =
                    idx !== activeDocIndex &&
                    idx + 1 !== activeDocIndex &&
                    idx !== documents.length - 1;
                  return (
                    <button
                      key={doc._id}
                      onClick={() => setActiveDocIndex(idx)}
                      title={doc.fileName}
                      className={`group relative shrink-0 flex items-center gap-1.5 max-w-[150px] px-3 py-2 rounded-t-lg text-[11px] font-[Arial] transition-all duration-200 ${
                        idx === activeDocIndex
                          ? "bg-[#262626] text-white"
                          : "bg-transparent text-gray-500 hover:bg-white/5 hover:text-gray-300"
                      } ${showDivider ? "border-r border-white/10" : ""}`}
                    >
                      {idx === activeDocIndex && (
                        <span className="absolute top-0 left-2 right-2 h-[2px] rounded-full bg-[#ff6600]" />
                      )}
                      <FileText className="h-3 w-3 shrink-0" />
                      <span className="truncate">{doc.fileName}</span>
                      {idx === activeDocIndex && (
                        <span
                          onClick={(e) => handleRemoveDocument(e, doc)}
                          title="Remove this PDF"
                          className="shrink-0 rounded-full p-0.5 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="shrink-0 flex items-center pb-2 pl-1 pr-2">
                <PdfDropzone chatId={chatId} compact />
              </div>
            </div>
          )}

          <div className="flex-1 flex justify-center items-center overflow-hidden">
            {activePdfUrl ? (
              <PdfViewer url={activePdfUrl} />
            ) : (
              <div className="flex flex-col w-full h-full justify-center items-center text-center p-4">
                <Image
                  src="/images/nopdf.png"
                  alt="No PDF uploaded"
                  width={300}
                  height={300}
                  className="object-cover max-h-[60%] rounded-lg mb-6"
                  priority
                />
                <h2 className="text-white font-semibold text-lg mb-2">
                  No PDF uploaded yet
                </h2>
                <p className="text-gray-400 text-sm mb-4">
                  You can still chat or upload one anytime
                </p>
                <PdfDropzone chatId={chatId} compact />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat Section */}
      <div
        className={`h-[70vh] md:h-full md:min-h-0 w-full ${
          showPDF ? "md:w-[70%]" : "md:w-[70%] md:mx-auto"
        } bg-black rounded-[10px] flex justify-center items-center transition-all duration-500 overflow-hidden`}
      >
        <Inputquery
          chatId={chatId}
          showNotepad={showNotepad}
          showPDF={showPDF}
        />
      </div>

      {/* Notepad */}
      {showNotepad && (
        <div className="h-[50vh] md:h-full md:min-h-0 w-full md:w-[50%] bg-[#141414] rounded-[10px] p transition-all duration-500 overflow-hidden">
          <Notepad />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-[9999] pointer-events-auto"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1c1c1c] text-white rounded-xl p-6 w-[90vw] max-w-[400px] shadow-lg border border-[#2b2b2b]"
          >
            <h2 className="text-lg font-[Arial] mb-3">Delete Chat?</h2>
            <p className="text-gray-400 font-[Arial] text-sm mb-6">
              Are you sure you want to delete{" "}
              <span className="text-orange-400 ">{confirmDelete.title}</span>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-md font-[Arial] bg-gray-700 hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  await handleDeleteChat({ chatId: confirmDelete.id });
                  setConfirmDelete(null);
                  await handleNewChat();
                }}
                className="px-4 py-2 rounded-md bg-[#5c1f1f] text-red-100 font-[Arial] hover:bg-[#732727] transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Document Confirmation Modal */}
      {confirmDeleteDoc && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-[9999] pointer-events-auto"
          onClick={() => setConfirmDeleteDoc(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1c1c1c] text-white rounded-xl p-6 w-[90vw] max-w-[400px] shadow-lg border border-[#2b2b2b]"
          >
            <h2 className="text-lg font-[Arial] mb-3">Remove PDF?</h2>
            <p className="text-gray-400 font-[Arial] text-sm mb-6">
              Are you sure you want to remove{" "}
              <span className="text-orange-400">{confirmDeleteDoc.fileName}</span>{" "}
              from this chat? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setConfirmDeleteDoc(null)}
                className="px-4 py-2 rounded-md font-[Arial] bg-gray-700 hover:bg-gray-600 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await removeDocument({ documentId: confirmDeleteDoc._id });
                  } catch (error) {
                    console.error("Error removing document:", error);
                  }
                  setConfirmDeleteDoc(null);
                }}
                className="px-4 py-2 rounded-md bg-red-600 font-[Arial] hover:bg-red-500 transition-all"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {share && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-[8px] z-[100]"
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
                            `https://flashify.vercel.app/chat/${chatId}`
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
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent"></div>
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
