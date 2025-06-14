// Ensure Supabase is available globally
if (!window.supabase) {
    console.error("Supabase SDK not loaded. Check the CDN link.");
}

// Initialize Supabase
const SUPABASE_URL = 'https://vyacbonatqmyfhixonej.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5YWNib25hdHFteWZoaXhvbmVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3MTY2NzIsImV4cCI6MjA1NjI5MjY3Mn0.zrG4WJLFXE0SzOezTXLNTjt-xwJNU9U4xawHrr9MgQw';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Displays a custom alert in the alert container.
 * @param {string} message - The message to display.
 * @param {string} type - The alert type, either "success" or "error".
 */
function showAlert(message, type) {
    const alertContainer = document.querySelector('.alert');
    const alertMessage = alertContainer.querySelector('p');
    alertMessage.textContent = message;
    
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
    const passwordInput = document.getElementById("password");
    const togglePassword = document.getElementById("toggle-password");
    const eyeIcon = togglePassword.querySelector("i");

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
});


document.addEventListener("DOMContentLoaded", () => {
    // Use the login button's ID to select it precisely
    const loginButton = document.getElementById("login-btn");

    loginButton.addEventListener("click", async () => {
        // Trim the values so that empty inputs are caught correctly
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        if (!email || !password) {
            showAlert("Please enter both email and password.", "error");
            return;
        }

        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });

            if (error) {
                showAlert(`Error: ${error.message}`, "error");
            } else {
                showAlert("Login successful!", "success");
                // Delay redirection to let the user see the success alert
                setTimeout(() => {
                    window.location.href = "index.html"; // Redirect to dashboard after login
                }, 1500);
            }
        } catch (err) {
            console.error("Unexpected error:", err);
            showAlert("Something went wrong. Please try again.", "error");
        }
    });
});


