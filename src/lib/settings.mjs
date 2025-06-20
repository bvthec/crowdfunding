'use strict';
import { join } from 'path';

// public files configurations
export const PUBLIC_PATH = 'public'
export const MEDIA_PATH = join('public', 'media');

// milliseconds (30 days)
export const SESSION_DURATION = 1000 * 60 * 60 * 24 * 30;