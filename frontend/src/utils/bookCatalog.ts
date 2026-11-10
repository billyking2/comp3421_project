import type { BookData } from '../services/Data';

export const PRICE_BANDS = [
  { id: 'under-150', label: 'Under $150' },
  { id: '150-249', label: '$150 – $249.99' },
  { id: '250-399', label: '$250 – $399.99' },
  { id: '400-plus', label: '$400 and up' },
] as const;

// Returns an array of categories for a given book, splitting the categories string by commas and trimming whitespace.
export function getBookCategories(book: BookData): string[] {
  return (book.categories ?? '')
    .split(',')
    .map((category) => category.trim())
    .filter(Boolean);
}

// Returns a boolean indicating whether a given book matches a specified price band.
export function matchesPriceBand(book: BookData, band: string): boolean {
  const price = Number(book.price);
  switch (band) {
    case 'under-150':
      return price < 150;
    case '150-249':
      return price >= 150 && price < 250;
    case '250-399':
      return price >= 250 && price < 400;
    case '400-plus':
      return price >= 400;
    default:
      return true;
  }
}
