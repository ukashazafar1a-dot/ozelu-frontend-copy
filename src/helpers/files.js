export function getOddPages(totalPages) {
  const oddPages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i % 2 !== 0) {
      oddPages.push(i);
    }
  }
  return oddPages;
}

export function getEvenPages(totalPages) {
  const evenPages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i % 2 === 0) {
      evenPages.push(i);
    }
  }
  return evenPages;
}

export function isValidPageRange(input, totalPages) {
  if (!input || typeof input !== "string") return false;

  const parts = input.split(",");
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.includes("-")) {
      const [startStr, endStr] = trimmed.split("-");
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);

      if (
        isNaN(start) ||
        isNaN(end) ||
        start < 1 ||
        end > totalPages ||
        start > end
      ) {
        return false;
      }
    } else {
      const page = parseInt(trimmed, 10);
      if (isNaN(page) || page < 1 || page > totalPages) {
        return false;
      }
    }
  }

  return true;
}


export function parsePageRanges(input, totalPages) {
  const pages = new Set();

  if (!input || typeof input !== "string") return [];

  const parts = input.split(",");
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.includes("-")) {
      const [startStr, endStr] = trimmed.split("-");
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);

      if (
        !isNaN(start) &&
        !isNaN(end) &&
        start >= 1 &&
        end <= totalPages &&
        start <= end
      ) {
        for (let i = start; i <= end; i++) {
          pages.add(i);
        }
      }
    } else {
      const page = parseInt(trimmed, 10);
      if (!isNaN(page) && page >= 1 && page <= totalPages) {
        pages.add(page);
      }
    }
  }

  return [...pages].sort((a, b) => a - b);
}