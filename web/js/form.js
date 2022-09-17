function registerForms() {
    $("form").off('submit');
    $("form").submit(function (e) {
        e.preventDefault();
        var form = $(this);
        $.ajax({
            type: form.attr('method') ? form.attr('method') : 'GET',
            url: form.attr('action'),
            data: form.serialize(),
            beforeSend: function() {
                $("input[type='submit']").val("Loading...")
            },
            success: function (data) {
                render(data, form.attr('id'));
            }
        });
    });
}