import { ARBITRUM, AVALANCHE } from "../legacy";

export const GAS_PRICE_ADJUSTMENT_MAP = {
  [ARBITRUM]: "0",
  [AVALANCHE]: "3000000000", // 3 gwei
};

export const MAX_GAS_PRICE_MAP = {
  [AVALANCHE]: "200000000000", // 200 gwei
};

export const BORDER_COEF = 0.01;
// export const BORDER_COEF = 0;
export const APY = '10.00%';