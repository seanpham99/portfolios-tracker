import { Database } from '@workspace/shared-types/database';

/**
 * Portfolio entity interface matching database schema
 */
export type Portfolio = Database['public']['Tables']['portfolios']['Row'];
