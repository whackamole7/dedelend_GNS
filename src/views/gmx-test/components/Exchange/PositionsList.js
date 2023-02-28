import React, { useState } from "react";
import cx from "classnames";
import { Trans, t } from "@lingui/macro";
import Tooltip from "../Tooltip/Tooltip";
import PositionSeller from "./PositionSeller";
import PositionEditor from "./PositionEditor";
import OrdersToa from "./OrdersToa";

import { ImSpinner2 } from "react-icons/im";

import {
  helperToast,
  bigNumberify,
  getLiquidationPrice,
  getUsd,
  getLeverage,
  formatAmount,
  getOrderError,
  USD_DECIMALS,
  FUNDING_RATE_PRECISION,
  SWAP,
  LONG,
  SHORT,
  INCREASE,
  DECREASE,
  BASIS_POINTS_DIVISOR,
  getDeltaStr,
} from "../../lib/legacy";
import PositionShare from "./PositionShare";
import PositionsItem from './PositionsItem';
import { ADDRESS_ZERO } from '@uniswap/v3-sdk';
import { GNS_PAIRS } from './../../lib/GNS_legacy';
import GNS_Trading from '../../abis/GNS/GNS_Trading.json';
import { notifySuccess } from './../../../../components/utils/notifications';
import { ethers } from 'ethers';
import { BigNumber } from 'ethers';
import { expandDecimals } from './../../lib/legacy';

const getOrdersForPosition = (account, position, orders, nativeTokenAddress) => {
  if (!orders || orders.length === 0) {
    return [];
  }
  /* eslint-disable array-callback-return */
  return orders
    .filter((order) => {
      if (order.type === SWAP) {
        return false;
      }
      const hasMatchingIndexToken =
        order.indexToken === nativeTokenAddress
          ? position.indexToken.isNative
          : order.indexToken === position.indexToken.address;
      const hasMatchingCollateralToken =
        order.collateralToken === nativeTokenAddress
          ? position.collateralToken.isNative
          : order.collateralToken === position.collateralToken.address;
      if (order.isLong === position.isLong && hasMatchingIndexToken && hasMatchingCollateralToken) {
        return true;
      }
    })
    .map((order) => {
      order.error = getOrderError(account, order, undefined, position);
      if (order.type === DECREASE && order.sizeDelta.gt(position.size)) {
        order.error = "Order size is bigger than position, will only be executable if position increases";
      }
      return order;
    });
};

export default function PositionsList(props) {
  const {
    pendingPositions,
    setPendingPositions,
    positionsGNS,
    positions,
    positionsDataIsLoading,
    positionsMap,
    infoTokens,
    active,
    account,
    library,
    pendingTxns,
    setPendingTxns,
    setListSection,
    flagOrdersEnabled,
    savedIsPnlInLeverage,
    chainId,
    nativeTokenAddress,
    orders,
    setIsWaitingForPluginApproval,
    approveOrderBook,
    isPluginApproving,
    isWaitingForPluginApproval,
    orderBookApproved,
    positionRouterApproved,
    isWaitingForPositionRouterApproval,
    isPositionRouterApproving,
    approvePositionRouter,
    showPnlAfterFees,
    setMarket,
    minExecutionFee,
    minExecutionFeeUSD,
    minExecutionFeeErrorMessage,
    usdgSupply,
    totalTokenWeights,
  } = props;

  const hasPositions = Boolean(positions?.length || positionsGNS?.length);

  const [positionToEditKey, setPositionToEditKey] = useState(undefined);
  const [positionToSellKey, setPositionToSellKey] = useState(undefined);
  const [positionToShare, setPositionToShare] = useState(null);
  const [isPositionEditorVisible, setIsPositionEditorVisible] = useState(undefined);
  const [isPositionSellerVisible, setIsPositionSellerVisible] = useState(undefined);
  const [collateralTokenAddress, setCollateralTokenAddress] = useState(undefined);
  const [isPositionShareModalOpen, setIsPositionShareModalOpen] = useState(false);
  const [ordersToaOpen, setOrdersToaOpen] = useState(false);
  const [isHigherSlippageAllowed, setIsHigherSlippageAllowed] = useState(false);

  const editPosition = (position) => {
    setCollateralTokenAddress(position.collateralToken.address);
    setPositionToEditKey(position.key);
    setIsPositionEditorVisible(true);
  };

  const sellPosition = (position) => {
    if (position.market === 'GMX') {
      setPositionToSellKey(position.key);
      setIsPositionSellerVisible(true);
      setIsHigherSlippageAllowed(false);
    } else if (position.market === 'GNS') {
      const contract = new ethers.Contract(GNS_Trading.address, GNS_Trading.abi, library.getSigner());

      contract.closeTradeMarket(
        position.pairIndex,
        position.index
      ).then(tsc => {
        console.log(tsc);

        tsc.wait().then(() => {
          notifySuccess('Position closed!', tsc.hash);
        })
      });
    }
  };

  const setStopLoss = (position) => {
    
  }
  const setTakeProfit = (position) => {

  }
  
  const onPositionClick = (position) => {
    helperToast.success(`${position.isLong ? "Long" : "Short"} ${position.indexToken.symbol} market selected`);
    setMarket(position.isLong ? LONG : SHORT, position.indexToken.address);
  };

  return (
    <div className="PositionsList">
      <PositionEditor
        pendingPositions={pendingPositions}
        setPendingPositions={setPendingPositions}
        positionsMap={positionsMap}
        positionKey={positionToEditKey}
        isVisible={isPositionEditorVisible}
        setIsVisible={setIsPositionEditorVisible}
        infoTokens={infoTokens}
        active={active}
        account={account}
        library={library}
        collateralTokenAddress={collateralTokenAddress}
        pendingTxns={pendingTxns}
        setPendingTxns={setPendingTxns}
        getUsd={getUsd}
        getLeverage={getLeverage}
        savedIsPnlInLeverage={savedIsPnlInLeverage}
        positionRouterApproved={positionRouterApproved}
        isPositionRouterApproving={isPositionRouterApproving}
        isWaitingForPositionRouterApproval={isWaitingForPositionRouterApproval}
        approvePositionRouter={approvePositionRouter}
        chainId={chainId}
        minExecutionFee={minExecutionFee}
        minExecutionFeeUSD={minExecutionFeeUSD}
        minExecutionFeeErrorMessage={minExecutionFeeErrorMessage}
      />
      {ordersToaOpen && (
        <OrdersToa
          setIsVisible={setOrdersToaOpen}
          approveOrderBook={approveOrderBook}
          isPluginApproving={isPluginApproving}
        />
      )}
      {isPositionShareModalOpen && (
        <PositionShare
          setIsPositionShareModalOpen={setIsPositionShareModalOpen}
          isPositionShareModalOpen={isPositionShareModalOpen}
          positionToShare={positionToShare}
          chainId={chainId}
          account={account}
        />
      )}
      {ordersToaOpen && (
        <OrdersToa
          setIsVisible={setOrdersToaOpen}
          approveOrderBook={approveOrderBook}
          isPluginApproving={isPluginApproving}
        />
      )}
      {isPositionSellerVisible && (
        <PositionSeller
          pendingPositions={pendingPositions}
          setPendingPositions={setPendingPositions}
          setIsWaitingForPluginApproval={setIsWaitingForPluginApproval}
          approveOrderBook={approveOrderBook}
          isPluginApproving={isPluginApproving}
          isWaitingForPluginApproval={isWaitingForPluginApproval}
          orderBookApproved={orderBookApproved}
          positionsMap={positionsMap}
          positionKey={positionToSellKey}
          isVisible={isPositionSellerVisible}
          setIsVisible={setIsPositionSellerVisible}
          infoTokens={infoTokens}
          active={active}
          account={account}
          orders={orders}
          library={library}
          pendingTxns={pendingTxns}
          setPendingTxns={setPendingTxns}
          flagOrdersEnabled={flagOrdersEnabled}
          savedIsPnlInLeverage={savedIsPnlInLeverage}
          chainId={chainId}
          nativeTokenAddress={nativeTokenAddress}
          setOrdersToaOpen={setOrdersToaOpen}
          positionRouterApproved={positionRouterApproved}
          isPositionRouterApproving={isPositionRouterApproving}
          isWaitingForPositionRouterApproval={isWaitingForPositionRouterApproval}
          approvePositionRouter={approvePositionRouter}
          isHigherSlippageAllowed={isHigherSlippageAllowed}
          setIsHigherSlippageAllowed={setIsHigherSlippageAllowed}
          minExecutionFee={minExecutionFee}
          minExecutionFeeUSD={minExecutionFeeUSD}
          minExecutionFeeErrorMessage={minExecutionFeeErrorMessage}
          usdgSupply={usdgSupply}
          totalTokenWeights={totalTokenWeights}
        />
      )}
      {hasPositions && (
        <div className="Exchange-list small">
          <div>
            {!hasPositions && positionsDataIsLoading && (
              <div className="Exchange-empty-positions-list-note App-card">
                <Trans>Loading...</Trans>
              </div>
            )}
            {!hasPositions && !positionsDataIsLoading && (
              <div className="Exchange-empty-positions-list-note App-card Exchange-list-empty-note">
                <Trans>No open positions</Trans>
              </div>
            )}
            {positions.map((position) => {
              position.market = "GMX";
              
              const positionOrders = getOrdersForPosition(account, position, orders, nativeTokenAddress);
              const liquidationPrice = getLiquidationPrice(position);
              const hasPositionProfit = position[showPnlAfterFees ? "hasProfitAfterFees" : "hasProfit"];
              const positionDelta =
                position[showPnlAfterFees ? "pendingDeltaAfterFees" : "pendingDelta"] || bigNumberify(0);
              let borrowFeeUSD;
              if (position.collateralToken && position.collateralToken.fundingRate) {
                const borrowFeeRate = position.collateralToken.fundingRate
                  .mul(position.size)
                  .mul(24)
                  .div(FUNDING_RATE_PRECISION);
                borrowFeeUSD = formatAmount(borrowFeeRate, USD_DECIMALS, 2);
              }

              return (
                <PositionsItem
                  key={position.key}
                  position={position}
                  onPositionClick={onPositionClick}
                  setListSection={setListSection}
                  positionOrders={positionOrders}
                  showPnlAfterFees={showPnlAfterFees}
                  hasPositionProfit={hasPositionProfit}
                  positionDelta={positionDelta}
                  liquidationPrice={liquidationPrice}
                  cx={cx}
                  borrowFeeUSD={borrowFeeUSD}
                  editPosition={editPosition}
                  sellPosition={sellPosition}
                  setStopLoss={setStopLoss}
                  setTakeProfit={setTakeProfit}
                  isLarge={false}
                />
              );
            })}
            {positionsGNS?.map(pos => {
              if (pos.trader === ADDRESS_ZERO) {
                return;
              }
              
              const position = Object.assign({}, pos);
  
              position.market = "GNS";
              const key = `${position.pairIndex}${position.index}`;
              const isLong = position.buy;
              position.isLong = isLong;
  
              const tokenSymb = GNS_PAIRS[position.pairIndex];
              const tokenAddr = Object.keys(infoTokens).find(addr => infoTokens[addr].symbol === tokenSymb);
              const curPrice = infoTokens[tokenAddr].maxPrice;
  
              position.indexToken = {
                symbol: tokenSymb,
              };
              position.size = BigNumber.from(position.positionSizeDai + '0'.repeat(12)).mul(position.leverage);
              position.markPrice = curPrice;
              position.averagePrice = BigNumber.from(position.openPrice + '0'.repeat(20));
              position.collateral = BigNumber.from(position.positionSizeDai + '0'.repeat(12));
              
              let hasPositionProfit;
              if (isLong) {
                hasPositionProfit = position.markPrice.gte(position.averagePrice);
              } else {
                hasPositionProfit = position.markPrice.lte(position.averagePrice);
              }
              position.hasProfit = hasPositionProfit;
  
              
              const priceDelta = position.averagePrice.gt(position.markPrice)
              ? position.averagePrice.sub(position.markPrice)
              : position.markPrice.sub(position.averagePrice);
              position.delta = position.size.mul(priceDelta).div(position.averagePrice);
              
              position.deltaPercentage = position.delta.mul(BASIS_POINTS_DIVISOR).div(position.collateral);
              
              const { deltaStr, deltaPercentageStr } = getDeltaStr({
                delta: position.delta,
                deltaPercentage: position.deltaPercentage,
                hasProfit: position.hasProfit,
              });
  
              position.deltaStr = deltaStr;
              position.deltaPercentageStr = deltaPercentageStr;
              position.deltaBeforeFeesStr = deltaStr;
              
              const markPrice = position.markPrice;
              const collateral = position.collateral.mul(position.leverage);
              const liqPriceDistance = (markPrice.mul(collateral.mul(9).div(10)).div(collateral).div(position.leverage));
              
              const liqPrice = isLong ?
                  markPrice.sub(liqPriceDistance)
                  : markPrice.add(liqPriceDistance);
              
              position.leverage = position.leverage * 10**4;
  
              const positionOrders = [];
              return (
                <PositionsItem
                  key={key}
                  position={position}
                  onPositionClick={onPositionClick}
                  setListSection={setListSection}
                  positionOrders={positionOrders}
                  showPnlAfterFees={showPnlAfterFees}
                  hasPositionProfit={hasPositionProfit}
                  positionDelta={position.delta}
                  liquidationPrice={liqPrice}
                  cx={cx}
                  // borrowFeeUSD={borrowFeeUSD}
                  editPosition={editPosition}
                  sellPosition={sellPosition}
                  setStopLoss={setStopLoss}
                  setTakeProfit={setTakeProfit}
                  isLarge={false}
                />
              );
            })}
          </div>
        </div>
      )}
      <table className="Exchange-list large App-box">
        <tbody>
          {hasPositions && (
            <tr className="Exchange-list-header">
              <th>
                <Trans>Position</Trans>
              </th>
              <th>
                <Trans>Size</Trans>
              </th>
              <th>
                <Trans>Collateral</Trans>
              </th>
              <th>
                <Trans>Mark Price</Trans>
              </th>
              <th>
                <Trans>Entry Price</Trans>
              </th>
              <th>
                <Trans>Liq. Price</Trans>
              </th>
              <th>
                PNL (ROE %)
              </th>
              <th>
                Stop Loss
              </th>
              <th>
                Take Profit
              </th>
              <th></th>
            </tr>
          )}
          {!hasPositions && positionsDataIsLoading && (
            <tr>
              <td colSpan="15">
                <div className="Exchange-empty-positions-list-note">Loading...</div>
              </td>
            </tr>
          )}
          {!hasPositions && !positionsDataIsLoading && (
            <tr>
              <td colSpan="15" className="Exchange-list-empty-note">
                No open positions
              </td>
            </tr>
          )}
          {positions.map((position) => {
            const liquidationPrice = getLiquidationPrice(position) || bigNumberify(0);
            const positionOrders = getOrdersForPosition(account, position, orders, nativeTokenAddress);
            const hasOrderError = !!positionOrders.find((order) => order.error);
            const hasPositionProfit = position[showPnlAfterFees ? "hasProfitAfterFees" : "hasProfit"];
            const positionDelta =
              position[showPnlAfterFees ? "pendingDeltaAfterFees" : "pendingDelta"] || bigNumberify(0);
            let borrowFeeUSD;
            if (position.collateralToken && position.collateralToken.fundingRate) {
              const borrowFeeRate = position.collateralToken.fundingRate
                .mul(position.size)
                .mul(24)
                .div(FUNDING_RATE_PRECISION);
              borrowFeeUSD = formatAmount(borrowFeeRate, USD_DECIMALS, 2);
            }


            return (
              <PositionsItem
                key={position.key}
                position={position}
                onPositionClick={onPositionClick}
                setListSection={setListSection}
                positionOrders={positionOrders}
                showPnlAfterFees={showPnlAfterFees}
                hasPositionProfit={hasPositionProfit}
                positionDelta={positionDelta}
                liquidationPrice={liquidationPrice}
                cx={cx}
                borrowFeeUSD={borrowFeeUSD}
                editPosition={editPosition}
                sellPosition={sellPosition}
                setStopLoss={setStopLoss}
                setTakeProfit={setTakeProfit}
                isLarge={true}
              />
            );
          })}
          {positionsGNS?.map(pos => {
            if (pos.trader === ADDRESS_ZERO) {
              return;
            }
            
            const position = Object.assign({}, pos);

            position.market = "GNS";
            const key = `${position.pairIndex}${position.index}`;
            const isLong = position.buy;
            position.isLong = isLong;

            const tokenSymb = GNS_PAIRS[position.pairIndex];
            const tokenAddr = Object.keys(infoTokens).find(addr => infoTokens[addr].symbol === tokenSymb);
            const curPrice = infoTokens[tokenAddr].maxPrice;

            position.indexToken = {
              symbol: tokenSymb,
            };
            position.size = BigNumber.from(position.positionSizeDai + '0'.repeat(12)).mul(position.leverage);
            position.markPrice = curPrice;
            position.averagePrice = BigNumber.from(position.openPrice + '0'.repeat(20));
            position.collateral = BigNumber.from(position.positionSizeDai + '0'.repeat(12));
            
            let hasPositionProfit;
            if (isLong) {
              hasPositionProfit = position.markPrice.gte(position.averagePrice);
            } else {
              hasPositionProfit = position.markPrice.lte(position.averagePrice);
            }
            position.hasProfit = hasPositionProfit;

            
            const priceDelta = position.averagePrice.gt(position.markPrice)
            ? position.averagePrice.sub(position.markPrice)
            : position.markPrice.sub(position.averagePrice);
            position.delta = position.size.mul(priceDelta).div(position.averagePrice);
            
            position.deltaPercentage = position.delta.mul(BASIS_POINTS_DIVISOR).div(position.collateral);
            
            const { deltaStr, deltaPercentageStr } = getDeltaStr({
              delta: position.delta,
              deltaPercentage: position.deltaPercentage,
              hasProfit: position.hasProfit,
            });

            position.deltaStr = deltaStr;
            position.deltaPercentageStr = deltaPercentageStr;
            position.deltaBeforeFeesStr = deltaStr;
            
            const markPrice = position.markPrice;
            const collateral = position.collateral.mul(position.leverage);
            const liqPriceDistance = (markPrice.mul(collateral.mul(9).div(10)).div(collateral).div(position.leverage));
            
            const liqPrice = isLong ?
                markPrice.sub(liqPriceDistance)
                : markPrice.add(liqPriceDistance);
            
            position.leverage = position.leverage * 10**4;

            const positionOrders = [];
            return (
              <PositionsItem
                key={key}
                position={position}
                onPositionClick={onPositionClick}
                setListSection={setListSection}
                positionOrders={positionOrders}
                showPnlAfterFees={showPnlAfterFees}
                hasPositionProfit={hasPositionProfit}
                positionDelta={position.delta}
                liquidationPrice={liqPrice}
                cx={cx}
                // borrowFeeUSD={borrowFeeUSD}
                editPosition={editPosition}
                sellPosition={sellPosition}
                setStopLoss={setStopLoss}
                setTakeProfit={setTakeProfit}
                isLarge={true}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
