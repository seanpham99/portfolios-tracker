import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { SupabaseClient, PostgrestError } from '@supabase/supabase-js';
import { Database } from '@repo/database-types';
import { CreatePortfolioDto, UpdatePortfolioDto } from './dto';
import { Portfolio } from './portfolio.entity';

/**
 * Service for portfolio CRUD operations
 * Uses Supabase client with RLS for data access
 */
@Injectable()
export class PortfoliosService {
  constructor(
    @Inject('SUPABASE_CLIENT')
    private readonly supabase: SupabaseClient<Database>,
  ) {}

  /**
   * Create a new portfolio for the authenticated user
   */
  async create(
    userId: string,
    createDto: CreatePortfolioDto,
  ): Promise<Portfolio> {
    const { data, error } = await this.supabase
      .from('portfolios')
      .insert({
        user_id: userId,
        name: createDto.name,
        base_currency: createDto.base_currency,
        description: createDto.description ?? null,
      })
      .select()
      .single();

    if (error) {
      this.handleError(error, createDto.name);
    }

    return data;
  }

  /**
   * Find all portfolios for the authenticated user
   */
  async findAll(userId: string): Promise<Portfolio[]> {
    const { data, error } = await this.supabase
      .from('portfolios')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data ?? [];
  }

  /**
   * Find a single portfolio by ID
   */
  async findOne(userId: string, id: string): Promise<Portfolio> {
    const { data, error } = await this.supabase
      .from('portfolios')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundException(`Portfolio with ID "${id}" not found`);
      }
      throw error;
    }

    return data;
  }

  /**
   * Update an existing portfolio
   */
  async update(
    userId: string,
    id: string,
    updateDto: UpdatePortfolioDto,
  ): Promise<Portfolio> {
    // First verify the portfolio exists and belongs to the user
    await this.findOne(userId, id);

    const { data, error } = await this.supabase
      .from('portfolios')
      .update({
        ...(updateDto.name !== undefined && { name: updateDto.name }),
        ...(updateDto.base_currency !== undefined && {
          base_currency: updateDto.base_currency,
        }),
        ...(updateDto.description !== undefined && {
          description: updateDto.description,
        }),
      })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      this.handleError(error, updateDto.name);
    }

    return data;
  }

  /**
   * Delete a portfolio
   */
  async remove(userId: string, id: string): Promise<void> {
    // First verify the portfolio exists and belongs to the user
    await this.findOne(userId, id);

    const { error } = await this.supabase
      .from('portfolios')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      throw error;
    }
  }

  /**
   * Handle Supabase errors
   */
  private handleError(error: PostgrestError, name?: string): never {
    // Handle unique constraint violation
    if (error.code === '23505') {
      throw new ConflictException(
        `Portfolio with name "${name}" already exists`,
      );
    }
    throw error;
  }
}
