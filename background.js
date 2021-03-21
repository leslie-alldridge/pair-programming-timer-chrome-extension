// Timer set up
let TIME_LIMIT = 0;
let timePassed = 0;
let timeLeft = TIME_LIMIT;
let timerInterval = null;
// Set badge color to green
chrome.browserAction.setBadgeBackgroundColor({ color: 'green' });

// Set up message listener so we can communicate with popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(request);
  if (request.time) {
    sendResponse({ data: true });
    // Start the countdown timer
    TIME_LIMIT = request.time;
    startTimer(TIME_LIMIT);
  } else if (request.getItem) {
    console.log('getting item');
    (async () => {
      chrome.storage.local.get('key', (data) => {
        console.log(data);
        sendResponse({ data: data.key });
      });
    })();

    return true;
  } else if (request.reset) {
    // reset timer
    onTimesUp();
    sendResponse({ data: true });
  }
  return true;
});

// Clears the set interval so we don't have increasing intervals on second runs
onTimesUp = () => {
  clearInterval(timerInterval);
  TIME_LIMIT = 0;
  timePassed = 0;
  timeLeft = TIME_LIMIT;
  timerInterval = null;
  chrome.browserAction.setBadgeText({ text: '00:00' });
  chrome.browserAction.setBadgeBackgroundColor({ color: 'green' });
  chrome.storage.local.set({ key: '00:00' }, () => {
    if (chrome.runtime.lastError) {
      console.error(
        'Error setting ' +
          key +
          ' to ' +
          JSON.stringify(data) +
          ': ' +
          chrome.runtime.lastError.message
      );
    }
  });
};

// Time to start the actual timer and save our state as well as update the extension badge countdown
startTimer = (TIME_LIMIT) => {
  // persist users time limit
  chrome.storage.local.set({ limit: TIME_LIMIT }, () => {
    if (chrome.runtime.lastError) {
      console.error(
        'Error setting ' +
          key +
          ' to ' +
          JSON.stringify(data) +
          ': ' +
          chrome.runtime.lastError.message
      );
    }
  });

  // Generate warning and alert thresholds and color scheme
  WARNING_THRESHOLD = TIME_LIMIT / 3;
  ALERT_THRESHOLD = TIME_LIMIT / 6;

  const COLOR_CODES = {
    info: {
      color: 'green',
    },
    warning: {
      color: 'orange',
      threshold: WARNING_THRESHOLD,
    },
    alert: {
      color: 'red',
      threshold: ALERT_THRESHOLD,
    },
  };

  timerInterval = setInterval(() => {
    timePassed = timePassed += 1;
    timeLeft = TIME_LIMIT - timePassed;

    chrome.browserAction.setBadgeText({ text: String(formatTime(timeLeft)) });

    chrome.storage.local.set({ key: timeLeft }, () => {
      if (chrome.runtime.lastError) {
        console.error(
          'Error setting ' +
            key +
            ' to ' +
            JSON.stringify(data) +
            ': ' +
            chrome.runtime.lastError.message
        );
      }
    });

    setBadgeColor(timeLeft, COLOR_CODES);

    if (timeLeft === 0 || timeLeft < 0) {
      onTimesUp();
    }
  }, 1000);
};

// Assists with formatting between minutes and seconds
formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  let seconds = time % 60;

  if (seconds < 10) seconds = `0${seconds}`;

  return `${minutes}:${seconds}`;
};

// Changes the extension badge color depending on our warning and alert thresholds
setBadgeColor = (timeLeft, COLOR_CODES) => {
  const { alert, warning } = COLOR_CODES;
  if (timeLeft <= alert.threshold) {
    chrome.browserAction.setBadgeBackgroundColor({ color: 'red' });
  } else if (timeLeft <= warning.threshold) {
    chrome.browserAction.setBadgeBackgroundColor({ color: 'orange' });
  }
};

chrome.storage.onChanged.addListener(function (changes, namespace) {
  for (var key in changes) {
    var storageChange = changes[key];
    console.log(
      'Storage key "%s" in namespace "%s" changed. ' +
        'Old value was "%s", new value is "%s".',
      key,
      namespace,
      storageChange.oldValue,
      storageChange.newValue
    );
  }
});
