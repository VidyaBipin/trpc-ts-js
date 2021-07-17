import NextAuth from 'next-auth';
import Providers, { AppProviders } from 'next-auth/providers';

let useTestCredentials = process.env.NODE_ENV === 'test';
const { GITHUB_CLIENT_ID, GITHUB_SECRET } = process.env;
if (
  process.env.NODE_ENV !== 'production' &&
  (!GITHUB_CLIENT_ID || !GITHUB_SECRET)
) {
  console.log('⚠️ Using mocked GitHub auth correct credentails were not added');
  useTestCredentials = true;
}
const providers: AppProviders = [];
if (useTestCredentials) {
  providers.push(
    Providers.Credentials({
      id: 'github',
      name: 'Mocked GitHub',
      async authorize(credentials) {
        const user = {
          id: credentials.name,
          name: credentials.name,
          email: credentials.name,
        };
        return user;
      },
      credentials: {
        name: { type: 'test' },
      },
    }),
  );
} else {
  providers.push(
    Providers.GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_SECRET,
      profile(profile) {
        return {
          id: profile.id,
          name: profile.login,
          email: profile.email,
          image: profile.avatar_url,
        } as any;
      },
    }),
  );
}
export default NextAuth({
  // Configure one or more authentication providers
  providers,
});
