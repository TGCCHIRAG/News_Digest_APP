import { useState, useEffect } from 'react';
import { NhostClient } from '@nhost/react';
import { GraphQLClient, gql } from 'graphql-request';
import { format } from 'date-fns';
import { Bookmark, Share2, Heart, Loader2, Search, Check } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';

// Initialize Nhost Client
const nhost = new NhostClient({
  subdomain: import.meta.env.VITE_NHOST_SUBDOMAIN || 'localhost',
  region: import.meta.env.VITE_NHOST_REGION,
});

// Create GraphQL Client
const graphqlClient = new GraphQLClient(nhost.graphql.getUrl(), {
  headers: {
    'x-hasura-admin-secret': import.meta.env.VITE_HASURA_ADMIN_SECRET || '',
  },
});

// Define the GraphQL query
const GET_ARTICLES = gql`
  query GetArticles {
    articles {
      id
      title
      summary
      sentiment
      sentiment_explanation
      url
      image_url
      created_at
    }
  }
`;

// Define the Article interface
interface Article {
  id: string;
  title: string;
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  sentiment_explanation: string;
  url: string;
  image_url: string;
  created_at: string;
}

export default function Dashboard() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [savedArticles, setSavedArticles] = useState<string[]>([]);
  const [likedArticles, setLikedArticles] = useState<string[]>([]);
  const [readArticles, setReadArticles] = useState<string[]>([]);
  const [filter, setFilter] = useState<'all' | 'positive' | 'neutral' | 'negative' | 'saved' | 'read'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleArticles, setVisibleArticles] = useState(6); // For pagination

  // Fetch articles from Nhost
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch data from Nhost using GraphQL
        const data = await graphqlClient.request<{ articles: Article[] }>(GET_ARTICLES);

        // Update the articles state
        setArticles(data.articles);
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError('Failed to fetch articles. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // Filter articles based on sentiment, saved status, read status, or search query
  const filteredArticles = articles
    .filter((article) => {
      if (filter === 'saved') {
        return savedArticles.includes(article.id);
      }
      if (filter === 'read') {
        return readArticles.includes(article.id);
      }
      return filter === 'all' ? true : article.sentiment === filter;
    })
    .filter((article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, visibleArticles); // Pagination

  // Get sentiment color for styling
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-green-100 text-green-800';
      case 'negative':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Handle saving/unsaving an article
  const handleSaveArticle = (articleId: string) => {
    if (savedArticles.includes(articleId)) {
      setSavedArticles((prev) => prev.filter((id) => id !== articleId));
      toast.success('Article removed from saved');
    } else {
      setSavedArticles((prev) => [...prev, articleId]);
      toast.success('Article saved');
    }
  };

  // Handle liking/unliking an article
  const handleLikeArticle = (articleId: string) => {
    if (likedArticles.includes(articleId)) {
      setLikedArticles((prev) => prev.filter((id) => id !== articleId));
      toast.success('Article unliked');
    } else {
      setLikedArticles((prev) => [...prev, articleId]);
      toast.success('Article liked');
    }
  };

  // Handle marking an article as read/unread
  const handleMarkAsRead = (articleId: string) => {
    if (readArticles.includes(articleId)) {
      setReadArticles((prev) => prev.filter((id) => id !== articleId));
      toast.success('Article marked as unread');
    } else {
      setReadArticles((prev) => [...prev, articleId]);
      toast.success('Article marked as read');
    }
  };

  // Handle sharing an article
  const handleShareArticle = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  // Load more articles
  const loadMoreArticles = () => {
    setVisibleArticles((prev) => prev + 6);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Toaster position="top-right" />
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Your News Digest</h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-500" />
          </div>
        </div>

        {/* Filters */}
        <div className="mt-4 flex gap-2">
          {(['all', 'positive', 'neutral', 'negative', 'saved', 'read'] as const).map((option) => (
            <button
              key={option}
              onClick={() => setFilter(option)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                filter === option
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}
        </div>

        {/* Articles Grid */}
        {loading && (
          <div className="flex justify-center mt-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}
        {error && <p className="text-red-600 mt-4">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {filteredArticles.map((article) => (
            <motion.article
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${
                readArticles.includes(article.id) ? 'border-2 border-green-500' : ''
              }`}
            >
              {article.image_url && (
                <img
                  src={article.image_url}
                  alt={article.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(
                      article.sentiment
                    )}`}
                  >
                    {article.sentiment.charAt(0).toUpperCase() + article.sentiment.slice(1)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {format(new Date(article.created_at), 'MMM d, yyyy')}
                  </span>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {article.title}
                </h2>
                <p className="text-gray-600 mb-4">{article.summary}</p>
                <p className="text-sm text-gray-500 mb-4">
                  {article.sentiment_explanation}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleSaveArticle(article.id)}
                      className={`${
                        savedArticles.includes(article.id)
                          ? 'text-blue-600'
                          : 'text-gray-500 hover:text-blue-600'
                      }`}
                    >
                      <Bookmark className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleLikeArticle(article.id)}
                      className={`${
                        likedArticles.includes(article.id)
                          ? 'text-red-600'
                          : 'text-gray-500 hover:text-red-600'
                      }`}
                    >
                      <Heart className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleShareArticle(article.url)}
                      className="text-gray-500 hover:text-blue-600"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleMarkAsRead(article.id)}
                      className={`${
                        readArticles.includes(article.id)
                          ? 'text-green-600'
                          : 'text-gray-500 hover:text-green-600'
                      }`}
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  </div>
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Read More →
                  </a>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Load More Button */}
        {visibleArticles < articles.length && (
          <div className="flex justify-center mt-8">
            <button
              onClick={loadMoreArticles}
              className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
            >
              Load More
            </button>
          </div>
        )}
      </div>
    </div>
  );
}