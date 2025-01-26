import React from 'react';

const HighlightedText = ({ text, indexes }) => {

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
                            fontFamily: 'Arial, sans-serif', // Replace with the appropriate font
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
