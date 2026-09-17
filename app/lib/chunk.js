export function chunkText(text) {
    const paragraphs = text
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean);
  
    if (paragraphs.length > 1) {
      paragraphs[1] = `${paragraphs[0]}\n\n${paragraphs[1]}`;
      paragraphs.shift();
    }
  
    return paragraphs;
  }