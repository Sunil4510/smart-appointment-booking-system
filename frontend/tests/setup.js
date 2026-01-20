import { vi } from 'vitest';
import '@testing-library/jest-dom';

// Mock environment variables
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_API_BASE_URL: 'http://localhost:5000/api',
    VITE_JWT_SECRET: 'test-secret'
  },
  writable: true
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

global.localStorage = localStorageMock;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

global.sessionStorage = sessionStorageMock;

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  unobserve: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  unobserve: vi.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Setup cleanup after each test
afterEach(() => {
  vi.clearAllMocks();
  localStorageMock.clear();
  sessionStorageMock.clear();
});

// Global test utilities
global.testUtils = {
  // Mock user data
  mockUser: {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    role: 'USER'
  },
  
  // Mock appointment data
  mockAppointment: {
    id: 1,
    userId: 1,
    providerId: 1,
    serviceId: 1,
    timeSlotId: 1,
    appointmentDate: '2024-12-25T10:00:00.000Z',
    status: 'PENDING',
    totalPrice: 100,
    notes: 'Test appointment'
  },
  
  // Mock provider data
  mockProvider: {
    id: 1,
    name: 'Dr. Smith',
    specialization: 'Cardiology',
    isActive: true
  },
  
  // Mock service data
  mockService: {
    id: 1,
    name: 'Consultation',
    price: 100,
    duration: 60,
    providerId: 1
  }
};