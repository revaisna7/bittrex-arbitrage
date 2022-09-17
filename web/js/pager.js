function init() {
    page('/arbitrage/arbitrage');
}

function page(action, elementId, callback) {
    var elementId = elementId || 'page';
    var callback = callback || undefined;
    if (elementId) {
        $('#' + elementId).html('<p>Loading...</p>');
        $.get(action, function (data) {
            render(data, elementId);
            if (callback) {
                callback(data);
            }
        });
    }
}

function render(html, elementId) {
    var elementId = elementId || 'page';
    $('#' + elementId).html(html);
    registerForms();
}

init();