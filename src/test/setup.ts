import '@testing-library/jest-dom';

// Mock ResizeObserver which is not available in jsdom
class ResizeObserverMock {
  callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }

  observe() {
    // In tests, we don't need actual resize observation
  }

  unobserve() {}

  disconnect() {}
}

window.ResizeObserver = ResizeObserverMock;
