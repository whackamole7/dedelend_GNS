import React from 'react';
import { Link } from "react-router-dom";
import cx from 'classnames';

const Tabs = ({className, links}) => {
	const cls = cx(className, 'tabs');
	
	return (
		<div className={cls}>
			{links.map((link) => {
				if (link.isHidden) {
					return;
				}
				
				const linkCls = cx('btn', 'btn_tab', link.isActive && 'active');
				const linkEl = link.isExternal ?
					<a className={linkCls} target="_blank" rel="noreferrer" href={link.to}  key={link.to}>{link.name}</a>
					: <Link to={link.to} className={linkCls} key={link.to}>{link.name}</Link>
				return (
					linkEl
				)
			})}
			
		</div>
	);
};

export default Tabs;