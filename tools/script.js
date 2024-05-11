$(document).ready(function () {
  $("#input").on("input", function () {
    validateInput($(this).val());
  });

  $("#paste-btn").on("click", function () {
    navigator.clipboard.readText().then(function (clipText) {
      $("#input").val(clipText);
      validateInput(clipText);
    });
  });

  function validateInput(inputvalue) {
    var cleanedValue = inputvalue.replace(/\D/g, '');
    var lastTenDigits = cleanedValue.slice(-10);

    if (lastTenDigits.length === 10) {
      $("#wa-link").attr("href", "https://wa.me/91" + lastTenDigits).removeClass("disabled");
      $(".number").html("+91 " + lastTenDigits);
      $("#tc-link").attr("href", "https://www.truecaller.com/search/in/" + lastTenDigits).removeClass("disabled");
      $(".logo-btn").removeClass("desaturate");
    } else {
      $("#wa-link, #tc-link").addClass("disabled").removeAttr("href");
      $(".logo-btn").addClass("desaturate");
    }
  }
});