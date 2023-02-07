import React from "react";
import { Menu } from "@headlessui/react";
import { FaChevronDown } from "react-icons/fa";
import cx from "classnames";
import "./ChartTokenSelector.scss";
import "../AddressDropdown/AddressDropdown.css";
import { getTokens, getWhitelistedTokens } from "../../config/Tokens";
import { LONG, SHORT, SWAP } from "../../lib/legacy";
import { ethers } from 'ethers';
import icon_ETH from '../../../../img/icon-ETH.svg';
import icon_BTC from '../../../../img/icon-BTC.svg';

export default function ChartTokenSelector(props) {
  const { chainId, selectedToken, onSelectToken, swapOption } = props;

  const isLong = swapOption === LONG;
  const isShort = swapOption === SHORT;
  const isSwap = swapOption === SWAP;

  // Available tokens limitation
  // let options = getTokens(chainId);
  // const whitelistedTokens = getWhitelistedTokens(chainId);
  let options = [
    {
      name: "Ethereum",
      symbol: "ETH",
      decimals: 18,
      address: ethers.constants.AddressZero,
      isNative: true,
      isShortable: true,
      imageUrl: "https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880",
      icon: icon_ETH,
    },
    {
      name: "Bitcoin (WBTC)",
      symbol: "BTC",
      decimals: 8,
      address: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",
      isShortable: true,
      imageUrl: "https://assets.coingecko.com/coins/images/7598/thumb/wrapped_bitcoin_wbtc.png?1548822744",
      icon: icon_BTC,
    },
  ]
  const whitelistedTokens = options;


  const indexTokens = whitelistedTokens.filter((token) => !token.isStable && !token.isWrapped);
  const shortableTokens = indexTokens.filter((token) => token.isShortable);

  if (isLong) {
    options = indexTokens;
  }
  if (isShort) {
    options = shortableTokens;
  }

  const onSelect = async (token) => {
    onSelectToken(token);
  };

  const value = selectedToken;
  const icon = options.find(opt => {
    return opt.symbol === value.symbol;
  })?.icon;

  return (
    <Menu>
      <Menu.Button as="div" disabled={isSwap}>
        <button className={cx("App-cta small transparent chart-token-selector", { "default-cursor": isSwap /* "default-cursor": "default" */ })}>
          <div className="chart-token-selector--name">
            <img src={icon} className="chart-token-selector--icon" alt={value.symbol + ' icon'} />
            <span className="chart-token-selector--current">{value.symbol}/USD</span>
          </div>
          
          {!isSwap && (
            <svg className="chevron-down" xmlns="http://www.w3.org/2000/svg" width="20" height="21" viewBox="0 0 20 21" fill="none">
              <path d="M4 8L10 13L16 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
      </Menu.Button>
      <div className="chart-token-menu">
        <Menu.Items as="div" className="menu-items chart-token-menu-items divided">
          {options.map((option, index) => (
            <Menu.Item key={index}>
              <div
                className={"menu-item" + (option.symbol === value.symbol ? ' chosen' : '')}
                onClick={() => {
                  onSelect(option);
                }}
              >
                <img src={option.icon} alt={option.symbol + ' icon'} className="token-icon" />
                <span style={{ marginLeft: 7, marginRight: 35 }} className="token-label">
                  {option.symbol} / USD
                </span>
              </div>
            </Menu.Item>
          ))}
        </Menu.Items>
      </div>
    </Menu>
  );
}
