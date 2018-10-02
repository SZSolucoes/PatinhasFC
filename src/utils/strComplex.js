
export const limitDotText = (text, maxSize) => {
    return text.length > maxSize ? `${text.substring(0, maxSize - 3)}...` : text;
};

