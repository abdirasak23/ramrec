document.addEventListener('DOMContentLoaded', () => {
  // Select sidebar links and container elements
  const dashboardLink = document.getElementById('dashboard');
  const recipeLink = document.getElementById('recipeLink');
  const homeContainer = document.querySelector('.home');
  const recipeContainer = document.querySelector('.recipe');

  // Define default background colors for containers
  const homeDefaultColor = 'red';
  const recipeDefaultColor = '#FFFFF0';

  // Set initial background colors
  homeContainer.style.backgroundColor = homeDefaultColor;
  recipeContainer.style.backgroundColor = recipeDefaultColor;

  // Helper function to reset sidebar link backgrounds
  function resetDashLinks() {
    document.querySelectorAll('.dash').forEach(link => {
      link.style.backgroundColor = 'transparent';
    });
  }

  // Function to switch pages and update localStorage with the active page
  function setActivePage(page) {
    localStorage.setItem('activePage', page);
    if (page === 'dashboard') {
      homeContainer.style.display = 'flex';  // Show dashboard content
      recipeContainer.style.display = 'none';  // Hide recipe content
      resetDashLinks();
      dashboardLink.style.backgroundColor = '#e5e4e225'; // Active color for dashboard
    } else if (page === 'recipe') {
      homeContainer.style.display = 'none';  // Hide dashboard content
      recipeContainer.style.display = 'flex'; // Show recipe content
      resetDashLinks();
      recipeLink.style.backgroundColor = '#e5e4e225'; // Active color for recipe
    }
  }

  // On page load, check localStorage for the active page (default to dashboard)
  const storedPage = localStorage.getItem('activePage') || 'dashboard';
  setActivePage(storedPage);

  // Sidebar click events to switch pages
  dashboardLink.addEventListener('click', (e) => {
    e.preventDefault();
    setActivePage('dashboard');
  });

  recipeLink.addEventListener('click', (e) => {
    e.preventDefault();
    setActivePage('recipe');
  });

  // Toggle background color for a container when clicked (if needed)
  function toggleContainerBackground(container, defaultColor) {
    if (container.style.backgroundColor === 'transparent') {
      container.style.backgroundColor = defaultColor;
    } else {
      container.style.backgroundColor = 'transparent';
    }
  }

  homeContainer.addEventListener('click', () => {
    toggleContainerBackground(homeContainer, homeDefaultColor);
  });

  recipeContainer.addEventListener('click', () => {
    toggleContainerBackground(recipeContainer, recipeDefaultColor);
  });

  // Ingredients management
  // Get references to the input field and the tags container
  const input = document.querySelector("#nutri input");
  const tagsContainer = document.getElementById("tags-container");
  const deleteButton = document.querySelector(".delete a"); // Select the delete button
  
  // Track all ingredients in an array
  let ingredientsArray = [];

  // Listen for keydown events on the input field
  input.addEventListener("keydown", function(event) {
    if (event.key === "," || event.key === "Enter") {
      event.preventDefault(); // Prevent the comma or Enter from being entered as text
      let value = input.value.trim().replace(/,$/, "");
      if (value) {
        addTag(value);
        input.value = ""; // Clear the input after adding the tag
      }
    }
  });

  // Function to create and add a new tag
  function addTag(value) {
    // Add to ingredients array
    ingredientsArray.push(value);
    
    const tagDiv = document.createElement("div");
    tagDiv.classList.add("coma");
    tagDiv.dataset.value = value; // Store the ingredient value as a data attribute

    const tagText = document.createElement("p");
    tagText.textContent = value;

    const removeBtn = document.createElement("button");
    removeBtn.classList.add("remove-btn");
    removeBtn.textContent = "×";
    removeBtn.onclick = function() {
      // Remove from ingredients array
      const index = ingredientsArray.indexOf(value);
      if (index > -1) {
        ingredientsArray.splice(index, 1);
      }
      tagDiv.remove();
    };

    tagDiv.appendChild(tagText);
    tagDiv.appendChild(removeBtn);
    tagsContainer.appendChild(tagDiv);
  }

  // Delete the last-added tag when clicking the delete button (LIFO - Last In First Out)
  deleteButton.addEventListener("click", function(event) {
    event.preventDefault(); // Prevent default link behavior
    const tags = tagsContainer.querySelectorAll(".coma"); // Get all added tags
    if (tags.length > 0) {
      const lastTag = tags[tags.length - 1];
      const value = lastTag.dataset.value;
      
      // Remove from ingredients array
      const index = ingredientsArray.indexOf(value);
      if (index > -1) {
        ingredientsArray.splice(index, 1);
      }
      
      lastTag.remove(); // Remove the last tag (most recent one)
    }
  });

  // Form submission handling (assuming you have a form with id "recipeForm")
  const recipeForm = document.getElementById("recipeForm");
  
  if (recipeForm) {
    recipeForm.addEventListener("submit", async function(event) {
      event.preventDefault(); // Prevent the form from submitting normally

      // Get form data
      const formData = new FormData(recipeForm);
      const recipeData = {};
      
      // Convert FormData to object
      for (const [key, value] of formData.entries()) {
        recipeData[key] = value;
      }
      
      // Add ingredients array to the recipe data
      recipeData.ingredients = ingredientsArray;
      
      // Get the category (dinner, iftar, sahur, breakfast)
      const category = formData.get("category") || "dinner"; // Default to dinner if not specified
      
      // Save to Supabase
      await saveRecipeToSupabase(recipeData, category);
    });
  }

  // Function to save recipe data to the appropriate Supabase table based on category
  async function saveRecipeToSupabase(recipeData, category) {
    try {
      // Get the Supabase client (assuming it's already initialized elsewhere in your code)
      // const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_ANON_KEY');
      
      // Determine the table name based on category
      const tableName = category.toLowerCase(); // e.g., 'dinner', 'iftar', 'sahur', 'breakfast'
      
      // Save data to the appropriate table
      const { data, error } = await supabase
        .from(tableName)
        .insert([
          {
            // Spread all other form fields
            ...recipeData,
            // Ensure ingredients is saved as an array
            ingredients: ingredientsArray
          }
        ]);
      
      if (error) {
        console.error(`Error saving recipe to ${tableName}:`, error);
        alert(`Failed to save recipe to ${category}. Please try again.`);
        return false;
      }
      
      console.log(`Recipe saved successfully to ${tableName}:`, data);
      alert(`Recipe saved successfully to ${category}!`);
      
      // Clear form and ingredients after successful save
      if (recipeForm) {
        recipeForm.reset();
      }
      
      // Clear ingredients tags
      tagsContainer.innerHTML = '';
      ingredientsArray = [];
      
      return true;
    } catch (error) {
      console.error('Exception when saving recipe:', error);
      alert('An unexpected error occurred. Please try again.');
      return false;
    }
  }

  // Function to load existing recipe for editing
  async function loadExistingRecipe(recipeId, category) {
    try {
      // Get the Supabase client (assuming it's already initialized elsewhere in your code)
      const tableName = category.toLowerCase();
      
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', recipeId)
        .single();
      
      if (error) {
        console.error(`Error loading recipe from ${tableName}:`, error);
        return;
      }
      
      if (data) {
        // Fill form fields with recipe data
        for (const [key, value] of Object.entries(data)) {
          // Skip non-form fields
          if (key === 'id' || key === 'created_at' || key === 'ingredients') continue;
          
          const field = recipeForm.elements[key];
          if (field) {
            field.value = value;
          }
        }
        
        // Clear existing ingredients tags
        tagsContainer.innerHTML = '';
        ingredientsArray = [];
        
        // Add ingredients tags if they exist
        if (data.ingredients && Array.isArray(data.ingredients)) {
          data.ingredients.forEach(ingredient => {
            addTag(ingredient);
            console.log("The ingredients data has been saved", ingredient);
          });
        }
      }
    } catch (error) {
      console.error('Exception when loading recipe:', error);
    }
  }

  // Check URL parameters for recipe ID and category for editing
  const urlParams = new URLSearchParams(window.location.search);
  const editRecipeId = urlParams.get('editId');
  const editCategory = urlParams.get('category');
  
  if (editRecipeId && editCategory) {
    // We're in edit mode, load the recipe
    loadExistingRecipe(editRecipeId, editCategory);
  }

  // Function to update an existing recipe
  async function updateRecipe(recipeId, recipeData, category) {
    try {
      const tableName = category.toLowerCase();
      
      const { data, error } = await supabase
        .from(tableName)
        .update({
          ...recipeData,
          ingredients: ingredientsArray
        })
        .eq('id', recipeId);
      
      if (error) {
        console.error(`Error updating recipe in ${tableName}:`, error);
        alert(`Failed to update recipe in ${category}. Please try again.`);
        return false;
      }
      
      console.log(`Recipe updated successfully in ${tableName}:`, data);
      alert(`Recipe updated successfully in ${category}!`);
      return true;
    } catch (error) {
      console.error('Exception when updating recipe:', error);
      alert('An unexpected error occurred. Please try again.');
      return false;
    }
  }

  // Modify form submission to handle both new recipes and updates
  if (recipeForm) {
    recipeForm.addEventListener("submit", async function(event) {
      event.preventDefault();
      
      const formData = new FormData(recipeForm);
      const recipeData = {};
      
      for (const [key, value] of formData.entries()) {
        recipeData[key] = value;
      }
      
      // Add ingredients array
      recipeData.ingredients = ingredientsArray;
      
      // Get the category
      const category = formData.get("category") || "dinner";
      
      // Check if we're editing or creating a new recipe
      const editRecipeId = urlParams.get('editId');
      const editCategory = urlParams.get('category');
      
      if (editRecipeId && editCategory) {
        // Update existing recipe
        await updateRecipe(editRecipeId, recipeData, editCategory);
      } else {
        // Create new recipe
        await saveRecipeToSupabase(recipeData, category);
      }
    });
  }
});