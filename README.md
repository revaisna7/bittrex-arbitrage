# Bittrex Arbitrage

Bittrex Arbitrage is a console app designed to perform triangular arbitrage on [Bittrex.com](https://bittrex.com/)

# Features
Automatically calculates arbitrage opportunities on [Bittrex.com](https://bittrex.com/) based on your balances.
Trades for example, BTC into USD into ETH and back to BTC, when there is a profitable discrepency in the market.
To enable trades the trader must hold enough balance in each currency.

![screenshot](https://i.snipboard.io/uTIjFQ.jpg)

### Installation
Bittrex Arbitrage requires [Node.js](https://nodejs.org/) v12+ to run.
```
git clone https://github.com/ChrisHemmens/bittrex-arbitrage.git
cd bittrex-arbitrage
npm install
```

### Configuration
To configure, copy `config.default.json` to `config.json`
```
copy config.default.json config.json
```
| option | type | description |
| ------ | ------ | ------ |
| trade | boolean | Whether to enable trade or not
| speculate | boolean | Speculation reverses the strategy from seeking instant arbitrages to potential arbitrages
| minProfitFactor | number | The minimum amount of profit to seek
| maxProfitFactor | number | The maximum amount of profit to seek (only used when profitAllThree is true.)
| profitAllThree | boolean | Whether to only trade when all three markets put out a profit
| minInputBtc | number | The minimum amount in BTC the bot should trade per delta. [Bittrex has a minimum size of 0.0005 BTC](https://bittrex.zendesk.com/hc/en-us/articles/360001473863-Bittrex-Trading-Rules)
| maxInputBtc | number | The maximum amount in BTC the bot should trade per delta.
| priceDeviation | number | Factor to deviate by prices by, be careful using this in to your favor in instant mode, it might make a money drain.
| exchangeComission | number | [Your Bittrex Exchange commission](https://bittrex.zendesk.com/hc/en-us/articles/115000199651-What-fees-does-Bittrex-charge-)
| dust | number | Factor of currency ballance to not trade to make sure you cannot exceed balances
| currencies | String[] | List of currencies to trade
| restricted | String[] | List of restricted currencies
| viewRefreshRate | number | How often to relog the output to console on milliseconds
| bittrexoptions | object | You must configure your "apikey" key and "apisecret". [How to create an API key.](https://bittrex.zendesk.com/hc/en-us/articles/360031921872-How-to-create-an-API-key-)

### Run
```
node main.js
```

### Todos
 - Integrate API v3
