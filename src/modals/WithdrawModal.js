import { ActionButton, AssetDropdownMenuItem } from "styles/Styles";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Instruction,
  MyModal,
  Section,
  TextPopupTitle,
} from "modals/styles/Styles";

import { Spin } from "antd";
import { connect } from "react-redux";
import { fetchGasPrice } from "redux/actions/GasPrice";
import { fetchNonce } from "redux/actions/Nonce";
import { fetchWalletBalance } from "modals/components/utils";
import { showWithdrawModal } from "redux/actions/ModalManager";
import { withTheme } from "styled-components";
import AppLayout from "AppLayout";
import AssetDropdown from "modals/components/AssetDropdown";
import ErrorMessage from "modals/components/ErrorMessage";
import Group from "modals/components/Group";
import I from "components/I";
import LabelValue from "modals/components/LabelValue";
import ModalIndicator from "modals/components/ModalIndicator";
import NumericInput from "components/NumericInput";
import React from "react";
import WhyIcon from "components/WhyIcon";

import { faTimes } from "@fortawesome/free-solid-svg-icons/faTimes";
import { formatter } from "lightcone/common";
import { getWalletType } from "lightcone/api/localStorgeAPI";
import { notifyError, notifySuccess } from "redux/actions/Notification";
import WalletConnectIndicator from "modals/components/WalletConnectIndicator";
import WalletConnectIndicatorPlaceholder from "modals/components/WalletConnectIndicatorPlaceholder";
import config from "lightcone/config";

class WithdrawModal extends React.Component {
  state = {
    errorMessage1: "",
    errorToken: "",
    errorMessage2: "",
    loading: false,
    amount: null,
    ethBalance: 0,
    ethEnough: true,
    balance: 0,
    validateAmount: true,
    availableAmount: 0,
  };

  componentDidUpdate(prevProps, prevState) {
    // When the modal becomes visible
    if (
      this.props.isVisible &&
      (this.props.dexAccount.account.address !==
        prevProps.dexAccount.account.address ||
        this.props.isVisible !== prevProps.isVisible) &&
      window.wallet
    ) {
      const { balances } = this.props.balances;
      const selectedTokenSymbol = this.props.modalManager.withdrawalToken;
      (async () => {
        const ethBalance = await fetchWalletBalance(
          this.props.dexAccount.account.address,
          "ETH",
          this.props.exchange.tokens
        );
        const fee = this.getFeeCost();
        this.setState({
          ethBalance: ethBalance,
          ethEnough: fee <= ethBalance,
        });
      })();

      const holdAmount = this.getAvailableAmount(selectedTokenSymbol, balances);
      const balance = this.getHoldBalance(selectedTokenSymbol, balances);

      (async () => {
        this.props.fetchNonce(this.props.dexAccount.account.address);
        this.props.fetchGasPrice();
      })();

      this.setState({
        balance: balance,
        availableAmount: holdAmount,
        validateAmount:
          !this.state.amount || Number(this.state.amount) <= holdAmount,
      });
    }

    if (
      this.props.isVisible === false &&
      this.props.isVisible !== prevProps.isVisible
    ) {
      this.setState({
        loading: false,
        amount: null,
        validateAmount: true,
        availableAmount: 0,
      });
    }
  }

  handleCurrencyTypeSelect = (tokenSymbol) => {
    const amount = this.getAvailableAmount(
      tokenSymbol,
      this.props.balances.balances
    );
    this.props.showModal(tokenSymbol);

    // Reset amount and error message
    this.setState({
      amount: null,
      ethEnough: true,
      validateAmount: true,
      availableAmount: amount,
    });
  };

  // TODO: move to redux. will do the tranformation just after getting the data.
  getAvailableAmount = (symbol, balances) => {
    const tokens = this.props.exchange.tokens;
    const selectedToken = config.getTokenBySymbol(symbol, tokens);
    const holdBalance = balances.find(
      (ba) => ba.tokenId === selectedToken.tokenId
    );
    return holdBalance
      ? config.fromWEI(
          selectedToken.symbol,
          formatter
            .toBig(holdBalance.totalAmount)
            .minus(holdBalance.frozenAmount),
          tokens
        )
      : config.fromWEI(selectedToken.symbol, 0, tokens);
  };

  getHoldBalance = (symbol, balances) => {
    const tokens = this.props.exchange.tokens;
    const selectedToken = config.getTokenBySymbol(symbol, tokens);
    const holdBalance = balances.find(
      (ba) => ba.tokenId === selectedToken.tokenId
    );
    return holdBalance
      ? config.fromWEI(
          selectedToken.symbol,
          formatter.toBig(holdBalance.totalAmount),
          tokens,
          {
            ceil: true,
          }
        )
      : config.fromWEI(selectedToken.symbol, 0, tokens);
  };

  getFeeCost = () => {
    const gasPrice = formatter.fromGWEI(this.props.gasPrice.gasPrice);
    const withdrawalGas = config.getGasLimitByType("withdraw").gas;
    const gasCost = gasPrice.times(withdrawalGas);
    const fee = config.getFeeByType("withdraw", this.props.exchange.onchainFees)
      .fee;

    return Number(
      config.fromWEI("ETH", gasCost.plus(fee), this.props.exchange.tokens, {
        ceil: true,
      })
    );
  };

  onAmountValueChange = (value) => {
    const selectedTokenSymbol = this.props.modalManager.withdrawalToken;

    // Check validateAmount
    let validateAmount;
    if (Number.isNaN(Number(value)) || Number(value) <= 0) {
      validateAmount = false;
    } else {
      validateAmount = !value || Number(value) <= this.state.availableAmount;
    }

    // Check amount decimal points
    let errorMessage1 = "";
    let errorToken = "";
    let errorMessage2 = "";

    const { tokens } = this.props.exchange;
    const token = config.getTokenBySymbol(selectedTokenSymbol, tokens);

    if (token.symbol && validateAmount && value.split(".").length === 2) {
      var inputPrecision = value.split(".")[1].length;
      if (
        inputPrecision > token.decimals ||
        (parseFloat(value) === 0 && inputPrecision === token.decimals)
      ) {
        errorMessage1 = "Maximum_amount_input_decimal_part_1";
        errorToken = `${token.decimals}`;
        errorMessage2 = "Maximum_input_decimal_part_2";
        validateAmount = false;
      }
    }

    this.setState({
      amount: value,
      validateAmount,
      errorMessage1,
      errorToken,
      errorMessage2,
    });
  };

  validateAmount = () => {
    const { amount, availableAmount } = this.state;
    if (
      amount &&
      parseFloat(amount) > 0 &&
      availableAmount >= parseFloat(amount)
    ) {
      return true;
    } else {
      return false;
    }
  };

  submitWithdraw = () => {
    this.setState({
      loading: true,
    });

    console.log("submitWithdraw");

    let symbol = this.props.modalManager.withdrawalToken;

    (async () => {
      try {
        const {
          tokens,
          onchainFees,
          exchangeAddress,
          chainId,
        } = this.props.exchange;

        console.log("Before window.wallet.onchainWithdrawal");

        await window.wallet.onchainWithdrawal(
          {
            exchangeAddress,
            chainId,
            token: config.getTokenBySymbol(symbol, tokens),
            amount: this.state.amount,
            nonce: this.props.nonce.nonce,
            gasPrice: this.props.gasPrice.gasPrice,
            fee: config.getFeeByType("withdraw", onchainFees).fee,
          },
          true
        );

        notifySuccess(
          <I s="WithdrawInstructionNotification" />,
          this.props.theme,
          15
        );
      } catch (err) {
        notifyError(
          <I s="WithdrawInstructionNotificationFailed" />,
          this.props.theme
        );
        console.log(err);
      } finally {
        this.props.closeModal();
        this.setState({
          loading: false,
        });
      }
    })();
  };

  onClick = () => {
    if (this.validateAmount() === false) {
      this.setState({
        validateAmount: false,
      });
      return;
    } else {
      this.setState({
        validateAmount: true,
      });
    }

    this.submitWithdraw();
  };

  enterAmount = (e) => {
    if (e.keyCode === 13) {
      e.preventDefault();
      this.onClick();
    }
  };

  withdrawAll = () => {
    this.setState({
      amount: this.state.availableAmount,
      validateAmount: true,
    });
  };

  onClose = () => {
    this.props.closeModal();
  };

  render() {
    const theme = this.props.theme;
    const { tokens, onchainFees } = this.props.exchange;
    const selectedTokenSymbol = this.props.modalManager.withdrawalToken;
    const selectedToken = config.getTokenBySymbol(selectedTokenSymbol, tokens);

    const options = tokens
      .filter((token) => token.enabled)
      .map((token, i) => {
        const option = {};
        option.key = token.symbol;
        option.text = token.symbol + " - " + token.name;

        const menuItem = (
          <AssetDropdownMenuItem
            key={i}
            onClick={() => {
              this.handleCurrencyTypeSelect(token.symbol);
            }}
          >
            <span>
              {token.symbol} - <I s={token.name} />
            </span>
          </AssetDropdownMenuItem>
        );

        return menuItem;
      });

    let indicator;
    if (getWalletType() !== "MetaMask") {
      indicator = <WalletConnectIndicator />;
    } else {
      indicator = (
        <ModalIndicator
          title={
            getWalletType() === "MetaMask"
              ? "metamaskConfirm"
              : "walletConnectConfirm"
          }
          tips={[
            <div key="1">
              <I
                s={
                  getWalletType() === "MetaMask"
                    ? "metaMaskPendingTxTip"
                    : "walletConnectPendingTxTip"
                }
              />
            </div>,
          ]}
          imageUrl={
            getWalletType() === "MetaMask"
              ? `assets/images/${theme.imgDir}/metamask_pending.png`
              : ``
          }
          marginTop="60px"
        />
      );
    }

    let isWalletConnectLoading =
      this.state.loading && getWalletType() !== "MetaMask";

    return (
      <MyModal
        centered
        width="100%"
        title={null}
        footer={null}
        maskClosable={false}
        closable={false}
        visible={this.props.isVisible}
        onCancel={() => this.onClose()}
        bodyStyle={{
          
          padding: "0"
        }}
      >
        <Spin spinning={this.state.loading} indicator={indicator}>
          <WalletConnectIndicatorPlaceholder
            isWalletConnectLoading={isWalletConnectLoading}
          />
          <div className="modal-dialog modal-dialog-vertical" role="document">
            <div className="modal-content">
              <div className="modal-body p-lg-0">
                <div className="d-inline-block w-lg-60 vh-100">
                  <button className="btn btn-link text-dark position-absolute mt-n4 ml-n4 ml-lg-0 mt-lg-0" type="button" name="button" data-dismiss="modal" aria-label="Close" onClick={() => this.onClose()}>
                    <i className="fe fe-arrow-left h2"></i>
                  </button>
                  <div className="row justify-content-center">
                    <div className="col col-lg-8">
                      <h1 className="display-4 text-center my-5">
                        Withdraw
                      </h1>

                      <div className="card mb-5" style={{display: isWalletConnectLoading ? "none" : "block",}}>
                        <div className="card-body">
                          <div className="form-group">
                          <Group label={<I s="Amount" />}>
                            <NumericInput
                              decimals={selectedToken.precision}
                              color={
                                this.state.validateAmount
                                  ? theme.textWhite
                                  : theme.sellPrimary
                              }
                              value={this.props.modalManager.withdrawalToken.toUpperCase() ===
                                "TRB"
                                  ? this.state.balance
                                  : this.state.amount}
                              onChange={this.onAmountValueChange}
                              onClick={this.onAmountValueClick}
                              suffix={selectedTokenSymbol.toUpperCase()}
                              onKeyDown={this.enterAmount.bind(this)}
                              disabled={
                                this.props.modalManager.withdrawalToken.toUpperCase() ===
                                "TRB"
                              }
                            />
                          </Group>
                          {selectedTokenSymbol.toUpperCase() === 'RENBTC' &&
                              <a href='https://bridge.renproject.io/'
                                target='_blank'>Mint renBTC with BTC</a>}
                            
                            <span className="form-text small text-secondary mb-0 d-none d-lg-block">
                              <ErrorMessage
                                isWithdrawal={true}
                                selectedToken={selectedToken}
                                amount={this.state.amount}
                                availableAmount={this.state.availableAmount}
                                ethEnough={this.state.ethEnough}
                                validateAmount={this.state.validateAmount}
                                errorMessage1={this.state.errorMessage1}
                                errorToken={this.state.errorToken}
                                errorMessage2={this.state.errorMessage2}
                              />
                            </span>                            
                            <span className="form-text text-secondary mb-0 d-none d-lg-block mb-4">
                              <LabelValue
                                label={<I s="Balance on Loopring" />}
                                value={this.state.availableAmount}
                                unit={selectedTokenSymbol.toUpperCase()}
                                onClick={() => this.withdrawAll()}
                              />
                              <LabelValue
                                label={<I s="Available to withdraw" />}
                                value={this.state.availableAmount}
                                unit={selectedTokenSymbol.toUpperCase()}
                              />
                            </span>

                            <Group label={<I s="From" />}>
                              <AssetDropdown
                                options={options}
                                selected={
                                  <span>
                                    {selectedToken.symbol} - <I s={selectedToken.name} />
                                  </span>
                                }
                              />
                            </Group>
                          </div>

                          <button 
                          type="button"
                          name="Withdraw money"
                          className="btn btn-primary btn-lg btn-block"
                          disabled={
                            this.state.amount <= 0 ||
                            !this.state.validateAmount ||
                            this.state.loading ||
                            !this.state.ethEnough
                          }
                          onClick={() => this.onClick()}
                          >
                            Withdraw money
                          </button>
          
                        </div>
                      </div>
                      <div className="d-block d-lg-none">
                        <h5 className="header-pretitle mb-4">Everyday benefits</h5>
                        <div className="row mb-4">
                          <div className="col-auto">

                            <div className="btn btn-rounded-circle badge-soft-primary">
                              ⚔️
                            </div>

                          </div>
                          <div className="col ml-n2">
                            <h2 className="card-title mb-2">
                              Secure
                            </h2>

                            <p className="card-text mb-1">
                              Like on Ethereum, enjoy 100% non-custodial transactions.
                            </p>

                          </div>
                        </div>
                        <div className="row mb-4">
                          <div className="col-auto">

                            <div className="btn btn-rounded-circle badge-soft-primary">
                              ⚡️
                            </div>

                          </div>
                          <div className="col ml-n2">
                            <h2 className="card-title mb-2">
                              Fast
                            </h2>

                            <p className="card-text mb-1">
                              No more waiting, your transactions are lightning fast.
                            </p>

                          </div>
                        </div>
                        <div className="row mb-6">
                          <div className="col-auto">

                            <div className="btn btn-rounded-circle badge-soft-primary">
                              💰
                            </div>

                          </div>
                          <div className="col ml-n2">
                            <h2 className="card-title mb-2">
                              Free
                            </h2>

                            <p className="card-text mb-1">
                              A transaction on Loopring Pay is completly free and doesn't require to pay gas fees.
                            </p>

                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="d-lg-inline-block w-lg-40 position-fixed d-none bg-primary">
                  <div className="vh-100 p-4">
                    <div className="row justify-content-center">
                      <div className="col-10">
                        <img className="img-fluid mb-4" src="assets/images/logo.svg" alt="" width="64"/>
                        <h5 className="header-pretitle text-white mb-4">Everyday benefits</h5>
                        <div className="row mb-4">
                          <div className="col-auto">

                            <div className="btn btn-rounded-circle badge-soft-primary">
                              ⚔️
                            </div>

                          </div>
                          <div className="col ml-n2">
                            <h2 className="card-title mb-2 text-white">
                              Secure
                            </h2>

                            <p className="card-text text-white mb-1">
                              Like on Ethereum, enjoy 100% non-custodial transactions.
                            </p>

                          </div>
                        </div>
                        <div className="row mb-4">
                          <div className="col-auto">

                            <div className="btn btn-rounded-circle badge-soft-primary">
                              ⚡️
                            </div>

                          </div>
                          <div className="col ml-n2">
                            <h2 className="card-title mb-2 text-white">
                              Fast
                            </h2>

                            <p className="card-text text-white mb-1">
                              No more waiting, your transactions are lightning fast.
                            </p>

                          </div>
                        </div>
                        <div className="row mb-4">
                          <div className="col-auto">

                            <div className="btn btn-rounded-circle badge-soft-primary">
                              💰
                            </div>

                          </div>
                          <div className="col ml-n2">
                            <h2 className="card-title mb-2 text-white">
                              Free
                            </h2>

                            <p className="card-text text-white mb-1">
                              A transaction on Loopring Pay is completly free and doesn't require to pay gas fees.
                            </p>

                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
              </div> 
            </div>
          </div>
        </Spin>
      </MyModal>
    );
  }
}

const mapStateToProps = (state) => {
  const {
    modalManager,
    dexAccount,
    balances,
    nonce,
    gasPrice,
    exchange,
  } = state;
  const isVisible = modalManager.isWithdrawModalVisible;
  return {
    isVisible,
    modalManager,
    dexAccount,
    balances,
    nonce,
    gasPrice,
    exchange,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    closeModal: () => dispatch(showWithdrawModal(false)),
    showModal: (token) => dispatch(showWithdrawModal(true, token)),
    fetchNonce: (address) => dispatch(fetchNonce(address)),
    fetchGasPrice: () => dispatch(fetchGasPrice()),
  };
};

export default withTheme(
  connect(mapStateToProps, mapDispatchToProps)(WithdrawModal)
);
