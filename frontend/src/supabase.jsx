import { createClient } from "@supabase/supabase-js";

// Cliente Supabase — usado APENAS para upload de fotos no Storage.
// O login/cadastro NÃO passa por aqui: a autenticação é do backend FastAPI
// (e-mail + senha + JWT próprio), não do Supabase Auth.

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Bucket público criado na Etapa 1.
const BUCKET = "fotos-imoveis";

const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

if (!supabase) {
  console.warn(
    "[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY não configurados — " +
      "o upload de fotos ficará indisponível. Copie frontend/.env.example para .env."
  );
}

// Faz upload de um arquivo (File) pro bucket e devolve a URL pública.
window.uploadFoto = async (file) => {
  if (!supabase) {
    throw new Error(
      "Supabase não configurado — defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY em frontend/.env"
    );
  }
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const nome = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(nome, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(nome);
  return data.publicUrl;
};

window.supabase = supabase;
