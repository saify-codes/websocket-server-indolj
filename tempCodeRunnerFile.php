<?php

// Create a new instance of Redis
$redis = new Redis();

// Connect to the Redis server
$redis->connect('127.0.0.1', 6379);

// Check connection
if ($redis->ping()) {
    echo "Connected to Redis!";
} else {
    echo "Failed to connect to Redis!";
}