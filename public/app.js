const isLocal = window.location.hostname === "localhost";
const API_URL = isLocal? "http://localhost:8081/tickets": "https://server-api-java.up.railway.app/tickets";

const alertBox = document.getElementById("alert");
const ticketNumDisplay = document.getElementById("ticketNum");
const waitMessageDisplay = document.getElementById("waitMessage");
const guichetSelect = document.getElementById("guichetSelect");

// Système de génération automatique de tickets
let ticketCounter = 1;
let totalTicketsGenerated = 0;
let ticketCreationTimes = new Map(); // Stocker les heures de création des tickets

// Initialiser le compteur depuis le localStorage si disponible
function initializeTicketCounter() {
  const savedCounter = localStorage.getItem('ticketCounter');
  const savedTotal = localStorage.getItem('totalGenerated');
  const savedCreationTimes = localStorage.getItem('ticketCreationTimes');
  
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
  
  // Restaurer les temps de création des tickets
  if (savedCreationTimes) {
    try {
      const entries = JSON.parse(savedCreationTimes);
      ticketCreationTimes = new Map(entries);
    } catch (e) {
      ticketCreationTimes = new Map();
    }
  }
  
  updateNextTicketPreview();
}

// Sauvegarder le compteur
function saveTicketCounter() {
  localStorage.setItem('ticketCounter', ticketCounter.toString());
  localStorage.setItem('totalGenerated', totalTicketsGenerated.toString());
  localStorage.setItem('ticketCreationTimes', JSON.stringify(Array.from(ticketCreationTimes.entries())));
}

// Mettre à jour l'aperçu du prochain ticket
function updateNextTicketPreview() {
  const nextPreviewElement = document.getElementById('nextTicketPreview');
  if (nextPreviewElement) {
    nextPreviewElement.textContent = ticketCounter.toString().padStart(3, '0');
  }
}

// Stocker l'heure de création d'un ticket
function storeTicketCreationTime(ticketNumber) {
  ticketCreationTimes.set(ticketNumber, Date.now());
  
  // Nettoyer les anciens tickets (garder seulement les 50 derniers)
  if (ticketCreationTimes.size > 50) {
    const entries = Array.from(ticketCreationTimes.entries());
    entries.sort((a, b) => a[0] - b[0]);
    
    for (let i = 0; i < 20; i++) {
      ticketCreationTimes.delete(entries[i][0]);
    }
  }
}

// Fonction pour calculer le temps d'attente réel d'un ticket
function calculateRealWaitTime(ticketNumber) {
  const now = Date.now();
  
  // Si on a l'heure de création stockée, utiliser la vraie durée
  if (ticketCreationTimes.has(ticketNumber)) {
    const creationTime = ticketCreationTimes.get(ticketNumber);
    return Math.floor((now - creationTime) / 60000); // en minutes
  }
  
  // Sinon, estimer basé sur la position dans la file
  const waitingCount = parseInt(document.getElementById('waitingCount')?.textContent) || 0;
  const position = Math.max(1, ticketCounter - ticketNumber);
  
  // Estimation : 2-5 minutes par position selon la position
  return Math.max(1, Math.floor(position * 2.5 + Math.random() * 3));
}

// Exposer les fonctions globalement pour index.html
window.calculateRealWaitTime = calculateRealWaitTime;
window.getTicketCounter = () => ticketCounter;

// Fonctions DOM pour l'affichage enrichi de la file d'attente
function updateQueueDisplayDOM() {
  const queueList = document.getElementById('queueList');
  const waitingCount = parseInt(document.getElementById('waitingCount')?.textContent) || 0;

  if (waitingCount === 0) {
    queueList.innerHTML = `
      <div class="queue-empty">
        <div class="empty-icon-container">
          <i class="fas fa-inbox"></i>
          <div class="empty-pulse"></div>
        </div>
        <p>Aucun ticket en attente</p>
        <div class="empty-suggestion">
          <i class="fas fa-lightbulb"></i>
          <span>Cliquez sur "Prendre un ticket" pour commencer</span>
        </div>
      </div>
    `;
    return;
  }

  // Générer les vrais numéros de tickets avec un DOM enrichi
  let queueHTML = '';
  const currentCounter = ticketCounter;
  const startingTicket = Math.max(1, currentCounter - waitingCount);
  const currentTime = new Date();
  
  for (let i = 0; i < Math.min(waitingCount, 15); i++) {
    const realTicketNumber = startingTicket + i;
    const position = i + 1;
    const waitTime = calculateRealWaitTime(realTicketNumber);
    
    // Déterminer la priorité basée sur le temps d'attente
    let priorityClass = 'waiting';
    let priorityIcon = 'fas fa-clock';
    let statusText = 'En attente';
    let urgencyLevel = 'normal';
    
    if (waitTime > 15) {
      priorityClass = 'urgent';
      priorityIcon = 'fas fa-exclamation-triangle';
      statusText = 'Urgent';
      urgencyLevel = 'critical';
    } else if (waitTime > 10) {
      priorityClass = 'high';
      priorityIcon = 'fas fa-hourglass-half';
      statusText = 'Priorité haute';
      urgencyLevel = 'high';
    } else if (position <= 3) {
      priorityClass = 'next';
      priorityIcon = 'fas fa-arrow-right';
      statusText = 'Bientôt appelé';
      urgencyLevel = 'priority';
    }

    // Estimation de l'heure d'appel
    const estimatedCallTime = new Date(currentTime.getTime() + waitTime * 60000);
    const timeString = estimatedCallTime.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    queueHTML += `
      <div class="queue-item queue-${priorityClass} urgency-${urgencyLevel}" 
           data-ticket="${realTicketNumber}" 
           data-position="${position}"
           data-wait-time="${waitTime}"
           style="animation-delay: ${i * 0.1}s">
        
        <!-- Colonne Position avec badge -->
        <div class="queue-col position-col">
          <div class="position-wrapper">
            <span class="queue-position position-${position <= 3 ? 'priority' : 'normal'}">
              <span class="position-number">#${position}</span>
              ${position === 1 ? '<i class="fas fa-crown position-crown"></i>' : ''}
            </span>
            ${position <= 3 ? '<div class="priority-indicator"></div>' : ''}
          </div>
        </div>
        
        <!-- Colonne Numéro de ticket avec animations -->
        <div class="queue-col ticket-col">
          <div class="ticket-wrapper">
            <span class="ticket-number ticket-highlight">
              <i class="fas fa-ticket-alt ticket-icon"></i>
              <span class="ticket-digits">${realTicketNumber.toString().padStart(3, '0')}</span>
            </span>
            <div class="ticket-meta">
              <small class="ticket-time">Généré à ${new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'})}</small>
            </div>
          </div>
        </div>
        
        <!-- Colonne Temps d'attente avec graphique -->
        <div class="queue-col time-col">
          <div class="wait-time-wrapper">
            <span class="queue-wait-time time-${waitTime > 10 ? 'long' : 'normal'}">
              <i class="fas fa-clock-o"></i>
              <span class="time-value">${waitTime}</span>
              <span class="time-unit">min</span>
            </span>
            <div class="time-progress">
              <div class="progress-bar" style="width: ${Math.min(100, (waitTime / 20) * 100)}%"></div>
            </div>
            <small class="estimated-call">≈ ${timeString}</small>
          </div>
        </div>
        
        <!-- Colonne Statut avec détails -->
        <div class="queue-col status-col">
          <div class="status-wrapper">
            <span class="status ${priorityClass}">
              <i class="${priorityIcon} status-icon"></i>
              <span class="status-text">${statusText}</span>
            </span>
            <div class="status-details">
              ${position <= 3 ? '<span class="next-badge">Suivant</span>' : ''}
              ${waitTime > 15 ? '<span class="urgent-badge">Urgent</span>' : ''}
              <div class="status-dots">
                <div class="dot ${priorityClass}"></div>
                <div class="dot ${priorityClass}" style="animation-delay: 0.2s"></div>
                <div class="dot ${priorityClass}" style="animation-delay: 0.4s"></div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Indicateurs latéraux -->
        <div class="queue-indicators">
          ${position === 1 ? '<div class="next-indicator"><i class="fas fa-bell"></i></div>' : ''}
          ${waitTime > 15 ? '<div class="urgent-indicator"><i class="fas fa-exclamation"></i></div>' : ''}
        </div>
      </div>
    `;
  }

  // Afficher un indicateur s'il y a plus de tickets
  if (waitingCount > 15) {
    queueHTML += `
      <div class="queue-item more-tickets">
        <div class="queue-col">
          <div class="more-icon">
            <i class="fas fa-ellipsis-v"></i>
            <div class="more-animation"></div>
          </div>
        </div>
        <div class="queue-col">
          <strong class="more-text">Plus de tickets</strong>
        </div>
        <div class="queue-col">
          <span class="more-count">+${waitingCount - 15}</span>
        </div>
        <div class="queue-col">
          <span class="status more">
            <i class="fas fa-users"></i>
            <span>En file</span>
            <div class="pulse-indicator"></div>
          </span>
        </div>
      </div>
    `;
  }

  // Statistiques enrichies en bas du tableau
  const avgWaitTime = Math.round(waitingCount * 3.5);
  const nextTicketIn = Math.max(1, Math.round(avgWaitTime / waitingCount));
  const busyLevel = waitingCount > 10 ? 'high' : waitingCount > 5 ? 'medium' : 'low';
  
  queueHTML += `
    <div class="queue-stats-footer">
      <div class="stats-header">
        <h4><i class="fas fa-chart-bar"></i> Statistiques en temps réel</h4>
        <div class="stats-refresh">
          <i class="fas fa-sync-alt"></i>
          <span>Mis à jour maintenant</span>
        </div>
      </div>
      
      <div class="stats-grid">
        <div class="stat-item waiting-stat">
          <div class="stat-icon">
            <i class="fas fa-users"></i>
            <div class="stat-badge">${waitingCount}</div>
          </div>
          <div class="stat-content">
            <span class="stat-label">Personnes en attente</span>
            <div class="stat-bar">
              <div class="stat-fill" style="width: ${Math.min(100, (waitingCount / 20) * 100)}%"></div>
            </div>
          </div>
        </div>
        
        <div class="stat-item time-stat">
          <div class="stat-icon">
            <i class="fas fa-clock"></i>
            <div class="stat-badge">${avgWaitTime}</div>
          </div>
          <div class="stat-content">
            <span class="stat-label">Temps moyen (min)</span>
            <div class="time-indicator ${avgWaitTime > 15 ? 'long' : 'normal'}">
              ${avgWaitTime > 15 ? 'Long' : avgWaitTime > 8 ? 'Moyen' : 'Court'}
            </div>
          </div>
        </div>
        
        <div class="stat-item next-stat">
          <div class="stat-icon">
            <i class="fas fa-ticket-alt"></i>
            <div class="stat-badge">${ticketCounter.toString().padStart(3, '0')}</div>
          </div>
          <div class="stat-content">
            <span class="stat-label">Prochain ticket</span>
            <div class="next-time">Dans ~${nextTicketIn} min</div>
          </div>
        </div>
        
        <div class="stat-item activity-stat">
          <div class="stat-icon">
            <i class="fas fa-tachometer-alt"></i>
            <div class="activity-level ${busyLevel}"></div>
          </div>
          <div class="stat-content">
            <span class="stat-label">Activité</span>
            <div class="activity-text">
              ${busyLevel === 'high' ? 'Très occupé' : busyLevel === 'medium' ? 'Modéré' : 'Calme'}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  queueList.innerHTML = queueHTML;
  
  // Ajouter l'animation d'entrée progressive
  setTimeout(() => {
    const items = queueList.querySelectorAll('.queue-item');
    items.forEach((item, index) => {
      setTimeout(() => {
        item.classList.add('queue-item-visible');
      }, index * 100);
    });
  }, 50);
}

// Mettre à jour les temps d'attente avec animation
function updateWaitTimesDOM() {
  const queueItems = document.querySelectorAll('.queue-item[data-ticket]');
  queueItems.forEach(item => {
    const ticketNumber = parseInt(item.dataset.ticket);
    const waitTimeElement = item.querySelector('.time-value');
    if (waitTimeElement) {
      const oldWaitTime = parseInt(waitTimeElement.textContent);
      const newWaitTime = calculateRealWaitTime(ticketNumber);
      
      // Animation seulement si le temps a changé
      if (oldWaitTime !== newWaitTime) {
        waitTimeElement.style.transition = 'all 0.3s ease';
        waitTimeElement.style.transform = 'scale(1.1)';
        
        setTimeout(() => {
          waitTimeElement.textContent = newWaitTime;
          
          // Mettre à jour la classe de temps
          const waitTimeWrapper = item.querySelector('.queue-wait-time');
          waitTimeWrapper.className = waitTimeWrapper.className.replace(/time-(long|normal)/, '');
          waitTimeWrapper.classList.add(newWaitTime > 10 ? 'time-long' : 'time-normal');
          
          // Mettre à jour la barre de progression
          const progressBar = item.querySelector('.progress-bar');
          if (progressBar) {
            progressBar.style.width = `${Math.min(100, (newWaitTime / 20) * 100)}%`;
          }
          
          setTimeout(() => {
            waitTimeElement.style.transform = 'scale(1)';
          }, 150);
        }, 150);
      }
    }
  });
}

// Fonction pour montrer l'indicateur de mise à jour
function showUpdateIndicatorDOM() {
  const queueTitle = document.querySelector('.queue-display h3');
  if (queueTitle && !queueTitle.classList.contains('updating')) {
    queueTitle.classList.add('updating');
    const originalText = queueTitle.innerHTML;
    queueTitle.innerHTML = '<i class="fas fa-sync fa-spin"></i> Mise à jour de la file d\'attente...';
    
    setTimeout(() => {
      queueTitle.innerHTML = originalText;
      queueTitle.classList.remove('updating');
    }, 1000);
  }
}

// Exposer les fonctions DOM globalement
window.updateQueueDisplayDOM = updateQueueDisplayDOM;
window.updateWaitTimesDOM = updateWaitTimesDOM;
window.showUpdateIndicatorDOM = showUpdateIndicatorDOM;

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
  notification.classList.remove('show');
  notification.classList.add('hide');
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 300);
}

function updateTicketCalled(ticketText) {
  const ticketNum = ticketText.match(/\d+/g)?.pop() || "---";
  if (ticketNumDisplay) {
    ticketNumDisplay.innerText = ticketNum.padStart(3, "0");
  }
  
  const currentTicketNumber = document.getElementById("currentTicketNumber");
  const currentGuichet = document.getElementById("currentGuichet");
  const servingTicket = document.getElementById("servingTicket");
  
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
  if (waitMessageDisplay) {
    waitMessageDisplay.innerText = `Il y a encore ${count} personne${count > 1 ? 's' : ''} en attente.`;
  }
  
  const waitingCount = document.getElementById("waitingCount");
  if (waitingCount) {
    waitingCount.innerText = count;
  }
}

// Fonction pour générer automatiquement un ticket
function generateTicket() {
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
      
      // Mettre à jour l'affichage DOM de la file
      setTimeout(() => {
        updateQueueDisplayDOM();
      }, 500);
    })
    .catch(() => {
      showNotification("❌ Erreur lors de la génération du ticket", 'error');
    });
}

function callNextTicket() {
  const guichetId = guichetSelect.value;
  fetch(`${API_URL}/guichet/${guichetId}/next`, { method: "POST" })
    .then((res) => res.text())
    .then((text) => {
      updateTicketCalled(text);
      getSize();
      showNotification("📤 " + text, 'info');
      
      // Mettre à jour l'affichage DOM de la file
      setTimeout(() => {
        updateQueueDisplayDOM();
      }, 500);
    })
    .catch(() => showNotification("❌ Erreur lors de l'appel du ticket", 'error'));
}

function peekNextTicket() {
  const guichetId = guichetSelect.value;
  Promise.all([
    fetch(`${API_URL}/guichet/${guichetId}`).then((res) => res.text()),
    fetch(`${API_URL}/peek`).then((res) => res.text())
  ])
    .then(([currentText, nextText]) => {
      const current = currentText.match(/\d+/g)?.pop();
      const next = nextText.match(/\d+/g)?.pop();

      if (!next || next === current) {
        showNotification("ℹ️ Aucun nouveau ticket après le ticket actuel.", 'info');
        if (ticketNumDisplay) {
          ticketNumDisplay.innerText = "---";
        }
      } else {
        if (ticketNumDisplay) {
          ticketNumDisplay.innerText = next.padStart(3, "0");
        }
        showNotification("👁️ " + nextText, 'info');
      }
    })
    .catch(() => showNotification("❌ Impossible d'afficher le prochain ticket", 'error'));
}

function getSize() {
  fetch(`${API_URL}/size`)
    .then((res) => res.text())
    .then(updateWaitMessage)
    .catch(() => showNotification("❌ Erreur lors du comptage de la file", 'error'));
}

function showAllGuichets() {
  fetch(`${API_URL}/guichets`)
    .then(res => res.text())
    .then(text => showModal('État des guichets', text))
    .catch(() => showNotification("❌ Impossible d'afficher les guichets", 'error'));
}

function resetSystem() {
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
          
          // Mettre à jour l'affichage DOM de la file
          setTimeout(() => {
            updateQueueDisplayDOM();
          }, 500);
        })
        .catch(() => showNotification("❌ Impossible de réinitialiser la file", 'error'));
    }
  );
}

function printReport() {
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

// Fonctions pour les modales
function showModal(title, content) {
  const modal = document.getElementById('modal');
  const modalBody = document.getElementById('modalBody');
  
  modalBody.innerHTML = `
    <h3>${title}</h3>
    <div class="modal-text">${content}</div>
  `;
  
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function showConfirmModal(title, message, onConfirm) {
  const modal = document.getElementById('modal');
  const modalBody = document.getElementById('modalBody');
  
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

function confirmAction() {
  if (window.pendingConfirmAction) {
    window.pendingConfirmAction();
    window.pendingConfirmAction = null;
  }
  closeModal();
}

function closeModal() {
  const modal = document.getElementById('modal');
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
    window.pendingConfirmAction = null;
  }
}

// Initialisation au chargement avec gestion DOM de la file d'attente
setInterval(getSize, 5000);

// Variables pour la gestion de la file d'attente
let lastQueueCount = 0;
let queueUpdateInterval;
let waitTimeUpdateInterval;

// Fonction pour initialiser la gestion DOM de la file d'attente
function initializeQueueDOM() {
  // Mise à jour initiale
  setTimeout(() => {
    updateQueueDisplayDOM();
  }, 1000);

  // Vérifier les changements de file toutes les 3 secondes
  queueUpdateInterval = setInterval(() => {
    const currentCount = parseInt(document.getElementById('waitingCount')?.textContent) || 0;
    if (currentCount !== lastQueueCount) {
      showUpdateIndicatorDOM();
      setTimeout(() => {
        updateQueueDisplayDOM();
      }, 500);
      lastQueueCount = currentCount;
    }
  }, 3000);

  // Mettre à jour les temps d'attente toutes les 30 secondes
  waitTimeUpdateInterval = setInterval(() => {
    updateWaitTimesDOM();
  }, 30000);
}

// Fonction pour nettoyer les intervalles
function cleanupQueueDOM() {
  if (queueUpdateInterval) {
    clearInterval(queueUpdateInterval);
  }
  if (waitTimeUpdateInterval) {
    clearInterval(waitTimeUpdateInterval);
  }
}

window.onload = () => {
  initializeTicketCounter();
  getSize();

  if (guichetSelect) {
    const guichetId = guichetSelect.value;
    fetch(`${API_URL}/guichet/${guichetId}`)
      .then(res => res.text())
      .then(text => updateTicketCalled(text))
      .catch(() => updateTicketCalled("---"));
  }

  // Initialiser la gestion DOM de la file d'attente
  initializeQueueDOM();
};

// Exposer les fonctions globalement pour l'accès depuis l'HTML
window.generateTicket = generateTicket;
window.callNextTicket = callNextTicket;
window.peekNextTicket = peekNextTicket;
window.printReport = printReport;
window.showAllGuichets = showAllGuichets;
window.resetSystem = resetSystem;
window.closeModal = closeModal;
