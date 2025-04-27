import supabase from "../supabaseClient"; // ✅ Asegurate que el path sea correcto

export async function getPurchasedCourses(userId: string) {
  const { data, error } = await supabase
    .from("purchases")
    .select("course_id, courses(*)")
    .eq("user_id", userId);
  if (error) throw error;
  return data.map((p) => p.courses);
}

export async function purchaseCourse(userId: string, courseId: string) {
  const { data, error } = await supabase
    .from("purchases")
    .insert([{ user_id: userId, course_id: courseId }]);
  if (error) throw error;
  return data;
}
