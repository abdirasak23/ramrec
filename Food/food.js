// food.js

// Initialize Supabase client (ensure the supabase-js library is loaded in your HTML)
const SUPABASE_URL = 'https://vyacbonatqmyfhixonej.supabase.co';
const SUPABASE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5YWNib25hdHFteWZoaXhvbmVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3MTY2NzIsImV4cCI6MjA1NjI5MjY3Mn0.zrG4WJLFXE0SzOezTXLNTjt-xwJNU9U4xawHrr9MgQw';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Get the food ID and table from URL parameters (e.g., food_page.html?id=123&table=iftar)
const urlParams = new URLSearchParams(window.location.search);
const foodId = urlParams.get('id');
const table = urlParams.get('table') || 'foods';

// Global variables to store video data
let YOUTUBE_VIDEO_URL = 'https://www.youtube.com/watch?v=5Peo-ivmupE'; // Default fallback
let YOUTUBE_VIDEO_ID = '5Peo-ivmupE'; // Default fallback ID

const menuButton = document.querySelector('.menu');
const navMenu = document.querySelector('.nav');

// Toggle the active class on click
menuButton.addEventListener('click', () => {
  navMenu.classList.toggle('active');
});

// Function to extract YouTube video ID from full URL
function extractYouTubeID(url) {
  if (!url || typeof url !== 'string') {
    console.log('Invalid URL provided:', url);
    return null;
  }

  console.log('Extracting ID from URL:', url);
  
  // Clean the URL (remove extra spaces/characters)
  url = url.trim();
  
  // If it's already just an ID (11 characters), return it
  if (url.length === 11 && !/[\/\?&=\s]/.test(url)) {
    console.log('URL is already an ID:', url);
    return url;
  }
  
  // Multiple regex patterns to handle different YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
    /v=([a-zA-Z0-9_-]{11})/,
    /\/([a-zA-Z0-9_-]{11})(?:\?|$|&)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1] && match[1].length === 11) {
      console.log('Extracted video ID:', match[1]);
      return match[1];
    }
  }
  
  console.warn('Could not extract video ID from URL:', url);
  return null;
}

// Function to validate YouTube video ID
function isValidYouTubeID(videoId) {
  const isValid = videoId && 
                  typeof videoId === 'string' && 
                  videoId.length === 11 && 
                  /^[a-zA-Z0-9_-]+$/.test(videoId);
  
  console.log('Video ID validation:', videoId, 'is valid:', isValid);
  return isValid;
}

// Function to convert any YouTube URL to standard watch URL
function normalizeYouTubeURL(url) {
  if (!url) return null;
  
  const videoId = extractYouTubeID(url);
  if (!videoId) return null;
  
  return `https://www.youtube.com/watch?v=${videoId}`;
}

// Render the food details on the page
function renderFoodDetails(food) {
  console.log('Rendering food details:', food);
  
  // Update the page title
  document.title = `${food.food_name} Recipe | RAMREC`;

  // Update header ad section
  const adHeading = document.querySelector('.ad h2');
  if (adHeading) {
    adHeading.textContent = food.food_name;
  }

  // Update food details (Food Name, Cooking Time, Preparation Time, Difficulties)
  const detailsElements = document.querySelectorAll('.foodname h2');
  if (detailsElements.length >= 4) {
    detailsElements[0].textContent = food.food_name;
    detailsElements[1].textContent = food.cooking_time;
    detailsElements[2].textContent = food.preparation_time;
    detailsElements[3].textContent = food.difficulties;
  }

  // Update description text
  const descriptionHeading = document.querySelector('.description .text h2');
  if (descriptionHeading) {
    descriptionHeading.textContent = food.food_description;
  }

  // Update food image (thumbnail)
  const foodImage = document.querySelector('.food_image img');
  if (foodImage) {
    foodImage.src = food.food_image_url;
    foodImage.alt = food.food_name;
  }

  // Update video data
  updateVideoData(food);

  // Update ingredients list
  const ingredientsContainer = document.querySelector('.itemss');
  if (ingredientsContainer) {
    ingredientsContainer.innerHTML = ''; // Clear any existing content
    const ol = document.createElement('ol');
    // Apply your desired styles
    ol.style.fontSize = "20px";
    ol.style.fontWeight = "400";
    ol.style.position = "relative";
    ol.style.left = "30px";
    ol.style.listStyleType = "decimal";

    // If ingredients is already an array, iterate over it; otherwise, split the string.
    if (Array.isArray(food.ingredients)) {
      food.ingredients.forEach(ingredient => {
        const li = document.createElement('li');
        li.textContent = ingredient;
        ol.appendChild(li);
      });
    } else if (food.ingredients) {
      food.ingredients.split(',').forEach(ingredient => {
        const li = document.createElement('li');
        li.textContent = ingredient.trim();
        ol.appendChild(li);
      });
    }
    ingredientsContainer.appendChild(ol);
  }

  // Update nutrition information
  const nutritionDiv = document.querySelector('.nuts');
  if (nutritionDiv) {
    if (food.protein || food.vitamin || food.calories || food.carbohydrates) {
      nutritionDiv.innerHTML = `
        <h2>Protein <span>${food.protein || '0'}</span>g</h2>
        <h2>Vitamin <span>${food.vitamin || '0'}</span>g</h2>
        <h2>Calories <span>${food.calories || '0'}</span>g</h2>
        <h2>Carbohydrates <span>${food.carbohydrates || '0'}</span>g</h2>
      `;
    } else {
      nutritionDiv.innerHTML = '<h2>No nutrition information available.</h2>';
    }
  }
}

// Function to update video data from Supabase
function updateVideoData(food) {
  console.log('Updating video data with:', food);
  
  // Process the video_id field from database
  if (food.video_id) {
    console.log('Raw video_id from database:', food.video_id);
    
    // Store the full URL
    YOUTUBE_VIDEO_URL = normalizeYouTubeURL(food.video_id) || food.video_id;
    
    // Extract the video ID
    const extractedId = extractYouTubeID(food.video_id);
    
    if (isValidYouTubeID(extractedId)) {
      YOUTUBE_VIDEO_ID = extractedId;
      console.log('Successfully set video URL:', YOUTUBE_VIDEO_URL);
      console.log('Successfully set video ID:', YOUTUBE_VIDEO_ID);
    } else {
      console.warn('Invalid video ID extracted, using defaults');
      console.warn('Problematic video_id value:', food.video_id);
      // Keep defaults
    }
  } else {
    console.log('No video_id found in database, using defaults');
  }

  // Update video credit text
  const videoDuration = document.querySelector('.video-duration');
  if (videoDuration) {
    if (food.video_credit) {
      videoDuration.textContent = `Credit: ${food.video_credit}`;
    } else {
      videoDuration.textContent = 'Credit: Cunto kariso'; // Default fallback
    }
  }

  // Update thumbnail to use YouTube thumbnail if we have a valid video ID
  const thumbnail = document.getElementById('thumbnail');
  if (thumbnail && isValidYouTubeID(YOUTUBE_VIDEO_ID)) {
    // Try different quality thumbnails
    const thumbnailQualities = [
      `https://img.youtube.com/vi/${YOUTUBE_VIDEO_ID}/maxresdefault.jpg`,
      `https://img.youtube.com/vi/${YOUTUBE_VIDEO_ID}/hqdefault.jpg`,
      `https://img.youtube.com/vi/${YOUTUBE_VIDEO_ID}/mqdefault.jpg`,
      `https://img.youtube.com/vi/${YOUTUBE_VIDEO_ID}/default.jpg`
    ];
    
    // Try to load the highest quality thumbnail
    function tryThumbnail(index = 0) {
      if (index >= thumbnailQualities.length) {
        console.log('All YouTube thumbnails failed, keeping original image');
        return;
      }
      
      const testImg = new Image();
      testImg.onload = function() {
        console.log('Successfully loaded YouTube thumbnail:', thumbnailQualities[index]);
        thumbnail.src = thumbnailQualities[index];
      };
      testImg.onerror = function() {
        console.log('Failed to load thumbnail:', thumbnailQualities[index]);
        tryThumbnail(index + 1);
      };
      testImg.src = thumbnailQualities[index];
    }
    
    tryThumbnail();
  }
}

async function loadFoodDetails() {
  console.log('Loading food details for ID:', foodId, 'from table:', table);
  
  // Check if the food details are cached in sessionStorage
  const cachedData = sessionStorage.getItem('selectedFood');
  if (cachedData) {
    try {
      const food = JSON.parse(cachedData);
      // Confirm that the cached food matches the current id and table
      if (food.id == foodId && food.table === table) {
        console.log('Using cached food data');
        renderFoodDetails(food);
        setupVideoPlayer(); // Setup video player after rendering
        return;
      }
    } catch (e) {
      console.warn('Failed to parse cached data:', e);
      sessionStorage.removeItem('selectedFood');
    }
  }

  // Otherwise, fetch from Supabase
  try {
    console.log('Fetching from Supabase...');
    const { data: food, error } = await supabaseClient
      .from(table)
      .select('*') // This will include video_id and video_credit columns
      .eq('id', foodId)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    if (!food) {
      console.error('No food found with ID:', foodId);
      throw new Error('Food item not found');
    }
    
    console.log('Successfully fetched food data:', food);
    
    // Store food in sessionStorage for caching
    food.table = table; // include table info for future checks
    sessionStorage.setItem('selectedFood', JSON.stringify(food));
    
    renderFoodDetails(food);
    setupVideoPlayer(); // Setup video player after rendering
    
  } catch (error) {
    console.error('Error loading food details:', error);
    
    // Show error message to user
    const errorHTML = `
      <div style="padding: 20px; text-align: center;">
        <h2>Error Loading Recipe</h2>
        <p>Sorry, we couldn't load this recipe. Please try again later.</p>
        <p><strong>Error:</strong> ${error.message}</p>
        <button onclick="window.location.reload()" style="padding: 10px 20px; margin-top: 10px;">Retry</button>
      </div>
    `;
    document.body.innerHTML = errorHTML;
  }
}

// Function to setup video player functionality
function setupVideoPlayer() {
  console.log('Setting up video player...');
  
  // Get DOM elements
  const thumbnailOverlay = document.getElementById('thumbnailOverlay');
  const playButton = document.getElementById('playButton');
  const youtubePlayer = document.getElementById('youtubePlayer');
  const thumbnail = document.getElementById('thumbnail');
  
  // Check if elements exist before adding event listeners
  if (!thumbnailOverlay || !playButton || !youtubePlayer) {
    console.warn('Video player elements not found:', {
      thumbnailOverlay: !!thumbnailOverlay,
      playButton: !!playButton,
      youtubePlayer: !!youtubePlayer
    });
    return;
  }

  console.log('Video player elements found, setting up event listeners...');

  // Play video function
  function playVideo() {
    console.log('Play video called');
    console.log('Current video URL:', YOUTUBE_VIDEO_URL);
    console.log('Current video ID:', YOUTUBE_VIDEO_ID);
    
    // Validate video ID before playing
    if (!isValidYouTubeID(YOUTUBE_VIDEO_ID)) {
      console.error('Invalid YouTube video ID:', YOUTUBE_VIDEO_ID);
      alert('Sorry, this video is not available. Please check the video URL in the database.');
      return;
    }
    
    console.log('Playing video with ID:', YOUTUBE_VIDEO_ID);
    
    // Hide the overlay and thumbnail
    thumbnailOverlay.style.display = 'none';
    if (thumbnail) {
      thumbnail.style.display = 'none';
    }
    
    // Build the embed URL with all necessary parameters
    const embedUrl = `https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?` + 
      'autoplay=1' +
      '&rel=0' +
      '&modestbranding=1' +
      '&showinfo=0' +
      '&controls=1' +
      '&fs=1' +
      '&cc_load_policy=0' +
      '&iv_load_policy=3' +
      '&autohide=0' +
      '&origin=' + encodeURIComponent(window.location.origin);
    
    console.log('Embed URL:', embedUrl);
    
    // Show and load the YouTube player
    youtubePlayer.style.display = 'block';
    youtubePlayer.src = embedUrl;
    
    // Set focus to the iframe for keyboard users
    youtubePlayer.focus();
  }
  
  // Clear any existing event listeners by cloning elements
  const newThumbnailOverlay = thumbnailOverlay.cloneNode(true);
  const newPlayButton = newThumbnailOverlay.querySelector('#playButton') || 
                       newThumbnailOverlay.querySelector('.play-button');
  
  // Replace the old overlay with the new one
  thumbnailOverlay.parentNode.replaceChild(newThumbnailOverlay, thumbnailOverlay);
  
  // Add event listeners to the new elements
  if (newThumbnailOverlay) {
    console.log('Adding click event to thumbnail overlay');
    
    // Click event for overlay
    newThumbnailOverlay.addEventListener('click', function(e) {
      console.log('Thumbnail overlay clicked');
      playVideo();
    });
    
    // Keyboard support for overlay
    newThumbnailOverlay.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        console.log('Keyboard event triggered on overlay');
        e.preventDefault();
        playVideo();
      }
    });
    
    // Make thumbnail focusable and accessible
    newThumbnailOverlay.setAttribute('tabindex', '0');
    newThumbnailOverlay.setAttribute('role', 'button');
    newThumbnailOverlay.setAttribute('aria-label', 'Play video');
    newThumbnailOverlay.style.cursor = 'pointer';
  }
  
  // Additional click handler for play button if it exists separately
  if (newPlayButton && newPlayButton !== newThumbnailOverlay) {
    console.log('Adding click event to play button');
    newPlayButton.addEventListener('click', function(e) {
      console.log('Play button clicked');
      e.stopPropagation(); // Prevent triggering the overlay click
      playVideo();
    });
  }
  
  console.log('Video player setup complete');
}

// Debug function to check current video data
function debugVideoData() {
  console.log('=== VIDEO DEBUG INFO ===');
  console.log('YOUTUBE_VIDEO_URL:', YOUTUBE_VIDEO_URL);
  console.log('YOUTUBE_VIDEO_ID:', YOUTUBE_VIDEO_ID);
  console.log('Is valid ID:', isValidYouTubeID(YOUTUBE_VIDEO_ID));
  console.log('========================');
}

// Load food details when the DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM loaded, starting application...');
  loadFoodDetails();
});

// Add debug function to global scope for testing
window.debugVideoData = debugVideoData;






/// Check if Supabase is loaded
if (typeof supabase === 'undefined') {
    console.error('Supabase library not loaded. Please include the Supabase script before this file.');
}

// Initialize Supabase client
// const SUPABASE_URL = 'https://vyacbonatqmyfhixonej.supabase.co';
// const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5YWNib25hdHFteWZoaXhvbmVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3MTY2NzIsImV4cCI6MjA1NjI5MjY3Mn0.zrG4WJLFXE0SzOezTXLNTjt-xwJNU9U4xawHrr9MgQw';

// let supabaseClient;
try {
    supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
} catch (error) {
    console.error('Failed to create Supabase client:', error);
}

// Global variables
let currentRating = 0;
let userHasRated = false;
let currentProductId = null; // This should be set based on the current product being viewed

// Get product ID from various sources
function getCurrentProductId() {
    let productId = null;
    
    // Method 1: Get from URL parameter (?product_id=123 or ?id=123)
    const urlParams = new URLSearchParams(window.location.search);
    productId = urlParams.get('product_id') || urlParams.get('id') || urlParams.get('productId');
    if (productId) {
        console.log('Product ID found in URL params:', productId);
        return productId;
    }
    
    // Method 2: Get from data attribute on rate button
    const rateButton = document.querySelector('.rate');
    if (rateButton) {
        productId = rateButton.dataset.productId || rateButton.dataset.id || rateButton.getAttribute('data-product-id');
        if (productId) {
            console.log('Product ID found in rate button data attribute:', productId);
            return productId;
        }
    }
    
    // Method 3: Get from any element with product-id data attribute
    const productElement = document.querySelector('[data-product-id]');
    if (productElement) {
        productId = productElement.dataset.productId;
        console.log('Product ID found in element data attribute:', productId);
        return productId;
    }
    
    // Method 4: Get from meta tag
    const productMeta = document.querySelector('meta[name="product-id"]') || 
                       document.querySelector('meta[property="product:id"]');
    if (productMeta) {
        productId = productMeta.content;
        console.log('Product ID found in meta tag:', productId);
        return productId;
    }
    
    // Method 5: Extract from page URL patterns
    const urlPatterns = [
        /\/product\/([^\/\?]+)/i,  // /product/123
        /\/item\/([^\/\?]+)/i,     // /item/123
        /\/p\/([^\/\?]+)/i,        // /p/123
        /\/products\/([^\/\?]+)/i, // /products/123
        /\/([^\/\?]+)\.html/i      // /product-123.html
    ];
    
    for (const pattern of urlPatterns) {
        const match = window.location.pathname.match(pattern);
        if (match && match[1]) {
            productId = match[1];
            console.log('Product ID found in URL path:', productId);
            return productId;
        }
    }
    
    // Method 6: Get from page title or heading
    const titleElement = document.querySelector('h1[data-product-id]') || 
                        document.querySelector('[data-product-id]:not(script)');
    if (titleElement) {
        productId = titleElement.dataset.productId;
        console.log('Product ID found in title element:', productId);
        return productId;
    }
    
    // Method 7: Get from global JavaScript variable (if set)
    if (typeof window.PRODUCT_ID !== 'undefined' && window.PRODUCT_ID) {
        productId = window.PRODUCT_ID;
        console.log('Product ID found in global variable:', productId);
        return productId;
    }
    
    // Method 8: Get from body or html data attribute
    const bodyProductId = document.body.dataset.productId || document.documentElement.dataset.productId;
    if (bodyProductId) {
        productId = bodyProductId;
        console.log('Product ID found in body/html data attribute:', productId);
        return productId;
    }
    
    // Method 9: Prompt user to enter product ID (for testing/debugging)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        productId = prompt('Product ID not found. Please enter the product ID for testing:');
        if (productId) {
            console.log('Product ID entered by user:', productId);
            return productId;
        }
    }
    
    // ERROR: No product ID found
    console.error('❌ CRITICAL ERROR: Product ID not found!');
    console.error('Please set the product ID using one of these methods:');
    console.error('1. URL parameter: ?product_id=123');
    console.error('2. Data attribute: <button class="rate" data-product-id="123">');
    console.error('3. Meta tag: <meta name="product-id" content="123">');
    console.error('4. Global variable: window.PRODUCT_ID = "123"');
    console.error('5. Body data attribute: <body data-product-id="123">');
    
    // Show user-friendly error
    alert('Error: Product ID not found. Please contact support or refresh the page.');
    return null;
}

// Initialize DOM elements
const stars = document.querySelectorAll('.star');
const ratingDisplay = document.getElementById('ratingDisplay');
const submitBtn = document.getElementById('submitBtn');
const feedbackInput = document.getElementById('feedbackInput');

// Check if user is authenticated
async function isUserAuthenticated() {
    try {
        if (typeof supabase === 'undefined' || !supabaseClient) {
            console.error('Supabase not available');
            return false;
        }
        
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (error) {
            console.error('Error checking authentication status:', error.message);
            return false;
        }
        return !!session;
    } catch (err) {
        console.error('Unexpected error checking authentication:', err);
        return false;
    }
}

// Check if user has already rated this specific product
async function hasUserRatedProduct(productId) {
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) return false;
        
        const { data, error } = await supabaseClient
            .from('rates')
            .select('id, rating, feedback, created_at')
            .eq('user_id', session.user.id)
            .eq('product_id', productId)
            .single();
            
        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
            console.error('Error checking user rating:', error.message);
            return false;
        }
        
        return data ? { hasRated: true, ratingData: data } : { hasRated: false };
    } catch (err) {
        console.error('Unexpected error checking user rating:', err);
        return { hasRated: false };
    }
}

// Create login container HTML
function createLoginContainer() {
    return `
        <div class="rate-container" style="text-align: center; padding: 40px; background: white; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); max-width: 400px; margin: 0 auto;">
            <button class="close-btn" onclick="closeContainer()" style="position: absolute; top: 15px; right: 15px; background: none; border: none; font-size: 24px; cursor: pointer; color: #999;">&times;</button>
            
            <div style="margin-bottom: 30px;">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #007bff, #0056b3); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                    <i class="bx bx-lock-alt" style="font-size: 40px; color: white;"></i>
                </div>
                <h2 style="font-size: 24px; font-weight: 600; color: #2c3e50; margin-bottom: 10px;">Login Required</h2>
                <p style="font-size: 16px; color: #7f8c8d; margin-bottom: 30px;">Please login to rate and provide feedback</p>
            </div>
            
            <button onclick="redirectToLogin()" style="
                background: linear-gradient(135deg, #007bff, #0056b3);
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 25px;
                font-size: 16px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                margin-right: 10px;
            ">Login</button>
            
            <button onclick="closeContainer()" style="
                background: transparent;
                color: #6c757d;
                border: 2px solid #e9ecef;
                padding: 12px 30px;
                border-radius: 25px;
                font-size: 16px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
            ">Cancel</button>
        </div>
    `;
}

// Create already rated container HTML
function createAlreadyRatedContainer(ratingData) {
    const ratingStars = '★'.repeat(ratingData.rating) + '☆'.repeat(5 - ratingData.rating);
    const ratingDate = new Date(ratingData.created_at).toLocaleDateString();
    
    return `
        <div class="rate-container" style="text-align: center; padding: 40px; background: white; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); max-width: 400px; margin: 0 auto;">
            <button class="close-btn" onclick="closeContainer()" style="position: absolute; top: 15px; right: 15px; background: none; border: none; font-size: 24px; cursor: pointer; color: #999;">&times;</button>
            
            <div style="margin-bottom: 30px;">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #28a745, #20c997); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                    <i class="bx bx-check" style="font-size: 40px; color: white;"></i>
                </div>
                <h2 style="font-size: 24px; font-weight: 600; color: #2c3e50; margin-bottom: 10px;">Thank You!</h2>
                <p style="font-size: 16px; color: #7f8c8d; margin-bottom: 20px;">You have already rated this product</p>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                    <div style="font-size: 24px; color: #ffc107; margin-bottom: 10px;">${ratingStars}</div>
                    <p style="font-size: 18px; font-weight: 600; color: #2c3e50; margin-bottom: 5px;">${ratingData.rating} out of 5 stars</p>
                    <p style="font-size: 14px; color: #6c757d;">Rated on ${ratingDate}</p>
                    ${ratingData.feedback ? `<p style="font-size: 14px; color: #495057; margin-top: 15px; font-style: italic;">"${ratingData.feedback}"</p>` : ''}
                </div>
            </div>
            
            <button onclick="closeContainer()" style="
                background: linear-gradient(135deg, #28a745, #20c997);
                color: white;
                border: none;
                padding: 12px 30px;
                border-radius: 25px;
                font-size: 16px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
            ">OK</button>
        </div>
    `;
}

// Create rating form container HTML
function createRatingContainer() {
    return `
        <div class="rate-container" style="text-align: center; padding: 40px; background: white; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); max-width: 500px; margin: 0 auto;">
            <button class="close-btn" onclick="closeContainer()" style="position: absolute; top: 15px; right: 15px; background: none; border: none; font-size: 24px; cursor: pointer; color: #999;">&times;</button>
            
            <div style="margin-bottom: 30px;">
                <h2 style="font-size: 24px; font-weight: 600; color: #2c3e50; margin-bottom: 10px;">Rate This Product</h2>
                <p style="font-size: 16px; color: #7f8c8d; margin-bottom: 30px;">Your feedback helps us improve</p>
            </div>
            
            <div class="stars" style="display: flex; justify-content: center; gap: 10px; margin-bottom: 20px;">
                ${[1, 2, 3, 4, 5].map(i => `
                    <span class="star" data-rating="${i}" style="font-size: 32px; color: #e0e0e0; cursor: pointer; transition: all 0.2s ease;">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26 12,2"/>
                        </svg>
                    </span>
                `).join('')}
            </div>
            
            <div id="ratingDisplay" style="font-size: 18px; color: #2c3e50; margin-bottom: 20px; min-height: 25px; opacity: 0; transition: opacity 0.3s ease;"></div>
            
            <div style="margin-bottom: 30px;">
                <textarea id="feedbackInput" placeholder="Share your experience (optional)" style="
                    width: 100%;
                    min-height: 100px;
                    padding: 12px;
                    border: 2px solid #e9ecef;
                    border-radius: 8px;
                    font-size: 14px;
                    resize: vertical;
                    font-family: inherit;
                    transition: border-color 0.2s ease;
                " maxlength="500"></textarea>
                <div style="text-align: right; font-size: 12px; color: #6c757d; margin-top: 5px;">
                    <span id="charCount">0</span>/500
                </div>
            </div>
            
            <button id="submitBtn" onclick="submitRating()" disabled style="
                background: #e9ecef;
                color: #6c757d;
                border: none;
                padding: 12px 40px;
                border-radius: 25px;
                font-size: 16px;
                font-weight: 500;
                cursor: not-allowed;
                transition: all 0.2s ease;
            ">Submit Rating</button>
        </div>
    `;
}

// Redirect to login page
function redirectToLogin() {
    window.location.href = '/login.html';
}

// Star rating functionality
function initializeStarRating() {
    const stars = document.querySelectorAll('.star');
    const ratingDisplay = document.getElementById('ratingDisplay');
    const submitBtn = document.getElementById('submitBtn');
    
    stars.forEach(star => {
        star.addEventListener('click', function() {
            if (userHasRated) return;
            
            const rating = parseInt(this.getAttribute('data-rating'));
            setRating(rating);
        });

        star.addEventListener('mouseenter', function() {
            if (userHasRated) return;
            
            const rating = parseInt(this.getAttribute('data-rating'));
            highlightStars(rating);
        });
    });

    // Reset stars on mouse leave from container
    document.querySelector('.stars')?.addEventListener('mouseleave', function() {
        if (userHasRated) return;
        highlightStars(currentRating);
    });
}

function setRating(rating) {
    if (userHasRated) return;
    
    currentRating = rating;
    highlightStars(rating);
    
    // Show rating text
    const ratingTexts = {
        1: "Poor - We're sorry to hear that",
        2: "Fair - We'll work to improve",
        3: "Good - Thank you for your feedback",
        4: "Very Good - We're glad you're satisfied",
        5: "Excellent - Thank you for the amazing review!"
    };
    
    const ratingDisplay = document.getElementById('ratingDisplay');
    const submitBtn = document.getElementById('submitBtn');
    
    if (ratingDisplay) {
        ratingDisplay.textContent = `${rating} star${rating > 1 ? 's' : ''} - ${ratingTexts[rating]}`;
        ratingDisplay.style.opacity = '1';
    }
    
    // Enable submit button
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.style.background = 'linear-gradient(135deg, #007bff, #0056b3)';
        submitBtn.style.color = 'white';
        submitBtn.style.cursor = 'pointer';
    }
    
    // Auto-focus on feedback textarea
    setTimeout(() => {
        const feedbackInput = document.getElementById('feedbackInput');
        if (feedbackInput) {
            feedbackInput.focus();
        }
    }, 300);
}

function highlightStars(rating) {
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

// Initialize character counter for feedback
function initializeCharCounter() {
    const feedbackInput = document.getElementById('feedbackInput');
    const charCount = document.getElementById('charCount');
    
    if (feedbackInput && charCount) {
        feedbackInput.addEventListener('input', function() {
            const currentLength = this.value.length;
            charCount.textContent = currentLength;
            
            if (currentLength > 450) {
                charCount.style.color = '#dc3545';
            } else {
                charCount.style.color = '#6c757d';
            }
        });
    }
}

// Submit rating to database
async function submitRating() {
    if (currentRating === 0 || userHasRated) return;
    
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.textContent;
    
    try {
        // Show loading state
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;
        
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) {
            alert('Please login to submit rating');
            return;
        }
        
        const feedback = document.getElementById('feedbackInput').value.trim();
        const productId = getCurrentProductId();
        
        // Prepare data for insertion
        const ratingData = {
            user_id: session.user.id,
            product_id: productId,
            rating: currentRating,
            feedback: feedback || null,
            created_at: new Date().toISOString()
        };
        
        // Save to database
        const { data, error } = await supabaseClient
            .from('rates')
            .insert([ratingData])
            .select();
            
        if (error) {
            console.error('Error submitting rating:', error.message);
            alert('Error submitting rating. Please try again.');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            return;
        }
        
        // Mark user as rated
        userHasRated = true;
        
        // Disable stars and form
        const stars = document.querySelectorAll('.star');
        stars.forEach(star => {
            star.style.pointerEvents = 'none';
            star.style.opacity = '0.7';
        });
        
        const feedbackInput = document.getElementById('feedbackInput');
        if (feedbackInput) {
            feedbackInput.disabled = true;
        }
        
        console.log('Rating submitted successfully:', data[0]);
        
        // Show success message
        submitBtn.textContent = 'Rating Submitted!';
        submitBtn.style.background = 'linear-gradient(135deg, #28a745, #20c997)';
        
        setTimeout(() => {
            alert(`Thank you for your ${currentRating}-star rating!${feedback ? ' Your feedback has been noted.' : ''}`);
            closeContainer();
        }, 1000);
        
    } catch (err) {
        console.error('Unexpected error submitting rating:', err);
        alert('Error submitting rating. Please try again.');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

function closeContainer() {
    const engageContainer = document.querySelector('.engage-container');
    
    if (engageContainer) {
        engageContainer.style.animation = 'fadeOut 0.3s ease-out forwards';
        
        setTimeout(() => {
            engageContainer.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, 300);
    }
}

// Main event listener
document.addEventListener('DOMContentLoaded', function() {
    const rateButton = document.querySelector('.rate');
    const engageContainer = document.querySelector('.engage-container');
    
    // Set current product ID
    currentProductId = getCurrentProductId();
    console.log('Current Product ID:', currentProductId);
    
    // Initially hide the engagement container
    if (engageContainer) {
        engageContainer.style.display = 'none';
    }
    
    // Add click event listener to rate button
    if (rateButton && engageContainer) {
        rateButton.addEventListener('click', async function() {
            // Check authentication
            const isAuthenticated = await isUserAuthenticated();
            
            if (!isAuthenticated) {
                // Show login container
                engageContainer.innerHTML = createLoginContainer();
                engageContainer.style.display = 'flex';
                engageContainer.style.opacity = '0';
                engageContainer.style.animation = 'fadeIn 0.3s ease-out forwards';
                document.body.style.overflow = 'hidden';
                return;
            }
            
            // Check if user has already rated this product
            const ratingCheck = await hasUserRatedProduct(currentProductId);
            
            if (ratingCheck.hasRated) {
                // Show already rated container with existing rating details
                engageContainer.innerHTML = createAlreadyRatedContainer(ratingCheck.ratingData);
                engageContainer.style.display = 'flex';
                engageContainer.style.opacity = '0';
                engageContainer.style.animation = 'fadeIn 0.3s ease-out forwards';
                document.body.style.overflow = 'hidden';
                return;
            }
            
            // Show rating container for authenticated users who haven't rated
            userHasRated = false;
            currentRating = 0;
            engageContainer.innerHTML = createRatingContainer();
            engageContainer.style.display = 'flex';
            engageContainer.style.opacity = '0';
            engageContainer.style.animation = 'fadeIn 0.3s ease-out forwards';
            document.body.style.overflow = 'hidden';
            
            // Initialize star rating and character counter after container is created
            setTimeout(() => {
                initializeStarRating();
                initializeCharCounter();
            }, 100);
        });
    }
    
    // Add visual feedback to rate button
    if (rateButton) {
        rateButton.style.cursor = 'pointer';
        rateButton.style.transition = 'transform 0.2s ease, opacity 0.2s ease';
        
        rateButton.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
        });
        
        rateButton.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
        
        rateButton.addEventListener('mousedown', function() {
            this.style.transform = 'scale(0.95)';
        });
        
        rateButton.addEventListener('mouseup', function() {
            this.style.transform = 'scale(1.05)';
        });
    }
});

// CSS for filled stars and animations
const style = document.createElement('style');
style.textContent = `
    .star.active svg {
        fill: #ffc107 !important;
        stroke: #ffc107 !important;
        filter: drop-shadow(0 2px 4px rgba(255, 193, 7, 0.3));
        transform: scale(1.1);
    }
    
    .star svg {
        fill: none;
        stroke: #e0e0e0;
        stroke-width: 2;
        transition: all 0.2s ease;
    }
    
    .star:hover svg {
        transform: scale(1.1);
    }
    
    .engage-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        backdrop-filter: blur(5px);
    }
    
    .rate-container {
        position: relative;
        animation: scaleIn 0.3s ease-out;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    @keyframes scaleIn {
        from { transform: scale(0.8); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
    }
    
    #feedbackInput:focus {
        border-color: #007bff;
        outline: none;
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
    }
`;
document.head.appendChild(style);

/* 
DATABASE SCHEMA FOR SUPABASE:

CREATE TABLE rates (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_rates_user_id ON rates(user_id);
CREATE INDEX idx_rates_product_id ON rates(product_id);
CREATE INDEX idx_rates_user_product ON rates(user_id, product_id);
CREATE INDEX idx_rates_created_at ON rates(created_at);

-- Create unique constraint to prevent duplicate ratings
ALTER TABLE rates ADD CONSTRAINT unique_user_product_rating UNIQUE (user_id, product_id);

-- Enable Row Level Security (RLS)
ALTER TABLE rates ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Users can view all ratings" ON rates FOR SELECT USING (true);
CREATE POLICY "Users can insert their own ratings" ON rates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own ratings" ON rates FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own ratings" ON rates FOR DELETE USING (auth.uid() = user_id);

*/






// Bookmark system variables
let userBookmarkStatus = { willCook: false, favourite: false };
let currentBookmarkAction = null;

// Check if user has bookmarked this product
async function getUserBookmarkStatus(productId) {
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) return { willCook: false, favourite: false };
        
        // Check will_cook table
        const { data: willCookData, error: willCookError } = await supabaseClient
            .from('will_cook')
            .select('id')
            .eq('user_id', session.user.id)
            .eq('product_id', productId)
            .single();
            
        // Check favourites table
        const { data: favouriteData, error: favouriteError } = await supabaseClient
            .from('favourites')
            .select('id')
            .eq('user_id', session.user.id)
            .eq('product_id', productId)
            .single();
            
        return {
            willCook: !!(willCookData && !willCookError),
            favourite: !!(favouriteData && !favouriteError)
        };
    } catch (err) {
        console.error('Error checking bookmark status:', err);
        return { willCook: false, favourite: false };
    }
}

// Update bookmark icon based on status
function updateBookmarkIcon(status) {
    const bookmarkIcon = document.querySelector('.engage i.bx-bookmark');
    if (!bookmarkIcon) return;
    
    if (status.willCook || status.favourite) {
        // Show solid bookmark
        bookmarkIcon.classList.remove('bxr');
        bookmarkIcon.classList.add('bxr  bxs-bookmark');
        bookmarkIcon.style.color = status.favourite ? '#e74c3c' : '#f39c12';
        bookmarkIcon.parentElement.title = status.favourite ? 'Added to Favourites' : 'Added to Will Cook';
    } else {
        // Show regular bookmark
        bookmarkIcon.classList.remove('bxs');
        bookmarkIcon.classList.add('bxr');
        bookmarkIcon.style.color = '';
        bookmarkIcon.parentElement.title = 'Bookmark this recipe';
    }
}

// Create bookmark selection container HTML
function createBookmarkContainer() {
    return `
        <div class="bookmark-container" style="text-align: center; padding: 40px; background: white; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); max-width: 450px; margin: 0 auto;">
            <button class="close-btn" onclick="closeContainer()" style="position: absolute; top: 15px; right: 15px; background: none; border: none; font-size: 24px; cursor: pointer; color: #999;">&times;</button>
            
            <div style="margin-bottom: 30px;">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #f39c12, #e67e22); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                    <i class="bx bx-bookmark" style="font-size: 40px; color: white;"></i>
                </div>
                <h2 style="font-size: 24px; font-weight: 600; color: #2c3e50; margin-bottom: 10px;">Save This Recipe</h2>
                <p style="font-size: 16px; color: #7f8c8d; margin-bottom: 30px;">Choose how you want to save this recipe</p>
            </div>
            
            <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                <button onclick="selectBookmarkType('willCook')" style="
                    background: linear-gradient(135deg, #f39c12, #e67e22);
                    color: white;
                    border: none;
                    padding: 15px 25px;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    min-width: 140px;
                    justify-content: center;
                " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                    <i class="bx bx-chef" style="font-size: 20px;"></i>
                    Will Cook
                </button>
                
                <button onclick="selectBookmarkType('favourite')" style="
                    background: linear-gradient(135deg, #e74c3c, #c0392b);
                    color: white;
                    border: none;
                    padding: 15px 25px;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    min-width: 140px;
                    justify-content: center;
                " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
                    <i class="bx bx-heart" style="font-size: 20px;"></i>
                    Favourite
                </button>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                <p style="font-size: 14px; color: #7f8c8d; margin-bottom: 15px;">
                    <strong>Will Cook:</strong> Recipes you plan to try soon<br>
                    <strong>Favourite:</strong> Your most loved recipes
                </p>
                <button onclick="closeContainer()" style="
                    background: transparent;
                    color: #6c757d;
                    border: 2px solid #e9ecef;
                    padding: 10px 25px;
                    border-radius: 25px;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                ">Cancel</button>
            </div>
        </div>
    `;
}

// Create already bookmarked container HTML
function createAlreadyBookmarkedContainer(bookmarkStatus) {
    const bookmarkType = bookmarkStatus.favourite ? 'Favourite' : 'Will Cook';
    const bookmarkIcon = bookmarkStatus.favourite ? 'bx-heart' : 'bx-chef';
    const bookmarkColor = bookmarkStatus.favourite ? '#e74c3c' : '#f39c12';
    
    return `
        <div class="bookmark-container" style="text-align: center; padding: 40px; background: white; border-radius: 16px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); max-width: 400px; margin: 0 auto;">
            <button class="close-btn" onclick="closeContainer()" style="position: absolute; top: 15px; right: 15px; background: none; border: none; font-size: 24px; cursor: pointer; color: #999;">&times;</button>
            
            <div style="margin-bottom: 30px;">
                <div style="width: 80px; height: 80px; background: ${bookmarkColor}; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                    <i class="bx ${bookmarkIcon}" style="font-size: 40px; color: white;"></i>
                </div>
                <h2 style="font-size: 24px; font-weight: 600; color: #2c3e50; margin-bottom: 10px;">Already Saved!</h2>
                <p style="font-size: 16px; color: #7f8c8d; margin-bottom: 20px;">This recipe is in your <strong>${bookmarkType}</strong> list</p>
            </div>
            
            <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                <button onclick="removeBookmark('${bookmarkStatus.favourite ? 'favourite' : 'willCook'}')" style="
                    background: linear-gradient(135deg, #dc3545, #c82333);
                    color: white;
                    border: none;
                    padding: 12px 25px;
                    border-radius: 25px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                ">Remove</button>
                
                <button onclick="closeContainer()" style="
                    background: transparent;
                    color: #6c757d;
                    border: 2px solid #e9ecef;
                    padding: 12px 25px;
                    border-radius: 25px;
                    font-size: 14px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                ">Keep</button>
            </div>
        </div>
    `;
}

// Select bookmark type and save to database
async function selectBookmarkType(type) {
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) {
            alert('Please login to bookmark');
            return;
        }
        
        const productId = getCurrentProductId();
        if (!productId) {
            alert('Error: Product ID not found');
            return;
        }
        
        // Show loading state
        const buttons = document.querySelectorAll('.bookmark-container button');
        buttons.forEach(btn => {
            if (btn.onclick && btn.onclick.toString().includes(type)) {
                btn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Saving...';
                btn.disabled = true;
            }
        });
        
        const bookmarkData = {
            user_id: session.user.id,
            product_id: productId.toString(),
            created_at: new Date().toISOString()
        };
        
        const tableName = type === 'favourite' ? 'favourites' : 'will_cook';
        
        // Save to appropriate table
        const { data, error } = await supabaseClient
            .from(tableName)
            .insert([bookmarkData])
            .select();
            
        if (error) {
            console.error(`Error saving to ${tableName}:`, error.message);
            alert(`Error saving bookmark. Please try again.`);
            return;
        }
        
        // Update local status
        userBookmarkStatus[type] = true;
        
        // Update icon
        updateBookmarkIcon(userBookmarkStatus);
        
        console.log(`✅ Saved to ${tableName}:`, data[0]);
        
        // Show success message
        const typeLabel = type === 'favourite' ? 'Favourites' : 'Will Cook';
        alert(`✅ Recipe added to ${typeLabel}!`);
        closeContainer();
        
    } catch (err) {
        console.error('Unexpected error saving bookmark:', err);
        alert('Error saving bookmark. Please try again.');
    }
}

// Remove bookmark from database
async function removeBookmark(type) {
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) return;
        
        const productId = getCurrentProductId();
        if (!productId) return;
        
        const tableName = type === 'favourite' ? 'favourites' : 'will_cook';
        
        // Remove from database
        const { error } = await supabaseClient
            .from(tableName)
            .delete()
            .eq('user_id', session.user.id)
            .eq('product_id', productId);
            
        if (error) {
            console.error(`Error removing from ${tableName}:`, error.message);
            alert('Error removing bookmark. Please try again.');
            return;
        }
        
        // Update local status
        userBookmarkStatus[type] = false;
        
        // Update icon
        updateBookmarkIcon(userBookmarkStatus);
        
        console.log(`✅ Removed from ${tableName}`);
        
        const typeLabel = type === 'favourite' ? 'Favourites' : 'Will Cook';
        alert(`Recipe removed from ${typeLabel}`);
        closeContainer();
        
    } catch (err) {
        console.error('Unexpected error removing bookmark:', err);
        alert('Error removing bookmark. Please try again.');
    }
}

// Initialize bookmark system
async function initializeBookmarkSystem() {
    const productId = getCurrentProductId();
    if (!productId) return;
    
    // Check current bookmark status
    userBookmarkStatus = await getUserBookmarkStatus(productId);
    
    // Update bookmark icon
    updateBookmarkIcon(userBookmarkStatus);
    
    console.log('📚 Bookmark status initialized:', userBookmarkStatus);
}

// Add bookmark event listeners
document.addEventListener('DOMContentLoaded', function() {
    const bookmarkButton = document.querySelector('.engage i.bx-bookmark')?.parentElement;
    const engageContainer = document.querySelector('.engage-container');
    
    if (bookmarkButton && engageContainer) {
        bookmarkButton.addEventListener('click', async function() {
            // Check authentication
            const isAuthenticated = await isUserAuthenticated();
            
            if (!isAuthenticated) {
                // Show login container (reuse from rating system)
                engageContainer.innerHTML = createLoginContainer();
                engageContainer.style.display = 'flex';
                engageContainer.style.opacity = '0';
                engageContainer.style.animation = 'fadeIn 0.3s ease-out forwards';
                document.body.style.overflow = 'hidden';
                return;
            }
            
            // Check if already bookmarked
            const productId = getCurrentProductId();
            const bookmarkStatus = await getUserBookmarkStatus(productId);
            
            if (bookmarkStatus.willCook || bookmarkStatus.favourite) {
                // Show already bookmarked container
                engageContainer.innerHTML = createAlreadyBookmarkedContainer(bookmarkStatus);
                engageContainer.style.display = 'flex';
                engageContainer.style.opacity = '0';
                engageContainer.style.animation = 'fadeIn 0.3s ease-out forwards';
                document.body.style.overflow = 'hidden';
                return;
            }
            
            // Show bookmark selection container
            engageContainer.innerHTML = createBookmarkContainer();
            engageContainer.style.display = 'flex';
            engageContainer.style.opacity = '0';
            engageContainer.style.animation = 'fadeIn 0.3s ease-out forwards';
            document.body.style.overflow = 'hidden';
        });
        
        // Add visual feedback
        bookmarkButton.style.cursor = 'pointer';
        bookmarkButton.style.transition = 'transform 0.2s ease';
        
        bookmarkButton.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.1)';
        });
        
        bookmarkButton.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    }
    
    // Initialize bookmark system after DOM is loaded
    setTimeout(initializeBookmarkSystem, 500);
});

// CSS for bookmark animations
const bookmarkStyle = document.createElement('style');
bookmarkStyle.textContent = `
    .engage i.bx-bookmark {
        transition: all 0.3s ease;
    }
    
    .engage i.bxs-bookmark {
        animation: bookmarkPulse 0.6s ease-out;
    }
    
    @keyframes bookmarkPulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
    }
    
    .bookmark-container button:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    
    .bx-spin {
        animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(bookmarkStyle);

/* 
DATABASE SCHEMA FOR BOOKMARK SYSTEM:

-- Will Cook Table
CREATE TABLE will_cook (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Favourites Table  
CREATE TABLE favourites (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_will_cook_user_id ON will_cook(user_id);
CREATE INDEX idx_will_cook_product_id ON will_cook(product_id);
CREATE INDEX idx_will_cook_user_product ON will_cook(user_id, product_id);

CREATE INDEX idx_favourites_user_id ON favourites(user_id);
CREATE INDEX idx_favourites_product_id ON favourites(product_id);
CREATE INDEX idx_favourites_user_product ON favourites(user_id, product_id);

-- Create unique constraints to prevent duplicates
ALTER TABLE will_cook ADD CONSTRAINT unique_user_product_will_cook UNIQUE (user_id, product_id);
ALTER TABLE favourites ADD CONSTRAINT unique_user_product_favourite UNIQUE (user_id, product_id);

-- Enable Row Level Security (RLS)
ALTER TABLE will_cook ENABLE ROW LEVEL SECURITY;
ALTER TABLE favourites ENABLE ROW LEVEL SECURITY;

-- Create policies for will_cook
CREATE POLICY "Users can view their own will_cook" ON will_cook FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own will_cook" ON will_cook FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own will_cook" ON will_cook FOR DELETE USING (auth.uid() = user_id);

-- Create policies for favourites
CREATE POLICY "Users can view their own favourites" ON favourites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own favourites" ON favourites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own favourites" ON favourites FOR DELETE USING (auth.uid() = user_id);

*/



async function loadDirections() {
    if (!foodId) {
        console.error('Food ID not found in URL parameters');
        return;
    }

    try {
        const { data, error } = await supabaseClient
            .from(table)
            .select('directions')
            .eq('id', foodId)
            .single();

        if (error) {
            throw new Error(`Supabase error: ${error.message}`);
        }

        if (!data || !data.directions) {
            throw new Error('No directions found for this recipe');
        }

        displayDirections(data.directions);
    } catch (error) {
        console.error('Error loading directions:', error);
        displayError(error.message);
    }
}

// Function to display directions in the steps section
function displayDirections(directions) {
    const stepsContainer = document.querySelector('.steps .step');
    if (!stepsContainer) {
        console.error('Steps container not found');
        return;
    }

    // Clear existing content
    stepsContainer.innerHTML = '';

    // Process directions (array or string)
    let stepsArray = [];
    if (Array.isArray(directions)) {
        stepsArray = directions;
    } else if (typeof directions === 'string') {
        // Split by newlines or numbers
        stepsArray = directions.split(/\n|\d+\.\s*/).filter(step => step.trim());
    }

    // Display each step
    stepsArray.forEach((step, index) => {
        if (!step.trim()) return;

        const stepCount = document.createElement('p');
        stepCount.className = 'step-count';
        stepCount.textContent = `Step ${index + 1}`;

        const stepInfo = document.createElement('p');
        stepInfo.className = 'step-info';
        stepInfo.textContent = step.trim();

        stepsContainer.appendChild(stepCount);
        stepsContainer.appendChild(stepInfo);
    });

    // Add animation effect
    animateSteps();
}

// Function to add animation to steps
function animateSteps() {
    const steps = document.querySelectorAll('.step-count, .step-info');
    steps.forEach((step, index) => {
        step.style.opacity = '0';
        step.style.transform = 'translateY(20px)';
        step.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
        
        setTimeout(() => {
            step.style.opacity = '1';
            step.style.transform = 'translateY(0)';
        }, 100);
    });
}

// Function to display errors
function displayError(message) {
    const stepsContainer = document.querySelector('.steps');
    if (!stepsContainer) return;
    
    stepsContainer.innerHTML = `
        <div class="step-error">
            <i class='bx bx-error-circle'></i>
            <p>${message}</p>
            <button onclick="location.reload()">Try Again</button>
        </div>
    `;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        .step-error {
            text-align: center;
            padding: 20px;
            color: #e74c3c;
        }
        .step-error i {
            font-size: 48px;
            margin-bottom: 15px;
            display: block;
        }
        .step-error button {
            background: #3498db;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
            margin-top: 10px;
        }
    `;
    document.head.appendChild(style);

    // Load directions
    loadDirections();
});