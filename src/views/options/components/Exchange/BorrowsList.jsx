import React, { useState, useEffect } from "react";
import cx from "classnames";
import { Trans, t } from "@lingui/macro";
import PositionSeller from "./PositionSeller";
import PositionEditor from "./PositionEditor";
import OrdersToa from "./OrdersToa";

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
} from "../../lib/legacy";
import PositionShare from "./PositionShare";
import BorrowModal from './../../../../components/UI/modal/BorrowModal';
import RepayModal from './../../../../components/UI/modal/RepayModal';
import BorrowsItem from "./BorrowsItem";
import Tooltip from './../Tooltip/Tooltip';

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

export default function BorrowsList(props) {
  const {
    pendingPositions,
    setPendingPositions,
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
    dgAddress,
  } = props;

  const [positionToEditKey, setPositionToEditKey] = useState(undefined);
  const [positionToSellKey, setPositionToSellKey] = useState(undefined);
  const [positionToShare, setPositionToShare] = useState(null);
  const [isPositionEditorVisible, setIsPositionEditorVisible] = useState(undefined);
  const [isPositionSellerVisible, setIsPositionSellerVisible] = useState(undefined);
  const [collateralTokenAddress, setCollateralTokenAddress] = useState(undefined);
  const [isPositionShareModalOpen, setIsPositionShareModalOpen] = useState(false);
  const [ordersToaOpen, setOrdersToaOpen] = useState(false);
  const [isHigherSlippageAllowed, setIsHigherSlippageAllowed] = useState(false);
  
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [borrowState, setBorrowState] = useState({
		isVisible: false,
		position: {},
		step: 0,
	})
  const [repayState, setRepayState] = useState({
		isVisible: false,
		position: {},
		step: 0,
	})
  const setBorrowVisible = (bool) => {
		setBorrowState({
			...borrowState,
			isVisible: bool
		})
	}
  const setRepayVisible = (bool) => {
		setRepayState({
			...repayState,
			isVisible: bool
		})
	}

  const onPositionClick = (position) => {
    helperToast.success(`${position.isLong ? "Long" : "Short"} ${position.indexToken.symbol} market selected`);
    setMarket(position.isLong ? LONG : SHORT, position.indexToken.address);
  };

  return (
    <div className="PositionsList BorrowsList">
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
      {positions && (
        <div className="Exchange-list small">
          <div>
            {positions.length === 0 && positionsDataIsLoading && (
              <div className="Exchange-empty-positions-list-note App-card">
                <Trans>Loading...</Trans>
              </div>
            )}
            {positions.length === 0 && !positionsDataIsLoading && (
              <div className="Exchange-empty-positions-list-note App-card Exchange-list-empty-note">
                <Trans>No open positions</Trans>
              </div>
            )}
            {positions.map((position) => {
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
                <BorrowsItem
                  key={position.key}
                  position={position}
                  onPositionClick={onPositionClick}
                  setListSection={setListSection}
                  positionOrders={positionOrders}
                  showPnlAfterFees={showPnlAfterFees}
                  hasPositionProfit={hasPositionProfit}
                  positionDelta={positionDelta}
                  borrowState={borrowState}
                  setBorrowState={setBorrowState}
                  repayState={repayState}
                  setRepayState={setRepayState}
                  liquidationPrice={liquidationPrice}
                  cx={cx}
                  dgAddress={dgAddress}
                  isModalLoading={isModalLoading}
                  isLarge={false}
                />
              );
            })}
          </div>
        </div>
      )}
      <table className="Exchange-list large App-box">
        <tbody>
          {positions.length > 0 && (
            <tr className="Exchange-list-header">
              <th>
                <Trans>Position</Trans>
              </th>
              <th>
                <Trans>Net Value</Trans>
              </th>
              <th>
                <Trans>Available</Trans>
              </th>
              <th>
                <Trans>Debt</Trans>
              </th>
              <th>
                <Trans>Mark Price</Trans>
              </th>
              <th>
                <Tooltip
                  className="has-hint-tooltip nowrap"
                  handle="Liq. Price"
                  position="left-bottom"
                  enabled={true}
                  renderContent={() => {
                    return (
                      <div>
                        If the price reaches this price<br /> your loan will be liquidated
                      </div>
                    );
                  }}
                />
              </th>
              <th>
                <Trans>Borrow APR</Trans>
              </th>
              <th></th>
              <th></th>
            </tr>
          )}
          {positions.length === 0 && positionsDataIsLoading && (
            <tr>
              <td colSpan="15">
                <div className="Exchange-empty-positions-list-note">Loading...</div>
              </td>
            </tr>
          )}
          {positions.length === 0 && !positionsDataIsLoading && (
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
              <BorrowsItem
                key={position.key}
                position={position}
                onPositionClick={onPositionClick}
                setListSection={setListSection}
                positionOrders={positionOrders}
                showPnlAfterFees={showPnlAfterFees}
                hasPositionProfit={hasPositionProfit}
                positionDelta={positionDelta}
                borrowState={borrowState}
                setBorrowState={setBorrowState}
                repayState={repayState}
                setRepayState={setRepayState}
                hasOrderError={hasOrderError}
                liquidationPrice={liquidationPrice}
                cx={cx}
                dgAddress={dgAddress}
                isModalLoading={isModalLoading}
                isLarge={true}
                 />
            );
          })}
        </tbody>
      </table>

      {!!positions.length &&
        (<BorrowModal
          state={borrowState}
          setVisible={setBorrowVisible}
          isLoading={isModalLoading}
          setIsLoading={setIsModalLoading}
          />)}
      {!!positions.length &&
        (<RepayModal
          state={repayState}
          setVisible={setRepayVisible}
          isLoading={isModalLoading}
          setIsLoading={setIsModalLoading}
          />)}
    </div>
  );
}
