import { expect, test } from 'vitest';
import { InvalidTrustedOriginError, isSafeRequest } from './main.js';

const trustedOrigin = 'https://example.com';

test.for(['GET', 'HEAD', 'OPTIONS'])('%s allowed', async (method) => {
	const safe = isSafeRequest(
		{
			method,
			headers: {
				'origin': '',
				'sec-fetch-site': '',
			},
		},
		{
			trustedOrigin,
		},
	);

	expect(safe).toBe(true);
});

test.for([
	['same-origin allowed', 'same-origin', '', true],
	['none origin allowed', 'none', '', true],
	['cross-site blocked', 'cross-site', '', false],
	['same-site blocked', 'same-site', '', false],

	['no sec-fetch-site with matching origin allowed', '', trustedOrigin, true],
	['no sec-fetch-site with mismatched origin blocked', '', 'https://attacker.example.com', false],
	['no sec-fetch-site with null origin blocked', '', 'null', false],

	['trusted origin without sec-fetch-site allowed', '', trustedOrigin, true],
	['trusted origin with cross-site', 'cross-site allowed', trustedOrigin, true],
	['untrusted origin without sec-fetch-site blocked', '', 'https://attacker.com', false],
	['untrusted origin with cross-site blocked', 'cross-site', 'https://attacker.com', false],

	// most likely a non-browser request
	['no header with no origin allowed', '', '', true],
])('%s', async ([_, secFetchSite, origin, expectedResult]) => {
	const safe = isSafeRequest(
		{
			method: 'post',
			headers: {
				'origin': origin as string,
				'sec-fetch-site': secFetchSite as string,
			},
		},
		{
			trustedOrigin: trustedOrigin,
		},
	);

	expect(safe).toBe(expectedResult);
});

test('rejects invalid `trustedOrigin` with InvalidTrustedOriginError', async () => {
	try {
		isSafeRequest(
			{
				method: 'POST',
				headers: {
					'origin': '',
					'sec-fetch-site': '',
				},
			},
			{ trustedOrigin: 'invalid-origin-value.com' },
		);
		expect.unreachable();
	} catch (error) {
		const trustedOriginError = error as InvalidTrustedOriginError;

		expect(trustedOriginError).instanceOf(InvalidTrustedOriginError);
		expect(trustedOriginError.message).toBe('Invalid trusted origin: "invalid-origin-value.com"');
		expect(trustedOriginError.code).toBe('invalid_trusted_origin_error');
	}
});
