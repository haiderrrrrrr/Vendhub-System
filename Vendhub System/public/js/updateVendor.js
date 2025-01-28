// Fetch vendors when the page loads
window.onload = function () {
  fetchVendors();
};

// Fetch vendors for the vendor dropdown
function fetchVendors() {
  fetch("/api/vendors") // API to fetch vendors
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        const vendorSelect = document.getElementById("vendorDropdown");
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

// Fetch Vendor Details for the selected vendor
function fetchVendorDetails(vendorId) {
  fetch(`/api/vendor/${vendorId}`) // API to fetch vendor details
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        const vendorDetails = data.vendor;

        // Update the form with vendor details
        document.getElementById("company_name").value =
          vendorDetails.company_name;
        document.getElementById("service_category").value =
          vendorDetails.service_category;
        document.getElementById("contact_name").value =
          vendorDetails.contact_name;
        document.getElementById("contact_type").value =
          vendorDetails.contact_type;
        document.getElementById("phone_number").value =
          vendorDetails.phone_number;
        document.getElementById("contact_email").value =
          vendorDetails.contact_email;
        document.getElementById("address").value = vendorDetails.address;

        // Handle certifications if they exist
        const certifications = vendorDetails.certifications || [];
        const certificationsContainer =
          document.getElementById("certifications");
        certificationsContainer.innerHTML = ""; // Clear existing entries

        certifications.forEach((cert, index) => {
          const certEntry = document.createElement("div");
          certEntry.classList.add("certification-entry");
          certEntry.innerHTML = `
            <input type="text" class="form-input certification_name" value="${cert.certification_name}" placeholder="Certification Name" />
            <input type="text" class="form-input issued_by" value="${cert.issued_by}" placeholder="Issued By" />
            <input type="date" class="form-input issue_date" value="${cert.issue_date}" placeholder="Issue Date" />
            <button type="button" class="remove-cert" onclick="removeCertification(${index})">Remove</button>
          `;
          certificationsContainer.appendChild(certEntry);
        });
      } else {
        showError("Failed to fetch vendor details.");
      }
    })
    .catch((err) => showError("Error fetching vendor details."));
}

// Remove a certification entry
function removeCertification(index) {
  const certificationsContainer = document.getElementById("certifications");
  certificationsContainer.removeChild(certificationsContainer.children[index]);
}

// Show error message
function showError(message) {
  alert(message);
}

// Submit the form to update vendor details
document
  .getElementById("vendor-update-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const formData = new FormData(this);
    const certifications = [];

    // Collect certifications from the form
    document.querySelectorAll(".certification-entry").forEach((entry) => {
      const certName = entry.querySelector(".certification_name").value;
      const issuedBy = entry.querySelector(".issued_by").value;
      const issueDate = entry.querySelector(".issue_date").value;
      certifications.push({ certName, issuedBy, issueDate });
    });

    const data = {
      vendorId: formData.get("vendorId"),
      companyName: formData.get("company_name"),
      serviceCategory: formData.get("service_category"),
      contactName: formData.get("contact_name"),
      phoneNumber: formData.get("phone_number"),
      contactEmail: formData.get("contact_email"),
      address: formData.get("address"),
      certifications: certifications,
    };

    fetch("/api/update-vendor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Vendor updated successfully!");
        } else {
          showError("Failed to update vendor.");
        }
      })
      .catch((err) => showError("Error updating vendor."));
  });
