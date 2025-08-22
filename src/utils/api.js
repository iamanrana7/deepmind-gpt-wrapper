// Multiple API keys stored here
const API_KEYS = [
  "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",
  "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",
];

let currentKeyIndex = 0;

// Function to get the current API key
function getCurrentKey() {
  return API_KEYS[currentKeyIndex];
}

// Rotate to next key if current fails
function rotateKey() {
  currentKeyIndex++;
  if (currentKeyIndex >= API_KEYS.length) {
    throw new Error("All API keys are exhausted. Please try again later.");
  }
}

// Main function to call GPT
export async function callGPT(messages) {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": Bearer ${getCurrentKey()}
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // or whichever you use
        messages: messages
      })
    });

    if (response.status === 429 || response.status === 401) {
      // 429 = quota exceeded, 401 = invalid key
      rotateKey();
      return callGPT(messages); // retry with next key
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Unknown API error");
    }

    const data = await response.json();
    return data.choices[0].message.content;

  } catch (err) {
    console.error("API Error:", err.message);
    return ⚠️ Error: ${err.message};
  }
}
