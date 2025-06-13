const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

async function getFlexibleAIResponse(userInput, intent, googleSheetData) {
    const defaultSuggestions = [
        "câu ngạn ngữ về hôn nhân",
        "câu nói về hôn nhân",
        "bài thơ về hôn nhân"
    ];

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
        let contextPrompt = "";
        const basePersona = "Bạn là một trợ lý AI chuyên về chủ đề hôn nhân và tình yêu, được tích hợp dữ liệu các câu nói hay cho thiệp cưới từ Google Sheet. Hãy giao tiếp thân thiện, tự nhiên và ngắn gọn.\n\n";

        if (intent === "greeting") {
            contextPrompt = basePersona + `Người dùng nói: "${userInput}". Hãy chào lại một cách thân thiện và tự nhiên. Bạn có thể hỏi họ cần giúp gì liên quan đến việc tìm kiếm câu nói hay cho thiệp cưới.`;
        } else if (intent === "find_wedding_saying") {
            contextPrompt = basePersona;
            let sheetDataPrompt = "";
            if (googleSheetData && googleSheetData.length > 0) {
                sheetDataPrompt += "Dưới đây là dữ liệu các câu nói tham khảo:\n";
                googleSheetData.forEach(item => {
                    sheetDataPrompt += `- "${item.content}" (Danh mục: ${item.category})\n`;
                });
                sheetDataPrompt += "\n";
            } else {
                sheetDataPrompt = "Hiện tại không có dữ liệu câu nói nào được cung cấp trực tiếp cho bạn.\n";
            }
            contextPrompt += `Người dùng muốn tìm nội dung liên quan đến: "${userInput}".\n${sheetDataPrompt}Dựa VÀO DỮ LIỆU ĐƯỢC CUNG CẤP Ở TRÊN và kiến thức của bạn về hôn nhân, hãy tìm và trả về tối đa 3 câu phù hợp nhất với yêu cầu. Mỗi câu nói cần được đánh số thứ tự (1., 2., 3.) và đặt trong dấu ngoặc kép. Nếu yêu cầu của người dùng không rõ ràng hoặc không thể tìm thấy bất kỳ nội dung nào phù hợp dưới dạng danh sách các câu nói, hãy trả lời bằng một câu văn bình thường để giải thích hoặc làm rõ (ví dụ: "Yêu cầu của bạn chưa cụ thể lắm, bạn có thể nói rõ hơn không?"). Nếu không tìm thấy gì cả, hãy thông báo: "Xin lỗi, tôi không tìm thấy nội dung nào phù hợp với yêu cầu '${userInput}'."`;
        } else {
            contextPrompt = basePersona + `Người dùng nói: "${userInput}". Yêu cầu này có vẻ không liên quan trực tiếp đến việc tìm kiếm câu nói cho thiệp cưới từ dữ liệu được cung cấp. Hãy lịch sự thông báo rằng bạn chỉ được thiết kế để hỗ trợ tìm kiếm các câu nói, thơ, ngạn ngữ về hôn nhân và tình yêu từ dữ liệu có sẵn. Sau đó, bạn có thể đưa ra các gợi ý (defaultSuggestions).`;
        }

        const result = await model.generateContent(contextPrompt);
        const response = await result.response;
        let text = response.text();
        let mainResponseText = text;
        let structured_quotes = [];

        if (intent === "greeting") {
            if (text && text.trim().length > 5) {
                return { response_text: text, is_greeting: true };
            } else {
                return {
                    response_text: "Xin chào! Tôi có thể giúp bạn tìm những câu nói hay cho ngày cưới.",
                    is_greeting: true
                };
            }
        }

        const isNotFoundByAI = text.toLowerCase().includes("xin lỗi, tôi không tìm thấy nội dung nào phù hợp với yêu cầu '" + userInput.toLowerCase() + "'");


        if (isNotFoundByAI) {
             return {
                message: text,
                is_not_found: true,
            };
        }

        if (intent === "find_wedding_saying") {
            const lines = text.split('\n');
            const potentialQuotes = lines
                .map(line => line.replace(/^\d+\.\s*["']?|["']?$/g, '').trim())
                .filter(line => line.length > 0);

            const looksLikeList = lines.some(line => /^\d+\.\s/.test(line.trim()));

            if (looksLikeList && potentialQuotes.length > 0) {
                structured_quotes = potentialQuotes;
                mainResponseText = "Dưới đây là một vài gợi ý cho bạn:";
            } else {
            }
        }
        
        if (intent !== "find_wedding_saying" && intent !== "greeting") {
            return {
               response_text: mainResponseText,
               is_out_of_scope: true,
               suggestions: defaultSuggestions
           };
       }

        return {
            response_text: mainResponseText,
            structured_quotes: structured_quotes.length > 0 ? structured_quotes : null,
        };

    } catch (error) {
        console.error("Error calling Gemini API:", error.message);
        return {
            error_occurred: true,
            message: "Xin lỗi, đã có lỗi xảy ra khi kết nối với trợ lý AI. Vui lòng thử lại sau.",
            suggestions: defaultSuggestions
        };
    }
}

module.exports = {
    getFlexibleAIResponse
};