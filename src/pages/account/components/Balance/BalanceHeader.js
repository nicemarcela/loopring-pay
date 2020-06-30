import { Col, Row } from "antd";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { faEquals } from "@fortawesome/free-solid-svg-icons/faEquals";
import { faPlus } from "@fortawesome/free-solid-svg-icons/faPlus";
import { withTheme } from "styled-components";
import BalanceHeaderEstimatedValue from "pages/account/components/Balance/BalanceHeaderEstimatedValue";
import {
  showDepositModal,
  showTransferModal,
  showWithdrawModal,
  showReceiveNewModal,
} from "redux/actions/ModalManager";


import React from "react";
import { Menu, Dropdown, Button, message, Tooltip } from 'antd';
import { DownOutlined, UserOutlined } from '@ant-design/icons';



class BalanceHeader extends React.PureComponent {
  getEstimatedValues() {
    let isPriceLoading = true;
    let balanceonEthereumSum = null;
    let balanceonEthereumEstimatedValue = null;

    let balanceOnExchangeSum = null;
    let balanceOnExchangeSumEstimatedValue = null;

    // Prices
    const { prices } = this.props.cmcPrice;

    // Base units are ETH and USDT prices
    let ethFilteredPrice = prices.filter((price) => price.symbol === "ETH");
    let usdtFilteredPrice = prices.filter((price) => price.symbol === "USDT");
    if (ethFilteredPrice.length === 1 && usdtFilteredPrice.length === 1) {
      isPriceLoading = false;
      let ethPrice = parseFloat(ethFilteredPrice[0].price);
      let usdtPrice = parseFloat(usdtFilteredPrice[0].price);

      balanceonEthereumSum = 0;
      balanceonEthereumEstimatedValue = 0;
      balanceOnExchangeSum = 0;
      balanceOnExchangeSumEstimatedValue = 0;

      // Balance on Ethereum
      for (var key in this.props.balanceOnEthereumDict) {
        const balanceOnExchange = this.props.balanceOnEthereumDict[key];
        const filteredPrice = prices.filter((price) => price.symbol === key);
        // If price is not found, set values to null
        if (filteredPrice.length === 1 || key === "DAI") {
          let price = 0;
          // https://api.loopring.io/api/v1/price doesn't return DAI price
          if (key === "DAI") {
            price = usdtPrice;
          } else {
            price = parseFloat(filteredPrice[0].price);
          }

          balanceonEthereumEstimatedValue =
            balanceonEthereumEstimatedValue +
            parseFloat(balanceOnExchange) * price;
        }
      }

      if (balanceonEthereumEstimatedValue && ethPrice > 0) {
        balanceonEthereumSum = balanceonEthereumEstimatedValue / ethPrice;
      }

      for (let i = 0; i < this.props.balances.length; i++) {
        const balance = this.props.balances[i];
        const filteredPrice = prices.filter(
          (price) => price.symbol === balance.token.symbol
        );

        // If price is not found, set values to null
        if (filteredPrice.length === 1 || balance.token.symbol === "DAI") {
          let price = 0;
          // https://api.loopring.io/api/v1/price doesn't return DAI price
          if (balance.token.symbol === "DAI") {
            price = usdtPrice;
          } else {
            price = parseFloat(filteredPrice[0].price);
          }

          balanceOnExchangeSumEstimatedValue =
            balanceOnExchangeSumEstimatedValue +
            parseFloat(balance.totalAmountInString) * price;
        }
      }

      if (balanceOnExchangeSumEstimatedValue && ethPrice > 0) {
        balanceOnExchangeSum = balanceOnExchangeSumEstimatedValue / ethPrice;
      }
    }

    return {
      isPriceLoading,
      balanceonEthereumSum,
      balanceonEthereumEstimatedValue,
      balanceOnExchangeSum,
      balanceOnExchangeSumEstimatedValue,
    };
  }

  toSumDisplay(isBalancesLoading, isPriceLoading, title, sum, estimatedValue) {
    if (
      isBalancesLoading ||
      isPriceLoading ||
      sum === null ||
      estimatedValue === null
    ) {
      return (
        <BalanceHeaderEstimatedValue
          title={title}
          isLoading={true}
          sum={""}
          estimatedValue={""}
        />
      );
    } else {
      let sumDipslay = `${sum.toFixed(3)} ETH`;
      let legalPrefix = this.props.cmcPrice.legalPrefix;
      let estimatedValueDisplay = `${estimatedValue.toFixed(2)}`;

      return (
        <BalanceHeaderEstimatedValue
          title={title}
          isLoading={false}
          sum={sumDipslay}
          estimatedValue={estimatedValueDisplay}
        />
      );
    }
  }

  render() {
    const estimatedValues = this.getEstimatedValues();
    const menu = (
      <Menu>
        <Menu.Item key="1" icon={<UserOutlined />} 
        onClick={() => {
          this.props.showReceiveNewModal(true);
        }}
        style={{fontSize: "16px", padding: "12px,16px"}}>
          Receive
        </Menu.Item>
        <Menu.Item key="2" icon={<UserOutlined />}
        onClick={() => {
          this.props.showWithdrawModal(true);
        }}
        style={{fontSize: "16px", padding: "12px, 16px"}}>
          Withdraw
        </Menu.Item>
      </Menu>
    );

    return (
      <div>
        <div className="main-content pt-5 pb-6 pb-lg-7 mb-n2">

          <div className="container">
            {this.toSumDisplay(
                false,
                estimatedValues.isPriceLoading,
                "Balance on Loopring",
                estimatedValues.balanceOnExchangeSum,
                estimatedValues.balanceOnExchangeSumEstimatedValue
              )}
            <div className="h5 text-uppercase text-center text-white mb-4" style={{letterSpacing:"0"}}>
              Available
            </div>
            <div className="row justify-content-center">
              <div className="col-auto">
                <div className="btn-group btn-group-lg mb-4" role="group" aria-label="">
                  <button type="button" 
                  className="btn btn-lg btn-outline-primary text-white border-right-0" 
                  data-toggle="modal" 
                  data-target="#addMoney" 
                  onClick={() => {
                  this.props.showDepositModal(true);}}
                  style={{fontSize: "16px"}}>
                    Add money
                  </button>
                  <button type="button" 
                  className="btn btn-lg btn-outline-primary text-white border-right-0 py-3 lead" 
                  onClick={() => {this.props.showTransferModal(true);}}
                  style={{fontSize: "16px"}}>
                    Send</button>
                    <Dropdown 
                    overlay={menu}>
                      <button type="button" 
                      className="btn btn-outline-primary text-white rounded-right border-left-0 px-2" 
                      id="btnGroupDrop1" 
                      type="primary" ghost
                      className="btn btn-outline-primary text-white rounded-right border-left-0 px-2"
                      style={{fontSize: "16px"}}>
                      <i className="fe fe-more-vertical"></i></button>
                    </Dropdown>

                </div>
              </div>
            </div>
            
          </div>


          </div>
        
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  const { cmcPrice } = state;
  return { cmcPrice };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      showTransferModal,
      showDepositModal,
      showWithdrawModal,
      showReceiveNewModal,
    },
    dispatch
  );
};

export default withTheme(
  connect(mapStateToProps, mapDispatchToProps)(BalanceHeader)
);
