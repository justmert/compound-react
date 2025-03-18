/**
 * Tests for useIsBorrowCollateralized hook
 * 
 * Testing approach:
 * 1. We mock the CometClient and its methods to control the test environment
 * 2. We directly test the hook's interaction with the client
 * 3. We verify the hook correctly processes the data
 * 4. We test the refetch functionality
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useIsBorrowCollateralized } from '../useIsBorrowCollateralized';
import { CometClient } from '../../../api/CometClient';

// Mock the context
jest.mock('../../../context/CompoundContext', () => ({
  useCompoundContext: jest.fn().mockReturnValue({
    client: null,
    network: 1,
    isInitialized: true,
    error: null
  }),
}));

// Mock CometClient
const mockIsBorrowCollateralized = jest.fn().mockResolvedValue(true);

const mockCometContract = {
  isBorrowCollateralized: mockIsBorrowCollateralized,
};

const mockClient = {
  isInitialized: jest.fn().mockReturnValue(true),
  getComet: jest.fn().mockReturnValue(mockCometContract),
};

// Mock the CometClient constructor
jest.mock('../../../api/CometClient', () => {
  const originalModule = jest.requireActual('../../../api/CometClient');
  
  return {
    ...originalModule,
    CometClient: jest.fn().mockImplementation(() => mockClient),
  };
});

// Simple wrapper for testing hooks
const wrapper = ({ children }: { children: React.ReactNode }) => children;

describe('useIsBorrowCollateralized', () => {
  const accountAddress = '0x1234567890123456789012345678901234567890';
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockClient.isInitialized.mockReturnValue(true);
    mockClient.getComet.mockReturnValue(mockCometContract);
    mockIsBorrowCollateralized.mockResolvedValue(true);
  });

  it('should check collateralization correctly when account is collateralized', async () => {
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useIsBorrowCollateralized(client, accountAddress), { wrapper });
    
    // Initial state should be loading
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.isCollateralized).toBeNull();
    
    // Wait for the hook to finish loading
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    // Verify client interaction
    expect(mockClient.isInitialized).toHaveBeenCalled();
    expect(mockClient.getComet).toHaveBeenCalled();
    expect(mockIsBorrowCollateralized).toHaveBeenCalledWith(accountAddress);
    
    // Verify hook output
    expect(result.current.error).toBeNull();
    expect(result.current.isCollateralized).toBe(true);
  });

  it('should check collateralization correctly when account is not collateralized', async () => {
    const client = new CometClient({} as any, 1);
    
    // Mock not collateralized
    mockIsBorrowCollateralized.mockResolvedValue(false);
    
    const { result } = renderHook(() => useIsBorrowCollateralized(client, accountAddress), { wrapper });
    
    // Wait for the hook to finish loading
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    // Verify client interaction
    expect(mockIsBorrowCollateralized).toHaveBeenCalledWith(accountAddress);
    
    // Verify hook output
    expect(result.current.error).toBeNull();
    expect(result.current.isCollateralized).toBe(false);
  });

  it('should handle refetch correctly', async () => {
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useIsBorrowCollateralized(client, accountAddress), { wrapper });
    
    // Wait for the initial fetch to complete
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    // Update the mock to return a different value
    mockIsBorrowCollateralized.mockResolvedValue(false);
    
    // Call refetch
    let refetchResult: boolean | null = null;
    await act(async () => {
      refetchResult = await result.current.refetch();
    });
    
    // Verify client interaction
    expect(mockIsBorrowCollateralized).toHaveBeenCalledTimes(2);
    expect(mockIsBorrowCollateralized).toHaveBeenCalledWith(accountAddress);
    
    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isCollateralized).toBe(false);
    expect(refetchResult).toBe(false);
  });

  it('should handle errors correctly', async () => {
    const client = new CometClient({} as any, 1);
    
    // Mock an error
    const mockError = new Error('Failed to check collateralization');
    mockIsBorrowCollateralized.mockRejectedValue(mockError);
    
    const { result } = renderHook(() => useIsBorrowCollateralized(client, accountAddress), { wrapper });
    
    // Wait for the hook to finish loading
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    // Verify hook output
    expect(result.current.error).toEqual(mockError);
    expect(result.current.isCollateralized).toBeNull();
  });

  it('should handle missing account address', async () => {
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useIsBorrowCollateralized(client, null), { wrapper });
    
    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toEqual(new Error('Account address not provided'));
    expect(result.current.isCollateralized).toBeNull();
    
    // Verify client interaction
    expect(mockIsBorrowCollateralized).not.toHaveBeenCalled();
  });
}); 