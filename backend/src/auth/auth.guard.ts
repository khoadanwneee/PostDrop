import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { AuthenticatedRequest } from './auth.types';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly supabaseService: SupabaseService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('A Bearer access token is required');
    }

    const accessToken = authorization.slice('Bearer '.length).trim();
    if (!accessToken) {
      throw new UnauthorizedException('A Bearer access token is required');
    }

    const supabase = this.supabaseService.createUserClient(accessToken);
    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error || !data.user) {
      throw new UnauthorizedException('The access token is invalid or expired');
    }

    request.accessToken = accessToken;
    request.authUser = data.user;
    request.supabase = supabase;
    return true;
  }
}
