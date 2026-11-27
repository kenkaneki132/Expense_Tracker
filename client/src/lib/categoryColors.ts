// Category identity colors (defined as CSS variables in index.css). The category name is always shown
// next to the color, so color never carries meaning on its own.
export const CATEGORY_COLOR: Record<string, string> = {
  Food: 'var(--cat-food)',
  Transport: 'var(--cat-transport)',
  Utilities: 'var(--cat-utilities)',
  Entertainment: 'var(--cat-entertainment)',
  Other: 'var(--cat-other)',
};

export const categoryColor = (c: string) => CATEGORY_COLOR[c] ?? 'var(--cat-other)';
