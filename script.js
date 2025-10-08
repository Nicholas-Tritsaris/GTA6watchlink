const DEMO_USER = 'admin';
const DEMO_PASS = 'admin1';

const loginOverlay = document.getElementById('loginOverlay');
const loginForm = document.getElementById('loginForm');
const loginUser = document.getElementById('loginUser');
const loginPass = document.getElementById('loginPass');
const demoBtn = document.getElementById('demoBtn');
const loginMsg = document.getElementById('loginMsg');
const mainContent = document.getElementById('mainContent');

// Demo button fills credentials
demoBtn.addEventListener('click', () => {
  loginUser.value = DEMO_USER;
  loginPass.value = DEMO_PASS;
  loginPass.focus();
  loginMsg.style.color = '#bfe8c7';
  loginMsg.textContent = 'Demo credentials filled. Click Sign in.';
});

// Handle login
loginForm.addEventListener('submit', e => {
  e.preventDefault();
  const u = loginUser.value.trim();
  const p = loginPass.value.trim();

  if (u === DEMO_USER && p === DEMO_PASS) {
    loginMsg.style.color = '#bfe8c7';
    loginMsg.textContent = 'Access granted! Unlocking stream...';
    // hide overlay and show main content
    loginOverlay.style.display = 'none';
    mainContent.style.display = 'block';
  } else {
    loginMsg.style.color = '#f88';
    loginMsg.textContent = 'Invalid credentials. Try again.';
    loginPass.value = '';
    loginPass.focus();
  }
});
