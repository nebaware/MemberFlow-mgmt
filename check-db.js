const Database = require('better-sqlite3');
try {
    const dbPath = 'd:\\studio-master\\azmera.db';
    console.log('Checking DB at:', dbPath);
    const db = new Database(dbPath, { readonly: false, fileMustExist: false }); // Allow creating if missing to test permissions

    // List tables
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log('Tables:', tables.map(t => t.name));

    if (tables.some(t => t.name === 'users')) {
        const users = db.prepare("SELECT id, email, role, password_hash, verified FROM users").all();
        console.log('Users in DB:', users.length, users);
    } else {
        console.log('Table "users" does not exist.');
    }

} catch (e) {
    console.error('DB Check Failed:', e);
}
