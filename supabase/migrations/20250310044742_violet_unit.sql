/*
  # Create articles table for news digest

  1. New Tables
    - `articles`
      - `id` (uuid, primary key)
      - `title` (text)
      - `summary` (text)
      - `sentiment` (text)
      - `sentiment_explanation` (text)
      - `url` (text)
      - `image_url` (text)
      - `created_at` (timestamp)
      - `user_id` (uuid, foreign key)

  2. Security
    - Enable RLS on `articles` table
    - Add policies for authenticated users to:
      - Read all articles
      - Create articles (admin only)
      - Update their saved/read status
*/   

CREATE TABLE articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  summary text NOT NULL,
  sentiment text NOT NULL CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  explanation text NOT NULL,
  url text NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id)
);

ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read articles
CREATE POLICY "Users can read all articles"
  ON articles
  FOR SELECT
  TO authenticated
  USING (true);

-- Only allow specific users (admins) to create articles
CREATE POLICY "Only admins can create articles"
  ON articles
  FOR INSERT
  TO authenticated
  USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE email = 'admin@example.com'
  ));