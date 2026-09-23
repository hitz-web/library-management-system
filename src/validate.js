const CATEGORIES = [
  "Fiction",
  "Non-Fiction",
  "Science",
  "Technology",
  "History",
  "Biography",
  "Children",
  "Reference",
  "Magazines",
  "Other"
];

const AVAILABILITY = ["Available", "Issued", "Unavailable"];

function trim(value) {
  return typeof value === "string" ? value.trim() : value;
}

function validateBook(body, { partial = false } = {}) {
  const errors = [];
  const data = {};

  const bookId = trim(body.bookId ?? body.book_id);
  const title = trim(body.title);
  const author = trim(body.author);
  const category = trim(body.category);
  const availability = trim(body.availability);
  const quantityRaw = body.quantity;
  const priceRaw = body.price;

  if (!partial || bookId !== undefined) {
    if (!bookId) {
      errors.push("Book ID is required.");
    } else if (!/^[A-Za-z0-9-]{2,20}$/.test(bookId)) {
      errors.push("Book ID must be 2–20 characters (letters, numbers, hyphens).");
    } else {
      data.book_id = bookId.toUpperCase();
    }
  }

  if (!partial || title !== undefined) {
    if (!title) {
      errors.push("Title is required.");
    } else if (title.length > 150) {
      errors.push("Title must be 150 characters or fewer.");
    } else {
      data.title = title;
    }
  }

  if (!partial || author !== undefined) {
    if (!author) {
      errors.push("Author is required.");
    } else if (author.length > 100) {
      errors.push("Author must be 100 characters or fewer.");
    } else {
      data.author = author;
    }
  }

  if (!partial || category !== undefined) {
    if (!category) {
      errors.push("Category is required.");
    } else if (!CATEGORIES.includes(category)) {
      errors.push("Select a valid category.");
    } else {
      data.category = category;
    }
  }

  if (!partial || quantityRaw !== undefined) {
    const quantity = Number(quantityRaw);
    if (!Number.isInteger(quantity) || quantity < 0) {
      errors.push("Quantity must be a whole number of 0 or more.");
    } else {
      data.quantity = quantity;
    }
  }

  if (!partial || priceRaw !== undefined) {
    const price = Number(priceRaw);
    if (!Number.isFinite(price) || price < 0) {
      errors.push("Price must be a number of 0 or more.");
    } else {
      data.price = Math.round(price * 100) / 100;
    }
  }

  if (!partial || availability !== undefined) {
    if (!availability) {
      errors.push("Availability status is required.");
    } else if (!AVAILABILITY.includes(availability)) {
      errors.push("Select a valid availability status.");
    } else {
      data.availability = availability;
    }
  }

  return { ok: errors.length === 0, errors, data };
}

module.exports = { CATEGORIES, AVAILABILITY, validateBook };
