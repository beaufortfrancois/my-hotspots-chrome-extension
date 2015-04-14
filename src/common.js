var ACTIVE_KEY = '__active';
var CAPTIVE_PORTALS_KEY = 'captivePortals';

function extractUrlParams(url) {
  var f = [];
  if (url.indexOf('?') <= 0) {
    return f;
  }
  var t = url.substring(url.indexOf('?')+1).split('&');
  for (var i=0; i<t.length; i++){
    var x = t[ i ].split('=');
    f[x[0]]=x[1];
  }
  return f;
}

function showModalNotification(title, message) {
  var options = {
    type: 'basic',
    title: title,
    message: message || '',
    iconUrl: chrome.runtime.getURL('images/icon128.png')
  }
  chrome.notifications.clear('id', function(wasCleared) {
    if (wasCleared) {
      chrome.notifications.update('id', options);
    } else {
      chrome.notifications.create('id', options);
    }
  });
}

function getCaptivePortals(callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', chrome.runtime.getURL('captive-portals.json'));
  xhr.responseType = 'json';
  xhr.onload = function() {
    callback(xhr.response);
  };
  xhr.send();
}

function getUserCaptivePortals(callback) {
  chrome.storage.sync.get(CAPTIVE_PORTALS_KEY, function(data) {
    callback(data.captivePortals || {});
  });
}

function getActiveUserCaptivePortals(callback) {
  getUserCaptivePortals(function(captivePortals) {
    for (var key in captivePortals) {
      if (captivePortals[key][ACTIVE_KEY]) {
        continue;
      }  
      delete(captivePortals[key]);
    }
    return callback(captivePortals);
  });
}

function setUserCaptivePortals(userCaptivePortals) {
  var object = {};
  object[CAPTIVE_PORTALS_KEY] = userCaptivePortals || {};
  chrome.storage.sync.set(object);
  console.log(object);
}
