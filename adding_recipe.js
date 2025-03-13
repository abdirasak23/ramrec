// Import Supabase client
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Supabase client
  const supabaseUrl = 'https://vyacbonatqmyfhixonej.supabase.co';
  const supabaseKey =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5YWNib25hdHFteWZoaXhvbmVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3MTY2NzIsImV4cCI6MjA1NjI5MjY3Mn0.zrG4WJLFXE0SzOezTXLNTjt-xwJNU9U4xawHrr9MgQw';
  const supabase = createClient(supabaseUrl, supabaseKey);

  /**
   * Displays a custom alert in the alert container.
   * @param {string} message - The message to display.
   * @param {string} type - The alert type, either "success" or "error".
   */
  function showAlert(message, type) {
    const alertContainer = document.querySelector('.alert');
    if (!alertContainer) {
      console.warn('Alert container not found.');
      return;
    }
    const alertMessage = alertContainer.querySelector('p');
    alertMessage.textContent = message;

    // Set background color based on the alert type.
    if (type === 'success') {
      alertContainer.style.backgroundColor = 'green';
    } else if (type === 'error') {
      alertContainer.style.backgroundColor = 'red';
    } else {
      alertContainer.style.backgroundColor = '';
    }
    // Display the alert container.
    alertContainer.style.display = 'block';

    // Auto-hide after 5 seconds.
    setTimeout(() => {
      alertContainer.style.display = 'none';
    }, 5000);
  }

  // ---------- Logout handling ----------
  const logoutButton = document.getElementById('recipeLinker');
  if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error signing out:', error.message);
        showAlert('Error signing out.', 'error');
      } else {
        showAlert('Logged out successfully.', 'success');
        window.location.href = 'index.html';
      }
    });
  }

  // ---------- Image Selection & Local Storage Handling ----------
  const imageContainers = document.querySelectorAll('.foodimage');
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = 'image/*';
  fileInput.style.display = 'none';
  document.body.appendChild(fileInput);

  // Update a container with the selected image.
  function updateContainerImage(container, dataUrl) {
    container.innerHTML = ''; // Clear existing content.
    const img = document.createElement('img');
    img.src = dataUrl;
    container.appendChild(img);
  }

  // Load stored images if available.
  const storedFoodImage = localStorage.getItem('foodImage');
  const storedAdImage = localStorage.getItem('adImage');
  if (storedFoodImage && imageContainers[0]) {
    updateContainerImage(imageContainers[0], storedFoodImage);
  }
  if (storedAdImage && imageContainers[1]) {
    updateContainerImage(imageContainers[1], storedAdImage);
  }

  // Track active image container index.
  let activeIndex = null;
  imageContainers.forEach((container, index) => {
    container.addEventListener('click', (e) => {
      e.preventDefault();
      activeIndex = index;
      fileInput.click();
    });
  });

  // Handle file selection.
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const dataUrl = e.target.result;
        if (activeIndex !== null && imageContainers[activeIndex]) {
          updateContainerImage(imageContainers[activeIndex], dataUrl);
        }
        if (activeIndex === 0) {
          localStorage.setItem('foodImage', dataUrl);
        } else if (activeIndex === 1) {
          localStorage.setItem('adImage', dataUrl);
        }
      };
      reader.readAsDataURL(file);
    }
    // Clear file input for future selections.
    fileInput.value = '';
  });

  // ---------- Ingredients (Tags) Management ----------
  const ingredientInput = document.querySelector("#nutri input");
  const tagsContainer = document.getElementById("tags-container");

  if (ingredientInput) {
    ingredientInput.addEventListener("keydown", function (event) {
      if (event.key === "," || event.key === "Enter") {
        event.preventDefault();
        const value = ingredientInput.value.trim().replace(/,$/, "");
        if (value) {
          addTag(value);
          ingredientInput.value = "";
        }
      }
    });
  }

  function addTag(value) {
    const tagDiv = document.createElement("div");
    tagDiv.classList.add("coma");
    tagDiv.dataset.value = value;

    const tagText = document.createElement("p");
    tagText.textContent = value;

    const removeBtn = document.createElement("button");
    removeBtn.classList.add("remove-btn");
    removeBtn.textContent = "×";
    removeBtn.onclick = function () {
      tagDiv.remove();
    };

    tagDiv.appendChild(tagText);
    tagDiv.appendChild(removeBtn);
    tagsContainer.appendChild(tagDiv);
  }

  const deleteButton = document.querySelector(".delete a");
  if (deleteButton) {
    deleteButton.addEventListener("click", function (event) {
      event.preventDefault();
      const tags = tagsContainer.querySelectorAll(".coma");
      if (tags.length > 0) {
        const lastTag = tags[tags.length - 1];
        lastTag.remove();
      }
    });
  }

  // ---------- Handle Form Submission ----------
  document.querySelector('button').addEventListener('click', async (e) => {
    e.preventDefault();

    // Show loading indicator on the submit button.
    const submitButton = e.target;
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Submitting...';
    submitButton.disabled = true;

    try {
      // Validate required fields.
      const requiredFields = [
        document.querySelector('.foodinfo .details:first-child input'), // Food name
        document.querySelector('.foodinfo #name input'), // Description
        document.querySelector('#details .details:nth-child(1) input'), // Cooking time
        document.querySelector('#details .details:nth-child(2) input')  // Preparation time
      ];

      // Check if images are uploaded.
      const foodImageDataUrl = localStorage.getItem('foodImage');
      const adImageDataUrl = localStorage.getItem('adImage');
      if (!foodImageDataUrl || !adImageDataUrl) {
        showAlert('Please upload both food and ad images', 'error');
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
        return;
      }

      // Check that required fields are filled.
      for (const field of requiredFields) {
        if (!field.value.trim()) {
          showAlert('Please fill all required fields', 'error');
          submitButton.textContent = originalButtonText;
          submitButton.disabled = false;
          return;
        }
      }

      // Retrieve the selected category (its value corresponds to the table name).
      const categorySelect = document.querySelector('#categories select');
      if (!categorySelect || !categorySelect.value) {
        showAlert('Please choose a category', 'error');
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
        return;
      }
      const category = categorySelect.value;

      // Prepare the form data from your inputs.
      const formData = {
        food_name: document.querySelector('.foodinfo .details:first-child input').value.trim(),
        food_description: document.querySelector('.foodinfo #name input').value.trim(),
        cooking_time: parseInt(document.querySelector('#details .details:nth-child(1) input').value) || 0,
        preparation_time: parseInt(document.querySelector('#details .details:nth-child(2) input').value) || 0,
        // Retrieve the selected difficulty from the select element.
        difficulties: document.querySelector('#details .details:nth-child(3) select').value,
        protein: parseInt(document.querySelector('.nutritions .nutri:nth-child(1) input').value) || 0,
        vitamin: parseInt(document.querySelector('.nutritions .nutri:nth-child(2) input').value) || 0,
        calories: parseInt(document.querySelector('.nutritions .nutri:nth-child(3) input').value) || 0,
        carbohydrates: parseInt(document.querySelector('.nutritions .nutri:nth-child(4) input').value) || 0
      };

      // Extract ingredients from the tags container as an array.
      const ingredients = Array.from(tagsContainer.querySelectorAll('.coma'))
        .map(tag => tag.dataset.value);
      formData.ingredients = ingredients;

      // Function to convert a data URL to a Blob.
      function dataURLtoBlob(dataUrl) {
        try {
          const arr = dataUrl.split(',');
          const mime = arr[0].match(/:(.*?);/)[1];
          const bstr = atob(arr[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          return new Blob([u8arr], { type: mime });
        } catch (error) {
          console.error('Error converting data URL to blob:', error);
          throw new Error('Failed to process image. Please try a different image format.');
        }
      }

      // Generate unique filenames for images.
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 10);
      const foodFilePath = `food/food_${timestamp}_${randomString}.png`;
      const adFilePath = `ads/ad_${timestamp}_${randomString}.png`;

      // Convert images to blobs.
      const foodBlob = dataURLtoBlob(foodImageDataUrl);
      const adBlob = dataURLtoBlob(adImageDataUrl);

      // Upload food image to Supabase storage.
      console.log('Uploading food image...');
      const { data: foodData, error: foodUploadError } = await supabase.storage
        .from('images')
        .upload(foodFilePath, foodBlob, {
          cacheControl: '3600',
          upsert: false
        });
      if (foodUploadError) {
        console.error('Food image upload error:', foodUploadError);
        throw new Error(`Food image upload failed: ${foodUploadError.message}`);
      }

      // Upload ad image to Supabase storage.
      console.log('Uploading ad image...');
      const { data: adData, error: adUploadError } = await supabase.storage
        .from('images')
        .upload(adFilePath, adBlob, {
          cacheControl: '3600',
          upsert: false
        });
      if (adUploadError) {
        // Remove the food image if the ad image upload fails.
        await supabase.storage.from('images').remove([foodFilePath]);
        console.error('Ad image upload error:', adUploadError);
        throw new Error(`Ad image upload failed: ${adUploadError.message}`);
      }

      // Get public URLs for the uploaded images.
      const foodImageUrl = supabase.storage
        .from('images')
        .getPublicUrl(foodFilePath).data.publicUrl;
      const adImageUrl = supabase.storage
        .from('images')
        .getPublicUrl(adFilePath).data.publicUrl;

      console.log('Images uploaded successfully');
      console.log('Food image URL:', foodImageUrl);
      console.log('Ad image URL:', adImageUrl);

      // Insert data (including the ingredients array) into the table corresponding to the selected category.
      console.log(`Inserting data into ${category} table...`);
      const { data: insertData, error: insertError } = await supabase
        .from(category)
        .insert([{
          ...formData,
          food_image_url: foodImageUrl,
          ad_image_url: adImageUrl,
          created_at: new Date().toISOString()
        }]);

      if (insertError) {
        // Remove uploaded images if database insertion fails.
        await supabase.storage.from('images').remove([foodFilePath, adFilePath]);
        console.error('Database insertion error:', insertError);
        throw new Error(`Failed to save recipe: ${insertError.message}`);
      }

      console.log('Data inserted successfully:', insertData);

      // Reset the form, clear localStorage and the tags container.
      document.querySelectorAll('input').forEach(input => input.value = '');
      imageContainers.forEach(container => {
        container.innerHTML = '<i class="bx bx-plus"></i>';
      });
      tagsContainer.innerHTML = '';
      localStorage.removeItem('foodImage');
      localStorage.removeItem('adImage');

      showAlert('Recipe submitted successfully!', 'success');
    } catch (error) {
      console.error('Submission error:', error);
      showAlert(`Error submitting recipe: ${error.message}`, 'error');
    } finally {
      // Restore the submit button's original state.
      submitButton.textContent = originalButtonText;
      submitButton.disabled = false;
    }
  });
});
