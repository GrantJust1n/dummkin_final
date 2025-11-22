<?php
// Include the database configuration
include 'config/db.php';

// If we reach here without dying, connection is successful
if ($con) {
    echo "Database connection successful!";
    // Optional: Test a simple query
    try {
        $stmt = $con->query("SELECT 1");
        echo " Query test passed.";
    } catch (PDOException $e) {
        echo " Query test failed: " . $e->getMessage();
    }
} else {
    echo "Database connection failed.";
}
?>
