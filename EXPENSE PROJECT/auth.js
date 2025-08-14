document.getElementById('loginBtn').addEventListener('click', () => {
    const username = document.getElementById('username').value.trim();
    if (username) {
      localStorage.setItem('currentUser', username);
      window.location.href = 'index.html';
    }
  });
  