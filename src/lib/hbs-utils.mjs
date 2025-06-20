'use strict';
import { formatCurrency as format } from './utils.mjs';

// handlebars helper functions
function formatCurrency(value, options) {
    return format(value);
}

function equals(obj1, obj2) {
    return obj1 == obj2;
}

function translate(word) {
    // translate in PT status name
    const words = {
        'pending':'Pendente',
        'approved':'Aprovado',
        'funded':'Financiado',
        'rejected':'Rejeitado',
    }

    return words[word] ? words[word] : word;
}

function cardDate(date) {
    let [year, month, day] = date.split('-');
    return `${month}/${year}`;
}

function onlyDate(datetime) {
    datetime = new Date(datetime);
    const out = `${datetime.getDate()}-${datetime.getMonth()+1}-${datetime.getFullYear()}`;
    return out;
}

function section(name, options) {
    if (!this._sections) this._sections = {};
    this._sections[name] = options.fn(this);
}

function shortText(text, maxLength, options) {
    if (options == undefined) {
        // user don't pass the length
        maxLength = 31;
    }

    if (text == null) return;

    if (text.length > maxLength)
        return text.slice(0, maxLength - 3) + '...';
    return text;
}

export const helpers = {
    formatCurrency,
    equals,
    translate,
    cardDate,
    onlyDate,
    shortText,
    section,
}