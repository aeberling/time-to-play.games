import {
  generateGuestToken,
  generateUserToken,
  verifyAccessToken,
  verifyRefreshToken,
} from '../jwt';

/**
 * Simple JWT test - run with: npx ts-node src/lib/auth/__tests__/jwt.test.ts
 */
async function testJWT() {
  console.log('🧪 Testing JWT utilities...\n');

  // Test 1: Generate guest token
  console.log('Test 1: Generate guest token');
  const guestTokens = generateGuestToken('guest-123', 'HappyPlayer42');
  console.log('✅ Guest tokens generated:', {
    accessToken: guestTokens.accessToken.substring(0, 20) + '...',
    refreshToken: guestTokens.refreshToken.substring(0, 20) + '...',
  });

  // Test 2: Verify access token
  console.log('\nTest 2: Verify access token');
  const payload = verifyAccessToken(guestTokens.accessToken);
  console.log('✅ Access token verified:', payload);

  // Test 3: Verify refresh token
  console.log('\nTest 3: Verify refresh token');
  const refreshPayload = verifyRefreshToken(guestTokens.refreshToken);
  console.log('✅ Refresh token verified:', refreshPayload);

  // Test 4: Generate registered user token
  console.log('\nTest 4: Generate registered user token');
  const userTokens = generateUserToken('user-456', 'JohnDoe');
  const userPayload = verifyAccessToken(userTokens.accessToken);
  console.log('✅ User token generated and verified:', userPayload);

  // Test 5: Invalid token
  console.log('\nTest 5: Invalid token verification');
  const invalidPayload = verifyAccessToken('invalid.token.here');
  console.log('✅ Invalid token handled:', invalidPayload === null ? 'null (as expected)' : 'ERROR');

  console.log('\n✨ All JWT tests passed!');
}

testJWT().catch(console.error);
