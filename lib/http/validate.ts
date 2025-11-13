import { ZodSchema, ZodError } from 'zod';
import { apiError } from './errors';

/**
 * Parse and validate URL query parameters using Zod schema
 * 
 * @param schema - Zod schema for validation
 * @param url - URL object containing search params
 * @returns Parsed and validated data
 * @throws Response with validation error if invalid
 */
export function parseQuery<T>(schema: ZodSchema<T>, url: URL): T {
  try {
    const params = Object.fromEntries(url.searchParams.entries());
    return schema.parse(params);
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw apiError('invalid_param', `Query validation failed: ${message}`, 400);
    }
    throw error;
  }
}

/**
 * Parse and validate JSON request body using Zod schema
 * 
 * @param schema - Zod schema for validation
 * @param req - Request object
 * @returns Parsed and validated data
 * @throws Response with validation error if invalid
 */
export async function parseJson<T>(schema: ZodSchema<T>, req: Request): Promise<T> {
  try {
    const body = await req.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw apiError('invalid_param', `Body validation failed: ${message}`, 400);
    }
    // JSON parse error
    if (error instanceof SyntaxError) {
      throw apiError('invalid_param', 'Invalid JSON body', 400);
    }
    throw error;
  }
}

/**
 * Parse and validate route params using Zod schema
 * 
 * @param schema - Zod schema for validation
 * @param params - Route params object
 * @returns Parsed and validated data
 * @throws Response with validation error if invalid
 */
export function parseParams<T>(schema: ZodSchema<T>, params: any): T {
  try {
    return schema.parse(params);
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw apiError('invalid_param', `Params validation failed: ${message}`, 400);
    }
    throw error;
  }
}
