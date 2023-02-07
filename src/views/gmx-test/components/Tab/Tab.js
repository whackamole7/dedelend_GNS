import React, { useState, useEffect } from "react";

import cx from "classnames";

import "./Tab.css";
import Tooltip from './../Tooltip/Tooltip';

export default function Tab(props) {
  const { options, option, setOption, onChange, type = "block", className, optionLabels, icons, disabled, disabledTooltip } = props;
  
  const onClick = (opt) => {
    if (disabled) {
      return;
    }
    
    if (setOption) {
      setOption(opt);
    }
    if (onChange) {
      onChange(opt);
    }
  };

  return (
    <div className={cx("Tab", type, className, disabled ? 'disabled' : '')}>
      {options.map((opt) => {
        const label = optionLabels && optionLabels[opt] ? optionLabels[opt] : opt;
        let disabledNode;
        
        if (props.disabledList) {
          props.disabledList.forEach(el => {
            if (el.label === label && el.disabled) {
              disabledNode = (
                <div className={cx("Tab-option", "tab-tooltip-container")} onClick={() => {return}} key={opt}>
                  {disabledTooltip}
                  {icons && icons[opt] && <img className="Tab-option-icon" src={opt === option ? icons[opt + '_active'] : icons[opt]} alt={option} />}
                  {label}
                </div>
              );
            }
          })
        }

        if (disabledNode) {
          return disabledNode;
        }
        
        return (
          <div className={cx("Tab-option", "muted", { active: opt === option })} onClick={() => onClick(opt)} key={opt}>
            {icons && icons[opt] && <img className="Tab-option-icon" src={opt === option ? icons[opt + '_active'] : icons[opt]} alt={option} />}
            {label}
          </div>
        );
      })}
    </div>
  );
}
