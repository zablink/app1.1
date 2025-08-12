// src/pages/api/shops/create.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import { v4 as uuidv4 } from 'uuid';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

// Disable default body parser to handle multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to upload image to Supabase Storage
async function uploadImage(file: formidable.File, folder: string): Promise<string | null> {
  try {
    const fileExt = file.originalFilename?.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('shop-images')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype || 'image/jpeg',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('shop-images')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Image upload error:', error);
    return null;
  }
}

// Helper function to create URL slug
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\u0E00-\u0E7Fa-z0-9\s]/g, '') // Keep Thai, English, numbers, spaces
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);

    if (!session || !session.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (session.user.role !== 'shop') {
      return res.status(403).json({ message: 'Only shop accounts can create shops' });
    }

    // Parse form data
    const form = formidable({
      maxFileSize: 5 * 1024 * 1024, // 5MB
      maxFiles: 3,
    });

    const [fields, files] = await form.parse(req);
    
    const shopDataString = Array.isArray(fields.shopData) ? fields.shopData[0] : fields.shopData;
    if (!shopDataString) {
      return res.status(400).json({ message: 'Shop data is required' });
    }

    const shopData = JSON.parse(shopDataString);

    // Validate required fields
    if (!shopData.name || !shopData.description || !shopData.subdistrictId || !shopData.phone) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check if user already has a shop (for free accounts)
    const { data: existingShops, error: checkError } = await supabase
      .from('shops')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('is_active', true);

    if (checkError) {
      return res.status(500).json({ message: 'Database error checking existing shops' });
    }

    // For free