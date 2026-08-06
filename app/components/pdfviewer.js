"use client";

import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Spinner } from "../../components/ui/shadcn-io/spinner";
import { MdZoomIn, MdZoomOut } from "react-icons/md";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2.5;
const ZOOM_STEP = 0.25;

export default function PdfViewer({ url }) {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [numPages, setNumPages] = useState(0);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Reset zoom and scroll position whenever a different document is opened
  useEffect(() => {
    setZoom(1);
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [url]);

  return (
    <div className="relative h-full w-full">
      <div
        ref={containerRef}
        className="h-full w-full overflow-y-auto overflow-x-auto pdf-scrollbar flex flex-col items-center gap-3 p-2"
      >
        <Document
          file={url}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          loading={
            <div className="flex h-full w-full items-center justify-center">
              <Spinner size={32} />
            </div>
          }
          error={
            <div className="flex h-full w-full items-center justify-center text-gray-400 text-sm font-[Arial]">
              Failed to load PDF.
            </div>
          }
          className="flex flex-col items-center gap-3"
        >
          {containerWidth > 0 &&
            Array.from({ length: numPages }, (_, i) => (
              <Page
                key={`page_${i + 1}`}
                pageNumber={i + 1}
                width={(containerWidth - 16) * zoom}
                className="overflow-hidden rounded-[8px] shadow-md"
              />
            ))}
        </Document>
      </div>

      {numPages > 0 && (
        <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1 rounded-full border border-[#333] bg-[#131313]/90 backdrop-blur-sm px-1 py-1 shadow-sm">
          <button
            onClick={() =>
              setZoom((z) => Math.max(MIN_ZOOM, +(z - ZOOM_STEP).toFixed(2)))
            }
            disabled={zoom <= MIN_ZOOM}
            className="h-7 w-7 flex items-center justify-center rounded-full text-white hover:bg-[#262626] transition-all disabled:opacity-40"
          >
            <MdZoomOut className="h-4 w-4" />
          </button>
          <span className="text-[11px] font-[Arial] text-gray-300 w-10 text-center select-none">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() =>
              setZoom((z) => Math.min(MAX_ZOOM, +(z + ZOOM_STEP).toFixed(2)))
            }
            disabled={zoom >= MAX_ZOOM}
            className="h-7 w-7 flex items-center justify-center rounded-full text-white hover:bg-[#262626] transition-all disabled:opacity-40"
          >
            <MdZoomIn className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
