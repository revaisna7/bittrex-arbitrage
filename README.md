# Bittrex Arbitrage

Bittrex Arbitrage web server/client app designed to perform triangular arbitrage on [Bittrex.com](https://bittrex.com/)

# Features
Automatically calculates arbitrage opportunities on [Bittrex.com](https://bittrex.com/).
Trades for example, BTC into USD into ETH and back to BTC, when there is a profitable discrepency in the market.
To enable trades the trader must hold enough balance in each currency.

![screenshot](https://i.snipboard.io/5qQg4j.jpg)

# Strategy
Bittrex Arbitrage is based on the triangular arbitrage trading strategy in where conflicts in market prices result in ocassions where currencies are worth more than before you traded them. Conflicts happen due to discrepencies in market prices and floating point rounding errors. Bittrex Arbitrage does not base your book on a single currency, rather you must hold enough balance in each currency you want to trade. The strategy should accumulate more of each currency over time. Bittrex Arbitrage features different strategy modes.

## Modes
### Instant
Instant arbs are based on current market prices. Instant arbs are in the now triangular routes and are difficult to find. It takes somewhere between 5-30 seconds given a decent network connection and decent hardware, to complete all three trades automatically. They also don't happen often nor hang around long, when they do profits are generally marginal except for exceptional occasions. When there's a big market gap, sometimes it ends in a temporary infinite trading loop and takes quick profits. The risk you are taking is whehter you can place your orders on time before the conflict in the market is already filled by another trader.

### Potential
With potential mode you can take some more risk, by not seeking instant arbs, but potential arbs by reversing between buy/sell (bid/ask) prices. Your arbs will be slightly more risky and you will need to wait some time to fill, but the price difference from market price is so low they generally fill quite fast, usually within a day. They will be more profitable and happen slightly more often. You will be betting that the market moves slightly in a certain direction.

### Median
Median mode is like potential mode, only rather than go complete reverse, the difference between ask/bid prices is divided by half and added/subtracted to the price in which case you will be sitting directly in the middle of the order book at the moment in time the trades are placed. This is slightly less risky than median but risky none the less.

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
| mode | string | Calculation mode strategy. Possible modes are: 'speculate', 'medain', 'instant', 'fixed' |
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
 - Integrate API v3
 - Add features to the user interface such as rebalancing, currency configuration, strategy configuration etc.
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
