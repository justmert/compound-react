import React, { ReactNode } from 'react';
import { CompoundProvider } from '../../../context/CompoundContext';

// Create a wrapper for the renderHook function
export const wrapper = ({ children }: { children: React.ReactNode }) => (
  <CompoundProvider provider={{} as any} chainId={1}>
    {children}
  </CompoundProvider>
);

// Mock the context module - this needs to be in each test file
// because Jest hoists the mock declarations to the top of the file
export const mockCompoundContext = () => {
  jest.mock('../../../context/CompoundContext', () => {
    const React = require('react');
    const originalModule = jest.requireActual('../../../context/CompoundContext');
    
    return {
      ...originalModule,
      useCompoundContext: jest.fn().mockReturnValue({
        client: null,
        isInitialized: true,
        error: null,
        setChainId: jest.fn(),
        setProvider: jest.fn(),
      }),
      CompoundProvider: ({ children }: { children: any }) => children,
    };
  });
}; 