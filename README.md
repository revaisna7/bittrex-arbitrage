# Bittrex Arbitrage

Bittrex Arbitrage web server/client app designed to perform triangular arbitrage on [Bittrex.com](https://bittrex.com/)

# Features
Automatically calculates arbitrage opportunities on [Bittrex.com](https://bittrex.com/).
Trades for example, BTC into USD into ETH and back to BTC, when there is a profitable discrepency in the market.
To enable trades the trader must hold enough balance in each currency.

![image](https://user-images.githubusercontent.com/1371051/191124449-6a376ec5-6442-47de-b240-5b7682eaf336.png)


# Strategy
Bittrex Arbitrage is based on the triangular arbitrage trading strategy in where conflicts in market prices result in ocassions where currencies are worth more than before you traded them. Conflicts happen due to discrepencies in market prices and floating point rounding errors. Bittrex Arbitrage does not base your book on a single currency, rather you must hold enough balance in each currency you want to trade. The strategy should accumulate more of each currency over time. Bittrex Arbitrage features different strategy modes.

## Modes
### Market
Market arbs are based on current market prices. Market arbs are in the now triangular routes and are difficult to find. It takes somewhere between 5-30 seconds given a decent network connection and decent computer hardware, to complete all three trades automatically. They also don't happen often nor hang around long, when they do profits are generally marginal except for exceptional occasions. When there's a big market gap, sometimes it ends in a temporary infinite trading loop and takes quick profits. The risk you are taking is whehter you can place your orders on time before the conflict in the market is already filled by another trader.

### Potential
With potential mode you can take some more risk, by not seeking market arbs, but potential arbs by reversing between buy/sell (bid/ask) prices. Your arbs will be slightly more risky and you will need to wait some time for your orders to fill, the price difference from market price is generally so low they generally fill quite fast, usually within a day. They will be more profitable and happen slightly more often. You will be betting that the market moves slightly in a certain direction.

### Median
Median mode is like potential mode, only rather than go complete reverse, the difference between ask and bid prices is divided by half and added to the bid price in which case you will be sitting directly in the middle of the order book at the moment in time the trades are placed. This is slightly less risky than median but risky none the less.

### Last
Last mode is when the prices are based on the price of the last trade to fill in the market.

### Fixed
In fixed mode the prices are fixed to make sure they will always guarantee a profit. You can configure the profit you want to fix by. These are much more risky, but really convenient for testing purposes. When these fill you get really good profits, but sometimes they don't fill at all as you are betting that the market goes in the right direction.

# Note
Keep into account the amount of volume your trading account makes. When you make enough volume your maker and taker fees go down drastically as Bittrex gives you lower exchange fees based on the amount of volume your accounts creates over a period of 30 days. The lower you can get the exchange fee the easier it is to find profitable arbs. [more info](https://bittrex.zendesk.com/hc/en-us/articles/115000199651-Bittrex-fees)

# Installation
Bittrex Arbitrage requires [Node.js](https://nodejs.org/) v12+ to run.
```
git clone https://github.com/ChristopherBenjaminHemmens/bittrex-arbitrage.git
cd bittrex-arbitrage
npm install
```

# Run
```
run
```
or
```
node bootstrap.js
```

![screenshot](https://i.snipboard.io/dob8r5.jpg)

Visit [http://localhost/](http://localhost/) in your browser

# Configuration

Follow instructions during first time setup when you visit the URL.

### Create a password
Fill out the form to create a password you will use later to login
![screenshot](https://i.snipboard.io/WMiYAj.jpg)

### Set Bittrex API key and secret
Fill in your bittrex API key and Secret, sub account id is not required.
![screenshot](https://i.snipboard.io/KZnjHt.jpg)

### Login
Login using your password
![screenshot](https://i.snipboard.io/kMXKb1.jpg)

### Routes
You will be directed to the routes overview. This overview features an insight into real-time arbs. By default three currencies are enabeled. BTC, USDT and ETH.
The table features eight columns:
 * Exchange being the exchange (currently only Bittrex.)
 * Type being the strategy mode used to calulate the arbs.
 * Currency being the three currencies used in the route.
 * Input being the volume input of the currencies.
 * Output being the output after the route would be traded.
 * Profit being the profit the route would give.
 * Profit Factor being the percentage of profit there is to be made.
 * Net Profit being the accumulation of all three profit factors.
![screenshot](https://i.snipboard.io/HfyNh0.jpg)

### Balances
In the balances tab you will see your balances compared against one another according to the currencies you have selected.
The table features nine columns:
 * Currency being the currency symbol and its logo.
 * Balance being your current balance of that currency.
 * Reserver being the amount of balance that is currently reserved for open orders.
 * Two accumulation columns with two timestamps. The timestamps refer to the total amount of worth your portfolio is worth based on the enabeled currencies at the moment of time it was calculated.
 * Profit beingg the difference between the two accumulations.
 * Factor being a percentage of profit. The bottom of the column features the average profit factor.
 * USDT is the ammount of balance you have in the currency in USDT
 * BTC is the amount of balance you have in the currency in BTC
 ![screenshot](https://i.snipboard.io/S7dazD.jpg)

### Trades
The Trades tab features the trades that Bittrex Arbitrage has placed. If you enable trade in the config tab this will gradually fill up as you start finding routes which suite your.
The table features five columns:
 * Time being the timestamp the trade was placed
 * Market being the market the trade was placed
 * Currency being the currency that was traded
 * Quantity being the quantity traded
 * Rate being the price
![image](https://user-images.githubusercontent.com/1371051/191837374-b0e5139b-8c05-4fd4-afbd-b4c8ec7dbb70.png)

### Orders
The Orders tab features currently open orders.
The table features nine columns:
 * Market being the market the order is in
 * Type the order type
 * Direction being the direction of the trade order
 * Quantity being the volume of the trade order
 * Reamaing being the quantity of volume that still needs to be filled
 * Target price being the price of the trade order
 * Difference being the difference in current market price and the current order price
 * Factor being the percentage of the difference of market price from order price
![screenshot](https://i.snipboard.io/CtiINp.jpg)

### Currencies
In the currencies tab you can configure the currencies you want to use in your strategy. Click the row of the currency you want to enable and then click the update allowed currencies. You will be warned that your profits will be recalculated.
The table features eight columns
 * Allow has a checkbox you can check to enable the currency for trade
 * Logo features the currency logo
 * Symbol is the currency symbol
 * Name is the currency name
 * Min confirmations is the amount of confirmations it takes to receive balance in that currency when it is deposited to your wallet.
 * Transaction fee is the fee to withdraw the currency.
 * Markets is the amount of markets the currency is used in. You cannot find arbitrages with currencies that feature atleast two or more markets. That's why by default you will see currencies that always have atleast two markets.
 * Notice is a notice from Bittrex about the currency
 ![screenshot](https://i.snipboard.io/KRjQtP.jpg)

#### Enable currencies guide
 1. If you allow as an example XRP in the currencies tab ![image](https://user-images.githubusercontent.com/1371051/191117484-098f0061-85b1-499a-849e-8e17cfa8828b.png)
 2. And visit the routes tab you will notice there are new routes available ![image](https://user-images.githubusercontent.com/1371051/191117732-c6089b8b-668b-4bfd-9976-0da79cbd73ff.png) 
 3. You will also notice that the currencies will be enabeled in your balance overview and your profits will be recalculated from a new starting point ![image](https://user-images.githubusercontent.com/1371051/191117981-9af869c6-a301-4df8-893f-865ba6a67351.png)

### Markets
The markets tab features an overview of the markets on Bittrex. You can restrict certain markets you might not wish to trade in.
The table features nine columns
 * Restrict contains a checkbox you can check to restrict the market from being traded in
 * Symbol is the currency paris of the market
 * Base currency is the base currency of the market
 * Quote currency is the quote currency of the market
 * Precision is the amount of decimal places are used in the price of the market
 * Maker fee is your maker fee for the market
 * Taker fee is your taker fee for the market
 * Status is whether the market is online or not
 * Notice is a notice from Bittrex about the market
![image](https://user-images.githubusercontent.com/1371051/191118530-53f0571e-777d-4fe9-a03d-70a8b8e81e84.png)

#### Restrict markets guide
 1. If you wish to restrict a market, for example say I no longer want to trade arbs that trade XRP against USDT I can check the checkbox and click the update restricted markets butten. ![image](https://user-images.githubusercontent.com/1371051/191119545-319b8f3b-78e7-4cf8-ba92-901d183a7588.png)
2. You will notice the market will no longer be used in your arbs ![image](https://user-images.githubusercontent.com/1371051/191120017-93e61723-0007-44ab-b064-1bb63bec817c.png)

### Config
The config tab allows you to set certain configurration parameters.
 * Enable trade: When you check this checkbos Bittrex Arbitrage will start trading automatically.
 * Profit all three: When you check this checkbox Bittrex Arbitrage will trade only routes in which all three currencies form a profit
 * Input BTC: All arbs are calculated based on this factor. The value of BTC in this field will directly represent the amount of volume of currency used for each trade.
 * Min profit factor: The minimum profit factor you want to achieve before Bittrex Arbitrage may place the trades
 * Mode: The strategy mode, the modes are market, potential, median, last and fixed.
 * Fix: The factor used to fix prices to make them more profitable.
![image](https://user-images.githubusercontent.com/1371051/191122762-fa12d69b-b283-486b-9537-790ffd40b22e.png)

# Configuration Parameters
You may optionally configure in the json file `./config/config.json`. This file will be created automatically on initial run.

### Route
| option | type | description |
| ------ | ------ | ------ |
| trade | boolean | Whether to enable trade. |
| minInputBtc | number | The minimum amount of BTC to trade per route. [Bittrex has a minimum size of 0.001 BTC](https://bittrex.zendesk.com/hc/en-us/articles/360001473863-Bittrex-Trading-Rules) |
| minProfitFactor | number | The minimum amount of profit to make per route based as a percentage. |
| profitAllThree | boolean | Whehter to only trade routes where all three currencies make a profit. |
| nextTradeTimeout | number | The amount of time to wait between trading routes in milliseconds. |

### Delta
| option | type | description |
| ------ | ------ | ------ |
| mode | string | Calculation mode strategy. Possible modes are: 'market', 'potential', 'medain', 'fixed' |
| fix | number | For fixed mode the amount of profit to fix routes by. |

### Trade
| option | type | description |
| ------ | ------ | ------ |
| orderType | string | Order type for submiting order (LIMIT is done purposely.) |

### Currency
| option | type | description |
| ------ | ------ | ------ |
| base | string | Base currency (unused) |
| allow | string[] | List of currencies to trade |
| restrict | string[] | List of currencies to restrict |

### Market
| option | type | description |
| ------ | ------ | ------ |
| restrict | string[] | List of currency pairs/market symbols to restrict |
| updateInterval | number | How frequently to poll market prices in milliseconds |

### Bittrex
| option | type | description |
| ------ | ------ | ------ |
| apikey | string | Bittrex API Key. You must configure your "apikey" key and "apisecret". [How to create an API key.](https://bittrex.zendesk.com/hc/en-us/articles/360031921872-How-to-create-an-API-key-). |
| apisecret | string | Bittrex API Secret |
| subaccountid | string | Not required |

### WebServer
| option | type | description |
| ------ | ------ | ------ |
| port | number | Web server port |
| httpsPort | number | https port |
| https | boolean | Whether to enable https |
| host | string | Server name |
| protocol | string | protocol |
| baseController | string | First controller to route to |
| fileDirectory | string | Publicly served files directory |
| keyFile | string | File location of https certificate key |
| certFile | string | File location of https certificate cert |

### SocketServer
| option | type | description |
| ------ | ------ | ------ |
| port | number | Port to server socket server through, if you wish to change you must also edit the javascript in `/application/view/base.html` |
| host | string | Host of socket server |

### Controller
| option | type | description |
| ------ | ------ | ------ |
| base | string | Base controller to route to |

### File
| option | type | description |
| ------ | ------ | ------ |
| webDirectory | string | Directory of files to be served publicly. |

### ArbitrageController
| option | type | description |
| ------ | ------ | ------ |
| socketInterval | number | How frequently to send data to the client through the socket in milliseconds. |

### User
| option | type | description |
| ------ | ------ | ------ |
| password | string | Password hash for login in. |

### Security
| option | type | description |
| ------ | ------ | ------ |
| salt | string | Salt, regenerated with shake function. |
| pepper | string | Pepper, regenerated with shake function. |

# Todos
 - Book balancer interface.
 - Backtesting feature.


# COPYRIGHT NOTICE

(c) Christopher Benjamin Hemmens 2022

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

 * Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
 * All advertising materials mentioning features or use of this software must display the following acknowledgement: This product includes software developed by Christopher Benjamin Hemmens.
 * Neither the name of the Christopher Benjamin Hemmens nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

# DISCLAIMER
THIS SOFTWARE IS PROVIDED BY Christopher Benjamin Hemmens AS IS AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL Christopher Benjamin Hemmens BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

# Contact

[chrishemmens@hotmail.com](mailto:chrishemmens@hotmail.com)
