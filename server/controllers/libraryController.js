import { executeQuery } from '../config/db.js';

export async function getLibraryData(req, res) {
  try {
    // Group books by title+author so copies are counted, not listed individually
    const booksRes = await executeQuery(
      `SELECT MIN(bookid) AS id, title, author,
              COUNT(*) AS total_copies,
              SUM(CASE WHEN availabilitystatus = 'Available' THEN 1 ELSE 0 END) AS available_copies
       FROM BOOK
       GROUP BY title, author
       ORDER BY MIN(bookid)`
    );
    const studentsRes = await executeQuery(`SELECT studentid AS id, fullname AS name FROM STUDENT`);
    const txRes = await executeQuery(
      `SELECT t.transactionid AS id, t.bookid AS book_id, b.title as book_title, s.fullname AS student_name, 
              t.transactionstatus AS status, TO_CHAR(t.issuedate, 'YYYY-MM-DD') AS transaction_date 
       FROM LIBRARY_TRANSACTION t 
       JOIN BOOK b ON t.bookid = b.bookid
       JOIN STUDENT s ON t.studentid = s.studentid
       ORDER BY t.transactionid DESC`
    );

    res.json({
      books: booksRes.rows.map(b => ({
        id: Number(b.ID),
        title: b.TITLE,
        author: b.AUTHOR,
        totalCopies: Number(b.TOTAL_COPIES),
        available: Number(b.AVAILABLE_COPIES)
      })),
      students: studentsRes.rows.map(s => ({
        id: s.ID,
        name: s.NAME
      })),
      transactions: txRes.rows.map(t => ({
        id: t.ID,
        bookId: t.BOOK_ID,
        book: t.BOOK_TITLE,
        user: t.STUDENT_NAME,
        status: t.STATUS,
        date: t.TRANSACTION_DATE
      }))
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function addBook(req, res) {
  const { title, author, available } = req.body;
  try {
    const copies = parseInt(available, 10) || 1;
    
    // Get starting ID — cast Oracle number to JS integer explicitly
    const maxIdRes = await executeQuery('SELECT NVL(MAX(bookid), 0) AS max_id FROM BOOK');
    const startId = Number(maxIdRes.rows[0].MAX_ID);

    for (let i = 0; i < copies; i++) {
      const nextId = startId + i + 1;
      const isbn = `ISBN${nextId.toString().padStart(3, '0')}`;
      const status = 'Available';

      await executeQuery(
        `INSERT INTO BOOK (bookid, isbn, title, author, category, availabilitystatus) 
         VALUES (:nextId, :isbn, :title, :author, 'General', :status)`,
        { nextId, isbn, title, author, status }
      );
    }

    res.json({ success: true, message: `Book '${title}' added with ${copies} cop${copies === 1 ? 'y' : 'ies'} successfully!` });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function issueBook(req, res) {
  const { bookTitle, studentName } = req.body;
  try {
    // 1. Resolve student ID
    const studentRes = await executeQuery(
      'SELECT studentid FROM STUDENT WHERE fullname = :studentName', 
      { studentName }
    );
    if (studentRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Student '${studentName}' not found.` });
    }
    const studentId = studentRes.rows[0].STUDENTID;

    // 2. Find an available copy of this book by title
    const bookRes = await executeQuery(
      `SELECT bookid FROM BOOK WHERE title = :bookTitle AND availabilitystatus = 'Available' AND ROWNUM = 1`,
      { bookTitle }
    );

    if (bookRes.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'No available copies of this book.' });
    }
    const bookId = Number(bookRes.rows[0].BOOKID);

    // 3. Insert transaction
    const nextTxIdRes = await executeQuery('SELECT NVL(MAX(transactionid), 0) + 1 AS next_id FROM LIBRARY_TRANSACTION');
    const nextTxId = Number(nextTxIdRes.rows[0].NEXT_ID);

    await executeQuery(
      `INSERT INTO LIBRARY_TRANSACTION (transactionid, studentid, bookid, librarianid, issuedate, duedate, transactionstatus) 
       VALUES (:nextTxId, :studentId, :bookId, 1, SYSDATE, SYSDATE + 14, 'Issued')`,
      { nextTxId, studentId, bookId }
    );

    // 4. Update that specific copy's availability status
    await executeQuery(
      `UPDATE BOOK SET availabilitystatus = 'Issued' WHERE bookid = :bookId`,
      { bookId }
    );

    res.json({ success: true, message: 'Book issued successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function returnBook(req, res) {
  const { transactionId } = req.body;
  try {
    // 1. Get transaction info
    const txRes = await executeQuery(
      `SELECT bookid, transactionstatus FROM LIBRARY_TRANSACTION WHERE transactionid = :transactionId`,
      { transactionId }
    );

    if (txRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }

    if (txRes.rows[0].TRANSACTIONSTATUS === 'Returned') {
      return res.status(400).json({ success: false, message: 'Book has already been returned.' });
    }

    const bookId = txRes.rows[0].BOOKID;

    // 2. Update transaction status
    await executeQuery(
      `UPDATE LIBRARY_TRANSACTION SET transactionstatus = 'Returned', returndate = SYSDATE WHERE transactionid = :transactionId`,
      { transactionId }
    );

    // 3. Increment book availability
    await executeQuery(
      `UPDATE BOOK SET availabilitystatus = 'Available' WHERE bookid = :bookId`,
      { bookId }
    );

    res.json({ success: true, message: 'Book returned successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function borrowBook(req, res) {
  const { bookTitle, studentId } = req.body;
  try {
    const sId = parseInt(studentId, 10);

    if (!bookTitle || isNaN(sId)) {
      return res.status(400).json({ success: false, message: 'Invalid bookTitle or studentId parameters.' });
    }

    // 1. Find an available copy of this book by title
    const bookRes = await executeQuery(
      `SELECT bookid FROM BOOK WHERE title = :bookTitle AND availabilitystatus = 'Available' AND ROWNUM = 1`,
      { bookTitle }
    );

    if (bookRes.rows.length === 0) {
      return res.status(400).json({ success: false, message: 'No available copies of this book.' });
    }
    const bId = Number(bookRes.rows[0].BOOKID);

    // 2. Insert transaction with Requested status
    const nextTxIdRes = await executeQuery('SELECT NVL(MAX(transactionid), 0) + 1 AS next_id FROM LIBRARY_TRANSACTION');
    const nextTxId = Number(nextTxIdRes.rows[0].NEXT_ID);

    await executeQuery(
      `INSERT INTO LIBRARY_TRANSACTION (transactionid, studentid, bookid, issuedate, transactionstatus) 
       VALUES (:nextTxId, :sId, :bId, SYSDATE, 'Requested')`,
      { nextTxId, sId, bId }
    );

    // 3. Update that specific copy's availability to Requested (reserving it)
    await executeQuery(
      `UPDATE BOOK SET availabilitystatus = 'Requested' WHERE bookid = :bId`,
      { bId }
    );

    res.json({ success: true, message: 'Borrow request submitted for approval!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}


export async function updateBook(req, res) {
  const { id } = req.params;
  const { title, author, available } = req.body;
  try {
    const origRes = await executeQuery(`SELECT title, author FROM BOOK WHERE bookid = :id`, { id });
    if (origRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Book group not found.' });
    }
    const origTitle = origRes.rows[0].TITLE;
    const origAuthor = origRes.rows[0].AUTHOR;

    // 1. Update title and author of all existing copies
    await executeQuery(
      `UPDATE BOOK SET title = :title, author = :author WHERE title = :origTitle AND author = :origAuthor`,
      { title, author, origTitle, origAuthor }
    );

    // 2. Adjust copy count if 'available' (total copies) is provided and changed
    if (available !== undefined) {
      const newCopiesCount = parseInt(available, 10);
      if (!isNaN(newCopiesCount) && newCopiesCount > 0) {
        const countRes = await executeQuery(
          `SELECT COUNT(*) AS count FROM BOOK WHERE title = :title AND author = :author`,
          { title, author }
        );
        const currentCount = Number(countRes.rows[0].COUNT);

        if (newCopiesCount > currentCount) {
          // Add copies
          const diff = newCopiesCount - currentCount;
          const maxIdRes = await executeQuery('SELECT NVL(MAX(bookid), 0) AS max_id FROM BOOK');
          const startId = Number(maxIdRes.rows[0].MAX_ID);

          for (let i = 0; i < diff; i++) {
            const nextId = startId + i + 1;
            const isbn = `ISBN${nextId.toString().padStart(3, '0')}`;
            const status = 'Available';

            await executeQuery(
              `INSERT INTO BOOK (bookid, isbn, title, author, category, availabilitystatus) 
               VALUES (:nextId, :isbn, :title, :author, 'General', :status)`,
              { nextId, isbn, title, author, status }
            );
          }
        } else if (newCopiesCount < currentCount) {
          // Remove copies (only remove 'Available' copies first to avoid breaking active issues/transactions)
          const diff = currentCount - newCopiesCount;
          
          const availCopiesRes = await executeQuery(
            `SELECT bookid FROM BOOK WHERE title = :title AND author = :author AND availabilitystatus = 'Available'`,
            { title, author }
          );
          
          const idsToRemove = availCopiesRes.rows.slice(0, diff).map(r => r.BOOKID);
          if (idsToRemove.length > 0) {
            const placeHolders = idsToRemove.map((_, i) => `:id${i}`).join(', ');
            const binds = {};
            idsToRemove.forEach((id, i) => { binds[`id${i}`] = id; });

            // Delete transactions for these copies
            await executeQuery(
              `DELETE FROM LIBRARY_TRANSACTION WHERE bookid IN (${placeHolders})`,
              binds
            );

            // Delete copies
            await executeQuery(
              `DELETE FROM BOOK WHERE bookid IN (${placeHolders})`,
              binds
            );
          }
        }
      }
    }

    res.json({ success: true, message: 'Book updated successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function deleteBook(req, res) {
  const { id } = req.params;
  try {
    const origRes = await executeQuery(`SELECT title, author FROM BOOK WHERE bookid = :id`, { id });
    if (origRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Book group not found.' });
    }
    const origTitle = origRes.rows[0].TITLE;
    const origAuthor = origRes.rows[0].AUTHOR;

    await executeQuery(
      `DELETE FROM LIBRARY_TRANSACTION WHERE bookid IN (SELECT bookid FROM BOOK WHERE title = :origTitle AND author = :origAuthor)`,
      { origTitle, origAuthor }
    );

    await executeQuery(
      `DELETE FROM BOOK WHERE title = :origTitle AND author = :origAuthor`,
      { origTitle, origAuthor }
    );

    res.json({ success: true, message: 'Book deleted successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function approveBorrowRequest(req, res) {
  const { id } = req.params;
  try {
    const txId = parseInt(id, 10);
    if (isNaN(txId)) {
      return res.status(400).json({ success: false, message: 'Invalid transaction ID.' });
    }

    const txRes = await executeQuery(
      `SELECT bookid, transactionstatus FROM LIBRARY_TRANSACTION WHERE transactionid = :txId`,
      { txId }
    );

    if (txRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }

    if (txRes.rows[0].TRANSACTIONSTATUS !== 'Requested') {
      return res.status(400).json({ success: false, message: `Only pending requests can be approved. Current status: ${txRes.rows[0].TRANSACTIONSTATUS}` });
    }

    const bookId = Number(txRes.rows[0].BOOKID);

    // Update transaction status to Issued and set duedate
    await executeQuery(
      `UPDATE LIBRARY_TRANSACTION 
       SET transactionstatus = 'Issued', issuedate = SYSDATE, duedate = SYSDATE + 14 
       WHERE transactionid = :txId`,
      { txId }
    );

    // Update book status to Issued
    await executeQuery(
      `UPDATE BOOK SET availabilitystatus = 'Issued' WHERE bookid = :bookId`,
      { bookId }
    );

    res.json({ success: true, message: 'Borrow request approved successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function rejectBorrowRequest(req, res) {
  const { id } = req.params;
  try {
    const txId = parseInt(id, 10);
    if (isNaN(txId)) {
      return res.status(400).json({ success: false, message: 'Invalid transaction ID.' });
    }

    const txRes = await executeQuery(
      `SELECT bookid, transactionstatus FROM LIBRARY_TRANSACTION WHERE transactionid = :txId`,
      { txId }
    );

    if (txRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Transaction not found.' });
    }

    if (txRes.rows[0].TRANSACTIONSTATUS !== 'Requested') {
      return res.status(400).json({ success: false, message: `Only pending requests can be rejected. Current status: ${txRes.rows[0].TRANSACTIONSTATUS}` });
    }

    const bookId = Number(txRes.rows[0].BOOKID);

    // Update transaction status to Rejected
    await executeQuery(
      `UPDATE LIBRARY_TRANSACTION 
       SET transactionstatus = 'Rejected' 
       WHERE transactionid = :txId`,
      { txId }
    );

    // Revert book status to Available
    await executeQuery(
      `UPDATE BOOK SET availabilitystatus = 'Available' WHERE bookid = :bookId`,
      { bookId }
    );

    res.json({ success: true, message: 'Borrow request rejected successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}


