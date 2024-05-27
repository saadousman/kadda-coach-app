document.addEventListener('DOMContentLoaded', function () {
  const conversationId = getQueryVariable('id'); // Assuming the conversation ID is passed in the URL
  fetch('../data/conversations.json')
    .then(response => response.json())
    .then(data => {
      const conversation = findConversationById(data, conversationId);
      if (conversation) {
        setupConversation(conversation);
      }
    });

  document.getElementById('start-recording').addEventListener('click', startRecording);
  document.getElementById('stop-recording').addEventListener('click', stopRecording);
  document.getElementById('play-recording').addEventListener('click', playRecording);
});

let recognition;
let currentDialogueIndex = 0;

function getQueryVariable(variable) {
  const query = window.location.search.substring(1);
  const vars = query.split('&');
  for (let i = 0; i < vars.length; i++) {
    const pair = vars[i].split('=');
    if (pair[0] == variable) {
      return pair[1];
    }
  }
  return false;
}

function findConversationById(data, id) {
  for (const category in data) {
    for (const conversation of data[category]) {
      if (conversation.id === id) {
        return conversation;
      }
    }
  }
  return null;
}

function setupConversation(conversation) {
  document.getElementById('conversation-title').innerText = conversation.title;
  const dialogueContainer = document.getElementById('conversation-dialogue');
  conversation.dialogue.forEach((line, index) => {
    const userLine = document.createElement('div');
    userLine.className = 'dialogue-bubble user-bubble';
    userLine.innerText = line.user;
    dialogueContainer.appendChild(userLine);

    const appLine = document.createElement('div');
    appLine.className = 'dialogue-bubble app-bubble';
    appLine.innerText = line.app;
    dialogueContainer.appendChild(appLine);
  });
}

function startRecording() {
  currentDialogueIndex = 0;
  const dialogueContainer = document.getElementById('conversation-dialogue');
  const userBubbles = dialogueContainer.getElementsByClassName('user-bubble');
  const appBubbles = dialogueContainer.getElementsByClassName('app-bubble');

  userBubbles[currentDialogueIndex].classList.add('highlighted');
  speak(appBubbles[currentDialogueIndex].innerText);

  if (!('webkitSpeechRecognition' in window)) {
    alert('Your browser does not support the Web Speech API');
    return;
  }

  recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onresult = (event) => {
    userBubbles[currentDialogueIndex].classList.remove('highlighted');
    currentDialogueIndex++;
    if (currentDialogueIndex < userBubbles.length) {
      userBubbles[currentDialogueIndex].classList.add('highlighted');
      speak(appBubbles[currentDialogueIndex].innerText);
    } else {
      stopRecording();
    }
  };

  recognition.start();
}

function stopRecording() {
  if (recognition) {
    recognition.stop();
  }
  $('#recording-modal').modal('show');
}

function playRecording() {
  // Implement play recording logic here
}

function speak(text) {
  const msg = new SpeechSynthesisUtterance(text);
  msg.lang = 'en-US';
  window.speechSynthesis.speak(msg);
}
