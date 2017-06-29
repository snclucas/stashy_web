



$('#login-form').submit(function(e) {
   console.log("dfsadadasdas");
		e.preventDefault();
  console.log("dfsadadasdas22222222");
  alert("gsddsdsf");
		$.ajax({
			type: 'POST',
			url: '/login',
			//	dataType: "json",
			async: true,
			data: $('#login-form').serialize(),
			success: function(data){
        console.log(data);
        window.location.href = data.redirect;
      }
		});
	})