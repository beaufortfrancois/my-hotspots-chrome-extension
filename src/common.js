var ACTIVE_KEY = '__active';

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

function getUserCaptivePortals(callback) {
  chrome.storage.sync.get('captivePortals', function(data) {
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
  chrome.storage.sync.set({'captivePortals': userCaptivePortals || {} });
}

function getSystemCaptivePortals(callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', chrome.runtime.getURL('captive-portals.json'));
  xhr.responseType = 'json';
  xhr.onload = function() {
    callback(xhr.response);
  };
  xhr.send();
}
