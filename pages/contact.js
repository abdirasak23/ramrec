// Method 1: Using EmailJS (Recommended for client-side)
// First, include EmailJS in your HTML: <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>

// Initialize EmailJS (replace with your actual keys)
const EMAILJS_SERVICE_ID = 'service_fhwyoqa';
const EMAILJS_TEMPLATE_ID = 'template_sw66ckp';
const EMAILJS_PUBLIC_KEY = 'p3eepkuYgR6Be8w8v';

// Initialize EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);

// Enhanced form submission handler
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Check if at least one checkbox is selected
    if (selectedValues.size === 0) {
        alert('Please select at least one reason for contacting us.');
        return;
    }
    
    const button = document.querySelector('.submit-button');
    const originalText = button.textContent;
    
    // Show loading state
    button.textContent = 'Sending...';
    button.disabled = true;
    
    // Collect form data
    const formData = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        reasons: Array.from(selectedValues).join(', '),
        message: document.getElementById('message').value,
        timestamp: new Date().toLocaleString()
    };
    
    // Send email using EmailJS
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        to_email: 'info@horeye.me',
        from_name: formData.fullName,
        from_email: formData.email,
        subject: `New Contact Form Submission - ${formData.reasons}`,
        message: `
Name: ${formData.fullName}
Email: ${formData.email}
Reason(s): ${formData.reasons}
Message: ${formData.message}
Submitted: ${formData.timestamp}
        `,
        reply_to: formData.email
    })
    .then(function(response) {
        console.log('Email sent successfully!', response);
        alert('Thank you for your message! We\'ll get back to you within 24 hours.');
        
        // Reset form
        document.getElementById('contactForm').reset();
        selectedValues.clear();
        checkboxItems.forEach(item => {
            item.classList.remove('selected');
            item.querySelector('.checkbox').classList.remove('checked');
        });
    })
    .catch(function(error) {
        console.error('Failed to send email:', error);
        alert('Sorry, there was an error sending your message. Please try again or contact us directly at info@horeye.me');
    })
    .finally(function() {
        // Reset button state
        button.textContent = originalText;
        button.disabled = false;
    });
});

// Method 2: Using Fetch API with a backend service (like Formspree)
// Replace the above emailjs.send() with this approach:

/*
async function sendEmailViaFormspree(formData) {
    try {
        const response = await fetch('https://formspree.io/f/your_form_id', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: formData.fullName,
                email: formData.email,
                subject: `New Contact Form Submission - ${formData.reasons}`,
                message: `
Name: ${formData.fullName}
Email: ${formData.email}
Reason(s): ${formData.reasons}
Message: ${formData.message}
Submitted: ${formData.timestamp}
                `
            })
        });
        
        if (response.ok) {
            return { success: true };
        } else {
            throw new Error('Failed to send email');
        }
    } catch (error) {
        throw error;
    }
}
*/

// Method 3: Using Web3Forms (Another alternative)
/*
async function sendEmailViaWeb3Forms(formData) {
    try {
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                access_key: 'your_access_key_here',
                name: formData.fullName,
                email: formData.email,
                subject: `New Contact Form Submission - ${formData.reasons}`,
                message: `
Name: ${formData.fullName}
Email: ${formData.email}
Reason(s): ${formData.reasons}
Message: ${formData.message}
Submitted: ${formData.timestamp}
                `
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            return { success: true };
        } else {
            throw new Error(result.message || 'Failed to send email');
        }
    } catch (error) {
        throw error;
    }
}
*/

// Method 4: Using mailto (fallback - opens user's email client)
function sendEmailViaMailto(formData) {
    const subject = encodeURIComponent(`New Contact Form Submission - ${formData.reasons}`);
    const body = encodeURIComponent(`
Name: ${formData.fullName}
Email: ${formData.email}
Reason(s): ${formData.reasons}
Message: ${formData.message}
Submitted: ${formData.timestamp}
    `);
    
    const mailtoLink = `mailto:info@horeye.me?subject=${subject}&body=${body}`;
    window.location.href = mailtoLink;
}

// Complete enhanced form handler with multiple fallback options
function handleFormSubmission(e) {
    e.preventDefault();
    
    if (selectedValues.size === 0) {
        alert('Please select at least one reason for contacting us.');
        return;
    }
    
    const button = document.querySelector('.submit-button');
    const originalText = button.textContent;
    
    button.textContent = 'Sending...';
    button.disabled = true;
    
    const formData = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        reasons: Array.from(selectedValues).join(', '),
        message: document.getElementById('message').value,
        timestamp: new Date().toLocaleString()
    };
    
    // Try EmailJS first, then fallback to mailto
    if (typeof emailjs !== 'undefined') {
        // Use EmailJS method (shown above)
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
            to_email: 'info@horeye.me',
            from_name: formData.fullName,
            from_email: formData.email,
            subject: `New Contact Form Submission - ${formData.reasons}`,
            message: `
Name: ${formData.fullName}
Email: ${formData.email}
Reason(s): ${formData.reasons}
Message: ${formData.message}
Submitted: ${formData.timestamp}
            `,
            reply_to: formData.email
        })
        .then(function(response) {
            console.log('Email sent successfully!', response);
            alert('Thank you for your message! We\'ll get back to you within 24 hours.');
            resetForm();
        })
        .catch(function(error) {
            console.error('EmailJS failed:', error);
            // Fallback to mailto
            sendEmailViaMailto(formData);
        })
        .finally(function() {
            button.textContent = originalText;
            button.disabled = false;
        });
    } else {
        // Fallback to mailto if EmailJS is not available
        sendEmailViaMailto(formData);
        button.textContent = originalText;
        button.disabled = false;
    }
}

// Helper function to reset form
function resetForm() {
    document.getElementById('contactForm').reset();
    selectedValues.clear();
    checkboxItems.forEach(item => {
        item.classList.remove('selected');
        item.querySelector('.checkbox').classList.remove('checked');
    });
}

// Replace the existing form submission handler
document.getElementById('contactForm').removeEventListener('submit', arguments.callee);
document.getElementById('contactForm').addEventListener('submit', handleFormSubmission);