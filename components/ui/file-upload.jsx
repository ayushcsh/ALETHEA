"use client";
import { cn } from "../../lib/utils";
import React, { useRef, useState } from "react";
import { motion } from "motion/react";
import { IconUpload } from "@tabler/icons-react";
import { useDropzone } from "react-dropzone";

const mainVariant = {
  initial: {
    x: 0,
    y: 0,
  },
  animate: {
    x: 20,
    y: -20,
    opacity: 0.9,
  },
};

const secondaryVariant = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
  },
};

export const FileUpload = ({
  onChange,
  accept,
  multiple = true,
  title = "Upload file",
  subtitle = "Drag or drop your files here or click to upload",
}) => {
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileChange = (newFiles) => {
    setFiles((prevFiles) => (multiple ? [...prevFiles, ...newFiles] : newFiles));
    onChange && onChange(newFiles);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const { getRootProps, isDragActive } = useDropzone({
    multiple,
    accept,
    noClick: true,
    onDrop: handleFileChange,
    onDropRejected: (error) => {
      console.log(error);
    },
  });

  return (
    <div className="w-full" {...getRootProps()}>
      <motion.div
        onClick={handleClick}
        whileHover="animate"
        className="group/file relative block w-full cursor-pointer overflow-hidden rounded-xl border border-dashed border-white/10 bg-white/[0.02] p-6 transition-colors duration-200 hover:border-[#ff6600]/40 hover:bg-white/[0.04]">
        <input
          ref={fileInputRef}
          id="file-upload-handle"
          type="file"
          multiple={multiple}
          accept={accept ? Object.keys(accept).join(",") : undefined}
          onChange={(e) => handleFileChange(Array.from(e.target.files || []))}
          className="hidden" />
        <div
          className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]">
          <GridPattern />
        </div>
        <div className="flex flex-col items-center justify-center">
          <p
            className="relative z-20 font-[Arial] text-[14px] font-semibold text-white">
            {title}
          </p>
          <p
            className="relative z-20 mt-2 font-[Arial] text-[12px] font-normal text-gray-500">
            {subtitle}
          </p>
          <div className="relative mx-auto mt-6 w-full max-w-xl">
            {files.length > 0 &&
              files.map((file, idx) => (
                <motion.div
                  key={"file" + idx}
                  layoutId={idx === 0 ? "file-upload" : "file-upload-" + idx}
                  className={cn(
                    "relative z-40 mx-auto mt-4 flex w-full flex-col items-start justify-start overflow-hidden rounded-md border border-white/[0.06] bg-[#1a1a1a] p-4 md:h-24",
                    "shadow-sm"
                  )}>
                  <div className="flex w-full items-center justify-between gap-4">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="max-w-xs truncate font-[Arial] text-[13px] text-white">
                      {file.name}
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="w-fit shrink-0 rounded-lg bg-[#242424] px-2 py-1 font-[Arial] text-[11px] text-gray-300">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </motion.p>
                  </div>

                  <div
                    className="mt-2 flex w-full flex-col items-start justify-between font-[Arial] text-[11px] text-gray-500 md:flex-row md:items-center">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      layout
                      className="rounded-md bg-[#242424] px-1 py-0.5">
                      {file.type}
                    </motion.p>

                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} layout>
                      modified{" "}
                      {new Date(file.lastModified).toLocaleDateString()}
                    </motion.p>
                  </div>
                </motion.div>
              ))}
            {!files.length && (
              <motion.div
                layoutId="file-upload"
                variants={mainVariant}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 20,
                }}
                className={cn(
                  "relative z-40 mx-auto mt-4 flex h-32 w-full max-w-[8rem] items-center justify-center rounded-md bg-[#1a1a1a] group-hover/file:shadow-2xl",
                  "shadow-[0px_10px_50px_rgba(0,0,0,0.3)]"
                )}>
                {isDragActive ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-1 font-[Arial] text-[12px] text-[#ff6600]">
                    Drop it
                    <IconUpload className="h-4 w-4 text-[#ff6600]" />
                  </motion.p>
                ) : (
                  <IconUpload className="h-4 w-4 text-[#ff6600]" />
                )}
              </motion.div>
            )}

            {!files.length && (
              <motion.div
                variants={secondaryVariant}
                className="absolute inset-0 z-30 mx-auto mt-4 flex h-32 w-full max-w-[8rem] items-center justify-center rounded-md border border-dashed border-[#ff6600]/60 bg-transparent opacity-0"></motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export function GridPattern() {
  const columns = 41;
  const rows = 11;
  return (
    <div
      className="flex shrink-0 scale-105 flex-wrap items-center justify-center gap-x-px gap-y-px bg-[#141414]">
      {Array.from({ length: rows }).map((_, row) =>
        Array.from({ length: columns }).map((_, col) => {
          const index = row * columns + col;
          return (
            <div
              key={`${col}-${row}`}
              className={`flex h-10 w-10 shrink-0 rounded-[2px] ${
                index % 2 === 0
                  ? "bg-[#101010]"
                  : "bg-[#101010] shadow-[0px_0px_1px_3px_rgba(0,0,0,1)_inset]"
              }`} />
          );
        }))}
    </div>
  );
}
