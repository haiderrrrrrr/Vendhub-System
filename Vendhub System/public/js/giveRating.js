// Fetch vendors when the page loads
window.onload = function () {
  fetchVendors();
};

// Fetch vendors for the vendor dropdown
function fetchVendors() {
  fetch("/api/vendors") // API to fetch vendors (make sure this endpoint is set up)
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

// Handle form submission
document
  .getElementById("performance-evaluation-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const vendor_id = document.getElementById("vendor").value;
    const rating = document.getElementById("rating").value;
    const feedback = document.getElementById("feedback").value;
    const improvement_notes =
      document.getElementById("improvement_notes").value;
    const evaluator_id = 1; // Assuming evaluator ID is 1 for now, modify based on actual session/user info

    // Validate input fields
    if (!vendor_id || !rating || !feedback || !improvement_notes) {
      showError("All fields are required.");
      return;
    }

    // Prepare the data
    const data = {
      vendor_id,
      evaluator_id,
      rating,
      feedback,
      improvement_notes,
    };

    // Send the POST request to the server
    fetch("/api/performance-evaluation/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          showSuccess("Performance evaluation submitted successfully.");
        } else {
          showError(data.message);
        }
      })
      .catch((err) => showError("Error submitting performance evaluation."));
  });

// Show error message
function showError(message) {
  alert("Error: " + message);
}

// Show success message
function showSuccess(message) {
  alert("Success: " + message);
}
