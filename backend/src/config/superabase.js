// src/config/supabase.js

// nota: para produccion cuando pague suscripcion en aws para probar

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Función para subir a Supabase
export async function uploadToSupabase(file, folder = 'tesis') {
    const fileName = `${folder}/${Date.now()}-${file.originalname}`;
    const { data, error } = await supabase.storage
        .from('documentos')
        .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            cacheControl: '3600'
        });
    
    if (error) throw error;
    
    // Generar URL firmada (expira en 1 hora)
    const { data: signedUrl } = await supabase.storage
        .from('documentos')
        .createSignedUrl(fileName, 3600);
    
    return { path: fileName, signedUrl: signedUrl };
}