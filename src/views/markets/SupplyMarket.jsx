import SupplyCard from './../../components/SupplyCard';
import WithdrawCard from './../../components/WithdrawCard';
import MarketInfoBoard from './../../components/MarketInfoBoard';

const SupplyMarket = ({ walletAddress, supplyStep, setSupplyStep }) => {
	
	
	return (
		<div className='block supply-market'>
			<MarketInfoBoard />
			
			<div className="supply-market__functions">
				<SupplyCard walletAddress={walletAddress} className="supply-market__function" step={supplyStep} setStep={setSupplyStep}></SupplyCard>
				<WithdrawCard walletAddress={walletAddress} className="supply-market__function" setSupplyStep={setSupplyStep}></WithdrawCard>
			</div>
		</div>
	);
};

export default SupplyMarket;