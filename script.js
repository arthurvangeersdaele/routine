// global variables - data
let habits = [];
let ideas = [];
let timeColors = [];

// global variables - score variable
let dayScore = 0;

// global variables - process clock management 
let tickFlag = 0; //seconds
let habitScrollFlag = 0; // seconds

// global variables - color management
const hourColors = [
  '#011b3e', '#011b3e', '#022245', '#00264b', '#00264b', '#002c4f',
  '#002c4f', '#003152', '#003f5e', '#00405e', '#064f72', '#0b7895',
  '#0b7895', '#45adba', '#45adba', '#aae0c8', '#aae0c8', '#aae0c8',
  '#cfdf8e', '#cfdf8e', '#f2d770', '#f3d672', '#fec76c', '#fec76c',
  '#fec460', '#fec460', '#fcc05e', '#fdc05e', '#f7ab57', '#f7ab57',
  '#f48969', '#f4896a', '#dd717e', '#df717d', '#954687', '#954687', 
  '#542680', '#53277e', '#361b71', '#351b72', '#292369', '#262468', 
  '#131d58', '#0b1b51', '#02184a', '#011b3e', '#011b3e', '#000000', 
];

// global variables - time management
let now = new Date();
const weekdays = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const currentWeekday = weekdays[now.getDay()];
let currentHour = now.getHours();
let currentMinute = now.getMinutes();
let nearestHalfHour = currentMinute >= 30 ? 30 : 0;
let currentTimeString = `${currentHour.toString().padStart(2, '0')}:${nearestHalfHour.toString().padStart(2, '0')}`;// currentTimeString - format 00:00

// global variables - parameters
let paramActions = {
  'resetButton': resetLocalStorage,
  'gitHubButton': goToGitHub, 
  'readMeButton': goToReadMe
}


// functions - fetching data for easy maintaining
fetch('./time_colors.json')
  .then(response => response.json())
  .then(data => {
    timeColors = data; // Store in global variable
    fetch('./habits.json')
      .then(response => response.json())
      .then(data => {
        habits = data; // Store in global variable
        renderHabits(); // Call function using this data
      })
      .catch(error => console.error('Error loading JSON:', error));
  })
  .catch(error => console.error('Error loading JSON:', error));


fetch('./ideas.json')
  .then(response => response.json())
  .then(data => {
    ideas = data; // Store in global variable
    renderIdeas(); // Call function using this data
  })
  .catch(error => console.error('Error loading JSON:', error));

// functions - rendering data on page
function renderHabits() {

  function getColorByTime(timeString) {
    if (!timeColors) {
      console.error('timeColors data is not loaded yet.');
      return null;
    }

    if (timeColors.hasOwnProperty(timeString)) {
      return timeColors[timeString];
    } else {
      console.warn(`No color found for time key: ${timeString}`);
      return null;
    }
  }

  const container = document.getElementById("habitsContainer");
  Object.entries(habits).forEach(([timeString, content]) => {
    const habit = document.createElement('div');
    habit.classList.add('habit');

    const habitTimeLabel = document.createElement('div');
    habitTimeLabel.classList.add('habit-time-label');
    habitTimeLabel.textContent = timeString;
    habitTimeLabel.style.backgroundColor = getColorByTime(timeString);
    habit.appendChild(habitTimeLabel);
    
    const habitDescription = document.createElement('div');
    habitDescription.classList.add('habit-description');
    habitDescription.textContent = content;
    habit.appendChild(habitDescription);

    container.appendChild(habit);
  });


  // starting main clock after data load !!! 
  initClock();

}

function renderIdeas() {
  const container = document.getElementById("ideasContainer");
  ideas.forEach(idea => {
    const div = document.createElement('div');
    div.className = 'idea';
    div.setAttribute('data-status-type', idea.type || 'hourly');
    div.setAttribute('data-status-done', idea.done || '');
    div.setAttribute('data-status-time', idea.time || '');
    div.setAttribute('data-status-day', idea.day);
    div.setAttribute('data-status-score', idea.score);
    div.setAttribute('onclick', 'clickIdea(this);');

    const h2 = document.createElement('h2');
    h2.textContent = idea.title;

    const p = document.createElement('p');
    p.textContent = idea.emoji;

    div.appendChild(h2);
    div.appendChild(p);

    container.appendChild(div);
  });

  // adding end of grid spacer
  const spacer = document.createElement('div');
  spacer.classList.add('spacer');
  container.appendChild(spacer);
}

// functions - time update dynamics 

function refreshTimeString(){
  now = new Date();
  currentHour = now.getHours();
  currentMinute = now.getMinutes();
  nearestHalfHour = currentMinute >= 30 ? 30 : 0;
  currentTimeString = `${currentHour.toString().padStart(2, '0')}:${nearestHalfHour.toString().padStart(2, '0')}`;
  console.log(currentTimeString);
}

function initClock() {
  setDayTitle();
  scrollToCurrentHabit();
  clockTick();
  setInterval(clockTick, 1000);
}


function clockTick() {
  function flagTick(){
    tickFlag++;
    habitScrollFlag++;
  }
  flagTick();

  if (tickFlag % 1 === 0) {
    refreshTimeString();
    saveCurrentState();
    highlightCurrentHabit();
    refreshIdeas();
    refreshDayScore();

  }
  if(habitScrollFlag === 30){
      scrollToCurrentHabit();
  }
}

function setDayTitle(){
  document.getElementById('dayTitle').textContent = currentWeekday;
}

function highlightCurrentHabit(){
  const timeLabels = document.querySelectorAll('.habit-time-label');

  timeLabels.forEach(label => {
    const habit = label.closest('.habit');
    if (habit) {
      habit.classList.remove('current-habit');
      if (label.textContent.trim() === currentTimeString) {
        habit.classList.add('current-habit');
      }
    }
  });
}

function scrollToCurrentHabit(){
  const habit = document.querySelector('.current-habit');
  if(habit){
    habit.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
      });
  } else {
    setTimeout(scrollToCurrentHabit, 100);
  }
}



// functions - events listeners 
function listenToTouch(componentId, callback) {
  const element = document.getElementById(componentId);
  if (!element) {
    console.warn(`Element with ID '${componentId}' not found.`);
    return;
  }
  element.ontouchstart = function(event) {
    element.classList.add("touched");
  };
  element.ontouchend = function(event) {
    element.classList.remove("touched");
  };
}

listenToTouch('resetButton');
listenToTouch('saveButton');
listenToTouch('authorButton');


function listenToScroll(componentId, callback) {
  const element = document.getElementById(componentId);
  if (!element) {
    console.warn(`Element with ID '${componentId}' not found.`);
    return;
  }

  element.addEventListener('scroll', callback);
}

listenToScroll('habitsContainer', () => {
  habitScrollFlag = 0;
});



// functions - notepad 
function saveNotepad(){
  notepadContent = document.getElementById("notepad").innerHTML;
}

// functions - ideas and score dynamics
function refreshIdeas(){
  const ideas = document.querySelectorAll('.idea');
  let isEmpty = true;
  ideas.forEach(idea => {
    if(idea.dataset.statusType === 'hourly'){
      if(idea.dataset.statusTime.includes(currentTimeString)){
        if(idea.dataset.statusDone === currentTimeString){
          idea.style.display = 'none';
        }
        else{
          idea.style.display = 'flex';
          isEmpty = false;
        }
      } else {
        idea.setAttribute('data-status-done', false);
        idea.style.display = 'none';
      }
    }

    if(idea.dataset.statusType === 'daily'){
      if(idea.dataset.statusDay.includes(currentWeekday)){
        if(idea.dataset.statusDone === currentTimeString){
          idea.style.display = 'none';
        }
        else{
          idea.style.display = 'flex';
          isEmpty = false;
        }
      } else {
        idea.setAttribute('data-status-done', false);
        idea.style.display = 'none';
      }
    }
  });

  if(isEmpty){
    document.getElementById('ideaEmpty').style.display = 'flex';
  }

  // Force layout recalculation
  const container = document.getElementById('ideasContainer');
  container.offsetHeight; 
}

function clickIdea(idea){
  // remove idea
  idea.style.display = 'none';
  idea.setAttribute('data-status-done', currentTimeString);

  // update score
  console.log(idea.dataStatusScore);
  dayScore += Number(idea.dataset.statusScore) || 0;
  refreshDayScore()
}

function refreshDayScore(){
  document.getElementById('dayScore').textContent = dayScore;
}





// functions - page local storage (save locally)
function saveCurrentState() {
    const data = {};

    let notepadElem = document.getElementById("notepad");
    data['notepad'] = notepadElem.innerText.trim();

    data['day-score'] = dayScore;

    // TODO: save ideas that are done (status-done = past timestring)

    // Store in localStorage
    localStorage.setItem('snapshot', JSON.stringify(data));
}

function reloadSavedState(){
  
    const saved = localStorage.getItem('snapshot');
    if (!saved) return;

    const data = JSON.parse(saved);

    let notepad = document.getElementById("notepad");
    notepad.innerText = data['notepad'];


    dayScore = data['day-score'];
    refreshDayScore();
  
}

window.addEventListener('DOMContentLoaded', () => {
  reloadSavedState();
});

function resetLocalStorage(){
    const saved = localStorage.getItem('snapshot');
    if (!saved) return;

    const data = JSON.parse(saved);
    
    let notepad = document.getElementById("notepad");
    notepad.innerText = '';


    dayScore = 0;

    refreshDayScore();
    saveCurrentState();
}

// functions - external functions 

function goToGitHub() {
  window.open("https://github.com/arthurvangeersdaele/routine", "_blank");
}

function goToReadMe() {
  window.open("https://github.com/arthurvangeersdaele/routine/blob/main/README.md", "_blank");
}

// functions - parameter buttons function association 
function associateParamActions() {
  for (const [buttonId, actionFn] of Object.entries(paramActions)) {
    const button = document.getElementById(buttonId);
    if (button) {
      button.onclick = actionFn;
    } else {
      console.warn(`Button with id "${buttonId}" not found.`);
    }
  }
}

setTimeout(associateParamActions, 1000);
