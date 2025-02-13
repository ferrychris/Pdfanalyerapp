// "use strict";
// Object.defineProperty(exports, "__esModule", { value: true });
// exports.supabase = void 0;
// var supabase_js_1 = require("@supabase/supabase-js");
// var supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// var supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
// exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);