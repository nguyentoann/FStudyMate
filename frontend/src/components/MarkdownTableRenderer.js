import React from 'react';
import { useTheme } from '../context/ThemeContext';

/**
 * Component for rendering Markdown tables as HTML tables
 */
const MarkdownTableRenderer = ({ content }) => {
  const { darkMode } = useTheme();
  
  if (!content || !content.includes('|')) {
    return null;
  }
  
  const renderTable = () => {
    try {
      // Remove code fence markers if present
      let processedContent = content.trim();
      if (processedContent.startsWith('```')) {
        // Remove opening fence and language identifier if present
        const firstLineBreak = processedContent.indexOf('\n');
        if (firstLineBreak !== -1) {
          processedContent = processedContent.substring(firstLineBreak + 1);
        }
        
        // Remove closing fence if present
        if (processedContent.endsWith('```')) {
          processedContent = processedContent.substring(0, processedContent.lastIndexOf('```'));
        } else {
          // Find last ``` if it's not at the very end
          const lastFenceIndex = processedContent.lastIndexOf('```');
          if (lastFenceIndex !== -1) {
            processedContent = processedContent.substring(0, lastFenceIndex);
          }
        }
        
        processedContent = processedContent.trim();
      }
      
      // Split content into lines
      const lines = processedContent.split('\n');
      
      // Need at least 3 lines for a proper table (header, separator, data)
      if (lines.length < 3) return null;
      
      // Check if second line is a separator (contains dashes)
      const isSeparator = (line) => /^\|[\s-:|]+\|/.test(line);
      if (!isSeparator(lines[1])) return null;
      
      // Find the end of the table (first line that doesn't start with |)
      let tableEndIndex = lines.findIndex((line, index) => 
        index > 1 && !line.trim().startsWith('|')
      );
      
      // If no non-pipe line was found, use all lines
      if (tableEndIndex === -1) {
        tableEndIndex = lines.length;
      }
      
      // Extract table lines and footer text
      const tableLines = lines.slice(0, tableEndIndex);
      const footerText = tableEndIndex < lines.length 
        ? lines.slice(tableEndIndex).join('\n') 
        : '';
      
      // Parse header cells
      const headerRow = tableLines[0];
      const headers = parseCells(headerRow);
      
      // Parse data rows (skip header and separator)
      const dataRows = tableLines.slice(2).map(row => parseCells(row));
      
      return (
        <>
          <div className="overflow-auto my-4">
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              margin: '16px 0',
              border: '1px solid #e5e7eb'
            }}>
              <thead style={{
                backgroundColor: darkMode ? '#1e293b' : '#f8fafc',
                fontWeight: 'bold'
              }}>
                <tr>
                  {headers.map((header, i) => (
                    <th key={i} style={{
                      border: '1px solid #e5e7eb',
                      padding: '8px 12px',
                      textAlign: 'left'
                    }}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataRows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} style={{
                        border: '1px solid #e5e7eb',
                        padding: '8px 12px',
                        textAlign: 'left'
                      }}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Render footer text if present */}
          {footerText && (
            <div className="my-2" style={{ fontSize: '0.9em', color: darkMode ? '#9ca3af' : '#6b7280' }}>
              {footerText}
            </div>
          )}
        </>
      );
    } catch (error) {
      console.error("Error rendering Markdown table:", error);
      return <pre>{content}</pre>;
    }
  };
  
  // Helper function to parse cells from a table row string
  const parseCells = (rowString) => {
    // Remove starting and ending pipe characters
    const trimmedRow = rowString.trim().replace(/^\||\|$/g, '');
    // Split by pipe character and trim each cell
    return trimmedRow.split('|').map(cell => cell.trim());
  };
  
  return renderTable();
};

export default MarkdownTableRenderer; 