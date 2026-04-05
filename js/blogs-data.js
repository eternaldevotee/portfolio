/**
 * Blogs data — add new blogs here. Each blog is an object with:
 * - id: unique identifier (string)
 * - title: blog title (string)
 * - date: publication date (string, e.g., "2023-10-01")
 * - excerpt: short summary (string)
 * - content: full blog content in HTML (string)
 * - tags: array of tags (optional)
 *
 * Template for new blog:
 * {
 *   id: "my-new-blog",
 *   title: "My New Blog Post",
 *   date: "2026-04-05",
 *   excerpt: "A brief summary of the blog post.",
 *   content: `
 *     <p>Full content here. Use HTML for formatting.</p>
 *     <h2>Subheading</h2>
 *     <p>More content...</p>
 *   `,
 *   tags: ["tag1", "tag2"]
 * }
 */

(function (global) {
  global.BLOGS = [
    {
      id: "welcome-blog",
      title: "Welcome to My Blog",
      date: "2026-04-05",
      excerpt:
        "Introducing my new blog section where I'll share thoughts on software engineering, technology, and my experiences.",
      content: `
        <p>Hello! Welcome to my blog. This is the first post in what I hope will be a series of articles about software development, best practices, and my journey as a developer.</p>
        <p>I'll be writing about topics like Spring Boot, Angular, Java, and other technologies I'm working with. Stay tuned for more!</p>
      `,
      tags: ["introduction", "blog"],
    },
    {
      id: "welcome-blog",
      title: "Welcome to My Blog",
      date: "2026-04-05",
      excerpt:
        "Introducing my new blog section where I'll share thoughts on software engineering, technology, and my experiences.",
      content: `
        <p>Hello! Welcome to my blog. This is the first post in what I hope will be a series of articles about software development, best practices, and my journey as a developer.</p>
        <p>I'll be writing about topics like Spring Boot, Angular, Java, and other technologies I'm working with. Stay tuned for more!</p>
      `,
      tags: ["introduction", "blog"],
    },
    // Add more blogs here
  ];
})(typeof window !== "undefined" ? window : this);