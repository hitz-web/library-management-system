const form = document.getElementById("add-book-form");
const alertBox = document.getElementById("form-alert");

function showAlert(type, messages) {
  alertBox.hidden = false;
  alertBox.className = `alert ${type}`;
  alertBox.innerHTML = Array.isArray(messages) ? messages.join("<br>") : messages;
}

function clientErrors(data) {
  const errors = [];
  if (!/^[A-Za-z0-9-]{2,20}$/.test(data.bookId)) {
    errors.push("Enter a Book ID of 2–20 letters, numbers, or hyphens.");
  }
  if (!data.title) errors.push("Title is required.");
  if (!data.author) errors.push("Author is required.");
  if (!data.category) errors.push("Category is required.");
  if (!Number.isInteger(data.quantity) || data.quantity < 0) {
    errors.push("Quantity must be a whole number of 0 or more.");
  }
  if (!Number.isFinite(data.price) || data.price < 0) {
    errors.push("Price must be 0 or more.");
  }
  if (!data.availability) errors.push("Availability status is required.");
  return errors;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const payload = {
    bookId: form.bookId.value.trim(),
    title: form.title.value.trim(),
    author: form.author.value.trim(),
    category: form.category.value,
    quantity: Number(form.quantity.value),
    price: Number(form.price.value),
    availability: form.availability.value
  };

  const errors = clientErrors(payload);
  if (errors.length) {
    showAlert("err", errors);
    return;
  }

  try {
    const response = await fetch("/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (!response.ok) {
      showAlert("err", result.errors || result.message || "Could not save the book.");
      return;
    }
    showAlert("ok", result.message);
    form.reset();
    form.quantity.value = "1";
    form.price.value = "0";
    form.availability.value = "Available";
  } catch {
    showAlert("err", "Could not reach the server. Is it running?");
  }
});

form.addEventListener("reset", () => {
  alertBox.hidden = true;
});
