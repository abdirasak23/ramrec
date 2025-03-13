// Ensure Supabase is loaded
if (!window.supabase) {
    console.error("Supabase SDK not loaded. Check the CDN link.");
}

// Initialize Supabase
const SUPABASE_URL = 'https://vyacbonatqmyfhixonej.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5YWNib25hdHFteWZoaXhvbmVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3MTY2NzIsImV4cCI6MjA1NjI5MjY3Mn0.zrG4WJLFXE0SzOezTXLNTjt-xwJNU9U4xawHrr9MgQw';

// Create Supabase client
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", () => {
    const loginButton = document.querySelector("button");

    loginButton.addEventListener("click", async () => {
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        if (!email || !password) {
            alert("Please enter both email and password.");
            return;
        }

        try {
            // Authenticate the user
            const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

            if (error) {
                alert(`Error: ${error.message}`);
                return;
            }

            // Ensure only the admin account can log in
            if (data.user.email !== "adminabka@gmail.com") {
                alert("Access denied! Only the admin can log in.");
                
                // Log out the unauthorized user
                await supabaseClient.auth.signOut();
                return;
            }

            alert("Admin login successful!");
            window.location.href = "admin.html"; // Redirect to admin dashboard

        } catch (err) {
            console.error("Unexpected error:", err);
            alert("Something went wrong. Please try again.");
        }
    });
});
