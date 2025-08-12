// src/pages/api/shops/create.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

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
    
    // Read file buffer from filepath (แก้ไขจาก file.buffer)
    const fileBuffer = fs.readFileSync(file.filepath);
    
    const { data, error } = await supabase.storage
      .from('shop-images')
      .upload(filePath, fileBuffer, {
        contentType: file.mimetype || 'image/jpeg',
        upsert: false
      });

    // Clean up temporary file
    fs.unlinkSync(file.filepath);

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
    // Clean up temporary file on error
    try {
      fs.unlinkSync(file.filepath);
    } catch (cleanupError) {
      console.error('Error cleaning up temp file:', cleanupError);
    }
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

    // If user already has shops and is on free plan, prevent creation
    if (existingShops && existingShops.length > 0) {
      // You can add premium plan check here
      return res.status(400).json({ message: 'You already have an active shop' });
    }

    // Generate unique slug
    let slug = createSlug(shopData.name);
    let slugCounter = 1;
    
    // Check if slug exists and make it unique
    while (true) {
      const { data: slugCheck } = await supabase
        .from('shops')
        .select('id')
        .eq('slug', slug)
        .single();
      
      if (!slugCheck) break;
      
      slug = `${createSlug(shopData.name)}-${slugCounter}`;
      slugCounter++;
    }

    // Handle image uploads
    const imageUrls: string[] = [];
    
    // Process uploaded images
    const imageFiles = files.images ? 
      (Array.isArray(files.images) ? files.images : [files.images]) : [];

    for (const imageFile of imageFiles) {
      if (imageFile && imageFile.size > 0) {
        const imageUrl = await uploadImage(imageFile, 'shops');
        if (imageUrl) {
          imageUrls.push(imageUrl);
        }
      }
    }

    // Create shop in database
    const shopToCreate = {
      user_id: session.user.id,
      name: shopData.name,
      slug: slug,
      description: shopData.description,
      phone: shopData.phone,
      address: shopData.address || null,
      subdistrict_id: parseInt(shopData.subdistrictId),
      latitude: shopData.latitude ? parseFloat(shopData.latitude) : null,
      longitude: shopData.longitude ? parseFloat(shopData.longitude) : null,
      images: imageUrls.length > 0 ? imageUrls : null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: newShop, error: createError } = await supabase
      .from('shops')
      .insert([shopToCreate])
      .select()
      .single();

    if (createError) {
      console.error('Shop creation error:', createError);
      return res.status(500).json({ 
        message: 'Failed to create shop',
        error: createError.message 
      });
    }

    return res.status(201).json({
      message: 'Shop created successfully',
      shop: newShop
    });

  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}