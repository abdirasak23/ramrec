// Ensure Supabase is available globally
if (!window.supabase) {
    console.error("Supabase SDK not loaded. Check the CDN link.");
  }
  
  // Initialize Supabase client
  const SUPABASE_URL = 'https://vyacbonatqmyfhixonej.supabase.co';
  const SUPABASE_ANON_KEY =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5YWNib25hdHFteWZoaXhvbmVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3MTY2NzIsImV4cCI6MjA1NjI5MjY3Mn0.zrG4WJLFXE0SzOezTXLNTjt-xwJNU9U4xawHrr9MgQw';
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  /**
   * Displays a custom alert in the alert container.
   * @param {string} message - The message to display.
   * @param {string} type - The alert type, either "success" or "error".
   */
  function showAlert(message, type) {
    const alertContainer = document.querySelector('.alert');
    if (!alertContainer) return;
    const alertMessage = alertContainer.querySelector('p');
    if (alertMessage) alertMessage.textContent = message;
    
    // Set background color based on the alert type
    if (type === 'success') {
      alertContainer.style.backgroundColor = 'green';
    } else if (type === 'error') {
      alertContainer.style.backgroundColor = 'red';
    } else {
      alertContainer.style.backgroundColor = '';
    }
    // Display the alert container
    alertContainer.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      alertContainer.style.display = 'none';
    }, 5000);
  }
  
  document.addEventListener("DOMContentLoaded", () => {
    // Registration elements
    const registerButton = document.getElementById("register-btn");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    
    // Toggle password elements
    const togglePassword = document.getElementById("toggle-password");
    const eyeIcon = togglePassword ? togglePassword.querySelector("i") : null;
    
    // Register user on button click
    registerButton.addEventListener("click", async () => {
      const email = emailInput.value.trim();
      const password = passwordInput.value.trim();
  
      if (!email || !password) {
        showAlert("Please enter both email and password.", "error");
        return;
      }
  
      try {
        // Register the user with Supabase Auth
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) {
          showAlert(`Error: ${error.message}`, "error");
          return;
        }
        
        // Attempt to get the user ID immediately from signUp response.
        let userId = data && data.user ? data.user.id : null;
        
        // If user ID isn't immediately available (common when email confirmation is enabled)
        if (!userId) {
          // Listen for auth state changes to retrieve the user info when available.
          supabase.auth.onAuthStateChange(async (event, session) => {
            if (session && session.user) {
              const newUserId = session.user.id;
              // Insert user data into the public "users" table
              const { error: insertError } = await supabase
                .from('users')
                .insert([{ id: newUserId, email }]);
              if (insertError) {
                console.error("Error inserting user into users table (from auth state change):", insertError);
                showAlert(`Error saving user data: ${insertError.message}`, "error");
              } else {
                console.log("User data saved successfully in users table (from auth state change)");
              }
            }
          });
        } else {
          // If user ID is immediately available, insert directly into the "users" table
          const { error: insertError } = await supabase
            .from('users')
            .insert([{ id: userId, email }]);
          if (insertError) {
            console.error("Error inserting user into users table:", insertError);
            showAlert(`Error saving user data: ${insertError.message}`, "error");
          } else {
            console.log("User data saved successfully in users table");
          }
        }
        
        showAlert("Registration successful! Check your email to confirm.", "success");
        // Delay redirection to let the user see the success alert
        setTimeout(() => {
          window.location.href = "login.html";
        }, 1500);
        
      } catch (err) {
        console.error("Unexpected error:", err);
        showAlert("Something went wrong. Please try again later.", "error");
      }
    });
  
    // Toggle password visibility on eye icon click
    if (togglePassword && eyeIcon) {
      togglePassword.addEventListener("click", () => {
        if (passwordInput.type === "password") {
          passwordInput.type = "text";
          eyeIcon.classList.remove("fa-eye");
          eyeIcon.classList.add("fa-eye-slash"); // Change icon when visible
        } else {
          passwordInput.type = "password";
          eyeIcon.classList.remove("fa-eye-slash");
          eyeIcon.classList.add("fa-eye"); // Change icon back when hidden
        }
      });
    }
  });
  