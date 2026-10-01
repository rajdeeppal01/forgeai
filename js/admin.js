// The master admin email
const ADMIN_EMAIL = "rajdeeppalwork@gmail.com";

// Initialize local instances to avoid global scope conflicts
const adminAuth = firebase.auth();
const adminDb = firebase.firestore();

// DOM Elements
const loadingOverlay = document.getElementById('loading');
const authView = document.getElementById('auth-view');
const adminView = document.getElementById('admin-view');
const headerUser = document.getElementById('header-user');
const adminEmailSpan = document.getElementById('admin-email');
const metricUsers = document.getElementById('metric-users');
const metricProjects = document.getElementById('metric-projects');
const usersTableBody = document.getElementById('users-table-body');

// Auth State Observer
try {
  adminAuth.onAuthStateChanged(async (user) => {
    try {
      if (user) {
        if (user.email === ADMIN_EMAIL) {
          // User is Admin
          loadingOverlay.classList.add('hidden');
          authView.style.display = 'none';
          adminView.style.display = 'flex';
          headerUser.classList.remove('hidden');
          adminEmailSpan.textContent = user.email;
          
          await loadMetrics();
        } else {
          // User is logged in but NOT admin
          loadingOverlay.classList.add('hidden');
          authView.style.display = 'flex';
          adminView.style.display = 'none';
          headerUser.classList.add('hidden');
          authView.innerHTML = `
            <h1>Access Denied</h1>
            <p>Your account (${user.email}) does not have creator privileges.</p>
            <button class="btn" onclick="signOut()">Sign Out</button>
          `;
        }
      } else {
        // User is logged out
        loadingOverlay.classList.add('hidden');
        authView.style.display = 'flex';
        adminView.style.display = 'none';
        headerUser.classList.add('hidden');
      }
    } catch (innerErr) {
      loadingOverlay.innerHTML = `<span style="color:red">Error in auth callback: ${innerErr.message}</span>`;
    }
  });
} catch (err) {
  loadingOverlay.innerHTML = `<span style="color:red">Init Error: ${err.message}</span>`;
  console.error(err);
}

// Sign In
function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  
  // Force account selection prompt so you can easily switch accounts
  provider.setCustomParameters({
    prompt: 'select_account'
  });
  
  adminAuth.signInWithPopup(provider).catch((error) => {
    console.error("Auth Error:", error);
    alert("Authentication failed: " + error.message);
  });
}

// Sign Out
function signOut() {
  adminAuth.signOut();
  window.location.reload();
}

// Load Dashboard Metrics
async function loadMetrics() {
  try {
    const usersSnapshot = await adminDb.collection('users').get();
    
    let totalUsers = 0;
    let totalProjects = 0;
    let tableHTML = '';

    const promises = [];

    usersSnapshot.forEach(doc => {
      totalUsers++;
      const data = doc.data();
      const uid = doc.id;
      
      // We now save email in the 'users' doc directly via app.js
      const hasContext = data.context ? "Yes" : "No";
      const userEmail = data.email || 'Private';
      const lastActive = data.lastActiveAt ? new Date(data.lastActiveAt.toDate()).toLocaleDateString() : 'Unknown';
      
      tableHTML += `
        <tr>
          <td>
            <div class="user-cell">
              <div class="user-avatar">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
              </div>
              <span>User</span>
            </div>
          </td>
          <td style="color: var(--text-secondary);">${userEmail}</td>
          <td style="font-family: monospace; color: var(--text-secondary);">${uid}</td>
        </tr>
      `;

      // Count projects in the subcollection
      promises.push(
        adminDb.collection('users').doc(uid).collection('projects').get().then(projSnap => {
          totalProjects += projSnap.size;
        })
      );
    });

    // Wait for all project count queries to finish
    await Promise.all(promises);

    metricUsers.textContent = totalUsers;
    metricProjects.textContent = totalProjects;
    
    if (totalUsers === 0) {
      usersTableBody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--text-secondary);">No users found.</td></tr>`;
    } else {
      usersTableBody.innerHTML = tableHTML;
    }

  } catch (error) {
    console.error("Error loading metrics:", error);
    if (error.code === 'permission-denied') {
      alert("Permission denied! Your Firestore Rules do not allow reading the entire users collection. Please update your rules in the Firebase Console.");
      usersTableBody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: #ef4444;">Permission Denied. Update Firestore Rules.</td></tr>`;
    }
  }
}
