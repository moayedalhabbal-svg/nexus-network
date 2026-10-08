"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createPostAction(content: string, postType: string = 'general', projectRef: string | null = null, opportunityRef: string | null = null) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { data, error } = await supabase
    .from('posts')
    .insert({
      author_id: user.id,
      content,
      post_type: postType,
      project_ref: projectRef,
      opportunity_ref: opportunityRef
    })
    .select()
    .single();

  if (error) {
    console.error("Create post error:", error);
    return { success: false, error: error.message };
  }

  revalidatePath('/feed');
  return { success: true, post: data };
}

export async function fetchFeedAction(cursor: number = 0, limit: number = 20) {
  const supabase = await createClient();
  
  // Fetch posts with author info, project info, opportunity info
  // We will need to join profiles, projects, opportunities
  // Since we are doing this with Supabase JS client, we can use relation selections
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles!author_id(*),
      project:projects!project_ref(*, project_needs(*)),
      opportunity:opportunities!opportunity_ref(*)
    `)
    .order('created_at', { ascending: false })
    .range(cursor, cursor + limit - 1);

  if (error) {
    console.error("Fetch feed error:", error);
    return { success: false, error: error.message, posts: [] };
  }

  return { success: true, posts: data };
}

export async function likePostAction(postId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  // Try to insert a like
  const { error } = await supabase
    .from('post_likes')
    .insert({ post_id: postId, user_id: user.id });

  if (error) {
    // If it violates uniqueness, they already liked it, so unlike it
    if (error.code === '23505') {
      await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id);
      
      // decrement counter
      await supabase.rpc('decrement_post_likes', { p_id: postId });
      return { success: true, action: 'unliked' };
    }
    return { success: false, error: error.message };
  }

  // increment counter
  await supabase.rpc('increment_post_likes', { p_id: postId });
  return { success: true, action: 'liked' };
}
