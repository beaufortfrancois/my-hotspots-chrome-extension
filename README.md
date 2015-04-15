My Hotspots Chrome OS Extension
===============================

My Hotspots is a Chrome OS Extension which makes your life easier:
- Store all your hotspots credentials
- Connect to your favorite hotspots seamlessly

It actually takes advantage of the [networking.config](https://developer.chrome.com/extensions/networking_config) API to authenticate to captive portals. 

Get it on the Chrome Web Store at https://chrome.google.com/webstore/detail/TODO

<img src="https://raw.githubusercontent.com/beaufortfrancois/my-hotspots-chrome-extension/master/screenshot.png">

## How to add a new captive portal in 2 steps

1. Add a 48px tall image named `captive-portal-ssid.png` to [src/images/portals/](https://github.com/beaufortfrancois/my-hotspots-chrome-extension/blob/master/src/images/portals)
2. Add a new captive portal config to [src/captive-portals.json](https://github.com/beaufortfrancois/my-hotspots-chrome-extension/blob/master/src/captive-portals.json) which follow these guidelines below:

#### Requires some user fields
```javascript
"My Captive Portal SSID": {
    "url": "https://my-captive-portal.com",
    "formData": {
      "login": {
      },
      "password": {
        "type": "password" // Will be masked in the UI
      }
    }
  }
```

#### Requires some hardcoded user fields
```javascript
"My Captive Portal SSID": {
    "url": "https://my-captive-portal.com",
    "formData": {
      "cgu": {
        "value": "on" // Will POST cgu=on to https://my-captive-portal.com
      }
    }
  }
```

#### Checks for errors contained in the HTTP response
```javascript
"My Captive Portal SSID": {
    "url": "https://my-captive-portal.com",
    "formData": {
    },
    "error": "ARGH SORRY" // Raises error if this string is found.
  }
```

#### Gather url parameters contained in the Captive Portal URL
```javascript
"My Captive Portal SSID": {
    "url": "https://my-captive-portal.com",
    "urlParams": [ "macAddress", "ipAddress", "token" ], // Will be included in formData.
    "formData": {
    }
  }
```

#### Redirect to a final URL contained in HTTP response after authentication
```javascript
"My Captive Portal SSID": {
    "url": "https://my-captive-portal.com",
    "redirectUrlRegex": "window.location = \"([^\"]*)", // RegEx capture here.
    "formData": {
    }
  }
```
