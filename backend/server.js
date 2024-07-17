const express = require("express");
const nodemailer = require("nodemailer");
const { exec } = require("child_process");
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
app.use(cors({ origin: "//admin.kshitiksha.xyz", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "public")));
app.use("/certificates/output", express.static(path.join(__dirname, "certificates/output")));

// Function to generate certificate and return output path
async function generateCertificate(name, date, gender, template, internship, period, periodFromDate, periodToDate, grade) {
  let outputPath = path.join(__dirname, "certificates", "output", `${name}-certificate.jpg`);
  let command = '';

  if (template === 'template1') {
    command = `python3 generate_certificate.py "${name}" "${date}" "${gender}" "${outputPath}"`;
  } else if (template === 'template2') {
    command = `python3 generate_certificate_of_experience.py "${name}" "${internship}" "${period}" "${periodFromDate}" "${periodToDate}" "${grade}" "${gender}" "${outputPath}"`;
  } else if (template === 'template3') {
    command = `python3 generate_certificate_of_appreciation.py "${name}" "${date}" "${gender}" "${outputPath}"`;
  }

  try {
    await new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(`Error generating certificate: ${error.message}`);
          reject(error);
        }
        if (stderr) {
          console.error(`Error: ${stderr}`);
          reject(stderr);
        }
        resolve(outputPath);
      });
    });
    return outputPath;
  } catch (error) {
    throw new Error(`Error generating certificate: ${error.message}`);
  }
}

// Route to generate and preview certificate
app.post("/api/previewCertificate", async (req, res) => {
  const { name, date, gender, template, internship, period, periodFromDate, periodToDate, grade } = req.body;

  try {
    const outputPath = await generateCertificate(name, date, gender, template, internship, period, periodFromDate, periodToDate, grade);
    res.status(200).json({ previewUrl: `http://admin.kshitiksha.xyz/certificates/output/${name}-certificate.jpg` });
  } catch (error) {
    console.error("Error generating certificate", error);
    res.status(500).json({ message: "Failed to generate certificate" });
  }
});

// Route to send the certificate via email
app.post("/api/sendCertificate", async (req, res) => {
  const { email, name, date, gender, template, internship, period, periodFromDate, periodToDate, grade } = req.body;

  try {
    const outputPath = await generateCertificate(name, date, gender, template, internship, period, periodFromDate, periodToDate, grade);

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'ksfoundation19@gmail.com',
        pass: 'cryq olvy tqcm dzbv',
      }
    });

    const mailOptions = {
      from: "ksfoundation19@gmail.com",
      to: email,
      subject: getSubject(template),
      text: getMessage(template, name),
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
    console.error("Error sending certificate", error); // Log detailed error for debugging
    res.status(500).json({ message: "Failed to send certificate" });
  }
});


// Helper function to get email subject based on template
function getSubject(template) {
  switch (template) {
    case 'template1':
      return "Letter of Recommendation 💌";
    case 'template2':
      return "Thank you for your valuable contribution to Kshitiksha Foundation";
    case 'template3':
      return "Certificate of Appreciation ❤";
    default:
      return "Certificate from Kshitiksha Foundation";
  }
}

// Helper function to get email message based on template
function getMessage(template, name) {
  switch (template) {
    case 'template1':
      return `Dear ${name},\n\nThank you for your valuable contribution to Kshitiksha Foundation. Please find your Letter of Recommendation attached here with this email.\n\nThanks & Best Regards,\nTeam Kshitiksha ❤`;
    case 'template2':
      return `Dear ${name},\n\nI would like to take this opportunity on behalf of the entire team of Kshitiksha Foundation, to thank you for the hard work that you put in this internship. It was a pleasure working with you, and I sincerely hope that your experiences at our Organisation were engaging and edifying. I took this opportunity to speak to your Relationship Manager, Ms Kiran Goel, and I am proud to say her feedback for you were universally positive.\n\nAs everyone knows, our interns are known for being the brightest of their classes, and the most likely of their peers to succeed in their life-goals. We thank you for not letting us down. You have made meaningful contributions to your division.\n\nThank you again for participating in our internship program. I do hope that our paths will cross again in the future.\n\nAt the end, I wish you all the very best for your future. May your talent, skills and hard work be useful for India some day, and every day.\n\nPlease find your Internship Certificates, Letter of Recommendation & Certificate of Appreciation attached here with.\n\nThanks & Best Regards,\nDeepak Kumar\nDirector\nKshitiksha Foundation\nNoida`;
    case 'template3':
      return `Dear ${name},\n\nThank you for your valuable contribution to Kshitiksha Foundation. Please find your Certificate of Appreciation attached here with this email.\n\nThanks & Best Regards,\nTeam Kshitiksha ❤`;
    default:
      return `Dear ${name},\n\nPlease find your certificate attached here with this email.\n\nThanks & Best Regards,\nTeam Kshitiksha ❤`;
  }
}

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

// Catch-all route to serve the frontend application
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
