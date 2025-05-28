# Math Rendering with KaTeX in FStudyMate

This guide explains how to use the math rendering capabilities in FStudyMate, which are powered by KaTeX.

## Overview

FStudyMate supports rendering of mathematical formulas and equations using KaTeX. This feature is particularly useful for subjects like mathematics, physics, statistics, and engineering.

## Libraries Used

- **remark-math**: Markdown processor plugin that parses math content
- **rehype-katex**: HTML processor plugin that renders the parsed math using KaTeX
- **katex**: The core KaTeX library for rendering math expressions

## Basic Usage

### In React Components

To render math in a React component:

```jsx
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const MathContent = ({ content }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
    >
      {content}
    </ReactMarkdown>
  );
};

export default MathContent;
```

### Sample Usage

```jsx
import MathContent from '../components/MathContent';

const MyComponent = () => {
  const mathText = `
  # Quadratic Formula
  
  The solution to a quadratic equation $ax^2 + bx + c = 0$ is given by:
  
  $$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$
  
  ## Examples
  
  1. For $x^2 + 5x + 6 = 0$:
     - $a = 1$, $b = 5$, $c = 6$
     - $x = \\frac{-5 \\pm \\sqrt{25 - 24}}{2} = \\frac{-5 \\pm 1}{2}$
     - $x = -3$ or $x = -2$
  `;
  
  return (
    <div className="math-example">
      <MathContent content={mathText} />
    </div>
  );
};
```

## Syntax

### Inline Math

For inline math expressions, use single dollar signs:

```
The area of a circle is $A = \pi r^2$.
```

This renders as: The area of a circle is $A = \pi r^2$.

### Block Math

For block-level math expressions, use double dollar signs:

```
$$
\begin{pmatrix}
a & b \\
c & d
\end{pmatrix}
$$
```

This renders as a matrix:

$$
\begin{pmatrix}
a & b \\
c & d
\end{pmatrix}
$$

## Common Math Symbols

| Symbol | Syntax | Description |
|--------|--------|-------------|
| $\alpha, \beta, \gamma$ | `\alpha, \beta, \gamma` | Greek letters |
| $\sum_{i=1}^{n}$ | `\sum_{i=1}^{n}` | Summation |
| $\int_{a}^{b}$ | `\int_{a}^{b}` | Integral |
| $\frac{a}{b}$ | `\frac{a}{b}` | Fraction |
| $\sqrt{x}$ | `\sqrt{x}` | Square root |
| $\overline{AB}$ | `\overline{AB}` | Line segment |
| $\vec{v}$ | `\vec{v}` | Vector |
| $\lim_{x \to \infty}$ | `\lim_{x \to \infty}` | Limit |
| $\sin \theta$ | `\sin \theta` | Trigonometric functions |

## Advanced Features

### Aligned Equations

Use the `align` environment for multiple aligned equations:

```
$$
\begin{align}
E &= mc^2 \\
F &= ma \\
PV &= nRT
\end{align}
$$
```

### Matrices

```
$$
\begin{pmatrix}
1 & 0 & 0 \\
0 & 1 & 0 \\
0 & 0 & 1
\end{pmatrix}
$$
```

### Chemical Equations

```
$$
\ce{H2O + CO2 -> H2CO3}
$$
```

## Implementation Details

### Configuration

The KaTeX configuration is set up in the MathTest.js file:

```jsx
// MathTest.js
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

const MathTest = () => {
  const mathContent = `
  # Math Test Page
  
  ## Inline Math
  
  Inline math: $E = mc^2$
  
  ## Block Math
  
  $$
  \\int_{a}^{b} f(x) \\, dx = F(b) - F(a)
  $$
  `;

  return (
    <div className="container mx-auto p-4">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {mathContent}
      </ReactMarkdown>
    </div>
  );
};

export default MathTest;
```

### CSS Imports

Make sure to import the KaTeX CSS in your component or in a global stylesheet:

```jsx
import 'katex/dist/katex.min.css';
```

## Best Practices

1. **Escaping Backslashes**: In JavaScript strings, backslashes need to be escaped, so use double backslashes for LaTeX commands (e.g., `\\frac` instead of `\frac`).

2. **Performance**: Rendering complex math formulas can be computationally expensive. Consider memoizing components that render math to prevent unnecessary re-renders.

3. **Accessibility**: Add proper `aria-label` attributes to math elements for screen readers:

```jsx
<div aria-label="The quadratic formula: x equals negative b plus or minus the square root of b squared minus 4ac, all divided by 2a">
  <MathContent content="$$x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$" />
</div>
```

4. **Mobile Responsiveness**: Ensure that long equations can wrap or scroll horizontally on mobile devices:

```css
.math-container {
  max-width: 100%;
  overflow-x: auto;
}
```

## Troubleshooting

### Common Issues

1. **Formulas Not Rendering**: Make sure KaTeX CSS is properly imported and that the syntax is correct.

2. **Syntax Errors**: Check for proper LaTeX syntax and remember to escape backslashes in JavaScript strings.

3. **Missing Symbols**: Some advanced LaTeX symbols might not be supported by KaTeX. Check the [KaTeX supported functions documentation](https://katex.org/docs/supported.html).

### Error Handling

Add error handling to prevent math rendering failures from breaking your application:

```jsx
<ReactMarkdown
  remarkPlugins={[remarkMath]}
  rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: false }]]}
>
  {content}
</ReactMarkdown>
```

## Resources

- [KaTeX Documentation](https://katex.org/docs/api.html)
- [LaTeX Math Symbols Cheat Sheet](https://www.caam.rice.edu/~heinken/latex/symbols.pdf)
- [React Markdown Documentation](https://remarkjs.github.io/react-markdown/)

## Demo Page

Visit the `/math-test` route in the application to see a live demo of math rendering capabilities. 