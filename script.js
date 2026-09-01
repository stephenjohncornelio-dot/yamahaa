/****************************************************
 * YAMAHA STORE FRONTEND
 ****************************************************/

/*
 * IMPORTANT:
 * PASTE HERE YOUR GOOGLE APPS SCRIPT WEB APP URL
 *
 * Example:
 * https://script.google.com/macros/s/XXXXXXXXXXXX/exec
 */

const APP_URL =
    "https://script.google.com/macros/s/AKfycbyXfcd8vzahND-1JZ4rVz6trKG273s6r6iyHyayZAEwD3xZ5nPgJ52GH2cFKpiyOY8G/exec";


/****************************************************
 * GLOBAL VARIABLES
 ****************************************************/

let currentUser = null;
let currentRole = null;

let otpEmail = "";
let otpPurpose = "";

let products = [];
let customers = [];
let orders = [];

let pendingAction = null;
let editingProduct = null;


/****************************************************
 * API REQUEST
 ****************************************************/

async function api(action, data = {}) {

    try {

        const response = await fetch(APP_URL, {

            method: "POST",

            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },

            body: JSON.stringify({
                action: action,
                ...data
            })

        });

        const text = await response.text();

        return JSON.parse(text);

    } catch (error) {

        console.error(error);

        showToast(
            "Cannot connect to Google Apps Script."
        );

        return {
            success: false,
            message: "Server connection failed."
        };
    }
}


/****************************************************
 * PAGE START
 ****************************************************/

document.addEventListener(
    "DOMContentLoaded",
    function() {

        // Always show login first.
        document
            .getElementById("loginScreen")
            .classList.remove("hidden");

        document
            .getElementById("otpScreen")
            .classList.add("hidden");

        document
            .getElementById("systemScreen")
            .classList.add("hidden");

        showLogin("customer");
    }
);


/****************************************************
 * LOGIN TABS
 ****************************************************/

function showLogin(type) {

    document
        .getElementById("customerLogin")
        .classList.add("hidden");

    document
        .getElementById("adminLogin")
        .classList.add("hidden");

    document
        .getElementById("registerForm")
        .classList.add("hidden");

    document
        .getElementById("customerTab")
        .classList.remove("active");

    document
        .getElementById("adminTab")
        .classList.remove("active");


    if (type === "customer") {

        document
            .getElementById("customerLogin")
            .classList.remove("hidden");

        document
            .getElementById("customerTab")
            .classList.add("active");

    }

    if (type === "admin") {

        document
            .getElementById("adminLogin")
            .classList.remove("hidden");

        document
            .getElementById("adminTab")
            .classList.add("active");

    }
}


/****************************************************
 * CUSTOMER REGISTER SCREEN
 ****************************************************/

function showRegister() {

    document
        .getElementById("customerLogin")
        .classList.add("hidden");

    document
        .getElementById("adminLogin")
        .classList.add("hidden");

    document
        .getElementById("registerForm")
        .classList.remove("hidden");

    document
        .getElementById("customerTab")
        .classList.remove("active");

    document
        .getElementById("adminTab")
        .classList.remove("active");
}


/****************************************************
 * CUSTOMER REGISTER
 ****************************************************/

async function registerCustomer() {

    const name =
        document
            .getElementById("registerName")
            .value.trim();

    const email =
        document
            .getElementById("registerEmail")
            .value.trim();

    const password =
        document
            .getElementById("registerPassword")
            .value;

    const password2 =
        document
            .getElementById("registerPassword2")
            .value;


    if (!name || !email || !password) {

        showToast(
            "Please complete all fields."
        );

        return;
    }


    if (password !== password2) {

        showToast(
            "Passwords do not match."
        );

        return;
    }


    const result = await api(
        "customerRegister",
        {
            name: name,
            email: email,
            password: password
        }
    );


    if (!result.success) {

        showToast(result.message);

        return;
    }


    otpEmail = email;
    otpPurpose = "CUSTOMER_REGISTER";

    openOTP();

    showToast(
        "OTP sent to your Gmail."
    );
}


/****************************************************
 * CUSTOMER LOGIN
 ****************************************************/

async function customerLogin() {

    const email =
        document
            .getElementById("customerEmail")
            .value.trim();

    const password =
        document
            .getElementById("customerPassword")
            .value;


    if (!email || !password) {

        showToast(
            "Enter Gmail and password."
        );

        return;
    }


    const result = await api(
        "customerLogin",
        {
            email: email,
            password: password
        }
    );


    if (!result.success) {

        showToast(result.message);

        return;
    }


    otpEmail = email;
    otpPurpose = "CUSTOMER_LOGIN";

    openOTP();
}


/****************************************************
 * ADMIN LOGIN
 ****************************************************/

async function adminLogin() {

    const email =
        document
            .getElementById("adminEmail")
            .value.trim()
            .toLowerCase();

    const password =
        document
            .getElementById("adminPassword")
            .value;


    if (!email || !password) {

        showToast(
            "Enter admin Gmail and password."
        );

        return;
    }


    const result = await api(
        "adminLogin",
        {
            email: email,
            password: password
        }
    );


    if (!result.success) {

        showToast(result.message);

        return;
    }


    otpEmail = email;
    otpPurpose = "ADMIN_LOGIN";

    openOTP();
}


/****************************************************
 * OPEN OTP
 ****************************************************/

function openOTP() {

    document
        .getElementById("loginScreen")
        .classList.add("hidden");

    document
        .getElementById("otpScreen")
        .classList.remove("hidden");

    document
        .getElementById("otpInput")
        .value = "";

    document
        .getElementById("otpInput")
        .focus();
}


/****************************************************
 * VERIFY OTP
 ****************************************************/

async function verifyOTP() {

    const otp =
        document
            .getElementById("otpInput")
            .value.trim();


    if (otp.length !== 6) {

        showToast(
            "Enter the 6-digit OTP."
        );

        return;
    }


    const result = await api(
        "verifyOTP",
        {
            email: otpEmail,
            otp: otp,
            purpose: otpPurpose
        }
    );


    if (!result.success) {

        showToast(result.message);

        return;
    }


    currentUser = otpEmail;
    currentRole = result.role;


    document
        .getElementById("otpScreen")
        .classList.add("hidden");

    document
        .getElementById("systemScreen")
        .classList.remove("hidden");


    setupUserInterface();

    showToast(
        "Login successful."
    );


    if (currentRole === "ADMIN") {

        openPage("dashboard");

    } else {

        openPage("customerProducts");
    }
}


/****************************************************
 * RESEND OTP
 ****************************************************/

async function resendOTP() {

    const result = await api(
        "sendOTP",
        {
            email: otpEmail,
            purpose: otpPurpose
        }
    );


    showToast(result.message);
}


/****************************************************
 * USER INTERFACE
 ****************************************************/

function setupUserInterface() {

    const adminNav =
        document.getElementById("adminNav");

    const customerNav =
        document.getElementById("customerNav");

    const userInfo =
        document.getElementById("userInfo");


    if (currentRole === "ADMIN") {

        adminNav.classList.remove("hidden");
        customerNav.classList.add("hidden");

        userInfo.innerHTML =
            "<b>ADMIN</b><br>" +
            currentUser;

    } else {

        adminNav.classList.add("hidden");
        customerNav.classList.remove("hidden");

        userInfo.innerHTML =
            "<b>CUSTOMER</b><br>" +
            currentUser;
    }
}


/****************************************************
 * OPEN PAGE
 ****************************************************/

function openPage(page) {

    if (currentRole !== "ADMIN" &&
        [
            "dashboard",
            "products",
            "inventory",
            "customers",
            "orders",
            "reports",
            "security"
        ].includes(page)) {

        showToast(
            "Customer cannot access admin features."
        );

        return;
    }


    const pages =
        document.querySelectorAll(".page");

    pages.forEach(function(p) {
        p.classList.add("hidden");
    });


    const pageElement =
        document.getElementById(
            page + "Page"
        );

    if (!pageElement) return;

    pageElement.classList.remove("hidden");


    const titles = {

        dashboard: "Dashboard",
        products: "Products",
        inventory: "Inventory",
        customers: "Customers",
        orders: "Orders / Sales",
        reports: "Reports",
        security: "Security / Settings",
        customerProducts: "Yamaha Products",
        customerOrders: "My Orders"
    };


    document
        .getElementById("pageTitle")
        .textContent =
        titles[page] || "Yamaha Store";


    if (page === "dashboard")
        loadDashboard();

    if (page === "products")
        loadProducts();

    if (page === "inventory")
        loadInventory();

    if (page === "customers")
        loadCustomers();

    if (page === "orders")
        loadOrders();

    if (page === "reports")
        loadReports();

    if (page === "customerProducts")
        loadCustomerProducts();

    if (page === "customerOrders")
        loadCustomerOrders();
}


/****************************************************
 * DASHBOARD
 ****************************************************/

async function loadDashboard() {

    const result =
        await api("getDashboard");


    if (!result.success) {

        showToast(result.message);

        return;
    }


    const d = result.dashboard;


    document.getElementById(
        "statProducts"
    ).textContent = d.products;


    document.getElementById(
        "statCustomers"
    ).textContent = d.customers;


    document.getElementById(
        "statOrders"
    ).textContent = d.orders;


    document.getElementById(
        "statStock"
    ).textContent = d.stock;


    document.getElementById(
        "statSales"
    ).textContent =
        "₱" +
        Number(d.sales).toLocaleString();
}


/****************************************************
 * PRODUCTS
 ****************************************************/

async function loadProducts() {

    const result =
        await api("getProducts");


    if (!result.success) return;


    products = result.products;


    let html = `
        <div class="table-wrapper">

        <table>

        <tr>
            <th>Product</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Action</th>
        </tr>
    `;


    products.forEach(function(product) {

        html += `

        <tr>

            <td>
                ${escapeHTML(product.ProductName)}
            </td>

            <td>
                ${escapeHTML(product.Category)}
            </td>

            <td>
                ₱${Number(product.Price).toLocaleString()}
            </td>

            <td>
                ${product.Stock}
            </td>

            <td>
                ${product.Status}
            </td>

            <td>

                <button
                    class="action-btn edit-btn"
                    onclick="editProduct('${product.ID}')">

                    Update

                </button>

                <button
                    class="action-btn delete-btn"
                    onclick="deleteProduct('${product.ID}')">

                    Delete

                </button>

            </td>

        </tr>
        `;
    });


    html += `
        </table>
        </div>
    `;


    document.getElementById(
        "productTable"
    ).innerHTML = html;
}


/****************************************************
 * PRODUCT MODAL
 ****************************************************/

function openProductModal(product = null) {

    editingProduct = product;


    document
        .getElementById("productModal")
        .classList.remove("hidden");


    if (product) {

        document.getElementById(
            "modalTitle"
        ).textContent =
            "Update Product";


        document.getElementById(
            "productId"
        ).value =
            product.ID;


        document.getElementById(
            "productName"
        ).value =
            product.ProductName;


        document.getElementById(
            "productCategory"
        ).value =
            product.Category;


        document.getElementById(
            "productDescription"
        ).value =
            product.Description;


        document.getElementById(
            "productPrice"
        ).value =
            product.Price;


        document.getElementById(
            "productStock"
        ).value =
            product.Stock;


        document.getElementById(
            "productImage"
        ).value =
            product.Image;

    } else {

        document.getElementById(
            "modalTitle"
        ).textContent =
            "Add Product";


        clearProductForm();
    }
}


function closeProductModal() {

    document
        .getElementById("productModal")
        .classList.add("hidden");

    editingProduct = null;
}


function clearProductForm() {

    [
        "productId",
        "productName",
        "productCategory",
        "productDescription",
        "productPrice",
        "productStock",
        "productImage"
    ].forEach(function(id) {

        document.getElementById(id).value = "";
    });
}


/****************************************************
 * SAVE PRODUCT
 ****************************************************/

function saveProduct() {

    const product = {

        id:
            document.getElementById(
                "productId"
            ).value,

        productName:
            document.getElementById(
                "productName"
            ).value,

        category:
            document.getElementById(
                "productCategory"
            ).value,

        description:
            document.getElementById(
                "productDescription"
            ).value,

        price:
            document.getElementById(
                "productPrice"
            ).value,

        stock:
            document.getElementById(
                "productStock"
            ).value,

        image:
            document.getElementById(
                "productImage"
            ).value
    };


    pendingAction = {

        type: product.id
            ? "updateProduct"
            : "addProduct",

        data: product

    };


    closeProductModal();

    openPasscodeModal();
}


/****************************************************
 * EDIT PRODUCT
 ****************************************************/

function editProduct(id) {

    const product =
        products.find(function(p) {

            return String(p.ID) === String(id);

        });


    if (!product) return;


    openProductModal(product);
}


/****************************************************
 * DELETE PRODUCT
 ****************************************************/

function deleteProduct(id) {

    if (!confirm(
        "Are you sure you want to delete this product?"
    )) {

        return;
    }


    pendingAction = {

        type: "deleteProduct",

        data: {
            id: id
        }

    };


    openPasscodeModal();
}


/****************************************************
 * PASSCODE MODAL
 ****************************************************/

function openPasscodeModal() {

    document
        .getElementById("passcodeModal")
        .classList.remove("hidden");

    document
        .getElementById("adminPasscode")
        .value = "";

    document
        .getElementById("adminPasscode")
        .focus();
}


function closePasscodeModal() {

    document
        .getElementById("passcodeModal")
        .classList.add("hidden");

    pendingAction = null;
}


/****************************************************
 * CONFIRM ADMIN PASSCODE
 ****************************************************/

async function confirmPasscode() {

    const passcode =
        document
            .getElementById("adminPasscode")
            .value;


    if (!passcode) {

        showToast(
            "Enter admin passcode."
        );

        return;
    }


    const security =
        await api(
            "verifyAdminPasscode",
            {
                email: currentUser,
                passcode: passcode
            }
        );


    if (!security.success) {

        showToast(
            security.message
        );

        return;
    }


    if (!pendingAction) {

        closePasscodeModal();

        return;
    }


    const result =
        await api(
            pendingAction.type,
            {
                ...pendingAction.data,

                email: currentUser,

                passcode: passcode
            }
        );


    if (!result.success) {

        showToast(result.message);

        return;
    }


    closePasscodeModal();

    showToast(result.message);

    loadProducts();
}


/****************************************************
 * INVENTORY
 ****************************************************/

async function loadInventory() {

    const result =
        await api("getProducts");


    if (!result.success) return;


    products = result.products;


    let html = `
        <div class="table-wrapper">

        <table>

        <tr>
            <th>Product</th>
            <th>Stock</th>
            <th>Status</th>
        </tr>
    `;


    products.forEach(function(product) {

        html += `

        <tr>

            <td>
                ${escapeHTML(product.ProductName)}
            </td>

            <td>
                ${product.Stock}
            </td>

            <td>
                ${product.Stock <= 5
                    ? "LOW STOCK"
                    : "AVAILABLE"}
            </td>

        </tr>
        `;
    });


    html += `
        </table>
        </div>
    `;


    document.getElementById(
        "inventoryTable"
    ).innerHTML = html;
}


/****************************************************
 * CUSTOMERS
 ****************************************************/

async function loadCustomers() {

    const result =
        await api("getCustomers");


    if (!result.success) return;


    customers = result.customers;


    let html = `
        <div class="table-wrapper">

        <table>

        <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Created</th>
        </tr>
    `;


    customers.forEach(function(customer) {

        html += `

        <tr>

            <td>
                ${escapeHTML(customer.Name)}
            </td>

            <td>
                ${escapeHTML(customer.Email)}
            </td>

            <td>
                ${customer.Verified}
            </td>

            <td>
                ${customer.CreatedAt}
            </td>

        </tr>
        `;
    });


    html += `
        </table>
        </div>
    `;


    document.getElementById(
        "customerTable"
    ).innerHTML = html;
}


/****************************************************
 * ORDERS
 ****************************************************/

async function loadOrders() {

    const result =
        await api("getOrders");


    if (!result.success) return;


    orders = result.orders;


    let html = `
        <div class="table-wrapper">

        <table>

        <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Product</th>
            <th>Quantity</th>
            <th>Total</th>
            <th>Status</th>
        </tr>
    `;


    orders.forEach(function(order) {

        html += `

        <tr>

            <td>
                ${order.ID}
            </td>

            <td>
                ${escapeHTML(order.CustomerName)}
            </td>

            <td>
                ${escapeHTML(order.ProductName)}
            </td>

            <td>
                ${order.Quantity}
            </td>

            <td>
                ₱${Number(order.Total).toLocaleString()}
            </td>

            <td>
                ${order.Status}
            </td>

        </tr>
        `;
    });


    html += `
        </table>
        </div>
    `;


    document.getElementById(
        "ordersTable"
    ).innerHTML = html;
}


/****************************************************
 * REPORTS
 ****************************************************/

async function loadReports() {

    const result =
        await api("getReports");


    if (!result.success) return;


    const r = result.reports;


    let html = `

        <div class="cards">

            <div class="stat-card">
                <h3>Total Products</h3>
                <strong>
                    ${r.totalProducts}
                </strong>
            </div>

            <div class="stat-card">
                <h3>Total Orders</h3>
                <strong>
                    ${r.totalOrders}
                </strong>
            </div>

            <div class="stat-card">
                <h3>Total Sales</h3>
                <strong>
                    ₱${Number(r.totalSales)
                        .toLocaleString()}
                </strong>
            </div>

            <div class="stat-card">
                <h3>Low Stock Items</h3>
                <strong>
                    ${r.lowStockProducts.length}
                </strong>
            </div>

        </div>

        <br>

        <h3>Low Stock Products</h3>
    `;


    r.lowStockProducts.forEach(
        function(product) {

            html += `
                <p>
                    ${escapeHTML(
                        product.ProductName
                    )}
                    -
                    Stock: ${product.Stock}
                </p>
            `;
        }
    );


    document.getElementById(
        "reportsContent"
    ).innerHTML = html;
}


/****************************************************
 * CUSTOMER PRODUCTS
 ****************************************************/

async function loadCustomerProducts() {

    const result =
        await api("getProducts");


    if (!result.success) return;


    products = result.products;


    let html = "";


    products.forEach(function(product) {

        const image =
            product.Image ||
            "https://via.placeholder.com/400x250?text=Yamaha";


        html += `

        <div class="product-card">

            <img
                src="${escapeAttribute(image)}"
                alt="Yamaha Product">

            <div class="product-card-body">

                <h3>
                    ${escapeHTML(
                        product.ProductName
                    )}
                </h3>

                <p>
                    ${escapeHTML(
                        product.Description
                    )}
                </p>

                <div class="price">
                    ₱${Number(product.Price)
                        .toLocaleString()}
                </div>

                <p>
                    Stock:
                    ${product.Stock}
                </p>

                ${
                    Number(product.Stock) > 0

                    ? `
                    <button
                        class="primary-btn"
                        onclick="buyProduct('${product.ID}')">

                        Buy

                    </button>
                    `

                    : `
                    <button
                        class="secondary-btn"
                        disabled>

                        Out of Stock

                    </button>
                    `
                }

            </div>

        </div>
        `;
    });


    document.getElementById(
        "customerProductGrid"
    ).innerHTML = html;
}


/****************************************************
 * CUSTOMER BUY
 ****************************************************/

async function buyProduct(id) {

    const product =
        products.find(function(p) {

            return String(p.ID) === String(id);

        });


    if (!product) return;


    const quantity =
        Number(
            prompt(
                "Enter quantity:",
                "1"
            )
        );


    if (!quantity ||
        quantity <= 0) {

        return;
    }


    if (quantity > Number(product.Stock)) {

        showToast(
            "Not enough stock."
        );

        return;
    }


    const customerName =
        currentUser;


    const result =
        await api(
            "createOrder",
            {

                email: currentUser,

                customerName:
                    customerName,

                productId:
                    product.ID,

                quantity:
                    quantity
            }
        );


    if (!result.success) {

        showToast(result.message);

        return;
    }


    showToast(
        "Order created successfully."
    );


    loadCustomerProducts();
}


/****************************************************
 * CUSTOMER ORDERS
 ****************************************************/

async function loadCustomerOrders() {

    const result =
        await api("getOrders");


    if (!result.success) return;


    const myOrders =
        result.orders.filter(
            function(order) {

                return String(
                    order.CustomerEmail
                ).toLowerCase()
                ===
                String(
                    currentUser
                ).toLowerCase();

            }
        );


    let html = `

        <div class="table-wrapper">

        <table>

        <tr>
            <th>Order ID</th>
            <th>Product</th>
            <th>Quantity</th>
            <th>Total</th>
            <th>Status</th>
        </tr>
    `;


    myOrders.forEach(function(order) {

        html += `

        <tr>

            <td>
                ${order.ID}
            </td>

            <td>
                ${escapeHTML(
                    order.ProductName
                )}
            </td>

            <td>
                ${order.Quantity}
            </td>

            <td>
                ₱${Number(
                    order.Total
                ).toLocaleString()}
            </td>

            <td>
                ${order.Status}
            </td>

        </tr>
        `;
    });


    html += `
        </table>
        </div>
    `;


    document.getElementById(
        "customerOrdersTable"
    ).innerHTML = html;
}


/****************************************************
 * LOGOUT
 ****************************************************/

function logout() {

    currentUser = null;
    currentRole = null;
    otpEmail = "";
    otpPurpose = "";

    document
        .getElementById("systemScreen")
        .classList.add("hidden");

    document
        .getElementById("otpScreen")
        .classList.add("hidden");

    document
        .getElementById("loginScreen")
        .classList.remove("hidden");

    showLogin("customer");

    showToast(
        "Logged out successfully."
    );
}


/****************************************************
 * TOAST
 ****************************************************/

function showToast(message) {

    const toast =
        document.getElementById("toast");

    toast.textContent = message;

    toast.classList.add("show");


    setTimeout(function() {

        toast.classList.remove("show");

    }, 3000);
}


/****************************************************
 * HTML SECURITY
 ****************************************************/

function escapeHTML(value) {

    if (value === null ||
        value === undefined) {

        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function escapeAttribute(value) {

    return escapeHTML(value);
}
