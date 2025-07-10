const API_URL = "https://server-api-java.up.railway.app/tickets"; // Remplace <TON_APP>

function showResponse(message) {
  document.getElementById("response").innerText = message;
}

function enqueue() {
  const value = document.getElementById("valueInput").value;
  fetch(`${API_URL}/enqueue`, {
    method: "POST",
    body: value,
    headers: {
      "Content-Type": "text/plain",
    },
  })
    .then((res) => res.text())
    .then(showResponse)
    .catch((err) => showResponse("❌ Erreur : " + err));
}

function peek() {
  fetch(`${API_URL}/peek`)
    .then((res) => res.text())
    .then(showResponse)
    .catch((err) => showResponse("❌ Erreur : " + err));
}

function dequeue() {
  fetch(`${API_URL}/dequeue`, { method: "DELETE" })
    .then((res) => res.text())
    .then(showResponse)
    .catch((err) => showResponse("❌ Erreur : " + err));
}

function getSize() {
  fetch(`${API_URL}/size`)
    .then((res) => res.text())
    .then(showResponse)
    .catch((err) => showResponse("❌ Erreur : " + err));
}
