-- =================================================================
-- 04: Create Customers Table and Migrate Data
-- =================================================================

-- Step 1: Create the new 'customers' table
-- This table will hold information specific to customers,
-- linking back to the central 'users' table.
CREATE TABLE `customers`
(
    `id`         BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `user_id`    BIGINT UNSIGNED NOT NULL,
    `notes`      TEXT                                       NULL COMMENT 'Customer-specific notes, preferences, or internal remarks.',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP()      NOT NULL,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP()      NOT NULL ON UPDATE CURRENT_TIMESTAMP(),

    -- Create a foreign key to the users table.
    -- If a user is deleted, their customer profile is also deleted.
    CONSTRAINT `fk_customers_user_id`
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
            ON DELETE CASCADE,

    -- Ensure a one-to-one relationship between a user and a customer profile.
    UNIQUE KEY `uq_customers_user_id` (`user_id`)
) COMMENT ='Stores customer-specific data, linked to the users table.';

-- Step 2: Migrate existing users with the 'customer' role into the new table.
-- This script assumes that users with role = 'customer' are the ones to be moved.
INSERT INTO `customers` (user_id)
SELECT id FROM `users` WHERE role = 'customer';

-- Note: After running this script, you may want to update your application logic
-- to query the 'customers' table instead of filtering users by role.
-- The 'role' column on the 'users' table can still be used for other roles like 'driver' or 'admin'.
