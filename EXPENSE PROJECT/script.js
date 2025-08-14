const balance = document.getElementById("balance");
const money_plus = document.getElementById("money-plus");
const money_minus = document.getElementById("money-minus");
const list = document.getElementById("list");
const form = document.getElementById("form");
const text = document.getElementById("text");
const amount = document.getElementById("amount");
const category = document.getElementById("category");
const goalInput = document.getElementById("goal");
const monthSelect = document.getElementById("month-select");
const yearSelect = document.getElementById("year-select");
const exportPDFBtn = document.getElementById("exportPDF");

const loginForm = document.getElementById("login-form");
const app = document.getElementById("app");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("login-btn");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let chartInstance = null;
let barChartInstance = null;
let spendingGoal = localStorage.getItem("goal") || 0;

goalInput.value = spendingGoal;

// Generate unique ID for transactions
function generateID() {
  return Math.floor(Math.random() * 1000000000);
}

// Add new transaction
function addTransaction(e) {
  e.preventDefault();
  if (text.value.trim() === "" || amount.value.trim() === "") {
    alert("Please add a description and amount");
    return;
  }

  const transaction = {
    id: generateID(),
    text: text.value,
    amount: +amount.value,
    category: category.value,
    date: new Date().toISOString()
  };

  transactions.push(transaction);
  updateLocalStorage();
  form.reset();
  init();
}

// Add to DOM
function addTransactionDOM(transaction) {
  const sign = transaction.amount < 0 ? "-" : "+";
  const item = document.createElement("li");
  item.classList.add(transaction.amount < 0 ? "minus" : "plus");

  item.innerHTML = `
    ${transaction.text} (${transaction.category})
    <span>${sign}₹${Math.abs(transaction.amount)}</span>
    <button class="delete-btn" onclick="removeTransaction(${transaction.id})">x</button>
  `;
  list.appendChild(item);
}

// Remove transaction by id
function removeTransaction(id) {
  transactions = transactions.filter(transaction => transaction.id !== id);
  updateLocalStorage();
  init();
}

// Update localStorage
function updateLocalStorage() {
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

// Render Pie Chart
function renderChart(income, expense) {
  const ctx = document.getElementById("expenseChart").getContext("2d");
  if (chartInstance) chartInstance.destroy();
  chartInstance = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Income", "Expense"],
      datasets: [{
        data: [income, expense],
        backgroundColor: ["#28a745", "#dc3545"]
      }]
    },
    options: {
      plugins: {
        legend: { position: "bottom" },
        title: { display: true, text: "Income vs Expense" }
      }
    }
  });
}

// Render Bar Chart
function renderBarChart(filteredTransactions) {
  const ctx = document.getElementById("barChart").getContext("2d");
  const categorySums = {};

  filteredTransactions.forEach(t => {
    if (t.amount < 0) {
      categorySums[t.category] = (categorySums[t.category] || 0) + Math.abs(t.amount);
    }
  });

  const labels = Object.keys(categorySums);
  const data = Object.values(categorySums);

  if (barChartInstance) barChartInstance.destroy();

  barChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Expenses by Category",
        data: data,
        backgroundColor: "#dc3545"
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

// Update total, income, expense
function updateValues(filtered) {
  const amounts = filtered.map(t => t.amount);
  const total = amounts.reduce((acc, val) => acc + val, 0).toFixed(2);
  const income = amounts.filter(a => a > 0).reduce((acc, a) => acc + a, 0).toFixed(2);
  const expense = (
    amounts.filter(a => a < 0).reduce((acc, a) => acc + a, 0) * -1
  ).toFixed(2);

  balance.innerText = `₹${total}`;
  money_plus.innerText = `₹${income}`;
  money_minus.innerText = `₹${expense}`;

  renderChart(income, expense);
  renderBarChart(filtered);
}

// Filter transactions by month/year
function filterTransactions() {
  const selectedMonth = monthSelect.value;
  const selectedYear = yearSelect.value;

  return transactions.filter(t => {
    const date = new Date(t.date);
    const month = date.getMonth();
    const year = date.getFullYear();

    return (selectedMonth === "all" || +selectedMonth === month) &&
           (selectedYear === "all" || +selectedYear === year);
  });
}

// Populate month/year filter options
function populateFilterOptions() {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  if (monthSelect.options.length <= 1) {
    months.forEach((month, index) => {
      const option = document.createElement("option");
      option.value = index;
      option.textContent = month;
      monthSelect.appendChild(option);
    });
  }

  const years = [...new Set(transactions.map(t => new Date(t.date).getFullYear()))].sort();
  yearSelect.innerHTML = `<option value="all">All Years</option>`;
  years.forEach(year => {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    yearSelect.appendChild(option);
  });
}

// Initialize the app
function init() {
  list.innerHTML = "";
  populateFilterOptions();

  const filtered = filterTransactions();
  filtered.forEach(addTransactionDOM);
  updateValues(filtered);
}

// Export to PDF
exportPDFBtn.addEventListener("click", () => {
  const filtered = filterTransactions();
  exportToPDF(filtered);
});

async function exportToPDF(data) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const img = new Image();
  img.src = "logo.png";  // Ensure the logo is in the correct path

  img.onload = function () {
    doc.addImage(img, "PNG", 10, 10, 30, 30);
    doc.setFontSize(16);
    doc.text("Budget Summary Report", 50, 25);

    if (doc.autoTable) {
      doc.autoTable({
        head: [["Text", "Amount", "Category", "Date"]],
        body: data.map(t => [
          t.text,
          `₹${t.amount}`,
          t.category,
          new Date(t.date).toLocaleDateString()
        ]),
        startY: 50
      });
    }

    doc.save("budget_report.pdf");
  };

  img.onerror = function () {
    doc.setFontSize(16);
    doc.text("Budget Summary Report", 50, 25);

    if (doc.autoTable) {
      doc.autoTable({
        head: [["Text", "Amount", "Category", "Date"]],
        body: data.map(t => [
          t.text,
          `₹${t.amount}`,
          t.category,
          new Date(t.date).toLocaleDateString()
        ]),
        startY: 50
      });
    }

    doc.save("budget_report.pdf");
  };
}

// Save spending goal
goalInput.addEventListener("change", () => {
  spendingGoal = +goalInput.value;
  localStorage.setItem("goal", spendingGoal);
  updateValues(filterTransactions());
});

// LOGIN FORM LOGIC
loginBtn.addEventListener("click", (e) => {
    e.preventDefault(); // Prevent default form submission
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
  
    // Check if the username and password match
    if (username === "admin" && password === "1234") {
        console.log("Login successful!");
      // Hide login form and show app
      loginForm.style.display = "none";
      app.style.display = "block";
  
      // Initialize event listeners for transactions
      form.addEventListener("submit", addTransaction);
      monthSelect.addEventListener("change", init);
      yearSelect.addEventListener("change", init);
  
      // Load the app (render transactions, charts, etc.)
      init();
    } else {
      alert("Invalid login. Please try again.");
    }
  });
  
