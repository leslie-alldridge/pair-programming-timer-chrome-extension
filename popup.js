// Gather elements from popup.html
let startSessionBtn = document.getElementById('startSession');
let endSession = document.getElementById('endSession');
let sessionTimer = document.getElementById('sessionTimer');

startSessionBtn.addEventListener('click', function () {
  // Change background to use our active class
  document.body.style.backgroundColor = '#7db46cff';
  // Hide start button
  startSessionBtn.style.visibility = 'hidden';
  // Display timer options and end button
  sessionTimer.style.visibility = 'visible';
  endSession.style.visibility = 'visible';
});
