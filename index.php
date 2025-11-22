<?php
    include './config/db.php';
    session_start();
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Homepage</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f9f9f9;
            padding: 40px;
            text-align: center;
        }
        h1 {
            color: #2563eb;
        }
        .nav {
            margin: 20px 0;
        }
        .nav a {
            text-decoration: none;
            padding: 10px 20px;
            margin: 5px;
            background: #2563eb;
            color: white;
            border-radius: 6px;
        }
        .nav a:hover {
            background: #1e4bb8;
        }
        .info {
            margin-top: 30px;
            color: #444;
        }
    </style>
</head>
<body>
    <h1>Welcome to the Homepage</h1>

    <div class="nav">
        <a href="shop.php">Shop</a>
        <?php if (isset($_SESSION["user_id"])): ?>
            <a href="dashboard.php">Dashboard</a>
            <a href="cart.php">Cart</a>
            <a href="orders.php">My Orders</a>
            <a href="logout.php?logout=true">Logout</a>
        <?php else: ?>
            <a href="login.php">Login</a>
            <a href="register.php">Sign Up</a>
        <?php endif; ?>
    </div>
</body>
</html>
