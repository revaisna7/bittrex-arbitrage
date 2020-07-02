const Config = require('../schema/Config.js');

const bittrexApiV3 = require('./BittrexRestApi.js');
var bittrex = require('node-bittrex-api');
bittrex.options(Config.get('bittrexoptions'));

class Bittrex {

    // @todo move to api v3
    static subscribeOrderBook(marketSymbols, callback) {
        return bittrex.websockets.subscribe(marketSymbols, callback);
    }

    static async account() {
        return await bittrexApiV3.account(
                Config.get('bittrexoptions').apikey,
                Config.get('bittrexoptions').apisecret,
                Config.get('bittrexoptions').subaccountid
        );
    }
    static async accountVolume() {
        return await bittrexApiV3.accountVolume(
                Config.get('bittrexoptions').apikey,
                Config.get('bittrexoptions').apisecret,
                Config.get('bittrexoptions').subaccountid
        );
    }
    static async addresses() {
        return await bittrexApiV3.addresses(
                Config.get('bittrexoptions').apikey,
                Config.get('bittrexoptions').apisecret,
                Config.get('bittrexoptions').subaccountid
        );
    }
    static async address(currency) {
        return await bittrexApiV3.address(
                Config.get('bittrexoptions').apikey,
                Config.get('bittrexoptions').apisecret,
                Config.get('bittrexoptions').subaccountid,
                currency
        );
    }
    static async newaddress(currency) {
        return await bittrexApiV3.newaddress(
                Config.get('bittrexoptions').apikey,
                Config.get('bittrexoptions').apisecret,
                Config.get('bittrexoptions').subaccountid,
                currency
        );
    }
    static async balances() {
        return await bittrexApiV3.balances(
                Config.get('bittrexoptions').apikey,
                Config.get('bittrexoptions').apisecret,
                Config.get('bittrexoptions').subaccountid
        );
    }
    static async balance(currency) {
        return await bittrexApiV3.balance(
                Config.get('bittrexoptions').apikey,
                Config.get('bittrexoptions').apisecret,
                Config.get('bittrexoptions').subaccountid,
                currency
        );
    }
    static async currencies() {
        return await bittrexApiV3.currencies(
                Config.get('bittrexoptions').apikey,
                Config.get('bittrexoptions').apisecret,
                Config.get('bittrexoptions').subaccountid
        );
    }
    static async currency(currency) {
        return await bittrexApiV3.currency(
                Config.get('bittrexoptions').apikey,
                Config.get('bittrexoptions').apisecret,
                Config.get('bittrexoptions').subaccountid,
                currency
        );
    }
    static async openDeposits() {
        return await bittrexApiV3.openDeposits(
                Config.get('bittrexoptions').apikey,
                Config.get('bittrexoptions').apisecret,
                Config.get('bittrexoptions').subaccountid
        );
    }
    static async closedDeposits() {
        return await bittrexApiV3.closedDeposits(
                Config.get('bittrexoptions').apikey,
                Config.get('bittrexoptions').apisecret,
                Config.get('bittrexoptions').subaccountid
        );
    }
    static async depositByTxId(id) {
        return await bittrexApiV3.depositByTxId(
                Config.get('bittrexoptions').apikey,
                Config.get('bittrexoptions').apisecret,
                Config.get('bittrexoptions').subaccountid,
                id
        );
    }
    static async depositId(id) {
        return await bittrexApiV3.depositId(
                Config.get('bittrexoptions').apikey,
                Config.get('bittrexoptions').apisecret,
                Config.get('bittrexoptions').subaccountid,
                id
        );
    }
    static async markets() {
        return await bittrexApiV3.markets(
                Config.get('bittrexoptions').apikey,
                Config.get('bittrexoptions').apisecret,
                Config.get('bittrexoptions').subaccountid
        );
    }
    static async marketSummaries() {
        return await bittrexApiV3.marketSummaries(
                Config.get('bittrexoptions').apikey,
                Config.get('bittrexoptions').apisecret,
                Config.get('bittrexoptions').subaccountid
        );
    }
    static async marketTickers() {
        return await bittrexApiV3.marketTickers(
                Config.get('bittrexoptions').apikey,
                Config.get('bittrexoptions').apisecret,
                Config.get('bittrexoptions').subaccountid
        );
    }
    static async marketBySymbol(marketSymbol) {
        return await bittrexApiV3.marketBySymbol(
                Config.get('bittrexoptions').apikey,
                Config.get('bittrexoptions').apisecret,
                Config.get('bittrexoptions').subaccountid,
                marketSymbol
        );
    }
    static async marketSymbolSummary(marketSymbol) {
        return await bittrexApiV3.marketSymbolSummary(
                Config.get('bittrexoptions').apikey,
                Config.get('bittrexoptions').apisecret,
                Config.get('bittrexoptions').subaccountid,
                marketSymbol
        );
    }
    static async marketSymbolOrderbook(marketSymbol) {
        return await bittrexApiV3.marketSymbolOrderbook(
                Config.get('bittrexoptions').apikey,
                Config.get('bittrexoptions').apisecret,
                Config.get('bittrexoptions').subaccountid,
                marketSymbol
        );
    }
    static async marketSymbolTrades(marketSymbol) {
        return await bittrexApiV3.marketSymbolTrades(
                Config.get('bittrexoptions').apikey,
                Config.get('bittrexoptions').apisecret,
                Config.get('bittrexoptions').subaccountid,
                marketSymbol
        );
    }
    static async closedOrder() {
        return await bittrexApiV3.closedOrder(
                Config.get('bittrexoptions').apikey,
                Config.get('bittrexoptions').apisecret,
                Config.get('bittrexoptions').subaccountid
        );
    }
    static async openOrder() {
        return await bittrexApiV3.openOrder(
                Config.get('bittrexoptions').apikey,
                Config.get('bittrexoptions').apisecret,
                Config.get('bittrexoptions').subaccountid
        );
    }
    static async orderId(id) {
        return await bittrexApiV3.orderId(
                Config.get('bittrexoptions').apikey,
                Config.get('bittrexoptions').apisecret,
                Config.get('bittrexoptions').subaccountid,
                id
        );
    }
    static async deleteOrder(id) {
        return await bittrexApiV3.deleteOrder(
                Config.get('bittrexoptions').apikey,
                Config.get('bittrexoptions').apisecret,
                Config.get('bittrexoptions').subaccountid,
                id
        );
    }
    static async newOrder(marketSymbol, direction, type, timeInForce, quantity, ceiling, limit, clientOrderId, useAwards) {
        return await bittrexApiV3.newOrder(
                Config.get('bittrexoptions').apikey,
                Config.get('bittrexoptions').apisecret,
                Config.get('bittrexoptions').subaccountid,
                marketSymbol,
                direction,
                type,
                timeInForce,
                quantity,
                ceiling,
                limit,
                clientOrderId,
                useAwards
        );
    }
    static async subaccounts() {
        return await bittrexApiV3.subaccounts(
                Config.get('bittrexoptions').apikey,
                Config.get('bittrexoptions').apisecret,
                Config.get('bittrexoptions').subaccountid
        );
    }
    static async sentTransfers() {
        return await bittrexApiV3.sentTransfers(
                Config.get('bittrexoptions').apikey,
                Config.get('bittrexoptions').apisecret,
                Config.get('bittrexoptions').subaccountid
        );
    }
    static async receivedTransfers() {
        return await bittrexApiV3.receivedTransfers(
                Config.get('bittrexoptions').apikey,
                Config.get('bittrexoptions').apisecret,
                Config.get('bittrexoptions').subaccountid
        );
    }
    static async transfersById(id) {
        return await bittrexApiV3.transfersById(
                Config.get('bittrexoptions').apikey,
                Config.get('bittrexoptions').apisecret,
                Config.get('bittrexoptions').subaccountid,
                id
        );
    }
    static async newTransfer(toSubaccountId, requestId, currencySymbol, amount, toMasterAccount) {
        return await bittrexApiV3.newTransfer(
                Config.get('bittrexoptions').apikey,
                Config.get('bittrexoptions').apisecret,
                Config.get('bittrexoptions').subaccountid,
                toSubaccountId,
                requestId,
                currencySymbol,
                amount,
                toMasterAccount
        );
    }
    static async openWithdrawals() {
        return await bittrexApiV3.openWithdrawals(
                Config.get('bittrexoptions').apikey,
                Config.get('bittrexoptions').apisecret,
                Config.get('bittrexoptions').subaccountid
        );
    }
    static async closedWithdrawals() {
        return await bittrexApiV3.closedWithdrawals(
                Config.get('bittrexoptions').apikey,
                Config.get('bittrexoptions').apisecret,
                Config.get('bittrexoptions').subaccountid
        );
    }
    static async withdrawalByTxId(id) {
        return await bittrexApiV3.withdrawalByTxId(
                Config.get('bittrexoptions').apikey,
                Config.get('bittrexoptions').apisecret,
                Config.get('bittrexoptions').subaccountid,
                id
        );
    }
    static async withdrawalById(id) {
        return await bittrexApiV3.withdrawalById(
                Config.get('bittrexoptions').apikey,
                Config.get('bittrexoptions').apisecret,
                Config.get('bittrexoptions').subaccountid,
                id
        );
    }
    static async deleteWithdrawals(id) {
        return await bittrexApiV3.deleteWithdrawals(
                Config.get('bittrexoptions').apikey,
                Config.get('bittrexoptions').apisecret,
                Config.get('bittrexoptions').subaccountid,
                id
        );
    }
    static async newWithdraw(currencySymbol, quantity, cryptoAddress, cryptoAddressTag) {
        return await bittrexApiV3.newWithdraw(
                Config.get('bittrexoptions').apikey,
                Config.get('bittrexoptions').apisecret,
                Config.get('bittrexoptions').subaccountid,
                currencySymbol,
                quantity,
                cryptoAddress,
                cryptoAddressTag
        );
    }
}

module.exports = Bittrex;