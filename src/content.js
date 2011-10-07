(function() {

if(!document.getElementById('doc')) {
  return;
}

var filters = [];

var port = chrome.extension.connect({ name: 'TwitterTimelineFilter' });
port.onMessage.addListener(function(m) {
  switch(m.type) {
    case 'options.load':
      filters = m.options.filters;
      break;
  }
});
port.postMessage({ type: 'options.load' });

window.onload = function() {
  Array.prototype.forEach.call(document.querySelectorAll('.stream-item'), process);
};

document.addEventListener('DOMNodeInserted', function(e) {
  var element = e.target;
  if((element.className || '').split(' ').indexOf('stream-item') == -1) {
    return;
  }
  process(element);
}, false);

var process = function(element) {
  var tweetContent = element.querySelector('.stream-item-content .tweet-content');
  var tweet = tweetContent.parentNode.parentNode;

  var text = tweetContent.querySelector('.tweet-text').textContent;
  var screenName = tweetContent.querySelector('.tweet-screen-name').textContent;
  var fullName = tweetContent.querySelector('.tweet-full-name').textContent;

  if(match(text, screenName, fullName)) {
    element.style.display = 'none';
  }
};

var match = function(text, screenName, fullName) {
  return filters.some(function(filter) {
    var target = null;
    switch(filter.type) {
      case 'text':
        target = text;
        break;
      case 'screenName':
        target = screenName;
        break;
      case 'fullName':
        target = fullName;
        break;
      default:
        return false;
    }
    var pattern = filter.pattern;
    if(filter.regexp) {
      return RegExp(pattern).test(target);
    }
    else {
      return target.indexOf(pattern) != -1;
    }
  });
};

})();

