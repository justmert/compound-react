/**
 * Tests for useWithdraw hook
 * 
 * Testing approach:
 * 1. We mock the CometClient and its methods to control the test environment
 * 2. We directly test the hook's interaction with the client
 * 3. We verify the hook correctly processes the transaction
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { BigNumber } from 'ethers';
import { useWithdraw } from '../useWithdraw';
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
const mockWithdraw = jest.fn().mockResolvedValue({
  wait: jest.fn().mockResolvedValue({
    transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
  })
});

const mockWithdrawTo = jest.fn().mockResolvedValue({
  wait: jest.fn().mockResolvedValue({
    transactionHash: '0x2345678901abcdef2345678901abcdef2345678901abcdef2345678901abcdef'
  })
});

const mockWithdrawFrom = jest.fn().mockResolvedValue({
  wait: jest.fn().mockResolvedValue({
    transactionHash: '0x3456789012abcdef3456789012abcdef3456789012abcdef3456789012abcdef'
  })
});

const mockCometContract = {
  withdraw: mockWithdraw,
  withdrawTo: mockWithdrawTo,
  withdrawFrom: mockWithdrawFrom
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

describe('useWithdraw', () => {
  const assetAddress = '0x1234567890123456789012345678901234567890';
  const toAddress = '0x2345678901234567890123456789012345678901';
  const srcAddress = '0x3456789012345678901234567890123456789012';
  const amount = BigNumber.from('1000000000000000000'); // 1 token with 18 decimals
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockClient.isInitialized.mockReturnValue(true);
    mockClient.getComet.mockReturnValue(mockCometContract);
  });

  it('should withdraw assets correctly', async () => {
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useWithdraw(client), { wrapper });
    
    // Initial state
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.txHash).toBeNull();
    
    // Call withdraw
    let txHash: string | null = null;
    await act(async () => {
      txHash = await result.current.withdraw(assetAddress, amount);
    });
    
    // Verify client interaction
    expect(mockClient.isInitialized).toHaveBeenCalled();
    expect(mockClient.getComet).toHaveBeenCalled();
    expect(mockWithdraw).toHaveBeenCalledWith(assetAddress, amount);
    
    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.txHash).toBeTruthy();
    expect(txHash).toBeTruthy();
  });

  it('should withdraw assets to a recipient correctly', async () => {
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useWithdraw(client), { wrapper });
    
    // Call withdrawTo
    let txHash: string | null = null;
    await act(async () => {
      txHash = await result.current.withdrawTo(toAddress, assetAddress, amount);
    });
    
    // Verify client interaction
    expect(mockWithdrawTo).toHaveBeenCalledWith(toAddress, assetAddress, amount);
    
    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.txHash).toBeTruthy();
    expect(txHash).toBeTruthy();
  });

  it('should withdraw assets from a source to a recipient correctly', async () => {
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useWithdraw(client), { wrapper });
    
    // Call withdrawFrom
    let txHash: string | null = null;
    await act(async () => {
      txHash = await result.current.withdrawFrom(srcAddress, toAddress, assetAddress, amount);
    });
    
    // Verify client interaction
    expect(mockWithdrawFrom).toHaveBeenCalledWith(srcAddress, toAddress, assetAddress, amount);
    
    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.txHash).toBeTruthy();
    expect(txHash).toBeTruthy();
  });

  it('should handle errors correctly', async () => {
    const client = new CometClient({} as any, 1);
    
    // Mock an error
    const mockError = new Error('Failed to withdraw assets');
    mockWithdraw.mockRejectedValue(mockError);
    
    const { result } = renderHook(() => useWithdraw(client), { wrapper });
    
    // Call withdraw
    let txHash: string | null = null;
    await act(async () => {
      txHash = await result.current.withdraw(assetAddress, amount);
    });
    
    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toEqual(mockError);
    expect(result.current.txHash).toBeNull();
    expect(txHash).toBeNull();
  });

  it('should handle missing asset address', async () => {
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useWithdraw(client), { wrapper });
    
    // Call withdraw with empty asset address
    let txHash: string | null = null;
    await act(async () => {
      txHash = await result.current.withdraw('', amount);
    });
    
    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toEqual(new Error('Asset address not provided'));
    expect(result.current.txHash).toBeNull();
    expect(txHash).toBeNull();
    
    // Verify client interaction
    expect(mockWithdraw).not.toHaveBeenCalled();
  });

  it('should handle invalid amount', async () => {
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useWithdraw(client), { wrapper });
    
    // Call withdraw with zero amount
    let txHash: string | null = null;
    await act(async () => {
      txHash = await result.current.withdraw(assetAddress, BigNumber.from(0));
    });
    
    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toEqual(new Error('Invalid amount'));
    expect(result.current.txHash).toBeNull();
    expect(txHash).toBeNull();
    
    // Verify client interaction
    expect(mockWithdraw).not.toHaveBeenCalled();
  });
}); 