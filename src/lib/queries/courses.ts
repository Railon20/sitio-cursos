import supabase from "../supabaseClient"; // ✅ Asegurate que el path sea correcto

export async function getCourses() {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("published", true);
  if (error) throw error;
  return data;
}
