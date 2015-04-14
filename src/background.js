// Fired when a captive portal is detected.
chrome.networking.config.onCaptivePortalDetected.addListener(
    function(networkInfo) {
  console.debug('onCaptivePortalDetected', networkInfo);
  getActiveUserCaptivePortals(function(captivePortals) {
    if (networkInfo.SSID in captivePortals) {
      // Let's authenticate against that known captive portal.
      authenticate(networkInfo, captivePortals[networkInfo.SSID]);
    } else {
      // Finish authentication since this captive portal is unknown.
      finishAuthentication(networkInfo.GUID, 'unhandled');
    }
  });
});

// Authenticate against a captive portal.
function authenticate(networkInfo, userData) {
  getCaptivePortals(function(captivePortals) {
    var captivePortal = captivePortals[networkInfo.SSID];
    var formData = new FormData();
    for (var data in captivePortal.formData) {
      formData.append(data, userData[data]);
    }
    var xhr = new XMLHttpRequest();
    xhr.open(captivePortal.method || "POST", captivePortal.url);
    xhr.onloadend = function() {
      if ((xhr.status !== 200) ||
          (xhr.responseText.indexOf(captivePortal.error) > 0)) {
        finishAuthentication(networkInfo.GUID, 'rejected');
        showModalNotification('Authentication error');
      } else {
        finishAuthentication(networkInfo.GUID, 'succeeded');
        showModalNotification('Authentication successful',
                              'You are now connected to ' + networkInfo.SSID);
      }
    };
    xhr.send(formData);
  });
}

// Notify that it finished a captive portal authentication attempt.
function finishAuthentication(guid, result) {
  console.debug('finishAuthentication', guid, result);
  chrome.networking.config.finishAuthentication(guid, result);
}

// Define network filters for the networks user has picked.
function setNetworkFilter() {
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

// Update network filter at load time and each time user changes networks.
setNetworkFilter();
chrome.storage.onChanged.addListener(setNetworkFilter);
