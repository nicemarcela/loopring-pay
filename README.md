# Loopring Pay - Send digital currencies faster and for free

Frontend of the zkRollup Payment Protocol of Loopring on Ethereum Mainnet.

- Try it: [Mainnet demo](https://nicemarcela.github.io/loopring-pay/)

# Everyday benefits of using Loopring Pay

## Secure

Like on Ethereum, enjoy 100% non-custodial transactions.

## Fast

No more waiting, your transactions are lightning fast.

## Free

A transaction on Loopring Pay is completly free and doesn't require to pay gas fees.

# Other features

- Multi wallet signin/signup using WalletConnect or MetaMask
- Support sending Ether and tokens to ENS names or Ethereum addresses, using Loopring's L2 (no gas, for free)
- Support adding memos to transactions
- Receive money, by showing QR code (incomplete? need to ask for login before showing)
- Deposits: "Add money" button for topping up, from L1 to L2
- Fully suppports Withdrawals
- Transactions history: Sent/Received, Deposited, Withdrawn
- Display the available balance, in USD
- i18n (en and zh translations)
- Fully responsive and mobile-first, ressembling the design of most mobile wallets

## To be implemented:
- List of past transactions includes completed and pending
- Search bar, and apply filters by type: deposits, withdrawals or transfers; and refresh in case of new transactions
- Can switch to Goerli testnet
- Switch between dark and light themes
- Choose between the fiat supported by Loopring, to show countervalues (EUR, USD, JPY, etc)
- Progressive Web App (PWA)
- ReactNative, for a mobile and desktop web native wallet
- Use WalletConnect deeplinks for using it with Argent and other mobile wallets, directly from mobile
- Integrate with EPNS for notifications (errors, status, etc) also with popups using Blocknative
- Screenshots
- manifest.json containing app color

# Quickstart
```
npm install
npm run dev
```
Open http://localhost:3000
