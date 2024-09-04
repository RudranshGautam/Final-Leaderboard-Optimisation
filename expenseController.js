const path = require('path');
const db = require('../db');

// Function to update total_amount for a user
async function updateTotalAmount(userId) {
    try {
        // Calculate the new total amount
        const [[totalAmountResult]] = await db.execute(`
            SELECT SUM(amount) AS total_amount
            FROM expenses
            WHERE user_id = ?
        `, [userId]);

        const totalAmount = totalAmountResult.total_amount || 0;

        // Update total_amount in the expense_summaries table for the user
        await db.execute(`
            INSERT INTO expense_summaries (user_id, total_amount)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE total_amount = VALUES(total_amount)
        `, [userId, totalAmount]);
    } catch (err) {
        console.error('Error updating total amount:', err);
        throw err;
    }
}

exports.getExpensePage = async (req, res) => {
    const userId = req.session.user.id;
    try {
        // Retrieve all expenses for the user
        const [expenses] = await db.execute(`
            SELECT * FROM expenses WHERE user_id = ?
        `, [userId]);

        // Retrieve total amount for the user from the summary table
        const [[totalAmountResult]] = await db.execute(`
            SELECT total_amount FROM expense_summaries
            WHERE user_id = ?
        `, [userId]);

        const totalAmount = totalAmountResult ? totalAmountResult.total_amount : 0;

        // Return expenses data and total amount
        res.json({ expenses, totalAmount });
    } catch (err) {
        console.error('Error fetching expenses:', err);
        res.status(500).send('Error fetching expenses. Please try again.');
    }
};

exports.addExpense = async (req, res) => {
    const { amount, description, category } = req.body;
    const userId = req.session.user.id;

    if (!amount || isNaN(amount) || !description || !category) {
        return res.status(400).send('Invalid input');
    }

    try {
        // Insert the new expense
        const [result] = await db.execute(
            'INSERT INTO expenses (user_id, amount, description, category) VALUES (?, ?, ?, ?)',
            [userId, amount, description, category]
        );

        // Update total_amount
        await updateTotalAmount(userId);

        // Respond with the new expense
        const newExpense = { id: result.insertId, amount, description, category };
        res.json(newExpense);
    } catch (err) {
        console.error('Error adding expense:', err);
        res.status(500).send('Error adding expense. Please try again.');
    }
};

exports.deleteExpense = async (req, res) => {
    const { id } = req.params;
    const userId = req.session.user.id;

    if (!id || isNaN(id)) {
        return res.status(400).send('Invalid expense ID');
    }

    try {
        // Delete the expense
        const [result] = await db.execute('DELETE FROM expenses WHERE id = ? AND user_id = ?', [id, userId]);

        if (result.affectedRows === 0) {
            return res.status(404).send('Expense not found');
        }

        // Update total_amount
        await updateTotalAmount(userId);

        res.status(200).send('Expense deleted successfully');
    } catch (err) {
        console.error('Error deleting expense:', err);
        res.status(500).send('Error deleting expense. Please try again.');
    }
};
