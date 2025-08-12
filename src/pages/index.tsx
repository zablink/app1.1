// src/pages/index.tsx
import { useState, useEffect } from 'react';
import { GetServerSideProps } from 'next';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  Search, 
  MapPin, 
  Star, 
  Filter,
  Grid3X3,
  List,
  Phone,
  Clock,
  ChevronRight,
  Heart,
  Eye
} from 'lucide-react';
import { createClient } from '@/lib/supabase';

import Layout from "@/components/Layout";

interface Shop {
  id: string;
  name: string;
  description: string;
  cover_image_url: string;
  thumbnail_url: string;
  average_rating: number;
  total_reviews: number;
  food_category_name: string;
  subdistrict_name: string;
  district_name: string;
  province_name: string;
  package_name: string;
  priority_score: number;
  delivery_platforms: Array<{
    name: string;
    logo_url: string;
    url: string;
  }>;
  opening_hours: any;
  phone: string;
  distance_km?: number;
}

interface AdCampaign {
  id: string;
  shop_name: string;
  banner_image_url: string;
  banner_link_url: string;
  banner_alt_text: string;
  zone_name: string;
}

interface HomePageProps {
  featuredShops: Shop[];
  nearbyShops: Shop[];
  foodCategories: Array<{
    id: number;
    name_th: string;
    icon_url: string;
  }>;
  adCampaigns: {
    bannerTop: AdCampaign[];
    floatingRight: AdCampaign[];
    footerBanner: AdCampaign[];
  };
  userLocation?: {
    lat: number;
    lng: number;
  };
}

export default function HomePage({
  featuredShops,
  nearbyShops,
  foodCategories,
  adCampaigns,
  userLocation
}: HomePageProps) {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filteredShops, setFilteredShops] = useState<Shop[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Filter shops based on search and category
  useEffect(() => {
    let shops = nearbyShops;
    
    if (searchQuery) {
      shops = shops.filter(shop => 
        shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shop.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        shop.food_category_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedCategory) {
      shops = shops.filter(shop => shop.food_category_name === foodCategories.find(c => c.id === selectedCategory)?.name_th);
    }
    
    setFilteredShops(shops);
  }, [searchQuery, selectedCategory, nearbyShops, foodCategories]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length > 2) {
      // Log search for analytics
      try {
        await fetch('/api/analytics/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            searchQuery: query,
            categoryFilter: selectedCategory,
            userLocation 
          }),
        });
      } catch (error) {
        console.error('Search tracking error:', error);
      }
    }
  };

  const trackShopView = async (shopId: string) => {
    try {
      await fetch('/api/analytics/page-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          shopId,
          pageType: 'shop_detail'
        }),
      });
    } catch (error) {
      console.error('View tracking error:', error);
    }
  };

  const trackAdClick = async (campaignId: string, shopId: string) => {
    try {
      await fetch('/api/analytics/ad-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          campaignId,
          shopId,
          clickType: 'ad_banner'
        }),
      });
    } catch (error) {
      console.error('Ad click tracking error:', error);
    }
  };

  return (
    <>
      <Head>
        <title>ZabLink - แพลตฟอร์มรวมลิงก์ร้านอาหารครบครัน</title>
        <meta name="description" content="ค้นหาร้านอาหารใกล้คุณ พร้อมลิงก์สั่งอาหารจากทุกแพลตฟอร์ม LINE M