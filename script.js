document.addEventListener("DOMContentLoaded", function () {
    const searchButton = document.getElementById("search-button");
    const searchInput = document.getElementById("search-input");
    const productList = document.getElementById("product-list");
    const cartButton = document.getElementById("cart-button");
    const cartModal = document.getElementById("cart-modal");
    const closeCartModal = document.getElementById("close-cart");
    const cartItems = document.getElementById("cart-items");
    const generateQRButton = document.getElementById("generate-qr");
    const printBillButton = document.getElementById("print-bill");
    const qrCodeContainer = document.getElementById("qr-code");

    const cart = new Map(); // Use a Map to store items and their quantities

    // Sample product data (10-20 medicines)
    const products = [
        { name: "Aspirin", price: 7.49 },
        { name: "Ibuprofen", price: 8.99 },
        { name: "Acetaminophen", price: 6.99 },
        { name: "Antacid", price: 4.49 },
        { name: "Cough Syrup", price: 9.99 },
        { name: "Antihistamine", price: 11.29 },
        { name: "Vitamin C", price: 6.49 },
        { name: "Bandages", price: 3.99 },
        { name: "Thermometer", price: 12.99 },
        { name: "Hand Sanitizer", price: 5.49 }
        // Add more medicines here
    ];

    // Event listeners
    searchButton.addEventListener("click", search);
    cartButton.addEventListener("click", openCart);
    closeCartModal.addEventListener("click", closeCartModalWindow);
    generateQRButton.addEventListener("click", generateQRCode);
    printBillButton.addEventListener("click", printBill);

    // Function to add click events to dynamically created increment and decrement buttons
    function addIncrementDecrementClickEvent() {
        const incrementButtons = document.querySelectorAll(".increment-item");
        const decrementButtons = document.querySelectorAll(".decrement-item");

        incrementButtons.forEach(button => {
            button.addEventListener("click", () => incrementCartItem(button.parentElement));
        });

        decrementButtons.forEach(button => {
            button.addEventListener("click", () => decrementCartItem(button.parentElement));
        });
    }

    function search() {
        const searchTerm = searchInput.value.toLowerCase();

        // Filter products based on search term
        const filteredProducts = products.filter(product =>
            product.name.toLowerCase().includes(searchTerm)
        );

        displayProducts(filteredProducts);
    }

    function displayProducts(products) {
        productList.innerHTML = "";

        products.forEach(product => {
            const productDiv = document.createElement("div");
            productDiv.classList.add("product");

            const productName = document.createElement("h2");
            productName.textContent = product.name;

            const addToCartButton = document.createElement("button");
            addToCartButton.classList.add("add-to-cart");
            addToCartButton.textContent = "Add to Cart";

            addToCartButton.addEventListener("click", () => addToCart(product.name));

            productDiv.appendChild(productName);
            productDiv.appendChild(addToCartButton);

            productList.appendChild(productDiv);
        });
    }

    function addToCart(productName) {
        if (cart.has(productName)) {
            cart.set(productName, cart.get(productName) + 1);
        } else {
            cart.set(productName, 1);
        }
        updateCart();
    }

    function updateCart() {
        const cartCount = document.getElementById("cart-count");
        cartCount.textContent = Array.from(cart.values()).reduce((total, quantity) => total + quantity, 0);

        cartItems.innerHTML = "";

        let totalPrice = 0;

        cart.forEach((quantity, itemName) => {
            const listItem = document.createElement("li");
            listItem.classList.add("cart-item");

            const itemNameSpan = document.createElement("span");
            itemNameSpan.textContent = itemName;

            const decrementButton = document.createElement("button");
            decrementButton.classList.add("decrement-item");
            decrementButton.textContent = "-";

            const itemQuantitySpan = document.createElement("span");
            itemQuantitySpan.classList.add("item-quantity");
            itemQuantitySpan.textContent = quantity;

            const incrementButton = document.createElement("button");
            incrementButton.classList.add("increment-item");
            incrementButton.textContent = "+";

            const itemPrice = products.find(product => product.name === itemName).price;
            totalPrice += itemPrice * quantity;

            decrementButton.addEventListener("click", () => decrementCartItem(itemName));
            incrementButton.addEventListener("click", () => incrementCartItem(itemName));

            listItem.appendChild(itemNameSpan);
            listItem.appendChild(decrementButton);
            listItem.appendChild(itemQuantitySpan);
            listItem.appendChild(incrementButton);
            cartItems.appendChild(listItem);
        });

        // Add click events to increment and decrement buttons after updating the cart
        addIncrementDecrementClickEvent();

        // Display total price
        const totalContainer = document.getElementById("total-price");
        totalContainer.textContent = `Total: $${totalPrice.toFixed(2)}`;
    }

    function decrementCartItem(itemName) {
        if (cart.has(itemName)) {
            if (cart.get(itemName) === 1) {
                cart.delete(itemName);
            } else {
                cart.set(itemName, cart.get(itemName) - 1);
            }
            updateCart();
        }
    }

    function incrementCartItem(itemName) {
        if (cart.has(itemName)) {
            cart.set(itemName, cart.get(itemName) + 1);
            updateCart();
        }
    }

    function openCart() {
        cartModal.style.display = "block";
    }

    function closeCartModalWindow() {
        cartModal.style.display = "none";
    }

    function generateQRCode() {
        const billContent = Array.from(cart.keys())
            .map(itemName => `${itemName} x${cart.get(itemName)}`)
            .join(", ");
        const qr = new QRCode(qrCodeContainer, {
            text: billContent,
            width: 200,
            height: 200,
        });
    }

    function printBill() {
        const billContent = Array.from(cart.keys())
            .map(itemName => `${itemName} x${cart.get(itemName)}`)
            .join(", ");
        const qrCodeValue = billContent;

        const printWindow = window.open('', '', 'width=600,height=600');
        printWindow.document.open();
        printWindow.document.write(`
            <html>
            <head>
                <title>Print Bill</title>
            </head>
            <body>
                <h2>Your Bill</h2>
                <p>${billContent}</p>
                <h2>QR Code</h2>
                <div id="print-qr-code"></div>
                <h2 id="total-price"></h2>
                <script src="https://cdn.rawgit.com/davidshimjs/qrcodejs/gh-pages/qrcode.min.js"></script>
                <script>
                    const qrCodeContainer = document.getElementById("print-qr-code");
                    const qr = new QRCode(qrCodeContainer, {
                        text: "${qrCodeValue}",
                        width: 200,
                        height: 200,
                    });
                </script>
            </body>
            </html>
        `);
        printWindow.document.close();

        setTimeout(function () {
            printWindow.print();
            printWindow.close();
        }, 1000);
    }

    // Initial product list display
    displayProducts(products);
});
