function setupNetworkFilter() {
  getActiveUserCaptivePortals(function(captivePortals) {
    var filter = [];
    for (var captivePortal in captivePortals) {
      filter.push({ 'Type': 'WiFi', 'SSID': captivePortal });
    }
    chrome.networking.config.setNetworkFilter(filter, function() {
      if (!chrome.runtime.lastError) {
        console.debug('setNetworkFilter', filter);
      }
    });
  });
}

chrome.networking.config.onCaptivePortalDetected.addListener(function(networkInfo) {
  console.debug('onCaptivePortalDetected', networkInfo);
  getActiveUserCaptivePortals(function(captivePortals) {
    if (networkInfo.SSID in captivePortals) {
      authenticate(networkInfo, captivePortals[networkInfo.SSID]);
    } else {
      chrome.networking.config.finishAuthentication(networkInfo.GUID, 'unhandled');
    }
  });
});

function authenticate(networkInfo, userData) {
  getSystemCaptivePortals(function(captivePortals) {
    var captivePortal = captivePortals[networkInfo.SSID];
      
    var formData = new FormData();
    for (var data in captivePortal.auth.formData) {
      formData.append(data, userData[data]);
    }
    var xhr = new XMLHttpRequest();
    xhr.open(captivePortal.auth.method || "POST", captivePortal.auth.url);
    xhr.onloadend = function() {
      if ((xhr.status !== 200) ||
          (xhr.responseText.indexOf(captivePortal.auth.error) > 0)) {
        chrome.networking.config.finishAuthentication(networkInfo.GUID, 'rejected', function() {
          showModalNotification('Authentication error');
        });
      } else {
        chrome.networking.config.finishAuthentication(networkInfo.GUID, 'succeeded', function() {
          showModalNotification('Authentication successful', 'You are now connected to ' + networkInfo.SSID);
        });
      }
    };
    xhr.send(formData);
    
  });
}

setupNetworkFilter();
chrome.storage.onChanged.addListener(setupNetworkFilter);
