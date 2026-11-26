document.addEventListener("DOMContentLoaded", () => {
  setupInvitationOpening();
  setupSparkles();
  setupCountdown();
  setupReveal();
  setupRsvp();
});

function setupInvitationOpening() {
  const opening = document.getElementById("openingScreen");
  const envelope = document.getElementById("envelope");
  const button = document.getElementById("openInvitation");
  const letter = document.getElementById("invitationLetter");
  const main = document.getElementById("mainContent");
  const hint = document.getElementById("openHint");
  if (!opening || !envelope || !button || !main) return;

  let opened = false;
  button.addEventListener("click", () => {
    if (opened) return;
    opened = true;
    button.disabled = true;
    envelope.classList.add("is-open");
    hint.textContent = "Uma nova história começa...";
    burstSparkles(true);

    // A cartinha ganha destaque, permanece por um instante e desaparece.
    window.setTimeout(() => letter?.classList.add("is-fading"), 2600);
    window.setTimeout(() => {
      main.inert = false;
      main.classList.add("is-visible");
      opening.classList.add("is-leaving");
      setupReveal();
    }, 3650);
    window.setTimeout(() => opening.remove(), 4700);
  });
}

let sparkleContext;
let sparkleCanvas;
let particles = [];
let animationFrame = null;

function setupSparkles() {
  sparkleCanvas = document.getElementById("sparklesCanvas");
  if (!sparkleCanvas) return;
  sparkleContext = sparkleCanvas.getContext("2d");
  resizeSparkleCanvas();
  window.addEventListener("resize", resizeSparkleCanvas, { passive: true });
  startGlitterRain();
}

function resizeSparkleCanvas() {
  if (!sparkleCanvas) return;
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  sparkleCanvas.width = Math.floor(window.innerWidth * ratio);
  sparkleCanvas.height = Math.floor(window.innerHeight * ratio);
  sparkleCanvas.style.width = `${window.innerWidth}px`;
  sparkleCanvas.style.height = `${window.innerHeight}px`;
  sparkleContext.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function makeGlitterParticle(startAnywhere = false) {
  const colors = ["#fffef8", "#fff4d1", "#f3dfaa", "#e9cc82", "#ffffff"];
  return {
    x: Math.random() * window.innerWidth,
    y: startAnywhere ? Math.random() * window.innerHeight : -8 - Math.random() * 45,
    vx: (Math.random() - 0.5) * 0.42,
    vy: 0.45 + Math.random() * 1.15,
    size: 0.65 + Math.random() * 2.1,
    alpha: 0.25 + Math.random() * 0.62,
    twinkle: Math.random() * Math.PI * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    sparkle: Math.random() > 0.82
  };
}

function startGlitterRain() {
  if (!sparkleContext || !sparkleCanvas) return;
  particles = Array.from({ length: window.innerWidth < 600 ? 65 : 105 }, () => makeGlitterParticle(true));
  if (animationFrame) cancelAnimationFrame(animationFrame);
  animateSparkles();
}

// Mantém a chuva de brilhos ativa durante toda a visita, inclusive após a abertura.
function burstSparkles() {
  if (!sparkleContext || !sparkleCanvas) return;
  const extra = Array.from({ length: window.innerWidth < 600 ? 45 : 75 }, () => {
    const p = makeGlitterParticle(false);
    p.y = window.innerHeight * (0.05 + Math.random() * 0.5);
    p.vy += 0.8;
    p.size += 0.5;
    p.alpha = Math.min(1, p.alpha + 0.2);
    return p;
  });
  particles.push(...extra);
  if (!animationFrame) animateSparkles();
}

function animateSparkles() {
  if (!sparkleContext || !sparkleCanvas) return;
  sparkleContext.clearRect(0, 0, window.innerWidth, window.innerHeight);

  // Reposição constante para que a chuva nunca termine.
  const targetCount = window.innerWidth < 600 ? 65 : 105;
  while (particles.length < targetCount) particles.push(makeGlitterParticle(false));

  particles = particles.filter(p => p.y < window.innerHeight + 12);
  particles.forEach(p => {
    p.x += p.vx + Math.sin(p.twinkle) * 0.16;
    p.y += p.vy;
    p.twinkle += 0.035;
    sparkleContext.save();
    sparkleContext.globalAlpha = p.alpha * (0.58 + (Math.sin(p.twinkle) + 1) * 0.2);
    sparkleContext.fillStyle = p.color;
    sparkleContext.shadowBlur = p.sparkle ? 10 : 5;
    sparkleContext.shadowColor = p.color;
    sparkleContext.beginPath();
    sparkleContext.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    sparkleContext.fill();
    if (p.sparkle && Math.sin(p.twinkle * 1.8) > 0.15) {
      sparkleContext.globalAlpha *= 0.65;
      sparkleContext.lineWidth = 0.65;
      sparkleContext.strokeStyle = p.color;
      sparkleContext.beginPath();
      sparkleContext.moveTo(p.x - p.size * 2.1, p.y);
      sparkleContext.lineTo(p.x + p.size * 2.1, p.y);
      sparkleContext.moveTo(p.x, p.y - p.size * 2.1);
      sparkleContext.lineTo(p.x, p.y + p.size * 2.1);
      sparkleContext.stroke();
    }
    sparkleContext.restore();
  });
  animationFrame = requestAnimationFrame(animateSparkles);
}

function setupCountdown() {
  const target = new Date("2027-02-27T16:00:00-03:00").getTime();
  const update = () => {
    const diff = Math.max(0, target - Date.now());
    const values = {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff / 3600000) % 24),
      minutes: Math.floor((diff / 60000) % 60),
      seconds: Math.floor((diff / 1000) % 60)
    };
    Object.entries(values).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = String(value).padStart(2, "0");
    });
  };
  update();
  window.setInterval(update, 1000);
}

let revealObserver;
function setupReveal() {
  const elements = document.querySelectorAll(".reveal:not(.is-in)");
  if (!("IntersectionObserver" in window)) {
    elements.forEach(el => el.classList.add("is-in"));
    return;
  }
  if (revealObserver) revealObserver.disconnect();
  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-in");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .12 });
  elements.forEach(el => revealObserver.observe(el));
}

function setupRsvp() {
  const form = document.getElementById("rsvpForm");
  if (!form) return;
  form.addEventListener("submit", event => {
    event.preventDefault();
    const name = document.getElementById("guestName").value.trim();
    const attendance = document.getElementById("guestAttendance").value;
    const message = document.getElementById("guestMessage").value.trim();
    const text = [
      "Olá! Confirmação de presença para o casamento de Maria Eduarda & Luiz:",
      `Nome: ${name}`,
      `Presença: ${attendance}`,
      message ? `Mensagem: ${message}` : ""
    ].filter(Boolean).join("\n");

    // Configure o número dos noivos no formato internacional, somente números.
    const whatsappNumber = "5512992591266"; // Ex.: 5511999999999
    if (!whatsappNumber) {
      const note = document.getElementById("formNote");
      if (note) note.textContent = "O formulário está pronto. Para enviar pelo WhatsApp, falta inserir o número dos noivos no arquivo script.js.";
      return;
    }
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  });
}

/* Chuva de glitter dourado mais cheia e cintilante ao abrir o envelope. */
