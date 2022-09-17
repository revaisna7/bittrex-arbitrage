function init() {
    page('/arbitrage/arbitrage');
}

function page(action, elementId) {
    var elementId = elementId || 'page';
    console.log('Load page ' + action );
    $.get(action, function(data) {
        render(data, elementId);
    });
}

function render(html, elementId) {
    var elementId = elementId || 'page';
    $('#'+elementId).html(html);
    registerForms();
}

init();