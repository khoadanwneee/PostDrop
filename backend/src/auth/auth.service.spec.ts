import { SupabaseService } from '../supabase/supabase.service';
import { AuthService } from './auth.service';

describe('AuthService email confirmation', () => {
  const user = { id: 'user-1', email: 'user@example.com' };
  let signUp: jest.Mock;
  let resend: jest.Mock;
  let service: AuthService;

  beforeEach(() => {
    signUp = jest.fn();
    resend = jest.fn();
    const supabaseService = {
      createPublicClient: jest.fn(() => ({
        auth: { signUp, resend },
      })),
    } as unknown as SupabaseService;
    service = new AuthService(supabaseService);
  });

  it('does not create a frontend session before email confirmation', async () => {
    signUp.mockResolvedValue({
      data: { user, session: null },
      error: null,
    });

    await expect(
      service.register({
        email: 'user@example.com',
        password: 'password123',
        fullName: 'PostDrop User',
      }),
    ).resolves.toMatchObject({
      user,
      accessToken: null,
      refreshToken: null,
      emailConfirmationRequired: true,
    });
  });

  it('resends the real Supabase signup confirmation email', async () => {
    resend.mockResolvedValue({ error: null });

    await expect(
      service.resendConfirmation({ email: 'user@example.com' }),
    ).resolves.toEqual({ success: true });
    expect(resend).toHaveBeenCalledWith({
      type: 'signup',
      email: 'user@example.com',
    });
  });
});
