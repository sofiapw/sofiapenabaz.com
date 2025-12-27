const fs = require('fs');
const path = require('path');
const markdownIt = require('markdown-it');
const matter = require('gray-matter');

module.exports = function(eleventyConfig) {
  const md = markdownIt({ html: true });

  // Collection for presentations - reads metadata from slides.md files
  eleventyConfig.addCollection("presentations", function() {
    const presentationsDir = path.join(__dirname, 'content/presentations');
    const presentations = [];

    // Scan year directories (e.g., 2025)
    const years = fs.readdirSync(presentationsDir).filter(item => {
      const itemPath = path.join(presentationsDir, item);
      return fs.statSync(itemPath).isDirectory() && /^\d{4}$/.test(item);
    });

    for (const year of years) {
      const yearPath = path.join(presentationsDir, year);
      // Scan month directories (e.g., 01, 02)
      const months = fs.readdirSync(yearPath).filter(item => {
        const itemPath = path.join(yearPath, item);
        return fs.statSync(itemPath).isDirectory() && /^\d{2}$/.test(item);
      });

      for (const month of months) {
        const monthPath = path.join(yearPath, month);
        // Scan presentation directories
        const talks = fs.readdirSync(monthPath).filter(item => {
          const itemPath = path.join(monthPath, item);
          return fs.statSync(itemPath).isDirectory() && !item.startsWith('_');
        });

        for (const talk of talks) {
          const slidesPath = path.join(monthPath, talk, 'slides.md');
          if (fs.existsSync(slidesPath)) {
            const content = fs.readFileSync(slidesPath, 'utf8');
            const parsed = matter(content);

            // Skip hidden presentations
            if (parsed.data.hidden) continue;

            presentations.push({
              title: parsed.data.title || talk,
              date: parsed.data.date ? new Date(parsed.data.date) : new Date(`${year}-${month}-01`),
              venue: parsed.data.venue || '',
              url: `/presentations/${year}/${month}/${talk}/`,
              year: year,
              month: month,
              slug: talk
            });
          }
        }
      }
    }

    // Sort by date, newest first
    return presentations.sort((a, b) => b.date - a.date);
  });

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

  // Copy presentations folder to output (reveal.js slides)
  eleventyConfig.addPassthroughCopy({ "content/presentations": "presentations" });

  // Ignore the CV markdown files (they're included via shortcode)
  eleventyConfig.ignores.add("./content/cv/*.md");

  // Ignore presentation files (they're passthrough copied as-is for reveal.js)
  eleventyConfig.ignores.add("./content/presentations/**/*");

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
