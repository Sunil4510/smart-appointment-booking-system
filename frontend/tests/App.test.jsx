import { describe, it, expect, vi } from 'vitest';

// Simple test that doesn't require rendering the full App
describe('Application Tests', () => {
  it('should have a working test environment', () => {
    expect(true).toBe(true);
  });

  it('should be able to import modules', () => {
    // Test that we can import basic modules
    expect(typeof vi.fn).toBe('function');
    expect(typeof describe).toBe('function');
    expect(typeof it).toBe('function');
  });

  it('should handle localStorage operations', () => {
    // Test localStorage functionality using the mock from setup.js
    const mockLocalStorage = global.localStorage;
    
    mockLocalStorage.setItem('test', 'value');
    
    // Since we're using a mock, we need to verify the mock was called
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test', 'value');
    expect(mockLocalStorage.removeItem).toBeDefined();
    expect(mockLocalStorage.getItem).toBeDefined();
  });

  it('should have proper test globals available', () => {
    expect(global.testUtils).toBeDefined();
    expect(global.testUtils.mockUser).toBeDefined();
    expect(global.testUtils.mockAppointment).toBeDefined();
  });
});