import React from 'react';

// Mock wrapper for testing hooks
export const wrapper = ({ children }: { children: React.ReactNode }) => children;

// Mock the CompoundContext
export const mockCompoundContext = (): void => {
  jest.mock('../../../context/CompoundContext', () => ({
    useCompoundContext: jest.fn().mockReturnValue({
      client: null,
      network: 1,
      isInitialized: true,
      error: null
    }),
  }));
}; 