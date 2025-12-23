<?php
session_start();
include_once './config/db.php';

$allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5174",
];

if (isset($_SERVER['HTTP_ORIGIN']) && in_array($_SERVER['HTTP_ORIGIN'], $allowedOrigins)) {
    header("Access-Control-Allow-Origin: " . $_SERVER['HTTP_ORIGIN']);
}

header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$JSON = json_decode(file_get_contents("php://input"), true);

$action = $_GET['action'] ?? '';


switch ($action) {
    case 'login':
        login($con);
        break;
    case 'register':
        registerUser();
        break;
    case 'logout':
        logoutUser();
        break;
    case 'fetch_products_by_category':
        fetchProductsByCategory();
        break;
    case 'fetch_categories':
        fetchCategories();
        break;
    case 'fetch_product':
        fetchProductById();
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
    case 'fetch_checkout':
        fetchCheckout();
        break;
    case 'fetch_orders':
        fetchOrders();
        break;
    case 'fetch_order_details':
        fetchOrderDetails();
        break;
    case 'test_db':
        testDbConnection();
        break;
    case 'place_order':
        placeOrder();
        break;
    case 'create_order':
        createOrder();
        break;
    case "fetch_users":
    fetchUsers($con);
    break;
    case "create_user":
    createUser($con);
    break;
    case "update_user":
    updateUser($con);
    break;


    ////////////////////////////AAAAAAAAAAAADDDDDDDDDDDDMIIIIIIIIIIIIINNNNNNNNNNN??????????????////////////////////////////    
case "admin_get_categories":
    adminGetCategories($con);
    break;
case "admin_create_category":
    adminCreateCategory($con);
    break;
case "admin_update_category":
    adminUpdateCategory($con);
    break;
case "admin_toggle_category":
    adminToggleCategory($con);
    break;
case "admin_delete_category":
    adminDeleteCategory($con);
    break;
case 'admin_dashboard':
    adminDashboard();
    break;
case 'admin_orders':
    adminOrders();
    break;
case 'admin_list_products':
    adminListProducts();
    break;
case 'admin_create_product':
    adminCreateProduct();
    break;
case 'admin_list_categories':
    adminListCategories();
    break;
case "admin_reports":
    adminReports($con);
    break;
case "fetch_admin_settings":
    fetchAdminSettings($con);
    break;
case "update_admin_settings":
    updateAdminSettings($con);
    break;
case "admin_change_password":
    adminChangePassword($con);
    break;
case 'admin_list_pending_products':
    adminListPendingProducts();
    break;
case 'admin_list_approved_products':
    adminListApprovedProducts();
    break;
case 'admin_list_rejected_products':
    adminListRejectedProducts();
    break;
case 'admin_approve_product':      // KEEP ONLY THIS ONE
    adminApproveProduct($JSON);
    break;
case 'admin_reject_product':       // KEEP ONLY THIS ONE
    adminRejectProduct($JSON);
    break;
case 'admin_get_product':
    adminGetProduct();
    break;
case 'admin_dashboard_stats':
    adminDashboardStats();
    break;
case 'admin_recent_products':
    adminDashboardRecentProducts();
    break;
case 'admin_city_performance':
    adminDashboardCityPerformance();
    break;
case 'admin_update_order_status':
    adminUpdateOrderStatus();
    break;
case 'admin_get_all_products':
    adminGetAllProducts();
    break;
case 'admin_get_pending_products':
    adminGetPendingProducts();
    break;
case 'admin_get_product_details':
    adminGetProductDetails();
    break;
case 'admin_list_users':
        adminListUsers();
        break;
case 'admin_create_user':
        adminCreateUser();
        break;
case 'admin_delete_user':
        adminDeleteUser();
        break;


    //////////////////////////////SELLLLLLLLLLLLERRRRRRR/////////////////////

    case 'insert_product':
        insertProduct();
        break;
    case 'update_product':
        updateProduct();
        break;
    case 'delete_product':
        deleteProduct();
        break;
    case 'get_seller_products':
    getSellerProducts();
    break;
    case 'get_seller_orders':
    getSellerOrders();
    break;
    case 'approve_order':
    approveOrder();
    break;
    case 'dispatch_order':
    updateOrderStatus('out_for_delivery');
    break;
    case 'complete_order':
    updateOrderStatus('delivered');
    break;
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action']);
        break;
}




function login($con) {

    
    $raw = file_get_contents("php://input");
    $data = json_decode($raw, true);

    if (!$data) {
        $data = $_POST; 
    }

    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(["error" => "POST request required"]);
        return;
    }

    if (!filter_var($username, FILTER_VALIDATE_EMAIL) &&
        !preg_match("/^[a-zA-Z0-9_]{5,20}$/", $username)) {

        echo json_encode(["error" => "Invalid username format"]);
        return;
    }

 
    $stmt = $con->prepare("SELECT * FROM users WHERE username = :user OR email = :user LIMIT 1");
    $stmt->execute([":user" => $username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode(["error" => "No user found"]);
        return;
    }

$hash = $user['password_hash'];

if (!password_verify($password, $hash)) {
    echo json_encode(["error" => "Invalid password"]);
    return;
}

    // Set session
    $_SESSION['user_id'] = $user['user_id'];
    $_SESSION['role'] = $user['role'];
    $_SESSION['username'] = $user['username'];

echo json_encode([
    "success" => true,
    "user" => [
        "id" => $user['user_id'],
        "username" => $user['username'],
        "role" => $user['role']
    ]
]);

}

function getRedirectForRole($role) {
    if ($role === 'admin') return './admin/dashboard.php';
    if ($role === 'seller') return './seller/dashboard.php';
    return './index.php'; // default buyer
}

function redirectUserByRole($role) {
    header("Location: " . getRedirectForRole($role));
    exit();
}


function testDbConnection() {
    global $con;
    try {
        $con->query('SELECT 1');
        echo json_encode(['success' => true, 'message' => 'Database connection is OK']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Database connection failed: ' . $e->getMessage()]);
    }
    exit;
}

function registerUser() {
    global $con;

    if ($_SERVER['REQUEST_METHOD'] !== "POST") {
        echo json_encode(["error" => "Invalid request method"]);
        return;
    }

    // Read JSON body
    $data = json_decode(file_get_contents("php://input"), true);

    $username = trim($data['username'] ?? '');
    $email = trim($data['email'] ?? '');
    $password = $data['password'] ?? '';
    $role = 'buyer';

    // Validate username
    if (!preg_match("/^[a-zA-Z0-9_]{5,20}$/", $username)) {
        echo json_encode(["error" => "Username must be 5-20 characters, letters/numbers/underscore only."]);
        return;
    }

    // Validate email
    if (!preg_match("/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/", $email)) {
        echo json_encode(["error" => "Invalid email format."]);
        return;
    }

    // Validate password
    if (!preg_match("/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[\W_]).{8,}$/", $password)) {
        echo json_encode(["error" => "Password must be at least 8 chars with upper, lower, number, and special character."]);
        return;
    }

    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    // Check duplicate username
    $check = $con->prepare("SELECT user_id FROM users WHERE username = ? LIMIT 1");
    $check->execute([$username]);

    if ($check->rowCount() > 0) {
        echo json_encode(["error" => "Username already taken"]);
        return;
    }

    // Insert user
    $stmt = $con->prepare("
        INSERT INTO users (username, email, password_hash, role)
        VALUES (:username, :email, :password, :role)
    ");

    $ok = $stmt->execute([
        ":username" => $username,
        ":email" => $email,
        ":password" => $hashedPassword,
        ":role" => $role
    ]);

    if ($ok) {
        echo json_encode(["type" => "success", "message" => "Registration successful"]);
    } else {
        echo json_encode(["error" => "Database error"]);
    }
}

function logoutUser() {
    $_SESSION = [];
    session_destroy();

    echo json_encode(["success" => true, "message" => "Logged out"]);
}
function fetchProductsByCategory() {
    global $con;

    if (!isset($_GET['category_id'])) {
        echo json_encode([
            "success" => false,
            "message" => "Missing category ID"
        ]);
        exit;
    }

    $categoryId = (int) $_GET['category_id'];

    $stmt = $con->prepare("
        SELECT id, name, price, description, image_path
        FROM products
        WHERE category_id = ?
          AND status = 'approved'
    ");
    $stmt->execute([$categoryId]);

    $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "products" => $products
    ]);
    exit;
}

function fetchCategories() {
    global $con;

    $stmt = $con->prepare("SELECT id, name FROM categories ORDER BY name ASC");
    $stmt->execute();
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "success" => true,
        "categories" => $categories
    ]);
    exit;
}

function fetchProductById() {
    global $con;

    header("Content-Type: application/json");

    $productId = isset($_GET['id']) ? (int)$_GET['id'] : 0;

    if ($productId <= 0) {
        echo json_encode([
            "success" => false,
            "message" => "Invalid product ID"
        ]);
        return;
    }

    try {
        $stmt = $con->prepare("
            SELECT 
                p.id, 
                p.name, 
                p.description, 
                p.price, 
                p.quantity, 
                p.image_path,
                c.name AS category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = :id AND p.is_active = 1
        ");

        $stmt->execute([':id' => $productId]);
        $product = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$product) {
            echo json_encode([
                "success" => false,
                "message" => "Product not found"
            ]);
            return;
        }

        echo json_encode([
            "success" => true,
            "product" => $product
        ]);
    }
    catch (Exception $e) {
        echo json_encode([
            "success" => false,
            "message" => "Error fetching product",
            "error" => $e->getMessage()
        ]);
    }
}
function fetchProducts() {
    global $con;

    header("Content-Type: application/json");

    $categoryId = isset($_GET['category']) ? (int)$_GET['category'] : 0;
    $search = isset($_GET['q']) ? trim($_GET['q']) : '';

    $query = "
        SELECT 
            p.id,
            p.seller_id,
            p.category_id,
            p.name,
            p.description,
            p.price,
            p.quantity,
            p.image_path,
            p.created_at,
            c.name AS category_name
        FROM products p
        LEFT JOIN categories c ON p.category_id = c.id
        WHERE p.is_active = 1
        AND p.status = 'approved'
    ";

    $params = [];

    if ($categoryId > 0) {
        $query .= " AND p.category_id = :categoryId";
        $params[':categoryId'] = $categoryId;
    }

    if ($search !== '') {
        $query .= " AND (p.name LIKE :search OR p.description LIKE :search)";
        $params[':search'] = "%$search%";
    }

    $query .= " ORDER BY p.id DESC";

    try {
        $stmt = $con->prepare($query);
        $stmt->execute($params);
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "products" => $products
        ]);
    } catch (Exception $e) {
        echo json_encode([
            "success" => false,
            "message" => "Error fetching products",
            "error" => $e->getMessage()
        ]);
    }
}


function addToCart() {

    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    global $con;

    header('Content-Type: application/json');

    // 1️⃣ LOGIN CHECK (must be first)
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(["success" => false, "message" => "Not logged in"]);
        exit;
    }

    // 2️⃣ READ & VALIDATE INPUT (PUT IT HERE)
    $productId = $_POST['product_id'] ?? null;
    $qty = $_POST['quantity'] ?? 1;

    if (!$productId) {
        echo json_encode([
            "success" => false,
            "message" => "Missing product ID"
        ]);
        exit;
    }

    // 3️⃣ USE SESSION SAFELY
    $userId = $_SESSION['user_id'];

    // 4️⃣ DATABASE OPERATION
    try {
        $stmt = $con->prepare("
            INSERT INTO cart (user_id, product_id, quantity) 
            VALUES (?, ?, ?) 
            ON DUPLICATE KEY UPDATE quantity = quantity + ?
        ");
        $stmt->execute([$userId, $productId, $qty, $qty]);

        echo json_encode(["success" => true]);
    } catch (Exception $e) {
        echo json_encode([
            "success" => false,
            "message" => "Database error"
        ]);
    }

    exit;
}


function fetchCart() {
    global $con; // <--- FIX 1: This fixes the "Undefined variable $con" error
    
    // Safety check: ensure db.php is included if $con is somehow still null
    if (!$con) {
        require_once './config/db.php';
    }

    header("Content-Type: application/json");

    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }

    if (!isset($_SESSION['user_id'])) {
        echo json_encode([
            "items" => [],
            "totals" => ["subtotal" => 0, "count" => 0]
        ]);
        exit;
    }

    $userId = (int)$_SESSION['user_id'];

    $items = [];
    $totals = ["subtotal" => 0.0, "count" => 0];

    try {
        // FIX 2: We use 'p.image_path AS image' so the frontend gets the right image data
        $stmt = $con->prepare("
            SELECT 
                c.product_id, 
                c.quantity, 
                p.name, 
                p.price, 
                p.quantity AS stock,
                p.image_path AS image 
            FROM cart c 
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = :uid
        ");
        $stmt->execute([':uid' => $userId]);
        $items = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($items as &$row) {
            $row['price'] = (float)$row['price'];
            $row['quantity'] = (int)$row['quantity'];
            $row['stock'] = (int)$row['stock'];
            $row['line_total'] = $row['price'] * $row['quantity'];

            $totals['subtotal'] += $row['line_total'];
            $totals['count'] += $row['quantity'];
        }

        $totals['subtotal'] = (float)$totals['subtotal'];

    } catch (Exception $e) {
        http_response_code(500);
        // If you still get errors, uncomment the line below to see them:
        // echo json_encode(["error" => $e->getMessage()]);
        echo json_encode(["type" => "error", "message" => "Failed to fetch cart data."]);
        exit;
    }

    echo json_encode([
        "items" => $items,
        "totals" => $totals
    ]);
    exit;
}
function updateCart() {
    global $con;

    header("Content-Type: application/json");
    if (!isset($_SESSION['user_id'])) {
        echo json_encode([
            "success" => false,
            "message" => "Not logged in"
        ]);
        return;
    }

    $userId = (int)$_SESSION['user_id'];

    $input = json_decode(file_get_contents("php://input"), true);

    if (!$input) { $input = $_POST; }

    // --------------------------
    // REMOVE SINGLE ITEM
    // --------------------------
    if (isset($input['remove'])) {
        $pid = (int)$input['remove'];

        if ($pid > 0) {
            try {
                $stmt = $con->prepare("DELETE FROM cart WHERE user_id = :uid AND product_id = :pid");
                $stmt->execute([':uid' => $userId, ':pid' => $pid]);
            } catch (Exception $e) {}

            echo json_encode(["success" => true, "message" => "Item removed"]);
            return;
        }
    }

    // --------------------------
    // UPDATE QUANTITIES
    // --------------------------
    $qtyMap = isset($input['qty']) && is_array($input['qty']) ? $input['qty'] : [];

    if (empty($qtyMap)) {
        echo json_encode([
            "success" => false,
            "message" => "No quantity data provided"
        ]);
        return;
    }

    try {
        $con->beginTransaction();

        foreach ($qtyMap as $pidStr => $qtyVal) {
            $pid = (int)$pidStr;
            $qty = (int)$qtyVal;
            if ($pid <= 0) continue;

            // Check product stock
            $stmt = $con->prepare("SELECT quantity FROM products WHERE id = :id");
            $stmt->execute([':id' => $pid]);
            $stockRes = $stmt->fetchColumn();

            // If product no longer exists — drop from cart
            if ($stockRes === false) {
                $del = $con->prepare("DELETE FROM cart WHERE user_id = :uid AND product_id = :pid");
                $del->execute([':uid' => $userId, ':pid' => $pid]);
                continue;
            }

            $stock = (int)$stockRes;

            // Remove if 0 or invalid
            if ($qty <= 0) {
                $del = $con->prepare("DELETE FROM cart WHERE user_id = :uid AND product_id = :pid");
                $del->execute([':uid' => $userId, ':pid' => $pid]);
                continue;
            }

            // Clamp to stock
            $qty = min($qty, max(0, $stock));

            if ($qty <= 0) {
                $del = $con->prepare("DELETE FROM cart WHERE user_id = :uid AND product_id = :pid");
                $del->execute([':uid' => $userId, ':pid' => $pid]);
                continue;
            }

            // Update
            $upd = $con->prepare("UPDATE cart SET quantity = :q WHERE user_id = :uid AND product_id = :pid");
            $upd->execute([':q' => $qty, ':uid' => $userId, ':pid' => $pid]);
        }

        $con->commit();

        echo json_encode([
            "success" => true,
            "message" => "Cart updated"
        ]);
    }
    catch (Exception $e) {
        if ($con->inTransaction()) $con->rollBack();

        echo json_encode([
            "success" => false,
            "message" => "Error updating cart",
            "error" => $e->getMessage()
        ]);
    }
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

function fetchCheckout() {
 
    require './config/db.php';

    header("Content-Type: application/json");

    if (!isset($_SESSION['user_id'])) {
        echo json_encode(["error" => "Not logged in"]);
        exit;
    }

    $userId = (int)$_SESSION['user_id'];

    $items = [];
    $totals = [
        "subtotal" => 0.0,
        "count" => 0
    ];

    try {
        $stmt = $con->prepare("
            SELECT 
                c.product_id, 
                c.quantity, 
                p.name, 
                p.price
            FROM cart c
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = :uid
        ");
        $stmt->execute([':uid' => $userId]);
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (empty($rows)) {
            echo json_encode(["empty" => true]);
            exit;
        }

        foreach ($rows as $row) {
            $row['price'] = (float)$row['price'];
            $row['quantity'] = (int)$row['quantity'];
            $row['line_total'] = $row['price'] * $row['quantity'];

            $totals['subtotal'] += $row['line_total'];
            $totals['count'] += $row['quantity'];

            $items[] = $row;
        }

        $totals['subtotal'] = (float)$totals['subtotal'];

        echo json_encode([
            "items" => $items,
            "totals" => $totals
        ]);
    } 
    catch (Exception $e) {
        echo json_encode(["error" => "Failed to load checkout"]);
    }

    exit;
}


function fetchOrders() {
    global $con;


    // Make sure user is logged in
    if (!isset($_SESSION['user_id'])) {
        echo json_encode([
            "success" => false,
            "message" => "Not logged in"
        ]);
        return;
    }

    $userId = (int)$_SESSION['user_id'];

    try {
        $stmt = $con->prepare("
            SELECT 
                id,
                total_amount,
                order_status,
                payment_status,
                created_at
            FROM orders
            WHERE buyer_id = :uid
            ORDER BY id DESC
        ");
        $stmt->execute([':uid' => $userId]);
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "orders" => $orders
        ]);
    } catch (Exception $e) {


echo json_encode([
    "success" => true,
    "DEBUG_WHO_AM_I" => $_SESSION['user_id'],
    "orders" => $orders
]); 
    }
}


function fetchOrderDetails() {
    global $con;


    header('Content-Type: application/json');

    if (!isset($_SESSION['user_id'])) {
        echo json_encode([
            "success" => false,
            "message" => "Not logged in"
        ]);
        return;
    }

    $userId = (int)$_SESSION['user_id'];
    $orderId = isset($_GET['id']) ? (int)$_GET['id'] : 0;

    if ($orderId <= 0) {
        echo json_encode([
            "success" => false,
            "message" => "Invalid order ID"
        ]);
        return;
    }

    try {
        // Fetch order
        $stmt = $con->prepare("
            SELECT 
                id, 
                total_amount, 
                order_status, 
                payment_status, 
                shipping_address, 
                payment_method, 
                created_at
            FROM orders 
            WHERE id = :id AND buyer_id = :uid
        ");
        $stmt->execute([
            ':id' => $orderId,
            ':uid' => $userId
        ]);
        $order = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$order) {
            echo json_encode([
                "success" => false,
                "message" => "Order not found or unauthorized"
            ]);
            return;
        }

        // Fetch order items
        $itemsStmt = $con->prepare("
            SELECT 
                oi.product_id, 
                oi.quantity, 
                oi.unit_price, 
                oi.total_price, 
                p.name
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = :oid
        ");
        $itemsStmt->execute([':oid' => $orderId]);
        $items = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);

        // Final JSON output
        echo json_encode([
            "success" => true,
            "order" => $order,
            "items" => $items
        ]);

    } catch (Exception $e) {
        echo json_encode([
            "success" => false,
            "message" => "Server error",
            "error" => $e->getMessage()
        ]);
    }
}

function placeOrder() {
    global $con;
    require_once './config/db.php';

    if (session_status() === PHP_SESSION_NONE) session_start();
    header("Content-Type: application/json");

    if (!isset($_SESSION['user_id'])) {
        echo json_encode(["success" => false, "message" => "Not logged in"]);
        exit;
    }

    $userId = (int)$_SESSION['user_id'];
    $input = json_decode(file_get_contents("php://input"), true);
    $address = $input['address'] ?? ''; 
    $paymentMethod = $input['payment_method'] ?? 'cod';

    if (empty($address)) {
        echo json_encode(["success" => false, "message" => "Shipping address is required"]);
        exit;
    }

    try {
        $con->beginTransaction();

        // 1. Fetch Cart Items (Keep this, we need it for calculations AND inserting items)
        $stmt = $con->prepare("
            SELECT c.product_id, c.quantity, p.price 
            FROM cart c 
            JOIN products p ON c.product_id = p.id 
            WHERE c.user_id = :uid
        ");
        $stmt->execute([':uid' => $userId]);
        $cartItems = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (empty($cartItems)) {
            echo json_encode(["success" => false, "message" => "Cart is empty"]);
            exit;
        }

        // 2. Calculate Totals
        $subtotal = 0;
        foreach ($cartItems as $item) {
            $subtotal += ($item['price'] * $item['quantity']);
        }
        $tax = $subtotal * 0.12;
        $deliveryFee = ($subtotal >= 500) ? 0 : 50;
        $grandTotal = $subtotal + $tax + $deliveryFee;

        // 3. Insert Order
        $stmt = $con->prepare("
            INSERT INTO orders (
                buyer_id, total_amount, shipping_address, payment_method, 
                order_status, payment_status, created_at, updated_at
            ) VALUES (
                :uid, :total, :addr, :pm, 
                'pending', 'pending', NOW(), NOW()
            )
        ");

        $stmt->execute([
            ':uid' => $userId,
            ':total' => $grandTotal,
            ':addr' => $address,
            ':pm' => $paymentMethod
        ]);
        
        $orderId = $con->lastInsertId();

        // --- 🛑 THIS IS THE MISSING PART YOU NEED TO ADD 🛑 ---
        
        // 4. Insert Order Items
        $itemStmt = $con->prepare("
            INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price) 
            VALUES (:oid, :pid, :qty, :price, :total)
        ");

        foreach ($cartItems as $item) {
            $lineTotal = $item['price'] * $item['quantity'];
            $itemStmt->execute([
                ':oid' => $orderId,
                ':pid' => $item['product_id'],
                ':qty' => $item['quantity'],
                ':price' => $item['price'],
                ':total' => $lineTotal
            ]);
        }
        // -----------------------------------------------------

        // 5. Clear Cart
        $stmt = $con->prepare("DELETE FROM cart WHERE user_id = :uid");
        $stmt->execute([':uid' => $userId]);

        $con->commit();

        echo json_encode(["success" => true, "order_id" => $orderId, "message" => "Order placed successfully"]);

    } catch (Exception $e) {
        if ($con->inTransaction()) {
            $con->rollBack();
        }
        echo json_encode(["success" => false, "message" => "Order failed: " . $e->getMessage()]);
    }
    exit;
}


function createOrder() {
    global $con;

    header('Content-Type: application/json');

    // Must be logged in
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(["success" => false, "message" => "Not logged in"]);
        return;
    }

    // Must be POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(["success" => false, "message" => "Invalid request method"]);
        return;
    }

    $userId = (int)$_SESSION['user_id'];

    // Receive JSON body
    $input = json_decode(file_get_contents("php://input"), true);

    $shippingAddress = trim($input['shipping_address'] ?? '');
    $paymentMethod   = trim($input['payment_method'] ?? 'paymongo');

    if ($shippingAddress === '') {
        echo json_encode(["success" => false, "message" => "Shipping address required"]);
        return;
    }

    try {
        // Lock cart rows
        $stmt = $con->prepare("
            SELECT c.product_id, c.quantity, p.price, p.quantity AS stock
            FROM cart c 
            JOIN products p ON c.product_id = p.id
            WHERE c.user_id = :uid
            FOR UPDATE
        ");

        $con->beginTransaction();
        $stmt->execute([':uid' => $userId]);
        $cart = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if (empty($cart)) {
            $con->rollBack();
            echo json_encode(["success" => false, "message" => "Cart is empty"]);
            return;
        }

        // Compute total
        $total = 0;
        foreach ($cart as $row) {
            $qty  = min((int)$row['quantity'], (int)$row['stock']);
            if ($qty > 0) {
                $total += ((float)$row['price']) * $qty;
            }
        }

        if ($total <= 0) {
            $con->rollBack();
            echo json_encode(["success" => false, "message" => "No valid items in cart"]);
            return;
        }

        // Create order
        $orderStmt = $con->prepare("
            INSERT INTO orders (buyer_id, total_amount, shipping_address, payment_method, order_status, payment_status)
            VALUES (:buyer_id, :total_amount, :shipping_address, :payment_method, 'pending', 'pending')
        ");
        $orderStmt->execute([
            ':buyer_id' => $userId,
            ':total_amount' => $total,
            ':shipping_address' => $shippingAddress,
            ':payment_method' => $paymentMethod,
        ]);

        $orderId = (int)$con->lastInsertId();

        // Payment transaction record
        $txnStmt = $con->prepare("
            INSERT INTO payment_transactions (order_id, transaction_id, amount, currency, status, payment_method)
            VALUES (:order_id, :transaction_id, :amount, 'PHP', :status, :payment_method)
        ");

        if ($paymentMethod === 'cod') {
            $transactionId = "COD-$orderId-" . time();
        } else {
            $transactionId = "PM-" . bin2hex(random_bytes(6));
        }

        $txnStmt->execute([
            ':order_id'       => $orderId,
            ':transaction_id' => $transactionId,
            ':amount'         => $total,
            ':status'         => "pending",
            ':payment_method' => $paymentMethod,
        ]);

        // Insert order items + decrement stock
        $itemStmt = $con->prepare("
            INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
            VALUES (:order_id, :product_id, :quantity, :unit_price, :total_price)
        ");

        $decStmt = $con->prepare("
            UPDATE products 
            SET quantity = quantity - :q 
            WHERE id = :pid AND quantity >= :q
        ");

        foreach ($cart as $row) {
            $qty = min((int)$row['quantity'], (int)$row['stock']);
            if ($qty <= 0) continue;

            $lineTotal = ((float)$row['price']) * $qty;

            $itemStmt->execute([
                ':order_id'   => $orderId,
                ':product_id' => (int)$row['product_id'],
                ':quantity'   => $qty,
                ':unit_price' => (float)$row['price'],
                ':total_price'=> $lineTotal,
            ]);

            $decStmt->execute([
                ':q'   => $qty,
                ':pid' => (int)$row['product_id'],
            ]);
        }

        // Clear cart
        $del = $con->prepare("DELETE FROM cart WHERE user_id = :uid");
        $del->execute([':uid' => $userId]);

        $con->commit();

        echo json_encode([
            "success" => true,
            "message" => "Order created successfully",
            "order_id" => $orderId,
            "transaction_ref" => $transactionId
        ]);
    }
    catch (Exception $e) {
        if ($con->inTransaction()) $con->rollBack();
        echo json_encode([
            "success" => false,
            "message" => "Order creation failed",
            "error" => $e->getMessage()
        ]);
    }
}
function fetchUsers($con) {
    
    if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
        echo json_encode(["error" => "Unauthorized"]);
        return;
    }

    try {
        $stmt = $con->query("SELECT user_id, username, email, role FROM users ORDER BY user_id DESC");
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "users" => $users
        ]);
    } catch (Exception $e) {
        echo json_encode([
            "success" => false,
            "error" => "Failed to fetch users"
        ]);
    }
}
function createUser($con) {
 

    if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
        echo json_encode(["error" => "Unauthorized"]);
        return;
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(["error" => "POST request required"]);
        return;
    }

    $data = json_decode(file_get_contents("php://input"), true);

    $username = trim($data['username'] ?? '');
    $email = trim($data['email'] ?? '');
    $role = trim($data['role'] ?? 'buyer');
    $password = $data['password'] ?? '';

    if (!$username || !$email || !$password) {
        echo json_encode(["error" => "All fields are required"]);
        return;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["error" => "Invalid email"]);
        return;
    }

    $hashed = password_hash($password, PASSWORD_DEFAULT);

    try {
        $stmt = $con->prepare("
            INSERT INTO users (username, email, password_hash, role) 
            VALUES (:username, :email, :password, :role)
        ");

        $stmt->execute([
            ":username" => $username,
            ":email" => $email,
            ":password" => $hashed,
            ":role" => $role
        ]);

        echo json_encode([
            "success" => true,
            "message" => "User created successfully"
        ]);
    } catch (Exception $e) {
        echo json_encode([
            "success" => false,
            "error" => "Failed to create user: " . $e->getMessage()
        ]);
    }
}
function updateUser($con) {
    

    if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
        echo json_encode(["error" => "Unauthorized"]);
        return;
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(["error" => "POST request required"]);
        return;
    }

    $data = json_decode(file_get_contents("php://input"), true);

    $user_id = (int)($data['user_id'] ?? 0);
    $username = trim($data['username'] ?? '');
    $email = trim($data['email'] ?? '');
    $role = trim($data['role'] ?? '');

    if ($user_id <= 0) {
        echo json_encode(["error" => "Invalid user"]);
        return;
    }

    try {
        $stmt = $con->prepare("
            UPDATE users SET username = :u, email = :e, role = :r
            WHERE user_id = :id
        ");

        $stmt->execute([
            ":u" => $username,
            ":e" => $email,
            ":r" => $role,
            ":id" => $user_id
        ]);

        echo json_encode(["success" => true]);
    } catch (Exception $e) {
        echo json_encode(["error" => "Failed to update user"]);
    }
}





//AAAAAAAAADDDDDDDDDDDDMINNNNNNNNNNNNNNNN
function adminGetCategories($con) {
    try {
        $stmt = $con->query("SELECT * FROM categories ORDER BY id DESC");
        $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["success" => true, "categories" => $categories]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
}
function adminCreateCategory($con) {
    $data = json_decode(file_get_contents("php://input"), true);
    
    $name = trim($data["name"] ?? "");
    $description = trim($data["description"] ?? "");
    $is_active = $data["is_active"] ?? 1;

    if ($name === "") {
        echo json_encode(["success" => false, "error" => "Name is required"]);
        return;
    }

    try {
        $stmt = $con->prepare("INSERT INTO categories (name, description, is_active) VALUES (?,?,?)");
        $stmt->execute([$name, $description, $is_active]);

        echo json_encode(["success" => true, "message" => "Category created"]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
}
function adminUpdateCategory($con) {
    $data = json_decode(file_get_contents("php://input"), true);

    $id = (int)($data["id"] ?? 0);
    $name = trim($data["name"] ?? "");
    $description = trim($data["description"] ?? "");
    $is_active = $data["is_active"] ?? 1;

    if ($id <= 0 || $name === "") {
        echo json_encode(["success" => false, "error" => "Valid ID and name required"]);
        return;
    }

    try {
        $stmt = $con->prepare("UPDATE categories SET name=?, description=?, is_active=? WHERE id=?");
        $stmt->execute([$name, $description, $is_active, $id]);

        echo json_encode(["success" => true, "message" => "Category updated"]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
}
function adminToggleCategory($con) {
    $data = json_decode(file_get_contents("php://input"), true);

    $id = (int)($data["id"] ?? 0);
    $to = (int)($data["to"] ?? 0);

    if ($id <= 0) {
        echo json_encode(["success" => false, "error" => "Invalid category ID"]);
        return;
    }

    try {
        $stmt = $con->prepare("UPDATE categories SET is_active=? WHERE id=?");
        $stmt->execute([$to, $id]);

        echo json_encode(["success" => true, "message" => "Category status updated"]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
}
function adminDeleteCategory($con) {
    $data = json_decode(file_get_contents("php://input"), true);

    $id = (int)($data["id"] ?? 0);

    if ($id <= 0) {
        echo json_encode(["success" => false, "error" => "Invalid category ID"]);
        return;
    }

    try {
        $stmt = $con->prepare("DELETE FROM categories WHERE id=?");
        $stmt->execute([$id]);

        echo json_encode([
            "success" => true,
            "message" => "Category deleted successfully"
        ]);
    } catch (Exception $e) {
        echo json_encode([
            "success" => false,
            "error" => $e->getMessage()
        ]);
    }
}function adminDashboard() {
    global $con;

    header("Content-Type: application/json");

    if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
        echo json_encode(["error" => "Unauthorized"]);
        return;
    }

    $metrics = [
        'total_users' => 0,
        'total_products' => 0,
        'pending_orders' => 0,
        'revenue_today' => 0.0,
    ];

    try {
        $metrics['total_users'] = (int)$con->query("SELECT COUNT(*) FROM users")->fetchColumn();
        
        // Count only approved products
        $metrics['total_products'] = (int)$con->query("SELECT COUNT(*) FROM products WHERE status = 'approved'")->fetchColumn();

        $metrics['pending_orders'] = (int)$con->query("SELECT COUNT(*) FROM orders WHERE order_status = 'pending'")->fetchColumn();

        // 👇 UPDATED REVENUE QUERY:
        // Only sum up orders created TODAY that are marked as 'delivered'
        $stmt = $con->query("
            SELECT COALESCE(SUM(total_amount), 0)
            FROM orders
            WHERE DATE(created_at) = CURDATE() 
            AND order_status = 'delivered' 
        ");
        $metrics['revenue_today'] = (float)$stmt->fetchColumn();

    } catch (Exception $e) {}

    echo json_encode($metrics);
}

function adminOrders() {
    global $con;

    header("Content-Type: application/json");

  
    if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
        echo json_encode(["error" => "Unauthorized"]);
        return;
    }

    
    $orderId = $_GET['order_id'] ?? '';
    $status  = $_GET['status'] ?? '';

    $query = "SELECT id AS order_id, buyer_id, total_amount, order_status, created_at 
              FROM orders 
              WHERE 1=1 ";

    $params = [];

    if ($orderId !== '') {
        $query .= " AND id = :order_id ";
        $params[':order_id'] = $orderId;
    }

    if ($status !== '') {
        $query .= " AND order_status = :status ";
        $params[':status'] = $status;
    }

    $query .= " ORDER BY id DESC ";

    try {
        $stmt = $con->prepare($query);
        $stmt->execute($params);
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "orders" => $orders
        ]);
    } catch (Exception $e) {

        // Fallback schema if your DB uses different columns
        try {
            $fallback = $con->query("
                SELECT order_id, customer_name, order_date, total, status
                FROM orders
                ORDER BY order_id DESC
            ")->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                "success" => true,
                "orders" => $fallback,
                "fallback" => true
            ]);

        } catch (Exception $e2) {
            echo json_encode([
                "success" => false,
                "error" => "Failed to load orders"
            ]);
        }
    }
}
function adminListCategories() {
    global $con;
 
    header("Content-Type: application/json");

    if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
        echo json_encode(["error" => "Unauthorized"]);
        return;
    }

    try {
        $stmt = $con->query("SELECT id, name FROM categories WHERE is_active = 1 ORDER BY name ASC");
        $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "categories" => $categories
        ]);

    } catch (Exception $e) {

        // fallback (in case is_active column doesn't exist)
        try {
            $stmt = $con->query("SELECT id, name FROM categories ORDER BY name ASC");
            $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                "success" => true,
                "categories" => $categories,
                "fallback" => true
            ]);

        } catch (Exception $e2) {
            echo json_encode(["success" => false, "error" => "Failed to load categories"]);
        }
    }
}
function adminCreateProduct() {
    global $con;
  
    header("Content-Type: application/json");

    if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
        echo json_encode(["error" => "Unauthorized"]);
        return;
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(["error" => "POST request required"]);
        return;
    }

    $data = json_decode(file_get_contents("php://input"), true);

    $name        = trim($data['name'] ?? '');
    $price       = $data['price'] ?? '';
    $stock       = $data['stock'] ?? '';
    $category_id = (int)($data['category_id'] ?? 0);
    $description = trim($data['description'] ?? '');

    $errors = [];
    if ($name === '') $errors[] = 'Name is required';
    if ($category_id <= 0) $errors[] = 'Category is required';
    if (!is_numeric($price) || $price < 0) $errors[] = 'Price must be valid';
    if (!is_numeric($stock) || $stock < 0) $errors[] = 'Stock must be valid';

    if (!empty($errors)) {
        echo json_encode(["success" => false, "errors" => $errors]);
        return;
    }

    try {
        $stmt = $con->prepare("
            INSERT INTO products (seller_id, category_id, name, description, price, quantity, image_path)
            VALUES (:seller_id, :category_id, :name, :description, :price, :quantity, :image_path)
        ");

        $stmt->execute([
            ':seller_id' => $_SESSION['user_id'],
            ':category_id' => $category_id,
            ':name' => $name,
            ':description' => $description,
            ':price' => $price,
            ':quantity' => $stock,
            ':image_path' => ''
        ]);

        echo json_encode(["success" => true, "message" => "Product created"]);

    } catch (Exception $e) {
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }   
}
function adminListProducts() {
    global $con;
    
    header("Content-Type: application/json");

    if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
        echo json_encode(["error" => "Unauthorized"]);
        return;
    }

    try {
        $stmt = $con->query("
            SELECT 
                p.id, 
                p.name, 
                p.description, 
                p.price, 
                p.quantity, 
                p.image_path, 
                p.created_at,
                c.name AS category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            ORDER BY p.id DESC
        ");

        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "products" => $products
        ]);

    } catch (Exception $e) {
        echo json_encode(["success" => false, "error" => "Failed to load products"]);
    }
}
function adminReports($con) {
   

    if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
        echo json_encode(["error" => "Unauthorized"]);
        return;
    }

    $response = [
        "users" => 0,
        "products" => 0,
        "orders" => 0,
        "sales" => 0.0
    ];

    try {
        $response['users'] = (int)$con->query("SELECT COUNT(*) FROM users")->fetchColumn();
        $response['products'] = (int)$con->query("SELECT COUNT(*) FROM products")->fetchColumn();
        $response['orders'] = (int)$con->query("SELECT COUNT(*) FROM orders")->fetchColumn();
        
       
        $response['sales'] = (float)$con->query("
            SELECT COALESCE(SUM(total_amount),0) 
            FROM orders 
            WHERE order_status IN ('confirmed','shipped','delivered')
            OR payment_status='paid'
        ")->fetchColumn();
    } catch (Exception $e) {}

    echo json_encode(["success" => true, "data" => $response]);
}
function fetchAdminSettings($con) {


    if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
        echo json_encode(["error" => "Unauthorized"]);
        return;
    }

    
    $default = [
        "site_name" => "My Shop",
        "contact_email" => "admin@example.com",
        "currency" => "USD"
    ];

    echo json_encode([
        "success" => true,
        "settings" => $default
    ]);
}
function updateAdminSettings($con) {
    

    if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
        echo json_encode(["error" => "Unauthorized"]);
        return;
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(["error" => "POST request required"]);
        return;
    }

    $data = json_decode(file_get_contents("php://input"), true);

    $site_name = $data['site_name'] ?? '';
    $email = $data['contact_email'] ?? '';
    $currency = $data['currency'] ?? 'USD';

    if (!$site_name || !$email) {
        echo json_encode(["error" => "Missing required fields"]);
        return;
    }

    echo json_encode([
        "success" => true,
        "message" => "Settings updated successfully"
    ]);
}
function adminChangePassword($con) {


    if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
        echo json_encode(["error" => "Unauthorized"]);
        return;
    }

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(["error" => "POST request required"]);
        return;
    }

    $data = json_decode(file_get_contents("php://input"), true);

    $new_pass = $data['new_password'] ?? '';
    $confirm_pass = $data['confirm_password'] ?? '';

    if ($new_pass !== $confirm_pass) {
        echo json_encode(["error" => "Passwords do not match"]);
        return;
    }

    if (strlen($new_pass) < 6) {
        echo json_encode(["error" => "Password must be at least 6 characters"]);
        return;
    }

    $hashed = password_hash($new_pass, PASSWORD_DEFAULT);

    $stmt = $con->prepare("UPDATE users SET password_hash = :hash WHERE user_id = :id");
    $stmt->execute([
        ":hash" => $hashed,
        ":id" => $_SESSION['user_id']
    ]);

    echo json_encode(["success" => true, "message" => "Password updated"]);
}
function adminListPendingProducts() {
    global $con;
    header("Content-Type: application/json");
    if (!isset($_SESSION['user_id']) || ($_SESSION['role'] ?? '') !== 'admin') {
        echo json_encode(['success' => false, 'error' => 'Unauthorized']);
        return;
    }
    try {
        $stmt = $con->prepare("
            SELECT p.id, p.seller_id, p.category_id, p.name, p.description, p.price, p.quantity, 
                   p.image_path, p.status, p.is_active, p.created_at, p.updated_at,
                   u.username AS seller_username,
                   c.name AS category_name
            FROM products p
            LEFT JOIN users u ON p.seller_id = u.user_id
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.status = 'pending'
            ORDER BY p.created_at DESC
        ");
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'products' => $rows]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

// list approved products
function adminListApprovedProducts() {
    global $con;
    header("Content-Type: application/json");
    if (!isset($_SESSION['user_id']) || ($_SESSION['role'] ?? '') !== 'admin') {
        echo json_encode(['success' => false, 'error' => 'Unauthorized']);
        return;
    }
    try {
        $stmt = $con->prepare("
            SELECT p.id, p.seller_id, p.category_id, p.name, p.description, p.price, p.quantity, 
                   p.image_path, p.status, p.is_active, p.created_at, p.updated_at,
                   u.username AS seller_username,
                   c.name AS category_name
            FROM products p
            LEFT JOIN users u ON p.seller_id = u.user_id
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.status = 'approved'
            ORDER BY p.updated_at DESC
        ");
        $stmt->execute();
        echo json_encode(['success' => true, 'products' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

// list rejected products
function adminListRejectedProducts() {
    global $con;
    header("Content-Type: application/json");
    if (!isset($_SESSION['user_id']) || ($_SESSION['role'] ?? '') !== 'admin') {
        echo json_encode(['success' => false, 'error' => 'Unauthorized']);
        return;
    }
    try {
        $stmt = $con->prepare("
            SELECT p.id, p.seller_id, p.category_id, p.name, p.description, p.price, p.quantity, 
                   p.image_path, p.status, p.is_active, p.created_at, p.updated_at,
                   u.username AS seller_username,
                   c.name AS category_name
            FROM products p
            LEFT JOIN users u ON p.seller_id = u.user_id
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.status = 'rejected'
            ORDER BY p.updated_at DESC
        ");
        $stmt->execute();
        echo json_encode(['success' => true, 'products' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}
function adminApproveProduct($data) {
    global $con;
    header("Content-Type: application/json");
    
    // Check if user is logged in AND is an admin
    if (!isset($_SESSION['user_id']) || ($_SESSION['role'] ?? '') !== 'admin') {
        echo json_encode(['success' => false, 'error' => 'Unauthorized']);
        return;
    }
    // ... rest of logic
    // Accept both keys to match rejectProduct()
    $id = $data['product_id'] ?? $data['id'] ?? null;

    if (!$id) {
        echo json_encode([
            "success" => false,
            "message" => "Missing product ID",
            "received" => $data // This will now show the actual received data if it's there
        ]);
        return;
    }

    try {
        $stmt = $con->prepare(
            "UPDATE products 
             SET status = 'approved', approved_at = NOW() 
             WHERE id = ?"
        );
        $stmt->execute([$id]);

        echo json_encode(["success" => true, "message" => "Product approved"]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
}

function adminRejectProduct() {
    global $con;
    header("Content-Type: application/json");

    $data = json_decode(file_get_contents("php://input"), true);

    // Accept both keys
    $id = $data['product_id'] ?? $data['id'] ?? null;

    if (!$id) {
        echo json_encode(["success" => false, "message" => "Missing product ID"]);
        return;
    }

    try {
        $stmt = $con->prepare("UPDATE products SET status = 'rejected', updated_at = NOW() WHERE id = ?");
        $stmt->execute([$id]);

        echo json_encode(["success" => true, "message" => "Product rejected"]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
}


// admin: get single product (detailed)
function adminGetProduct() {
    global $con;
    header("Content-Type: application/json");
    if (!isset($_SESSION['user_id']) || ($_SESSION['role'] ?? '') !== 'admin') {
        echo json_encode(['success' => false, 'error' => 'Unauthorized']);
        return;
    }

    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    if ($id <= 0) {
        echo json_encode(['success' => false, 'error' => 'Invalid id']);
        return;
    }

    try {
        $stmt = $con->prepare("
            SELECT p.*, u.username AS seller_username, c.name AS category_name
            FROM products p
            LEFT JOIN users u ON p.seller_id = u.user_id
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.id = ?
        ");
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) {
            echo json_encode(['success' => false, 'error' => 'Product not found']);
            return;
        }
        echo json_encode(['success' => true, 'product' => $row]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

// admin dashboard stats (counts + revenue today)
function adminDashboardStats() {
    global $con;
    header("Content-Type: application/json");
    if (!isset($_SESSION['user_id']) || ($_SESSION['role'] ?? '') !== 'admin') {
        echo json_encode(['error' => 'Unauthorized']);
        return;
    }

    try {
        $total_users = (int)$con->query("SELECT COUNT(*) FROM users")->fetchColumn();
        $total_products = (int)$con->query("SELECT COUNT(*) FROM products")->fetchColumn();
        $pending_products = (int)$con->query("SELECT COUNT(*) FROM products WHERE status = 'pending'")->fetchColumn();
        $approved_products = (int)$con->query("SELECT COUNT(*) FROM products WHERE status = 'approved'")->fetchColumn();
        $rejected_products = (int)$con->query("SELECT COUNT(*) FROM products WHERE status = 'rejected'")->fetchColumn();

        $stmt = $con->query("
            SELECT COALESCE(SUM(total_amount),0) FROM orders WHERE DATE(created_at) = CURDATE()
        ");
        $revenue_today = (float)$stmt->fetchColumn();

        echo json_encode([
            'success' => true,
            'data' => [
                'total_users' => $total_users,
                'total_products' => $total_products,
                'pending_products' => $pending_products,
                'approved_products' => $approved_products,
                'rejected_products' => $rejected_products,
                'revenue_today' => $revenue_today
            ]
        ]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

// admin recent product requests
function adminDashboardRecentProducts() {
    global $con;
    header("Content-Type: application/json");
    if (!isset($_SESSION['user_id']) || ($_SESSION['role'] ?? '') !== 'admin') {
        echo json_encode(['error' => 'Unauthorized']);
        return;
    }

    try {
        $stmt = $con->prepare("
            SELECT p.id, p.name, p.seller_id, u.username AS seller_username, p.price, p.quantity, p.image_path, p.status, p.created_at
            FROM products p
            LEFT JOIN users u ON p.seller_id = u.user_id
            ORDER BY p.created_at DESC
            LIMIT 20
        ");
        $stmt->execute();
        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'products' => $rows]);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

// admin city performance: revenue grouped by city (best-effort)
function adminDashboardCityPerformance() {
    global $con;
    header("Content-Type: application/json");
    if (!isset($_SESSION['user_id']) || ($_SESSION['role'] ?? '') !== 'admin') {
        echo json_encode(['error' => 'Unauthorized']);
        return;
    }

    try {
        // attempt to use 'shipping_city' or 'city' or 'shipping_address' column if present
        // This query will try common column names; if none exist it will return empty array.
        $check = $con->query("SHOW COLUMNS FROM orders LIKE 'shipping_city'")->fetch();
        if ($check) {
            $stmt = $con->prepare("
                SELECT shipping_city as city, COALESCE(SUM(total_amount),0) AS revenue
                FROM orders
                GROUP BY shipping_city
                ORDER BY revenue DESC
                LIMIT 10
            ");
            $stmt->execute();
            $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['success' => true, 'data' => $rows]);
            return;
        }

        // fallback: check for 'city' column
        $check2 = $con->query("SHOW COLUMNS FROM orders LIKE 'city'")->fetch();
        if ($check2) {
            $stmt = $con->prepare("
                SELECT city, COALESCE(SUM(total_amount),0) AS revenue
                FROM orders
                GROUP BY city
                ORDER BY revenue DESC
                LIMIT 10
            ");
            $stmt->execute();
            echo json_encode(['success' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
            return;
        }

        // if none, return empty with message
        echo json_encode(['success' => true, 'data' => [], 'note' => 'No city field in orders table; add shipping_city or city to populate this metric.']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

// admin: update order status (example)
function adminUpdateOrderStatus() {
    global $con;
    header("Content-Type: application/json");
    if (!isset($_SESSION['user_id']) || ($_SESSION['role'] ?? '') !== 'admin') {
        echo json_encode(['success' => false, 'error' => 'Unauthorized']);
        return;
    }

    $data = json_decode(file_get_contents("php://input"), true);
    $orderId = (int)($data['order_id'] ?? 0);
    $status = trim($data['status'] ?? '');

    if ($orderId <= 0 || $status === '') {
        echo json_encode(['success' => false, 'error' => 'Missing order_id or status']);
        return;
    }

    try {
        $stmt = $con->prepare("UPDATE orders SET order_status = :st, updated_at = NOW() WHERE id = :id");
        $ok = $stmt->execute([':st' => $status, ':id' => $orderId]);
        echo json_encode(['success' => (bool)$ok, 'message' => $ok ? 'Order updated' : 'Update failed']);
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
}

function adminGetAllProducts() {
    global $con;

    header("Content-Type: application/json");

    try {
        $query = "
            SELECT 
                p.id,
                p.name,
                p.description,
                p.price,
                p.quantity,
                p.image_path,
                p.status,
                p.is_active,
                p.created_at,
                p.updated_at,
                u.user_id AS seller_id,
                u.username AS seller_name,
                c.name AS category_name
            FROM products p
            LEFT JOIN users u ON u.user_id = p.seller_id
            LEFT JOIN categories c ON c.id = p.category_id
            ORDER BY p.id DESC
        ";

        $stmt = $con->prepare($query);
        $stmt->execute();
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "products" => $products
        ]);
    } catch (Exception $e) {
        echo json_encode([
            "success" => false,
            "message" => "Error fetching all products",
            "error" => $e->getMessage()
        ]);
    }
}
function adminGetPendingProducts() {
    global $con;

    header("Content-Type: application/json");

    try {
        $query = "
            SELECT
                p.id,
                p.name,
                p.description,
                p.price,
                p.quantity,
                p.image_path,
                p.status,
                p.created_at,
                u.user_id AS seller_id,
                u.username AS seller_name,
                c.name AS category_name
            FROM products p
            LEFT JOIN users u ON u.user_id = p.seller_id
            LEFT JOIN categories c ON c.id = p.category_id
            WHERE p.status = 'pending'
            ORDER BY p.created_at DESC
        ";

        $stmt = $con->prepare($query);
        $stmt->execute();
        $pending = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "products" => $pending  // <-- your frontend expects "products"
        ]);
    } catch (Exception $e) {
        echo json_encode([
            "success" => false,
            "message" => "Error fetching pending products",
            "error" => $e->getMessage()
        ]);
    }
}

function adminGetProductDetails() {
    global $con;

    header("Content-Type: application/json");

    $product_id = $_GET['id'] ?? 0;

    try {
        $stmt = $con->prepare("
            SELECT p.*, 
                   s.name AS seller_name,
                   c.name AS category_name
            FROM products p
            LEFT JOIN sellers s ON s.id = p.seller_id
            LEFT JOIN categories c ON c.id = p.category_id
            WHERE p.id = :id
        ");
        $stmt->execute([":id" => $product_id]);
        $product = $stmt->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "product" => $product
        ]);
    }
    catch (Exception $e) {
        echo json_encode([
            "success" => false,
            "message" => "Error fetching product details",
            "error" => $e->getMessage()
        ]);
    }
}


function adminListUsers() {
    global $con;
    header("Content-Type: application/json");

    if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
        echo json_encode(["error" => "Unauthorized"]);
        return;
    }

    try {
        
        $stmt = $con->query("SELECT user_id, username, email, role, created_at FROM users ORDER BY created_at DESC");
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["success" => true, "users" => $users]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
}

function adminCreateUser() {
    global $con;
    header("Content-Type: application/json");

    if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
        echo json_encode(["error" => "Unauthorized"]);
        return;
    }

    $data = json_decode(file_get_contents("php://input"), true);

    $username = trim($data['username'] ?? '');
    $email    = trim($data['email'] ?? '');
    $password = $data['password'] ?? '';
    $role     = $data['role'] ?? 'buyer';
    
    $first_name = trim($data['first_name'] ?? '');
    $last_name  = trim($data['last_name'] ?? '');
    $phone      = trim($data['phone'] ?? '');
    $address    = trim($data['address'] ?? '');

    if (!$username || !$email || !$password) {
        echo json_encode(["success" => false, "error" => "Username, Email, and Password are required"]);
        return;
    }

    $check = $con->prepare("SELECT user_id FROM users WHERE email = ?");
    $check->execute([$email]);
    if ($check->rowCount() > 0) {
        echo json_encode(["success" => false, "error" => "Email already exists"]);
        return;
    }

    try {
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
        
      
        $stmt = $con->prepare("
            INSERT INTO users 
            (username, email, password_hash, role, first_name, last_name, phone, address, created_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        ");
        
        $stmt->execute([
            $username, 
            $email, 
            $hashed_password, 
            $role, 
            $first_name, 
            $last_name, 
            $phone, 
            $address
        ]);

        echo json_encode(["success" => true, "message" => "User created successfully"]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
}

function adminDeleteUser() {
    global $con;
    header("Content-Type: application/json");

    if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
        echo json_encode(["error" => "Unauthorized"]);
        return;
    }

    $data = json_decode(file_get_contents("php://input"), true);
    $user_id = (int)($data['user_id'] ?? 0);

    if ($user_id <= 0) {
        echo json_encode(["success" => false, "error" => "Invalid User ID"]);
        return;
    }

    // Prevent deleting yourself
    if ($user_id == $_SESSION['user_id']) {
        echo json_encode(["success" => false, "error" => "You cannot delete your own account"]);
        return;
    }

    try {
        $stmt = $con->prepare("DELETE FROM users WHERE user_id = ?");
        $stmt->execute([$user_id]);

        echo json_encode(["success" => true, "message" => "User deleted successfully"]);
    } catch (Exception $e) {
        echo json_encode(["success" => false, "error" => $e->getMessage()]);
    }
}












function insertProduct() {
    global $con;

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(['type'=>'error','message'=>'Only POST allowed']);
        return;
    }

    $name = $_POST['name'] ?? '';
    $desc = $_POST['description'] ?? '';
    $price = $_POST['price'] ?? '';
    $category = $_POST['category_id'] ?? '';
    $quantity = $_POST['quantity'] ?? '';
    $seller_id = $_POST['seller_id'] ?? '';

    if (!$name || !$price || !$category || $quantity === '' || !$seller_id) {
        echo json_encode(['type'=>'error','message'=>'Missing fields']);
        return;
    }

    // Handle Image Upload
    $image_path = null;
    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {

        $uploadDir = __DIR__ . "/uploads/";
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

        $ext = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
        $allowed = ['jpg','jpeg','png','gif'];

        if (!in_array($ext, $allowed)) {
            echo json_encode(['type'=>'error','message'=>'Invalid image type']);
            return;
        }

        $newName = uniqid("prod_", true) . "." . $ext;
        $dest = $uploadDir . $newName;
        move_uploaded_file($_FILES['image']['tmp_name'], $dest);

        $image_path = $newName;
    }

    // Insert with status=pending
    $sql = "INSERT INTO products 
            (seller_id, category_id, name, description, price, quantity, image_path, is_active, created_at, status)
            VALUES 
            (:seller_id, :category_id, :name, :description, :price, :quantity, :image_path, 1, NOW(), 'pending')";

    $stmt = $con->prepare($sql);
    $stmt->execute([
        ':seller_id' => $seller_id,
        ':category_id' => $category,
        ':name' => $name,
        ':description' => $desc,
        ':price' => $price,
        ':quantity' => $quantity,
        ':image_path' => $image_path
    ]);

    echo json_encode(['type'=>'success','message'=>'Product added (Pending Admin Review)']);
}



function updateProduct() {
    global $con;

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(['type'=>'error','message'=>'Only POST allowed']);
        exit;
    }

    $id = $_POST['id'] ?? '';
    $name = $_POST['name'] ?? '';
    $description = $_POST['description'] ?? '';
    $price = $_POST['price'] ?? '';
    $category_id = $_POST['category_id'] ?? '';
    $quantity = $_POST['quantity'] ?? '';

    error_log("UPDATE DEBUG: id=$id | name=$name | price=$price | cat=$category_id | qty=$quantity");

    if (!$id || !$name || !$price || !$category_id || $quantity === '') {
        echo json_encode(['type'=>'error','message'=>'Missing fields']);
        exit;
    }

    // Image Upload
    $image_path = null;

    if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {

        $uploadDir = __DIR__ . "/uploads/";
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

        $ext = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
        $allowed = ['jpg','jpeg','png','gif'];

        if (!in_array($ext, $allowed)) {
            echo json_encode(['type'=>'error','message'=>'Invalid image type']);
            exit;
        }

        $newName = uniqid("prod_", true) . "." . $ext;
        $dest = $uploadDir . $newName;

        if (move_uploaded_file($_FILES['image']['tmp_name'], $dest)) {
            $image_path = $newName;
        }
    }

    // SQL for update — ALWAYS set status back to pending
    if ($image_path) {
        $sql = "
            UPDATE products 
            SET name=:name, description=:description, price=:price, category_id=:category_id,
                quantity=:quantity, image_path=:image_path, 
                updated_at=NOW(), status='pending'
            WHERE id=:id
        ";
        $params = [
            ':name' => $name,
            ':description' => $description,
            ':price' => $price,
            ':category_id' => $category_id,
            ':quantity' => $quantity,
            ':image_path' => $image_path,
            ':id' => $id
        ];
    } else {
        $sql = "
            UPDATE products 
            SET name=:name, description=:description, price=:price, category_id=:category_id,
                quantity=:quantity, 
                updated_at=NOW(), status='pending'
            WHERE id=:id
        ";
        $params = [
            ':name' => $name,
            ':description' => $description,
            ':price' => $price,
            ':category_id' => $category_id,
            ':quantity' => $quantity,
            ':id' => $id
        ];
    }

    $stmt = $con->prepare($sql);
    $success = $stmt->execute($params);

    echo json_encode([
        'type' => $success ? 'success' : 'error',
        'message' => $success 
            ? 'Product updated — awaiting admin approval again' 
            : 'Update failed'
    ]);

    exit;
}



function deleteProduct() {
    global $con;

    $data = json_decode(file_get_contents("php://input"), true);

    $stmt = $con->prepare("DELETE FROM products WHERE id = :id");
    $success = $stmt->execute([':id' => $data['id']]);

    echo json_encode([
        'type' => $success ? 'success' : 'error',
        'message' => $success ? 'Product deleted' : 'Delete failed'
    ]);

    exit;
}
function getSellerProducts() {
    global $con;

    header("Content-Type: application/json");

    $seller_id = isset($_GET['seller_id']) ? (int)$_GET['seller_id'] : 0;

    if ($seller_id <= 0) {
        echo json_encode([
            "success" => false,
            "message" => "Invalid seller ID"
        ]);
        return;
    }

    try {
        $stmt = $con->prepare("
            SELECT 
                p.id,
                p.name,
                p.description,
                p.price,
                p.quantity,
                p.image_path,
                p.status,
                p.is_active,
                p.created_at,
                p.updated_at,
                p.category_id,
                c.name AS category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE p.seller_id = :seller_id
            ORDER BY p.id DESC
        ");

        $stmt->execute([':seller_id' => $seller_id]);
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
            "success" => true,
            "products" => $products
        ]);
    }
    catch (Exception $e) {
        echo json_encode([
            "success" => false,
            "message" => "Error fetching seller products",
            "error" => $e->getMessage()
        ]);
    }

}

function getSellerOrders() {
    global $con;
    header('Content-Type: application/json');
    if (session_status() === PHP_SESSION_NONE) session_start();

    if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'seller') {
        echo json_encode(["success" => false, "message" => "Unauthorized"]);
        return;
    }

    $sellerId = $_SESSION['user_id'];

    try {
       
        $stmt = $con->prepare("
            SELECT 
                o.id, 
                o.order_status AS status, 
                o.created_at, 
                o.total_amount,
                u.username AS customer,
                COUNT(oi.id) as item_count,
                (SELECT p.image_path FROM order_items oi2 JOIN products p ON oi2.product_id = p.id WHERE oi2.order_id = o.id LIMIT 1) as first_item_image
            FROM orders o
            JOIN users u ON o.buyer_id = u.user_id
            JOIN order_items oi ON o.id = oi.order_id
            JOIN products p ON oi.product_id = p.id
            WHERE p.seller_id = ?
            GROUP BY o.id
            ORDER BY o.created_at DESC
        ");
        
        $stmt->execute([$sellerId]);
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode(["success" => true, "orders" => $orders]);

    } catch (PDOException $e) {
        echo json_encode(["success" => false, "message" => "DB Error: " . $e->getMessage()]);
    }
}
function approveOrder() {
    global $con;
    header('Content-Type: application/json');

    if (session_status() === PHP_SESSION_NONE) session_start();

    
    if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'seller') {
        echo json_encode(["success" => false, "message" => "Unauthorized"]);
        return;
    }

    
    $data = json_decode(file_get_contents("php://input"), true);
    $orderId = isset($data['order_id']) ? (int)$data['order_id'] : 0;
    $sellerId = $_SESSION['user_id'];

    if ($orderId <= 0) {
        echo json_encode(["success" => false, "message" => "Invalid Order ID"]);
        return;
    }

    try {
       
        $checkStmt = $con->prepare("
            SELECT 1 
            FROM order_items oi
            JOIN products p ON oi.product_id = p.id
            WHERE oi.order_id = ? AND p.seller_id = ?
        ");
        $checkStmt->execute([$orderId, $sellerId]);

        if ($checkStmt->rowCount() === 0) {
            echo json_encode(["success" => false, "message" => "You do not have permission to manage this order."]);
            return;
        }

        
        $updateStmt = $con->prepare("
            UPDATE orders 
            SET order_status = 'approved', updated_at = NOW() 
            WHERE id = ?
        ");
        $updateStmt->execute([$orderId]);

        echo json_encode(["success" => true, "message" => "Order Approved!"]);

    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => "Error: " . $e->getMessage()]);
    }
}
 function updateOrderStatus($newStatus) {
        global $con;
        header('Content-Type: application/json');
        $data = json_decode(file_get_contents("php://input"), true);
        $orderId = (int)$data['order_id'];
    
        if ($orderId <= 0) {
            echo json_encode(["success" => false, "message" => "Invalid ID"]);
            return;
        }
    
        try {
            $stmt = $con->prepare("UPDATE orders SET order_status = ? WHERE id = ?");
            $stmt->execute([$newStatus, $orderId]);
            echo json_encode(["success" => true]);
        } catch (Exception $e) {
            echo json_encode(["success" => false, "message" => $e->getMessage()]);
        }
}

?>
