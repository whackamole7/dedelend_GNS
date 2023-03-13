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
import { errAlert, notifySuccess } from './../../../../components/utils/notifications';
import { ethers } from 'ethers';
import { BigNumber } from 'ethers';
import { getTokenBySymbol } from "../../config/Tokens";
import { expandDecimals, MARKET } from './../../lib/legacy';
import { GNS_FEES_MULTIPLIER } from './../../../../components/utils/constants';
import SLTPModal from './../../../../components/UI/modal/SLTPModal';
import { formatForContract } from "../../../../components/utils/math";

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
    positionsLoading,
    pendingPositionsGNS,
  } = props;

  const hasPositions = Boolean(positions?.length || positionsGNS?.length || Object.keys(pendingPositionsGNS).length);

  const [modalVisible, setModalVisible] = useState(false);
  const [SLTPModalInfo, setSLTPModalInfo] = useState([]);


  const renderSLTPModal = () => {
    const [isTP, position, title, btnText] = SLTPModalInfo;
    const onApply = (val, setIsLoading) => {
      setSLTP(isTP, val, position, setIsLoading);
    }
    
    return (
      <SLTPModal
        visible={modalVisible}
        setVisible={setModalVisible}
        title={title}
        btnText={btnText}
        onApply={onApply}
        isTP={isTP}
        position={position}
      />
    );
  }
  const openSLTPModal = (isTP, position) => {
    const curVal = isTP ? position.tp : position.sl;
    const orderName = isTP ? 'Take Profit' : 'Stop Loss';
    const title = `${!curVal?.eq(0) ? 'Edit' : 'Set'} ${orderName}`;
    const btnText = !curVal?.eq(0) ? 'Save changes' : title;

		setSLTPModalInfo([
			isTP, position, title, btnText
		]);
    setModalVisible(true);
  }

  
  const setSLTP = (isTP, value, position, setIsLoading) => {
    const pairIndex = position.pairIndex;
    const index = position.index;
    const newValue = value ? formatForContract(value, 10) : '0';
    
    const contract = new ethers.Contract(GNS_Trading.address, GNS_Trading.abi, library.getSigner());
    const method = isTP ? 'updateTp' : 'updateSl';

    contract[method](pairIndex, index, newValue)
      .then(tsc => {
        console.log(tsc);
      
        tsc.wait()
          .then(() => {
            notifySuccess(`${isTP ? 'Take Profit' : 'Stop Loss'} update submitted!`, tsc.hash);
            setModalVisible(false);
          })
      }, errAlert).finally(() => setIsLoading(false));
  }

  const [positionToEditKey, setPositionToEditKey] = useState(undefined);
  const [positionToSellKey, setPositionToSellKey] = useState(undefined);
  const [positionToShare, setPositionToShare] = useState(null);
  const [isPositionEditorVisible, setIsPositionEditorVisible] = useState(undefined);
  const [isPositionSellerVisible, setIsPositionSellerVisible] = useState(undefined);
  const [positionSellerTab, setPositionSellerTab] = useState(MARKET);
  const [collateralTokenAddress, setCollateralTokenAddress] = useState(undefined);
  const [isPositionShareModalOpen, setIsPositionShareModalOpen] = useState(false);
  const [ordersToaOpen, setOrdersToaOpen] = useState(false);
  const [isHigherSlippageAllowed, setIsHigherSlippageAllowed] = useState(false);

  const editPosition = (position) => {
    setCollateralTokenAddress(position.collateralToken.address);
    setPositionToEditKey(position.key);
    setIsPositionEditorVisible(true);
  };

  const sellPosition = (position, setLoading, initTab) => {
    if (position.market === 'GMX') {
      setPositionToSellKey(position.key);
      setIsPositionSellerVisible(true);
      setPositionSellerTab(initTab);
      setIsHigherSlippageAllowed(false);
      setLoading(false);
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
      }, err => {
        errAlert(err);
        setLoading(false);
      });
    }
  };
  
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
          initTab={positionSellerTab}
        />
      )}
      {renderSLTPModal()}
      {hasPositions && !positionsLoading && (
        <div className="Exchange-list small">
          <div>
            {!hasPositions && (positionsDataIsLoading || positionsLoading) && (
              <div className="Exchange-empty-positions-list-note App-card">
                <Trans>Loading...</Trans>
              </div>
            )}
            {!hasPositions && !positionsDataIsLoading && !positionsLoading && (
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
                  openSLTPModal={openSLTPModal}
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
                  setSLTP={setSLTP}
                  isLarge={false}
                />
              );
            })}
            {positionsGNS?.map(pos => {
              if (!pos.trader || pos.trader === ADDRESS_ZERO) {
                return;
              }
              
              const position = Object.assign({}, pos);
  
              position.market = "GNS";
              const key = `${position.pairIndex}${position.index}`;
              const isLong = position.buy;
              position.isLong = isLong;
  
              const tokenSymb = Object.keys(GNS_PAIRS).find(symb => GNS_PAIRS[symb] === Number(position.pairIndex));
              position.indexToken = getTokenBySymbol(chainId, tokenSymb);
              const tokenAddr = position.indexToken.address;
              const curPrice = infoTokens[tokenAddr].maxPrice;
  
              position.size = BigNumber.from(position.positionSizeDai + '0'.repeat(12)).mul(position.leverage);
              position.markPrice = curPrice;
              position.averagePrice = BigNumber.from(position.openPrice + '0'.repeat(20));
              position.collateral = BigNumber.from(position.positionSizeDai + '0'.repeat(12));
              
              position.initCollateral = expandDecimals(position.positionSizeDai.div(10000 - position.leverage.mul(GNS_FEES_MULTIPLIER * 10**4)), 16);
              position.fees = position.initCollateral.sub(position.collateral);
              
              
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
  
              let pendingDeltaAfterFees;
              if (position.hasProfit) {
                if (position.delta.gt(position.fees)) {
                  hasPositionProfit = true;
                  pendingDeltaAfterFees = position.delta.sub(position.fees);
                } else {
                  hasPositionProfit = false;
                  pendingDeltaAfterFees = position.fees.sub(position.delta);
                }
              } else {
                hasPositionProfit = false;
                pendingDeltaAfterFees = position.delta.add(position.fees);
              }
        
              position.hasProfit = hasPositionProfit;
              position.delta = pendingDeltaAfterFees;
              position.deltaPercentage = pendingDeltaAfterFees
                .mul(BASIS_POINTS_DIVISOR)
                .div(position.collateral);
              
              const { deltaStr, deltaPercentageStr } = getDeltaStr({
                delta: position.delta,
                deltaPercentage: position.deltaPercentage,
                hasProfit: position.hasProfit,
              });
  
              position.deltaStr = deltaStr;
              position.deltaPercentageStr = deltaPercentageStr;
              position.deltaBeforeFeesStr = deltaStr;
              
              const entryPrice = position.averagePrice;
              const collateral = position.collateral.mul(position.leverage);
              const liqPriceDistance = (entryPrice.mul(collateral.mul(9).div(10)).div(collateral).div(position.leverage));
              
              const liqPrice = isLong ?
                  entryPrice.sub(liqPriceDistance)
                  : entryPrice.add(liqPriceDistance);
              
              position.leverage = position.leverage * 10**4;
  
              const positionOrders = [];
              return (
                <PositionsItem
                  openSLTPModal={openSLTPModal}
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
                  setSLTP={setSLTP}
                  isLarge={false}
                />
              );
            })}
            {Object.keys(pendingPositionsGNS)?.map(posKey => {
              if (!posKey) {
                return;
              }

              const position = Object.assign({}, pendingPositionsGNS[posKey]);

              position.market = "GNS";
              const key = `${position.pairIndex}`;

              const tokenSymb = Object.keys(GNS_PAIRS).find(symb => GNS_PAIRS[symb] === Number(position.pairIndex));
              
              position.indexToken = getTokenBySymbol(chainId, tokenSymb);
              const tokenAddr = position.indexToken.address;
              const curPrice = infoTokens[tokenAddr].maxPrice;

              position.size = BigNumber.from(position.positionSizeDai + '0'.repeat(12)).mul(position.leverage / 10**4);
              position.markPrice = curPrice;
              position.averagePrice = 0;
              position.collateral = BigNumber.from(position.positionSizeDai + '0'.repeat(12));
              
              const hasPositionProfit = undefined;
              position.hasProfit = hasPositionProfit;

              const positionOrders = [];
              return (
                <PositionsItem
                  openSLTPModal={openSLTPModal}
                  key={key}
                  position={position}
                  onPositionClick={onPositionClick}
                  setListSection={setListSection}
                  positionOrders={positionOrders}
                  showPnlAfterFees={showPnlAfterFees}
                  hasPositionProfit={hasPositionProfit}
                  positionDelta={0}
                  liquidationPrice={0}
                  cx={cx}
                  // borrowFeeUSD={borrowFeeUSD}
                  editPosition={editPosition}
                  sellPosition={sellPosition}
                  setSLTP={setSLTP}
                  isLarge={true}
                  isPending={true}
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
          {!hasPositions && (positionsDataIsLoading || positionsLoading) && (
            <tr>
              <td colSpan="15">
                <div className="Exchange-empty-positions-list-note">Loading...</div>
              </td>
            </tr>
          )}
          {!hasPositions && !positionsDataIsLoading && !positionsLoading && (
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
                openSLTPModal={openSLTPModal}
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
                setSLTP={setSLTP}
                isLarge={true}
              />
            );
          })}
          {positionsGNS?.map(pos => {
            if (!pos.trader || pos.trader === ADDRESS_ZERO) {
              return;
            }
            
            const position = Object.assign({}, pos);

            position.market = "GNS";
            const key = `${position.pairIndex}${position.index}`;
            const isLong = position.buy;
            position.isLong = isLong;

            const tokenSymb = Object.keys(GNS_PAIRS).find(symb => GNS_PAIRS[symb] === Number(position.pairIndex));
            position.indexToken = getTokenBySymbol(chainId, tokenSymb);
            const tokenAddr = position.indexToken.address;
            const curPrice = infoTokens[tokenAddr].maxPrice;

            position.size = BigNumber.from(position.positionSizeDai + '0'.repeat(12)).mul(position.leverage);
            position.markPrice = curPrice;
            position.averagePrice = BigNumber.from(position.openPrice + '0'.repeat(20));
            position.collateral = BigNumber.from(position.positionSizeDai + '0'.repeat(12));
            
            position.initCollateral = expandDecimals(position.positionSizeDai.div(10000 - position.leverage.mul(GNS_FEES_MULTIPLIER * 10**4)), 16);
            position.fees = position.initCollateral.sub(position.collateral);
            
            
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

            let pendingDeltaAfterFees;
            if (position.hasProfit) {
              if (position.delta.gt(position.fees)) {
                hasPositionProfit = true;
                pendingDeltaAfterFees = position.delta.sub(position.fees);
              } else {
                hasPositionProfit = false;
                pendingDeltaAfterFees = position.fees.sub(position.delta);
              }
            } else {
              hasPositionProfit = false;
              pendingDeltaAfterFees = position.delta.add(position.fees);
            }
      
            position.hasProfit = hasPositionProfit;
            position.delta = pendingDeltaAfterFees;
            position.deltaPercentage = pendingDeltaAfterFees
              .mul(BASIS_POINTS_DIVISOR)
              .div(position.collateral);
            
            const { deltaStr, deltaPercentageStr } = getDeltaStr({
              delta: position.delta,
              deltaPercentage: position.deltaPercentage,
              hasProfit: position.hasProfit,
            });

            position.deltaStr = deltaStr;
            position.deltaPercentageStr = deltaPercentageStr;
            position.deltaBeforeFeesStr = deltaStr;
            
            const entryPrice = position.averagePrice;
            const collateral = position.collateral.mul(position.leverage);
            const liqPriceDistance = (entryPrice.mul(collateral.mul(9).div(10)).div(collateral).div(position.leverage));
            
            const liqPrice = isLong ?
                entryPrice.sub(liqPriceDistance)
                : entryPrice.add(liqPriceDistance);
            
            position.leverage = position.leverage * 10**4;

            const positionOrders = [];
            return (
              <PositionsItem
                openSLTPModal={openSLTPModal}
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
                setSLTP={setSLTP}
                isLarge={true}
              />
            );
          })}
          {Object.keys(pendingPositionsGNS)?.map(posKey => {
            if (!posKey) {
              return;
            }
            
            const position = Object.assign({}, pendingPositionsGNS[posKey]);

            position.market = "GNS";
            const key = `${position.pairIndex}`;

            const tokenSymb = Object.keys(GNS_PAIRS).find(symb => GNS_PAIRS[symb] === Number(position.pairIndex));
            
            position.indexToken = getTokenBySymbol(chainId, tokenSymb);
            const tokenAddr = position.indexToken.address;
            const curPrice = infoTokens[tokenAddr].maxPrice;

            position.size = BigNumber.from(position.positionSizeDai + '0'.repeat(12)).mul(position.leverage / 10**4);
            position.markPrice = curPrice;
            position.averagePrice = 0;
            position.collateral = BigNumber.from(position.positionSizeDai + '0'.repeat(12));
            
            const hasPositionProfit = undefined;
            position.hasProfit = hasPositionProfit;

            const positionOrders = [];
            return (
              <PositionsItem
                openSLTPModal={openSLTPModal}
                key={key}
                position={position}
                onPositionClick={onPositionClick}
                setListSection={setListSection}
                positionOrders={positionOrders}
                showPnlAfterFees={showPnlAfterFees}
                hasPositionProfit={hasPositionProfit}
                positionDelta={0}
                liquidationPrice={0}
                cx={cx}
                // borrowFeeUSD={borrowFeeUSD}
                editPosition={editPosition}
                sellPosition={sellPosition}
                setSLTP={setSLTP}
                isLarge={true}
                isPending={true}
              />
            );
          })}
          
        </tbody>
      </table>
    </div>
  );
}
