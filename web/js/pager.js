function init() {
    $.get('/landing/init', function(data) {
        render(data);
    });
}

function render(html) {
    $('#page').html(html);
    registerForms();
}

init();