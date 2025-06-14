// Ensure Supabase is available globally
if (!window.supabase) {
    console.error("Supabase SDK not loaded. Check the CDN link.");
  }
  
  // Initialize Supabase client
  const SUPABASE_URL = 'https://vyacbonatqmyfhixonej.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5YWNib25hdHFteWZoaXhvbmVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3MTY2NzIsImV4cCI6MjA1NjI5MjY3Mn0.zrG4WJLFXE0SzOezTXLNTjt-xwJNU9U4xawHrr9MgQw';
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  document.addEventListener("DOMContentLoaded", () => {
    // Get the reset button from the DOM
    const resetButton = document.querySelector("button");
  
    resetButton.addEventListener("click", async () => {
      const email = document.getElementById("email").value.trim();
  
      if (!email) {
        alert("Please enter your email address.");
        return;
      }
  
      try {
        // Include the redirectTo option in the resetPasswordForEmail call
        const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: 'https://http://127.0.0.1:5500/login.html'
        });
        if (error) {
          alert(`Error: ${error.message}`);
        } else {
          alert("Password reset email sent. Please check your inbox.");
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        alert("Something went wrong. Please try again later.");
      }
    });
  });
  