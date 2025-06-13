const { getWeddingSayings } = require('../services/google/sheetsService');
const { getFlexibleAIResponse } = require('./googleGenerate');

function isGibberish(prompt) {
    if (!prompt || prompt.trim().length === 0) return true;
    const trimmedPrompt = prompt.trim();
    if (trimmedPrompt.length < 3 && !['thơ', 'hay', 'đẹp', 'vè', 'hò', 'cv', 'ok', 'uk', 'uh'].includes(trimmedPrompt.toLowerCase())) {
        const commonSingleWords = ['có', 'gì', 'mà', 'nào', 'tôi', 'bạn'];
        if (/^(\w)\1+$/.test(trimmedPrompt) && !commonSingleWords.includes(trimmedPrompt.toLowerCase()) ) return true;
    }
    const vietnameseAlphaNumeric = /[a-zA-Zàáâãèéêìíòóôõùúăđĩũơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳýỵỷỹ0-9]/i;
    if (!vietnameseAlphaNumeric.test(trimmedPrompt)) return true;
    const consecutiveConsonants = /[^aeiouyàáâãèéêìíòóôõùúăđĩũơưẠẢẤẦẨẪẬẮẰẲẴẶẸẺẼẾỀỂỄỆỈỊỌỎỐỒỔỖỘỚỜỞỠỢỤỦỨỪỬỮỰỲÝỴỶỸ\s\d]{4,}/i;
    if (consecutiveConsonants.test(trimmedPrompt.replace(/\d/g, ''))) return true;
    const onlySpecialChars = /^[^\w\s]+$/;
    if (onlySpecialChars.test(trimmedPrompt)) return true;
    return false;
}

function determineIntent(userInput) {
    const normalizedInput = userInput.toLowerCase().trim();
    const greetings = ["xin chào", "chào bạn", "hello", "hi", "chào", "alo", "helo", "hê lô", "hé nhô"];
    const findKeywords = ["tìm", "câu nói", "ngạn ngữ", "thơ", "cho tôi", "về chủ đề", "liên quan đến", "gợi ý"];

    if (greetings.some(greeting => normalizedInput.startsWith(greeting) || normalizedInput === greeting )) {
        return "greeting";
    }
    if (findKeywords.some(keyword => normalizedInput.includes(keyword)) || normalizedInput.length > 10) {
         return "find_wedding_saying";
    }
    return "out_of_scope";
}

async function recommendWeddingSaying(req, res) {
    const { prompt } = req.body;
    const defaultSuggestions = [
        "câu ngạn ngữ về hôn nhân",
        "câu nói về hôn nhân",
        "bài thơ về hôn nhân"
    ];

    if (!prompt) {
        return res.status(400).json({ type: 'error', message: 'Missing category prompt' });
    }

    if (isGibberish(prompt)) {
        return res.status(400).json({
            type: 'unrecognized_input',
            message: 'Xin lỗi, tôi chưa hiểu rõ yêu cầu của bạn. Bạn có thể thử lại hoặc tham khảo các chủ đề sau:',
            suggestions: defaultSuggestions,
        });
    }

    const intent = determineIntent(prompt);

    try {
        const googleSheetData = (intent === "find_wedding_saying") ? await getWeddingSayings() : [];
        const aiResult = await getFlexibleAIResponse(prompt, intent, googleSheetData);

        if (aiResult.error_occurred) {
            return res.json({
                type: 'ai_error_with_suggestions',
                message: aiResult.message,
                suggestions: aiResult.suggestions,
            });
        }
        
        if (aiResult.is_greeting) {
             return res.json({
                type: 'greeting_response',
                message: aiResult.response_text,
            });
        }

        if (aiResult.is_out_of_scope) {
             return res.json({
                type: 'out_of_scope_response',
                message: aiResult.response_text,
                suggestions: aiResult.suggestions,
            });
        }

        if (aiResult.is_not_found) {
             return res.json({
                type: 'not_found_response',
                message: aiResult.message,
            });
        }
        
        if (aiResult.structured_quotes && aiResult.structured_quotes.length > 0) {
            return res.json({
                type: 'ai_content_response',
                message: aiResult.response_text,
                structured_quotes: aiResult.structured_quotes,
            });
        } else if (aiResult.response_text && aiResult.response_text.trim() !== "") {
            return res.json({
                type: 'ai_text_response',
                message: aiResult.response_text,
               
            });
        }
        
        console.warn('AI result did not match expected content structures:', aiResult);
        return res.json({
            type: 'fallback_suggestions',
            message: 'Xin lỗi, tôi chưa thể xử lý yêu cầu này. Bạn có thể thử các chủ đề sau:',
            suggestions: defaultSuggestions
        });

    } catch (error) {
        console.error('Error in recommend-wedding-saying API:', error);
        res.status(500).json({
            type: 'api_controller_error',
            message: 'Xin lỗi, máy chủ gặp sự cố. Bạn có thể thử các gợi ý sau:',
            suggestions: defaultSuggestions
        });
    }
}

module.exports = {
    recommendWeddingSaying
};