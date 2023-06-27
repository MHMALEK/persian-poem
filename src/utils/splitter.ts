function splitMessage(message: string, maxChunkLines: number) {
  let lines = message.split("\n");
  let result = [];
  let chunk = "";

  for (let i = 0; i < lines.length; i++) {
    chunk += lines[i] + "\n";

    // If this line is the end of a chunk
    if ((i + 1) % maxChunkLines === 0) {
      result.push(chunk);
      chunk = "";
    }
  }

  // Add the last chunk if it's not empty
  if (chunk !== "") {
    result.push(chunk);
  }

  return result;
}

export { splitMessage };
