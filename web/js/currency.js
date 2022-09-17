$('#tab ul li[data-for="currencies"]').click(function (e) {
    page('currency/config', 'currencies', registerCheckboxes);
});

function registerCheckboxes() {
    $('table tr').click(function (e) {
        $(this).find('input').prop('checked', !$(this).find('input').prop('checked'));
    });
}