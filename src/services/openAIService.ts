import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: "YOUR_OPENAI_API_KEY",
  dangerouslyAllowBrowser: true,
});

export async function analyzeReceiptImage(base64Image: string) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this receipt image and extract all food items. For each item, provide the name and price. Also, determine if this is a valid receipt image." },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
          ],
        },
      ],
    });

    const result = response.choices[0].message.content;
    // Parse the result to extract items and check if it's a valid receipt
    // This is a simplified example, you might need to adjust based on the actual response format
    const items = []; // Extract items from the result
    const isReceipt = true; // Determine if it's a valid receipt based on the response

    return { isReceipt, items };
  } catch (error) {
    console.error("Error analyzing receipt image:", error);
    throw error;
  }
}

export async function batchAnalyzeGroceryItems(items, currentDate) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an AI assistant that analyzes grocery items and provides detailed information about them.",
        },
        {
          role: "user",
          content: `Analyze the following grocery items. For each item, provide: 
          1. Whether it's a food item
          2. If it goes in the fridge
          3. Its food category
          4. Ripeness indicators
          5. If it can be left out
          6. Expiration date if refrigerated (from ${currentDate})
          7. Expiration date if left at room temperature (from ${currentDate})
          
          Items: ${JSON.stringify(items)}`,
        },
      ],
    });

    const result = JSON.parse(response.choices[0].message.content);
    return result;
  } catch (error) {
    console.error("Error batch analyzing grocery items:", error);
    throw error;
  }
}