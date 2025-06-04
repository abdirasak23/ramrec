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
      videoDuration.textContent = `Credit: Video by: ${food.video_credit}`;
    } else {
      videoDuration.textContent = 'Credit: Video by: Cunto kariso'; // Default fallback
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