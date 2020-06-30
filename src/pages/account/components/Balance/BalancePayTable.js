import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { bindActionCreators } from "redux";
import { connect } from "react-redux";
import { Card } from 'antd';
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons/faCircleNotch";
import {
  showDepositModal,
  showTransferModal,
  showWithdrawModal,
} from "redux/actions/ModalManager";
import styled, { withTheme } from "styled-components";
import React from "react";
import { List, Avatar } from 'antd';
import {
  DepositOutlineButton,
  TransferOutlineButton,
  WithdrawOutlineButton,
} from "styles/Styles";
import { debounce } from "lodash";
import { fetchWalletBalance } from "modals/components/utils";
import BalanceHeader from "pages/account/components/Balance/BalanceHeader";
import BalanceHeaderNavBar from "pages/account/components/Balance/BalanceHeaderNavBar";
import I from "components/I";
import PayTable from "components/PayTable";

const AssetIcon = styled.div`
  display: inline-block;
  width: 50px;
  height: 32px;
  border-radius: 50%;
  margin-right: 16px;
  margin-left: -8px;
  margin-top: 0px;
  background-repeat: no-repeat;
  background-size: 33px;
  background-position: center;
  background-origin: content-box;
`;
class BalancePayTable extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      balanceOnEthereumDict: {},
      isBalancesLoading: true,
      searchInput: "",
    };
  }

  componentDidMount() {
    this.mounted = true;
    this.loadBalanceOnEthereum();
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.balances.balances.length !==
        this.props.balances.balances.length ||
      (prevProps.exchange.isInitialized !== this.props.exchange.isInitialized &&
        this.props.exchange.isInitialized) ||
      (this.props.dexAccount.account &&
        this.props.dexAccount.account.address &&
        prevProps.dexAccount.account.address !==
          this.props.dexAccount.account.address)
    ) {
      this.loadBalanceOnEthereum();
    }
  }
  getAssetIconUrl(token) {
    const { theme } = this.props;
    var path;
    if (token.symbol === "ETH") {
      return "url(/assets/images/ETH.png)";
    } else if (token.symbol === "LRC") {
      return "url(/assets/images/LRC.png)";
    } else if (token.symbol.toUpperCase() === "TBTC") {
      return `url("/assets/images/TBTC.png")`;
    } else {
      return `url("/assets/images/${token.symbol}.svg")`;
    }
  }

  // Have to use other API endpoints to get data
  loadBalanceOnEthereum = debounce(() => {
    const { dexAccount } = this.props;
    if (
      dexAccount.account.address &&
      !!dexAccount.account.accountId &&
      !!dexAccount.account.accountKey &&
      dexAccount.account.apiKey
    ) {
      (async () => {
        try {
          this.setState({
            isBalancesLoading: true,
          });
          const { tokens } = this.props;
          const balanceOnEthereumDict = {};
          for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            balanceOnEthereumDict[token.symbol] = await fetchWalletBalance(
              this.props.dexAccount.account.address,
              token.symbol,
              tokens
            );
          }
          if (this.mounted) {
            this.setState({
              balanceOnEthereumDict,
            });
          }
        } catch (error) {
        } finally {
          this.setState({
            isBalancesLoading: false,
          });
        }
      })();
    }
  }, 1000);



  onSearchInputChange = (value) => {
    this.setState({
      searchInput: value.toLowerCase(),
    });
  };

  render() {
    let { balances } = this.props.balances;
    const tokens = this.props.tokens.filter((token) => token.enabled);
    balances = balances || [];
    balances = tokens.map((token) => {
      const balance = balances.find((ba) => ba.token.tokenId === token.tokenId);
      if (balance) {
        return balance;
      } else {
        return {
          token,
          totalAmountInString: Number(0).toFixed(token.precision),
          available: Number(0).toFixed(token.precision),
          availableInAssetPanel: Number(0).toFixed(token.precision),
        };
      }
    });

    let filteredBalances = [];
    if (
      !this.state.isBalancesLoading &&
      this.props.balances.hideLowBalanceAssets
    ) {
      filteredBalances = balances.filter((balance) => {
        const totalAmount = parseFloat(balance.totalAmountInString);
        if (totalAmount > 0) return true;

        let balanceOnEthereum = this.state.balanceOnEthereumDict[
          balance.token.symbol
        ];
        if (balanceOnEthereum && parseFloat(balanceOnEthereum) > 0) {
          return true;
        }
        return false;
      });
    } else {
      filteredBalances = balances;
    }

    let filteredSearchInputBalances = [];
    if (this.state.searchInput !== "") {
      filteredSearchInputBalances = filteredBalances.filter((balance) => {
        if (
          balance.token.symbol.toLowerCase().indexOf(this.state.searchInput) ===
          -1
        ) {
          return false;
        } else {
          return true;
        }
      });
    } else {
      filteredSearchInputBalances = filteredBalances;
    }

    return (

      <div>
        <div className="main-content">
          <div className="container">
            <div className="row justify-content-center mb-5">
              <div className="col-12 col-lg-6">
                <Card className="mb-5 mt-lg-n6 rounded" title="Assets" bordered={false} style={{ marginTop: -100 }}>
                <List
                  itemLayout="horizontal"
                  dataSource={balances}
                  renderItem={balance => (
                    <List.Item>
                      <AssetIcon
                      style={{
                        backgroundImage: this.getAssetIconUrl(
                          balance.token
                        ),
                      }}
                      />
                      <List.Item.Meta
                        title={balance.token.symbol}
                        description={<I s={balance.token.name} />}
                      />
                      <div>
                        {balance.totalAmountInString}
                        <span className="text-secondary text-weight-bold d-block text-right h5">$0.00</span>
                      </div>
                    </List.Item>
                  )}
                />
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  const { dexAccount, balances, exchange } = state;
  return {
    dexAccount,
    balances,
    exchange,
    tokens: exchange.tokens,
  };
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators(
    {
      showTransferModal,
      showDepositModal,
      showWithdrawModal,
    },
    dispatch
  );
};

export default withTheme(
  connect(mapStateToProps, mapDispatchToProps)(BalancePayTable)
);
