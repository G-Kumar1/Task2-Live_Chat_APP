const socket = io();
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');

form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value) {
        socket.emit('chat message', input.value);
        input.value = '';
    }
});

socket.on('chat message', function(msg) {
    const item = document.createElement('li');
    item.textContent = msg;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
});

const chatBody = document.getElementById('chat-body');
    const msgInput = document.getElementById('msg-input');

    function sendMessage() {
      const text = msgInput.value.trim();
      if (text === '') return;

      const msgEl = document.createElement('div');
      msgEl.classList.add('message', 'sent');
      msgEl.innerHTML = `${text}<div class="timestamp">${new Date().toLocaleTimeString()}</div>`;

      chatBody.appendChild(msgEl);
      msgInput.value = '';
      chatBody.scrollTop = chatBody.scrollHeight;

      setTimeout(() => receiveMessage(text), 1000);
    }

    function receiveMessage(text) {
      const msgEl = document.createElement('div');
      msgEl.classList.add('message', 'received');
      msgEl.innerHTML = `${text}<div class="timestamp">${new Date().toLocaleTimeString()}</div>`;

      chatBody.appendChild(msgEl);
      chatBody.scrollTop = chatBody.scrollHeight;
    }

    function openFileDialog() {
      document.getElementById('fileInput').click();
    }

    function startRecording() {
      alert("🎙️ Voice message recording is under development!");
    }