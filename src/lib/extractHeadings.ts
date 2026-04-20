import GithubSlugger from 'github-slugger';

export interface TocHeading {
  level: number;
  text: string;
  id: string;
}

export function extractHeadings(markdown: string): TocHeading[] {
  const headings: TocHeading[] = [];
  const slugger = new GithubSlugger();
  const lines = markdown.split('\n');

  for (const line of lines) {
    const match = line.match(/^(#{2,4})\s+(.+)/);
    if (match) {
      const level = match[1].length;
      const text = match[2].replace(/[*_`~[\]]/g, '').trim();
      headings.push({ level, text, id: slugger.slug(text) });
    }
  }

  return headings;
}
