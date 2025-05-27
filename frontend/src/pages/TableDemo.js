import React, { useState } from 'react';
import MarkdownTableRenderer from '../components/MarkdownTableRenderer';

const TableDemo = () => {
  const [tableMarkdown, setTableMarkdown] = useState(`| Number         | Kanji  | Hiragana    | Romaji   |
|----------------|--------|-------------|----------|
| 100            | 百      | ひゃく       | hyaku    |
| 101            | 百一    | ひゃくいち   | hyakuichi|
| 200            | 二百    | にひゃく     | nihyaku  |
| 300            | 三百    | さんびゃく   | sanbyaku |
| 400            | 四百    | よんひゃく   | yonhyaku |
| 500            | 五百    | ごひゃく     | gohyaku  |`);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Markdown Table Demo</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Input</h2>
          <textarea
            className="w-full h-64 p-2 border rounded"
            value={tableMarkdown}
            onChange={(e) => setTableMarkdown(e.target.value)}
          />
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-2">Rendered Output</h2>
          <div className="border rounded p-4 min-h-64 bg-white">
            <MarkdownTableRenderer content={tableMarkdown} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableDemo; 