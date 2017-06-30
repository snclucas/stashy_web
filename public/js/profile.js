
$(function() {
  $("#add_endpoint_form").submit(function(e) {
    e.preventDefault();
    $.ajax({
      type: 'POST',
      url: '/publicendpoints/add',
      dataType: "json",
      data: $("#add_endpoint_form").serialize(),
      async: true,
      success: function(data) {
        console.log(data);
        window.location.href = data.redirect;
      }
    });
  })
})


$(function() {
  $("#add_token_form").submit(function(e) {
    e.preventDefault();
    $.ajax({
      type: 'POST',
      url: '/tokens/add',
      dataType: "json",
      data: $("#add_token_form").serialize(),
      async: true,
      success: function(data) {
        console.log(data);
        window.location.href = data.redirect;
      }
    });
  })
})



	$('#dataPrivacy').click(function() {
    
    var privacy = $(this).find('.btn-default').text();
    
    $(this).find('.btn').toggleClass('active');  
    
    if ($(this).find('.btn-primary').size()>0) {
    	$(this).find('.btn').toggleClass('btn-primary');
    }
    if ($(this).find('.btn-danger').size()>0) {
    	$(this).find('.btn').toggleClass('btn-danger');
    }
    if ($(this).find('.btn-success').size()>0) {
    	$(this).find('.btn').toggleClass('btn-success');
    }
    if ($(this).find('.btn-info').size()>0) {
    	$(this).find('.btn').toggleClass('btn-info');
    }
    
    $(this).find('.btn').toggleClass('btn-default');
    
    $.ajax({
      type: 'POST',
      url: '/setdataprivacy/'+privacy.toLowerCase(),
      dataType: "json",
      async: true,
      success: function(data) {
        console.log(data);
      }
    });
});


$('#addDatestampToPosts').click(function() {
    var datestamp = $(this).find('.btn-default').text();
	  datestamp = datestamp.toLowerCase() === 'yes'?true:false;
    
    $(this).find('.btn').toggleClass('active');  
    
    if ($(this).find('.btn-primary').size()>0) {
    	$(this).find('.btn').toggleClass('btn-primary');
    }
    if ($(this).find('.btn-danger').size()>0) {
    	$(this).find('.btn').toggleClass('btn-danger');
    }
    if ($(this).find('.btn-success').size()>0) {
    	$(this).find('.btn').toggleClass('btn-success');
    }
    if ($(this).find('.btn-info').size()>0) {
    	$(this).find('.btn').toggleClass('btn-info');
    }
    
    $(this).find('.btn').toggleClass('btn-default');
    
    $.ajax({
      type: 'POST',
      url: '/set_add_datestamp/'+datestamp,
      dataType: "json",
      async: true,
      success: function(data) {
        console.log(data);
      }
    });
});

