// Ensure Supabase is available globally
if (!window.supabase) {
    console.error("Supabase SDK not loaded. Check the CDN link.");
  }
  
  // Initialize Supabase client
  const SUPABASE_URL = 'https://vyacbonatqmyfhixonej.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5YWNib25hdHFteWZoaXhvbmVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3MTY2NzIsImV4cCI6MjA1NjI5MjY3Mn0.zrG4WJLFXE0SzOezTXLNTjt-xwJNU9U4xawHrr9MgQw';
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  
  document.addEventListener('DOMContentLoaded', () => {
    const logoutButton = document.getElementById('logoutButton');
    
    logoutButton.addEventListener('click', async () => {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error signing out:', error.message);
        alert('Error signing out.');
      } else {
        alert('Logged out successfully.');
        // Redirect to index.html after logout
        window.location.href = 'index.html';
      }
    });
  });
  