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
    infoTokens,
    active,
    account,
    library,
    setMarket,
    positionsLoading,
  } = props;

  const hasPositions = false;

  const [modalVisible, setModalVisible] = useState(false);
  
  const onPositionClick = (position) => {
    helperToast.success(`${position.isLong ? "Long" : "Short"} ${position.indexToken.symbol} market selected`);
    setMarket(position.isLong ? LONG : SHORT, position.indexToken.address);
  };

  return (
    <div className="PositionsList">
      {hasPositions && !positionsLoading && (
        <div className="Exchange-list small">
          <div>
            {!hasPositions && positionsLoading && (
              <div className="Exchange-empty-positions-list-note App-card">
                <Trans>Loading...</Trans>
              </div>
            )}
            {!hasPositions && !positionsLoading && (
              <div className="Exchange-empty-positions-list-note App-card Exchange-list-empty-note">
                <Trans>No open positions</Trans>
              </div>
            )}
            {/* {positions.map((position) => {
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
            })} */}
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
          {!hasPositions && positionsLoading && (
            <tr>
              <td colSpan="15">
                <div className="Exchange-empty-positions-list-note">Loading...</div>
              </td>
            </tr>
          )}
          {!hasPositions && !positionsLoading && (
            <tr>
              <td colSpan="15" className="Exchange-list-empty-note">
                No open positions
              </td>
            </tr>
          )}
          {/* {positions.map((position) => {
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
          })} */}
          
        </tbody>
      </table>
    </div>
  );
}
