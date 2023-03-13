import React from "react";
import { Menu } from "@headlessui/react";
import { FaChevronDown } from "react-icons/fa";
import cx from "classnames";
import "./ChartTokenSelector.scss";
import "../AddressDropdown/AddressDropdown.css";
import { getTokens, getWhitelistedTokens } from "../../config/Tokens";
import { LONG, SHORT, SWAP } from "../../lib/legacy";
import { ethers } from 'ethers';

export default function ChartTokenSelector(props) {
  const { chainId, selectedToken, onSelectToken } = props;

  let options = getTokens(chainId);
  const whitelistedTokens = getWhitelistedTokens(chainId);

  const indexTokens = whitelistedTokens.filter((token) => !token.isStable && !token.isWrapped && (token.symbol === 'ETH' || token.symbol === 'BTC'));

  options = indexTokens;

  const onSelect = async (token) => {
    onSelectToken(token);
  };

  const value = selectedToken;
  let icon;
  if (value.symbol) {
    icon = require("../../img/ddl/ic_" + value.symbol?.toLowerCase() + "_40.svg")?.default;
  }

  return (
    <Menu>
      <Menu.Button as="div">
        <button className={cx("App-cta small transparent chart-token-selector")}>
          <div className="chart-token-selector--name">
            <img src={icon} className="chart-token-selector--icon" alt={value.symbol + ' icon'} />
            <span className="chart-token-selector--current">{value.symbol}/USD</span>
          </div>
          <svg className="chevron-down" xmlns="http://www.w3.org/2000/svg" width="20" height="21" viewBox="0 0 20 21" fill="none">
            <path d="M4 8L10 13L16 8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </Menu.Button>
      <div className="chart-token-menu">
        <Menu.Items as="div" className="menu-items chart-token-menu-items divided">
          {options.map((option, index) => {
            let tokenPopupImage;
            try {
              tokenPopupImage = require("../../img/ddl/ic_" + option.symbol.toLowerCase() + "_40.svg");
            } catch (error) {
              tokenPopupImage = require("../../img/ddl/ic_eth_40.svg");
            }
            
            return (<Menu.Item key={index}>
              <div
                className={"menu-item" + (option.symbol === value.symbol ? ' chosen' : '')}
                onClick={() => {
                  onSelect(option);
                }}
              >
                <img src={tokenPopupImage?.default} alt={option.symbol + ' icon'} className="token-icon" />
                <span style={{ marginLeft: 7, marginRight: 35 }} className="token-label">
                  {option.symbol} / USD
                </span>
              </div>
            </Menu.Item>)
          })}
        </Menu.Items>
      </div>
    </Menu>
  );
}
