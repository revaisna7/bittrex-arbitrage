# README #

Bittrex arbitrage, automated triangular arbitrage on Bittrex.

### What is this repository for? ###
* People who want an automated way of making more money, does not come without a certain aspect of risk. Be careful.

### How do I get set up? ###
* `npm install bittrex-arbitrage`
* Sign up to https://bittrex.com/
* Set up two factor authentication
* Create an API key

### Create config file ###
Copy `config.default.js` to `config.js`
Set your API key and secret

### Configuration ###

##### trade #####
Whether to trade or not

##### minProfitFactor ######
The minimum profit factor as a percentage, to make on at least one of the currencies before opening trades

##### minInputBtc #####
Minimum trade size in BTC

##### deviation #####
Factor to deviate prices, can be both negative and positive, positive deviation seeks more profit, orders might not fill so quick.

##### restricted #####
List of currency codes that should not be traded.

### exchangeComission ###
Bittrex exchange commision

### bittrexoptions ###
Bittrex settings