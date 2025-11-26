// Dynamically try to load worker (won’t crash if missing)
// try {
//   await import("pdf-parse/worker");
// } catch (err) {
//   console.warn("pdf-parse/worker not found — continuing without it");
// }

import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";
import { NextResponse } from "next/server";
import axios from "axios";

// Fetch file buffer
async function fetchFileBuffer(url: string): Promise<Buffer> {
  try {
    const response = await axios.get<ArrayBuffer>(url, { responseType: "arraybuffer" });
    return Buffer.from(response.data);
  } catch (err: any) {
    throw new Error(`Failed to fetch file from URL ${url}: ${err.message}`);
  }
}

// PDF extraction
async function extractPDFText(url: string): Promise<string> {
  const buffer = await fetchFileBuffer(url);
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return result.text;
  } catch (err: any) {
    throw new Error(`PDF parsing error for ${url}: ${err.message}`);
  } finally {
    await parser.destroy();
  }
}

// DOC/DOCX extraction
async function extractDocText(url: string): Promise<string> {
  const buffer = await fetchFileBuffer(url);
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  } catch (err: any) {
    throw new Error(`DOC/DOCX parsing error for ${url}: ${err.message}`);
  }
}

// Determine file type
async function extractTextFromUrl(url: string, fileName: string): Promise<string> {
  const lower = fileName.toLowerCase();
  if (lower.endsWith(".pdf")) return extractPDFText(url);
  if (lower.endsWith(".docx") || lower.endsWith(".doc")) return extractDocText(url);
  throw new Error(`Unsupported file type: ${fileName}`);
}

// POST handler
export async function POST(req: Request) {
  try {
    const { url, fileName } = await req.json();
    if (!url || !fileName) throw new Error("Missing 'url' or 'fileName' in request body");

    const text = await extractTextFromUrl(url, fileName);
    const response = NextResponse.json({ text });

    // Add CORS headers
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type");

    return response;
  } catch (err: any) {
    console.error("Error in /extract route:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
