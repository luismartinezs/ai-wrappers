import { marked, MarkedOptions } from "marked"

/**
 * Converts markdown string to HTML
 * @param markdown - The markdown string to convert
 * @param options - Optional configuration for markdown parsing
 * @returns The HTML string
 */
export async function markdownToHtml(
  markdown: string,
  options: MarkedOptions = {}
): Promise<string> {
  // Set safe defaults
  const defaultOptions: MarkedOptions = {
    gfm: true, // GitHub Flavored Markdown
    breaks: true, // Convert \n to <br>
    ...options
  }

  return marked(markdown, defaultOptions)
}

/**
 * Converts markdown string to plain text by stripping all markdown syntax
 * @param markdown - The markdown string to convert
 * @returns The plain text string
 */
export async function markdownToText(markdown: string): Promise<string> {
  // First convert to HTML
  const html = await markdownToHtml(markdown)

  // Create a temporary element to parse HTML
  if (typeof document !== "undefined") {
    const temp = document.createElement("div")
    temp.innerHTML = html
    return temp.textContent || temp.innerText || ""
  }

  // For server-side, return a basic stripped version
  return html.replace(/<[^>]*>/g, "")
}