// stats.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize Supabase client
  const supabaseUrl = 'https://vyacbonatqmyfhixonej.supabase.co';
  const supabaseKey =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ5YWNib25hdHFteWZoaXhvbmVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA3MTY2NzIsImV4cCI6MjA1NjI5MjY3Mn0.zrG4WJLFXE0SzOezTXLNTjt-xwJNU9U4xawHrr9MgQw';
  const supabase = createClient(supabaseUrl, supabaseKey);

  /**
   * Helper function to get the exact count from a table.
   * Optionally accepts a filter object.
   *
   * @param {string} tableName - The name of the Supabase table.
   * @param {object} [filter={}] - A filter object (e.g. { category_id: 3 }).
   * @returns {number|null} - The count of rows or null if an error occurred.
   */
  async function getCount(tableName, filter = {}) {
    let query = supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    // Apply any filters
    Object.keys(filter).forEach((key) => {
      query = query.eq(key, filter[key]);
    });
    
    const { count, error } = await query;
    if (error) {
      console.error(
        `Error fetching count for ${tableName} with filter ${JSON.stringify(filter)}:`,
        error
      );
      return null;
    }
    console.log(`Count for ${tableName} with filter ${JSON.stringify(filter)}:`, count);
    return count;
  }

  // Fetch counts for users and user recipes.
  const usersCount = await getCount('users');
  const userRecipesCount = await getCount('user_recipes');

  // --- Calculate overall recipes count across multiple tables ---
  // These tables represent your "categories" of recipes.
  const recipeTables = ['dinner', 'sahur', 'breakfast', 'lunch'];
  let recipesCountSum = 0;
  const recipesPerTable = [];

  // For each recipe table, get its row count.
  for (const tableName of recipeTables) {
    const count = await getCount(tableName);
    recipesCountSum += count || 0;
    recipesPerTable.push({ categoryName: tableName, count: count || 0 });
  }

  // Use the number of recipe tables as the categories count.
  const categoriesCount = recipeTables.length;

  // --- Update the statistics in the DOM ---
  // Expected order: [Total Recipes, Users, Categories, User Recipes]
  const statisticElements = document.querySelectorAll('.statistics .count h2');
  if (statisticElements.length >= 4) {
    statisticElements[0].textContent = recipesCountSum !== null ? recipesCountSum : '--';
    statisticElements[1].textContent = usersCount !== null ? usersCount : '--';
    statisticElements[2].textContent = categoriesCount !== null ? categoriesCount : '--';
    statisticElements[3].textContent = userRecipesCount !== null ? userRecipesCount : '--';
  } else {
    console.warn('Not enough statistic elements found in the DOM.');
  }

  // --- Optionally, update a breakdown of recipes per table ---
  // For example, in an element with ID "category-stats".
  const categoryStatsContainer = document.getElementById('category-stats');
  if (categoryStatsContainer) {
    categoryStatsContainer.innerHTML = '';
    recipesPerTable.forEach((cat) => {
      const li = document.createElement('li');
      li.textContent = `${cat.categoryName}: ${cat.count} recipe${cat.count === 1 ? '' : 's'}`;
      categoryStatsContainer.appendChild(li);
    });
  }
});
