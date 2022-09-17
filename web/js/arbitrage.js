function updateArbitrage(data) {
    data = JSON.parse(data);
    updateRoutes(data.routes);
    updateBalances(data.balances);
    updateTrades(data.trades);
    updateOrders(data.orders);
}
function updateRoutes(data) {
    $('#routes').html(data);
}
function updateBalances(data) {
    $('#balances').html(data);
}
function updateTrades(data) {
    $('#trades').html(data);
}
function updateOrders(data) {
    $('#orders').html(data);
}

var host = window.location.protocol + "//" + window.location.host + ':8443';
console.log(host);
var socket = io.connect(host, {secure: window.location.protocol === "http:"});
socket.on('connect', function (data) {
    console.log(data);
    socket.emit('arbitrage', 'index');

    socket.on('arbitrage', updateArbitrage);
});