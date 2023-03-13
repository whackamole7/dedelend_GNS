import React, { useEffect, useMemo, useState } from "react";
import Tooltip from "../Tooltip/Tooltip";
import { t, Trans } from "@lingui/macro";
import Slider, { SliderTooltip } from "rc-slider";
import "rc-slider/assets/index.css";
import "./SwapBox.scss";

import cx from "classnames";
import useSWR from "swr";
import { ethers } from "ethers";

import { IoMdSwap } from "react-icons/io";
import { BsArrowRight } from "react-icons/bs";
import { BigNumber } from "ethers";
import { notifySuccess, errAlert } from '../../../../components/utils/notifications';

import {
  adjustForDecimals,
  approveTokens,
  ARBITRUM,
  AVALANCHE,
  BASIS_POINTS_DIVISOR,
  bigNumberify,
  calculatePositionDelta,
  DEFAULT_HIGHER_SLIPPAGE_AMOUNT,
  DUST_BNB,
  expandDecimals,
  formatAmount,
  formatAmountFree,
  getChainName,
  getExchangeRate,
  getExchangeRateDisplay,
  getLeverage,
  getLiquidationPrice,
  getMostAbundantStableToken,
  getNextFromAmount,
  getNextToAmount,
  getPositionKey,
  getTokenInfo,
  getUsd,
  helperToast,
  IS_NETWORK_DISABLED,
  isSupportedChain,
  isTriggerRatioInverted,
  LEVERAGE_ORDER_OPTIONS,
  LIMIT,
  LONG,
  MARGIN_FEE_BASIS_POINTS,
  MARKET,
  parseValue,
  PRECISION,
  replaceNativeTokenAddress,
  SHORT,
  shouldRaiseGasError,
  STOP,
  SWAP,
  SWAP_OPTIONS,
  SWAP_ORDER_OPTIONS,
  USD_DECIMALS,
  USDG_ADDRESS,
  USDG_DECIMALS,
  useLocalStorageByChainId,
  useLocalStorageSerializeKey,
  usePrevious,
  MAX_ALLOWED_LEVERAGE,
} from "../../lib/legacy";
import { getConstant } from "../../config/chains";
import * as Api from "../../domain/legacy";
import { getContract } from "../../config/Addresses";

import Checkbox from "../Checkbox/Checkbox";
import Tab from "../Tab/Tab";
import TokenSelector from "./TokenSelector";
import ExchangeInfoRow from "./ExchangeInfoRow";
import ConfirmationBox from "./ConfirmationBox";
import OrdersToa from "./OrdersToa";

import { getToken, getTokenBySymbol, getTokens, getWhitelistedTokens } from "../../config/Tokens";
import PositionRouter from "../../abis/PositionRouter.json";
import Router from "../../abis/Router.json";
import Token from "../../abis/Token.json";
import WETH from "../../abis/WETH.json";

import longImg from "../../img/ddl/long.svg";
import shortImg from "../../img/ddl/short.svg";
import swapImg from "../../img/swap.svg";
import longActiveImg from "../../img/ddl/long_active.svg";
import shortActiveImg from "../../img/ddl/short_active.svg";

import { useUserReferralCode } from "../../domain/referrals";
import NoLiquidityErrorModal from "./NoLiquidityErrorModal";
import StatsTooltipRow from "../StatsTooltip/StatsTooltipRow";
import { fetcher } from "../../lib/contracts/fetcher";
import { callContract } from "../../lib/contracts/callContract";
import icon_settings from '../../../../img/icon-settings.svg';
import ChooseMarketModal from './../../../../components/UI/modal/ChooseMarketModal';
import { separateThousands } from './../../../../components/utils/sepThousands';
import { floor, formatForContract } from './../../../../components/utils/math';
import GNS_Storage from '../../abis/GNS/GNS_Storage.json';
import GNS_Trading from '../../abis/GNS/GNS_Trading.json';
import { GNS_PAIRS, WEI_DECIMALS } from './../../lib/GNS_legacy';
import { DEFAULT_SLIPPAGE_AMOUNT } from './../../lib/legacy';
import SLTPModal from './../../../../components/UI/modal/SLTPModal';
import { signer } from './../../../../components/utils/providers';
import { USDC } from '../../../../components/utils/contracts';
import { marketsList } from "../../../../components/utils/constants";
import Selector from './../../../../components/UI/Selector/Selector';

const SWAP_ICONS = {
  [LONG]: longImg,
  [SHORT]: shortImg,
  [SWAP]: swapImg,
  Long_active: longActiveImg,
  Short_active: shortActiveImg,
};
const { AddressZero } = ethers.constants;

const leverageSliderHandle = (props) => {
  const { value, dragging, index, ...restProps } = props;
  return (
    <SliderTooltip
      prefixCls="rc-slider-tooltip"
      overlay={`${value}`}
      visible={dragging}
      placement="top"
      key={index}
    >
      <Slider.Handle value={value} {...restProps} />
    </SliderTooltip>
  );
};

export default function SwapBox(props) {
  const {
    tokenSelection,
  } = props;
  

  const getError = () => {
  };

  const isPrimaryEnabled = () => {
    
  };


  const getPrimaryText = () => {
    
  };

  const onConfirmationClick = () => {
    
  };

  const onClickPrimary = () => {
    
  };

  const leverageStorage = {
  };

  const [leverageOption, setLeverageOption] = useState(0);

  if (!tokenSelection) {
    return null;
  }


  return (
    <div className="Exchange-swap-box">
      <div className="Exchange-swap-box-inner App-box">
        <div className="Exchange-leverage-box">
          <div className="Exchange-leverage-slider-settings">
            <div>Leverage</div>
            <div className="Exchange-leverage-value">
              {parseFloat(leverageOption).toFixed(2)}x
            </div>
          </div>
          <div
            className={cx("Exchange-leverage-slider", "App-slider")}
          >
            <Slider
              min={0}
              max={7}
              step={1}
              marks={{
                0: '0',
                7: '7'
              }}
              handle={leverageSliderHandle}
              onChange={(value) => setLeverageOption(value)}
              value={leverageOption}
              defaultValue={leverageOption}
            />
          </div>
        </div>
        <div className="Exchange-swap-button-container">
          <button className={"Exchange-swap-button btn" + (isPrimaryEnabled() ? " btn_hlight" : "")} onClick={onClickPrimary} disabled={!isPrimaryEnabled()}>
            {getPrimaryText()}
          </button>
        </div>
      </div>
    </div>
  );
}
