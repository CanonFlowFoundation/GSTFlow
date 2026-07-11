import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock('pdfjs-dist', () => ({
  getDocument: vi.fn(),
  GlobalWorkerOptions: { workerSrc: '' },
  version: '3.11.174'
}));

// Mock DOMMatrix if it's missing in jsdom
if (typeof global.DOMMatrix === 'undefined') {
  global.DOMMatrix = class DOMMatrix {
    constructor() {}
  } as any;
}
