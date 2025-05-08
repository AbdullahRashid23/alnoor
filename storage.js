const STORAGE_KEYS = {
  CUSTOMERS: 'customers',
  PURCHASES: 'purchases',
  VERSION: '1.0.3'
};

function getCustomers() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    console.log('Fetching customers - Raw data from localStorage:', data);
    let customers = data ? JSON.parse(data) : [];
    if (!Array.isArray(customers)) {
      console.warn('Customer data is not an array, resetting to empty array.');
      customers = [];
      localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    }
    customers.forEach((customer, idx) => {
      if (!customer.services || !Array.isArray(customer.services)) {
        console.warn(`Customer at index ${idx} has no services array, initializing.`);
        customer.services = [];
      }
    });
    console.log('Processed customers:', JSON.stringify(customers, null, 2));
    return customers;
  } catch (error) {
    console.error('Error retrieving customers:', error);
    alert('Error loading customers. Resetting to empty list.');
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify([]));
    return [];
  }
}

function saveCustomers(customers) {
  try {
    if (!Array.isArray(customers)) throw new Error('Invalid customer data: Must be an array');
    console.log('Attempting to save customers:', JSON.stringify(customers, null, 2));
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
    console.log('Customers saved successfully. Verifying save...');
    const savedData = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
    console.log('Saved data in localStorage:', savedData);
  } catch (error) {
    console.error('Error saving customers:', error);
    alert('Failed to save customers. Data may be lost.');
  }
}

function getPurchases() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PURCHASES);
    console.log('Fetching purchases - Raw data from localStorage:', data);
    let purchases = data ? JSON.parse(data) : [];
    if (!Array.isArray(purchases)) {
      console.warn('Purchase data is not an array, resetting.');
      purchases = [];
      localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(purchases));
    }
    console.log('Processed purchases:', JSON.stringify(purchases, null, 2));
    return purchases;
  } catch (error) {
    console.error('Error retrieving purchases:', error);
    alert('Failed to load purchases. Resetting to empty list.');
    localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify([]));
    return [];
  }
}

function savePurchases(purchases) {
  try {
    if (!Array.isArray(purchases)) throw new Error('Invalid purchase data: Must be an array');
    console.log('Saving purchases:', JSON.stringify(purchases, null, 2));
    localStorage.setItem(STORAGE_KEYS.PURCHASES, JSON.stringify(purchases));
    console.log('Purchases saved successfully');
  } catch (error) {
    console.error('Error saving purchases:', error);
    alert('Failed to save purchases.');
  }
}

function addCustomerAndService(customer, purchase) {
  try {
    console.log('Adding customer and service:', { customer, purchase });
    if (!customer.name || !customer.phone) {
      throw new Error('Missing required customer fields: name or phone');
    }
    if (!customer.services || !Array.isArray(customer.services) || !customer.services[0]) {
      throw new Error('Missing or invalid services array');
    }
    const service = customer.services[0];
    if (!service.carNumber || !service.model || !service.oil || isNaN(service.totalBill)) {
      throw new Error('Invalid service details: ' + JSON.stringify(service));
    }
    if (!purchase.item || isNaN(purchase.cost)) {
      throw new Error('Invalid purchase details: ' + JSON.stringify(purchase));
    }

    let customers = getCustomers();
    const existingCustomer = customers.find(c => c.phone === customer.phone);

    if (existingCustomer) {
      if (!Array.isArray(existingCustomer.services)) {
        existingCustomer.services = [];
      }
      existingCustomer.services.push(service);
      console.log('Appended service to existing customer:', existingCustomer);
    } else {
      const newCustomer = { 
        name: customer.name, 
        phone: customer.phone, 
        services: [service] 
      };
      customers.push(newCustomer);
      console.log('Added new customer:', newCustomer);
    }
    saveCustomers(customers);

    let purchases = getPurchases();
    purchases.push(purchase);
    savePurchases(purchases);

    alert(`Customer ${customer.name} and service added successfully!`);
  } catch (error) {
    console.error('Error adding customer and service:', error.message);
    alert(`Failed to add customer and service: ${error.message}`);
    throw error;
  }
}

function addPurchase(item, cost) {
  try {
    if (!item || isNaN(cost) || cost < 0) throw new Error('Invalid purchase data');
    const purchases = getPurchases();
    purchases.push({
      item: item.trim(),
      cost: parseFloat(cost.toFixed(2)),
      date: new Date().toISOString()
    });
    savePurchases(purchases);
    alert(`Purchase added: ${item}`);
  } catch (error) {
    console.error('Error adding purchase:', error);
    alert('Failed to add purchase.');
  }
}

function updatePurchase(index, purchase) {
  try {
    if (!purchase.item || isNaN(purchase.cost)) throw new Error('Invalid purchase data');
    const purchases = getPurchases();
    if (index < 0 || index >= purchases.length) throw new Error('Invalid purchase index');
    purchases[index] = purchase;
    savePurchases(purchases);
    alert('Purchase updated.');
  } catch (error) {
    console.error('Error updating purchase:', error);
    alert('Failed to update purchase.');
  }
}

function deletePurchase(index) {
  try {
    if (!confirm('Delete this purchase?')) return;
    const purchases = getPurchases();
    if (index < 0 || index >= purchases.length) throw new Error('Invalid purchase index');
    purchases.splice(index, 1);
    savePurchases(purchases);
    alert('Purchase deleted.');
  } catch (error) {
    console.error('Error deleting purchase:', error);
    alert('Failed to delete purchase.');
  }
}

function updateCustomer(index, updates) {
  try {
    if (!updates.name || !updates.phone) throw new Error('Invalid customer data');
    const customers = getCustomers();
    if (index < 0 || index >= customers.length) throw new Error('Invalid customer index');
    customers[index].name = updates.name;
    customers[index].phone = updates.phone;
    saveCustomers(customers);
    alert('Customer updated.');
  } catch (error) {
    console.error('Error updating customer:', error);
    alert('Failed to update customer.');
  }
}

function deleteCustomer(index) {
  try {
    if (!confirm('Delete this customer and all their services?')) return;
    const customers = getCustomers();
    if (index < 0 || index >= customers.length) throw new Error('Invalid customer index');
    customers.splice(index, 1);
    saveCustomers(customers);
    alert('Customer deleted.');
  } catch (error) {
    console.error('Error deleting customer:', error);
    alert('Failed to delete customer.');
  }
}

function deleteService(customerIndex, serviceIndex) {
  try {
    if (!confirm('Delete this service?')) return;
    const customers = getCustomers();
    if (customerIndex < 0 || customerIndex >= customers.length) throw new Error('Invalid customer index');
    if (serviceIndex < 0 || serviceIndex >= customers[customerIndex].services.length) throw new Error('Invalid service index');
    customers[customerIndex].services.splice(serviceIndex, 1);
    saveCustomers(customers);
    alert('Service deleted.');
  } catch (error) {
    console.error('Error deleting service:', error);
    alert('Failed to delete service.');
  }
}

function exportData() {
  try {
    const data = {
      version: STORAGE_KEYS.VERSION,
      customers: getCustomers(),
      purchases: getPurchases(),
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `al_noor_data_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    alert('Data exported successfully.');
  } catch (error) {
    console.error('Error exporting data:', error);
    alert('Failed to export data.');
  }
}

function importData(event) {
  try {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const data = JSON.parse(e.target.result);
        if (data.version !== STORAGE_KEYS.VERSION) {
          alert('Warning: Data version mismatch.');
        }
        if (data.customers && Array.isArray(data.customers)) {
          data.customers.forEach(customer => {
            if (!Array.isArray(customer.services)) {
              customer.services = [];
            }
          });
          saveCustomers(data.customers);
        }
        if (data.purchases && Array.isArray(data.purchases)) {
          savePurchases(data.purchases);
        }
        alert('Data imported successfully. Reloading...');
        window.location.reload();
      } catch (err) {
        console.error('Error parsing imported data:', err);
        alert('Error importing data: Invalid file format.');
      }
    };
    reader.readAsText(file);
  } catch (error) {
    console.error('Error importing data:', error);
    alert('Failed to import data.');
  }
}