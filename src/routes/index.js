import { Redirect, Route, Switch } from "react-router";
import BalanceHeaderEstimatedValue from "pages/account/components/Balance/BalanceHeaderEstimatedValue";
import React from "react";

import {
  MyBalancesPage,
  MyDepositsPage,
  MyLiquidityMiningPage,
  MyReferralRewardsPage,
  MyTransferPage,
  MyWithdrawalsPage,
} from "pages/account/AccountPages";

import {
  MyOpenOrdersPage,
  MyOrderHistoryPage,
  MyTradesPage,
} from "pages/orders/OrderPages";


import TopNavBar from "components/top-nav-bar/TopNavBar";
import BalancePayTable from "pages/account/components/Balance/BalancePayTable";
import DepositWithdrawalTable from "pages/account/components/DepositWithdrawal/DepositWithdrawalTable";
import { Card } from 'antd';
import { Tabs } from 'antd';

const { TabPane } = Tabs;

function callback(key) {
  console.log(key);
}
const routes = (
  <div>

    <TopNavBar />
    <BalancePayTable />
    <div>
        <div className="main-content">
          <div className="container">
            <div className="row justify-content-center mb-5">
              <div className="col-12 col-lg-6">
                <Card className="mb-6 rounded" 
                  title="History" 
                  bordered={false} 
                  headStyle={{borderBottom:0}}
                  bodyStyle={{paddingTop:0}}
                >
                  <Tabs onChange={callback}>
                    <TabPane tab="Sent/Received" key="1">
                      <DepositWithdrawalTable type="transfer" />
                    </TabPane>
                    <TabPane tab="Deposited" key="2">
                      <DepositWithdrawalTable type="deposit" />
                    </TabPane>
                    <TabPane tab="Withdrawn" key="3">
                      <DepositWithdrawalTable type="withdrawals" />
                    </TabPane>
                  </Tabs>

                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    
    
  </div>
);

export default routes;
