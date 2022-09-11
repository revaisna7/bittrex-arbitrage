const Configurable = require('../../system/Configurable.js');
const bittrexApiV3 = require('./BittrexRestApi.js');

class Bittrex extends Configurable {

    static async account() {
        return await bittrexApiV3.account(
                Bittrex.config('apikey'),
                Bittrex.config('apisecret'),
                Bittrex.config('subaccountid')
                );
    }
    static async accountVolume() {
        return await bittrexApiV3.accountVolume(
                Bittrex.config('apikey'),
                Bittrex.config('apisecret'),
                Bittrex.config('subaccountid')
                );
    }
    static async addresses() {
        return await bittrexApiV3.addresses(
                Bittrex.config('apikey'),
                Bittrex.config('apisecret'),
                Bittrex.config('subaccountid')
                );
    }
    static async address(currency) {
        return await bittrexApiV3.address(
                Bittrex.config('apikey'),
                Bittrex.config('apisecret'),
                Bittrex.config('subaccountid'),
                currency
                );
    }
    static async newaddress(currency) {
        return await bittrexApiV3.newaddress(
                Bittrex.config('apikey'),
                Bittrex.config('apisecret'),
                Bittrex.config('subaccountid'),
                currency
                );
    }
    static async balances() {
        return await bittrexApiV3.balances(
                Bittrex.config('apikey'),
                Bittrex.config('apisecret'),
                Bittrex.config('subaccountid')
                );
    }
    static async balance(currency) {
        return await bittrexApiV3.balance(
                Bittrex.config('apikey'),
                Bittrex.config('apisecret'),
                Bittrex.config('subaccountid'),
                currency
                );
    }
    static async currencies() {
        return await bittrexApiV3.currencies(
                Bittrex.config('apikey'),
                Bittrex.config('apisecret'),
                Bittrex.config('subaccountid')
                );
    }
    static async currency(currency) {
        return await bittrexApiV3.currency(
                Bittrex.config('apikey'),
                Bittrex.config('apisecret'),
                Bittrex.config('subaccountid'),
                currency
                );
    }
    static async openDeposits() {
        return await bittrexApiV3.openDeposits(
                Bittrex.config('apikey'),
                Bittrex.config('apisecret'),
                Bittrex.config('subaccountid')
                );
    }
    static async closedDeposits() {
        return await bittrexApiV3.closedDeposits(
                Bittrex.config('apikey'),
                Bittrex.config('apisecret'),
                Bittrex.config('subaccountid')
                );
    }
    static async depositByTxId(id) {
        return await bittrexApiV3.depositByTxId(
                Bittrex.config('apikey'),
                Bittrex.config('apisecret'),
                Bittrex.config('subaccountid'),
                id
                );
    }
    static async depositId(id) {
        return await bittrexApiV3.depositId(
                Bittrex.config('apikey'),
                Bittrex.config('apisecret'),
                Bittrex.config('subaccountid'),
                id
                );
    }
    static async markets() {
        return await bittrexApiV3.markets(
                Bittrex.config('apikey'),
                Bittrex.config('apisecret'),
                Bittrex.config('subaccountid')
                );
    }
    static async marketSummaries() {
        return await bittrexApiV3.marketSummaries(
                Bittrex.config('apikey'),
                Bittrex.config('apisecret'),
                Bittrex.config('subaccountid')
                );
    }
    static async marketTickers() {
        return await bittrexApiV3.marketTickers(
                Bittrex.config('apikey'),
                Bittrex.config('apisecret'),
                Bittrex.config('subaccountid')
                );
    }
    static async marketBySymbol(marketSymbol) {
        return await bittrexApiV3.marketBySymbol(
                Bittrex.config('apikey'),
                Bittrex.config('apisecret'),
                Bittrex.config('subaccountid'),
                marketSymbol
                );
    }

    static async marketSymbolTicker(marketSymbol) {
        return await bittrexApiV3.marketSymbolTicker(
                Bittrex.config('apikey'),
                Bittrex.config('apisecret'),
                Bittrex.config('subaccountid'),
                marketSymbol
                );
    }
    static async marketSymbolSummary(marketSymbol) {
        return await bittrexApiV3.marketSymbolSummary(
                Bittrex.config('apikey'),
                Bittrex.config('apisecret'),
                Bittrex.config('subaccountid'),
                marketSymbol
                );
    }
    static async marketSymbolOrderbook(marketSymbol) {
        return await bittrexApiV3.marketSymbolOrderbook(
                Bittrex.config('apikey'),
                Bittrex.config('apisecret'),
                Bittrex.config('subaccountid'),
                marketSymbol
                );
    }
    static async marketSymbolTrades(marketSymbol) {
        return await bittrexApiV3.marketSymbolTrades(
                Bittrex.config('apikey'),
                Bittrex.config('apisecret'),
                Bittrex.config('subaccountid'),
                marketSymbol
                );
    }
    static async closedOrder() {
        return await bittrexApiV3.closedOrder(
                Bittrex.config('apikey'),
                Bittrex.config('apisecret'),
                Bittrex.config('subaccountid')
                );
    }
    static async openOrder() {
        return await bittrexApiV3.openOrder(
                Bittrex.config('apikey'),
                Bittrex.config('apisecret'),
                Bittrex.config('subaccountid')
                );
    }
    static async orderId(id) {
        return await bittrexApiV3.orderId(
                Bittrex.config('apikey'),
                Bittrex.config('apisecret'),
                Bittrex.config('subaccountid'),
                id
                );
    }
    static async deleteOrder(id) {
        return await bittrexApiV3.deleteOrder(
                Bittrex.config('apikey'),
                Bittrex.config('apisecret'),
                Bittrex.config('subaccountid'),
                id
                );
    }
    static async newOrder(marketSymbol, direction, type, timeInForce, quantity, ceiling, limit, clientOrderId, useAwards) {
        return await bittrexApiV3.newOrder(
                Bittrex.config('apikey'),
                Bittrex.config('apisecret'),
                Bittrex.config('subaccountid'),
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
                Bittrex.config('apikey'),
                Bittrex.config('apisecret'),
                Bittrex.config('subaccountid')
                );
    }
    static async sentTransfers() {
        return await bittrexApiV3.sentTransfers(
                Bittrex.config('apikey'),
                Bittrex.config('apisecret'),
                Bittrex.config('subaccountid')
                );
    }
    static async receivedTransfers() {
        return await bittrexApiV3.receivedTransfers(
                Bittrex.config('apikey'),
                Bittrex.config('apisecret'),
                Bittrex.config('subaccountid')
                );
    }
    static async transfersById(id) {
        return await bittrexApiV3.transfersById(
                Bittrex.config('apikey'),
                Bittrex.config('apisecret'),
                Bittrex.config('subaccountid'),
                id
                );
    }
    static async newTransfer(toSubaccountId, requestId, currencySymbol, amount, toMasterAccount) {
        return await bittrexApiV3.newTransfer(
                Bittrex.config('apikey'),
                Bittrex.config('apisecret'),
                Bittrex.config('subaccountid'),
                toSubaccountId,
                requestId,
                currencySymbol,
                amount,
                toMasterAccount
                );
    }
    static async openWithdrawals() {
        return await bittrexApiV3.openWithdrawals(
                Bittrex.config('apikey'),
                Bittrex.config('apisecret'),
                Bittrex.config('subaccountid')
                );
    }
    static async closedWithdrawals() {
        return await bittrexApiV3.closedWithdrawals(
                Bittrex.config('apikey'),
                Bittrex.config('apisecret'),
                Bittrex.config('subaccountid')
                );
    }
    static async withdrawalByTxId(id) {
        return await bittrexApiV3.withdrawalByTxId(
                Bittrex.config('apikey'),
                Bittrex.config('apisecret'),
                Bittrex.config('subaccountid'),
                id
                );
    }
    static async withdrawalById(id) {
        return await bittrexApiV3.withdrawalById(
                Bittrex.config('apikey'),
                Bittrex.config('apisecret'),
                Bittrex.config('subaccountid'),
                id
                );
    }
    static async deleteWithdrawals(id) {
        return await bittrexApiV3.deleteWithdrawals(
                Bittrex.config('apikey'),
                Bittrex.config('apisecret'),
                Bittrex.config('subaccountid'),
                id
                );
    }
    static async getAccountFees() {
        return await bittrexApiV3.getAccountFees(
                Bittrex.config('apikey'),
                Bittrex.config('apisecret'),
                Bittrex.config('subaccountid')
                );
    }
    static async getAccountFeesByMarketSymbol(marketSymbol) {
        return await bittrexApiV3.getAccountFeesByMarketSymbol(
                Bittrex.config('apikey'),
                Bittrex.config('apisecret'),
                Bittrex.config('subaccountid'),
                marketSymbol
                );
    }
}

module.exports = Bittrex;