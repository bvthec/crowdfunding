'use strict';
import bcrypt from 'bcrypt';

export async function hash(text) {
    const salt = 12;
    return await bcrypt.hash(text, salt);
}

export async function compareHash(text, hash) {
    return await bcrypt.compare(text, hash);
}

export default {
    hash,
    compareHash,
}