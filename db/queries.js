import { check } from "express-validator";
import { db } from "./pools.js";

async function checkUsernameUsed(username) {
    try {
        const { rows } = await db.query("SELECT * FROM users WHERE username=$1", [username]);
        return rows.length > 0;
    } catch (error) {
        console.error('Query failed due to database error:', error.message);
    }
}

export {
    checkUsernameUsed
}

