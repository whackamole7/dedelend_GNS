import React, { useState, useCallback } from "react";
import { Trans } from "@lingui/macro";

import {
  SWAP,
  INCREASE,
  DECREASE,
  USD_DECIMALS,
  formatAmount,
  getOrderError,
  TRIGGER_PREFIX_ABOVE,
  TRIGGER_PREFIX_BELOW,
  getExchangeRateDisplay,
  getTokenInfo,
  getExchangeRate,
  getPositionForOrder,
  getUsd,
  USDG_DECIMALS,
} from "../../lib/legacy.js";
import { handleCancelOrder } from "../../domain/legacy";
import { getContract } from "../../config/Addresses";

import Tooltip from "../Tooltip/Tooltip";
import OrderEditor from "./OrderEditor";

import "./OrdersList.css";
import Checkbox from "../Checkbox/Checkbox";
import StatsTooltipRow from "../StatsTooltip/StatsTooltipRow";
import { GNS_PAIRS } from './../../lib/GNS_legacy';
import { getTokenBySymbol } from "../../config/Tokens.js";
import { expandDecimals } from './../../lib/legacy';
import GNS_Trading from '../../abis/GNS/GNS_Trading.json';
import { ethers } from 'ethers';
import { errAlert, notifySuccess } from './../../../../components/utils/notifications';
import OrderEditorGNS from './OrderEditorGNS';

export default function OrdersList(props) {
  const {
    account,
    library,
    setPendingTxns,
    pendingTxns,
    infoTokens,
    positionsMap,
    totalTokenWeights,
    usdgSupply,
    orders,
    ordersGNS,
    hideActions,
    chainId,
    savedShouldDisableValidationForTesting,
    cancelOrderIdList,
    setCancelOrderIdList,
  } = props;

  const hasOrders = Boolean(orders.length || ordersGNS.length);
  const marketIconGNS = require('../../../../img/icon-GNS.svg').default;
  const marketIconGMX = require('../../../../img/icon-GMX.svg').default;  

  const [editingOrder, setEditingOrder] = useState(null);
  const [editingOrderGNS, setEditingOrderGNS] = useState(null);
  const [orderEditorGNSVisible, setOrderEditorGNSVisible] = useState();

  const onCancelClick = useCallback(
    (order, market = 'GMX') => {
      if (market === 'GMX') {
        handleCancelOrder(chainId, library, order, { pendingTxns, setPendingTxns });
      }
      if (market === 'GNS') {
        const contract = new ethers.Contract(GNS_Trading.address, GNS_Trading.abi, library.getSigner());

        contract.cancelOpenLimitOrder(order.pairIndex, order.index)
          .then(tsc => {
            console.log(tsc);
      
            tsc.wait()
              .then(() => {
                notifySuccess(`Limit order cancelled!`, tsc.hash);
              })
          }, errAlert)
      }
    },
    [library, pendingTxns, setPendingTxns, chainId]
  );

  const onEditClick = useCallback(
    (order, market = 'GMX') => {
      if (market === 'GMX') {
        setEditingOrder(order);
      }
      if (market === 'GNS') {
        setEditingOrderGNS(order);
        setOrderEditorGNSVisible(true);
      }
    },
    [setEditingOrder]
  );

  const renderHead = useCallback(() => {
    if (!hasOrders) {
      return;
    }
    
    const isAllOrdersSelected = cancelOrderIdList?.length > 0 && cancelOrderIdList?.length === orders.length;
    return (
      <tr className="Exchange-list-header">
        <th>
          <div>
            <Trans>Type</Trans>
          </div>
        </th>
        <th>
          <div>
            <Trans>Order</Trans>
          </div>
        </th>
        <th>
          <div>
            <Trans>Price</Trans>
          </div>
        </th>
        <th>
          <div>
            <Trans>Mark Price</Trans>
          </div>
        </th>
      </tr>
    );
  }, [cancelOrderIdList, orders, ordersGNS, setCancelOrderIdList]);

  const renderEmptyRow = useCallback(() => {
    if (hasOrders) {
      return null;
    }

    return (
      <tr>
        <td colSpan="5" className="Exchange-list-empty-note">
          <Trans>No open orders</Trans>
        </td>
      </tr>
    );
  }, [orders, ordersGNS]);

  const renderActions = useCallback(
    (order, market) => {
      return (
        <>
          <td>
            <button className="Exchange-list-action" onClick={() => onEditClick(order, market)}>
              <Trans>Edit</Trans>
            </button>
          </td>
          <td>
            <button className="Exchange-list-action" onClick={() => onCancelClick(order, market)}>
              <Trans>Cancel</Trans>
            </button>
          </td>
        </>
      );
    },
    [onEditClick, onCancelClick]
  );

  const renderLargeList = useCallback(() => {
    if (!orders || !orders.length) {
      return null;
    }
    return orders.map((order) => {
      const indexToken = getTokenInfo(infoTokens, order.indexToken);

      // Longs Increase: max price
      // Longs Decrease: min price
      // Short Increase: min price
      // Short Decrease: max price
      const maximisePrice = (order.type === INCREASE && order.isLong) || (order.type === DECREASE && !order.isLong);

      const markPrice = maximisePrice ? indexToken.contractMaxPrice : indexToken.contractMinPrice;
      const triggerPricePrefix = order.triggerAboveThreshold ? TRIGGER_PREFIX_ABOVE : TRIGGER_PREFIX_BELOW;
      const indexTokenSymbol = indexToken.isWrapped ? indexToken.baseSymbol : indexToken.symbol;

      const error = getOrderError(account, order, positionsMap);
      const orderId = `${order.type}-${order.index}`;
      const orderText = (
        <>
          {order.type === INCREASE ? "Increase" : "Decrease"} {indexTokenSymbol} {order.isLong ? "Long" : "Short"}
          &nbsp;by ${formatAmount(order.sizeDelta, USD_DECIMALS, 2, true)}
          {error && <div className="Exchange-list-item-error">{error}</div>}
        </>
      );

      return (
        <tr className="Exchange-list-item" key={`${order.isLong}-${order.type}-${order.index}`}>
          <td className="Exchange-list-item-type">
            <div className="icon-container">
              <img src={marketIconGMX} alt="GMX Icon" style={{width: 15}} />
              {order.type === INCREASE ? "Limit" : "Trigger"}
            </div>
          </td>
          <td>
            {order.type === DECREASE ? (
              orderText
            ) : (
              <Tooltip
                handle={orderText}
                position="right-bottom"
                renderContent={() => {
                  const collateralTokenInfo = getTokenInfo(infoTokens, order.purchaseToken);
                  const collateralUSD = getUsd(order.purchaseTokenAmount, order.purchaseToken, false, infoTokens);
                  return (
                    <StatsTooltipRow
                      label="Collateral"
                      value={`${formatAmount(collateralUSD, USD_DECIMALS, 2, true)} (${formatAmount(
                        order.purchaseTokenAmount,
                        collateralTokenInfo.decimals,
                        4,
                        true
                      )}
                      ${collateralTokenInfo.baseSymbol || collateralTokenInfo.symbol})`}
                    />
                  );
                }}
              />
            )}
          </td>
          <td className="nowrap">
            {triggerPricePrefix} {formatAmount(order.triggerPrice, USD_DECIMALS, 2, true)}
          </td>
          <td>
            <Tooltip
              handle={formatAmount(markPrice, USD_DECIMALS, 2, true)}
              position="right-bottom"
              renderContent={() => {
                return (
                  <Trans>
                    The price that orders can be executed at may differ slightly from the chart price, as market orders
                    update oracle prices, while limit/trigger orders do not.
                  </Trans>
                );
              }}
            />
          </td>
          {!hideActions && renderActions(order)}
        </tr>
      );
    });
  }, [
    orders,
    renderActions,
    infoTokens,
    positionsMap,
    hideActions,
    chainId,
    account,
    cancelOrderIdList,
    setCancelOrderIdList,
  ]);

  const renderLargeListGNS = useCallback(() => {
    if (!ordersGNS || !ordersGNS.length) {
      return null;
    }
    return ordersGNS.map((ord) => {
      const order = Object.assign({}, ord);
      
      order.type = INCREASE;
      order.isLong = order.buy;
      const indexTokenSymbol = Object.keys(GNS_PAIRS).find(symb => GNS_PAIRS[symb] === order.pairIndex.toNumber());
      const indexToken = getTokenBySymbol(chainId, indexTokenSymbol);

      const triggerPricePrefix = order.isLong ? TRIGGER_PREFIX_BELOW : TRIGGER_PREFIX_ABOVE;

      const markPrice = infoTokens[indexToken.address].maxPrice;
      order.markPrice = markPrice;
      order.triggerPrice = expandDecimals(order.maxPrice ?? order.minPrice, 20);
      
      order.positionSize = order.positionSize.mul(order.leverage)
      
      const orderText = (
        <>
          {order.type === INCREASE ? "Increase" : "Decrease"} {indexTokenSymbol} {order.isLong ? "Long" : "Short"}
          &nbsp;by ${formatAmount(order.positionSize, USDG_DECIMALS, 2, true)}
          <div>{!order.tp?.eq(0) && `Take Profit: $${formatAmount(order.tp, 10, 2, 1)}`}</div>
          <div>{!order.sl?.eq(0) && `Stop Loss: $${formatAmount(order.sl, 10, 2, 1)}`}</div>
        </>
      );

      return (
        <tr className="Exchange-list-item" key={`${order.buy}-${order.type}-${order.index}`}>
          <td className="Exchange-list-item-type">
            <div className="icon-container">
              <img src={marketIconGNS} alt="GNS Icon" style={{width: 15}} />
              {order.type === INCREASE ? "Limit" : "Trigger"}
            </div>
          </td>
          <td>
            {orderText}
          </td>
          <td className="nowrap">
            {triggerPricePrefix} {formatAmount(order.triggerPrice, USD_DECIMALS, 2, true)}
          </td>
          <td>
            {formatAmount(markPrice, USD_DECIMALS, 2, true)}
          </td>
          {!hideActions && renderActions(order, 'GNS')}
        </tr>
      );
    });
  }, [
    orders,
    renderActions,
    infoTokens,
    positionsMap,
    hideActions,
    chainId,
    account,
    cancelOrderIdList,
    setCancelOrderIdList,
  ]);

  const renderSmallListGNS = useCallback(() => {
    if (!ordersGNS || !ordersGNS.length) {
      return null;
    }
    return ordersGNS.map((ord) => {
      const order = Object.assign({}, ord);
      
      order.type = INCREASE;
      order.isLong = order.buy;
      const indexTokenSymbol = Object.keys(GNS_PAIRS).find(symb => GNS_PAIRS[symb] === order.pairIndex.toNumber());
      const indexToken = getTokenBySymbol(chainId, indexTokenSymbol);

      const triggerPricePrefix = order.isLong ? TRIGGER_PREFIX_BELOW : TRIGGER_PREFIX_ABOVE;

      const markPrice = infoTokens[indexToken.address].maxPrice;
      order.triggerPrice = expandDecimals(order.maxPrice ?? order.minPrice, 20);
      
      const orderText = (
        <>
          {order.type === INCREASE ? "Increase" : "Decrease"} {indexTokenSymbol} {order.isLong ? "Long" : "Short"}
          &nbsp;by ${formatAmount(order.positionSize, USDG_DECIMALS, 2, true)}
          <div style={{color: '#384263'}}>{!order.tp?.eq(0) && `Take Profit: $${formatAmount(order.tp, 10, 2, 1)}`}</div>
          <div style={{color: '#384263'}}>{!order.sl?.eq(0) && `Stop Loss: $${formatAmount(order.sl, 10, 2, 1)}`}</div>
        </>
      );

      return (
        <div key={`${order.isLong}-${order.type}-${order.index}`} className="App-card">
          <div className="App-card-title-small">
            {orderText}
          </div>
          <div className="App-card-divider"></div>
          <div className="App-card-content">
            <div className="App-card-row">
              <div className="label">
                <Trans>Type</Trans>
              </div>
              <div className="icon-container">
                <img src={marketIconGNS} alt="GNS Icon" style={{width: 15}} />
                {order.type === INCREASE && 'Limit'}
              </div>
            </div>
            <div className="App-card-row">
              <div className="label">
                <Trans>Price</Trans>
              </div>
              <div>
                {triggerPricePrefix} {formatAmount(order.triggerPrice, USD_DECIMALS, 2, true)}
              </div>
            </div>
            <div className="App-card-row">
              <div className="label">
                <Trans>Mark Price</Trans>
              </div>
              <div>
                {formatAmount(markPrice, USD_DECIMALS, 2, true)}
              </div>
            </div>
            {!hideActions && (
              <>
                <div className="App-card-divider"></div>
                <div className="App-card-options">
                  <button className="App-button-option App-card-option" onClick={() => onEditClick(order, 'GNS')} disabled={true}>
                    <Trans>Edit</Trans>
                  </button>
                  <button className="App-button-option App-card-option" onClick={() => onCancelClick(order, 'GNS')}>
                    <Trans>Cancel</Trans>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      );
    });
  }, [orders, ordersGNS, onEditClick, onCancelClick, infoTokens, positionsMap, hideActions, chainId, account]);

  const renderSmallList = useCallback(() => {
    if (!orders || !orders.length) {
      return null;
    }

    return orders.map((order) => {
      const indexToken = getTokenInfo(infoTokens, order.indexToken);
      const maximisePrice = (order.type === INCREASE && order.isLong) || (order.type === DECREASE && !order.isLong);
      const markPrice = maximisePrice ? indexToken.contractMaxPrice : indexToken.contractMinPrice;
      const triggerPricePrefix = order.triggerAboveThreshold ? TRIGGER_PREFIX_ABOVE : TRIGGER_PREFIX_BELOW;
      const indexTokenSymbol = indexToken.isWrapped ? indexToken.baseSymbol : indexToken.symbol;

      const collateralTokenInfo = getTokenInfo(infoTokens, order.purchaseToken);
      const collateralUSD = getUsd(order.purchaseTokenAmount, order.purchaseToken, true, infoTokens);

      const error = getOrderError(account, order, positionsMap);

      return (
        <div key={`${order.isLong}-${order.type}-${order.index}`} className="App-card">
          <div className="App-card-title-small">
            {order.type === INCREASE ? "Increase" : "Decrease"} {indexTokenSymbol} {order.isLong ? "Long" : "Short"}
            &nbsp;by ${formatAmount(order.sizeDelta, USD_DECIMALS, 2, true)}
            {error && <div className="Exchange-list-item-error">{error}</div>}
          </div>
          <div className="App-card-divider"></div>
          <div className="App-card-content">
            <div className="App-card-row">
              <div className="label">
                <Trans>Type</Trans>
              </div>
              <div className="icon-container">
                <img src={marketIconGMX} alt="GMX Icon" style={{width: 15}} />
                {order.type === INCREASE ? "Limit" : "Trigger"}
              </div>
            </div>
            <div className="App-card-row">
              <div className="label">
                <Trans>Price</Trans>
              </div>
              <div>
                {triggerPricePrefix} {formatAmount(order.triggerPrice, USD_DECIMALS, 2, true)}
              </div>
            </div>
            <div className="App-card-row">
              <div className="label">
                <Trans>Mark Price</Trans>
              </div>
              <div>
                <Tooltip
                  handle={formatAmount(markPrice, USD_DECIMALS, 2, true)}
                  position="right-bottom"
                  renderContent={() => {
                    return (
                      <Trans>
                        The price that the order can be executed at may differ slightly from the chart price as market
                        orders can change the price while limit / trigger orders cannot.
                      </Trans>
                    );
                  }}
                />
              </div>
            </div>
            {order.type === INCREASE && (
              <div className="App-card-row">
                <div className="label">
                  <Trans>Collateral</Trans>
                </div>
                <div>
                  ${formatAmount(collateralUSD, USD_DECIMALS, 2, true)} (
                  {formatAmount(order.purchaseTokenAmount, collateralTokenInfo.decimals, 4, true)}{" "}
                  {collateralTokenInfo.baseSymbol || collateralTokenInfo.symbol})
                </div>
              </div>
            )}
            {!hideActions && (
              <>
                <div className="App-card-divider"></div>
                <div className="App-card-options">
                  <button className="App-button-option App-card-option" onClick={() => onEditClick(order)}>
                    <Trans>Edit</Trans>
                  </button>
                  <button className="App-button-option App-card-option" onClick={() => onCancelClick(order)}>
                    <Trans>Cancel</Trans>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      );
    });
  }, [orders, onEditClick, onCancelClick, infoTokens, positionsMap, hideActions, chainId, account]);

  return (
    <React.Fragment>
      <table className="Exchange-list Orders App-box large">
        <tbody>
          {renderHead()}
          {renderEmptyRow()}
          {renderLargeList()}
          {renderLargeListGNS()}
        </tbody>
      </table>
      <div className="Exchange-list Orders small">
        {(!hasOrders) && (
          <div className="Exchange-empty-positions-list-note App-card">No open orders</div>
        )}
        {renderSmallList()}
        {renderSmallListGNS()}
      </div>
      {editingOrder && (
        <OrderEditor
          account={account}
          order={editingOrder}
          setEditingOrder={setEditingOrder}
          infoTokens={infoTokens}
          pendingTxns={pendingTxns}
          setPendingTxns={setPendingTxns}
          getPositionForOrder={getPositionForOrder}
          positionsMap={positionsMap}
          library={library}
          totalTokenWeights={totalTokenWeights}
          usdgSupply={usdgSupply}
          savedShouldDisableValidationForTesting={savedShouldDisableValidationForTesting}
        />
      )}
      <OrderEditorGNS
        visible={orderEditorGNSVisible}
        setVisible={setOrderEditorGNSVisible}
        order={editingOrderGNS}
        library={library}
      />
    </React.Fragment>
  );
}
