import React from 'react';

const HighlightedText = ({ text = '', indexes }) => {
    // Early return if text is null/undefined with a fallback
    if (!text) {
        return null; // or return some fallback UI
    }

    return (
        <>
            {text.split('').map((letter, index) => {
                const isHighlighted = indexes?.includes(index);
                return (
                    <span
                        key={index}
                        style={{
                            textTransform: index === 0 ? 'uppercase' : 'lowercase',
                            color: isHighlighted ? 'red' : '#111920',
                            fontFamily: 'Arial, sans-serif',
                            fontSize: '18px',
                        }}>
                        {letter}
                    </span>
                );
            })}
        </>
    );
}

export default HighlightedText;