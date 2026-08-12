import { capitalize, capitalizeArray, toUpperCase } from './text.util';

describe('text.util', () => {
  it('toUpperCase uppercases and trims the value', () => {
    expect(toUpperCase('  rindra leon  ')).toBe('RINDRA LEON');
  });

  it('capitalize uppercases the first letter only', () => {
    expect(capitalize('gestion')).toBe('Gestion');
    expect(capitalize('Gestion')).toBe('Gestion');
    expect(capitalize('jean-pierre')).toBe('Jean-pierre');
  });

  it('capitalize returns empty string unchanged', () => {
    expect(capitalize('')).toBe('');
  });

  it('capitalizeArray capitalizes every element', () => {
    expect(capitalizeArray(['gestion', 'finance'])).toEqual(['Gestion', 'Finance']);
  });
});
