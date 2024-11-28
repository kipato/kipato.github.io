// Add class to html element if NOT in iframe
if (window.self === window.top) {
  document.documentElement.classList.add('no-iframe');
}
