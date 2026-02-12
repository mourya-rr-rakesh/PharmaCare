// Fetch medicine names from database
window.medicineNames = [];

async function loadMedicineNamesFromDatabase() {
  try {
    console.log('[medicine-name.js] Fetching medicine names from database...');
    const response = await fetch('/medicines', {
      method: 'GET',
      credentials: 'include', // Include cookies for authentication
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.warn('[medicine-name.js] Failed to fetch medicines:', response.status, response.statusText);
      return false;
    }

    const data = await response.json();
    const medicines = data.medicines || [];
    
    // Extract unique medicine names from database
    const uniqueNames = [...new Set(medicines.map(m => m.name))];
    window.medicineNames = uniqueNames.sort();
    
    console.log('[medicine-name.js] Successfully loaded ' + window.medicineNames.length + ' unique medicine names from database');
    populateMedicineDatalist();
    return true;
  } catch (error) {
    console.error('[medicine-name.js] Error fetching from database:', error);
    return false;
  }
}

function populateMedicineDatalist() {
  const datalist = document.getElementById('medicineNames');
  if (!datalist) {
    console.warn('[medicine-name.js] Datalist element not found');
    return;
  }
  
  datalist.innerHTML = '';
  window.medicineNames.forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    datalist.appendChild(option);
  });
  
  console.log('[medicine-name.js] Datalist populated with ' + window.medicineNames.length + ' medicines');
}

// Load medicine names when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    loadMedicineNamesFromDatabase();
  });
} else {
  loadMedicineNamesFromDatabase();
}
