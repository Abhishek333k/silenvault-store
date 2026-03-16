const { parse } = require('csv-parse/sync');
const fs = require('fs');
const path = require('path');

module.exports = async function() {
    const SHEET_ID = '1VvnEPxq42uf_ZJGLmTIpvJXs3J0tF2gYEh49NT47ZBw';
    const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;

    try {
        console.log("Fetching Google Sheet data for Eleventy...");
        
        const response = await fetch(CSV_URL);
        const csvText = await response.text();

        const rows = parse(csvText, { columns: true, skip_empty_lines: true });

        const publishedProducts = rows.filter(row => 
            row.Status && row.Status.toLowerCase() === 'published' && row.ID !== ''
        );

        // Scan local folders for images/videos
        publishedProducts.forEach(product => {
            product.mediaFiles = [];
            product.videoFiles = [];
            
            // Assume the 'Images' column contains the path (e.g., assets/products/pack-01)
            const folderPathRaw = product.Images ? product.Images.trim() : '';
            
            if (folderPathRaw) {
                const absolutePath = path.join(__dirname, '..', folderPathRaw);
                
                if (fs.existsSync(absolutePath)) {
                    const files = fs.readdirSync(absolutePath);
                    // Find Images
                    product.mediaFiles = files
                        .filter(f => /\.(webp|jpg|jpeg|png|gif)$/i.test(f))
                        .map(f => `/${folderPathRaw}/${f}`);
                    // Find Videos
                    product.videoFiles = files
                        .filter(f => /\.(mp4|webm)$/i.test(f))
                        .map(f => `/${folderPathRaw}/${f}`);
                }
            }
        });

        console.log(`Successfully built ${publishedProducts.length} published products!`);
        return publishedProducts;
    } catch (error) {
        console.error("Error fetching from Google Sheets:", error);
        return [];
    }
};