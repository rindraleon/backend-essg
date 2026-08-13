import { buildIlikeTerm, escapeIlike, sanitizeSortField } from './search.util';

describe('search.util', () => {
  it('escapes ILIKE wildcards', () => {
    expect(escapeIlike('100%_ok\\')).toBe('100\\%\\_ok\\\\');
  });

  it('builds a trimmed ILIKE term', () => {
    expect(buildIlikeTerm('  jean  ')).toBe('%jean%');
  });

  it('sanitizes sort fields', () => {
    expect(sanitizeSortField('email', ['email', 'nom'])).toBe('email');
    expect(sanitizeSortField('drop table', ['email', 'nom'])).toBeUndefined();
  });
});
