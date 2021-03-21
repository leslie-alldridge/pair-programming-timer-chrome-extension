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
let TIME_LIMIT = 1200;
let timePassed = 0;
let timeLeft = TIME_LIMIT;
let timerInterval = null;

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
  renderTimerHtml(TIME_LIMIT);
  startTimer(COLOR_CODES);
});

endSession.addEventListener('click', () => {
  // reset timer
  onTimesUp();
  resetToDefault();
});

resetToDefault = () => {
  // Change background to use our active class
  sessionTimer.style.display = 'none';
  document.body.style.backgroundColor = '#121212';
  // Hide start button aand description
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
  document.getElementById('base-timer-label').style.color = 'rgb(65, 184, 131)';
};

// I liked how clean and easy this timer was. Credit: Mateusz Rybczonec
// https://css-tricks.com/how-to-create-an-animated-countdown-timer-with-html-css-and-javascript/

renderTimerHtml = (TIME_LIMIT) => {
  document.getElementById('app').innerHTML = `
  <div class="base-timer">
    <svg class="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g class="base-timer__circle">
        <circle class="base-timer__path-elapsed" cx="50" cy="50" r="45"></circle>
        <path
          id="base-timer-path-remaining"
          stroke-dasharray="283"
          class="base-timer__path-remaining green"
          d="
            M 50, 50
            m -45, 0
            a 45,45 0 1,0 90,0
            a 45,45 0 1,0 -90,0
          "
        ></path>
      </g>
    </svg>
    <span id="base-timer-label" class="base-timer__label">${formatTime(
      TIME_LIMIT
    )}</span>
  </div>
  `;
};

function onTimesUp() {
  clearInterval(timerInterval);
}

function startTimer(COLOR_CODES) {
  timerInterval = setInterval(() => {
    timePassed = timePassed += 1;
    timeLeft = TIME_LIMIT - timePassed;
    document.getElementById('base-timer-label').innerHTML = formatTime(
      timeLeft
    );
    setCircleDasharray();
    setRemainingPathColor(timeLeft, COLOR_CODES);

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
  if (timeLeft <= alert.threshold) {
    document
      .getElementById('base-timer-path-remaining')
      .classList.remove(warning.color);
    document
      .getElementById('base-timer-path-remaining')
      .classList.add(alert.color);

    document.getElementById('base-timer-label').style.color = 'red';
  } else if (timeLeft <= warning.threshold) {
    document
      .getElementById('base-timer-path-remaining')
      .classList.remove(info.color);
    document
      .getElementById('base-timer-path-remaining')
      .classList.add(warning.color);

    // change text color
    document.getElementById('base-timer-label').style.color = 'orange';
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
