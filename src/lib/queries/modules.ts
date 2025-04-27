import supabase from "../supabaseClient"; // ✅ Asegurate que el path sea correcto

export async function getCourseModules(courseId: string) {
  const { data, error } = await supabase
    .from("modules")
    .select("*")
    .eq("course_id", courseId)
    .order("order_index", { ascending: true });
  if (error) throw error;
  return data;
}
