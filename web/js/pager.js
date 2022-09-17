function init() {
    page('/arbitrage/arbitrage');
}

function page(action, elementId, callback) {
    var elementId = elementId || 'page';
    var callback = callback || undefined;
    console.log('Load page ' + action);
    $.get(action, function(data) {
        render(data, elementId);
        if(callback) {
            callback(data);
        }
    });
}

function render(html, elementId) {
    var elementId = elementId || 'page';
    $('#'+elementId).html(html);
    registerForms();
}

init();