import { SupabaseClient, User } from '@supabase/supabase-js';
import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  accessToken: string;
  authUser: User;
  supabase: SupabaseClient;
}
