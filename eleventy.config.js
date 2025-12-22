const fs = require('fs');
const path = require('path');
const markdownIt = require('markdown-it');

module.exports = function(eleventyConfig) {
  const md = markdownIt({ html: true });

  // Current year filter for dynamic copyright
  eleventyConfig.addFilter("currentYear", function() {
    return new Date().getFullYear();
  });

  // Date filter for formatting dates
  eleventyConfig.addFilter("date", function(date, format) {
    const d = new Date(date);
    const months = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"];

    if (format === "Y") {
      return d.getFullYear();
    }
    if (format === "Y-m-d") {
      return d.toISOString().slice(0, 10);
    }
    // "F j, Y" format: Month day, Year
    if (format === "F j, Y") {
      return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
    }
    return d.toLocaleDateString();
  });

  // Custom shortcode to include and render markdown files
  eleventyConfig.addShortcode("markdown", function(filePath) {
    const fullPath = path.join(__dirname, filePath);
    const content = fs.readFileSync(fullPath, 'utf8');
    return md.render(content);
  });

  // Watch for changes in content files
  eleventyConfig.addWatchTarget("./content/**/*.md");

  // Copy media folder to output (for blog post images)
  eleventyConfig.addPassthroughCopy("media");

  // Ignore the CV markdown files (they're included via shortcode)
  eleventyConfig.ignores.add("./content/cv/*.md");

  // Ignore CLAUDE.MD documentation file
  eleventyConfig.ignores.add("./CLAUDE.MD");

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
};
