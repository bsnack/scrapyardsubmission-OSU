// server.js - Main server file with email integration
// INSTRUCTIONS:
// 1. Save this file as "server.js" in the root directory of your project
// 2. Run "npm install express body-parser nodemailer" in the terminal
// 3. Start the server with "node server.js"

const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const fs = require('fs');

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Load config file if it exists, otherwise create default
let config = { 
  emails: [],
  emailSettings: {
    service: 'gmail',  // Can be 'gmail', 'outlook', 'yahoo', etc.
    user: '',          // Your email address
    pass: ''           // Your email password or app password
  }
};

const CONFIG_FILE = path.join(__dirname, 'email-config.json');

if (fs.existsSync(CONFIG_FILE)) {
  try {
    config = JSON.parse(fs.readFileSync(CONFIG_FILE));
    console.log("Loaded config file successfully");
  } catch (error) {
    console.error("Error loading config file:", error);
    // Create default config file if the existing one is corrupted
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
  }
} else {
  console.log("Config file not found, creating default");
  // Create default config file
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

// Create email transporter (will be initialized once settings are provided)
let transporter = null;

function setupTransporter() {
  if (!config.emailSettings.user || !config.emailSettings.pass) {
    console.log('Email settings not configured yet');
    return false;
  }
  
  try {
    transporter = nodemailer.createTransport({
      service: config.emailSettings.service,
      auth: {
        user: config.emailSettings.user,
        pass: config.emailSettings.pass
      }
    });
    console.log('Email transporter configured');
    return true;
  } catch (error) {
    console.error('Failed to set up email transporter:', error);
    return false;
  }
}

// Try to set up transporter on startup
setupTransporter();

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

// API route for handling miss events and sending emails
app.post('/api/miss-email', async (req, res) => {
  try {
    const { message, missType, gameMode, score, combo } = req.body;
    
    // Generate a varied email subject
    let emailSubject = '';
    const subjectTypes = [
      `Osu! Alert: ${missType} Miss`,
      `Oh no! A miss in Osu!`,
      `Osu! Game Update`,
      `Your friend missed in Osu!`,
      `Osu! Score Update: ${score} points`
    ];

    // Random subject based on current time to ensure variety
    const randomIndex = Math.floor(Date.now() % subjectTypes.length);
    emailSubject = subjectTypes[randomIndex];

    // Optionally add a timestamp or unique identifier to prevent email threading
    const timestamp = new Date().getTime() % 10000; // Last 4 digits of timestamp
    emailSubject += ` #${timestamp}`;
    
    // Format the email body
    const emailBody = `${message} (Score: ${score}, Mode: ${gameMode})`;
    
    // Log the message
    console.log(`Email message: ${emailBody}`);
    
    // If no emails are configured yet
    if (config.emails.length === 0) {
      console.log("No email recipients configured yet. Message not sent.");
      return res.json({ 
        success: false, 
        message: "No email recipients configured yet. Add some in the settings." 
      });
    }
    
    // If transporter not set up yet
    if (!transporter) {
      const isSetup = setupTransporter();
      if (!isSetup) {
        return res.json({
          success: false,
          message: "Email service not configured yet. Set it up in the settings."
        });
      }
    }
    
    // Send to all configured emails
    const mailOptions = {
      from: config.emailSettings.user,
      to: config.emails.map(email => email.address).join(','),
      subject: emailSubject,
      text: emailBody
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Emails sent:', info.response);
    
    res.json({ 
      success: true, 
      message: `Email sent to ${config.emails.length} recipient(s)` 
    });
    
  } catch (error) {
    console.error('Error sending emails:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API route to add a new email recipient
app.post('/api/add-email', (req, res) => {
  try {
    const { address, name } = req.body;
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!address || !emailRegex.test(address)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid email address format' 
      });
    }
    
    // Check if already exists
    if (config.emails.some(email => email.address === address)) {
      return res.status(400).json({
        success: false,
        error: 'This email address is already in the list'
      });
    }
    
    // Add to config
    config.emails.push({
      address,
      name: name || `Contact ${config.emails.length + 1}`
    });
    
    // Save config
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    
    res.json({ success: true, emails: config.emails });
  } catch (error) {
    console.error('Error adding email:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API route to add multiple email recipients at once
app.post('/api/add-bulk-recipients', (req, res) => {
  try {
    const { contacts } = req.body;
    
    if (!contacts || !Array.isArray(contacts) || contacts.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'No valid contacts provided' 
      });
    }
    
    let addedCount = 0;
    
    // Process each contact
    contacts.forEach(contact => {
      const { name, email } = contact;
      
      // Basic validation
      if (!name || !email) return;
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) return;
      
      // Check if email already exists
      const existingEmail = config.emails.find(e => e.address === email);
      if (existingEmail) return;
      
      // Add to config
      config.emails.push({
        address: email,
        name: name,
        confirmed: true // Mark as pre-confirmed
      });
      
      addedCount++;
    });
    
    // Save config if any contacts were added
    if (addedCount > 0) {
      fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    }
    
    res.json({ 
      success: true, 
      added: addedCount,
      message: `Added ${addedCount} recipients successfully` 
    });
    
  } catch (error) {
    console.error('Error adding bulk recipients:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API route to update email settings
app.post('/api/update-email-settings', (req, res) => {
  try {
    const { service, user, pass } = req.body;
    
    if (!service || !user || !pass) {
      return res.status(400).json({
        success: false,
        error: 'All email settings fields are required'
      });
    }
    
    // Update config
    config.emailSettings = { service, user, pass };
    
    // Save config
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    
    // Try to set up the transporter with new settings
    const isSetup = setupTransporter();
    
    if (isSetup) {
      res.json({ success: true, message: 'Email settings updated successfully' });
    } else {
      res.status(400).json({ 
        success: false, 
        error: 'Failed to set up email with these settings. Please check your credentials.' 
      });
    }
  } catch (error) {
    console.error('Error updating email settings:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API route to remove an email
app.post('/api/remove-email', (req, res) => {
  try {
    const { index } = req.body;
    
    if (index < 0 || index >= config.emails.length) {
      return res.status(400).json({ success: false, error: 'Invalid email index' });
    }
    
    // Remove from config
    config.emails.splice(index, 1);
    
    // Save config
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    
    res.json({ success: true, emails: config.emails });
  } catch (error) {
    console.error('Error removing email:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API to get all emails
app.get('/api/emails', (req, res) => {
  console.log("API call to /api/emails");
  console.log("Current config:", config);
  
  // Return emails (can be shown directly as they're intended to be visible)
  res.json(config.emails);
  
  console.log("Sent emails:", config.emails);
});

// API to get email settings (partially masked for security)
app.get('/api/email-settings', (req, res) => {
  console.log("API call to /api/email-settings");
  
  const settings = {
    service: config.emailSettings.service,
    user: config.emailSettings.user,
    pass: config.emailSettings.user && config.emailSettings.pass ? '********' : ''
  };
  
  res.json(settings);
  console.log("Sent settings (masked):", settings);
});

// Settings page route
app.get('/settings', (req, res) => {
  console.log("Request for settings page");
  res.sendFile(path.join(__dirname, 'public', 'settings.html'));
});

// Serve the game
app.get('/', (req, res) => {
  console.log("Request for game page");
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Configure email settings at http://localhost:${PORT}/settings`);
});