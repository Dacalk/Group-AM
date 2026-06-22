import { executeQuery } from '../config/db.js';

export async function getMessages(req, res) {
  try {
    const result = await executeQuery(
      `SELECT id, from_id, from_name, from_role, to_id, to_name, to_role, subject, body, timestamp, is_read, conv_key 
       FROM MESSAGES ORDER BY timestamp ASC`
    );
    res.json(result.rows.map(m => ({
      id: m.ID,
      fromId: String(m.FROM_ID),
      fromName: m.FROM_NAME,
      fromRole: m.FROM_ROLE,
      toId: String(m.TO_ID),
      toName: m.TO_NAME,
      toRole: m.TO_ROLE,
      subject: m.SUBJECT,
      body: m.BODY,
      timestamp: Number(m.TIMESTAMP),
      read: m.IS_READ === 1,
      convKey: m.CONV_KEY
    })));
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * PL/SQL-backed: fetch all users as message recipients.
 * Oracle returns uppercase column names; we map them explicitly.
 */
export async function getRecipients(req, res) {
  try {
    const result = await executeQuery(
      `SELECT u.id        AS user_id,
              u.name      AS name,
              u.role      AS role,
              u.email     AS email,
              u.username  AS username
       FROM   USERS u
       ORDER  BY u.role, u.name`
    );
    // Oracle returns column aliases in UPPERCASE regardless of how they are written
    const recipients = result.rows.map(r => ({
      USER_ID:  String(r.USER_ID),
      NAME:     r.NAME,
      ROLE:     r.ROLE,
      EMAIL:    r.EMAIL,
      USERNAME: r.USERNAME
    }));
    res.json(recipients);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function sendMessage(req, res) {
  const { id, fromId, fromName, fromRole, toId, toName, toRole, subject, body, timestamp, read, convKey } = req.body;
  try {
    // PL/SQL anonymous block for inserting a message — safe prefixed binds avoid ORA-01745
    await executeQuery(
      `BEGIN
         INSERT INTO MESSAGES
           (id, from_id, from_name, from_role, to_id, to_name, to_role,
            subject, body, timestamp, is_read, conv_key)
         VALUES
           (:p_id, :p_from_id, :p_from_name, :p_from_role, :p_to_id, :p_to_name, :p_to_role,
            :p_subject, :p_body, :p_timestamp, :p_is_read, :p_conv_key);
         COMMIT;
       END;`,
      {
        p_id:        id,
        p_from_id:   String(fromId),
        p_from_name: fromName,
        p_from_role: fromRole,
        p_to_id:     String(toId),
        p_to_name:   toName,
        p_to_role:   toRole,
        p_subject:   subject,
        p_body:      body,
        p_timestamp: Number(timestamp),
        p_is_read:   read ? 1 : 0,
        p_conv_key:  convKey
      }
    );
    res.json({ success: true, message: 'Message sent successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function markAsRead(req, res) {
  const { convKey, myId } = req.body;
  try {
    // PL/SQL block to mark messages as read
    await executeQuery(
      `BEGIN
         UPDATE MESSAGES
         SET    is_read = 1
         WHERE  conv_key = :p_conv_key
           AND  (to_id = :p_my_id OR to_id = 'all');
         COMMIT;
       END;`,
      { p_conv_key: convKey, p_my_id: String(myId) }
    );
    res.json({ success: true, message: 'Messages marked as read successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function deleteMessage(req, res) {
  const { id } = req.params;
  try {
    await executeQuery(
      `BEGIN DELETE FROM MESSAGES WHERE id = :p_id; COMMIT; END;`,
      { p_id: id }
    );
    res.json({ success: true, message: 'Message deleted successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function deleteConversation(req, res) {
  const { convKey } = req.body;
  try {
    await executeQuery(
      `BEGIN DELETE FROM MESSAGES WHERE conv_key = :p_conv_key; COMMIT; END;`,
      { p_conv_key: convKey }
    );
    res.json({ success: true, message: 'Conversation deleted successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
