$(document).ready(function () {
  $("#button").click(function (e) {
    var inputvalue = $("#input").val();
    // window.open('http://wa.me/91' + inputvalue);
    $("#wa-link").attr("href", "https://wa.me/91" + inputvalue);
    $(".number").html("+91 " + inputvalue);
    $("#tc-link").attr("href", "https://www.truecaller.com/search/in/" + inputvalue);
  });
});