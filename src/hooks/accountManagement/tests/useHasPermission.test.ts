/**
 * Tests for useHasPermission hook
 * 
 * Testing approach:
 * 1. We mock the CometClient and its methods to control the test environment
 * 2. We directly test the hook's interaction with the client
 * 3. We verify the hook correctly processes the data
 * 4. We test the refetch functionality
 */

import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useHasPermission } from '../useHasPermission';
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
const mockHasPermission = jest.fn().mockResolvedValue(true);

const mockCometContract = {
  hasPermission: mockHasPermission,
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

describe('useHasPermission', () => {
  const ownerAddress = '0x1234567890123456789012345678901234567890';
  const managerAddress = '0xabcdef1234567890abcdef1234567890abcdef12';
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockClient.isInitialized.mockReturnValue(true);
    mockClient.getComet.mockReturnValue(mockCometContract);
    mockHasPermission.mockResolvedValue(true);
  });

  it('should check permission correctly when manager has permission', async () => {
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useHasPermission(client, ownerAddress, managerAddress), { wrapper });
    
    // Initial state should be loading
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.hasPermission).toBeNull();
    
    // Wait for the hook to finish loading
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    // Verify client interaction
    expect(mockClient.isInitialized).toHaveBeenCalled();
    expect(mockClient.getComet).toHaveBeenCalled();
    expect(mockHasPermission).toHaveBeenCalledWith(ownerAddress, managerAddress);
    
    // Verify hook output
    expect(result.current.error).toBeNull();
    expect(result.current.hasPermission).toBe(true);
  });

  it('should check permission correctly when manager does not have permission', async () => {
    const client = new CometClient({} as any, 1);
    
    // Mock no permission
    mockHasPermission.mockResolvedValue(false);
    
    const { result } = renderHook(() => useHasPermission(client, ownerAddress, managerAddress), { wrapper });
    
    // Wait for the hook to finish loading
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    // Verify client interaction
    expect(mockHasPermission).toHaveBeenCalledWith(ownerAddress, managerAddress);
    
    // Verify hook output
    expect(result.current.error).toBeNull();
    expect(result.current.hasPermission).toBe(false);
  });

  it('should handle refetch correctly', async () => {
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useHasPermission(client, ownerAddress, managerAddress), { wrapper });
    
    // Wait for the initial fetch to complete
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    // Update the mock to return a different value
    mockHasPermission.mockResolvedValue(false);
    
    // Call refetch
    let refetchResult: boolean | null = null;
    await act(async () => {
      refetchResult = await result.current.refetch();
    });
    
    // Verify client interaction
    expect(mockHasPermission).toHaveBeenCalledTimes(2);
    expect(mockHasPermission).toHaveBeenCalledWith(ownerAddress, managerAddress);
    
    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.hasPermission).toBe(false);
    expect(refetchResult).toBe(false);
  });

  it('should handle errors correctly', async () => {
    const client = new CometClient({} as any, 1);
    
    // Mock an error
    const mockError = new Error('Failed to check permission');
    mockHasPermission.mockRejectedValue(mockError);
    
    const { result } = renderHook(() => useHasPermission(client, ownerAddress, managerAddress), { wrapper });
    
    // Wait for the hook to finish loading
    await waitFor(() => expect(result.current.loading).toBe(false));
    
    // Verify hook output
    expect(result.current.error).toEqual(mockError);
    expect(result.current.hasPermission).toBeNull();
  });

  it('should handle missing owner address', async () => {
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useHasPermission(client, null, managerAddress), { wrapper });
    
    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toEqual(new Error('Owner address not provided'));
    expect(result.current.hasPermission).toBeNull();
    
    // Verify client interaction
    expect(mockHasPermission).not.toHaveBeenCalled();
  });

  it('should handle missing manager address', async () => {
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useHasPermission(client, ownerAddress, null), { wrapper });
    
    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toEqual(new Error('Manager address not provided'));
    expect(result.current.hasPermission).toBeNull();
    
    // Verify client interaction
    expect(mockHasPermission).not.toHaveBeenCalled();
  });
}); 