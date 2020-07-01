import { connect } from "react-redux";
import React from "react";
import styled, { withTheme } from "styled-components";

import { Button, ConfigProvider, Menu } from "antd";
import AppLayout from "AppLayout";
import I from "components/I";

import { history } from "redux/configureStore";
import SiteLogo from "components/top-nav-bar/SiteLogo";

import { fetchAllExchangeInfo } from "redux/actions/ExchangeInfo";
import ConfirmLogoutModal from "modals/LogoutModal";
import ConnectToWalletModal from "modals/ConnectToWalletModal";
import DepositModal from "modals/DepositModal";
import DexAccountBalanceService from "components/services/DexAccountBalanceService";
import DexAccountOrderService from "components/services/DexAccountOrderService";
import DexAccountService from "components/services/DexAccountService";
import ExportAccountModal from "modals/ExportAccountModal";
import LoginModal from "modals/LoginModal";
import ReferralModal from "modals/ReferralModal";
import TransferModal from "modals/TransferModal";
import WechatModal from "modals/WechatModal";
import ReceiveNewModal from "modals/ReceiveNewModal";

import MetaMaskService from "components/services/wallet-services/MetaMaskService";
import WalletConnectService from "components/services/wallet-services/WalletConnectService";
import WalletService from "components/services/wallet-services/WalletService";

import RegisterAccountModal from 'modals/RegisterAccountModal';
import ResetAccountKeyModal from 'modals/ResetAccountKeyModal';
import ResetApiKeyModal from 'modals/ResetApiKeyModal';
import WebSocketService from 'components/services/WebSocketService';
import WithdrawModal from 'modals/WithdrawModal';

import { fetchCmcPrice } from "redux/actions/CmcPrice";

import { LOGGED_IN } from "redux/actions/DexAccount";

import {
  getLastAccountPage,
  getLastOrderPage,
  getLastTradePage,
} from "lightcone/api/localStorgeAPI";

import { NavButtonWrapper } from "styles/Styles";
import EntranceButton from "components/top-nav-bar/EntranceButton";
import BalancePay from "pages/account/components/Balance/BalancePay";

import { notifyError } from "redux/actions/Notification";

const NavButton = styled(Button)`
  && {
    padding-left: 8px !important;
    padding-right: 8px !important;
    font-size: 1.2rem !important;
    font-weight: 600 !important;
    background-color: transparent !important;
    height: ${AppLayout.topNavBarHeight}!important;
    color: ${(props) =>
      props.active === 1 ? props.theme.textBright : props.theme.textWhite};
    border: none !important;
    border-radius: 0 !important;
    border-bottom-style: solid !important;
    border-bottom-width: 3px !important;
    border-bottom-color: ${(props) =>
      props.active === 1
        ? props.theme.primary + "!important"
        : "transparent!important"};
  }
  &:hover {
    color: ${(props) => props.theme.textBright}!important;
  }

  &[disabled],
  &[disabled]:hover {
    color: ${(props) => props.theme.textDim}!important;
  }
`;

const NavMenu = styled(Menu)`
  && {
    color: ${(props) => props.theme.textDim}!important;
    background: ${(props) => props.theme.background}!important;
  }
`;

class TopNavBar extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      lastTradePage: getLastTradePage(),
    };
  }

  componentDidMount() {
    this.props.fetchAllExchangeInfo();
    this.mainFunctionToCallAPI();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.pathname && this.props.pathname === "/invite") {
      notifyError(
        <span>
          <I s="IsNotInviteLink" />
        </span>,
        this.props.theme
      );
      history.push("/404");
      return;
    }
  }

  mainFunctionToCallAPI = () => {
    (async () => {
      try {
        this.props.fetchCmcPrice(this.props.cmcPrice.legal);
      } catch (error) {
      } finally {
      }
    })();
  };

  pushToTradePage = () => {
    const lastTradePage = getLastTradePage();
    if (lastTradePage) {
      const options = this.props.markets.filter(
        (market) => market.enabled && market.market === lastTradePage
      );
      if (options.length > 0) {
        history.push("/trade/" + lastTradePage);
        return;
      }
    }
    history.push("/trade/" + this.props.currentMarket);
  };

  render() {
    const theme = this.props.theme;
    const { account } = this.props.dexAccount;

    const onTradePage =
      this.props.pathname.includes("/trade/") ||
      this.props.pathname.includes("/invite");
    const disableTopTabs =
      this.props.pathname.includes("/document/") ||
      this.props.pathname.includes("/legal/") ||
      this.props.pathname.includes("/support/");

    const useSidePanelBackground = onTradePage || disableTopTabs;
    return (
      <div>
        <div className="bg-ellipses bg-primary-curved">
          <nav className="navbar border-0">
            <div className="container justify-content-between px-0 px-lg-3">
              <div className="col-auto d-flex align-items-center pl-0">
                <a className="navbar-brand mr-auto d-flex align-items-center" href="">
                  <img src="assets/images/logo.svg" alt="..." className="navbar-brand-img"/>
                  <span className="text-white ml-2 h2 mb-0">Loopring <span className="badge badge-soft-white text-dark align-top">Pay</span></span>
                </a>
              </div>
              <div className="col-auto ml-auto pr-0">
              <EntranceButton />
              </div>
            </div>
          </nav>
          <BalancePay />

        </div>
        <ConfigProvider>
          <div
            className="desktop-layout"
            style={{
              borderTopStyle: "none",
              borderBottomStyle: "none",
            }}
            ref={(menuButton) => (this._settingsButtonElement = menuButton)}
          >
            <RegisterAccountModal refer_id={this.state.refer_id} />
            <LoginModal />
            <DepositModal />
            <TransferModal />
            <ResetAccountKeyModal />
            <ResetApiKeyModal />
            <WithdrawModal />
            <MetaMaskService />
            <WalletConnectService />
            <WalletService />
            <DexAccountBalanceService />
            <DexAccountOrderService />
            <DexAccountService />
            <WebSocketService {...this.props} />

            <WechatModal />
            <ReceiveNewModal />
            <ReferralModal />
            <ConfirmLogoutModal />
            <ConnectToWalletModal />
            <ExportAccountModal />

          </div>
          <div className="mobile-layout">
            <NavMenu mode="horizontal">
              <NavButtonWrapper
                key="logo"
                style={{
                  width: `calc(${AppLayout.tradePanelWidth})`,
                  height: AppLayout.topNavBarHeight,
                  background: theme.background + "!important",
                  borderRightStyle: "solid",
                  borderRightWidth: "1px",
                  borderRightColor: theme.foreground,
                }}
              >
                <SiteLogo />
              </NavButtonWrapper>
            </NavMenu>
          </div>
        </ConfigProvider>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  const { pathname } = state.router.location;
  const { dexAccount, cmcPrice, currentMarket, exchange } = state;
  return {
    pathname,
    dexAccount,
    cmcPrice,
    currentMarket: currentMarket.current,
    markets: exchange.markets,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchCmcPrice: (legal) => dispatch(fetchCmcPrice(legal)),
    fetchAllExchangeInfo: () => dispatch(fetchAllExchangeInfo()),
  };
};

export default withTheme(
  connect(mapStateToProps, mapDispatchToProps)(TopNavBar)
);
