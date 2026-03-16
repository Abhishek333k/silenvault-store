module.exports = function(eleventyConfig) {
    // Tell Eleventy to copy these exact folders/files to the final build
    eleventyConfig.addPassthroughCopy("assets");
    eleventyConfig.addPassthroughCopy("robots.txt");
    eleventyConfig.addPassthroughCopy("sitemap.xml");

    return {
        dir: {
            input: ".",
            output: "_site",
            data: "_data"
        },
        templateFormats: ["html", "njk"],
        htmlTemplateEngine: "njk",
    };
};