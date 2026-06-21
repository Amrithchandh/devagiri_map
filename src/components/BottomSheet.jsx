import React, { useState } from 'react';
import { courses, destinations } from '../data/courses';

export default function BottomSheet({ 
  courseType, 
  setCourseType, 
  searchQuery, 
  setSearchQuery, 
  selectedCourse, 
  setSelectedCourse,
  destinationBlock,
  onRecenter,
  onReset
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Filter by category (Aided / Self Financing) and search query
  const filteredCourses = courses.filter(c => 
    c.category === courseType && c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDestinations = searchQuery
    ? destinations.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  const combinedResults = [...filteredCourses, ...filteredDestinations];

  return (
    <div className={`bottom-sheet ${isExpanded ? 'expanded' : ''}`}>
      <div className="drag-handle" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="bar"></div>
      </div>
      
      <div className="type-toggle">
        <button 
          className={`toggle-btn ${courseType === 'Aided' ? 'active' : ''}`}
          onClick={() => { setCourseType('Aided'); setSelectedCourse(null); setSearchQuery(''); }}
        >
          AIDED
        </button>
        <button 
          className={`toggle-btn ${courseType === 'Self Financing' ? 'active' : ''}`}
          onClick={() => { setCourseType('Self Financing'); setSelectedCourse(null); setSearchQuery(''); }}
        >
          SELF FINANCING
        </button>
      </div>

      <div className="search-section">
        <label>Search Course: <span>eg. BSc Chemistry</span></label>
        <input 
          type="text" 
          placeholder="Type to search..." 
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setSelectedCourse(null); }}
          onFocus={() => setIsExpanded(true)}
        />
        
        {searchQuery && !selectedCourse && (
          <ul className="suggestions">
            {combinedResults.map((course, index) => (
              <li key={`${course.name}-${index}`} onClick={() => {
                setSelectedCourse(course);
                setSearchQuery(course.name);
                setIsExpanded(false);
              }}>
                {course.name} → {course.label ? course.label : `Block ${course.block}`}
              </li>
            ))}
            {combinedResults.length === 0 && <li className="empty">No results found</li>}
          </ul>
        )}
      </div>

      <div className="destination-display">
        <strong>Destination:</strong> {
          selectedCourse 
            ? (selectedCourse.label ? selectedCourse.label : `Academic Block ${selectedCourse.block}`) 
            : 'Select a destination'
        }
      </div>

      <div className="action-buttons">
        <button className="primary-btn" onClick={onRecenter}>RECENTER MAP</button>
        <button className="secondary-btn" onClick={onReset}>RESET ROUTE</button>
      </div>
    </div>
  );
}
