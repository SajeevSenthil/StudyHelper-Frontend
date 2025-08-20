-- Add custom_title column to user_quizzes table to allow users to save quizzes with custom names
ALTER TABLE user_quizzes 
ADD COLUMN custom_title TEXT;
