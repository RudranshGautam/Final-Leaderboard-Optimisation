const path = require('path');
const bcrypt = require('bcryptjs');
const db = require('../db');

exports.getSignupPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../views/signup.html'));
};

exports.signup = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).send('All fields are required');
    }

    try {
        // Check if email already exists
        const [existingUser] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).send('Email is already registered');
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        await db.execute('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hashedPassword]);
        res.redirect('/auth/login');
    } catch (err) {
        console.error('Error during signup:', err); // Log the error for debugging
        res.status(500).send('Error during signup. Please try again.');
    }
};

exports.getLoginPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../views/login.html'));
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send('Both email and password are required');
    }

    try {
        const [users] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).send('Invalid email or password');
        }

        const user = users[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (isPasswordValid) {
            req.session.user = user; // Store user data in session
            res.redirect('/expenses');
        } else {
            res.status(401).send('Invalid email or password');
        }
    } catch (err) {
        console.error('Error during login:', err); // Log the error for debugging
        res.status(500).send('Error during login. Please try again.');
    }
};
