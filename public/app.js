const API_URL = "https://server-api-java.up.railway.app/tickets";
const alertBox = document.getElementById("alert");
const ticketNumDisplay = document.getElementById("ticketNum");
const waitMessageDisplay = document.getElementById("waitMessage");

function showAlert(message, isError = false) {
  alertBox.textContent = message;
  alertBox.classList.remove("hidden", "error");
  alertBox.classList.add("show");
  if (isError) alertBox.classList.add("error");

  setTimeout(() => {
    alertBox.classList.remove("show");
  }, 3000);
}

function updateUI(ticketText) {
  const ticketNum = ticketText.match(/\d+/)?.[0] || "---";
  ticketNumDisplay.innerText = ticketNum.padStart(3, "0");
}

function updateWaitMessage(text) {
  const count = text.match(/\d+/)?.[0] || "--";
  waitMessageDisplay.innerText = `Il y a encore ${count} personnes en attente.`;
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
    .then((text) => {
      updateUI(text);
      getSize(); 
      showAlert("🎉 Ticket ajouté avec succès !");
    })
    .catch(() => showAlert("❌ Erreur lors de l'enregistrement", true));
}

function dequeue() {
  fetch(`${API_URL}/dequeue`, { method: "DELETE" })
    .then((res) => res.text())
    .then((text) => {
      getSize();
      showAlert("📤 Ticket appelé : " + text);
    })
    .catch(() => showAlert("❌ Erreur lors de l'appel du ticket", true));
}

function peek() {
  fetch(`${API_URL}/peek`)
    .then((res) => res.text())
    .then((text) => {
      updateUI(text);
      showAlert("👁️ Ticket en tête : " + text);
    })
    .catch(() => showAlert("❌ Impossible d'afficher le ticket", true));
}

function getSize() {
  fetch(`${API_URL}/size`)
    .then((res) => res.text())
    .then(updateWaitMessage)
    .catch(() => showAlert("❌ Erreur lors du comptage de la file", true));
}

function isEmpty() {
  fetch(`${API_URL}/isEmpty`)
    .then((res) => res.text())
    .then((text) => {
      if (text.includes("vide")) {
        showAlert("✅ La file est vide", false);
        updateUI("---");
      } else {
        showAlert("❌ La file n'est pas vide", true);
        getSize(); 
      }
    })  
    .catch(() => showAlert("❌ Erreur lors de la vérification de la file", true));
}

setInterval(getSize, 5000);

window.onload = () => {
  getSize();
};
