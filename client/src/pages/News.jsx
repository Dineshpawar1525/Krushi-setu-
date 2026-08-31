import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Bookmark,
  Clock,
  Eye,
  TrendingUp,
  RefreshCw,
  Settings,
  MoreVertical
} from 'lucide-react';
import DashboardNav from '../components/DashboardNav';

const News = () => {
  const [videos, setVideos] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);

  // API Keys from environment variables
  const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;
  const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
  
  // Guardian API (Free, no key required)
  const GUARDIAN_API_URL = 'https://content.guardianapis.com/search';

  const categories = [
    { value: 'all', label: 'All Videos' },
    { value: 'Technology', label: 'Technology' },
    { value: 'Policy', label: 'Policy' },
    { value: 'Research', label: 'Research' },
    { value: 'Sustainability', label: 'Sustainability' },
    { value: 'Market', label: 'Market' },
    { value: 'agriculture', label: 'Agriculture' },
    { value: 'farming', label: 'Farming' }
  ];

  const sortOptions = [
    { value: 'latest', label: 'Latest First' },
    { value: 'trending', label: 'Trending' },
    { value: 'most_viewed', label: 'Most Viewed' },
    { value: 'most_liked', label: 'Most Liked' }
  ];

  // Real API Integration Functions
  const fetchNewsFromNewsAPI = async () => {
    if (!NEWS_API_KEY) {
      console.warn('⚠️ NewsAPI key not found');
      return [];
    }
    
    try {
      const url = `https://newsapi.org/v2/everything?q=agriculture OR farming OR crops OR "agricultural technology" OR "smart farming" OR "precision agriculture" OR "sustainable farming" OR "crop management" OR "farm technology"&language=en&sortBy=publishedAt&pageSize=20&apiKey=${NEWS_API_KEY}`;
      console.log('🌐 Fetching from NewsAPI...');
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        console.error('❌ NewsAPI Error:', data);
        return [];
      }
      
      console.log('✅ NewsAPI Success:', data.articles?.length || 0, 'articles');
      return data.articles || [];
    } catch (error) {
      console.error('❌ NewsAPI Error:', error);
      return [];
    }
  };

  const fetchNewsFromGuardian = async () => {
    try {
      const url = `${GUARDIAN_API_URL}?q=agriculture OR farming OR "agricultural technology" OR "smart farming" OR "sustainable agriculture"&section=environment|science|world&show-fields=thumbnail,headline,trailText&page-size=20&api-key=test`;
      console.log('🌐 Fetching from Guardian API...');
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        console.error('❌ Guardian API Error:', data);
        return [];
      }
      
      console.log('✅ Guardian API Success:', data.response?.results?.length || 0, 'articles');
      return data.response?.results || [];
    } catch (error) {
      console.error('❌ Guardian API Error:', error);
      return [];
    }
  };

  const fetchYouTubeVideos = async () => {
    if (!YOUTUBE_API_KEY) {
      console.warn('⚠️ YouTube API key not found');
      return [];
    }
    
    try {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=agriculture farming crops "agricultural technology" "smart farming" "precision agriculture" "sustainable farming" "crop management" "farm technology"&type=video&maxResults=20&order=relevance&key=${YOUTUBE_API_KEY}`;
      console.log('🌐 Fetching from YouTube API...');
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (!response.ok) {
        console.error('❌ YouTube API Error:', data);
        return [];
      }
      
      console.log('✅ YouTube API Success:', data.items?.length || 0, 'videos');
      return data.items || [];
    } catch (error) {
      console.error('❌ YouTube API Error:', error);
      return [];
    }
  };

  const getCategoryFromContent = (title, description, source) => {
    const content = (title + ' ' + description).toLowerCase();
    
    if (content.includes('technology') || content.includes('ai') || content.includes('digital') || content.includes('smart') || content.includes('precision')) {
      return 'Technology';
    }
    if (content.includes('policy') || content.includes('government') || content.includes('subsidy') || content.includes('regulation')) {
      return 'Policy';
    }
    if (content.includes('research') || content.includes('study') || content.includes('scientist') || content.includes('university')) {
      return 'Research';
    }
    if (content.includes('sustainable') || content.includes('organic') || content.includes('climate') || content.includes('environment')) {
      return 'Sustainability';
    }
    if (content.includes('market') || content.includes('price') || content.includes('trade') || content.includes('export')) {
      return 'Market';
    }
    if (content.includes('farming') || content.includes('farmer') || content.includes('crop') || content.includes('livestock')) {
      return 'farming';
    }
    return 'agriculture';
  };

  const transformNewsToVideos = (newsData, source) => {
    return newsData.map((item, index) => {
      const title = item.title || item.headline || item.snippet?.title || '';
      const description = item.description || item.trailText || item.snippet?.description || '';
      const category = getCategoryFromContent(title, description, source);
      
      return {
        id: `${source}_${index}`,
        title,
        description,
        thumbnail: item.urlToImage || item.fields?.thumbnail || item.snippet?.thumbnails?.high?.url,
        videoUrl: item.url || `https://www.youtube.com/watch?v=${item.id?.videoId}`,
        channelName: item.source?.name || item.snippet?.channelTitle || 'Agricultural News',
        publishedAt: new Date(item.publishedAt || item.webPublicationDate || item.snippet?.publishedAt),
        views: Math.floor(Math.random() * 100000) + 1000, // Mock views
        likes: Math.floor(Math.random() * 1000) + 10, // Mock likes
        duration: '5:30', // Mock duration
        category,
        trending: Math.random() > 0.7,
        source: source
      };
    });
  };

  useEffect(() => {
    const fetchAllVideos = async () => {
      setLoading(true);
      try {
        console.log('🔑 API Keys:', {
          newsAPI: NEWS_API_KEY ? '✅ Loaded' : '❌ Missing',
          youtubeAPI: YOUTUBE_API_KEY ? '✅ Loaded' : '❌ Missing'
        });

        // Fetch from multiple sources in parallel
        const [newsAPIResults, guardianResults, youtubeResults] = await Promise.all([
          fetchNewsFromNewsAPI(),
          fetchNewsFromGuardian(),
          fetchYouTubeVideos()
        ]);

        console.log('📊 API Results:', {
          newsAPI: newsAPIResults.length,
          guardian: guardianResults.length,
          youtube: youtubeResults.length
        });

        // Transform all results to video format
        const allVideos = [
          ...transformNewsToVideos(newsAPIResults, 'NewsAPI'),
          ...transformNewsToVideos(guardianResults, 'Guardian'),
          ...transformNewsToVideos(youtubeResults, 'YouTube')
        ];

        console.log('🎥 Total Videos:', allVideos.length);

        // Remove duplicates and sort by date
        const uniqueVideos = allVideos.filter((video, index, self) => 
          index === self.findIndex(v => v.title === video.title)
        ).sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

        console.log('🎯 Unique Videos:', uniqueVideos.length);

        // If no videos found, use fallback mock data
        if (uniqueVideos.length === 0) {
          console.log('🔄 No videos found, using fallback mock data...');
          const mockVideos = [
            {
              id: 'mock_1',
              title: 'Smart Farming: AI Technology Revolutionizing Agriculture',
              description: 'Discover how artificial intelligence is transforming modern farming practices and increasing crop yields.',
              thumbnail: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=500&h=300&fit=crop',
              videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
              channelName: 'Agricultural Innovation',
              publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
              views: 125000,
              likes: 2500,
              duration: '8:45',
              category: 'Technology',
              trending: true,
              source: 'YouTube'
            },
            {
              id: 'mock_2',
              title: 'Organic Farming Techniques for Sustainable Agriculture',
              description: 'Learn about organic farming methods that promote soil health and environmental sustainability.',
              thumbnail: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=500&h=300&fit=crop',
              videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
              channelName: 'Sustainable Farming',
              publishedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
              views: 89000,
              likes: 1800,
              duration: '12:30',
              category: 'Sustainability',
              trending: false,
              source: 'YouTube'
            },
            {
              id: 'mock_3',
              title: 'Precision Agriculture: GPS and Drone Technology',
              description: 'Explore how GPS and drone technology are revolutionizing precision agriculture and farm management.',
              thumbnail: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=500&h=300&fit=crop',
              videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
              channelName: 'Tech Farming',
              publishedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
              views: 156000,
              likes: 3200,
              duration: '15:20',
              category: 'Technology',
              trending: true,
              source: 'YouTube'
            }
          ];
          setVideos(mockVideos);
          setFilteredVideos(mockVideos);
        } else {
          setVideos(uniqueVideos);
          setFilteredVideos(uniqueVideos);
        }
      } catch (error) {
        console.error('❌ Error fetching videos:', error);
        // Fallback to mock data if APIs fail
        setVideos([]);
        setFilteredVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAllVideos();

    // Auto-refresh every 5 minutes to keep data fresh
    const autoRefreshInterval = setInterval(() => {
      console.log('⏰ Auto-refreshing data...');
      handleRefresh();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(autoRefreshInterval);
  }, []);

  useEffect(() => {
    let filtered = videos;

    console.log('🔍 Filtering videos:', {
      totalVideos: videos.length,
      selectedCategory,
      searchTerm,
      sortBy
    });

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(video =>
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.channelName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      console.log('🔍 After search filter:', filtered.length);
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      const beforeCategoryFilter = filtered.length;
      filtered = filtered.filter(video => {
        const matches = video.category === selectedCategory;
        if (!matches) {
          console.log(`❌ Video "${video.title}" category "${video.category}" doesn't match "${selectedCategory}"`);
        }
        return matches;
      });
      console.log('🔍 After category filter:', {
        before: beforeCategoryFilter,
        after: filtered.length,
        category: selectedCategory
      });
    }

    // Sort videos
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'latest':
          return new Date(b.publishedAt) - new Date(a.publishedAt);
        case 'trending':
          if (a.trending && !b.trending) return -1;
          if (!a.trending && b.trending) return 1;
          return new Date(b.publishedAt) - new Date(a.publishedAt);
        case 'most_viewed':
          return b.views - a.views;
        case 'most_liked':
          return b.likes - a.likes;
        default:
          return 0;
      }
    });

    console.log('✅ Final filtered videos:', filtered.length);
    setFilteredVideos(filtered);
  }, [videos, searchTerm, selectedCategory, sortBy]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      console.log('🔄 Refreshing real-time data...');
      
      // Fetch fresh data from APIs
      const [newsAPIResults, guardianResults, youtubeResults] = await Promise.all([
        fetchNewsFromNewsAPI(),
        fetchNewsFromGuardian(),
        fetchYouTubeVideos()
      ]);

      console.log('📊 Refresh Results:', {
        newsAPI: newsAPIResults.length,
        guardian: guardianResults.length,
        youtube: youtubeResults.length
      });

      const allVideos = [
        ...transformNewsToVideos(newsAPIResults, 'NewsAPI'),
        ...transformNewsToVideos(guardianResults, 'Guardian'),
        ...transformNewsToVideos(youtubeResults, 'YouTube')
      ];

      const uniqueVideos = allVideos.filter((video, index, self) => 
        index === self.findIndex(v => v.title === video.title)
      ).sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

      console.log('✅ Refresh Complete:', uniqueVideos.length, 'videos loaded');
      setVideos(uniqueVideos);
      setFilteredVideos(uniqueVideos);
    } catch (error) {
      console.error('❌ Error refreshing videos:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  const formatViews = (views) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M views`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K views`;
    return `${views} views`;
  };

  const handleVideoClick = (video) => {
    // For YouTube videos, show in modal or open in new tab
    if (video.source === 'YouTube' && video.videoUrl.includes('youtube.com')) {
      // Extract video ID from YouTube URL
      const videoId = video.videoUrl.split('v=')[1]?.split('&')[0];
      if (videoId) {
        setSelectedVideo({ ...video, videoId });
        setShowVideoModal(true);
      } else {
        window.open(video.videoUrl, '_blank');
      }
    } else {
      // For news articles, open the article URL
      window.open(video.videoUrl, '_blank');
    }
  };

  const closeVideoModal = () => {
    setShowVideoModal(false);
    setSelectedVideo(null);
  };

  const VideoCard = ({ video }) => (
    <div 
      className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-green-100/50 hover:border-green-200 group cursor-pointer transform hover:-translate-y-2 hover:scale-105"
      onClick={() => handleVideoClick(video)}
    >
      <div className="relative overflow-hidden">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-52 object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Enhanced Trending Badge */}
        {video.trending && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-lg">
            <TrendingUp className="w-3 h-3" />
            Trending
          </div>
        )}
        
        {/* Enhanced Duration Badge */}
        <div className="absolute bottom-3 right-3 bg-black/90 backdrop-blur-sm text-white px-2.5 py-1 rounded-lg text-xs font-semibold">
          {video.duration}
        </div>
        
        {/* Enhanced Play Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent group-hover:from-black/70 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
              <Play className="w-8 h-8 text-white drop-shadow-lg ml-1" />
            </div>
          </div>
        </div>
        
        {/* Category Badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-green-700 px-2 py-1 rounded-lg text-xs font-medium">
          {video.category}
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-green-700 transition-colors line-clamp-2 leading-tight">
          {video.title}
        </h3>
        
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <div className="w-6 h-6 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {video.channelName.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="font-medium">{video.channelName}</span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-500">{formatTimeAgo(video.publishedAt)}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-blue-500" />
              <span className="font-medium">{formatViews(video.views)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ThumbsUp className="w-4 h-4 text-green-500" />
              <span className="font-medium">{video.likes}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                // Bookmark functionality
              }}
            >
              <Bookmark className="w-4 h-4" />
            </button>
            <button 
              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(video.videoUrl);
                // You can add a toast notification here
              }}
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button 
              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                // More options functionality
              }}
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <>
        <DashboardNav />
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 pt-16 relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
            <div className="absolute top-20 left-20 w-40 h-40 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative z-10">
            <div className="flex items-center justify-center h-80">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-6 shadow-lg">
                  <RefreshCw className="w-10 h-10 text-white animate-spin" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Loading Agricultural Content</h3>
                <p className="text-gray-600 mb-4">Fetching the latest videos and news from multiple sources...</p>
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardNav />
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 pt-16 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute top-20 left-20 w-40 h-40 bg-teal-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative z-10">
          {/* Enhanced Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-4 shadow-lg">
              <Play className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent mb-3">
              Agricultural Videos
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Watch the latest agricultural news, farming techniques, and technology updates from around the world
            </p>
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="flex items-center gap-2 text-sm text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium">Live Updates</span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>Updated {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>

          {/* Enhanced Filters and Search */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-6 mb-6 border border-green-100/50 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-green-50/50 to-emerald-50/50"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-800">Search & Filter</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Enhanced Search */}
                <div className="lg:col-span-2">
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-green-600 transition-colors" />
                    <input
                      type="text"
                      placeholder="Search agricultural videos, news, and content..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm"
                    />
                  </div>
                </div>

                {/* Enhanced Category Filter */}
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm appearance-none cursor-pointer"
                  >
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Enhanced Sort */}
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all duration-200 bg-white/50 backdrop-blur-sm appearance-none cursor-pointer"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Enhanced Refresh Button */}
              <div className="flex justify-end mt-4">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                  <span className="font-medium">{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Results Count and Status */}
          <div className="mb-6">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-green-100/50">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-lg font-semibold text-gray-800">
                      {filteredVideos.length} of {videos.length} videos
                    </span>
                  </div>
                  {selectedCategory !== 'all' && (
                    <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      {categories.find(cat => cat.value === selectedCategory)?.label}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 text-green-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="font-medium">Live Data</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>Updated {new Date().toLocaleTimeString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-blue-600">
                    <TrendingUp className="w-4 h-4" />
                    <span>{videos.filter(v => v.trending).length} trending</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Videos Grid */}
          {filteredVideos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredVideos.map(video => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-12 border border-green-100/50 max-w-md mx-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-3">No Videos Found</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  We couldn't find any videos matching your current search criteria. Try adjusting your filters or search terms.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-medium"
                  >
                    Clear Filters
                  </button>
                  <button
                    onClick={handleRefresh}
                    className="px-6 py-3 bg-white border-2 border-green-200 text-green-700 rounded-xl hover:bg-green-50 transition-all duration-300 font-medium"
                  >
                    Refresh Data
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Video Modal */}
      {showVideoModal && selectedVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                {selectedVideo.title}
              </h3>
              <button
                onClick={closeVideoModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4">
              <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1`}
                  title={selectedVideo.title}
                  className="absolute top-0 left-0 w-full h-full rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              
              <div className="mt-4">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <span className="font-medium">{selectedVideo.channelName}</span>
                  <span>•</span>
                  <span>{formatTimeAgo(selectedVideo.publishedAt)}</span>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    <span>{formatViews(selectedVideo.views)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="w-4 h-4" />
                    <span>{selectedVideo.likes}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default News;
