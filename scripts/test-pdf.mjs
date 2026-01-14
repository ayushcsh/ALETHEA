import { createRequire } from 'module';
const require = createRequire(import.meta.url);

try {
    const pdf = require('pdf-parse');
    console.log("pdf-parse type:", typeof pdf);
    console.log("pdf-parse exports:", Object.keys(pdf));
    
    // Test the function
    const buffer = Buffer.from("%PDF-1.4\n%EOF");
    pdf(buffer).then(() => {}).catch(e => console.log("Run check:", e.message));

} catch (e) {
    console.error("Load failed:", e);
}
