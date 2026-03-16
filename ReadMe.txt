The SEO Blueprint: How to write the Title and Description
Because we engineered item.njk to inject your Google Sheet data directly into the <title>, <meta name="description">, and JSON-LD Schema, what you write in the sheet is your SEO.

Writing the Title Column:

Keep it under 60 characters.

Include the specific keyword people search for.

Bad: "My Pack"

Good SEO: "Cyberpunk 4K Live Wallpaper Pack" (Because people actually search for "4k live wallpapers").

Note: The code automatically appends | SilenVault Store to the end of whatever you write.

Writing the Description Column:
This text appears on the product card, on the dedicated item page, AND in the Google Search results under your blue link.

Keep the most important information in the first 150-160 characters. Google cuts off meta descriptions after 160 characters.

Include keywords naturally.

Example: "Optimize your PC instantly with the OS Ghost Config. This lightweight Windows batch script clears telemetry, flushes DNS, and frees RAM for developers."

Writing the Price and Type Columns:

If it's free, type exactly FREE in the Price column, and Free in the Type column. Our code specifically looks for the word "FREE" to change the JSON-LD schema price to 0.00 (which allows it to show up as a free item in Google Shopping).

For paid items, include the dollar sign (e.g., $19.00). Our code automatically strips the $ out behind the scenes so Google Shopping reads it properly as 19.00.