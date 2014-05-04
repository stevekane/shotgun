(function (window, undefined) {
  var captureForm = $("#captureForm")
    , input = $("#urlInput")
    , image = $("#targetImage")
    , url = "http://localhost:8080/capture";

  captureForm.submit(function (e) {
    e.preventDefault(); 

    var searchUrl = input.val();
    var payload = {
      url: input.val() 
    };

    $.ajax({
      type: "POST",
      url: url,
      contentType: "application/json",
      data: JSON.stringify(payload),
      dataType: "json"
    })
    .success(function (result) {
      image.attr({
        src: "data:image/png;base64, " + result.image
      });

    })
    .fail(function (err) {
      console.log(err); 
    });
  });

})(window);
