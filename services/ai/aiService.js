// Hàm phân loại prompt
function classifyPrompt(prompt) {
    const promptLower = prompt.toLowerCase();
    
    if (promptLower.includes('ngạn ngữ') || promptLower.includes('ca dao')) {
        return 'Ngạn ngữ';
    } else if (promptLower.includes('thơ') || promptLower.includes('bài thơ')) {
        return 'Bài thơ hay về hôn nhân';
    } else if (promptLower.includes('hôn nhân') || promptLower.includes('vợ chồng')) {
        return 'Câu nói hay về hôn nhân';
    }
    
    return 'all';
}

// Function to get AI generated recommendation
async function getAIGeneratedRecommendation(prompt, googleSheetData) {
    try {
        // Phân loại prompt
        const promptType = classifyPrompt(prompt);
        const promptLower = prompt.toLowerCase();
        
        // Lọc dữ liệu dựa trên loại prompt và từ khóa
        let filteredData = googleSheetData.filter(item => {
            if (promptType === 'all') return true;
            
            // Kiểm tra category
            const categoryMatch = item.category.toLowerCase().includes(promptType.toLowerCase());
            
            // Kiểm tra từ khóa
            const keywordMatch = item.keyword && item.keyword.toLowerCase().includes(promptLower);
            
            // Kiểm tra nội dung
            const contentMatch = item.content.toLowerCase().includes(promptLower);
            
            return categoryMatch || keywordMatch || contentMatch;
        });

        if (filteredData.length === 0) {
            // Tìm các từ khóa liên quan
            const relatedKeywords = googleSheetData
                .filter(item => item.keyword)
                .map(item => item.keyword.toLowerCase())
                .filter(keyword => keyword.includes(promptLower) || promptLower.includes(keyword))
                .slice(0, 5);

            return {
                message: "Không tìm thấy nội dung phù hợp với yêu cầu của bạn.",
                suggestions: [
                    "Bạn có thể thử tìm kiếm với các từ khóa như:",
                    ...relatedKeywords.map(keyword => `- ${keyword}`),
                    "Hoặc bạn có thể cho biết thêm về ngữ cảnh cụ thể bạn muốn sử dụng"
                ],
                categories: [...new Set(googleSheetData.map(item => item.category))]
            };
        }

        // Chọn ngẫu nhiên 3 câu khác nhau từ dữ liệu đã lọc
        const selectedQuotes = [];
        const usedIndices = new Set();
        
        while (selectedQuotes.length < 3 && usedIndices.size < filteredData.length) {
            const randomIndex = Math.floor(Math.random() * filteredData.length);
            if (!usedIndices.has(randomIndex)) {
                usedIndices.add(randomIndex);
                selectedQuotes.push(filteredData[randomIndex]);
            }
        }

        // Tạo message dựa trên loại nội dung
        let categoryMessage = "";
        let additionalInfo = "";
        
        switch(selectedQuotes[0].category) {
            case "Ngạn ngữ":
                categoryMessage = "Đây là một số câu ngạn ngữ dân gian:";
                additionalInfo = "\n\nĐây là những câu ngạn ngữ dân gian, thường được sử dụng trong các dịp lễ cưới hoặc để bày tỏ tình cảm.";
                break;
            case "Câu nói hay về hôn nhân":
                categoryMessage = "Đây là một số câu nói hay về hôn nhân:";
                additionalInfo = "\n\nĐây là những câu nói ý nghĩa về hôn nhân, có thể dùng làm lời chúc mừng hoặc chia sẻ kinh nghiệm.";
                break;
            case "Bài thơ hay về hôn nhân":
                categoryMessage = "Đây là một số bài thơ hay về hôn nhân:";
                additionalInfo = "\n\nĐây là những bài thơ về tình yêu và hôn nhân, có thể dùng làm lời chúc mừng đám cưới hoặc bày tỏ tình cảm.";
                break;
        }

        // Tạo response với 3 câu trả lời
        const responses = selectedQuotes.map((quote, index) => ({
            quote: quote.content,
            category: quote.category,
            keyword: quote.keyword
        }));

        // Tạo response với các lựa chọn thay thế được phân loại
        const alternatives = filteredData
            .filter((_, index) => !usedIndices.has(index))
            .slice(0, 3)
            .reduce((acc, item) => {
                if (!acc[item.category]) {
                    acc[item.category] = [];
                }
                acc[item.category].push({
                    content: item.content,
                    keyword: item.keyword
                });
                return acc;
            }, {});

        return {
            categoryMessage,
            additionalInfo,
            responses: responses,
            alternatives: alternatives,
            context: {
                promptType: promptType,
                totalMatches: filteredData.length,
                categories: [...new Set(filteredData.map(item => item.category))],
                matchedKeywords: [...new Set(filteredData
                    .filter(item => item.keyword)
                    .map(item => item.keyword))]
            }
        };
    } catch (error) {
        console.error('Error generating AI recommendation:', error);
        throw new Error('Failed to generate recommendation');
    }
}

module.exports = {
    getAIGeneratedRecommendation,
    classifyPrompt
}; 