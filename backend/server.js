const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const app = express();
const PORT = process.env.PORT || 5001;
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

// Connect to the MongoDB database
mongoose.connect('mongodb://localhost:27017/pollit', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
})
  .then(() => console.log('Connected to the database'))
  .catch(error => console.error('Error connecting to the database:', error));

app.use(cors());
app.use(bodyParser.json());

// Schema for Polls
const pollSchema = new mongoose.Schema({
  id: String,
  question: String,
  options: [String],
  singleResponse: Boolean,
  votes: Object,
});

const PollModel = mongoose.model('Poll', pollSchema);

// Function to generate unique IDs
function generateUniqueId() {
  return uuidv4();
}


async function connectToDatabase() {
  try {
    await mongoose.connect('mongodb://localhost:27017/pollit', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    
    console.log('Connected to the database');
  } catch (error) {            


    console.error('Error connecting to the database:', error);
  }
}
connectToDatabase();
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
    const hashedPassword = await bcrypt.hash(password, 10);

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
    const user = await UserModel.findOne({ email });

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

// Endpoint to create a new poll
app.post('/api/createPoll', async (req, res) => {
  const { question, options, responseType } = req.body;

  try {
    const newPoll = new PollModel({
      id: generateUniqueId(),
      question,
      options: options.map(option => option.trim()), // Ensure each option is trimmed
      responseType, // This can be 'single' or 'multiple'
      votes: {},
    });

    await newPoll.save();

    res.json({ success: true, poll: newPoll });
  } catch (error) {
    console.error('Error creating poll:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});


// Endpoint to get all polls
app.get('/api/getPolls', async (req, res) => {
  try {
    const polls = await PollModel.find({});
    res.json({ success: true, polls });
  } catch (error) {
    console.error('Error getting polls:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
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


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Function to generate unique IDs
function generateUniqueId() {
  return uuidv4();
}