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
});

let recognition;
let mediaRecorder;
let recordedChunks = [];
let currentDialogueIndex = 0;
let isSpeaking = false;

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
  document.getElementById('start-recording').style.display = 'none';
  document.getElementById('stop-recording').style.display = 'block';
  currentDialogueIndex = 0;
  const dialogueContainer = document.getElementById('conversation-dialogue');
  const userBubbles = dialogueContainer.getElementsByClassName('user-bubble');
  const appBubbles = dialogueContainer.getElementsByClassName('app-bubble');

  if (!('webkitSpeechRecognition' in window) || !navigator.mediaDevices) {
    alert('Your browser does not support the necessary Web APIs');
    return;
  }

  // Initialize MediaRecorder for voice recording
  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = event => {
        if (event.data.size > 0) {
          recordedChunks.push(event.data);
        }
      };
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(recordedChunks, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const recordedAudio = document.getElementById('recorded-audio');
        recordedAudio.src = audioUrl;
      };
      mediaRecorder.start();
    });

  // Initialize SpeechRecognition for voice recognition
  recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onresult = (event) => {
    const userBubbles = document.getElementsByClassName('user-bubble');
    const appBubbles = document.getElementsByClassName('app-bubble');

    if (!isSpeaking && currentDialogueIndex < userBubbles.length) {
      userBubbles[currentDialogueIndex].classList.remove('highlighted');
      currentDialogueIndex++;
      if (currentDialogueIndex < userBubbles.length) {
        userBubbles[currentDialogueIndex].classList.add('highlighted');
        speak(appBubbles[currentDialogueIndex].innerText);
      } else {
        stopRecording();
      }
    }
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
  };

  recognition.onend = () => {
    if (currentDialogueIndex < userBubbles.length) {
      recognition.start();
    }
  };

  recognition.start();
  userBubbles[currentDialogueIndex].classList.add('highlighted');
}

function stopRecording() {
  if (recognition) {
    recognition.stop();
  }
  if (mediaRecorder) {
    mediaRecorder.stop();
  }
  document.getElementById('stop-recording').style.display = 'none';
  $('#recording-modal').modal('show');
}

function playRecording() {
  const recordedAudio = document.getElementById('recorded-audio');
  recordedAudio.play();
}

function speak(text) {
  recognition.stop(); // Stop recognition while speaking
  isSpeaking = true;
  const msg = new SpeechSynthesisUtterance(text);
  msg.lang = 'en-US';
  msg.onend = () => {
    isSpeaking = false;
    recognition.start(); // Restart recognition after speaking
  };
  window.speechSynthesis.speak(msg);
}
