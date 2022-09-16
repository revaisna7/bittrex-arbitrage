# Bittrex Arbitrage

Bittrex Arbitrage web server/client app designed to perform triangular arbitrage on [Bittrex.com](https://bittrex.com/)

# Features
Automatically calculates arbitrage opportunities on [Bittrex.com](https://bittrex.com/).
Trades for example, BTC into USD into ETH and back to BTC, when there is a profitable discrepency in the market.
To enable trades the trader must hold enough balance in each currency.

![screenshot](https://i.snipboard.io/5qQg4j.jpg)

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
Visit [http://localhost/](http://localhost/) in your browser

# Configuration

Follow instructions during first time setup when you visit the URL.

### Create a password
Fill out the form to create a password you will use later to login
![screenshot](https://i.snipboard.io/WMiYAj.jpg)

### Create a password
Fill in your bittrex API key and Secret, sub account id is not required.
![screenshot](https://i.snipboard.io/ZL1GuF.jpg)

### Login
Login using your password
![screenshot](https://i.snipboard.io/kMXKb1.jpg)

# Configuration Parameters
You may optionally configure in the json file './config/config.json'. This file will be created automatically on initial run.

### Route
| option | type | description |
| ------ | ------ | ------ |
| trade | boolean | Whether to enable trade. |
| minInputBtc | number | The minimum amount of BTC to trade per route. [Bittrex has a minimum size of 0.0005 BTC](https://bittrex.zendesk.com/hc/en-us/articles/360001473863-Bittrex-Trading-Rules) |
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
| password | strring | Password for login in. |

# Todos
 - Integrate API v3
 - Add features to the user interface such as rebalancing, currency configuration, strategy configuration etc.
 - Backtesting feature.
