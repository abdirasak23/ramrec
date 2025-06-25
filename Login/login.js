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

/**
 * Show/hide loader functionality
 * @param {boolean} show - Whether to show or hide the loader
 */
function showLoader(show) {
    const loader = document.querySelector('.loader') || document.querySelector('#loader');
    if (loader) {
        loader.style.display = show ? 'block' : 'none';
    }
}

// Password toggle functionality
document.addEventListener("DOMContentLoaded", () => {
    const passwordInput = document.getElementById("password");
    const togglePassword = document.getElementById("toggle-password");
    
    if (passwordInput && togglePassword) {
        const eyeIcon = togglePassword.querySelector("i");
        
        togglePassword.addEventListener("click", () => {
            if (passwordInput.type === "password") {
                passwordInput.type = "text";
                if (eyeIcon) {
                    eyeIcon.classList.remove("fa-eye");
                    eyeIcon.classList.add("fa-eye-slash");
                }
            } else {
                passwordInput.type = "password";
                if (eyeIcon) {
                    eyeIcon.classList.remove("fa-eye-slash");
                    eyeIcon.classList.add("fa-eye");
                }
            }
        });
    }
});

// Regular email/password login functionality
document.addEventListener("DOMContentLoaded", () => {
    const loginButton = document.getElementById("login-btn");

    if (loginButton) {
        loginButton.addEventListener("click", async (e) => {
            e.preventDefault();
            
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value.trim();

            if (!email || !password) {
                showAlert("Please enter both email and password.", "error");
                return;
            }

            showLoader(true);

            try {
                const { data, error } = await supabase.auth.signInWithPassword({ 
                    email: email, 
                    password: password 
                });

                if (error) {
                    showAlert(`Error: ${error.message}`, "error");
                } else {
                    showAlert("Login successful!", "success");
                    
                    // Store user session info if needed
                    if (data.user) {
                        console.log('User logged in:', data.user);
                    }
                    
                    // Delay redirection to let the user see the success alert
                    setTimeout(() => {
                        window.location.href = "../";
                    }, 1500);
                }
            } catch (err) {
                console.error("Unexpected error:", err);
                showAlert("Something went wrong. Please try again.", "error");
            } finally {
                showLoader(false);
            }
        });
    }
});

// Google login functionality
document.addEventListener("DOMContentLoaded", () => {
    const googleButton = document.querySelector('.btn-google') || document.getElementById('google-login-btn');
    
    if (googleButton) {
        googleButton.addEventListener("click", async (e) => {
            e.preventDefault();
            
            showLoader(true);
            // showAlert("Redirecting to Google...", "success");
            
            try {
                const { data, error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                        redirectTo: window.location.origin + window.location.pathname,
                        queryParams: {
                            access_type: 'offline',
                            prompt: 'consent',
                        }
                    }
                });
                
                if (error) {
                    console.error('Google OAuth error:', error);
                    showAlert(`Google login error: ${error.message}`, 'error');
                    showLoader(false);
                }
                // If successful, the page will redirect to Google
                
            } catch (err) {
                console.error("Unexpected Google login error:", err);
                showAlert("Google login failed. Please try again.", "error");
                showLoader(false);
            }
        });
    }
});

// Handle Google OAuth callback and user data
async function handleGoogleUserData(user) {
    try {
        showLoader(true);
        
        // Extract user information from Google OAuth
        const userId = user.id;
        const email = user.email;
        const fullName = user.user_metadata?.full_name || user.user_metadata?.name || '';
        const firstName = user.user_metadata?.given_name || '';
        const lastName = user.user_metadata?.family_name || '';
        const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || '';
        
        // Generate username from email or full name
        let username = '';
        if (fullName) {
            username = fullName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');
        } else if (email) {
            username = email.split('@')[0].replace(/[^a-z0-9]/g, '');
        }

        // Ensure username is not empty
        if (!username) {
            username = 'user' + Math.random().toString(36).substr(2, 9);
        }

        console.log('Processing Google user:', { userId, email, username, fullName });

        // Check if user already exists in the users table
        const { data: existingUser, error: checkError } = await supabase
            .from('users')
            .select('id, email, username')
            .eq('id', userId)
            .single();

        if (checkError && checkError.code !== 'PGRST116') {
            console.error('Error checking existing user:', checkError);
            showAlert('Error checking user data. Please try again.', 'error');
            return;
        }

        // If user doesn't exist, insert new user data (registration)
        if (!existingUser) {
            const { error: insertError } = await supabase
                .from('users')
                .insert([{
                    id: userId,
                    email: email,
                    username: username,
                    provider: 'google',
                    created_at: new Date().toISOString()
                }]);

            if (insertError) {
                console.error('Error inserting Google user into users table:', insertError);
                showAlert(`Error saving user data: ${insertError.message}`, 'error');
                return;
            } else {
                console.log('Google user data saved successfully in users table');
                showAlert('Google sign-up successful! Welcome!', 'success');
            }
        } else {
            // User exists - this is a login
            console.log('User already exists in users table - logging in');
            showAlert('Google sign-in successful! Welcome back!', 'success');
        }

        // Redirect after successful Google authentication
        setTimeout(() => {
            const redirectPath = localStorage.getItem('redirectAfterLogin') || '../';
            localStorage.removeItem('redirectAfterLogin');
            window.location.href = redirectPath;
        }, 2000);

    } catch (error) {
        console.error('Error handling Google user data:', error);
        showAlert('Error processing Google authentication. Please try again.', 'error');
    } finally {
        showLoader(false);
    }
}

// Listen for auth state changes (handles both login and registration)
supabase.auth.onAuthStateChange(async (event, session) => {
    console.log('Auth state changed:', event, session);
    
    if (event === 'SIGNED_IN' && session?.user) {
        const user = session.user;
        
        // Check if this is a Google OAuth user
        if (user.app_metadata?.provider === 'google' || user.aud === 'authenticated') {
            // Only handle Google user data if we're on the login page
            // This prevents the handler from running on other pages
            if (window.location.pathname.includes('login') || window.location.pathname.includes('Login')) {
                await handleGoogleUserData(user);
            }
        }
    } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
    }
});

// Check for existing session on page load
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error('Error getting session:', error);
            return;
        }
        
        if (session?.user) {
            console.log('Existing session found:', session.user);
            
            // If user is already logged in and on login page, redirect to dashboard
            if (window.location.pathname.includes('login') || window.location.pathname.includes('Login')) {
                showAlert('Already logged in! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = '../';
                }, 1500);
            }
        }
    } catch (error) {
        console.error('Error checking existing session:', error);
    }
});

// Utility function to sign out (you can call this from a logout button)
// async function signOut() {
//     try {
//         const { error } = await supabase.auth.signOut();
//         if (error) {
//             console.error('Error signing out:', error);
//             showAlert('Error signing out. Please try again.', 'error');
//         } else {
//             showAlert('Signed out successfully!', 'success');
//             setTimeout(() => {
//                 window.location.href = 'login.html'; // or your login page path
//             }, 1500);
//         }
//     } catch (error) {
//         console.error('Unexpected error during sign out:', error);
//         showAlert('Error signing out. Please try again.', 'error');
//     }
// }