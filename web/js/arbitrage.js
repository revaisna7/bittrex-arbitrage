function updateArbitrage(data) {
    document.getElementById('arbitrage').innerHTML = data;
}
var host = window.location.protocol + "//" + window.location.host + ':8443';
console.log(host);
var socket = io.connect(host, {secure: window.location.protocol === "http:"});
socket.on('connect', function (data) {
    console.log(data);
    socket.emit('arbitrage', 'index');

    socket.on('arbitrage', updateArbitrage);
});