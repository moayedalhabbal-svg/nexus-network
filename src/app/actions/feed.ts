"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function createPostAction(content: string, postType: string = 'general', projectRef: string | null = null, opportunityRef: string | null = null, mediaUrls: string[] = []) {
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
      opportunity_ref: opportunityRef,
      media_urls: mediaUrls
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
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles!author_id(*),
      project:projects!project_ref(*, project_needs(*)),
      opportunity:opportunities!opportunity_ref(*),
      post_likes(user_id),
      post_saves(user_id)
    `)
    .order('created_at', { ascending: false })
    .range(cursor, cursor + limit - 1);

  if (error) {
    console.error("Fetch feed error:", error);
    return { success: false, error: error.message, posts: [] };
  }

  // Format to attach is_liked_by_me and is_saved_by_me
  const formattedPosts = data.map(post => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const likes = post.post_likes as any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const saves = post.post_saves as any[];
    return {
      ...post,
      is_liked_by_me: user ? likes?.some(l => l.user_id === user.id) : false,
      is_saved_by_me: user ? saves?.some(s => s.user_id === user.id) : false,
      post_likes: undefined,
      post_saves: undefined
    };
  });

  return { success: true, posts: formattedPosts };
}

export async function likePostAction(postId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from('post_likes')
    .insert({ post_id: postId, user_id: user.id });

  if (error) {
    if (error.code === '23505') {
      await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id);
      await supabase.rpc('decrement_post_likes', { p_id: postId });
      return { success: true, action: 'unliked' };
    }
    return { success: false, error: error.message };
  }

  await supabase.rpc('increment_post_likes', { p_id: postId });
  return { success: true, action: 'liked' };
}

export async function savePostAction(postId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from('post_saves')
    .insert({ post_id: postId, user_id: user.id });

  if (error) {
    if (error.code === '23505') {
      await supabase.from('post_saves').delete().eq('post_id', postId).eq('user_id', user.id);
      await supabase.rpc('decrement_post_saves', { p_id: postId });
      return { success: true, action: 'unsaved' };
    }
    return { success: false, error: error.message };
  }

  await supabase.rpc('increment_post_saves', { p_id: postId });
  return { success: true, action: 'saved' };
}

export async function fetchCommentsAction(postId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      author:profiles!author_id(*),
      comment_likes(user_id)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) {
    return { success: false, error: error.message, comments: [] };
  }

  const formattedComments = data.map(comment => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const likes = comment.comment_likes as any[];
    return {
      ...comment,
      is_liked_by_me: user ? likes?.some(l => l.user_id === user.id) : false,
      comment_likes: undefined
    };
  });

  return { success: true, comments: formattedComments };
}

export async function createCommentAction(postId: string, content: string, parentId: string | null = null) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_id: postId,
      author_id: user.id,
      content,
      parent_id: parentId
    })
    .select('*, author:profiles!author_id(*)')
    .single();

  if (error) return { success: false, error: error.message };
  
  return { success: true, comment: { ...data, is_liked_by_me: false, likes_count: 0 } };
}

export async function likeCommentAction(commentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const { error } = await supabase
    .from('comment_likes')
    .insert({ comment_id: commentId, user_id: user.id });

  if (error) {
    if (error.code === '23505') {
      await supabase.from('comment_likes').delete().eq('comment_id', commentId).eq('user_id', user.id);
      await supabase.rpc('decrement_comment_likes', { c_id: commentId });
      return { success: true, action: 'unliked' };
    }
    return { success: false, error: error.message };
  }

  await supabase.rpc('increment_comment_likes', { c_id: commentId });
  return { success: true, action: 'liked' };
}

export async function uploadMediaAction(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const file = formData.get('file') as File;
  if (!file) return { success: false, error: "No file provided" };

  const fileExt = file.name.split('.').pop();
  const fileName = `${user.id}-${Math.random()}.${fileExt}`;

  const { error } = await supabase.storage
    .from('post_media')
    .upload(fileName, file);

  if (error) {
    return { success: false, error: error.message };
  }

  const { data: publicUrlData } = supabase.storage
    .from('post_media')
    .getPublicUrl(fileName);

  return { success: true, url: publicUrlData.publicUrl };
}
