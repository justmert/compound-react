/**
 * Tests for useTransfer hook
 * 
 * Testing approach:
 * 1. We mock the CometClient and its methods to control the test environment
 * 2. We directly test the hook's interaction with the client
 * 3. We verify the hook correctly processes the transaction
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { BigNumber } from 'ethers';
import { useTransfer } from '../useTransfer';
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
const mockTransfer = jest.fn().mockResolvedValue({
  wait: jest.fn().mockResolvedValue({
    transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
  })
});

const mockCometContract = {
  transfer: mockTransfer,
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

describe('useTransfer', () => {
  const destinationAddress = '0x1234567890123456789012345678901234567890';
  const amount = BigNumber.from('1000000000000000000'); // 1 ETH
  
  beforeEach(() => {
    jest.clearAllMocks();
    mockClient.isInitialized.mockReturnValue(true);
    mockClient.getComet.mockReturnValue(mockCometContract);
  });

  it('should transfer tokens correctly', async () => {
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useTransfer(client), { wrapper });
    
    // Initial state
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.txHash).toBeNull();
    
    // Call transfer
    let txHash: string | null = null;
    await act(async () => {
      txHash = await result.current.transfer(destinationAddress, amount);
    });
    
    // Verify client interaction
    expect(mockClient.isInitialized).toHaveBeenCalled();
    expect(mockClient.getComet).toHaveBeenCalled();
    expect(mockTransfer).toHaveBeenCalledWith(destinationAddress, amount);
    
    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.txHash).toBeTruthy();
    expect(txHash).toBeTruthy();
  });

  it('should handle errors correctly', async () => {
    const client = new CometClient({} as any, 1);
    
    // Mock an error
    const mockError = new Error('Failed to transfer tokens');
    mockTransfer.mockRejectedValue(mockError);
    
    const { result } = renderHook(() => useTransfer(client), { wrapper });
    
    // Call transfer
    let txHash: string | null = null;
    await act(async () => {
      txHash = await result.current.transfer(destinationAddress, amount);
    });
    
    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toEqual(mockError);
    expect(result.current.txHash).toBeNull();
    expect(txHash).toBeNull();
  });

  it('should handle missing destination address', async () => {
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useTransfer(client), { wrapper });
    
    // Call transfer with empty destination
    let txHash: string | null = null;
    await act(async () => {
      txHash = await result.current.transfer('', amount);
    });
    
    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toEqual(new Error('Destination address not provided'));
    expect(result.current.txHash).toBeNull();
    expect(txHash).toBeNull();
    
    // Verify client interaction
    expect(mockTransfer).not.toHaveBeenCalled();
  });

  it('should handle invalid amount', async () => {
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useTransfer(client), { wrapper });
    
    // Call transfer with zero amount
    let txHash: string | null = null;
    await act(async () => {
      txHash = await result.current.transfer(destinationAddress, BigNumber.from(0));
    });
    
    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toEqual(new Error('Invalid amount'));
    expect(result.current.txHash).toBeNull();
    expect(txHash).toBeNull();
    
    // Verify client interaction
    expect(mockTransfer).not.toHaveBeenCalled();
  });
}); 