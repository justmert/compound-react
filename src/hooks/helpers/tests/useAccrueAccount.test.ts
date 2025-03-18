/**
 * Tests for useAccrueAccount hook
 * 
 * Testing approach:
 * 1. We mock the CometClient and its methods to control the test environment
 * 2. We directly test the hook's interaction with the client
 * 3. We verify the hook correctly processes the data
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useAccrueAccount } from '../useAccrueAccount';
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

// Mock transaction response
const mockTxResponse = {
  wait: jest.fn().mockResolvedValue({}),
};

// Mock CometClient
const mockAccrueAccount = jest.fn().mockResolvedValue(mockTxResponse);

const mockCometContract = {
  accrueAccount: mockAccrueAccount,
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

describe('useAccrueAccount', () => {
  const accountAddress = '0x1234567890123456789012345678901234567890';
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockClient.isInitialized.mockReturnValue(true);
    mockClient.getComet.mockReturnValue(mockCometContract);
    mockAccrueAccount.mockResolvedValue(mockTxResponse);
    mockTxResponse.wait.mockResolvedValue({});
  });

  it('should accrue account correctly', async () => {
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useAccrueAccount(client), { wrapper });
    
    // Initial state
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    
    // Call accrueAccount
    let success = false;
    await act(async () => {
      success = await result.current.accrueAccount(accountAddress);
    });
    
    // Verify client interaction
    expect(mockClient.isInitialized).toHaveBeenCalled();
    expect(mockClient.getComet).toHaveBeenCalled();
    expect(mockAccrueAccount).toHaveBeenCalledWith(accountAddress);
    expect(mockTxResponse.wait).toHaveBeenCalled();
    
    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(success).toBe(true);
  });

  it('should handle errors correctly', async () => {
    const client = new CometClient({} as any, 1);
    
    // Mock an error
    const mockError = new Error('Failed to accrue account');
    mockAccrueAccount.mockRejectedValue(mockError);
    
    const { result } = renderHook(() => useAccrueAccount(client), { wrapper });
    
    // Call accrueAccount
    let success = true;
    await act(async () => {
      success = await result.current.accrueAccount(accountAddress);
    });
    
    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toEqual(mockError);
    expect(success).toBe(false);
  });

  it('should handle missing client', async () => {
    const { result } = renderHook(() => useAccrueAccount(null), { wrapper });
    
    // Call accrueAccount
    let success = true;
    await act(async () => {
      success = await result.current.accrueAccount(accountAddress);
    });
    
    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toEqual(new Error('Client not provided'));
    expect(success).toBe(false);
    
    // Verify client interaction
    expect(mockAccrueAccount).not.toHaveBeenCalled();
  });

  it('should handle missing account address', async () => {
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useAccrueAccount(client), { wrapper });
    
    // Call accrueAccount with empty address
    let success = true;
    await act(async () => {
      success = await result.current.accrueAccount('');
    });
    
    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toEqual(new Error('Account address not provided'));
    expect(success).toBe(false);
    
    // Verify client interaction
    expect(mockAccrueAccount).not.toHaveBeenCalled();
  });
}); 