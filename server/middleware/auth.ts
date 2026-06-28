import { Context, Next } from 'hono';
import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';

export async function authMiddleware(c: Context, next: Next) {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Missing or invalid Authorization header' } }, 401);
  }

  const token = authHeader.split(' ')[1];
  
  try {
    // We must validate the token against the central auth server since it is an opaque token
    const response = await fetch("https://openrocketsauth.alwaysdata.net/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error('Token validation failed');
    }

    const userData = await response.json();
    const userId = String(userData.id);
    const bestName = userData.name || 'Contributor';
    const email = userData.email || 'user@example.com';

    // Upsert user logic
    let [dbUser] = await db.select().from(users).where(eq(users.id, userId));
    
    if (!dbUser) {
      await db.insert(users).values({
        id: userId,
        displayName: bestName,
        email: email,
        role: 'contributor',
      });
      [dbUser] = await db.select().from(users).where(eq(users.id, userId));
    } else {
      // Opportunistically update their info if they had generic values
      if (dbUser.displayName === 'Contributor' && bestName !== 'Contributor') {
        await db.update(users).set({ displayName: bestName, email }).where(eq(users.id, userId));
        dbUser.displayName = bestName;
        dbUser.email = email;
      }
    }

    // Attach to context
    c.set('user', dbUser);
    
    await next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' } }, 401);
  }
}
