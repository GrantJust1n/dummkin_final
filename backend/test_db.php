<?php
include_once './config/db.php';

try {
    $con->query('SELECT 1');
    echo "Database connection is successful.";
} catch (PDOException $e) {
    echo "Database connection failed: " . $e->getMessage();
}
?>
