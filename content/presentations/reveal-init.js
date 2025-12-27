// Shared Reveal.js initialization with front matter support
// Strip YAML front matter from markdown
function stripFrontMatter(content) {
  return content.replace(/^---\n[\s\S]*?\n---\n/, '');
}

// Load markdown, strip front matter, then initialize Reveal
function initReveal(options = {}) {
  fetch('slides.md')
    .then(response => response.text())
    .then(markdown => {
      document.querySelector('[data-template]').textContent = stripFrontMatter(markdown);
      Reveal.initialize({
        hash: true,
        plugins: [RevealMarkdown, RevealHighlight, RevealNotes],
        ...options
      });
    });
}
