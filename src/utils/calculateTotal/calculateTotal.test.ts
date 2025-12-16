import { describe, expect, it } from 'vitest';
import { calculateTotal } from './calculateTotal';

describe('calculateTotal', () => {
  it('should work with newlines', () => {
    expect(calculateTotal('100\n200')).toBe(300);
    expect(calculateTotal('50\n50\n50')).toBe(150);
  });

  it('should handle mixed delimiters', () => {
    expect(calculateTotal('100,200\n300')).toBe(600);
    expect(calculateTotal('1.5\n4.5,5.5')).toBe(11.5);
  });
  it('should handle empty input', () => {
    expect(calculateTotal('')).toBe(0);
    expect(calculateTotal('\n,\n')).toBe(0);
  });
  
  it('should ignore invalid numbers', () => {
    expect(calculateTotal('100,abc\n200')).toBe(300);
    expect(calculateTotal('50\nxyz,50')).toBe(100);
  });
  it('should handle decimal numbers', () => {
    expect(calculateTotal('10.5,20.3\n30.2')).toBeCloseTo(61.0);
    expect(calculateTotal('0.1\n0.2,0.3')).toBeCloseTo(0.6);
  });

  it('should handle whitespace', () => {
    expect(calculateTotal('  100 , 200 \n 300 ')).toBe(600);
    expect(calculateTotal('\n 50 \n , 50 ')).toBe(100);
  });

  it('should handle complex combinations', () => {
    expect(calculateTotal('  10.5 , abc \n 20.5 , 30.0 \n xyz , 40 ')).toBeCloseTo(101.0);
    expect(calculateTotal('1,2,three\n4\nfive,6')).toBe(13);
  });
});