// Initialize Supabase client
const SUPABASE_URL = 'https://vyacbonatqmyfhixonej.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5YWNib25hdHFteWZoaXhvbmVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3MTY2NzIsImV4cCI6MjA1NjI5MjY3Mn0.zrG4WJLFXE0SzOezTXLNTjt-xwJNU9U4xawHrr9MgQw';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global variables
let currentUser = null;
let selectedImages = {
    food: null,
    ad: null
};

// DOM Elements for new recipe form
const recipeForm = {
    name: document.getElementById('recipe-name'),
    category: document.getElementById('recipe-category'),
    description: document.getElementById('recipe-description'),
    cookTime: document.getElementById('cook-time'),
    prepTime: document.getElementById('prep-time'),
    difficulty: document.getElementById('difficulty'),
    videoId: document.getElementById('video-id'),
    videoCredit: document.getElementById('video-credit'),
    protein: document.getElementById('protein'),
    vitamin: document.getElementById('vitamin'),
    calories: document.getElementById('calories'),
    carbs: document.getElementById('carbs'),
    ingredients: document.getElementById('ingredients'),
    submitBtn: document.querySelector('.submit-btn')
};

// Initialize the recipe management system
document.addEventListener('DOMContentLoaded', async () => {
    await initializeUser();
    setupRecipeFormEventListeners();
    setupImageUpload();
    setupCharacterCounters();
});

// Initialize user session
async function initializeUser() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) throw error;
        if (!user) {
            showAlert('Please sign in to access this feature', 'error');
            window.location.href = '../Login/';
            return;
        }
        
        currentUser = user;
        console.log('User initialized:', currentUser.id);
        
    } catch (error) {
        console.error('Error initializing user:', error);
        showAlert('Authentication error. Please sign in again.', 'error');
        window.location.href = '../Login/';
    }
}

// Setup event listeners for the recipe form
function setupRecipeFormEventListeners() {
    // Submit button click handler
    if (recipeForm.submitBtn) {
        recipeForm.submitBtn.addEventListener('click', handleRecipeSubmission);
    }
    
    // Real-time validation
    Object.keys(recipeForm).forEach(key => {
        const element = recipeForm[key];
        if (element && element.tagName) {
            element.addEventListener('blur', validateField);
        }
    });
}

// Setup image upload functionality
function setupImageUpload() {
    const imageContainers = document.querySelectorAll('.image-container');
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    
    let activeImageType = null;
    
    imageContainers.forEach((container, index) => {
        container.addEventListener('click', () => {
            activeImageType = index === 0 ? 'food' : 'ad';
            fileInput.click();
        });
    });
    
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                showAlert('Image size must be less than 5MB', 'error');
                return;
            }
            
            // Validate file type
            if (!file.type.startsWith('image/')) {
                showAlert('Please select a valid image file', 'error');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                const dataUrl = e.target.result;
                selectedImages[activeImageType] = {
                    file: file,
                    dataUrl: dataUrl
                };
                
                // Update UI
                const containerIndex = activeImageType === 'food' ? 0 : 1;
                updateImageContainer(imageContainers[containerIndex], dataUrl);
            };
            reader.readAsDataURL(file);
        }
        fileInput.value = '';
    });
}

// Update image container with selected image
function updateImageContainer(container, dataUrl) {
    container.innerHTML = `<img src="${dataUrl}" alt="Selected image" style="width: 100%; height: 100%; object-fit: cover; border-radius: 6px;">`;
}

// Setup character counters for text inputs
function setupCharacterCounters() {
    // Recipe name counter
    if (recipeForm.name) {
        const nameCounter = recipeForm.name.parentElement.querySelector('.char-count');
        recipeForm.name.addEventListener('input', (e) => {
            const length = e.target.value.length;
            nameCounter.textContent = `${length}/30`;
            
            if (length > 30) {
                e.target.value = e.target.value.substring(0, 30);
                nameCounter.textContent = '30/30';
            }
        });
    }
    
    // Description counter
    if (recipeForm.description) {
        const descCounter = recipeForm.description.parentElement.querySelector('.char-count');
        recipeForm.description.addEventListener('input', (e) => {
            const length = e.target.value.length;
            descCounter.textContent = `${length}/300`;
            
            if (length > 300) {
                e.target.value = e.target.value.substring(0, 300);
                descCounter.textContent = '300/300';
            }
        });
    }
}

// Validate individual form fields
function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    
    // Remove any existing error styling
    field.style.borderColor = '';
    
    // Basic validation
    switch (field.id) {
        case 'recipe-name':
            if (!value) {
                showFieldError(field, 'Recipe name is required');
                return false;
            }
            break;
        case 'recipe-category':
            if (!value) {
                showFieldError(field, 'Please select a category');
                return false;
            }
            break;
        case 'recipe-description':
            if (!value) {
                showFieldError(field, 'Description is required');
                return false;
            }
            break;
        case 'cook-time':
        case 'prep-time':
            if (!value) {
                showFieldError(field, 'Time is required');
                return false;
            }
            break;
    }
    
    return true;
}

// Show field-specific error
function showFieldError(field, message) {
    field.style.borderColor = '#ff416c';
    showAlert(message, 'error');
}

// Handle recipe submission
async function handleRecipeSubmission(e) {
    e.preventDefault();
    
    if (!currentUser) {
        showAlert('Please sign in to submit a recipe', 'error');
        return;
    }
    
    // Show loading state
    const originalButtonText = recipeForm.submitBtn.textContent;
    recipeForm.submitBtn.textContent = 'Submitting...';
    recipeForm.submitBtn.disabled = true;
    
    try {
        // Validate form
        const validation = validateRecipeForm();
        if (!validation.isValid) {
            showAlert(validation.message, 'error');
            return;
        }
        
        // Upload images first
        const imageUrls = await uploadImages();
        
        // Prepare recipe data
        const recipeData = prepareRecipeData(imageUrls);
        
        // Insert into appropriate category table
        await insertRecipeToDatabase(recipeData);
        
        // Show success message and reset form
        showAlert('Recipe submitted successfully!', 'success');
        resetRecipeForm();
        
        // Switch back to profile view
        setTimeout(() => {
            document.querySelector('[data-view="profile"]').click();
        }, 2000);
        
    } catch (error) {
        console.error('Recipe submission error:', error);
        showAlert(`Error submitting recipe: ${error.message}`, 'error');
    } finally {
        // Restore button state
        recipeForm.submitBtn.textContent = originalButtonText;
        recipeForm.submitBtn.disabled = false;
    }
}

// Validate the entire recipe form
function validateRecipeForm() {
    // Check required fields
    const requiredFields = [
        { field: recipeForm.name, name: 'Recipe name' },
        { field: recipeForm.category, name: 'Category' },
        { field: recipeForm.description, name: 'Description' },
        { field: recipeForm.cookTime, name: 'Cooking time' },
        { field: recipeForm.prepTime, name: 'Preparation time' },
        { field: recipeForm.ingredients, name: 'Ingredients' }
    ];
    
    for (const { field, name } of requiredFields) {
        if (!field || !field.value.trim()) {
            return {
                isValid: false,
                message: `${name} is required`
            };
        }
    }
    
    // Check images
    if (!selectedImages.food || !selectedImages.ad) {
        return {
            isValid: false,
            message: 'Please upload both food and advertisement images'
        };
    }
    
    // Validate category selection
    const validCategories = ['breakfast', 'lunch', 'dinner', 'dessert', 'snack'];
    if (!validCategories.includes(recipeForm.category.value)) {
        return {
            isValid: false,
            message: 'Please select a valid category'
        };
    }
    
    return {
        isValid: true,
        message: 'Form is valid'
    };
}

// Upload images to Supabase storage
async function uploadImages() {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 10);
    
    const foodFileName = `food/food_${timestamp}_${randomString}.${getFileExtension(selectedImages.food.file.name)}`;
    const adFileName = `ads/ad_${timestamp}_${randomString}.${getFileExtension(selectedImages.ad.file.name)}`;
    
    try {
        // Upload food image
        const { data: foodData, error: foodError } = await supabase.storage
            .from('images')
            .upload(foodFileName, selectedImages.food.file, {
                cacheControl: '3600',
                upsert: false
            });
        
        if (foodError) throw new Error(`Food image upload failed: ${foodError.message}`);
        
        // Upload ad image
        const { data: adData, error: adError } = await supabase.storage
            .from('images')
            .upload(adFileName, selectedImages.ad.file, {
                cacheControl: '3600',
                upsert: false
            });
        
        if (adError) {
            // Clean up food image if ad upload fails
            await supabase.storage.from('images').remove([foodFileName]);
            throw new Error(`Ad image upload failed: ${adError.message}`);
        }
        
        // Get public URLs
        const foodImageUrl = supabase.storage.from('images').getPublicUrl(foodFileName).data.publicUrl;
        const adImageUrl = supabase.storage.from('images').getPublicUrl(adFileName).data.publicUrl;
        
        return {
            foodImageUrl,
            adImageUrl,
            foodFileName,
            adFileName
        };
        
    } catch (error) {
        console.error('Image upload error:', error);
        throw error;
    }
}

// Get file extension from filename
function getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
}

// Prepare recipe data for database insertion
function prepareRecipeData(imageUrls) {
    // Parse ingredients (split by commas and clean up)
    const ingredientsArray = recipeForm.ingredients.value
        .split(',')
        .map(ingredient => ingredient.trim())
        .filter(ingredient => ingredient.length > 0);
    
    return {
        user_id: currentUser.id,
        food_name: recipeForm.name.value.trim(),
        food_description: recipeForm.description.value.trim(),
        cooking_time: parseInt(recipeForm.cookTime.value) || 0,
        preparation_time: parseInt(recipeForm.prepTime.value) || 0,
        difficulties: recipeForm.difficulty.value || 'easy',
        video_id: recipeForm.videoId?.value.trim() || '',
        video_credit: recipeForm.videoCredit?.value.trim() || '',
        protein: parseInt(recipeForm.protein?.value) || 0,
        vitamin: parseInt(recipeForm.vitamin?.value) || 0,
        calories: parseInt(recipeForm.calories?.value) || 0,
        carbohydrates: parseInt(recipeForm.carbs?.value) || 0,
        ingredients: ingredientsArray,
        food_image_url: imageUrls.foodImageUrl,
        ad_image_url: imageUrls.adImageUrl,
        created_at: new Date().toISOString()
    };
}

// Insert recipe data into the appropriate category table
async function insertRecipeToDatabase(recipeData) {
    const category = recipeForm.category.value;
    
    try {
        const { data, error } = await supabase
            .from(category)
            .insert([recipeData])
            .select();
        
        if (error) throw error;
        
        console.log('Recipe inserted successfully:', data);
        
        // Update user's recipe count in profile (optional)
        await updateUserRecipeCount();
        
        return data;
        
    } catch (error) {
        console.error('Database insertion error:', error);
        // Clean up uploaded images if database insertion fails
        try {
            await supabase.storage.from('images').remove([
                recipeData.food_image_url.split('/').pop(),
                recipeData.ad_image_url.split('/').pop()
            ]);
        } catch (cleanupError) {
            console.error('Error cleaning up images:', cleanupError);
        }
        throw error;
    }
}

// Update user's recipe count (optional feature)
async function updateUserRecipeCount() {
    try {
        // Get current recipe count across all categories
        const categories = ['breakfast', 'lunch', 'dinner', 'dessert', 'snack'];
        let totalRecipes = 0;
        
        for (const category of categories) {
            const { count, error } = await supabase
                .from(category)
                .select('*', { count: 'exact', head: true })
                .eq('user_id', currentUser.id);
            
            if (!error && count) {
                totalRecipes += count;
            }
        }
        
        // Update the UI
        const recipeCountElement = document.getElementById('no-recipes');
        if (recipeCountElement) {
            recipeCountElement.textContent = totalRecipes.toString();
        }
        
    } catch (error) {
        console.error('Error updating recipe count:', error);
    }
}

// Reset the recipe form
function resetRecipeForm() {
    // Clear all form fields
    Object.keys(recipeForm).forEach(key => {
        const element = recipeForm[key];
        if (element && element.tagName && element !== recipeForm.submitBtn) {
            if (element.tagName === 'SELECT') {
                element.selectedIndex = 0;
            } else {
                element.value = '';
            }
        }
    });
    
    // Clear selected images
    selectedImages = { food: null, ad: null };
    
    // Reset image containers
    const imageContainers = document.querySelectorAll('.image-container');
    imageContainers.forEach(container => {
        container.innerHTML = '<i class="fas fa-plus"></i>';
    });
    
    // Reset character counters
    const charCounters = document.querySelectorAll('.char-count');
    charCounters.forEach(counter => {
        if (counter.textContent.includes('/30')) {
            counter.textContent = '0/30';
        } else if (counter.textContent.includes('/300')) {
            counter.textContent = '0/300';
        }
    });
}

// Load user's recipes (for profile display)
async function loadUserRecipes() {
    if (!currentUser) return;
    
    try {
        const categories = ['breakfast', 'lunch', 'dinner', 'dessert', 'snack'];
        let allRecipes = [];
        
        for (const category of categories) {
            const { data, error } = await supabase
                .from(category)
                .select('*')
                .eq('user_id', currentUser.id)
                .order('created_at', { ascending: false });
            
            if (!error && data) {
                allRecipes = allRecipes.concat(data.map(recipe => ({
                    ...recipe,
                    category: category
                })));
            }
        }
        
        // Update UI with user's recipes
        updateRecipesList(allRecipes);
        
    } catch (error) {
        console.error('Error loading user recipes:', error);
    }
}

// Update the recipes list in the UI
function updateRecipesList(recipes) {
    const recipeCountElement = document.getElementById('no-recipes');
    const noRecipeMsg = document.getElementById('no-recipe-msg');
    
    if (recipeCountElement) {
        recipeCountElement.textContent = recipes.length.toString();
    }
    
    if (noRecipeMsg) {
        if (recipes.length === 0) {
            noRecipeMsg.textContent = "You haven't created any recipes yet.";
        } else {
            noRecipeMsg.innerHTML = `
                <div class="recent-recipes">
                    ${recipes.slice(0, 3).map(recipe => `
                        <div class="recipe-item" style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px; padding: 10px; background: #f8f9fa; border-radius: 8px;">
                            <img src="${recipe.food_image_url}" alt="${recipe.food_name}" style="width: 50px; height: 50px; border-radius: 6px; object-fit: cover;">
                            <div>
                                <strong>${recipe.food_name}</strong>
                                <p style="font-size: 12px; color: #6c757d; margin: 0;">${recipe.category.charAt(0).toUpperCase() + recipe.category.slice(1)}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    }
}

// Show alert message
function showAlert(message, type) {
    const alertElement = document.querySelector('.alert');
    const alertMsg = alertElement.querySelector('.message');
    
    if (alertMsg) {
        alertMsg.textContent = message;
    }
    
    // Set alert type
    alertElement.className = 'alert';
    alertElement.classList.add(type);
    alertElement.classList.add('show');
    
    // Auto hide after 5 seconds
    setTimeout(() => {
        alertElement.classList.remove('show');
    }, 5000);
}

// Load user recipes when profile view is active
document.addEventListener('DOMContentLoaded', () => {
    const profileNavItem = document.querySelector('[data-view="profile"]');
    if (profileNavItem) {
        profileNavItem.addEventListener('click', () => {
            setTimeout(loadUserRecipes, 500);
        });
    }
});

// Export functions for use in other parts of the application
window.recipeManager = {
    loadUserRecipes,
    updateUserRecipeCount,
    showAlert
};


