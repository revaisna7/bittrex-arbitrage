$('#tab ul li').click(function() {
    $('#tab ul li').removeClass('active');
    $(this).addClass('active');
    $('#tabContent > div').hide();
    $('#' + $(this).attr('data-for')).show();
});

$('#tab ul li:first').click();

$('#tab ul li[data-for="currencies"]').click(function (e) {
    page('currency/config', 'currencies', registerCheckboxes);
});
$('#tab ul li[data-for="markets"]').click(function (e) {
    page('market/config', 'markets', registerCheckboxes);
});
$('#tab ul li[data-for="config"]').click(function (e) {
    page('config/config', 'config', registerCheckboxes);
});