import { ethers } from 'ethers';

export const netProvider = new ethers.getDefaultProvider('https://arb-mainnet.g.alchemy.com/v2/r6kd0heyoOCe8RFndkyv0XW0F-BG38Fy');


export const mmProvider = window.ethereum ? new ethers.providers.Web3Provider(window.ethereum) : undefined;

export const signer = mmProvider?.getSigner()