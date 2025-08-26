import { useState, useRef, useEffect } from 'react';
import { Search, Loader2, Clock, Lightbulb, X } from 'lucide-react';
import { useAutocomplete } from '../hooks/useHealthcareData';
import { debounce } from '../utils/api';

const SearchInput = ({ 
  value, 
  onChange, 
  onSubmit, 
  loading = false, 
  placeholder = "Ask a healthcare question...",
  showHistory = true,
  queryHistory = []
}) => {
  const [focused, setFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  
  const { suggestions, generateSuggestions, clearSuggestions } = useAutocomplete();
  
  // Debounced suggestion generation
  const debouncedGenerateSuggestions = debounce(generateSuggestions, 300);
  
  // Handle input change
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Generate suggestions
    debouncedGenerateSuggestions(newValue);
    setSelectedIndex(-1);
    setShowSuggestions(true);
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value.trim());
      setShowSuggestions(false);
      clearSuggestions();
    }
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    const totalSuggestions = suggestions.length + (showHistory ? queryHistory.length : 0);
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < totalSuggestions - 1 ? prev + 1 : -1
        );
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > -1 ? prev - 1 : totalSuggestions - 1
        );
        break;
        
      case 'Enter':
        if (selectedIndex >= 0) {
          e.preventDefault();
          const allItems = [...suggestions, ...(showHistory ? queryHistory : [])];
          const selectedItem = allItems[selectedIndex];
          const selectedText = selectedItem.text || selectedItem.query;
          onChange(selectedText);
          onSubmit(selectedText);
          setShowSuggestions(false);
          setSelectedIndex(-1);
        }
        break;
        
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };
  
  // Handle focus events
  const handleFocus = () => {
    setFocused(true);
    if (value.length >= 2 || queryHistory.length > 0) {
      setShowSuggestions(true);
    }
  };
  
  const handleBlur = () => {
    // Delay hiding suggestions to allow clicking
    setTimeout(() => {
      setFocused(false);
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }, 150);
  };
  
  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    const text = suggestion.text || suggestion.query;
    onChange(text);
    onSubmit(text);
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };
  
  // Clear input
  const handleClear = () => {
    onChange('');
    clearSuggestions();
    setShowSuggestions(false);
    inputRef.current?.focus();
  };
  
  // Format query history for display
  const formatQueryHistory = (historyItem) => {
    const timeAgo = new Date(historyItem.timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return {
      ...historyItem,
      displayText: historyItem.query,
      subtitle: `${historyItem.resultCount} results • ${timeAgo}`,
    };
  };
  
  // Show suggestions or history
  const showDropdown = focused && showSuggestions && 
    (suggestions.length > 0 || (showHistory && queryHistory.length > 0));
  
  return (
    <div className="relative w-full">
      {/* Search Form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Search 
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"
            aria-hidden="true"
          />
          
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={loading}
            className="medical-input pl-12 pr-20 text-lg"
            aria-label="Healthcare query input"
            aria-expanded={showDropdown}
            aria-haspopup="listbox"
            aria-autocomplete="list"
            autoComplete="off"
          />
          
          {/* Clear Button */}
          {value && !loading && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-16 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={!value.trim() || loading}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 btn-medical px-4 py-2 disabled:opacity-50"
            aria-label="Search"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Search'
            )}
          </button>
        </div>
      </form>
      
      {/* Suggestions Dropdown */}
      {showDropdown && (
        <div 
          ref={suggestionsRef}
          className="autocomplete-dropdown"
          role="listbox"
          aria-label="Search suggestions"
        >
          {/* Suggestions */}
          {suggestions.length > 0 && (
            <>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 border-b">
                <div className="flex items-center">
                  <Lightbulb className="w-3 h-3 mr-2" />
                  Suggestions
                </div>
              </div>
              
              {suggestions.map((suggestion, index) => (
                <div
                  key={`suggestion-${index}`}
                  className={`autocomplete-item ${selectedIndex === index ? 'selected' : ''}`}
                  onClick={() => handleSuggestionClick(suggestion)}
                  role="option"
                  aria-selected={selectedIndex === index}
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {suggestion.text}
                    </div>
                    {suggestion.description && (
                      <div className="text-sm text-gray-500 mt-1">
                        {suggestion.description}
                      </div>
                    )}
                  </div>
                  
                  <div className="ml-2 flex items-center space-x-2">
                    {suggestion.confidence && (
                      <div className="flex items-center">
                        <div className="w-12 bg-gray-200 rounded-full h-1.5 mr-2">
                          <div 
                            className={`h-1.5 rounded-full ${
                              suggestion.confidence > 0.8 ? 'bg-green-500' :
                              suggestion.confidence > 0.6 ? 'bg-yellow-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${(suggestion.confidence || 0.5) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-400">
                          {Math.round((suggestion.confidence || 0.5) * 100)}%
                        </span>
                      </div>
                    )}
                    {suggestion.category && (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        suggestion.type === 'smart_pattern' ? 'bg-purple-100 text-purple-700' :
                        suggestion.type === 'completion' ? 'bg-blue-100 text-blue-700' :
                        suggestion.type === 'medical_term' ? 'bg-green-100 text-green-700' :
                        suggestion.type === 'condition' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {suggestion.category}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
          
          {/* Query History */}
          {showHistory && queryHistory.length > 0 && (
            <>
              {suggestions.length > 0 && <div className="border-t" />}
              
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 border-b">
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-2" />
                  Recent Queries
                </div>
              </div>
              
              {queryHistory.slice(0, 5).map((historyItem, index) => {
                const adjustedIndex = suggestions.length + index;
                const formatted = formatQueryHistory(historyItem);
                
                return (
                  <div
                    key={`history-${historyItem.id}`}
                    className={`autocomplete-item ${selectedIndex === adjustedIndex ? 'selected' : ''}`}
                    onClick={() => handleSuggestionClick(historyItem)}
                    role="option"
                    aria-selected={selectedIndex === adjustedIndex}
                  >
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">
                        {formatted.displayText}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {formatted.subtitle}
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
          
          {/* No Results */}
          {suggestions.length === 0 && (!showHistory || queryHistory.length === 0) && (
            <div className="px-4 py-3 text-sm text-gray-500 text-center">
              No suggestions available
            </div>
          )}
        </div>
      )}
      
      {/* Example Queries Hint */}
      {!focused && !value && (
        <div className="mt-2 text-sm text-gray-500">
          Try: "Show me all diabetic patients over 50" or "Find female patients with hypertension"
        </div>
      )}
    </div>
  );
};

export default SearchInput;
