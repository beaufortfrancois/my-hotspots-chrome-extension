(function() {
  
var xhr = new XMLHttpRequest();
xhr.open('GET', 'captive-portals.json');
xhr.responseType = 'json';
xhr.onload = function() {
  getUserCaptivePortals(function(userCaptivePortals) {
    var captivePortals= xhr.response;
    for (var captivePortalKey in captivePortals) {
      var captivePortal = captivePortals[captivePortalKey];
      var row = document.createElement('div');
  
      // Add logo first.
      var img = document.createElement('img');
      img.src = chrome.runtime.getURL('/images/portals/' + captivePortalKey + '.png');
      row.appendChild(img);
  
      // Add form input fields.
      for (var formDataKey in captivePortal.auth.formData) {
        var formData = captivePortal.auth.formData[formDataKey];
        if (formData.value) {
          continue;
        }
        var formInput = document.createElement('input');
        formInput.type = formData.type || 'text';
        formInput.placeholder = formDataKey;
        formInput.name = formDataKey;
        formInput.dataset.captivePortalKey = captivePortalKey;
        if (userCaptivePortals[captivePortalKey] && userCaptivePortals[captivePortalKey][formDataKey]) {
          formInput.value = userCaptivePortals[captivePortalKey][formDataKey];
        }
        formInput.addEventListener('input', saveUserInput);
        row.appendChild(formInput);
      }
      
      // Add checkbox.
      var checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.name = ACTIVE_KEY;
      checkbox.dataset.captivePortalKey = captivePortalKey;
      checkbox.dataset.authUrl = captivePortal.auth.url;
      if (userCaptivePortals[captivePortalKey] &&
          userCaptivePortals[captivePortalKey][checkbox.name]) {
        chrome.permissions.contains({origins: [captivePortal.auth.url]}, function(result) {
          this.checked = result;
        }.bind(checkbox));
      };
      checkbox.addEventListener('click', toggleCaptivePortal);
      row.appendChild(checkbox); 
      
      document.body.appendChild(row);
    }
  });
};
xhr.send();

function saveUserInput(event) {
  var input = event.target;
  var captivePortalKey = input.dataset.captivePortalKey; 
  getUserCaptivePortals(function(userCaptivePortals) {
    if (!userCaptivePortals[captivePortalKey]) {
      userCaptivePortals[captivePortalKey] = {};
    }
    if (input.type === 'checkbox') {
      userCaptivePortals[captivePortalKey][input.name] = input.checked;
    } else {
      userCaptivePortals[captivePortalKey][input.name] = input.value.trim();
    }
    setUserCaptivePortals(userCaptivePortals);
  });
}

function toggleCaptivePortal(event) {
  var input = event.target;
  if (input.checked) { 
    chrome.permissions.request({origins: [input.dataset.authUrl]}, function(granted) {
      if (!granted) {
        input.checked = false;
      }
      saveUserInput(event);
    });
  } else {
    chrome.permissions.remove({origins: [input.dataset.authUrl]}, function(removed) {
      if (!removed) {
        input.checked = true;
      }
      saveUserInput(event);
    });
  }
}
  
})();
