import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function GET() {
  try {
    // Simple health check query
    const { data, error } = await supabase.from('postgres_version').select('*').limit(1);
    
    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Supabase connection successful',
      data 
    });
  } catch (error) {
    console.error('Supabase connection error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to connect to Supabase'
    }, { status: 500 });
  }
} 