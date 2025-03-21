// Initialize Supabase client with your project's URL and public anon key
const SUPABASE_URL = 'https://vyacbonatqmyfhixonej.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5YWNib25hdHFteWZoaXhvbmVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3MTY2NzIsImV4cCI6MjA1NjI5MjY3Mn0.zrG4WJLFXE0SzOezTXLNTjt-xwJNU9U4xawHrr9MgQw';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);



// * Displays a custom alert in the alert container.
// * @param {string} message - The message to display.
// * @param {string} type - The alert type, either "success" or "error".
// */
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
 * Fetches recipes from the appropriate table(s) based on the given category.
 * @param {string} category - The selected category name.
 */
async function loadRecipes(category = 'all types') {
  try {
    let data = [];
    const cat = category.trim().toLowerCase();

    if (cat === 'all types') {
      // Fetch from all three tables concurrently.
      const [dinnerResult, sahurResult, iftarResult] = await Promise.all([
        supabaseClient.from('dinner').select('*').limit(8),
        supabaseClient.from('sahur').select('*'),
        supabaseClient.from('iftar').select('*')
      ]);

      if (dinnerResult.error) throw dinnerResult.error;
      if (sahurResult.error) throw sahurResult.error;
      if (iftarResult.error) throw iftarResult.error;

      // Attach table information to each item
      const dinnerData = dinnerResult.data.map(item => ({ ...item, table: 'dinner' }));
      const sahurData = sahurResult.data.map(item => ({ ...item, table: 'sahur' }));
      const iftarData = iftarResult.data.map(item => ({ ...item, table: 'iftar' }));

      data = [...dinnerData, ...sahurData, ...iftarData];
    } else if (cat === 'sahur') {
      const { data: sahurData, error } = await supabaseClient.from('sahur').select('*');
      if (error) throw error;
      data = sahurData.map(item => ({ ...item, table: 'sahur' }));
    } else if (cat === 'iftar') {
      const { data: iftarData, error } = await supabaseClient.from('iftar').select('*');
      if (error) throw error;
      data = iftarData.map(item => ({ ...item, table: 'iftar' }));
    } else if (cat === 'dinner') {
      const { data: dinnerData, error } = await supabaseClient.from('dinner').select('*').limit(8);
      if (error) throw error;
      data = dinnerData.map(item => ({ ...item, table: 'dinner' }));
    }

    // Get the container where the recipe cards will be appended
    const cardsContainer = document.querySelector('.cards');
    cardsContainer.innerHTML = '';

    if (!data || data.length === 0) {
      cardsContainer.innerHTML = '<p>No data is in there</p>';
      return;
    }

    // Create and append recipe cards
    data.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'card recipe_cards';
      card.innerHTML = `
        <div class="head">
          <h2>${item.food_name || 'No Name'}</h2>
        </div>
        <div class="image">
          <img src="${item.food_image_url || 'placeholder.jpg'}" alt="${item.food_name || 'No Name'}">
        </div>
        <div class="see">
          <h2>See complete recipe</h2>
          <div class="cheff"><i class="fa-solid fa-utensils"></i></div>
        </div>
      `;

      // Save the selected food data in sessionStorage then redirect
      card.addEventListener('click', () => {
        sessionStorage.setItem('selectedFood', JSON.stringify(item));
        window.location.href = `food_page.html?id=${item.id}&table=${item.table}`;
      });

      cardsContainer.appendChild(card);
    });
  } catch (err) {
    console.error('Error fetching recipes:', err);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  // -----------------------
  // User Authentication
  // -----------------------
  const { data: { session } } = await supabaseClient.auth.getSession();
  const loginButton = document.querySelector('.login');
  const profileContainer = document.querySelector('.profile');

  if (session) {
    loginButton.style.display = 'none';
    profileContainer.style.display = 'block';
    profileContainer.addEventListener('click', () => window.location.href = 'profile.html');
  } else {
    loginButton.style.display = 'block';
    profileContainer.style.display = 'none';
    loginButton.addEventListener('click', () => window.location.href = 'login.html');
  }
  

  // Select the menu button and navigation
const menuButton = document.querySelector('.menu');
const navMenu = document.querySelector('.nav');

// Toggle the active class on click
menuButton.addEventListener('click', () => {
  navMenu.classList.toggle('active');
});


  // -----------------------
  // Category Button Styling & Recipes Load
  // -----------------------
  const products = document.querySelectorAll('.categories .products');
  products.forEach((p, index) => {
    if (index === 0) {
      p.style.backgroundColor = 'black';
      const heading = p.querySelector('h2');
      if (heading) heading.style.color = 'white';
    } else {
      p.style.backgroundColor = '#E5E4E2';
      const heading = p.querySelector('h2');
      if (heading) heading.style.color = 'black';
    }
  });

  // Load default recipes and set up category click handlers
  loadRecipes();
  products.forEach(product => {
    product.addEventListener('click', function() {
      products.forEach(p => {
        p.style.backgroundColor = '#E5E4E2';
        const heading = p.querySelector('h2');
        if (heading) heading.style.color = 'black';
      });
      this.style.backgroundColor = 'black';
      const heading = this.querySelector('h2');
      if (heading) heading.style.color = 'white';
      const category = this.querySelector('h2').innerText;
      loadRecipes(category);
    });
  });

  // Select the add button
const addButton = document.querySelector('.add');

// Add event listener for click event
addButton.addEventListener('click', async () => {
    const { data: { session } } = await supabaseClient.auth.getSession();

    if (session) {
        // User is logged in, redirect to admin page
        window.location.href = 'admin.html';
    } else {
        // User is not logged in, redirect to login page
        window.location.href = 'login.html';
    }
});


  // -----------------------
  // Subscription Functionality
  // -----------------------
  const subscribeButton = document.querySelector('.subscribe');
subscribeButton.addEventListener('click', async () => {
  const emailInput = document.querySelector('.email input');
  const email = emailInput.value.trim();
  
  // Regular expression to validate email format.
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showAlert('Please enter a valid email address.', 'error');
    return;
  }

  // Insert the email into the subscribers table in Supabase
  const { data, error } = await supabaseClient.from('subscribers').insert({ email: email });
  if (error) {
    console.error('Error subscribing:', error);
    showAlert('Subscription failed. Please try again later.', 'error');
  } else {
    showAlert('Thank you for subscribing!', 'success');
    emailInput.value = '';
  }
});


  // -----------------------
  // Slider Functionality
  // -----------------------

  // Inject CSS styles for slider images and dots
  const style = document.createElement('style');
  style.innerHTML = `
    .start img {
      width: 100%;
      display: none;
    }
    .dot-container {
      text-align: center;
      margin-top: 10px;
    }
    .dot {
      display: inline-block;
      width: 15px;
      height: 15px;
      margin: 0 5px;
      background-color: #bbb;
      border-radius: 50%;
      cursor: pointer;
    }
    .dot.active {
      background-color: #717171;
    }
  `;
  document.head.appendChild(style);

  // Get the slider container and all images within it
  const slider = document.querySelector('.start');
  if (slider) {
    const images = slider.querySelectorAll('img');
    let currentIndex = 0;
    const slideInterval = 5000; // time in milliseconds between slides

    // Create a container for dots and append it to the slider
    const dotContainer = document.createElement('div');
    dotContainer.className = 'dot-container';
    slider.appendChild(dotContainer);

    // Create dots for each image and add click events for manual navigation
    images.forEach((img, index) => {
      const dot = document.createElement('span');
      dot.className = 'dot';
      dot.setAttribute('data-index', index);
      dot.addEventListener('click', function(e) {
        currentIndex = parseInt(e.target.getAttribute('data-index'));
        showSlide(currentIndex);
        resetInterval();
      });
      dotContainer.appendChild(dot);
    });

    // Function to display the correct slide and update the active dot
    function showSlide(index) {
      images.forEach((img, i) => {
        img.style.display = (i === index) ? 'block' : 'none';
        dotContainer.children[i].classList.toggle('active', i === index);
      });
    }

    // Show the first slide on load
    showSlide(currentIndex);

    // Function to go to the next slide automatically
    function nextSlide() {
      currentIndex = (currentIndex + 1) % images.length;
      showSlide(currentIndex);
    }

    // Set the interval to automatically change slides
    let timer = setInterval(nextSlide, slideInterval);

    // Reset the timer when a dot is clicked
    function resetInterval() {
      clearInterval(timer);
      timer = setInterval(nextSlide, slideInterval);
    }
  }
});
