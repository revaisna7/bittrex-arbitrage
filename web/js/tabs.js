$('#tab ul li').click(function() {
    $('#tab ul li').removeClass('active');
    $(this).addClass('active');
    $('#tabContent > div').hide();
    $('#' + $(this).attr('data-for')).show();
});

$('#tab ul li:first').click();