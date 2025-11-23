const SAFE_METHODS: Record<string, true> = {
	GET: true,
	HEAD: true,
	OPTIONS: true,
	get: true,
	head: true,
	options: true,
};

type RequestData = {
	method: string;
	headers: {
		'origin': string;
		'sec-fetch-site': string;
	};
};

type SecurityOptions = {
	trustedOrigin: string;
};

export class InvalidTrustedOriginError extends TypeError {
	code = 'invalid_trusted_origin_error';

	constructor(message: string) {
		super(message);
	}
}

function parseTrustedOrigin(trustedOrigin: string) {
	const origin = URL.parse(trustedOrigin)?.origin;

	if (!origin) {
		throw new InvalidTrustedOriginError(`Invalid trusted origin: "${trustedOrigin}"`);
	}

	return origin;
}

export function isSafeRequest(data: RequestData, securityOptions: SecurityOptions) {
	// Fails fast on wrong configuration
	const trustedOrigin = parseTrustedOrigin(securityOptions.trustedOrigin);

	// allow safe methods
	if (SAFE_METHODS[data.method]) {
		return true;
	}

	const headers = data.headers;

	// allow modern browsers
	if (headers['sec-fetch-site'] === 'same-origin' || headers['sec-fetch-site'] === 'none') {
		return true;
	}

	// allow pre-modern browsers
	if (headers['origin'] === trustedOrigin) {
		return true;
	}

	// most likely a non-browser request
	if (!headers['origin'] && !headers['sec-fetch-site']) {
		return true;
	}

	return false;
}
