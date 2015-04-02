var myNetworks = [
  { Type: 'WiFi', SSID: 'FreeWiFi' }
];

chrome.networking.config.setNetworkFilter(myNetworks, function() {
    if (chrome.runtime.lastError) {
        // Handle Error
    }
});

chrome.networking.config.onCaptivePortalDetected.addListener(
  function(networkInfo) {
    var guid = networkInfo.GUID;
    console.log(guid);

    // Check at first whether we really care about this network.
    // This can look at additional network properties like BSSID that are not
    // supported in the filter.
    if (isBadNetwork(networkInfo)) {
      chrome.networking.config.finishAuthentication(guid, 'unhandled');
      return;
    }
    checkForMyCaptivePortalServer(function(serverStatus) {
      if (serverStatus == 'not-detected') {
        chrome.networking.config.finishAuthentication(guid, 'unhandled');
        return;
      }
      if (serverStatus == 'error') {
        chrome.networking.config.finishAuthentication(guid, 'failed');
        return;
      }

      // If required, interact with the user, e.g. for registration on first
      // usage. Credentials can be cached for subsequent authentications.
      ShowUIToRegisterUser(continueAuthentication.bind(null, guid));
    });
});

function continueAuthentication(guid, credentials) {
  if (!credentials) {
    chrome.networking.config.finishAuthentication(guid, 'failed');
  }
  AuthenticateToMyCaptivePortalServer(credentials, function(success) {
    chrome.networking.config.finishAuthentication(
        guid, success ? 'succeeded' : 'rejected');
  });
}
