const fs = require('fs');
const pdf = require('pdf-parse');

async function testPdf() {
    try {
        // Create a minimal valid PDF buffer or read a sample file
        // Since we don't have a sample, we'll try to use a dummy buffer if possible, 
        // but pdf-parse might fail on invalid data.
        // Better: create a simple mock of the extraction logic
        
        console.log("Loading pdf-parse...");
        if (typeof pdf !== 'function') {
            console.error("Error: pdf-parse export is not a function:", typeof pdf);
            console.log("Export keys:", Object.keys(pdf));
        } else {
            console.log("pdf-parse loaded successfully as a function.");
        }

        // We can't easily synthesize a PDF binary here without a library, 
        // so we'll just check if the module loads without 'DOMMatrix' errors.
        console.log("Module load check passed.");
        
    } catch (e) {
        console.error("Test failed:", e);
    }
}

testPdf();
