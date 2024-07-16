const express = require("express");
const nodemailer = require("nodemailer");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const sql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { dbUsers } = require("./database/dbUsers");
const { dbDonations } = require("./database/dbDonations");
const { dbRegistrations } = require("./database/dbRegistrations");

const app = express();
const port = process.env.PORT || 5000;

// Express Middleware
app.use(cookieParser());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route to generate and preview certificate
app.post("/api/previewCertificate", async (req, res) => {
  const { name, date, gender, template, internship, period, grade } = req.body;
  let outputPath = path.join(__dirname, "certificates", "output", `${name}-certificate.jpg`);
  let command = '';

  if (template === 'template1') {
    command = `python generate_certificate.py "${name}" "${date}" "${gender}" "${outputPath}"`;
  } else if (template === 'template2') {
    command = `python generate_certificate_of_experience.py "${name}" "${date}" "${internship}" "${period}" "${grade}" "${gender}" "${outputPath}"`;
  } else if (template === 'template3') {
    command = `python generate_certificate_of_appreciation.py "${name}" "${date}" "${gender}" "${outputPath}"`;
  }

  try {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error generating certificate: ${error.message}`);
        return res.status(500).json({ message: "Failed to generate certificate" });
      }
      if (stderr) {
        console.error(`Error: ${stderr}`);
        return res.status(500).json({ message: "Failed to generate certificate" });
      }
      res.status(200).json({ previewUrl: `http://localhost:${port}/certificates/output/${name}-certificate.jpg` });
    });
  } catch (error) {
    console.error("Error generating certificate", error);
    res.status(500).json({ message: "Failed to generate certificate" });
  }
});

// Route to send the certificate via email
app.post("/api/sendCertificate", async (req, res) => {
  const { email, name, date, gender, template, internship, period, grade } = req.body;
  let outputPath = path.join(__dirname, "certificates", "output", `${name}-certificate.jpg`);
  let command = '';
  let subject = '';
  let message = '';

  if (template === 'template1') {
    command = `python generate_certificate.py "${name}" "${date}" "${gender}" "${outputPath}"`;
    subject = "Letter of Recommendation 💌";
    message = `Dear ${name},\n\nThank you for your valuable contribution to Kshitiksha Foundation. Please find your Letter of Recommendation attached here with this email.\n\nThanks & Best Regards,\nTeam Kshitiksha ❤`;
  } else if (template === 'template2') {
    command = `python generate_certificate_of_experience.py "${name}" "${date}" "${internship}" "${period}" "${grade}" "${gender}" "${outputPath}"`;
    subject = "Certificate of Experience❤";
    message = `Dear ${name},\n\nThank you for your valuable contribution to Kshitiksha Foundation. Please find your Certificate of Experience attached here with this email.\n\nThanks & Best Regards,\nTeam Kshitiksha ❤`;
  } else if (template === 'template3') {
    command = `python generate_certificate_of_appreciation.py "${name}" "${date}" "${gender}" "${outputPath}"`;
    subject = "Certificate of Appreciation ❤";
    message = `Dear ${name},\n\nThank you for your valuable contribution to Kshitiksha Foundation. Please find your Certificate of Appreciation attached here with this email.\n\nThanks & Best Regards,\nTeam Kshitiksha ❤`;
  }

  exec(command, async (error, stdout, stderr) => {
    if (error) {
      console.error(`Error generating certificate: ${error.message}`);
      return res.status(500).json({ message: "Failed to generate certificate" });
    }
    if (stderr) {
      console.error(`Error: ${stderr}`);
      return res.status(500).json({ message: "Failed to generate certificate" });
    }
    try {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "vipin333kvk@gmail.com",
          pass: "dlhv jqsm mmew qhto",
        },
      });

      const mailOptions = {
        from: "kf@gmail.com",
        to: email,
        subject: subject,
        text: message,
        attachments: [
          {
            filename: `${name}-certificate.jpg`,
            path: outputPath,
          },
        ],
      };

      // Send the email
      await transporter.sendMail(mailOptions);

      res.status(200).json({ message: "Certificate sent successfully!" });
    } catch (error) {
      console.error("Error sending certificate", error);
      res.status(500).json({ message: "Failed to send certificate" });
    }
  });
});

// Serve static files
app.use("/certificates/output", express.static(path.join(__dirname, "certificates/output")));

// Database connections
dbUsers.connect((err) => {
  if (err) {
    console.error("Failed to connect to MySQL Users database:", err);
  } else {
    console.log("Connected to MySQL Users database");
  }
});
dbDonations.connect((err) => {
  if (err) {
    console.error("Failed to connect to MySQL Donations database:", err);
  } else {
    console.log("Connected to MySQL Donations database");
  }
});
dbRegistrations.connect((err) => {
  if (err) {
    console.error("Failed to connect to MySQL Registrations database:", err);
  } else {
    console.log("Connected to MySQL Registrations database");
  }
});

// Admin routes
app.post("/adminLogin", async (req, res) => {
  const { username, password } = req.body;
  dbUsers.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, results) => {
      if (err) return res.status(500).json({ auth: false, msg: "Server error" });
      if (results.length === 0) return res.status(401).json({ auth: false, msg: "Invalid username or password" });

      const user = results[0];
      const passwordIsValid = bcrypt.compareSync(password, user.password);

      if (!passwordIsValid) return res.status(401).json({ auth: false, msg: "Invalid username or password" });

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: 86400 }); // 24 hours
      res.cookie("jwt", token, {
        httpOnly: true,
        secure: false,
        maxAge: 1000 * 60 * 60 * 24,
      });
      res.status(200).json({ auth: true });
    }
  );
});

app.post("/adminLogout", async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ message: "Successfully Logged Out" });
});

app.get("/authCheck", async (req, res) => {
  try {
    const token = req.cookies.jwt;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({ auth: true, id: decoded.id });
  } catch (err) {
    res.status(401).json({ auth: false });
  }
});

// ROUTE FOR RECEIVING ALL DONATION DATA
app.get("/getDonations", (req, res) => {
  try {
    const token = req.cookies.jwt;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    dbDonations.query("SELECT * FROM donations", (err, results) => {
      // QUERYING TABLE FOR READ OPERATION
      res.status(200).json(results);
    });
  } catch (e) {
    res.status(401).json({ auth: false });
  }
});

// ROUTE FOR RECEIVING ALL REGISTRATION DATA
app.get("/getRegistrations", (req, res) => {
  try {
    const token = req.cookies.jwt;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    dbRegistrations.query("SELECT * FROM registrations", (err, results) => {
      // QUERYING TABLE FOR READ OPERATION
      res.status(200).json(results);
    });
  } catch (e) {
    res.status(401).json({ auth: false });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
