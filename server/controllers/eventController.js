import { executeQuery } from '../config/db.js';

export async function getEvents(req, res) {
    try {
        const result = await executeQuery(
            `SELECT id, title, event_date, event_time, event_type, color FROM SCHOOL_EVENT`
        );
        res.json(result.rows.map(e => ({
            id: e.ID,
            title: e.TITLE,
            date: e.EVENT_DATE,
            time: e.EVENT_TIME,
            type: e.EVENT_TYPE,
            color: e.COLOR
        })));
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

export async function addEvent(req, res) {
    const { title, date, time, type } = req.body;
    try {
        const colorsMap = {
            holiday: '#3b82f6',
            meeting: '#f97316',
            activity: '#5b5fc7',
            exam: '#ef4444'
        };
        const color = colorsMap[type] || '#64748b';
        const nextIdRes = await executeQuery('SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM SCHOOL_EVENT');
        const id = nextIdRes.rows[0].NEXT_ID;

        await executeQuery(
            `INSERT INTO SCHOOL_EVENT (id, title, event_date, event_time, event_type, color)
       VALUES (:p_id, :p_title, :p_date, :p_time, :p_type, :p_color)`,
            { p_id: id, p_title: title, p_date: date, p_time: time, p_type: type, p_color: color }
        );
        res.json({ success: true, message: 'Event added successfully!', event: { id, title, date, time, type, color } });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}

export async function deleteEvent(req, res) {
    const { id } = req.params;
    try {
        await executeQuery('DELETE FROM SCHOOL_EVENT WHERE id = :id', { id: parseInt(id) });
        res.json({ success: true, message: 'Event deleted successfully!' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
}
