$('#tab ul li[data-for="currencies"]').click(function(e){
   page('currency/config', 'currencies'); 
});
$('table tr').click(function(e) {
    alert(1);
    $(this).find('input').prop('checked', !$(this).find('input').prop('checked'));
})