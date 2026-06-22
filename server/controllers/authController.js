import { executeQuery } from '../config/db.js';

export async function login(req, res) {
  const { username, password } = req.body;
  try {
    const result = await executeQuery(
      `SELECT id, name, username, role, email, avatar_class, initials 
       FROM USERS WHERE LOWER(username) = LOWER(:username) AND password = :password`,
      { username, password }
    );

    if (result.rows.length > 0) {
      // Update last login
      const lastLogin = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      await executeQuery(
        `UPDATE USERS SET last_login = :lastLogin WHERE id = :id`,
        { lastLogin, id: result.rows[0].ID }
      );
      
      const user = result.rows[0];
      res.json({
        success: true,
        user: {
          id: user.ID,
          name: user.NAME,
          username: user.USERNAME,
          role: user.ROLE,
          email: user.EMAIL,
          avatarClass: user.AVATAR_CLASS,
          initials: user.INITIALS,
          lastLogin
        }
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getUsers(req, res) {
  try {
    const result = await executeQuery(`SELECT id, name, username, role, email, last_login FROM USERS`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function updatePassword(req, res) {
  const { userId, currentPassword, newPassword } = req.body;
  try {
    const checkResult = await executeQuery(
      `SELECT password FROM USERS WHERE id = :userId`,
      { userId }
    );
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const currentDbPassword = checkResult.rows[0].PASSWORD || checkResult.rows[0].password;
    if (currentDbPassword !== currentPassword) {
      return res.status(400).json({ success: false, message: 'Incorrect current password' });
    }
    await executeQuery(
      `UPDATE USERS SET password = :newPassword WHERE id = :userId`,
      { newPassword, userId }
    );
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

