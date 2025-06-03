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

const menuButton = document.querySelector('.menu');
const navMenu = document.querySelector('.nav');

// Toggle the active class on click
menuButton.addEventListener('click', () => {
  navMenu.classList.toggle('active');
});

// Render the food details on the page
function renderFoodDetails(food) {
  // Update the page title
  document.title = `${food.food_name} Recipe | RAMREC`;

  // Update header ad section
  // const adImage = document.querySelector('.ad img');
  // if (adImage) {
  //   adImage.src = food.ad_image_url;  
  //   adImage.alt = food.food_name;
  // }
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

  // Update food image
  const foodImage = document.querySelector('.food_image img');
  if (foodImage) {
    foodImage.src = food.food_image_url;
    foodImage.alt = food.food_name;
  }

  // Update ingredients list
  // We create a single <ol> element inside the container with class "itemss"
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

async function loadFoodDetails() {
  // Check if the food details are cached in sessionStorage
  const cachedData = sessionStorage.getItem('selectedFood');
  if (cachedData) {
    const food = JSON.parse(cachedData);
    // Confirm that the cached food matches the current id and table
    if (food.id == foodId && food.table === table) {
      renderFoodDetails(food);
      return;
    }
  }

  // Otherwise, fetch from Supabase
  try {
    const { data: food, error } = await supabaseClient
      .from(table)
      .select('*')
      .eq('id', foodId)
      .single();

    if (error) throw error;
    if (!food) throw new Error('Food item not found');
    // Optionally store food in sessionStorage for caching
    food.table = table; // include table info for future checks
    sessionStorage.setItem('selectedFood', JSON.stringify(food));
    renderFoodDetails(food);
  } catch (error) {
    console.error('Error loading food details:', error);
    document.body.innerHTML = `<p>Error loading food details. Please try again later.</p>`;
  }
}

// Load food details when the DOM is ready
document.addEventListener('DOMContentLoaded', loadFoodDetails);
