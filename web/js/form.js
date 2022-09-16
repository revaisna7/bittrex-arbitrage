function registerForms() {
    $("form").off('submit');
    $("form").submit(function (e) {
        e.preventDefault();
        var form = $(this);
        $.ajax({
            type: form.attr('method') ? form.attr('method') : 'GET',
            url: form.attr('action'),
            data: form.serialize(),
            success: function (data)
            {
                render(data);
            }
        });
    });
}