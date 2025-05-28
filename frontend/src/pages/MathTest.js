import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const MathTest = () => {
  const [text, setText] = useState(`# Math Rendering Test

## Inline Math Examples

- The Pythagorean theorem is $a^2 + b^2 = c^2$.
- Einstein's famous equation: $E = mc^2$
- The quadratic formula: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$

## Math Blocks Examples

$$
\\begin{aligned}
\\nabla \\times \\vec{\\mathbf{B}} -\\, \\frac1c\\, \\frac{\\partial\\vec{\\mathbf{E}}}{\\partial t} & = \\frac{4\\pi}{c}\\vec{\\mathbf{j}} \\\\
\\nabla \\cdot \\vec{\\mathbf{E}} & = 4 \\pi \\rho \\\\
\\nabla \\times \\vec{\\mathbf{E}}\\, +\\, \\frac1c\\, \\frac{\\partial\\vec{\\mathbf{B}}}{\\partial t} & = \\vec{\\mathbf{0}} \\\\
\\nabla \\cdot \\vec{\\mathbf{B}} & = 0
\\end{aligned}
$$

### Matrices

$$
\\begin{pmatrix}
a & b \\\\
c & d
\\end{pmatrix}
$$

### Fractions

$$
\\frac{n!}{k!(n-k)!} = \\binom{n}{k}
$$

### Summations

$$
\\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}
$$

## Try Editing

Use the textarea below to try your own math expressions:

`);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Math Rendering Test Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-2">Edit Markdown with Math</h2>
          <textarea
            className="w-full h-96 p-4 border rounded font-mono"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">Rendered Output</h2>
          <div className="border rounded p-4 prose prose-sm max-w-none min-h-96 bg-white">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {text}
            </ReactMarkdown>
          </div>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">Syntax Guide</h2>
        <ul className="list-disc pl-6">
          <li><strong>Inline Math:</strong> Use single dollar signs like <code>$formula$</code></li>
          <li><strong>Block Math:</strong> Use double dollar signs like <code>$$formula$$</code></li>
          <li><strong>Escaping Backslashes:</strong> Double your backslashes in JavaScript strings</li>
        </ul>
      </div>
    </div>
  );
};

export default MathTest; 