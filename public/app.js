const isLocal = window.location.hostname === "localhost";
const API_URL = isLocal 
  ? "http://localhost:8081/tickets" 
  : "https://server-api-java.up.railway.app/tickets";

const alertBox = document.getElementById("alert");
const ticketNumDisplay = document.getElementById("ticketNum");
const waitMessageDisplay = document.getElementById("waitMessage");
const guichetSelect = document.getElementById("guichetSelect");

function showAlert(message, isError = false) {
  alertBox.textContent = message;
  alertBox.classList.remove("hidden", "error");
  alertBox.classList.add("show");
  if (isError) alertBox.classList.add("error");

  setTimeout(() => {
    alertBox.classList.remove("show");
  }, 5000);
}

function updateTicketCalled(ticketText) {
  const ticketNum = ticketText.match(/\d+/g)?.pop() || "---";
  ticketNumDisplay.innerText = ticketNum.padStart(3, "0");
}

function updateWaitMessage(text) {
  const count = text.match(/\d+/)?.[0] || "--";
  waitMessageDisplay.innerText = `Il y a encore ${count} personne${count > 1 ? 's' : ''} en attente.`;
}

function enqueue() {
  const value = document.getElementById("valueInput").value;
  if (!value) return showAlert("❗ Veuillez entrer un numéro", true);

  fetch(`${API_URL}/enqueue`, {
    method: "POST",
    body: value,
    headers: { "Content-Type": "text/plain" },
  })
    .then((res) => res.text())
    .then(() => {
      getSize();
      showAlert("🎉 Ticket ajouté avec succès !");
      document.getElementById("valueInput").value = "";
    })
    .catch(() => showAlert("❌ Erreur lors de l'enregistrement", true));
}

function dequeue() {
  const guichetId = guichetSelect.value;
  fetch(`${API_URL}/guichet/${guichetId}/next`, { method: "POST" })
    .then((res) => res.text())
    .then((text) => {
      updateTicketCalled(text);
      getSize();
      showAlert("📤 Ticket appelé : " + text);
    })
    .catch(() => showAlert("❌ Erreur lors de l'appel du ticket", true));
}

function peek() {
  const guichetId = guichetSelect.value;
  Promise.all([
    fetch(`${API_URL}/guichet/${guichetId}`).then((res) => res.text()),
    fetch(`${API_URL}/peek`).then((res) => res.text())
  ])
    .then(([currentText, nextText]) => {
      const current = currentText.match(/\d+/g)?.pop();
      const next = nextText.match(/\d+/g)?.pop();

      if (!next || next === current) {
        showAlert("ℹ️ Aucun nouveau ticket après le ticket actuel.");
        ticketNumDisplay.innerText = "---";
      } else {
        ticketNumDisplay.innerText = next.padStart(3, "0");
        showAlert("👁️ Prochain ticket en attente : " + nextText);
      }
    })
    .catch(() => showAlert("❌ Impossible d'afficher le prochain ticket", true));
}

function getSize() {
  fetch(`${API_URL}/size`)
    .then((res) => res.text())
    .then(updateWaitMessage)
    .catch(() => showAlert("❌ Erreur lors du comptage de la file", true));
}

function showGuichets() {
  fetch(`${API_URL}/guichets`)
    .then(res => res.text())
    .then(text => showAlert(text))
    .catch(() => showAlert("❌ Impossible d’afficher les guichets", true));
}

function resetQueue() {
  fetch(`${API_URL}/reset`, { method: "POST" })
    .then(res => res.text())
    .then(text => {
      showAlert("🧹 File réinitialisée !");
      getSize();
      updateTicketCalled("---");
    })
    .catch(() => showAlert("❌ Impossible de réinitialiser la file", true));
}


setInterval(getSize, 5000);

window.onload = () => {
  getSize();

  const guichetId = guichetSelect.value;
  fetch(`${API_URL}/guichet/${guichetId}`)
    .then(res => res.text())
    .then(text => updateTicketCalled(text))
    .catch(() => updateTicketCalled("---"));
};
