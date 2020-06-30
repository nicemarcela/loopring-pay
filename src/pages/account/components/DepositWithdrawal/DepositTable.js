import { ConfigProvider, Pagination, Table } from "antd";
import { connect } from "react-redux";
import I from "components/I";
import React from "react";
import TableLoadingSpin from "components/TableLoadingSpin";
import WhyIcon from "components/WhyIcon";
import styled, { withTheme } from "styled-components";

import Moment from "moment";

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

class DepositTable extends React.Component {
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

      let type = "-";

      if (transaction.depositType === "deposit") {
        type = <I s="Deposit" />;
      } else if (transaction.depositType === "update_account") {
        type = <I s="Key Reset" />;
      } else {
        type = <I s="Registration" />;
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
        fee: (
          <span
            style={{
              color: theme.textDim,
            }}
          >
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
        status: (
          <span>
            {status}
          </span>
        ),
        depositType: <span>{type}</span>,
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
                title={<span>{transaction.depositType}</span>}
                description={transaction.status}
              />
              <div>
                <span className="text-dark text-weight-bold d-block">{transaction.amount} <I s={transaction.symbol} /></span>
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

export default withTheme(connect(mapStateToProps, null)(DepositTable));
