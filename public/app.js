// Variables globales définies en dehors du DOMContentLoaded pour être accessibles partout
const isLocal = window.location.hostname === "localhost";
const API_URL = isLocal ? "http://localhost:8081/tickets" : "https://server-api-java.up.railway.app/tickets";

// Système de génération automatique de tickets
let ticketCounter = 1;
let totalTicketsGenerated = 0;
let ticketCreationTimes = new Map();

console.log('🚀 Initialisation de app.js');
console.log('API_URL:', API_URL);

// Système de notifications amélioré
function showNotification(message, type = 'success', duration = 5000) {
  const notification = document.createElement('div');
  notification.className = `toast-notification ${type}`;
  
  let icon = '';
  switch(type) {
    case 'success':
      icon = '<i class="fas fa-check-circle"></i>';
      break;
    case 'error':
      icon = '<i class="fas fa-exclamation-circle"></i>';
      break;
    case 'info':
      icon = '<i class="fas fa-info-circle"></i>';
      break;
    case 'warning':
      icon = '<i class="fas fa-exclamation-triangle"></i>';
      break;
  }
  
  notification.innerHTML = `
    <div class="toast-content">
      <div class="toast-icon">${icon}</div>
      <div class="toast-message">${message}</div>
      <button class="toast-close" onclick="closeNotification(this)">
        <i class="fas fa-times"></i>
      </button>
    </div>
    <div class="toast-progress"></div>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  const progressBar = notification.querySelector('.toast-progress');
  progressBar.style.animationDuration = `${duration}ms`;
  
  setTimeout(() => {
    closeNotification(notification);
  }, duration);
}

function closeNotification(element) {
  const notification = element.closest ? element.closest('.toast-notification') : element;
  if (notification) {
    notification.classList.remove('show');
    notification.classList.add('hide');
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }
}

// Fonctions utilitaires
function initializeTicketCounter() {
  const savedCounter = localStorage.getItem('ticketCounter');
  const savedTotal = localStorage.getItem('totalGenerated');
  
  if (savedCounter) {
    ticketCounter = parseInt(savedCounter);
  }
  if (savedTotal) {
    totalTicketsGenerated = parseInt(savedTotal);
    const totalElement = document.getElementById('totalGenerated');
    if (totalElement) {
      totalElement.textContent = totalTicketsGenerated;
    }
  }
  
  updateNextTicketPreview();
}

function saveTicketCounter() {
  localStorage.setItem('ticketCounter', ticketCounter.toString());
  localStorage.setItem('totalGenerated', totalTicketsGenerated.toString());
}

function updateNextTicketPreview() {
  const nextPreviewElement = document.getElementById('nextTicketPreview');
  if (nextPreviewElement) {
    nextPreviewElement.textContent = ticketCounter.toString().padStart(3, '0');
  }
}

function storeTicketCreationTime(ticketNumber) {
  ticketCreationTimes.set(ticketNumber, Date.now());
}

function updateTicketCalled(ticketText) {
  const ticketNum = ticketText.match(/\d+/g)?.pop() || "---";
  const ticketNumDisplay = document.getElementById("ticketNum");
  if (ticketNumDisplay) {
    ticketNumDisplay.innerText = ticketNum.padStart(3, "0");
  }
  
  const currentTicketNumber = document.getElementById("currentTicketNumber");
  const currentGuichet = document.getElementById("currentGuichet");
  const servingTicket = document.getElementById("servingTicket");
  const guichetSelect = document.getElementById("guichetSelect");
  
  if (currentTicketNumber) {
    currentTicketNumber.innerText = ticketNum.padStart(3, "0");
  }
  
  if (currentGuichet && guichetSelect) {
    currentGuichet.innerText = guichetSelect.value.padStart(2, "0");
  }
  
  if (servingTicket) {
    servingTicket.innerText = ticketNum !== "---" ? `Ticket ${ticketNum.padStart(3, "0")}` : "Aucun";
  }
}

function updateWaitMessage(text) {
  const count = text.match(/\d+/)?.[0] || "0";
  const waitMessageDisplay = document.getElementById("waitMessage");
  if (waitMessageDisplay) {
    waitMessageDisplay.innerText = `Il y a encore ${count} personne${count > 1 ? 's' : ''} en attente.`;
  }
  
  const waitingCount = document.getElementById("waitingCount");
  if (waitingCount) {
    waitingCount.innerText = count;
  }
}

function getSize() {
  fetch(`${API_URL}/size`)
    .then((res) => res.text())
    .then(updateWaitMessage)
    .catch(() => showNotification("❌ Erreur lors du comptage de la file", 'error'));
}

// FONCTIONS PRINCIPALES - DÉFINIES GLOBALEMENT POUR ONCLICK
function generateTicket() {
  console.log('generateTicket appelée');
  const currentTicketNumber = ticketCounter;
  
  fetch(`${API_URL}/enqueue`, {
    method: "POST",
    body: currentTicketNumber.toString(),
    headers: { "Content-Type": "text/plain" },
  })
    .then((res) => res.text())
    .then(() => {
      storeTicketCreationTime(currentTicketNumber);
      
      ticketCounter++;
      totalTicketsGenerated++;
      
      updateNextTicketPreview();
      const totalElement = document.getElementById('totalGenerated');
      if (totalElement) {
        totalElement.textContent = totalTicketsGenerated;
      }
      saveTicketCounter();
      
      getSize();
      showNotification(`🎉 Ticket ${currentTicketNumber.toString().padStart(3, '0')} généré avec succès !`, 'success');
    })
    .catch(() => {
      showNotification("❌ Erreur lors de la génération du ticket", 'error');
    });
}

function callNextTicket() {
  console.log('callNextTicket appelée');
  const guichetSelect = document.getElementById("guichetSelect");
  const guichetId = guichetSelect ? guichetSelect.value : "1";
  fetch(`${API_URL}/guichet/${guichetId}/next`, { method: "POST" })
    .then((res) => res.text())
    .then((text) => {
      updateTicketCalled(text);
      getSize();
      showNotification("📤 " + text, 'info');
    })
    .catch(() => showNotification("❌ Erreur lors de l'appel du ticket", 'error'));
}

function peekNextTicket() {
  console.log('peekNextTicket appelée');
  const guichetSelect = document.getElementById("guichetSelect");
  const guichetId = guichetSelect ? guichetSelect.value : "1";
  Promise.all([
    fetch(`${API_URL}/guichet/${guichetId}`).then((res) => res.text()),
    fetch(`${API_URL}/peek`).then((res) => res.text())
  ])
    .then(([currentText, nextText]) => {
      const current = currentText.match(/\d+/g)?.pop();
      const next = nextText.match(/\d+/g)?.pop();

      if (!next || next === current) {
        showNotification("ℹ️ Aucun nouveau ticket après le ticket actuel.", 'info');
        const ticketNumDisplay = document.getElementById("ticketNum");
        if (ticketNumDisplay) {
          ticketNumDisplay.innerText = "---";
        }
      } else {
        const ticketNumDisplay = document.getElementById("ticketNum");
        if (ticketNumDisplay) {
          ticketNumDisplay.innerText = next.padStart(3, "0");
        }
        showNotification("👁️ " + nextText, 'info');
      }
    })
    .catch(() => showNotification("❌ Impossible d'afficher le prochain ticket", 'error'));
}

function showAllGuichets() {
  console.log('showAllGuichets appelée');
  fetch(`${API_URL}/guichets`)
    .then(res => res.text())
    .then(text => showModal('État des guichets', text))
    .catch(() => showNotification("❌ Impossible d'afficher les guichets", 'error'));
}

function resetSystem() {
  console.log('resetSystem appelée');
  showConfirmModal(
    'Confirmer la réinitialisation', 
    'Êtes-vous sûr de vouloir réinitialiser tout le système ? Cette action est irréversible.',
    () => {
      fetch(`${API_URL}/reset`, { method: "POST" })
        .then(res => res.text())
        .then(text => {
          showNotification("🧹 File réinitialisée !", 'success');
          
          ticketCounter = 1;
          totalTicketsGenerated = 0;
          ticketCreationTimes.clear();
          updateNextTicketPreview();
          const totalElement = document.getElementById('totalGenerated');
          if (totalElement) {
            totalElement.textContent = '0';
          }
          saveTicketCounter();
          
          getSize();
          updateTicketCalled("---");
        })
        .catch(() => showNotification("❌ Impossible de réinitialiser la file", 'error'));
    }
  );
}

function printReport() {
  console.log('printReport appelée');
  const reportData = {
    totalGenerated: totalTicketsGenerated,
    currentCounter: ticketCounter,
    timestamp: new Date().toLocaleString('fr-FR')
  };
  
  const reportContent = `
    <div class="report-content">
      <h4><i class="fas fa-chart-bar"></i> Rapport d'activité</h4>
      <div class="report-stats">
        <div class="report-item">
          <span class="report-label">Tickets générés:</span>
          <span class="report-value">${reportData.totalGenerated}</span>
        </div>
        <div class="report-item">
          <span class="report-label">Prochain numéro:</span>
          <span class="report-value">${reportData.currentCounter.toString().padStart(3, '0')}</span>
        </div>
        <div class="report-item">
          <span class="report-label">Date/Heure:</span>
          <span class="report-value">${reportData.timestamp}</span>
        </div>
      </div>
    </div>
  `;
  
  showModal('Rapport d\'activité', reportContent);
}

function showModal(title, content) {
  console.log('showModal appelée');
  const modal = document.getElementById('modal');
  const modalBody = document.getElementById('modalBody');
  
  if (modal && modalBody) {
    modalBody.innerHTML = `
      <h3>${title}</h3>
      <div class="modal-text">${content}</div>
    `;
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

function showConfirmModal(title, message, onConfirm) {
  const modal = document.getElementById('modal');
  const modalBody = document.getElementById('modalBody');
  
  if (modal && modalBody) {
    modalBody.innerHTML = `
      <h3>${title}</h3>
      <div class="modal-text">${message}</div>
      <div class="modal-actions">
        <button class="btn btn-danger" onclick="confirmAction()">
          <i class="fas fa-check"></i> Confirmer
        </button>
        <button class="btn btn-secondary" onclick="closeModal()">
          <i class="fas fa-times"></i> Annuler
        </button>
      </div>
    `;
    
    window.pendingConfirmAction = onConfirm;
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

function confirmAction() {
  console.log('confirmAction appelée');
  if (window.pendingConfirmAction) {
    window.pendingConfirmAction();
    window.pendingConfirmAction = null;
  }
  closeModal();
}

function closeModal() {
  console.log('closeModal appelée');
  const modal = document.getElementById('modal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
    window.pendingConfirmAction = null;
  }
}

// EXPOSITION IMMÉDIATE DES FONCTIONS PRINCIPALES
window.generateTicket = generateTicket;
window.callNextTicket = callNextTicket;
window.peekNextTicket = peekNextTicket;
window.showAllGuichets = showAllGuichets;
window.resetSystem = resetSystem;
window.printReport = printReport;
window.showModal = showModal;
window.showConfirmModal = showConfirmModal;
window.confirmAction = confirmAction;
window.closeModal = closeModal;
window.closeNotification = closeNotification;

console.log('🚀 Fonctions exposées globalement immédiatement:');
console.log('✅ generateTicket:', typeof window.generateTicket);
console.log('✅ callNextTicket:', typeof window.callNextTicket);
console.log('✅ peekNextTicket:', typeof window.peekNextTicket);
console.log('✅ showAllGuichets:', typeof window.showAllGuichets);
console.log('✅ resetSystem:', typeof window.resetSystem);
console.log('✅ printReport:', typeof window.printReport);

// Initialisation DOM-dependent
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, initializing app...');
  
  initializeTicketCounter();
  getSize();

  const guichetSelect = document.getElementById("guichetSelect");
  if (guichetSelect) {
    const guichetId = guichetSelect.value;
    fetch(`${API_URL}/guichet/${guichetId}`)
      .then(res => res.text())
      .then(text => updateTicketCalled(text))
      .catch(() => updateTicketCalled("---"));
  }
  
  // Mise à jour périodique
  setInterval(getSize, 5000);
  
  console.log('✅ App initialization complete');
});

// Test de vérification après chargement complet
window.addEventListener('load', function() {
  console.log('Window loaded - vérification finale des fonctions:');
  console.log('generateTicket:', typeof window.generateTicket);
  console.log('callNextTicket:', typeof window.callNextTicket);
  
  // Test API
  console.log('Test connexion API...');
  fetch(`${API_URL}/size`)
    .then(res => {
      console.log('✅ API Status:', res.status);
      return res.text();
    })
    .then(text => {
      console.log('✅ API Response:', text);
    })
    .catch(err => {
      console.error('❌ Erreur API:', err);
    });
});
