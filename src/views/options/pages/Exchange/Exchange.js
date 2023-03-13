import React, { useEffect, useState, useMemo, useCallback, forwardRef, useImperativeHandle } from "react";
import { Trans, t } from "@lingui/macro";
import { useWeb3React } from "@web3-react/core";
import useSWR from "swr";
import { ethers } from "ethers";
import useWebSocket from 'react-use-websocket';

import {
  FUNDING_RATE_PRECISION,
  BASIS_POINTS_DIVISOR,
  MARGIN_FEE_BASIS_POINTS,
  SWAP,
  LONG,
  SHORT,
  USD_DECIMALS,
  getExplorerUrl,
  helperToast,
  formatAmount,
  bigNumberify,
  getTokenInfo,
  getPositionKey,
  getPositionContractKey,
  getLeverage,
  useLocalStorageSerializeKey,
  useLocalStorageByChainId,
  getDeltaStr,
  useChainId,
  useAccountOrders,
  getPageTitle,
} from "../../lib/legacy";
import { getConstant } from "../../config/chains";
import { approvePlugin, useInfoTokens, useMinExecutionFee, cancelMultipleOrders } from "../../domain/legacy";

import { getContract } from "../../config/Addresses";
import { getTokens, getToken, getWhitelistedTokens, getTokenBySymbol } from "../../config/Tokens";

import Reader from "../../abis/ReaderV2.json";
import VaultV2 from "../../abis/VaultV2.json";
import Router from "../../abis/Router.json";
import Token from "../../abis/Token.json";

import SwapBox from "../../components/Exchange/SwapBox";
import ExchangeTVChart, { getChartToken } from "../../components/Exchange/ExchangeTVChart";
import PositionsList from "../../components/Exchange/PositionsList";
import OrdersList from "../../components/Exchange/OrdersList";
import TradeHistory from "../../components/Exchange/TradeHistory";
import ExchangeWalletTokens from "../../components/Exchange/ExchangeWalletTokens";
import ExchangeBanner from "../../components/Exchange/ExchangeBanner";
import Tab from "../../components/Tab/Tab";

import "./Exchange.scss";
import "../../components/Exchange/Exchange-lists.scss";
import { fetcher } from "../../lib/contracts/fetcher";
import GNS_Storage from "../../abis/GNS/GNS_Storage.json";
import { GNS_PAIRS } from './../../lib/GNS_legacy';
import { ADDRESS_ZERO } from '@uniswap/v3-sdk';
import { signer } from './../../../../components/utils/providers';


const { AddressZero } = ethers.constants;

export const Exchange = forwardRef((props) => {
  const {
    connectWallet,
  } = props;

  const { account, library } = useWeb3React();
  const active = Boolean(props.walletAddress);
  const { chainId } = useChainId();
  const defaultTokenSelection = AddressZero;

  const [tokenSelection, setTokenSelection] = useLocalStorageByChainId(
    chainId,
    "Exchange-token-selection-options",
    defaultTokenSelection
  );

  const tokens = getTokens(chainId);

  const tokenAddresses = tokens.map((token) => token.address);
  const readerAddress = getContract(chainId, "Reader");
  const { data: tokenBalances } = useSWR(active && [active, chainId, readerAddress, "getTokenBalances", account], {
    fetcher: fetcher(library, Reader, [tokenAddresses]),
  });
  
  const positionsDataIsLoading = active && false;

  const { infoTokens } = useInfoTokens(library, chainId, active, tokenBalances);
  

  useEffect(() => {
    const toToken = getTokenInfo(infoTokens, tokenSelection);
    let currentTokenPriceStr = formatAmount(toToken.maxPrice, USD_DECIMALS, 2, true);
    let title = getPageTitle(currentTokenPriceStr + ` | ${toToken.symbol}${toToken.isStable ? "" : "USD"}`);
    document.title = title;
  }, [tokenSelection, infoTokens, chainId]);

  const posLength = 0;

  const LIST_SECTIONS = ["Positions"];
  let [listSection, setListSection] = useLocalStorageByChainId(chainId, "List-section-v2", LIST_SECTIONS[0]);
  const LIST_SECTIONS_LABELS = {
    Positions: posLength ? `Positions (${posLength})` : undefined,
  };
  if (!LIST_SECTIONS.includes(listSection)) {
    listSection = LIST_SECTIONS[0];
  }

  if (!getToken(chainId, tokenSelection)) {
    return null;
  }

  const getListSection = () => {
    return (
      <div>
        <div className="Exchange-list-tab-container">
          <Tab
            options={LIST_SECTIONS}
            optionLabels={LIST_SECTIONS_LABELS}
            option={listSection}
            onChange={(section) => setListSection(section)}
            type="inline"
            className="Exchange-list-tabs"
          />
        </div>
        {listSection === "Positions" && (
          <PositionsList
            infoTokens={infoTokens}
            active={active}
            account={account}
            library={library}
          />
        )}
      </div>
    );
  };

  const renderChart = () => {
    return (
      <ExchangeTVChart
        tokenSelection={tokenSelection}
        setTokenSelection={setTokenSelection}
        infoTokens={infoTokens}
        chainId={chainId}
        savedShouldShowPositionLines={false}
      />
    );
  };

  return (
    <div className="Exchange page-layout">
      <div className="Exchange-content">
        <div className="Exchange-left">
          {renderChart()}
        </div>
        <div className="Exchange-right">
          <SwapBox
            chainId={chainId}
            infoTokens={infoTokens}
            active={active}
            connectWallet={connectWallet}
            library={library}
            account={account}
            tokenSelection={tokenSelection}
            setTokenSelection={setTokenSelection}
          />
        </div>
        <div className="Exchange-lists large">{getListSection()}</div>
        <div className="Exchange-lists small">{getListSection()}</div>
      </div>
    </div>
  );
});
