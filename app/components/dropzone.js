"use client";

import {
  Dropzone,
} from "../../components/ui/shadcn-io/dropzone";
import { FileUpload } from "../../components/ui/file-upload";
import { useState } from "react";
import { Spinner } from "../../components/ui/shadcn-io/spinner";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useSession } from "next-auth/react";
import { useAction } from "convex/react";
import { extractText } from "../../convex/nodeActions";
import { useRouter } from "next/navigation";
import { FiPlus } from "react-icons/fi";
import { Trash2, Check, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const formatBytes = (bytes) => {
  if (!bytes) return "0KB";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let i = 0;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(i === 0 ? 0 : 1)}${units[i]}`;
};

const filterPdfFiles = (files) => {
  const pdfFiles = files.filter((f) => f.type === "application/pdf");
  if (pdfFiles.length > 0 && pdfFiles.length !== files.length) {
    alert("Only PDF files are allowed — non-PDF files were skipped.");
  }
  return pdfFiles;
};

export default function PdfDropzone({ chatId: existingChatId, compact, menuitem, onUploaded }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [stagedFiles, setStagedFiles] = useState([]);
  const { data: session } = useSession();
  const userId = session?.user?.id; // Access the convexUserId

  // ✅ Correct useMutation calls
  const generateUploadUrl = useMutation(
    api.generateUploadUrl.generateUploadUrl
  );
  const savePdfMetadata = useMutation(api.savePdfMetadata.savePdfMetadata);
  const embedings = useAction(api.embedings.embedings);

  const chatid = useMutation(api.chatid.chatid);
  const attachDocument = useMutation(api.chatid.attachDocument);

  const uploadFiles = async (pdfFiles) => {
    if (pdfFiles.length === 0) return;

    setLoading(true);

    try {
      // 1. Use the chat we're already in, or create a new one if this is
      // the very first PDF(s) (dropped from /start, no chat exists yet)
      const chatId = existingChatId
        ? existingChatId
        : await chatid({ userId: userId, title: "new chat" });

      let firstUrl = null;

      // Upload, embed, and attach every dropped PDF to this same chat
      for (const pdfFile of pdfFiles) {
        // 2. Upload the file to storage
        const uploadUrl = await generateUploadUrl();

        const result = await fetch(uploadUrl, {
          method: "POST",
          headers: { "Content-Type": pdfFile.type },
          body: pdfFile,
        });

        if (!result.ok) {
          throw new Error(`Upload to storage failed for ${pdfFile.name}.`);
        }

        const { storageId } = await result.json();

        // 3. Save PDF metadata -> get pdfId
        const pdfId = await savePdfMetadata({
          storageId,
          title: pdfFile.name,
          fileName: pdfFile.name,
          contentType: pdfFile.type,
          userId: userId || undefined,
        });

        // 4. Embed it, tagged with this chatId
        const response = await embedings({ pdfId, chatId });
        const url = response?.url;
        if (!firstUrl) firstUrl = url;

        // 5. Link this pdf to the chat
        await attachDocument({
          chatId,
          pdfId,
          pdfUrl: url,
          fileName: pdfFile.name,
        });

        localStorage.setItem("pdfId", pdfId);
      }

      localStorage.setItem("chatId", chatId);
      localStorage.setItem("userId", userId);

      setDone(true);

      setTimeout(() => {
        if (existingChatId) {
          // Already inside this chat — the getDocumentsByChat query will pick
          // this up live, no navigation needed.
          onUploaded?.();
          setStagedFiles([]);
          setLoading(false);
          setDone(false);
        } else if (chatId && userId) {
          router.push(
            `/chat?pdfurl=${encodeURIComponent(firstUrl || "")}&chatId=${encodeURIComponent(chatId)}&userid=${encodeURIComponent(userId)}`
          );
        } else {
          router.push(`/chat`);
        }
      }, 550);
    } catch (error) {
      console.error("Upload error:", error);
      alert(`Upload failed: ${error.message}`);
      setLoading(false);
    }
  };

  const handleImmediateDrop = (acceptedFiles) => {
    const pdfFiles = filterPdfFiles(acceptedFiles);
    if (pdfFiles.length > 0) uploadFiles(pdfFiles);
  };

  const handleFilesStaged = (acceptedFiles) => {
    const pdfFiles = filterPdfFiles(acceptedFiles);
    if (pdfFiles.length === 0) return;
    setStagedFiles((prev) => {
      const existingKeys = new Set(prev.map((f) => `${f.name}_${f.size}`));
      const additions = pdfFiles.filter(
        (f) => !existingKeys.has(`${f.name}_${f.size}`)
      );
      return [...prev, ...additions].slice(0, 10);
    });
  };

  const removeStagedFile = (index) => {
    setStagedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  if (menuitem) {
    return (
      <Dropzone
        accept={{ "application/pdf": [] }}
        maxFiles={1}
        maxSize={20 * 1024 * 1024}
        onDrop={handleImmediateDrop}
        onError={console.error}
        disabled={loading}
        className="w-full h-auto justify-start gap-2 rounded-sm border-0 bg-transparent shadow-none px-2 py-1.5 text-sm font-normal font-[Arial] text-white hover:bg-[#2a2a2a] hover:text-white transition-colors duration-150 cursor-pointer disabled:opacity-50"
      >
        {loading ? <Spinner size={14} /> : <FiPlus className="h-4 w-4" />}
        <span>{loading ? "Uploading..." : "Upload PDF"}</span>
      </Dropzone>
    );
  }

  if (compact) {
    return (
      <Dropzone
        accept={{ "application/pdf": [] }}
        maxFiles={1}
        maxSize={20 * 1024 * 1024}
        onDrop={handleImmediateDrop}
        onError={console.error}
        disabled={loading}
        className="h-6 w-6 shrink-0 p-0 flex items-center justify-center rounded-full text-gray-500 hover:bg-white/10 hover:text-white transition-colors duration-200 cursor-pointer disabled:opacity-50"
      >
        {loading ? (
          <Spinner size={13} />
        ) : (
          <FiPlus className="h-3.5 w-3.5" strokeWidth={1.5} />
        )}
      </Dropzone>
    );
  }

  return (
    <div className="w-[90vw] sm:w-[420px]">
      <div className="flex h-[460px] flex-col rounded-2xl border border-white/[0.08] bg-[#141414] p-6">
        {/* Header — fixed height, never shifts */}
        <div className="mb-4 flex shrink-0 items-center justify-between">
          <p className="font-[Arial] text-[13px] font-semibold tracking-wide text-white">
            Upload Files
          </p>
          {!loading && stagedFiles.length > 0 && (
            <span className="font-[Arial] text-[11px] text-gray-500">
              {stagedFiles.length}/10
            </span>
          )}
        </div>

        {/* Body — fixed height; every state fills it via inset-0 so the
            card never resizes as files are added/removed. */}
        <div className="relative min-h-0 flex-1">
          <AnimatePresence mode="wait" initial={false}>
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-3"
              >
                {done ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="flex size-14 items-center justify-center rounded-full bg-[#ff6600]/10 text-[#ff6600]"
                  >
                    <Check size={28} />
                  </motion.div>
                ) : (
                  <Spinner size={36} />
                )}
                <div className="text-[13px] font-[Arial] text-white">
                  {done ? "All set — opening your chat..." : "Uploading your PDFs..."}
                </div>
              </motion.div>
            ) : stagedFiles.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0 flex flex-col justify-center"
              >
                <FileUpload
                  accept={{ "application/pdf": [] }}
                  multiple
                  title="Drop PDFs here or browse"
                  subtitle="PDF only, up to 10 files, 20MB each"
                  onChange={handleFilesStaged}
                />
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0 flex flex-col"
              >
                <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto pr-1">
                  <AnimatePresence initial={false}>
                    {stagedFiles.map((file, index) => (
                      <motion.div
                        key={`${file.name}_${file.size}`}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="group flex items-center gap-3 border-b border-white/[0.05] py-2.5 last:border-0"
                      >
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-[#ff6600]/10 text-[9px] font-[Arial] font-bold tracking-tight text-[#ff6600]">
                          PDF
                        </div>
                        <div className="min-w-0 flex-1 text-left">
                          <p className="truncate text-[13px] font-[Arial] text-white">
                            {file.name}
                          </p>
                          <p className="text-[11px] font-[Arial] text-gray-500">
                            {formatBytes(file.size)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeStagedFile(index)}
                          className="shrink-0 rounded-md p-1.5 text-gray-600 opacity-0 transition-all hover:bg-white/10 hover:text-red-500 group-hover:opacity-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {stagedFiles.length < 10 && (
                  <Dropzone
                    accept={{ "application/pdf": [] }}
                    maxFiles={10}
                    maxSize={20 * 1024 * 1024}
                    onDrop={handleFilesStaged}
                    onError={console.error}
                    className="mt-2 h-10 w-full shrink-0 flex-row items-center justify-center gap-1.5 rounded-lg border border-dashed border-white/10 bg-transparent p-0 text-[12px] font-[Arial] text-gray-500 transition-colors duration-200 hover:border-[#ff6600]/40 hover:text-white"
                  >
                    <Plus size={13} />
                    Add more
                  </Dropzone>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer — fixed height, always rendered */}
        <motion.button
          type="button"
          disabled={stagedFiles.length === 0 || loading}
          onClick={() => uploadFiles(stagedFiles)}
          whileTap={stagedFiles.length > 0 ? { scale: 0.98 } : {}}
          className={`mt-4 w-full shrink-0 rounded-xl py-3 text-[14px] font-[Arial] font-bold transition-colors duration-200 ${
            stagedFiles.length > 0
              ? "cursor-pointer bg-[#ff6600] text-white hover:bg-[#ff7b1a]"
              : "cursor-not-allowed border border-white/[0.06] bg-white/[0.04] text-gray-500"
          }`}
        >
          {stagedFiles.length > 0
            ? `Upload ${stagedFiles.length} file${stagedFiles.length > 1 ? "s" : ""}`
            : "Select PDFs to continue"}
        </motion.button>
      </div>
    </div>
  );
}

// --------------------------------> old<----------------------------

// 'use client';
// import { useRouter } from 'next/navigation';
// import { Dropzone, DropzoneContent, DropzoneEmptyState } from '@/components/ui/shadcn-io/dropzone';
// import { useEffect, useState } from 'react';
// import { Loader2Icon } from "lucide-react"

// import { Spinner } from '@/components/ui/shadcn-io/spinner';

// import { Button } from "@/components/ui/button"

// export default function PdfDropzone() {
//   const router = useRouter();
//   const [files, setFiles] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const handleDrop = async(acceptedFiles) => {
//   console.log("Dropped files:", acceptedFiles); // ✅ add this
//   const pdfFile = acceptedFiles[0];

//   if (pdfFile.type !== "application/pdf") {
//     alert("Only PDF files are allowed.");
//     return;
//   }
//   setFiles(acceptedFiles);
//   setLoading(true);
//   console.log("Uploaded PDF:", pdfFile); // ✅ add this
//   const pdfUrl = URL.createObjectURL(pdfFile);
//   // You might be storing it in state for preview or upload

//   if(pdfFile){
//     const formdata = new FormData();
//     formdata.append('pdf', pdfFile);

//     try {
//       const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL_backend}/upload/pdf`, {
//         method: 'POST',
//         body: formdata
//       });

//       const result = await response.json();
//       console.log('Upload result:', result);
//       localStorage.setItem("pdfFilename", result.filename);
//       if (response.ok) {
//        setTimeout(() => {
//           setLoading(false);
//           router.push(`/chat?pdfUrl=${encodeURIComponent(result.pdfurl)}`);
//         }, 1000);
//       }

//       if (!response.ok) {
//         setLoading(false);
//         throw new Error(result.error || 'Failed to upload file');
//       }

//     } catch (error) {
//       console.error('Upload error:', error);
//       alert(`Upload failed: ${error.message}`);
//     }
//   }

// };

//   return (
//     <div className="p-4">
//       {loading ?(
//         <div className='flex flex-col gap-2 justify-center items-center w-[54vw] h-[120px] rounded-[10px] border-[#ff6600]  hover:bg-black shadow-[0_0_20px_#ff6600] transition-all duration-300 mt-[30px]'>
//           <Spinner size={40}/>
//           <div className='text-[12px]'>Uploading PDF... Please wait.</div>
//         </div>
//       ):(
//       <Dropzone
//         accept={{ 'application/pdf': [] }}
//         maxFiles={1}
//         maxSize={1024 * 1024 * 10} // 10MB
//         onDrop={handleDrop}
//         onError={console.error}
//         className= "border-[#ff6600]  hover:bg-black shadow-[0_0_20px_#ff6600] transition-all duration-300 mt-[30px] cursor-pointer"
//       >
//         <DropzoneEmptyState />
//         <DropzoneContent />
//       </Dropzone>
// )}
//       {/* {files.length > 0 && (
//         <div className="mt-4">
//           <h4 className="font-bold">Uploaded PDF:</h4>
//           <ul className="list-disc list-inside">
//             {files.map((file) => (
//               <li key={file.name}>{file.name}</li>
//             ))}
//           </ul>
//         </div>
//       )} */}
//     </div>
//   );
// };
