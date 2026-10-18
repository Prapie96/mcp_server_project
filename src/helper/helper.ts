export const splitText = (text: string, maxLength = 500) => {
  const sentences = text.split(/(?<=[.!?])\s+/);
  let current = "";
  let chunks = [];
  for (const sentence of sentences) {
    if ((current + sentence).length > maxLength) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current += " " + sentence;
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
};
