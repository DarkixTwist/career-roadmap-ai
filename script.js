const chatBox = document.getElementById("chat-box");
const input = document.getElementById("input");

function getTimeStamp() {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function appendMessage(text, sender = "bot", timestamp = null) {
  const msg = document.createElement("div");
  msg.className = "message " + sender;

  const textEl = document.createElement("div");
  textEl.innerHTML = text;

  const timeEl = document.createElement("div");
  timeEl.className = "timestamp";
  timeEl.textContent = timestamp || getTimeStamp();

  msg.appendChild(textEl);
  msg.appendChild(timeEl);
  chatBox.appendChild(msg);
  scrollToBottom();
}

function scrollToBottom() {
  chatBox.scrollTop = chatBox.scrollHeight;
}

function saveHistory() {
  localStorage.setItem("chat-history", chatBox.innerHTML);
}

function loadHistory() {
  const history = localStorage.getItem("chat-history");
  if (history) chatBox.innerHTML = history;
}

async function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  appendMessage(text, "user");
  saveHistory();
  input.value = "";

  const typing = document.createElement("div");
  typing.className = "message bot";
  typing.id = "typing";
  typing.textContent = "Typing...";
  chatBox.appendChild(typing);
  scrollToBottom();

  try {
    const res = await fetch("https://your-vercel-project.vercel.app/api/poe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "poe-access-key": "your-32-char-poe-access-key"
      },
      body: JSON.stringify({ message: text })
    });

    const data = await res.json();
    let i = 0;
    let fullText = data.message.text;
    let displayText = "";

    const interval = setInterval(() => {
      if (i >= fullText.length) {
        clearInterval(interval);
        typing.remove();
        appendMessage(fullText, "bot");
        saveHistory();
        return;
      }

      displayText += fullText[i];
      typing.textContent = displayText;
      i++;
      scrollToBottom();
    }, 20);

  } catch (e) {
    typing.remove();
    appendMessage("❌ Error connecting to server", "bot");
    saveHistory();
  }
}

function clearChat() {
  chatBox.innerHTML = "";
  localStorage.removeItem("chat-history");
}

// Load on start
loadHistory();
scrollToBottom();
