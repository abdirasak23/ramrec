document.addEventListener('DOMContentLoaded', () => {
  // ===== PAGE NAVIGATION AND SIDEBAR FUNCTIONALITY =====
  
  // Select sidebar links and container elements
  const dashboardLink = document.getElementById('dashboard');
  const recipeLink = document.getElementById('recipeLink');
  const homeContainer = document.querySelector('.home');
  const recipeContainer = document.querySelector('.recipe');

  // Define default background colors for containers
  const homeDefaultColor = '#fffff0';
  const recipeDefaultColor = '#FFFFF0';

  // Set initial background colors
  if (homeContainer) homeContainer.style.backgroundColor = homeDefaultColor;
  if (recipeContainer) recipeContainer.style.backgroundColor = recipeDefaultColor;

  // Helper function to reset sidebar link backgrounds
  function resetDashLinks() {
    document.querySelectorAll('.dash').forEach(link => {
      link.style.backgroundColor = 'transparent';
    });
  }

  // Function to switch pages and update active page state
  function setActivePage(page) {
    // Note: Not using localStorage to comply with artifact restrictions
    if (page === 'dashboard') {
      if (homeContainer) homeContainer.style.display = 'flex';
      if (recipeContainer) recipeContainer.style.display = 'none';
      resetDashLinks();
      if (dashboardLink) dashboardLink.style.backgroundColor = '#e5e4e225';
    } else if (page === 'recipe') {
      if (homeContainer) homeContainer.style.display = 'none';
      if (recipeContainer) recipeContainer.style.display = 'flex';
      resetDashLinks();
      if (recipeLink) recipeLink.style.backgroundColor = '#e5e4e225';
    }
  }

  // Set default page to dashboard
  setActivePage('dashboard');

  // Sidebar click events to switch pages
  if (dashboardLink) {
    dashboardLink.addEventListener('click', (e) => {
      e.preventDefault();
      setActivePage('dashboard');
    });
  }

  if (recipeLink) {
    recipeLink.addEventListener('click', (e) => {
      e.preventDefault();
      setActivePage('recipe');
    });
  }

  // Toggle background color for a container when clicked
  function toggleContainerBackground(container, defaultColor) {
    if (container.style.backgroundColor === 'transparent') {
      container.style.backgroundColor = defaultColor;
    } else {
      container.style.backgroundColor = 'transparent';
    }
  }

  if (homeContainer) {
    homeContainer.addEventListener('click', () => {
      toggleContainerBackground(homeContainer, homeDefaultColor);
    });
  }

  if (recipeContainer) {
    recipeContainer.addEventListener('click', () => {
      toggleContainerBackground(recipeContainer, recipeDefaultColor);
    });
  }

  // ===== CHARACTER COUNTER FUNCTIONALITY =====
  
  // Function to initialize character counter for an input field
  function initializeCharacterCounter(inputElement, maxLength, counterElement) {
    if (!inputElement || !counterElement) return;
    
    // Set initial counter display
    updateCounter(inputElement, maxLength, counterElement);
    
    // Add event listeners for real-time counting
    inputElement.addEventListener('input', () => {
      updateCounter(inputElement, maxLength, counterElement);
    });
    
    inputElement.addEventListener('keydown', (e) => {
      // Allow backspace, delete, arrow keys, etc.
      const allowedKeys = [
        'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 
        'ArrowUp', 'ArrowDown', 'Tab', 'Enter', 'Escape',
        'Home', 'End', 'PageUp', 'PageDown'
      ];
      
      // Allow Ctrl/Cmd + A (select all), Ctrl/Cmd + C (copy), Ctrl/Cmd + V (paste), Ctrl/Cmd + X (cut)
      if (e.ctrlKey || e.metaKey) {
        if (['a', 'c', 'v', 'x', 'z', 'y'].includes(e.key.toLowerCase())) {
          return; // Allow these combinations
        }
      }
      
      // If max length reached and it's not an allowed key, prevent input
      if (inputElement.value.length >= maxLength && !allowedKeys.includes(e.key)) {
        e.preventDefault();
      }
    });
    
    // Handle paste events to respect character limit
    inputElement.addEventListener('paste', (e) => {
      setTimeout(() => {
        if (inputElement.value.length > maxLength) {
          inputElement.value = inputElement.value.substring(0, maxLength);
          updateCounter(inputElement, maxLength, counterElement);
        }
      }, 0);
    });
  }
  
  // Function to update the character counter display
  function updateCounter(inputElement, maxLength, counterElement) {
    const currentLength = inputElement.value.length;
    const remaining = maxLength - currentLength;
    
    // Update the counter text
    counterElement.textContent = `( ${remaining} characters )`;
    
    // Add visual feedback based on remaining characters
    if (remaining <= 0) {
      counterElement.style.color = '#ff4444'; // Red when limit reached
      counterElement.textContent = `( 0 characters )`;
    } else if (remaining <= 10) {
      counterElement.style.color = '#ff8800'; // Orange when close to limit
    } else {
      counterElement.style.color = '#666666'; // Default gray color
    }
    
    // Ensure input doesn't exceed max length
    if (currentLength > maxLength) {
      inputElement.value = inputElement.value.substring(0, maxLength);
    }
  }
  
  // Initialize character counters for food name input (17 characters)
  const foodNameInput = document.querySelector('.foodinfo .details:first-child .name input');
  const foodNameCounter = document.querySelector('.foodinfo .details:first-child h5 span');
  
  if (foodNameInput && foodNameCounter) {
    initializeCharacterCounter(foodNameInput, 17, foodNameCounter);
  }
  
  // Initialize character counters for food description input (387 characters)
  const foodDescInput = document.querySelector('.foodinfo .details:last-child .name input');
  const foodDescCounter = document.querySelector('.foodinfo .details:last-child h5 span');

  const videoId = document.getElementById('videoIdInput')?.value.trim();
const videoCredit = document.getElementById('videoCreditInput')?.value.trim();

  
  if (foodDescInput && foodDescCounter) {
    initializeCharacterCounter(foodDescInput, 387, foodDescCounter);
  }

  // ===== INGREDIENTS MANAGEMENT =====
  
  // Get references to the input field and the tags container
  const input = document.querySelector("#nutri input");
  const tagsContainer = document.getElementById("tags-container");
  const deleteButton = document.querySelector(".delete a");
  
  // Track all ingredients in an array
  let ingredientsArray = [];

  if (input) {
    // Listen for keydown events on the input field
    input.addEventListener("keydown", function(event) {
      if (event.key === "," || event.key === "Enter") {
        event.preventDefault();
        let value = input.value.trim().replace(/,$/, "");
        if (value) {
          addTag(value);
          input.value = "";
        }
      }
    });
  }

  // Function to create and add a new tag
  function addTag(value) {
    if (!tagsContainer) return;
    
    // Add to ingredients array
    ingredientsArray.push(value);
    
    const tagDiv = document.createElement("div");
    tagDiv.classList.add("coma");
    tagDiv.dataset.value = value;

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

  // Delete the last-added tag when clicking the delete button
  if (deleteButton) {
    deleteButton.addEventListener("click", function(event) {
      event.preventDefault();
      if (!tagsContainer) return;
      
      const tags = tagsContainer.querySelectorAll(".coma");
      if (tags.length > 0) {
        const lastTag = tags[tags.length - 1];
        const value = lastTag.dataset.value;
        
        // Remove from ingredients array
        const index = ingredientsArray.indexOf(value);
        if (index > -1) {
          ingredientsArray.splice(index, 1);
        }
        
        lastTag.remove();
      }
    });
  }

  // ===== FORM VALIDATION =====
  
  // Function to validate character limits
  function validateCharacterLimits() {
    let isValid = true;
    const errors = [];
    
    // Check food name
    if (foodNameInput && foodNameInput.value.length > 17) {
      errors.push('Food name must be 17 characters or less');
      isValid = false;
    }
    
    // Check food description
    if (foodDescInput && foodDescInput.value.length > 387) {
      errors.push('Food description must be 387 characters or less');
      isValid = false;
    }
    
    // Display errors if any
    if (!isValid) {
      alert('Please fix the following errors:\n' + errors.join('\n'));
    }
    
    return isValid;
  }

  // ===== RECIPE MANAGEMENT (SUPABASE INTEGRATION) =====
  
  // Form submission handling
  const recipeForm = document.getElementById("recipeForm");
  
  if (recipeForm) {
    recipeForm.addEventListener("submit", async function(event) {
      event.preventDefault();
      
      // Validate character limits first
      if (!validateCharacterLimits()) {
        return;
      }

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
      const category = formData.get("category") || "dinner";
      
      // Check if we're editing or creating a new recipe
      const urlParams = new URLSearchParams(window.location.search);
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

  // Function to save recipe data to Supabase
  async function saveRecipeToSupabase(recipeData, category) {
    try {
      // Check if supabase is available
      if (typeof supabase === 'undefined') {
        console.error('Supabase client not initialized');
        alert('Database connection not available. Please check your setup.');
        return false;
      }
      
      const tableName = category.toLowerCase();
      
      const { data, error } = await supabase
        .from(tableName)
        .insert([
          {
            ...recipeData,
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
      resetForm();
      
      return true;
    } catch (error) {
      console.error('Exception when saving recipe:', error);
      alert('An unexpected error occurred. Please try again.');
      return false;
    }
  }

  // Function to update an existing recipe
  async function updateRecipe(recipeId, recipeData, category) {
    try {
      if (typeof supabase === 'undefined') {
        console.error('Supabase client not initialized');
        alert('Database connection not available. Please check your setup.');
        return false;
      }
      
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

  // Function to load existing recipe for editing
  async function loadExistingRecipe(recipeId, category) {
    try {
      if (typeof supabase === 'undefined') {
        console.error('Supabase client not initialized');
        return;
      }
      
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
          if (key === 'id' || key === 'created_at' || key === 'ingredients') continue;
          
          const field = recipeForm.elements[key];
          if (field) {
            field.value = value;
          }
        }
        
        // Update character counters after loading data
        if (foodNameInput && foodNameCounter) {
          updateCounter(foodNameInput, 17, foodNameCounter);
        }
        if (foodDescInput && foodDescCounter) {
          updateCounter(foodDescInput, 387, foodDescCounter);
        }
        
        // Clear existing ingredients tags
        if (tagsContainer) {
          tagsContainer.innerHTML = '';
        }
        ingredientsArray = [];
        
        // Add ingredients tags if they exist
        if (data.ingredients && Array.isArray(data.ingredients)) {
          data.ingredients.forEach(ingredient => {
            addTag(ingredient);
            console.log("The ingredients data has been loaded:", ingredient);
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
  
  if (editRecipeId && editCategory && recipeForm) {
    loadExistingRecipe(editRecipeId, editCategory);
  }

  // ===== UTILITY FUNCTIONS =====
  
  // Function to reset form and counters
  function resetForm() {
    if (recipeForm) {
      recipeForm.reset();
    }
    
    // Clear ingredients tags
    if (tagsContainer) {
      tagsContainer.innerHTML = '';
    }
    ingredientsArray = [];
    
    // Reset character counters
    if (foodNameInput && foodNameCounter) {
      updateCounter(foodNameInput, 17, foodNameCounter);
    }
    if (foodDescInput && foodDescCounter) {
      updateCounter(foodDescInput, 387, foodDescCounter);
    }
  }
  
  // Add reset button functionality if it exists
  const resetButton = document.querySelector('.reset-form');
  if (resetButton) {
    resetButton.addEventListener('click', (e) => {
      e.preventDefault();
      resetForm();
    });
  }

  // Make key functions available globally if needed
  window.adminFunctions = {
    resetForm,
    validateCharacterLimits,
    addTag,
    setActivePage
  };

});



// Recipe Steps Management
class RecipeStepsManager {
    constructor() {
        this.stepsContainer = document.querySelector('.steps');
        this.addButton = document.querySelector('.add-new');
        this.stepCounter = 3; // Start from 4 since we have 3 initial steps
        
        this.init();
    }
    
    init() {
        // Add event listener for the "Add Step" button
        this.addButton.addEventListener('click', () => this.addNewStep());
        
        // Add event listeners for existing delete buttons
        this.attachDeleteListeners();
    }
    
    addNewStep() {
        this.stepCounter++;
        
        // Create new step HTML
        const newStepHTML = `
            <div class="nutri" id="steps">
                <h3>Step ${this.stepCounter}</h3>
                <div class="info-step">
                    <div class="nutritions_details" id="step-input">
                        <input type="text" placeholder="eg. Add Another Step">
                    </div>
                    <div class="cancel">
                        <i class="fa-solid fa-trash"></i>
                    </div>
                </div>
            </div>
        `;
        
        // Insert the new step before the "Add Step" button
        this.addButton.insertAdjacentHTML('beforebegin', newStepHTML);
        
        // Attach delete listener to the new step
        this.attachDeleteListeners();
    }
    
    attachDeleteListeners() {
        // Remove existing listeners to avoid duplicates
        const deleteButtons = document.querySelectorAll('.cancel');
        
        deleteButtons.forEach(button => {
            // Remove existing event listeners by cloning the element
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            // Add new event listener
            newButton.addEventListener('click', (e) => this.deleteStep(e));
        });
    }
    
    deleteStep(event) {
        const stepElement = event.target.closest('.nutri');
        
        // Don't allow deletion if only one step remains
        const allSteps = document.querySelectorAll('.nutri[id="steps"]');
        if (allSteps.length <= 1) {
            alert('At least one step is required!');
            return;
        }
        
        // Remove the step
        stepElement.remove();
        
        // Renumber all remaining steps
        this.renumberSteps();
    }
    
    renumberSteps() {
        const allSteps = document.querySelectorAll('.nutri[id="steps"]');
        
        allSteps.forEach((step, index) => {
            const stepTitle = step.querySelector('h3');
            stepTitle.textContent = `Step ${index + 1}`;
        });
        
        // Update counter to reflect current number of steps
        this.stepCounter = allSteps.length;
    }
}

// Initialize the steps manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new RecipeStepsManager();
});

// Alternative simpler approach (if you prefer functional style)
/*
document.addEventListener('DOMContentLoaded', function() {
    const stepsContainer = document.querySelector('.steps');
    const addButton = document.querySelector('.add-new');
    let stepCounter = 3;
    
    // Add new step
    addButton.addEventListener('click', function() {
        stepCounter++;
        
        const newStep = document.createElement('div');
        newStep.className = 'nutri';
        newStep.id = 'steps';
        newStep.innerHTML = `
            <h3>Step ${stepCounter}</h3>
            <div class="info-step">
                <div class="nutritions_details" id="step-input">
                    <input type="text" placeholder="eg. Add Another Step">
                </div>
                <div class="cancel">
                    <i class="fa-solid fa-trash"></i>
                </div>
            </div>
        `;
        
        stepsContainer.insertBefore(newStep, addButton);
        attachDeleteListener(newStep.querySelector('.cancel'));
    });
    
    // Attach delete listeners to existing steps
    document.querySelectorAll('.cancel').forEach(button => {
        attachDeleteListener(button);
    });
    
    function attachDeleteListener(button) {
        button.addEventListener('click', function() {
            const allSteps = document.querySelectorAll('.nutri[id="steps"]');
            
            if (allSteps.length <= 1) {
                alert('At least one step is required!');
                return;
            }
            
            this.closest('.nutri').remove();
            renumberSteps();
        });
    }
    
    function renumberSteps() {
        const allSteps = document.querySelectorAll('.nutri[id="steps"]');
        stepCounter = allSteps.length;
        
        allSteps.forEach((step, index) => {
            step.querySelector('h3').textContent = `Step ${index + 1}`;
        });
    }
});
*/