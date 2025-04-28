import { createClient } from "@supabase/supabase-js";

// Credenciais reais do projeto Supabase
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://onrutcrhimjdvyznypir.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9ucnV0Y3JoaW1qZHZ5em55cGlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0OTI2OTMsImV4cCI6MjA2MTA2ODY5M30.FKqrKW4qN8c_QGMTDcT4qPlJZTwusgu63BDTAdQ3IB4";

// Criando o cliente do Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Função para verificar a conexão com o Supabase
 * Útil para depuração
 */
export async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from("leads")
      .select("count", { count: "exact" })
      .limit(1);

    if (error) {
      console.error("Erro ao conectar ao Supabase:", error);
      return { connected: false, error };
    }

    return { connected: true, data };
  } catch (err) {
    console.error("Exceção ao verificar conexão com Supabase:", err);
    return { connected: false, error: err };
  }
}
