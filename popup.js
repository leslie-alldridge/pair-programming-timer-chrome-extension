// Gather elements from popup.html
let startSessionBtn = document.getElementById('startSession');
let endSession = document.getElementById('endSession');
let sessionTimer = document.getElementById('sessionTimer');
let description = document.getElementById('description');
let inputDisplay = document.getElementById('inputDisplay');
let title = document.getElementById('title');
let rule = document.getElementById('rule');

// Timer set up
const FULL_DASH_ARRAY = 283;
let TIME_LIMIT = 0;
let timePassed = 0;
let timeLeft = TIME_LIMIT;
let timerInterval = null;

chrome.runtime.sendMessage({ getItem: true }, function (response) {
  console.log(response);
  if (response.data > 0) {
    chrome.storage.local.get('limit', (data) => {
      console.log(data);
      if (data) {
        TIME_LIMIT = data.limit;
        timePassed = TIME_LIMIT - response.data;
        console.log(timePassed);
      }
    });
    WARNING_THRESHOLD = TIME_LIMIT / 4;
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
    renderTimerHtml(response.data, COLOR_CODES);
    startTimer(COLOR_CODES);
    // Hide start button and other fields from the landing page
    startSessionBtn.style.display = 'none';
    description.style.display = 'none';
    inputDisplay.style.display = 'none';
    title.style.display = 'none';
    rule.style.display = 'none';
    // Display timer options and end session button
    sessionTimer.style.display = 'block';
    endSession.style.visibility = 'visible';
  } else {
    // Timer set up
    TIME_LIMIT = 0;
    timePassed = 0;
    timeLeft = TIME_LIMIT;
    timerInterval = null;
    onTimesUp();
    resetToDefault();
  }
});

startSessionBtn.addEventListener('click', function () {
  // Hide start button and other fields from the landing page
  startSessionBtn.style.display = 'none';
  description.style.display = 'none';
  inputDisplay.style.display = 'none';
  title.style.display = 'none';
  rule.style.display = 'none';

  // Display timer options and end session button
  sessionTimer.style.display = 'block';
  endSession.style.visibility = 'visible';

  // Retrieve user input from the first page and convert into minutes
  TIME_LIMIT = Number(inputDisplay.value) * 60;
  chrome.runtime.sendMessage({ time: TIME_LIMIT }, function (response) {
    console.log(response.data);
  });
  // Set warning and error values based on user input

  WARNING_THRESHOLD = TIME_LIMIT / 4;
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

  // Render timer and start the countdown
  renderTimerHtml(TIME_LIMIT, COLOR_CODES);

  startTimer(COLOR_CODES, TIME_LIMIT);
});

endSession.addEventListener('click', () => {
  // reset timer
  onTimesUp();
  resetToDefault();
});

resetToDefault = () => {
  // Reset our background task
  chrome.runtime.sendMessage({ reset: true }, function (response) {
    console.log('reset background task');
    if (response) {
      console.log(response);
    }
  });
  // Change background to use our active class
  sessionTimer.style.display = 'none';
  document.body.style.backgroundColor = '#121212';
  // Hide start button and description
  startSessionBtn.style.display = 'block';
  description.style.display = 'block';
  inputDisplay.style.display = 'block';
  title.style.display = 'block';
  rule.style.display = 'block';
  // Display timer options and end button
  endSession.style.visibility = 'hidden';

  // reset timer back to defaults
  timePassed = 0;
  timeLeft = TIME_LIMIT;
  timerInterval = null;
  remainingPathColor = 'green';
};

renderTimerHtml = (TIME_LIMIT, COLOR_CODES) => {
  safelySetInnerHtml(formatTime(TIME_LIMIT), 'base-timer-label');

  // Update colors if we have a timer already running
  setRemainingPathColor(TIME_LIMIT, COLOR_CODES);
};

function onTimesUp() {
  clearInterval(timerInterval);
}

function startTimer() {
  timerInterval = setInterval(() => {
    timePassed = timePassed += 1;
    timeLeft = TIME_LIMIT - timePassed;

    safelySetInnerHtml(`${formatTime(timeLeft)}`, 'base-timer-label');
    // document.getElementById('base-timer-label').innerHTML = formatTime(
    //   timeLeft
    // );

    setCircleDasharray();

    // Updates colors in popup.html if user has closed and reopened the extension popup
    chrome.storage.local.get('key', (timeRemaining) => {
      chrome.storage.local.get('threshold', (data) => {
        setRemainingPathColor(timeRemaining.key, data.threshold);
      });
    });

    if (timeLeft === 0) {
      onTimesUp();
    }
  }, 1000);
}

function formatTime(time) {
  const minutes = Math.floor(time / 60);
  let seconds = time % 60;

  if (seconds < 10) {
    seconds = `0${seconds}`;
  }

  return `${minutes}:${seconds}`;
}

function setRemainingPathColor(timeLeft, COLOR_CODES) {
  const { alert, warning, info } = COLOR_CODES;
  console.log(timeLeft, COLOR_CODES);
  console.log(alert, warning, info);
  if (timeLeft <= alert.threshold) {
    console.log('alert');
    document
      .getElementById('base-timer-path-remaining')
      .classList.remove(warning.color);
    document
      .getElementById('base-timer-path-remaining')
      .classList.add(alert.color);

    document.getElementById('base-timer-label').style.color = 'red';
  } else if (timeLeft <= warning.threshold) {
    console.log(warning.color);
    document
      .getElementById('base-timer-path-remaining')
      .classList.remove(info.color);
    document
      .getElementById('base-timer-path-remaining')
      .classList.add(warning.color);

    // change text color
    document.getElementById('base-timer-label').style.color = 'orange';
  } else {
    console.log('nothing');
  }
}

function calculateTimeFraction() {
  const rawTimeFraction = timeLeft / TIME_LIMIT;
  return rawTimeFraction - (1 / TIME_LIMIT) * (1 - rawTimeFraction);
}

function setCircleDasharray() {
  const circleDasharray = `${(
    calculateTimeFraction() * FULL_DASH_ARRAY
  ).toFixed(0)} 283`;
  document
    .getElementById('base-timer-path-remaining')
    .setAttribute('stroke-dasharray', circleDasharray);
}

// Workaround so we don't set .innerHTML directly in code
function safelySetInnerHtml(htmlStr, elementId) {
  var labelNode = document.getElementById(elementId);
  labelNode.textContent = htmlStr;
}
