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
  const cancelIcon = document.getElementById('cancel');
  const addButton = document.querySelector('.add');

  // Create intelligent search suggestions dropdown with recipe cards
  const searchContainer = document.querySelector('.search');
  let suggestionsDropdown = document.getElementById('search-suggestions');
  
  if (!suggestionsDropdown) {
    suggestionsDropdown = document.createElement('div');
    suggestionsDropdown.id = 'search-suggestions';
    suggestionsDropdown.style.cssText = `
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #ddd;
      border-top: none;
      border-radius: 0 0 12px 12px;
      max-height: 400px;
      overflow-y: auto;
      z-index: 1000;
      display: none;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    `;
    if (searchContainer) {
      searchContainer.style.position = 'relative';
      searchContainer.appendChild(suggestionsDropdown);
    }
  }

  // Cache for all recipes
  let allRecipesCache = [];
  let searchTimeout = null;

  // Add button event listener
  if (addButton) {
    addButton.addEventListener('click', async () => {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (session) {
        window.location.href = '/admin.html';
      } else {
        window.location.href = '/login.html';
      }
    });
  }

  // Hide cancel icon by default
  if (cancelIcon) {
    cancelIcon.style.display = 'none';
  }

  // Menu toggle functionality
  const menuButton = document.querySelector('.menu');
  const navMenu = document.querySelector('.nav');
  if (menuButton && navMenu) {
    menuButton.addEventListener('click', () => {
      navMenu.classList.toggle('active');
    });
  }

  // -------------------------------------------------------
  // 3. Recipe Fetching Functions
  // -------------------------------------------------------
  
  /**
   * Fetch recipes from a specific table
   */
  async function fetchRecipesFromTable(tableName) {
    try {
      const { data, error } = await supabaseClient.from(tableName).select('*');
      if (error) {
        console.error(`Error fetching ${tableName} recipes:`, error);
        return [];
      }
      return data.map(recipe => ({ ...recipe, table: tableName }));
    } catch (err) {
      console.error(`Exception fetching ${tableName}:`, err);
      return [];
    }
  }

  /**
   * Fetch all recipes from all tables and cache them
   */
  async function fetchAllRecipes() {
    const categories = ['dinner', 'breakfast', 'sahur', 'iftar'];
    let allRecipes = [];

    console.log('Fetching all recipes...');
    
    for (const category of categories) {
      const recipes = await fetchRecipesFromTable(category);
      console.log(`Fetched ${recipes.length} recipes from ${category}`);
      allRecipes = allRecipes.concat(recipes);
    }

    console.log(`Total recipes fetched: ${allRecipes.length}`);

    // Remove duplicates based on food_name (case-insensitive)
    const uniqueRecipes = [];
    const seenNames = new Set();

    allRecipes.forEach(recipe => {
      const foodName = (recipe.food_name || '').toLowerCase().trim();
      if (foodName && !seenNames.has(foodName)) {
        seenNames.add(foodName);
        uniqueRecipes.push(recipe);
      }
    });

    console.log(`Unique recipes after deduplication: ${uniqueRecipes.length}`);
    allRecipesCache = uniqueRecipes;
    return uniqueRecipes;
  }

  // -------------------------------------------------------
  // 4. Intelligent Search Functions
  // -------------------------------------------------------

  /**
   * Smart search that understands user intent and provides ranked results
   */
  function intelligentSearch(query, recipes) {
    if (!query || query.trim() === '') {
      return recipes;
    }

    const searchTerm = query.toLowerCase().trim();
    const searchWords = searchTerm.split(' ').filter(word => word.length > 1);
    console.log(`Intelligent search for: "${searchTerm}"`);
    
    const results = [];

    recipes.forEach(recipe => {
      const foodName = (recipe.food_name || '').toLowerCase();
      const difficulties = (recipe.difficulties || '').toLowerCase();
      const ingredients = (recipe.ingredients || '').toLowerCase();
      const description = (recipe.description || '').toLowerCase();
      
      let score = 0;
      let matches = [];

      // Exact match - highest priority
      if (foodName === searchTerm) {
        score += 100;
        matches.push('exact name match');
      }
      
      // Food name starts with search term
      else if (foodName.startsWith(searchTerm)) {
        score += 90;
        matches.push('name starts with search');
      }
      
      // Food name contains search term
      else if (foodName.includes(searchTerm)) {
        score += 80;
        matches.push('name contains search');
      }

      // Multiple word matching in food name
      searchWords.forEach(word => {
        if (foodName.includes(word)) {
          score += 20;
          matches.push(`name contains "${word}"`);
        }
      });

      // Difficulty matching
      if (difficulties.includes(searchTerm)) {
        score += 70;
        matches.push('difficulty match');
      }

      // Ingredients matching
      if (ingredients.includes(searchTerm)) {
        score += 60;
        matches.push('ingredient match');
      }

      // Description matching
      if (description.includes(searchTerm)) {
        score += 40;
        matches.push('description match');
      }

      // Partial word matching (fuzzy search)
      const foodWords = foodName.split(' ');
      foodWords.forEach(word => {
        if (word.length > 3 && searchTerm.length > 3) {
          const similarity = calculateSimilarity(word, searchTerm);
          if (similarity > 0.6) {
            score += 30;
            matches.push(`fuzzy match "${word}"`);
          }
        }
      });

      // If we have any matches, add to results
      if (score > 0) {
        results.push({ 
          ...recipe, 
          searchScore: score,
          matchReasons: matches
        });
      }
    });

    // Sort by search score (highest first)
    const sortedResults = results.sort((a, b) => b.searchScore - a.searchScore);
    console.log(`Intelligent search results: ${sortedResults.length} recipes found`);
    
    return sortedResults;
  }

  /**
   * Calculate similarity between two strings (simple algorithm)
   */
  function calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = getEditDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculate edit distance between two strings
   */
  function getEditDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Generate smart recipe suggestions as visual cards
   */
  function generateRecipeSuggestions(query, recipes) {
    if (!query || query.length < 2) {
      return [];
    }

    const searchResults = intelligentSearch(query, recipes);
    return searchResults.slice(0, 4); // Show top 4 suggestions
  }

  /**
   * Display recipe suggestions as mini cards
   */
  function displayRecipeSuggestions(suggestions) {
    if (!suggestionsDropdown) return;

    if (suggestions.length === 0) {
      suggestionsDropdown.style.display = 'none';
      return;
    }

    suggestionsDropdown.innerHTML = '';
    
    // Add header
    const header = document.createElement('div');
    header.style.cssText = `
      padding: 10px 16px;
      background: #f8f9fa;
      border-bottom: 1px solid #e9ecef;
      font-weight: bold;
      font-size: 12px;
      color: #6c757d;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    `;
    header.textContent = `${suggestions.length} Recipe${suggestions.length > 1 ? 's' : ''} Found`;
    suggestionsDropdown.appendChild(header);
    
    suggestions.forEach(recipe => {
      const nutritionSum =
        (parseInt(recipe.protein) || 0) +
        (parseInt(recipe.vitamin) || 0) +
        (parseInt(recipe.calories) || 0) +
        (parseInt(recipe.carbohydrates) || 0);

      const suggestionCard = document.createElement('div');
      suggestionCard.style.cssText = `
        display: flex;
        align-items: center;
        padding: 12px 16px;
        cursor: pointer;
        border-bottom: 1px solid #f0f0f0;
        transition: all 0.2s ease;
        gap: 12px;
      `;
      
      suggestionCard.innerHTML = `
        <div style="
          width: 50px;
          height: 50px;
          border-radius: 8px;
          overflow: hidden;
          flex-shrink: 0;
          background: #f5f5f5;
        ">
          <img src="${recipe.food_image_url || ''}" 
               alt="${recipe.food_name || 'Recipe'}" 
               style="width: 100%; height: 100%; object-fit: cover;"
               onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA1MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjUwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yNSAyMEMyNy43NjE0IDIwIDMwIDIyLjIzODYgMzAgMjVDMzAgMjcuNzYxNCAyNy43NjE0IDMwIDI1IDMwQzIyLjIzODYgMzAgMjAgMjcuNzYxNCAyMCAyNUMyMCAyMi4yMzg2IDIyLjIzODYgMjAgMjUgMjBaIiBmaWxsPSIjQ0NDIi8+Cjwvc3ZnPgo='" />
        </div>
        <div style="flex: 1; min-width: 0;">
          <h4 style="
            margin: 0 0 4px 0;
            font-size: 14px;
            font-weight: 600;
            color: #333;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          ">${recipe.food_name || 'No Name'}</h4>
          <p style="
            margin: 0 0 2px 0;
            font-size: 11px;
            color: #666;
            text-transform: capitalize;
          ">${recipe.difficulties || 'Unknown'} • ${recipe.table || 'Unknown'}</p>
          <p style="
            margin: 0;
            font-size: 10px;
            color: #888;
          ">${recipe.cooking_time || 0} min • ${nutritionSum} nutrition</p>
        </div>
        <div style="
          font-size: 18px;
          color: #ccc;
          transform: rotate(-45deg);
        ">↗</div>
      `;
      
      suggestionCard.addEventListener('mouseenter', () => {
        suggestionCard.style.backgroundColor = '#f8f9fa';
        suggestionCard.style.transform = 'translateX(2px)';
      });
      
      suggestionCard.addEventListener('mouseleave', () => {
        suggestionCard.style.backgroundColor = 'white';
        suggestionCard.style.transform = 'translateX(0)';
      });
      
      suggestionCard.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Hide suggestions
        suggestionsDropdown.style.display = 'none';
        
        // Set search input to the recipe name
        searchInput.value = recipe.food_name;
        
        // Show this recipe in the main cards area
        renderRecipes([recipe]);
        
        // Optional: Navigate to recipe details
        // sessionStorage.setItem('selectedFood', JSON.stringify(recipe));
        // window.location.href = `../food_page.html?id=${recipe.id}&table=${recipe.table}`;
      });

      suggestionsDropdown.appendChild(suggestionCard);
    });

    suggestionsDropdown.style.display = 'block';
  }

  /**
   * Apply category filter
   */
  function filterByCategory(recipes, category) {
    if (!category || category === 'Category') {
      return recipes;
    }
    return recipes.filter(recipe => recipe.table === category.toLowerCase());
  }

  /**
   * Apply other filters (difficulty, time)
   */
  function applyFilters(recipes, filter) {
    if (!filter || filter === 'Filter') {
      return recipes;
    }

    const difficultyFilters = ["easy", "moderate", "difficult"];
    
    if (difficultyFilters.includes(filter.toLowerCase())) {
      return recipes.filter(recipe => 
        (recipe.difficulties || '').toLowerCase().includes(filter.toLowerCase())
      );
    }

    if (filter === "less-time" || filter === "more-time") {
      const sorted = [...recipes].sort((a, b) => {
        const timeA = parseInt(a.cooking_time) || 0;
        const timeB = parseInt(b.cooking_time) || 0;
        return filter === "less-time" ? timeA - timeB : timeB - timeA;
      });
      return sorted;
    }

    return recipes;
  }

  // -------------------------------------------------------
  // 5. Render Functions
  // -------------------------------------------------------

  /**
   * Render recipe cards in main container
   */
  function renderRecipes(recipes) {
    if (!cardsContainer) return;

    cardsContainer.innerHTML = '';

    if (recipes.length === 0) {
      cardsContainer.innerHTML = `
        <div style="text-align: center; width: 100%; padding: 40px;">
          <h3 style="color: #666; margin-bottom: 10px;">No recipes found</h3>
          <p style="color: #999;">Try adjusting your search terms or filters</p>
        </div>
      `;
      return;
    }

    console.log(`Rendering ${recipes.length} recipes`);

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
          <img src="${recipe.food_image_url || ''}" alt="${recipe.food_name || 'Recipe'}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='" />
        </div>
        <div class="content">
          <div class="head">
            <h2>${recipe.difficulties || 'Unknown'}</h2>
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

      const viewButton = card.querySelector('.view-btn');
      viewButton.addEventListener('click', (event) => {
        event.stopPropagation();
        sessionStorage.setItem('selectedFood', JSON.stringify(recipe));
        // window.location.href = `../Food?name=${recipe.food_name}&id=${recipe.id}&table=${recipe.table}`;
        window.location.href = `../Food/?${recipe.food_name}&id=${recipe.id}&table=${recipe.table}`;
      });

      cardsContainer.appendChild(card);
    });
  }

  // -------------------------------------------------------
  // 6. Main Update Function
  // -------------------------------------------------------
  
  function updateRecipes() {
    console.log('Updating recipes...');
    
    const currentCategory = categorySelect ? categorySelect.value : 'Category';
    const currentFilter = filterSelect ? filterSelect.value : 'Filter';
    const currentSearch = searchInput ? searchInput.value.trim() : '';

    console.log('Current filters:', { currentCategory, currentFilter, currentSearch });

    let recipes = [...allRecipesCache];

    // Apply category filter first
    recipes = filterByCategory(recipes, currentCategory);
    console.log(`After category filter: ${recipes.length} recipes`);

    // Apply search if there's a search term
    if (currentSearch !== '') {
      recipes = intelligentSearch(currentSearch, recipes);
      console.log(`After intelligent search: ${recipes.length} recipes`);
    } else {
      // Only apply other filters when not searching
      recipes = applyFilters(recipes, currentFilter);
      console.log(`After other filters: ${recipes.length} recipes`);
    }

    renderRecipes(recipes);
  }

  // -------------------------------------------------------
  // 7. Event Listeners
  // -------------------------------------------------------

  // Search input event listeners
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value;
      console.log('Search input changed:', query);
      
      // Show/hide cancel icon
      if (cancelIcon) {
        if (query.trim() !== '') {
          cancelIcon.style.display = 'inline-block';
        } else {
          cancelIcon.style.display = 'none';
          if (suggestionsDropdown) {
            suggestionsDropdown.style.display = 'none';
          }
        }
      }

      // Clear previous timeout
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      // Generate recipe suggestions with debounce
      if (query.length >= 2) {
        searchTimeout = setTimeout(() => {
          const recipeSuggestions = generateRecipeSuggestions(query, allRecipesCache);
          console.log('Generated recipe suggestions:', recipeSuggestions.length);
          displayRecipeSuggestions(recipeSuggestions);
        }, 200); // Faster response for better UX
      } else if (suggestionsDropdown) {
        suggestionsDropdown.style.display = 'none';
      }

      // Update main recipes with slight delay
      setTimeout(() => {
        updateRecipes();
      }, 300);
    });

    // Handle Enter key
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (suggestionsDropdown) {
          suggestionsDropdown.style.display = 'none';
        }
        updateRecipes();
      } else if (e.key === 'Escape') {
        if (suggestionsDropdown) {
          suggestionsDropdown.style.display = 'none';
        }
      }
    });
  }

  // Cancel icon event listener
  if (cancelIcon) {
    cancelIcon.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
      }
      cancelIcon.style.display = 'none';
      if (suggestionsDropdown) {
        suggestionsDropdown.style.display = 'none';
      }
      updateRecipes();
    });
  }

  // Hide suggestions when clicking outside
  document.addEventListener('click', (e) => {
    if (searchContainer && !searchContainer.contains(e.target) && suggestionsDropdown) {
      suggestionsDropdown.style.display = 'none';
    }
  });

  // Category and filter select event listeners
  if (categorySelect) {
    categorySelect.addEventListener('change', () => {
      if (suggestionsDropdown) {
        suggestionsDropdown.style.display = 'none';
      }
      updateRecipes();
    });
  }
  
  if (filterSelect) {
    filterSelect.addEventListener('change', () => {
      if (suggestionsDropdown) {
        suggestionsDropdown.style.display = 'none';
      }
      updateRecipes();
    });
  }

  // -------------------------------------------------------
  // 8. Initialize Application
  // -------------------------------------------------------
  
  console.log('Initializing intelligent recipe search...');
  
  // Show loading state
  if (cardsContainer) {
    cardsContainer.innerHTML = `
      <div style="text-align: center; width: 100%; padding: 40px;">
        <h3 style="color: #666;">🍳 Loading Recipes...</h3>
        <p style="color: #999;">Preparing your culinary adventure</p>
      </div>
    `;
  }
  
  try {
    // Fetch and cache all recipes
    await fetchAllRecipes();
    console.log('Recipes cached successfully');
    
    // Initial render
    updateRecipes();
    console.log('Intelligent recipe search initialized successfully');
    
  } catch (error) {
    console.error('Error initializing recipes:', error);
    if (cardsContainer) {
      cardsContainer.innerHTML = `
        <div style="text-align: center; width: 100%; padding: 40px;">
          <h3 style="color: #e74c3c;">⚠️ Oops! Something went wrong</h3>
          <p style="color: #666;">Error loading recipes. Please refresh the page.</p>
          <p style="color: #999; font-size: 12px; margin-top: 10px;">Error: ${error.message}</p>
        </div>
      `;
    }
  }
});