const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");

// Secret key for JWT
const JWT_SECRET = process.env.JWT_SECRET || "yourSecretKey";

// User registration
exports.registerUser = (req, res) => {
  const { name, email, password, role_name } = req.body;

  // Log the incoming request data
  console.log("Incoming registration data:", {
    name,
    email,
    password,
    role_name,
  });

  // Input validation
  if (!name || !email || !password || !role_name) {
    console.log("Validation error: Missing fields");
    return res.status(400).json({ message: "All fields are required" });
  }

  if (!validator.isEmail(email)) {
    console.log("Validation error: Invalid email format");
    return res.status(400).json({ message: "Invalid email format" });
  }

  // Password strength validation (1 uppercase, 1 lowercase, 1 number, special character, min length 6)
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
  if (!passwordRegex.test(password)) {
    console.log("Validation error: Weak password");
    return res.status(400).json({
      message:
        "Password must contain at least one uppercase, one lowercase, one number, one special character, and be at least 6 characters long",
    });
  }

  // Check if email already exists
  db.query("SELECT * FROM User WHERE email = ?", [email], (err, result) => {
    if (err) {
      console.error("Error checking email in database:", err);
      return res.status(500).json({ message: "Server error" });
    }
    if (result.length > 0) {
      console.log("Email already exists:", email);
      return res.status(400).json({ message: "Email is already registered" });
    }

    // Hash the password before storing it
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error("Error hashing password:", err);
        return res.status(500).json({ message: "Server error" });
      }

      // Insert new user with hashed password
      const insertUserQuery =
        "INSERT INTO User (username, email, password) VALUES (?, ?, ?)";
      db.query(
        insertUserQuery,
        [name, email, hashedPassword],
        (err, result) => {
          if (err) {
            console.error("Error inserting user into database:", err);
            return res.status(500).json({ message: "Server error" });
          }

          // Log the result of the user insert query
          console.log("User inserted successfully, user ID:", result.insertId);

          // Get the newly created user's ID
          const userId = result.insertId;

          // Get the role_id
          db.query(
            "SELECT role_id FROM Role WHERE role_name = ?",
            [role_name],
            (err, roleResult) => {
              if (err) {
                console.error("Error fetching role from database:", err);
                return res.status(500).json({ message: "Server error" });
              }

              // Log the role query result
              console.log("Role query result:", roleResult);

              if (roleResult.length === 0) {
                console.log("Invalid role name:", role_name);
                return res.status(400).json({ message: "Invalid role" });
              }

              const roleId = roleResult[0].role_id;

              // Assign role to the user
              const assignRoleQuery =
                "INSERT INTO userrole (user_id, role_id) VALUES (?, ?)";
              db.query(assignRoleQuery, [userId, roleId], (err) => {
                if (err) {
                  console.error("Error assigning role to user:", err);
                  return res.status(500).json({ message: "Server error" });
                }

                console.log(
                  "Role assigned successfully to user with ID:",
                  userId
                );
                res
                  .status(201)
                  .json({ message: "User registered successfully" });
              });
            }
          );
        }
      );
    });
  });
};

// User login with JWT
// User login with JWT
// User login with JWT
exports.loginUser = (req, res) => {
  console.log("Incoming request body:", req.body);
  const { email, password } = req.body;

  // Log the incoming data for debugging
  console.log("Incoming login data:", { email, password });

  // Input validation
  if (!email || !password) {
    console.log("Validation error: Missing email or password");
    return res.status(400).json({ message: "Email and password are required" });
  }

  // Query to find user by email
  console.log("Checking user existence in the database for email:", email);
  db.query("SELECT * FROM User WHERE email = ?", [email], (err, result) => {
    if (err) {
      console.error("Error during login query:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (result.length === 0) {
      console.log("No user found for email:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = result[0];
    console.log("User found:", { userId: user.user_id, email: user.email });

    // Compare the provided password with the hashed password
    console.log("Comparing provided password with the hashed password");
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error("Error comparing passwords:", err);
        return res.status(500).json({ message: "Server error" });
      }

      if (!isMatch) {
        console.log("Invalid credentials for email:", email);
        return res.status(400).json({ message: "Invalid credentials" });
      }

      // Get the user's role
      console.log("Fetching user role from database");
      db.query(
        "SELECT role_name FROM Role INNER JOIN UserRole ON Role.role_id = UserRole.role_id WHERE user_id = ?",
        [user.user_id],
        (err, roleResult) => {
          if (err) {
            console.error("Error fetching role:", err);
            return res.status(500).json({ message: "Server error" });
          }

          const role = roleResult[0]?.role_name || "user"; // Default role if no role found
          console.log("User role fetched:", role);

          // Create JWT token with role info
          const token = jwt.sign(
            { userId: user.user_id, email: user.email, role: role },
            JWT_SECRET,
            { expiresIn: "1h" } // Token expiration time (1 hour)
          );

          // Log the generated token for debugging purposes
          console.log("Generated JWT token:", token); // Debugging line to log the token

          console.log("Login successful for user:", email);
          // Send JWT token and role info in the response
          res.status(200).json({
            message: "Login successful",
            token, // Send JWT token in the response
            role, // Send user role in the response
          });
        }
      );
    });
  });
};
