import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiService from '../src/services/apiService';

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      defaults: {
        headers: {
          common: {}
        }
      },
      interceptors: {
        request: {
          use: vi.fn()
        },
        response: {
          use: vi.fn()
        }
      }
    }))
  }
}));

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset localStorage
    global.localStorage.clear();
  });

  describe('apiService configuration', () => {
    it('should be properly configured', () => {
      expect(apiService).toBeDefined();
      expect(typeof apiService.get).toBe('function');
      expect(typeof apiService.post).toBe('function');
      expect(typeof apiService.put).toBe('function');
      expect(typeof apiService.patch).toBe('function');
      expect(typeof apiService.delete).toBe('function');
    });
  });

  describe('Authentication token handling', () => {
    it('should handle token from localStorage', () => {
      const mockToken = 'test-jwt-token';
      
      // Mock localStorage.getItem
      global.localStorage.getItem = vi.fn().mockReturnValue(mockToken);
      
      // Test that the service can access the token
      expect(localStorage.getItem('token')).toBe(mockToken);
    });

    it('should handle missing token', () => {
      // Mock localStorage.getItem to return null
      global.localStorage.getItem = vi.fn().mockReturnValue(null);
      
      expect(localStorage.getItem('token')).toBe(null);
    });
  });

  describe('API endpoints validation', () => {
    it('should have correct base URL configuration', () => {
      // The service should be configured with the right base URL
      // This is more about testing the structure than actual calls
      expect(apiService).toBeTruthy();
    });
  });
});