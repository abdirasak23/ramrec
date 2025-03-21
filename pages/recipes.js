document.addEventListener('DOMContentLoaded', async () => {
  // -------------------------------------------------------
  // 1. Supabase Configuration
  // -------------------------------------------------------
  const supabaseUrl = 'https://vyacbonatqmyfhixonej.supabase.co';
  const supabaseKey =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5YWNib25hdHFteWZoaXhvbmVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3MTY2NzIsImV4cCI6MjA1NjI5MjY3Mn0.zrG4WJLFXE0SzOezTXLNTjt-xwJNU9U4xawHrr9MgQw';
  const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

  // -------------------------------------------------------
  // 2. DOM Element References
  // -------------------------------------------------------
  const cardsContainer = document.querySelector('.cards');
  const categorySelect = document.querySelector('.category select');
  const filterSelect = document.querySelector('.filter select');
  const searchInput = document.querySelector('.search input');
  const cancelIcon = document.getElementById('cancel'); // Cancel icon for search


  const addButton = document.querySelector('.add');

    // Add event listener for click event
    addButton.addEventListener('click', async () => {
        const { data: { session } } = await supabaseClient.auth.getSession();

        if (session) {
            // User is logged in, redirect to admin page
            window.location.href = '/admin.html';
        } else {
            // User is not logged in, redirect to login page
            window.location.href = '/login.html';
        }
    });


  // Hide cancel icon by default
  cancelIcon.style.display = 'none';

  /**
   * Fetch recipes from a given table.
   *
   * If a search query is provided, it applies an ilike filter on 'food_name'
   * so that only matching recipes are returned.
   * When no search query is provided, it will apply difficulty or time filters.
   *
   * @param {string} tableName - The table name (e.g. "dinner").
   * @param {string} searchQuery - The search term.
   * @param {string} filter - The selected filter option.
   * @returns {Promise<Array>} - Array of recipe objects with an added 'table' property.
   */
  async function fetchRecipesFromTable(tableName, searchQuery, filter) {
    let query = supabaseClient.from(tableName).select('*');

    // If a search term is provided, filter by food_name so that only matching recipes are returned.
    if (searchQuery.trim() !== '') {
      query = query.ilike('food_name', `%${searchQuery}%`);
    } else {
      // Only apply additional filters if there's no search term.
      const difficultyFilters = ["easy", "moderate", "difficult"];
      const isDifficultyFilter = difficultyFilters.includes(filter.toLowerCase());
      const isTimeFilter = filter === "less-time" || filter === "more-time";

      if (isDifficultyFilter) {
        query = query.ilike('difficulties', `%${filter}%`);
      }

      if (isTimeFilter) {
        const ascending = filter === "less-time";
        query = query.order('cooking_time', { ascending });
      }
    }

    const { data, error } = await query;
    if (error) {
      console.error(`Error fetching ${tableName} recipes:`, error);
      return [];
    }
    // Attach table name for later reference
    return data.map(recipe => ({ ...recipe, table: tableName }));
  }

  const menuButton = document.querySelector('.menu');
const navMenu = document.querySelector('.nav');

// Toggle the active class on click
menuButton.addEventListener('click', () => {
  navMenu.classList.toggle('active');
});

  /**
   * Fetch and render recipes based on the selected category, filter, and search query.
   *
   * When a search query is provided, only recipes matching the search term are fetched.
   * If no search query is provided, difficulty/time filters are applied.
   *
   * Deduplication is done by comparing food_name (case-insensitive) so that the same recipe
   * does not appear more than once.
   *
   * @param {string} category - Selected category or 'Category' (meaning all).
   * @param {string} filter - Selected filter option.
   * @param {string} searchQuery - The search string.
   */
  async function fetchAndRenderRecipes(category, filter, searchQuery = '') {
    // Clear current cards
    cardsContainer.innerHTML = '';
    let recipes = [];
    const isTimeFilter = filter === "less-time" || filter === "more-time";

    if (category === 'Category') {
      // Fetch recipes from all tables
      const categories = ['dinner', 'breakfast', 'sahur', 'iftar'];
      for (const cat of categories) {
        const data = await fetchRecipesFromTable(cat, searchQuery, filter);
        recipes = recipes.concat(data);
      }
      // When no search query is present and time filter is active,
      // sort the combined results by cooking_time.
      if (searchQuery.trim() === '' && isTimeFilter) {
        const ascending = filter === "less-time";
        recipes.sort((a, b) =>
          ascending
            ? a.cooking_time - b.cooking_time
            : b.cooking_time - a.cooking_time
        );
      }
    } else {
      // Fetch recipes only from the selected category
      recipes = await fetchRecipesFromTable(category, searchQuery, filter);
    }

    // Deduplicate recipes based on food_name (case-insensitive)
    const uniqueRecipes = [];
    const seenFoods = new Set();
    recipes.forEach(recipe => {
      const foodKey = recipe.food_name.toLowerCase();
      if (!seenFoods.has(foodKey)) {
        seenFoods.add(foodKey);
        uniqueRecipes.push(recipe);
      }
    });
    recipes = uniqueRecipes;

    // If no recipes are found, display a message.
    if (recipes.length === 0) {
      cardsContainer.innerHTML =  '<p style="text-align: center; position: absolute; left: 45%;">No recipes found.</p>';
      return;
    }

    // Render each recipe card.
    recipes.forEach(recipe => {
      const nutritionSum =
        (parseInt(recipe.protein) || 0) +
        (parseInt(recipe.vitamin) || 0) +
        (parseInt(recipe.calories) || 0) +
        (parseInt(recipe.carbohydrates) || 0);

      const card = document.createElement('div');
      card.classList.add('food-card');
      card.innerHTML = `
        <div class="images">
          <img src="${recipe.food_image_url}" alt="${recipe.food_name}" />
        </div>
        <div class="content">
          <div class="head">
            <h2>${recipe.difficulties || ''}</h2>
          </div>
          <div class="name">
            <h2>${recipe.food_name || 'No Name'}</h2>
          </div>
          <div class="nuts-time">
            <p>${recipe.cooking_time || 0} min / ${nutritionSum} nutritions</p>
          </div>
          <button class="view-btn">View Recipe</button>
        </div>
      `;

      // Attach a click event to the View Recipe button.
      const viewButton = card.querySelector('.view-btn');
      viewButton.addEventListener('click', (event) => {
        event.stopPropagation();
        sessionStorage.setItem('selectedFood', JSON.stringify(recipe));
        window.location.href = `../food_page.html?id=${recipe.id}&table=${recipe.table}`;
      });

      cardsContainer.appendChild(card);
    });
  }

  // -------------------------------------------------------
  // 3. Cancel Icon Functionality for Search
  // -------------------------------------------------------
  // When the user types in the search input, show the cancel icon.
  searchInput.addEventListener('input', () => {
    if (searchInput.value.trim() !== '') {
      cancelIcon.style.display = 'inline-block';
    } else {
      cancelIcon.style.display = 'none';
    }
    // Update recipes based on the search input.
    updateRecipes();
  });

  // When the cancel icon is clicked, clear the search input and hide the icon.
  cancelIcon.addEventListener('click', () => {
    searchInput.value = '';
    cancelIcon.style.display = 'none';
    updateRecipes();
  });

  // -------------------------------------------------------
  // 4. Update Recipes on UI Change
  // -------------------------------------------------------
  function updateRecipes() {
    const currentCategory = categorySelect.value;
    const currentFilter = filterSelect.value;
    const currentSearch = searchInput.value;
    fetchAndRenderRecipes(currentCategory, currentFilter, currentSearch);
  }

  // -------------------------------------------------------
  // 5. Initial Fetch & Event Listeners for Category & Filter
  // -------------------------------------------------------
  await fetchAndRenderRecipes(categorySelect.value, filterSelect.value, searchInput.value);

  categorySelect.addEventListener('change', updateRecipes);
  filterSelect.addEventListener('change', updateRecipes);
});
