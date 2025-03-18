/**
 * Tests for useAllowBySig hook
 * 
 * Testing approach:
 * 1. We mock the CometClient and its methods to control the test environment
 * 2. We directly test the hook's interaction with the client
 * 3. We verify the hook correctly processes the transaction
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { BigNumber } from 'ethers';
import { useAllowBySig, AllowBySigParams } from '../useAllowBySig';
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
const mockAllowBySig = jest.fn().mockResolvedValue({
  wait: jest.fn().mockResolvedValue({
    transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
  })
});

const mockCometContract = {
  allowBySig: mockAllowBySig,
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

describe('useAllowBySig', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockClient.isInitialized.mockReturnValue(true);
    mockClient.getComet.mockReturnValue(mockCometContract);
  });

  it('should allow a manager by signature correctly', async () => {
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useAllowBySig(client), { wrapper });
    
    // Initial state
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.txHash).toBeNull();
    
    const params: AllowBySigParams = {
      owner: '0xabcdef1234567890abcdef1234567890abcdef12',
      manager: '0x1234567890123456789012345678901234567890',
      isAllowed: true,
      nonce: BigNumber.from(1),
      expiry: BigNumber.from(Math.floor(Date.now() / 1000) + 3600), // 1 hour from now
      v: 27,
      r: '0x1234567890123456789012345678901234567890123456789012345678901234',
      s: '0x1234567890123456789012345678901234567890123456789012345678901234'
    };
    
    // Call allowBySig
    let txHash: string | null = null;
    await act(async () => {
      txHash = await result.current.allowBySig(params);
    });
    
    // Verify client interaction
    expect(mockClient.isInitialized).toHaveBeenCalled();
    expect(mockClient.getComet).toHaveBeenCalled();
    expect(mockAllowBySig).toHaveBeenCalledWith(
      params.owner,
      params.manager,
      params.isAllowed,
      params.nonce,
      params.expiry,
      params.v,
      params.r,
      params.s
    );
    
    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.txHash).toBeTruthy();
    expect(txHash).toBeTruthy();
  });

  it('should disallow a manager by signature correctly', async () => {
    const client = new CometClient({} as any, 1);
    
    const { result } = renderHook(() => useAllowBySig(client), { wrapper });
    
    const params: AllowBySigParams = {
      owner: '0xabcdef1234567890abcdef1234567890abcdef12',
      manager: '0x1234567890123456789012345678901234567890',
      isAllowed: false,
      nonce: BigNumber.from(2),
      expiry: BigNumber.from(Math.floor(Date.now() / 1000) + 3600), // 1 hour from now
      v: 27,
      r: '0x1234567890123456789012345678901234567890123456789012345678901234',
      s: '0x1234567890123456789012345678901234567890123456789012345678901234'
    };
    
    // Call allowBySig to disallow
    let txHash: string | null = null;
    await act(async () => {
      txHash = await result.current.allowBySig(params);
    });
    
    // Verify client interaction
    expect(mockAllowBySig).toHaveBeenCalledWith(
      params.owner,
      params.manager,
      params.isAllowed,
      params.nonce,
      params.expiry,
      params.v,
      params.r,
      params.s
    );
    
    // Verify hook output
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.txHash).toBeTruthy();
    expect(txHash).toBeTruthy();
  });
}); 