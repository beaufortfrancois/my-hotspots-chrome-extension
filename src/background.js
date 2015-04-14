// Fired when a captive portal is detected.
chrome.networking.config.onCaptivePortalDetected.addListener(
    function(networkInfo) {
  console.debug('onCaptivePortalDetected', networkInfo);
  getActiveUserCaptivePortals(function(captivePortals) {
    if (networkInfo.SSID in captivePortals) {
      // Let's continueAuthentication against that known captive portal.
      continueAuthentication(networkInfo, captivePortals[networkInfo.SSID]);
    } else {
      // Finish authentication since this captive portal is unknown.
      finishAuthentication(networkInfo, 'unhandled');
    }
  });
});

// Authenticate against a captive portal.
function continueAuthentication(networkInfo, userData) {
  getCaptivePortals(function(captivePortals) {
    var captivePortal = captivePortals[networkInfo.SSID];

    function authenticate() {
      var formData = new FormData();
      for (var data in captivePortal.formData) {
        formData.append(data, userData[data] || captivePortal.formData[data].value);
      }
      var xhr = new XMLHttpRequest();
      xhr.open(captivePortal.method || "POST", captivePortal.url);
      xhr.onloadend = function() {
        if ((xhr.status !== 200) ||
            (xhr.responseText.indexOf(captivePortal.error) > 0)) {
          finishAuthentication(networkInfo, 'rejected');
        } else {
          if (captivePortal.redirectUrlRegex) {
            var reg = new RegExp(captivePortal.redirectUrlRegex);
            var match = reg.exec(xhr.responseText);
            if (match.length !== 2) {
              finishAuthentication(networkInfo, 'rejected');
            } else {
              var redirectXhr = new XMLHttpRequest();
              redirectXhr.open('GET', match[1]);
              redirectXhr.onloadend = function() {
                // Ignore consciously errors there.
                finishAuthentication(networkInfo, 'succeeded');
              }
              redirectXhr.send();
            }
          } else {
            finishAuthentication(networkInfo, 'succeeded');
          }
        }
      };
      xhr.send(formData);
    }

    if (!captivePortal.urlParams) {
      authenticate();
    } else {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', 'http://www.gstatic.com/generate_204');
      xhr.onloadend = function() {
        if (xhr.status !== 200) {
          finishAuthentication(networkInfo, 'unhandled');
          return;
        }
        var urlParams = extractUrlParams(xhr.responseURL);
        captivePortal.urlParams.forEach(function(urlParam) {
          captivePortal.formData[urlParam] = {
            'value': urlParams[urlParam]
          };
        });
        authenticate();
      }
      xhr.send();
    }
  });
}

// Notify that it finished a captive portal authentication attempt.
function finishAuthentication(networkInfo, result) {
  console.debug('finishAuthentication', networkInfo.SSID, result);
  chrome.networking.config.finishAuthentication(networkInfo.GUID, result, function() {
    if (chrome.runtime.lastError || result === 'rejected') {
      showModalNotification('Authentication error');
    } else if (result === 'succeeded') {
      showModalNotification('Authentication successful',
                            'You are now connected to ' + networkInfo.SSID);
    }
  });
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
