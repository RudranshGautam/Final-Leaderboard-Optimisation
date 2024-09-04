const express = require('express');
const expenseController = require('../controllers/expenseController');

const router = express.Router();

// Middleware to check if the user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    }
    res.redirect('/auth/login');
}

// Apply the middleware to protect the routes
router.get('/', isAuthenticated, expenseController.getExpensePage);
router.post('/add', isAuthenticated, expenseController.addExpense);
router.get('/delete/:id', isAuthenticated, expenseController.deleteExpense);

// Route for the Buy Premium feature
router.get('/buy-premium', isAuthenticated, (req, res) => {
    res.send('Premium feature coming soon!');
});

module.exports = router;
