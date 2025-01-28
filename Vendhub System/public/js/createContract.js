// Function to show error messages
function showError(message) {
  alert(message); // Display error message
}

// Function to populate vendor dropdown list
function fetchVendors() {
  fetch("/api/vendors") // API to fetch vendors (you will need to set up this API route)
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        const vendorSelect = document.getElementById("vendor");
        data.vendors.forEach((vendor) => {
          const option = document.createElement("option");
          option.value = vendor.vendor_id;
          option.textContent = vendor.company_name;
          vendorSelect.appendChild(option);
        });
      } else {
        showError("Failed to fetch vendors.");
      }
    })
    .catch((err) => showError("Error fetching vendors."));
}

// Submit contract form
document
  .getElementById("contract-form")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent form submission

    // Get form data
    const formData = new FormData(this);
    const data = {
      vendor_id: formData.get("vendor_id"),
      contract_name: formData.get("contract_name"),
      contract_terms: formData.get("contract_terms"),
      start_date: formData.get("start_date"),
      end_date: formData.get("end_date"),
      contract_value: parseFloat(formData.get("contract_value")),
      payment_terms: formData.get("payment_terms"),
    };

    // Validate form data
    if (
      !data.vendor_id ||
      !data.contract_name ||
      !data.contract_terms ||
      !data.start_date ||
      !data.end_date ||
      !data.contract_value ||
      !data.payment_terms
    ) {
      showError("All fields are required.");
      return;
    }

    if (data.contract_value <= 0) {
      showError("Contract value must be greater than 0.");
      return;
    }

    // Send the data to the server
    fetch("/api/contracts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          alert("Contract created successfully.");
          // Reset form or redirect, if necessary
        } else {
          showError(result.message || "Failed to create contract.");
        }
      })
      .catch((err) => showError("Error creating contract: " + err.message));
  });

// Fetch vendors when the page loads
document.addEventListener("DOMContentLoaded", function () {
  fetchVendors();
});
