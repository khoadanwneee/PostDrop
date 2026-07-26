import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly url: string;
  private readonly publishableKey: string;
  private readonly serviceRoleKey: string;

  constructor(config: ConfigService) {
    this.url = config.getOrThrow<string>('SUPABASE_URL');
    this.publishableKey = config.getOrThrow<string>('SUPABASE_PUBLISHABLE_KEY');
    this.serviceRoleKey = config.getOrThrow<string>('SUPABASE_SERVICE_ROLE_KEY');
  }

  createPublicClient(): SupabaseClient {
    return createClient(this.url, this.publishableKey, {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    });
  }

  createUserClient(accessToken: string): SupabaseClient {
    return createClient(this.url, this.publishableKey, {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    });
  }

  createServiceClient(): SupabaseClient {
    return createClient(this.url, this.serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    });
  }
}
