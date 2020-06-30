import { connect } from "react-redux";
import I from "components/I";
import React from "react";
import styled, { withTheme } from "styled-components";

import { ConfigProvider, Pagination, Table } from "antd";
import Moment from "moment";
import TableLoadingSpin from "components/TableLoadingSpin";
import WhyIcon from "components/WhyIcon";

import {
  LargeTableRow,
  LargeTableRowFailed,
  LargeTableRowProcessed,
  LargeTableRowProcessing,
  SimpleTableContainer,
  TextCompactTableHeader,
} from "styles/Styles";
import EmptyTableIndicator from "components/EmptyTableIndicator";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { faCheckCircle } from "@fortawesome/free-solid-svg-icons/faCheckCircle";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons/faCircleNotch";
import { faClock } from "@fortawesome/free-solid-svg-icons/faClock";
import { faExclamationCircle } from "@fortawesome/free-solid-svg-icons/faExclamationCircle";

import { getEtherscanLink } from "lightcone/api/localStorgeAPI";
import { List, Avatar } from 'antd';

const StatusFontAwesomeIcon = styled(FontAwesomeIcon)`
  margin-right: 4px;
`;
class WithdrawalTable extends React.Component {
  render() {
    const theme = this.props.theme;
    const customizeRenderEmpty = () => (
      <EmptyTableIndicator
        text={this.props.placeHolder}
        loading={this.props.loading}
      />
    );


    const data = [];
    for (let i = 0; i < this.props.data.length; i++) {
      const transaction = this.props.data[i];
      var status = "-";
      if (transaction.status === "processing") {
        status = (
          <span
            style={{ color: theme.highlight, textAlign: "left" }}
          >
            <StatusFontAwesomeIcon icon={faCircleNotch} spin />
            <span>
              <I s="Processing" /> <WhyIcon text="StatusProcessing" />
            </span>
          </span>
        );
      } else if (transaction.status === "processed") {
        status = (
          <span
            style={{ color: theme.green, textAlign: "left" }}
          >
            <StatusFontAwesomeIcon icon={faCheckCircle} />
            <span>
              <I s="Succeeded" />
            </span>
          </span>
        );
      } else if (transaction.status === "failed") {
        status = (
          <span style={{ color: theme.red, textAlign: "left" }}>
            <StatusFontAwesomeIcon icon={faExclamationCircle} />
            <span>
              <I s="Failed" />
            </span>
          </span>
        );
      } else if (transaction.status === "received") {
        status = (
          <span
            style={{ color: theme.orange, textAlign: "left" }}
          >
            <StatusFontAwesomeIcon icon={faClock} />

            <span>
              {this.props.blockNum - transaction.blockNum <= 30 ? (
                <span>
                  <I s="Confirming" /> <WhyIcon text="StatusConfirming" />(
                  {Math.max(this.props.blockNum - transaction.blockNum, 0)} /
                  30)
                </span>
              ) : (
                <span>
                  <I s="Processing" /> <WhyIcon text="StatusProcessing" />
                </span>
              )}
            </span>
          </span>
        );
      }
      data.push({
        key: i,
        asset: (
          <span
            style={{
              paddingLeft: "14px",
            }}
          >
            {transaction.symbol} - <I s={transaction.tokenName} />
          </span>
        ),
        icon: (
          <Avatar src={`/assets/images/${transaction.symbol}.svg`} />
        ),
        amount: (
          <span>
            {transaction.amountInUI} {transaction.symbol}
          </span>
        ),
        realAmount: (
          <span>
            {transaction.realAmountInUI} {transaction.symbol}
          </span>
        ),
        fee: (
          <span>
            {transaction.feeInUI} ETH
          </span>
        ),
        date: (
          <span
            style={{
              paddingLeft: "14px",
              color: theme.textDim,
            }}
          >
            {Moment(transaction.timestamp).format(theme.timeFormat)}
          </span>
        ),
        txHash: (
          <span>
            <a
              href={`${getEtherscanLink(this.props.chainId)}/tx/${
                transaction.txHash
              }`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {transaction.txHashInUI}
            </a>
          </span>
        ),
        withdrawHash: (
          <span>
            <a
              href={`${getEtherscanLink(this.props.chainId)}/tx/${
                transaction.distributeHash
              }`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {transaction.distributeHashInUI}
            </a>
          </span>
        ),
        status: (
          <span>
            {status}
          </span>
        ),
      });
    }

    const hasPagination = this.props.total > this.props.limit;

    return (
      <ConfigProvider renderEmpty={data.length === 0 && customizeRenderEmpty}>
      <List
        itemLayout="horizontal"
        dataSource={data}
        size="large"
        renderItem={transaction => (
          <List.Item style={{
            paddingLeft: '0',
            paddingRight: '0',
          }}>
            
            <List.Item.Meta
              avatar={transaction.icon}
              title={"Withdrawn"}
              description={transaction.status}
            />
            <div>
              <span className="text-weight-bold d-block mt-3 ml-5 pl-4 mt-lg-0 ml-lg-0 pl-lg-0 text-lg-right">{transaction.amount} <I s={transaction.symbol} /></span>
              <span className="text-weight-bold d-block ml-5 pl-4 ml-lg-0 pl-lg-0 h5 text-lg-right">Loopring fee: {transaction.fee}</span>
            </div>
          </List.Item>
        )}
      />
    </ConfigProvider>
    );
  }
}

const mapStateToProps = (state) => {
  const { exchange, notifyCenter } = state;
  return { chainId: exchange.chainId, blockNum: notifyCenter.blockNum };
};

export default withTheme(connect(mapStateToProps, null)(WithdrawalTable));
