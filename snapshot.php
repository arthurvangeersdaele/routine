<?php
// Get JSON input
$input = file_get_contents('php://input');

// Decode for validation (optional)
$data = json_decode($input, true);

// Save to snapshot.json
file_put_contents('snapshot.json', json_encode($data, JSON_PRETTY_PRINT));
?>
