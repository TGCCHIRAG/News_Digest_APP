import { useState, useEffect } from 'react';
import { NhostClient, useAccessToken } from '@nhost/react';
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

// Initialize GraphQL Client once with admin secret
const graphqlClient = new GraphQLClient(nhost.graphql.getUrl(), {
  headers: {
    'x-hasura-admin-secret': import.meta.env.VITE_HASURA_ADMIN_SECRET || '',
  },
});

// GraphQL query
const GET_ARTICLES = gql`
  query GetArticles {
    articles {
      id
      title
      summary
      sentiment
      sentiment_explanation
      type
      url
      image_url
      created_at
    }
  }
`;

interface Article {
  id: string;
  title: string;
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  sentiment_explanation: string;
  type: string;
  url: string;
  image_url: string;
  created_at: string;
}

const bounceVariant = {
  initial: { scale: 1 },
  animate: { scale: 1.2, transition: { duration: 0.2, yoyo: 2 } },
};

const fadeVariant = {
  initial: { opacity: 1 },
  animate: { opacity: 0.5, transition: { duration: 0.2, yoyo: 2 } },
};

export default function Dashboard() {
  const accessToken = useAccessToken();
  const [articles, setArticles] = useState<Article[]>([]);
  const [savedArticles, setSavedArticles] = useState<string[]>([]);
  const [likedArticles, setLikedArticles] = useState<string[]>([]);
  const [readArticles, setReadArticles] = useState<string[]>([]);
  const [filter, setFilter] = useState<'all' | 'positive' | 'neutral' | 'negative' | 'saved' | 'read'>('all');
  const [preference, setPreference] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleArticles, setVisibleArticles] = useState(6);

  // Update only the Authorization header when token changes
  useEffect(() => {
    if (accessToken) {
      graphqlClient.setHeader('Authorization', `Bearer ${accessToken}`);
    } else {
      graphqlClient.setHeader('Authorization', '');
    }
  }, [accessToken]);

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

  const handleSaveArticle = (articleId: string) => {
    if (savedArticles.includes(articleId)) {
      setSavedArticles((prev) => prev.filter((id) => id !== articleId));
      toast.success('Article removed from saved');
    } else {
      setSavedArticles((prev) => [...prev, articleId]);
      toast.success('Article saved');
    }
  };

  const handleLikeArticle = (articleId: string) => {
    if (likedArticles.includes(articleId)) {
      setLikedArticles((prev) => prev.filter((id) => id !== articleId));
      toast.success('Article unliked');
    } else {
      setLikedArticles((prev) => [...prev, articleId]);
      toast.success('Article liked');
    }
  };

  const handleMarkAsRead = (articleId: string) => {
    if (readArticles.includes(articleId)) {
      setReadArticles((prev) => prev.filter((id) => id !== articleId));
      toast.success('Article marked as unread');
    } else {
      setReadArticles((prev) => [...prev, articleId]);
      toast.success('Article marked as read');
    }
  };

  const handleShareArticle = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  const removeDuplicateArticles = (articles: Article[]): Article[] => {
    const uniqueTitles = new Set<string>();
    return articles.filter((article) => {
      if (uniqueTitles.has(article.title)) {
        return false;
      }
      uniqueTitles.add(article.title);
      return true;
    });
  };

  // Fetch articles - runs only once on mount
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await graphqlClient.request<{ articles: Article[] }>(GET_ARTICLES);
        const uniqueArticles = removeDuplicateArticles(data.articles);
        const sortedArticles = uniqueArticles.sort((a, b) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        setArticles(sortedArticles);
      } catch (err) {
        console.error('Error fetching articles:', err);
        setError('Failed to fetch articles. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []); // Empty dependency array means this runs once on mount

  const uniqueTypes = Array.from(new Set(articles.map((article) => article.type)));

  const filteredArticles = articles
    .filter((article) => {
      if (filter === 'saved') return savedArticles.includes(article.id);
      if (filter === 'read') return readArticles.includes(article.id);
      return filter === 'all' ? true : article.sentiment === filter;
    })
    .filter((article) => (preference === 'all' ? true : article.type === preference))
    .filter((article) => article.title.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleLoadMore = () => {
    setVisibleArticles((prev) => prev + 6);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Toaster position="top-right" />
      <div className="container mx-auto p-6">
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

        <div className="mt-4 flex gap-2 flex-wrap">
          {(['all', 'positive', 'neutral', 'negative', 'saved', 'read'] as const).map((option) => (
            <button
              key={option}
              onClick={() => setFilter(option)}
              className={`px-4 py-2 rounded-full text-sm font-medium ${
                filter === option ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </button>
          ))}

          <select
            value={preference}
            onChange={(e) => setPreference(e.target.value)}
            className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
          >
            <option value="all">All Types</option>
            {uniqueTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {loading && (
          <div className="flex justify-center mt-8">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        )}
        {error && <p className="text-red-600 mt-4">{error}</p>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {filteredArticles.slice(0, visibleArticles).map((article) => (
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
                <img src={article.image_url} alt={article.title} className="w-full h-48 object-cover" />
              )}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(article.sentiment)}`}>
                    {article.sentiment.charAt(0).toUpperCase() + article.sentiment.slice(1)}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {article.type}
                  </span>
                  <span className="text-sm text-gray-500">
                    {format(new Date(article.created_at), 'MMM d, yyyy')}
                  </span>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 mb-2">{article.title}</h2>
                <p className="text-gray-600 mb-4">{article.summary}</p>
                <p className="text-sm text-gray-500 mb-4">{article.sentiment_explanation}</p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex gap-4">
                    <motion.button
                      onClick={() => handleSaveArticle(article.id)}
                      whileHover={bounceVariant.animate}
                      whileTap={{ scale: 0.9 }}
                      className={`text-gray-500 hover:text-blue-600 transition-colors ${
                        savedArticles.includes(article.id) ? '!text-blue-600' : ''
                      }`}
                    >
                      <Bookmark className="w-5 h-5" />
                    </motion.button>

                    <motion.button
                      onClick={() => handleLikeArticle(article.id)}
                      whileHover={bounceVariant.animate}
                      whileTap={{ scale: 0.9 }}
                      className={`text-gray-500 hover:text-red-600 ${
                        likedArticles.includes(article.id) ? 'text-red-600' : ''
                      }`}
                    >
                      <Heart className="w-5 h-5" />
                    </motion.button>

                    <motion.button
                      onClick={() => handleShareArticle(article.url)}
                      whileHover={bounceVariant.animate}
                      whileTap={{ scale: 0.9 }}
                      className="text-gray-500 hover:text-blue-600"
                    >
                      <Share2 className="w-5 h-5" />
                    </motion.button>

                    <motion.button
                      onClick={() => handleMarkAsRead(article.id)}
                      whileHover={bounceVariant.animate}
                      whileTap={{ scale: 0.9 }}
                      className={`text-gray-500 hover:text-green-600 ${
                        readArticles.includes(article.id) ? 'text-green-600' : ''
                      }`}
                    >
                      <Check className="w-5 h-5" />
                    </motion.button>
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

        {filteredArticles.length > visibleArticles && (
          <div className="flex justify-center mt-8">
            <motion.button
              onClick={handleLoadMore}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
            >
              Load More Articles
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}
