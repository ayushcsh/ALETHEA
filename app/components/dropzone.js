"use client";

import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "../../components/ui/shadcn-io/dropzone";
import { useState } from "react";
import { Spinner } from "../../components/ui/shadcn-io/spinner";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useSession } from "next-auth/react";
import { useAction } from "convex/react";
import { extractText } from "../../convex/nodeActions";
import { useRouter } from "next/navigation";

export default function PdfDropzone({}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();
  const userId = session?.user?.id; // Access the convexUserId

  // ✅ Correct useMutation calls
  const generateUploadUrl = useMutation(
    api.generateUploadUrl.generateUploadUrl
  );
  const savePdfMetadata = useMutation(api.savePdfMetadata.savePdfMetadata);
  const embedings = useAction(api.embedings.embedings);

  const chatid = useMutation(api.chatid.chatid);

  const handleDrop = async (acceptedFiles) => {
    const pdfFile = acceptedFiles[0];
    if (!pdfFile) return;

    console.log("Dropped file:", pdfFile);

    if (pdfFile.type !== "application/pdf") {
      alert("Only PDF files are allowed.");
      return;
    }

    setLoading(true);

    try {
      console.log("Generating upload URL...");
      const uploadUrl = await generateUploadUrl();
      console.log("Received upload URL:", uploadUrl);

      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": pdfFile.type },
        body: pdfFile,
      });

      console.log("Upload response status:", result.status);

      if (!result.ok) {
        throw new Error("Upload to Convex storage failed.");
      }

      const data = await result.json();
      console.log("Upload result data:", data);

      const { storageId } = data;
      console.log("Storage ID received:", storageId);

      console.log("Saving PDF metadata to Convex...");
      const metadataResult = await savePdfMetadata({
        storageId,
        title: pdfFile.name,
        fileName: pdfFile.name,
        contentType: pdfFile.type,
        userId: userId || undefined,
      });
      console.log("Metadata save result:", metadataResult);
      console.log("this is userId", userId);

      console.log("Starting embedding process...");
      // const text = await extractText({ url:uploadUrl, fileName: metadataResult.fileName });
      // console.log("Extracted text length:", text.length);
      const response = await embedings({
        pdfId: metadataResult?._id || metadataResult,
      });

      const url = response?.url;
      console.log("Embedding response URL:", url);
      console.log("🧠 Embeddings generated and stored successfully!");
      localStorage.setItem("pdfId", metadataResult?._id || metadataResult);
      // alert("PDF uploaded successfully!");

      const chatId = await chatid({
        userId: userId,
        pdfId: metadataResult?._id || metadataResult,
        title: "new chat",
        pdfUrl: url,
      });
      localStorage.setItem("chatId", chatId);
      localStorage.setItem("userId", userId);
      console.log("Chat ID created:", chatId);

      if (url && chatId && userId) {
        router.push(
          `/chat?pdfurl=${encodeURIComponent(url)}&chatId=${encodeURIComponent(chatId)}&userid=${encodeURIComponent(userId)}`
        );
      } else {
        console.warn("No URL returned from embedding action");
        router.push(`/chat`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      {loading ? (
        <div className="flex flex-col gap-2 justify-center items-center w-[54vw] h-[120px] rounded-[10px] border-[#ff6600] hover:bg-black shadow-[0_0_20px_#ff6600] transition-all duration-300 mt-[30px]">
          <Spinner size={40} />
          <div className="text-[12px]">Uploading PDF... Please wait.</div>
        </div>
      ) : (
        <Dropzone
          accept={{ "application/pdf": [] }}
          maxFiles={1}
          maxSize={10 * 1024 * 1024}
          onDrop={handleDrop}
          onError={console.error}
          className="border-[#ff6600] hover:bg-black shadow-[0_0_20px_#ff6600] transition-all duration-300 mt-[30px] cursor-pointer"
        >
          <DropzoneEmptyState />
          <DropzoneContent />
        </Dropzone>
      )}
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
