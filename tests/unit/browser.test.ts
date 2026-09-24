import { describe, expect, it } from 'vitest';
import { isChromium } from '../../src/browser';

const UA = {
  chrome:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
  edge:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36 Edg/140.0.0.0',
  firefox: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:143.0) Gecko/20100101 Firefox/143.0',
  safari:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15',
};

describe('isChromium', () => {
  it('detecta Chrome e Edge', () => {
    expect(isChromium(UA.chrome)).toBe(true);
    expect(isChromium(UA.edge)).toBe(true);
  });

  it('não marca Firefox nem Safari', () => {
    expect(isChromium(UA.firefox)).toBe(false);
    expect(isChromium(UA.safari)).toBe(false);
  });
});
