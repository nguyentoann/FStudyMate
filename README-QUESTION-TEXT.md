# Question Text Feature Implementation

This update adds support for displaying question text with Markdown formatting in the quiz feature. The following changes have been implemented:

## Database Changes

1. Added a `QuestionText` column to the `Questions` table:
   ```sql
   ALTER TABLE Questions ADD COLUMN QuestionText LONGTEXT;
   ```

## Model Changes

1. Added the `questionText` field to the `Question` model in:
   - `FStudyMate/src/main/java/com/mycompany/fstudymate/model/Question.java`
   - `FStudyMate/src/main/java/model/Question.java`

2. Updated the DAO class to retrieve the question text from the database:
   - `FStudyMate/src/main/java/dao/QuestionDAO.java`

## UI Changes

1. Modified the Quiz component to display question text with Markdown support:
   - Added `ReactMarkdown` for rendering Markdown formatted text
   - Added condition to display questions with:
     - Only text (when image is not available)
     - Only image (when text is not available)
     - Both text and image (when both are available)
   - Updated the results view to show question text alongside images

## How to Use

1. Execute the SQL script in `sql/add_question_text_column.sql` to add the required column to your database.
2. Rebuild and restart the application.
3. Add question text to the database using Markdown formatting.
4. The text will be displayed in the quiz feature, formatted according to Markdown syntax.

## Markdown Support

The question text supports standard Markdown formatting:
- **Bold text**: `**bold**`
- *Italic text*: `*italic*`
- Lists: `- item` or `1. item`
- Headers: `# Header` or `## Subheader`
- Links: `[text](url)`
- Images: `![alt text](image-url)`
- Code blocks: ``` code ``` 