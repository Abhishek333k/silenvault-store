const { parse } = require('csv-parse/sync');
const fs = require('fs');
const path = require('path');

module.exports = async function() {
    const SHEET_ID = '1VvnEPxq42uf_ZJGLmTIpvJXs3J0tF2gYEh49NT47ZBw';
    const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;

    try {
        console.log("---------------------------------------------------");
        console.log("Fetching Google Sheet data for Eleventy...");
        
        const response = await fetch(CSV_URL);
        const csvText = await response.text();

        // Parse the CSV
        const rows = parse(csvText, { columns: true, skip_empty_lines: true });

        const publishedProducts = rows.filter(row => 
            row.Status && row.Status.toLowerCase() === 'published' && row.ID !== ''
        );

        // Scan local folders for images/videos
        publishedProducts.forEach(product => {
            product.mediaFiles = [];
            product.videoFiles = [];
            
            // Check your Google Sheet: Ensure the column header is exactly "Images"
            const folderPathRaw = product.Images ? product.Images.trim() : '';
            
            if (folderPathRaw) {
                // Find the absolute path on your Windows machine
                const absolutePath = path.join(__dirname, '..', folderPathRaw);
                
                console.log(`[DEBUG] Checking Product: ${product.ID}`);
                console.log(`[DEBUG] Looking for folder at: ${absolutePath}`);
                
                if (fs.existsSync(absolutePath)) {
                    console.log(`[DEBUG] Folder FOUND! Scanning files...`);
                    const files = fs.readdirSync(absolutePath);
                    
                    // Windows uses backslashes, Web uses forward slashes. We force forward slashes here.
                    const webPath = folderPathRaw.replace(/\\/g, '/');

                    // Find Images
                    product.mediaFiles = files
                        .filter(f => /\.(webp|jpg|jpeg|png|gif)$/i.test(f))
                        .map(f => `/${webPath}/${f}`);
                        
                    // Find Videos
                    product.videoFiles = files
                        .filter(f => /\.(mp4|webm)$/i.test(f))
                        .map(f => `/${webPath}/${f}`);
                        
                    console.log(`[DEBUG] Found ${product.mediaFiles.length} images and ${product.videoFiles.length} videos.`);
                } else {
                    console.log(`[DEBUG] Folder NOT FOUND on your hard drive.`);
                }
            } else {
                console.log(`[DEBUG] Product ${product.ID} has an empty 'Images' column in Google Sheets.`);
            }
        });

        console.log("---------------------------------------------------");
        return publishedProducts;
    } catch (error) {
        console.error("Error fetching from Google Sheets:", error);
        return [];
    }
};