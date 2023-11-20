const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const app = express();
const PORT = process.env.PORT || 5001;
const cors = require('cors');

const { MongoClient } = require('mongodb');

const uri = 'mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.0.2';
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


app.use(cors());
app.use(bodyParser.json());

let polls = [];

// Endpoint to create a new poll
app.post('/api/createPoll', (req, res) => {
  const { question, options, singleResponse } = req.body;
  const newPoll = {
    id: generateUniqueId(),
    question,
    options: options.split(',').map(option => option.trim()),
    singleResponse,
    votes: {},
  };
  polls.push(newPoll);
  res.json({ success: true, poll: newPoll });
});

// Endpoint to get all polls
app.get('/api/getPolls', (req, res) => {
  res.json({ success: true, polls });
});

// Endpoint to handle user votes
app.post('/api/vote', (req, res) => {
  const { pollId, option } = req.body;
  const poll = polls.find(p => p.id === pollId);
  if (!poll) {
    return res.json({ success: false, message: 'Poll not found' });
  }
  
  res.json({ success: true, updatedPoll: poll });
});

async function connectToDatabase() {
  try {
    await client.connect();
    console.log('Connected to the database');
  } catch (error) {
    console.error('Error connecting to the database:', error);
  }
}

connectToDatabase();

mongoose.connect('mongodb://localhost:27017/pollit', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const UserModel = mongoose.model('User', userSchema);

app.post('/api/register', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      return res.json({ success: false, message: 'User with this email already exists' });
    }

    // Hash and salt the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10); // Adjust the salt rounds as needed

    // If the user doesn't exist, proceed with registration
    const newUser = new UserModel({ email, password: hashedPassword });
    await newUser.save();

    return res.json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    console.error('Error during registration:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


// Login route
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Retrieve user data from the database
    const user = await client.db('pollit').collection('users').findOne({ email });

    if (!user) {
      res.json({ success: false, message: 'User not found' });
      return;
    }

    // Compare hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (passwordMatch) {
      res.json({ success: true, message: 'Login successful' });
    } else {
      res.json({ success: false, message: 'Incorrect password' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.json({ success: false, message: 'Login failed' });
  }
});
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});