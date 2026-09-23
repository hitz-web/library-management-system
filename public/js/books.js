const body = document.getElementById("books-body");
const search = document.getElementById("search");
const count = document.getElementById("count");
const listAlert = document.getElementById("list-alert");
const dialog = document.getElementById("edit-dialog");
const editForm = document.getElementById("edit-form");
const editAlert = document.getElementById("edit-alert");

function money(value) {
  return `₹${Number(value).toFixed(2)}`;
}

function showListAlert(type, message) {
  listAlert.hidden = false;
  listAlert.className = `alert ${type}`;
  listAlert.textContent = message;
}

async function loadBooks(q = "") {
  const url = q ? `/api/books?q=${encodeURIComponent(q)}` : "/api/books";
  const response = await fetch(url);
  const result = await response.json();
  if (!result.ok) {
    body.innerHTML = `<tr><td colspan="8" class="empty">Could not load books.</td></tr>`;
    return;
  }

  count.textContent = `${result.books.length} record${result.books.length === 1 ? "" : "s"}`;
  if (!result.books.length) {
    body.innerHTML = `<tr><td colspan="8" class="empty">No books match this search. Add one from the Add Book page.</td></tr>`;
    return;
  }

  body.innerHTML = result.books
    .map(
      (book) => `
      <tr>
        <td><strong>${book.bookId}</strong></td>
        <td>${escapeHtml(book.title)}</td>
        <td>${escapeHtml(book.author)}</td>
        <td>${escapeHtml(book.category)}</td>
        <td>${book.quantity}</td>
        <td>${money(book.price)}</td>
        <td><span class="badge ${book.availability}">${book.availability}</span></td>
        <td>
          <div class="row-actions">
            <button class="btn ghost" data-edit="${book.bookId}">Edit</button>
            <button class="btn danger" data-delete="${book.bookId}">Delete</button>
          </div>
        </td>
      </tr>`
    )
    .join("");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

let searchTimer;
search.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => loadBooks(search.value.trim()), 250);
});

body.addEventListener("click", async (event) => {
  const deleteId = event.target.dataset.delete;
  const editId = event.target.dataset.edit;

  if (deleteId) {
    if (!confirm(`Delete book ${deleteId}? This cannot be undone.`)) return;
    const response = await fetch(`/api/books/${encodeURIComponent(deleteId)}`, { method: "DELETE" });
    const result = await response.json();
    if (!response.ok) {
      showListAlert("err", result.message);
      return;
    }
    showListAlert("ok", result.message);
    loadBooks(search.value.trim());
  }

  if (editId) {
    const response = await fetch(`/api/books/${encodeURIComponent(editId)}`);
    const result = await response.json();
    if (!result.ok) {
      showListAlert("err", result.message);
      return;
    }
    const book = result.book;
    document.getElementById("edit-bookId").value = book.bookId;
    document.getElementById("edit-title").value = book.title;
    document.getElementById("edit-author").value = book.author;
    document.getElementById("edit-category").value = book.category;
    document.getElementById("edit-quantity").value = book.quantity;
    document.getElementById("edit-price").value = book.price;
    document.getElementById("edit-availability").value = book.availability;
    editAlert.hidden = true;
    dialog.showModal();
  }
});

editForm.addEventListener("submit", async (event) => {
  if (event.submitter && event.submitter.value === "cancel") return;
  event.preventDefault();
  const bookId = document.getElementById("edit-bookId").value;
  const payload = {
    bookId,
    title: document.getElementById("edit-title").value.trim(),
    author: document.getElementById("edit-author").value.trim(),
    category: document.getElementById("edit-category").value,
    quantity: Number(document.getElementById("edit-quantity").value),
    price: Number(document.getElementById("edit-price").value),
    availability: document.getElementById("edit-availability").value
  };

  const response = await fetch(`/api/books/${encodeURIComponent(bookId)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const result = await response.json();
  if (!response.ok) {
    editAlert.hidden = false;
    editAlert.className = "alert err";
    editAlert.innerHTML = (result.errors || [result.message]).join("<br>");
    return;
  }
  dialog.close();
  showListAlert("ok", result.message);
  loadBooks(search.value.trim());
});

loadBooks();
