<?php

include_once './config/db.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:5174');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

session_start();

$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($action) {
    case 'login':
        login();
        break;
    case 'register':
        register();
        break;
    case 'logout':
        logout();
        break;
    case 'fetch_categories':
        fetchCategories();
        break;
    case 'fetch_products':
        fetchProducts();
        break;
    case 'fetch_product_details':
        fetchProductDetails();
        break;
    case 'add_to_cart':
        addToCart();
        break;
    case 'fetch_cart':
        fetchCart();
        break;
    case 'update_cart':
        updateCart();
        break;
    case 'remove_from_cart':
        removeFromCart();
        break;
    case 'checkout':
        checkout();
        break;
    case 'fetch_orders':
        fetchOrders();
        break;
    case 'fetch_order_details':
        fetchOrderDetails();
        break;
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action']);
        break;
}


function login() {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(['type' => 'error', 'message' => 'Invalid request method']);
        exit;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $username = trim($data['username'] ?? '');
    $password = $data['password'] ?? '';

    if (empty($username) || empty($password)) {
        echo json_encode(['type' => 'error', 'message' => 'Username and password required']);
        exit;
    }

    if (!filter_var($username, FILTER_VALIDATE_EMAIL) && !preg_match("/^[a-zA-Z0-9_]{5,20}$/", $username)) {
        echo json_encode(['type' => 'error', 'message' => 'Invalid username format']);
        exit;
    }

    global $con;
    $stmt = $con->prepare("SELECT user_id, username, email, role, password_hash FROM users WHERE username = :user OR email = :user LIMIT 1");
    $stmt->execute([":user" => $username]);

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password_hash'])) {
        $_SESSION['user_id'] = $user['user_id'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['username'] = $user['username'];

        echo json_encode(['type' => 'success', 'message' => 'Login successful', 'user' => ['id' => $user['user_id'], 'username' => $user['username'], 'role' => $user['role']]]);
    } else {
        echo json_encode(['type' => 'error', 'message' => 'Invalid credentials']);
    }
    exit;
}

function register() {
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $data = json_decode(file_get_contents('php://input'), true);
        $username = trim($data['username'] ?? '');
        $email = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';
    } elseif ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Temporary for testing via GET (not secure)
        $username = trim($_GET['username'] ?? '');
        $email = trim($_GET['email'] ?? '');
        $password = $_GET['password'] ?? '';
    } else {
        echo json_encode(['type' => 'error', 'message' => 'Invalid request method']);
        exit;
    }

    $role = 'buyer';

    if (empty($username) || empty($email) || empty($password)) {
        echo json_encode(['type' => 'error', 'message' => 'All fields required']);
        exit;
    }

    if (!preg_match("/^[a-zA-Z0-9_]{5,20}$/", $username)) {
        echo json_encode(['type' => 'error', 'message' => 'Username must be 5-20 characters, letters/numbers/underscore only.']);
        exit;
    }

    if (!preg_match("/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/", $email)) {
        echo json_encode(['type' => 'error', 'message' => 'Invalid email format.']);
        exit;
    }

    if (!preg_match("/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[\W_]).{8,}$/", $password)) {
        echo json_encode(['type' => 'error', 'message' => 'Password must be at least 8 chars with upper, lower, number, and special character.']);
        exit;
    }

    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    global $con;
    $check = $con->prepare("SELECT user_id FROM users WHERE username = ? OR email = ? LIMIT 1");
    $check->execute([$username, $email]);

    if ($check->rowCount() > 0) {
        echo json_encode(['type' => 'error', 'message' => 'Username or email already taken.']);
        exit;
    }

    $stmt = $con->prepare("INSERT INTO users (username, email, password_hash, role) VALUES (:username, :email, :password, :role)");
    $result = $stmt->execute([
        ":username" => $username,
        ":email" => $email,
        ":password" => $hashedPassword,
        ":role" => $role
    ]);

    if ($result) {
        echo json_encode(['type' => 'success', 'message' => 'Registration successful!']);
    } else {
        echo json_encode(['type' => 'error', 'message' => 'Registration failed.']);
    }
    exit;
}
function logout() {
    session_destroy();
    echo json_encode(['type' => 'success', 'message' => 'Logged out']);
    exit;
}

function fetchCategories() {
    global $con;
    $stmt = $con->prepare("SELECT id, name FROM categories ORDER BY name ASC");
    $stmt->execute();
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($categories);
    exit;
}

function fetchProducts() {
    global $con;
    $categoryId = isset($_GET['category']) ? (int)$_GET['category'] : 0;
    $search = isset($_GET['q']) ? trim($_GET['q']) : '';

    $query = "SELECT p.id, p.name, p.description, p.price, p.quantity, p.image_path, c.name AS category_name
              FROM products p
              LEFT JOIN categories c ON p.category_id = c.id
              WHERE p.is_active = 1";
    $params = [];

    if ($categoryId > 0) {
        $query .= " AND p.category_id = ?";
        $params[] = $categoryId;
    }

    if ($search !== '') {
        $query .= " AND (p.name LIKE ? OR p.description LIKE ?)";
        $params[] = "%$search%";
        $params[] = "%$search%";
    }

    $query .= " ORDER BY p.id DESC";

    $stmt = $con->prepare($query);
    $stmt->execute($params);
    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($products);
    exit;
}

function fetchProductDetails() {
    global $con;
    $productId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    if ($productId <= 0) {
        echo json_encode(['type' => 'error', 'message' => 'Invalid product ID']);
        exit;
    }

    $stmt = $con->prepare("SELECT p.id, p.name, p.description, p.price, p.quantity, p.image_path, c.name AS category_name
                                FROM products p LEFT JOIN categories c ON p.category_id = c.id
                                WHERE p.id = ? AND p.is_active = 1");
    $stmt->execute([$productId]);
    $product = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($product) {
        echo json_encode($product);
    } else {
        echo json_encode(['type' => 'error', 'message' => 'Product not found']);
    }
    exit;
}

function addToCart() {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['type' => 'error', 'message' => 'Not logged in']);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(['type' => 'error', 'message' => 'Invalid request method']);
        exit;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $productId = (int)($data['product_id'] ?? 0);
    $quantity = (int)($data['quantity'] ?? 1);

    if ($productId <= 0 || $quantity <= 0) {
        echo json_encode(['type' => 'error', 'message' => 'Invalid data']);
        exit;
    }

    global $con;
    $userId = (int)$_SESSION['user_id'];

    // Check stock
    $stmt = $con->prepare("SELECT quantity FROM products WHERE id = ? AND is_active = 1");
    $stmt->execute([$productId]);
    $stock = $stmt->fetchColumn() ?? 0;

    if ($quantity > $stock) {
        $quantity = $stock;
    }

    // Upsert cart
    $stmt = $con->prepare("INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)");
    if ($stmt->execute([$userId, $productId, $quantity])) {
        echo json_encode(['type' => 'success', 'message' => 'Added to cart']);
    } else {
        echo json_encode(['type' => 'error', 'message' => 'Failed to add to cart']);
    }
    exit;
}

function fetchCart() {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['type' => 'error', 'message' => 'Not logged in']);
        exit;
    }

    global $con;
    $userId = (int)$_SESSION['user_id'];

    $stmt = $con->prepare("SELECT c.product_id, c.quantity, p.name, p.price, p.quantity AS stock
                               FROM cart c JOIN products p ON c.product_id = p.id
                               WHERE c.user_id = ?");
    $stmt->execute([$userId]);
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $subtotal = 0.0;
    $count = 0;
    foreach ($items as $row) {
        $subtotal += (float)$row['price'] * (int)$row['quantity'];
        $count += (int)$row['quantity'];
    }
    echo json_encode(['items' => $items, 'subtotal' => $subtotal, 'count' => $count]);
    exit;
}

function updateCart() {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['type' => 'error', 'message' => 'Not logged in']);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(['type' => 'error', 'message' => 'Invalid request method']);
        exit;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $updates = $data['updates'] ?? [];

    global $con;
    $userId = (int)$_SESSION['user_id'];

    foreach ($updates as $update) {
        $productId = (int)$update['product_id'];
        $quantity = (int)$update['quantity'];

        if ($quantity <= 0) {
            $stmt = $con->prepare("DELETE FROM cart WHERE user_id = ? AND product_id = ?");
            $stmt->execute([$userId, $productId]);
        } else {
            $stmt = $con->prepare("UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?");
            $stmt->execute([$quantity, $userId, $productId]);
        }
    }
    echo json_encode(['type' => 'success', 'message' => 'Cart updated']);
    exit;
}

function removeFromCart() {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['type' => 'error', 'message' => 'Not logged in']);
        exit;
    }

    $productId = isset($_GET['product_id']) ? (int)$_GET['product_id'] : 0;
    if ($productId <= 0) {
        echo json_encode(['type' => 'error', 'message' => 'Invalid product ID']);
        exit;
    }

    global $con;
    $userId = (int)$_SESSION['user_id'];

    $stmt = $con->prepare("DELETE FROM cart WHERE user_id = ? AND product_id = ?");
    if ($stmt->execute([$userId, $productId])) {
        echo json_encode(['type' => 'success', 'message' => 'Removed from cart']);
    } else {
        echo json_encode(['type' => 'error', 'message' => 'Failed to remove']);
    }
    exit;
}

function checkout() {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['type' => 'error', 'message' => 'Not logged in']);
        exit;
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(['type' => 'error', 'message' => 'Invalid request method']);
        exit;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    $shippingAddress = trim($data['shipping_address'] ?? '');
    $paymentMethod = trim($data['payment_method'] ?? 'cod');

    if (empty($shippingAddress)) {
        echo json_encode(['type' => 'error', 'message' => 'Shipping address required']);
        exit;
    }

    global $con;
    $userId = (int)$_SESSION['user_id'];

    // Fetch cart
    $stmt = $con->prepare("SELECT c.product_id, c.quantity, p.price, p.quantity AS stock
                               FROM cart c JOIN products p ON c.product_id = p.id
                               WHERE c.user_id = ?");
    $stmt->execute([$userId]);
    $cart = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if (empty($cart)) {
        echo json_encode(['type' => 'error', 'message' => 'Cart is empty']);
        exit;
    }

    $total = 0.0;
    foreach ($cart as $row) {
        $qty = min((int)$row['quantity'], (int)$row['stock']);
        $total += (float)$row['price'] * $qty;
    }

    if ($total <= 0) {
        echo json_encode(['type' => 'error', 'message' => 'Invalid total']);
        exit;
    }

    // Create order
    $stmt = $con->prepare("INSERT INTO orders (buyer_id, total_amount, shipping_address, payment_method, order_status, payment_status)
                                VALUES (?, ?, ?, ?, 'pending', 'pending')");
    $stmt->execute([$userId, $total, $shippingAddress, $paymentMethod]);
    $orderId = $con->lastInsertId();

    // Insert order items and decrement stock
    $itemStmt = $con->prepare("INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
                                   VALUES (?, ?, ?, ?, ?)");
    $decStmt = $con->prepare("UPDATE products SET quantity = quantity - ? WHERE id = ?");

    foreach ($cart as $row) {
        $qty = min((int)$row['quantity'], (int)$row['stock']);
        $lineTotal = (float)$row['price'] * $qty;
        $itemStmt->execute([$orderId, $row['product_id'], $qty, $row['price'], $lineTotal]);
        $decStmt->execute([$qty, $row['product_id']]);
    }

    // Clear cart
    $stmt = $con->prepare("DELETE FROM cart WHERE user_id = ?");
    $stmt->execute([$userId]);

    echo json_encode(['type' => 'success', 'message' => 'Order placed', 'order_id' => $orderId]);
    exit;
}

function fetchOrders() {
    session_start();
    require './config/db.php';

    if (!isset($_SESSION['user_id'])) {
        header('Location: ./login.php');
        exit;
    }

    $userId = (int)$_SESSION['user_id'];

    // Fetch orders for this buyer. Schema uses buyer_id, order_status, total_amount
    $orders = [];
    try {
        $stmt = $con->prepare("SELECT id, total_amount, order_status, payment_status, created_at
                               FROM orders WHERE buyer_id = :uid ORDER BY id DESC");
        $stmt->execute([':uid' => $userId]);
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $e) {
        $orders = [];
    }
}

function fetchOrderDetails() {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['type' => 'error', 'message' => 'Not logged in']);
        exit;
    }

    $orderId = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    if ($orderId <= 0) {
        echo json_encode(['type' => 'error', 'message' => 'Invalid order ID']);
        exit;
    }

    global $con;
    $userId = (int)$_SESSION['user_id'];

    $stmt = $con->prepare("SELECT id, total_amount, order_status, payment_status, shipping_address, payment_method, created_at
                               FROM orders WHERE id = ? AND buyer_id = ?");
    $stmt->execute([$orderId, $userId]);
    $order = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$order) {
        echo json_encode(['type' => 'error', 'message' => 'Order not found']);
        exit;
    }

    $stmt = $con->prepare("SELECT oi.product_id, oi.quantity, oi.unit_price, oi.total_price, p.name
                             FROM order_items oi JOIN products p ON oi.product_id = p.id
                             WHERE oi.order_id = ?");
    $stmt->execute([$orderId]);
    $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(['order' => $order, 'items' => $items]);
    exit;
}

?>
