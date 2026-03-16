module.exports = function(eleventyConfig) {
    // Tell Eleventy to copy these exact folders/files to the final build
    eleventyConfig.addPassthroughCopy("assets");
    eleventyConfig.addPassthroughCopy("robots.txt");

    // Custom Date Filter for the Sitemap
    eleventyConfig.addFilter("date", function() {
        return new Date().toISOString().split('T')[0]; // Returns YYYY-MM-DD
    });

    return {
        dir: {
            input: ".",
            output: "_site",
            data: "_data"
        },
        templateFormats: ["html", "njk", "md"],
        htmlTemplateEngine: "njk",
    };
};