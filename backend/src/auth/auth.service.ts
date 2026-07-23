import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Session, User } from '@supabase/supabase-js';
import { SupabaseService } from '../supabase/supabase.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export interface AuthResult {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  emailConfirmationRequired?: boolean;
}

@Injectable()
export class AuthService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async register(dto: RegisterDto) {
    const supabase = this.supabaseService.createPublicClient();
    const { data, error } = await supabase.auth.signUp({
      email: dto.email,
      password: dto.password,
      options: {
        data: {
          full_name: dto.fullName,
        },
      },
    });

    if (error) {
      throw new BadRequestException(error.message);
    }

    if (!data.user || !data.session) {
      return {
        user: data.user,
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
        emailConfirmationRequired: true,
      };
    }

    return {
      ...this.toAuthResult(data.user, data.session),
      emailConfirmationRequired: false,
    };
  }

  async login(dto: LoginDto) {
    const supabase = this.supabaseService.createPublicClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (error) {
      throw new UnauthorizedException(error.message);
    }

    return this.toAuthResult(data.user, data.session);
  }

  async refresh(refreshToken: string) {
    const supabase = this.supabaseService.createPublicClient();
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session || !data.user) {
      throw new UnauthorizedException(error?.message ?? 'Unable to refresh session');
    }

    return this.toAuthResult(data.user, data.session);
  }

  async logout(accessToken: string, refreshToken: string) {
    const supabase = this.supabaseService.createUserClient(accessToken);
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (sessionError) {
      throw new UnauthorizedException(sessionError.message);
    }

    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new BadRequestException(error.message);
    }

    return { success: true };
  }

  private toAuthResult(user: User, session: Session): AuthResult {
    return {
      user,
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresAt: session.expires_at ?? null,
    };
  }
}
