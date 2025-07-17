import React from 'react';

export interface HighlightMatch {
  text: string;
  isMatch: boolean;
}

/**
 * Highlights matching text in a string based on search query
 * @param text - The text to highlight
 * @param query - The search query
 * @param caseSensitive - Whether the search should be case sensitive
 * @returns Array of text segments with match information
 */
export function highlightText(
  text: string, 
  query: string, 
  caseSensitive: boolean = false
): HighlightMatch[] {
  if (!query.trim() || !text) {
    return [{ text, isMatch: false }];
  }

  const searchText = caseSensitive ? text : text.toLowerCase();
  const searchQuery = caseSensitive ? query : query.toLowerCase();
  
  // Handle multiple search terms
  const terms = searchQuery.split(/\s+/).filter(term => term.length > 0);
  
  if (terms.length === 0) {
    return [{ text, isMatch: false }];
  }

  // Create a regex pattern that matches any of the search terms
  const pattern = terms.map(term => 
    term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape special regex characters
  ).join('|');
  
  const regex = new RegExp(`(${pattern})`, caseSensitive ? 'g' : 'gi');
  
  const parts = text.split(regex);
  const result: HighlightMatch[] = [];
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (part) {
      const isMatch = regex.test(caseSensitive ? part : part.toLowerCase());
      result.push({ text: part, isMatch });
    }
  }
  
  return result;
}

/**
 * React component for rendering highlighted text
 */
export interface HighlightedTextProps {
  text: string;
  query: string;
  caseSensitive?: boolean;
  className?: string;
  highlightClassName?: string;
}

export function HighlightedText({ 
  text, 
  query, 
  caseSensitive = false,
  className = '',
  highlightClassName = 'bg-yellow-200 text-yellow-900 px-0.5 rounded'
}: HighlightedTextProps) {
  const segments = highlightText(text, query, caseSensitive);
  
  return React.createElement(
    'span',
    { className },
    ...segments.map((segment, index) =>
      segment.isMatch
        ? React.createElement(
            'mark',
            { 
              key: index, 
              className: highlightClassName 
            },
            segment.text
          )
        : segment.text
    )
  );
}

/**
 * Advanced highlighting with fuzzy match support
 * Highlights characters that match in sequence but not necessarily consecutive
 */
export function fuzzyHighlightText(
  text: string,
  query: string,
  caseSensitive: boolean = false
): HighlightMatch[] {
  if (!query.trim() || !text) {
    return [{ text, isMatch: false }];
  }

  const searchText = caseSensitive ? text : text.toLowerCase();
  const searchQuery = caseSensitive ? query : query.toLowerCase();
  
  const result: HighlightMatch[] = [];
  let textIndex = 0;
  let queryIndex = 0;
  let currentSegment = '';
  
  while (textIndex < text.length && queryIndex < searchQuery.length) {
    const textChar = searchText[textIndex];
    const queryChar = searchQuery[queryIndex];
    
    if (textChar === queryChar) {
      // Push any accumulated non-matching text
      if (currentSegment) {
        result.push({ text: currentSegment, isMatch: false });
        currentSegment = '';
      }
      
      // Add the matching character
      result.push({ text: text[textIndex], isMatch: true });
      queryIndex++;
    } else {
      // Accumulate non-matching characters
      currentSegment += text[textIndex];
    }
    
    textIndex++;
  }
  
  // Add any remaining text
  if (currentSegment) {
    result.push({ text: currentSegment, isMatch: false });
  }
  
  // Add any remaining text after all matches
  if (textIndex < text.length) {
    result.push({ text: text.slice(textIndex), isMatch: false });
  }
  
  return result;
}

/**
 * Get highlighted text as HTML string (for cases where React components can't be used)
 */
export function getHighlightedHTML(
  text: string,
  query: string,
  caseSensitive: boolean = false,
  highlightClass: string = 'search-highlight'
): string {
  const segments = highlightText(text, query, caseSensitive);
  
  return segments
    .map(segment => 
      segment.isMatch 
        ? `<mark class="${highlightClass}">${segment.text}</mark>`
        : segment.text
    )
    .join('');
}

/**
 * Calculate match score for search results ranking
 * Higher score = better match
 */
export function calculateMatchScore(
  text: string,
  query: string,
  caseSensitive: boolean = false
): number {
  if (!query.trim() || !text) return 0;
  
  const searchText = caseSensitive ? text : text.toLowerCase();
  const searchQuery = caseSensitive ? query : query.toLowerCase();
  
  let score = 0;
  
  // Exact match gets highest score
  if (searchText === searchQuery) {
    score += 100;
  }
  
  // Starts with query gets high score
  if (searchText.startsWith(searchQuery)) {
    score += 50;
  }
  
  // Contains query gets medium score
  if (searchText.includes(searchQuery)) {
    score += 25;
  }
  
  // Word boundary matches get bonus
  const wordBoundaryRegex = new RegExp(`\\b${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
  if (wordBoundaryRegex.test(searchText)) {
    score += 15;
  }
  
  // Fuzzy match gets lower score
  const fuzzyMatches = fuzzyHighlightText(text, query, caseSensitive);
  const matchedChars = fuzzyMatches.filter(m => m.isMatch).length;
  if (matchedChars > 0) {
    score += (matchedChars / query.length) * 10;
  }
  
  // Penalize longer texts (shorter matches are more relevant)
  score -= Math.log(text.length) * 2;
  
  return Math.max(0, score);
}
